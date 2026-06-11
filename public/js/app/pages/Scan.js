'use strict';

define(['jquery', 'react', 'reactClassset', 'reactDOM', 'jsx!widgets/List', 'jsx!widgets/Modal', 'app/actions/scanned-model', 'helpers/api/3d-scan-control', 'helpers/api/3d-scan-modeling', 'jsx!views/scan/Setup-Panel', 'jsx!views/scan/Manipulation-Panel', 'jsx!views/Printer-Selector', 'jsx!views/scan/Export', 'jsx!views/scan/Progress-Bar', 'jsx!views/scan/Action-Buttons', 'jsx!widgets/File-Uploader', 'app/actions/alert-actions', 'app/stores/alert-store', 'app/actions/progress-actions', 'app/stores/progress-store', 'app/constants/progress-constants', 'helpers/shortcuts', 'helpers/round', 'helpers/dnd-handler', 'helpers/point-cloud', 'Rx', 'helpers/duration-formatter', 'helpers/firmware-version-checker', 'helpers/shortcuts',
// non-return
'helpers/array-findindex', 'helpers/object-assign', 'plugins/file-saver/file-saver.min'], function ($, React, ReactCx, ReactDOM, List, Modal, ScannedModel, ScanControl, ScanModeling, SetupPanel, ManipulationPanel, PrinterSelector, Export, ProgressBar, ActionButtons, FileUploader, AlertActions, AlertStore, ProgressActions, ProgressStore, ProgressConstants, shortcuts, round, dndHandler, PointCloudHelper, Rx, FormatDuration, FirmwareVersionChecker, Shortcuts) {
    'use strict';

    return function (args) {
        args = args || {};

        var meshUpdateStream = new Rx.Subject(),
            meshAddRemoveStream = new Rx.Subject(),
            subscriber,
            meshAddRemoveSubscriber;

        var View = React.createClass({
            displayName: 'View',

            MAX_MESHES: 5,

            getInitialState: function getInitialState() {
                return {
                    lang: args.state.lang,
                    gettingStarted: false, // selecting machine
                    scanTimes: 0, // how many scan executed
                    selectedPrinter: undefined, // which machine selected
                    deleting_mesh: undefined,
                    cameraImageSrc: undefined,
                    history: [],
                    openProgressBar: false,
                    openBlocker: false,
                    hasConvert: false, // point cloud into stl
                    hasMultiScan: false, // ready to multi scan
                    progressPercentage: 0,
                    progressRemainingTime: 0,
                    currentSteps: 0,
                    printerIsReady: false,
                    isScanStarted: false, // scan getting started
                    showCamera: true,
                    scanStartTime: undefined, // when the scan started
                    scanCtrlWebSocket: undefined,
                    scanModelingWebSocket: undefined,
                    meshes: [],
                    selectedMeshes: [],
                    cylinder: undefined,
                    saveFileType: 'pcd',
                    error: {
                        caption: '',
                        message: '',
                        onClose: function onClose() {}
                    },
                    stlBlob: undefined,
                    stlMesh: undefined,
                    objectDialogPosition: {
                        left: 0,
                        top: 0
                    },
                    selectedObject: {
                        position: {},
                        size: {},
                        rotate: {}
                    },
                    stage: undefined // three stages (scene, camera, renderer)
                };
            },

            componentDidMount: function componentDidMount() {
                var self = this,
                    lang = self.state.lang,
                    object,
                    pushToHistory = function pushToHistory(mesh, arrayIndex) {
                    mesh.type = 'update';
                    mesh.arrayIndex = arrayIndex;
                    self.setState({
                        history: self.state.history.concat([mesh])
                    });
                },
                    fireUndo = function fireUndo() {
                    if (0 < self.state.history.length) {
                        self._undo();
                    } else {
                        AlertActions.showPopupError('cant-undo', lang.scan.cant_undo);
                    }
                };

                subscriber = meshUpdateStream.subscribe(function (m) {
                    object = Object.assign({}, m);
                    object.oldBlob = self.state.scanModelingWebSocket.History.findByName(m.oldName)[0].data;
                    object.isUndo = false;
                    object.name = m.oldName;
                    pushToHistory(object, m.arrayIndex);
                });

                meshAddRemoveSubscriber = meshAddRemoveStream.subscribe(function (changedMeshes) {
                    changedMeshes.forEach(function (m) {
                        var o = Object.assign({}, m.mesh);
                        if (o.isUndo !== true) {
                            o.type = m.type;
                            self.setState({
                                history: self.state.history.concat([o])
                            });
                        } else {
                            m.mesh.isUndo = false;
                        }
                    });
                });

                shortcuts.on(['cmd', 'z'], fireUndo);

                AlertStore.onRetry(self._retry);
                AlertStore.onYes(self._onYes);
                AlertStore.onCancel(self._onCancel);
                dndHandler.plug(document, self._importPCD);

                self.setState({
                    stage: ScannedModel.init()
                });

                Shortcuts.on(['ctrl', 'e'], function () {
                    ScannedModel.getBlobFromScene();
                });

                Shortcuts.on(['ctrl', 'm'], function () {
                    alert('checked');
                });
            },

            componentWillUnmount: function componentWillUnmount() {
                var self = this,
                    stopGettingImage = function stopGettingImage() {
                    if ('undefined' !== typeof self.state.scanCtrlWebSocket) {
                        self.state.scanCtrlWebSocket.stopGettingImage().done(function () {
                            self.state.scanCtrlWebSocket.connection.close(false);
                        });
                    }
                };

                AlertStore.removeRetryListener(self._retry);
                AlertStore.removeYesListener(self._onYes);
                AlertStore.removeCancelListener(self._onCancel);
                dndHandler.unplug(document);

                if ('undefined' !== typeof self.state.scanModelingWebSocket) {
                    self.state.scanModelingWebSocket.connection.close(false);
                }

                stopGettingImage();

                ScannedModel.destroy();
                subscriber.dispose();
                meshAddRemoveSubscriber.dispose();
            },

            // ui events
            _undo: function _undo() {
                var self = this,
                    currentMesh,
                    actionMap = {
                    add: function add(mesh) {
                        var revertTimes = mesh.associted || 0;

                        currentMesh = self._getMesh(mesh.index);
                        currentMesh.isUndo = true;

                        // ask for delete
                        if (0 === revertTimes) {
                            self._onDeletingMesh(currentMesh, mesh.arrayIndex);
                        } else {
                            self._onDeleteMesh(mesh.arrayIndex, currentMesh);

                            // delete associted mesh
                            for (var i = 0; i < revertTimes; i++) {
                                currentMesh = self.state.history.pop();
                                actionMap.remove(currentMesh);
                            }
                        }
                    },
                    update: function update(mesh) {
                        var fileReader = new FileReader(),
                            meshes = self.state.meshes,
                            newMesh = {},
                            typedArray;

                        fileReader.onload = function () {

                            // remove current
                            currentMesh = self._getMesh(mesh.index);
                            currentMesh.isUndo = true;
                            currentMesh.transformMethods.hide();
                            self._onDeleteMesh(mesh.arrayIndex, currentMesh);

                            // add old
                            typedArray = new Float32Array(this.result);

                            // update point cloud
                            mesh.model = ScannedModel.updateMesh(mesh.model, typedArray);

                            newMesh = self._newMesh({
                                model: mesh.model,
                                name: mesh.name,
                                index: mesh.index
                            });

                            ScannedModel.add(mesh.model);
                            newMesh.isUndo = true;
                            meshes.splice(mesh.arrayIndex, 0, newMesh);
                            self.state.scanCtrlWebSocket.stopGettingImage();
                            self.setState({
                                showCamera: false,
                                meshes: meshes
                            }, function () {
                                meshAddRemoveStream.onNext([{ mesh: newMesh, type: 'add' }]);
                            });
                        };

                        fileReader.readAsArrayBuffer(mesh.oldBlob);
                    },
                    remove: function remove(mesh) {
                        // add
                        mesh.model.material.opacity = 0.3;
                        mesh.choose = false;
                        mesh.isUndo = true;
                        ScannedModel.add(mesh.model);
                        self.state.meshes.splice(mesh.arrayIndex, 0, mesh);
                        self.state.scanCtrlWebSocket.stopGettingImage();
                        self.setState({
                            showCamera: false,
                            meshes: self.state.meshes
                        }, function () {
                            meshAddRemoveStream.onNext([{ mesh: mesh, type: 'remove' }]);
                        });
                    }
                },
                    lastAction = self.state.history.pop() || {},
                    undoAction = actionMap[lastAction.type];

                if ('undefined' !== typeof undoAction && false === this.state.isScanStarted) {
                    undoAction(lastAction);
                }
            },

            _retry: function _retry(id) {
                var self = this;

                switch (id) {
                    case 'scan-retry':
                        self.state.scanCtrlWebSocket.retry();
                        break;
                    case 'calibrate':
                        self._onCalibrate();
                        break;
                }
            },

            _onYes: function _onYes(id) {
                var self = this;

                switch (id) {
                    case 'deleting-mesh':
                        self._onDeleteMesh(self.state.deleting_mesh.index, self.state.deleting_mesh.object);
                        break;
                    case 'scan-again':
                        self.setState(self.getInitialState());
                        ScannedModel.clear();
                        self.state.scanCtrlWebSocket.stopGettingImage().done(function () {
                            self.state.scanCtrlWebSocket.connection.close(false);
                        });
                        break;
                }
            },

            _onCancel: function _onCancel(id) {
                var self = this;

                switch (id) {
                    case 'scan-device-busy':
                        history.back();
                        break;
                    case 'deleting-mesh':
                        self._revertDeletingMeshToHistory();
                        break;
                    case 'calibrate':
                        self._refreshCamera();

                        self.setState({
                            isScanStarted: false
                        });

                        break;
                }
            },

            _onReadingPCD: function _onReadingPCD(file, isEnd, deferred) {
                if (true === isEnd) {
                    deferred.resolve();
                }
            },

            _importPCD: function _importPCD(e, files) {
                var self = this,
                    lang = self.state.lang,
                    fileReader,
                    fileName,
                    meshes = self.state.meshes,
                    allowedfiles = [],
                    uploadFiles,
                    convertedfiles = [],
                    file,
                    blob,
                    scanTimes,
                    typedArray,
                    fileReader,
                    model,
                    _doImport,
                    checkFiles = function checkFiles(files) {
                    var allowedfiles = [],
                        checker = /.*[.]pcd$/,
                        file;

                    files.forEach(function (file) {
                        file.isPCD = checker.test(file.name);

                        if (true === file.isPCD) {
                            allowedfiles.push(file);
                        }
                    });

                    return allowedfiles;
                },
                    cantUpload = function cantUpload(files) {
                    return files.some(function (file) {
                        return false === file.isPCD;
                    }) || 0 === files.length;
                },
                    uploadQuota;

                if ('undefined' === typeof files) {
                    uploadFiles = e.originalEvent.dataTransfer.files;
                } else {
                    uploadFiles = files;
                }

                for (var i = 0; i < uploadFiles.length; i++) {
                    convertedfiles.push(uploadFiles[i] || uploadFiles.item(i));
                }

                allowedfiles = checkFiles(convertedfiles);

                uploadQuota = self.MAX_MESHES - meshes.length - allowedfiles.length;

                if (true === this.state.gettingStarted && 0 > uploadQuota) {
                    AlertActions.showPopupError('over-quota', lang.scan.over_quota);
                    return;
                }

                if (true === this.state.gettingStarted && false === cantUpload(allowedfiles)) {
                    self._openBlocker(true, ProgressConstants.NONSTOP);

                    _doImport = function doImport() {
                        file = allowedfiles.pop();
                        fileName = new Date().getTime();
                        blob = file.blob || new Blob([file]);
                        scanTimes = self.state.scanTimes + 1;

                        self.state.scanModelingWebSocket.import(fileName, 'pcd', blob, blob.size).done(function (pointCloud) {
                            self.state.scanCtrlWebSocket.stopGettingImage();

                            fileReader = new FileReader();

                            fileReader.onload = function () {
                                typedArray = new Float32Array(this.result);
                                model = ScannedModel.appendModel(typedArray);

                                meshes.push(self._newMesh({
                                    name: fileName,
                                    model: model,
                                    index: scanTimes
                                }));

                                self.setState({
                                    scanTimes: scanTimes,
                                    showCamera: false
                                }, function () {
                                    if (0 < allowedfiles.length) {
                                        _doImport();
                                    } else {
                                        self._openBlocker(false);
                                    }
                                });
                            };

                            fileReader.readAsArrayBuffer(pointCloud.total);
                        });
                    };

                    _doImport();
                }
            },

            _refreshCamera: function _refreshCamera() {
                var self = this,
                    ctrlControl = self.state.scanCtrlWebSocket,
                    imageMethods = ctrlControl.getImage();

                imageMethods.progress(function (response) {
                    if ('ok' === response.status) {
                        imageMethods.getImage();

                        self.setState({
                            cameraImageSrc: response.url
                        });
                    }
                });

                self.setState({
                    printerIsReady: true,
                    showCamera: true
                });

                self._openBlocker(false);
            },

            _getMesh: function _getMesh(index) {
                var meshes = this.state.meshes,
                    findIndex = function findIndex(el) {
                    return el.index === index;
                },
                    existingIndex = meshes.findIndex(findIndex);

                return meshes[existingIndex];
            },

            _updateMeshInHistory: function _updateMeshInHistory(mesh) {
                var temp = this.state.history.map(function (h) {
                    if (h.name === mesh.oldName) {
                        h.oldName = mesh.oldName;
                        h.name = mesh.name;
                        h.associted = mesh.associted;
                    }
                    return h;
                });
            },

            _getScanSpeed: function _getScanSpeed() {
                return parseInt(this.refs.setupPanel.getSettings().resolution.value, 10);
            },

            _refreshObjectDialogPosition: function _refreshObjectDialogPosition(objectScreenPosition, matrix) {
                var self = this,
                    state = self.state;

                self.setState({
                    selectedObject: matrix,
                    objectDialogPosition: {
                        left: objectScreenPosition.x,
                        top: objectScreenPosition.y
                    }
                });
            },

            _newMesh: function _newMesh(args) {
                args = args || {};

                return {
                    model: args.model || undefined,
                    transformMethods: {
                        hide: function hide() {}
                    },
                    name: args.name || '',
                    index: args.index,
                    choose: false,
                    display: true,
                    associted: 0
                };
            },

            _onRendering: function _onRendering(views, currentSteps, mesh) {
                var self = this,
                    scan_speed = self._getScanSpeed(),
                    left_step = scan_speed - currentSteps,
                    progressRemainingTime,
                    progressPercentage,
                    meshes = self.state.meshes,
                    mesh = mesh || self._getMesh(self.state.scanTimes),
                    model,
                    transformMethods;

                console.log(left_step, FormatDuration(left_step));
                progressRemainingTime = FormatDuration(left_step);

                progressPercentage = Math.min(round(currentSteps / scan_speed * 100, -2), 100);

                self.setState({
                    currentSteps: currentSteps,
                    progressPercentage: progressPercentage,
                    progressRemainingTime: progressRemainingTime
                });

                if ('undefined' === typeof mesh) {
                    model = ScannedModel.appendModel(views);
                    var newMesh = self._newMesh({
                        name: 'scan-' + new Date().getTime(),
                        model: model,
                        index: self.state.scanTimes
                    });
                    newMesh.arrayIndex = meshes.length;
                    meshes.push(newMesh);

                    self.setState({
                        meshes: meshes,
                        progressPercentage: progressPercentage,
                        progressRemainingTime: progressRemainingTime
                    }, function () {
                        meshAddRemoveStream.onNext([{ mesh: newMesh, type: 'add' }]);
                    });
                } else {
                    mesh.model = ScannedModel.updateMesh(mesh.model, views);
                }
            },

            _onRollback: function _onRollback(e) {
                var self = this,
                    meshes = self.state.meshes;

                meshes.forEach(function (mesh) {
                    mesh.display = true;
                    mesh.choose = false;
                    mesh.model.material.opacity = 0.3;
                });

                ScannedModel.remove(self.state.stlMesh);

                self.setState({
                    meshes: meshes,
                    selectedMeshes: [],
                    hasConvert: false,
                    stlBlob: undefined,
                    saveFileType: 'pcd'
                });
            },

            _onConvert: function _onConvert(e) {
                var self = this,
                    fileFormat = 'stl',
                    isStopConvert = false,
                    collectName = '',
                    onClose = function onClose(stlMesh) {
                    self.state.meshes.forEach(function (mesh, e) {
                        mesh.model.material.opacity = 0;
                        mesh.transformMethods.hide();
                    });
                    self._openBlocker(false);
                    self.setState({
                        saveFileType: fileFormat,
                        hasConvert: true,
                        stlMesh: stlMesh,
                        meshes: self._switchMeshes(false, false)
                    });
                    self._switchMeshes(true, false);
                },
                    startExportSTL = function startExportSTL(outputName) {
                    self.state.scanModelingWebSocket.export_threading(outputName, fileFormat).done(function (response) {
                        endExportSTL(response.collect_name);
                    });
                },
                    endExportSTL = function endExportSTL(collectName) {
                    if (false === isStopConvert) {
                        self.state.scanModelingWebSocket.export_collect(collectName).always(function () {
                            self._openBlocker(false);
                        }).progress(function (response) {
                            switch (response.status) {
                                case 'binary':
                                    self.setState({
                                        stlBlob: response.data
                                    });

                                    ScannedModel.loadStl(response.data, onClose);
                                    break;
                                case 'computing':
                                    endExportSTL(collectName);
                                    break;
                            }
                        });
                    } else {
                        self._openBlocker(false);
                    }
                },
                    doStopConverting = function doStopConverting() {
                    isStopConvert = true;
                    self.setState({
                        saveFileType: 'pcd',
                        hasConvert: false
                    });
                    self._switchMeshes(true, false);
                };

                self._openBlocker(true, ProgressConstants.WAITING, '', true, '', {
                    onStop: doStopConverting
                });

                this._mergeAll(startExportSTL, false);
            },

            _switchMeshes: function _switchMeshes(display, choose) {
                var meshes = this.state.meshes;

                meshes.forEach(function (mesh) {
                    mesh.display = display;
                    mesh.choose = choose;
                });

                return meshes;
            },

            _mergeAll: function _mergeAll(callback, display) {
                display = 'boolean' === typeof display ? display : false;
                callback = callback || function () {};

                var self = this,
                    meshes = self._switchMeshes(display, true);

                self.setState({
                    meshes: meshes,
                    selectedMeshes: meshes
                }, function () {
                    // merge each mesh
                    self._doManualMerge(meshes, callback, false);

                    self.setState({
                        selectedMeshes: []
                    });
                });
            },

            _onSavePCD: function _onSavePCD() {
                var self = this,
                    selectedMeshes = self.state.selectedMeshes,
                    fileName = new Date().getTime() + '.pcd';

                self._doManualMerge(selectedMeshes, function (outputName) {
                    self.state.scanModelingWebSocket.export(outputName, 'pcd', {
                        onFinished: function onFinished(blob) {
                            saveAs(blob, fileName);
                            self._openBlocker(false);
                        }
                    });
                }, false);
                self._openBlocker(true, ProgressConstants.NONSTOP);
            },

            _onSaveASC: function _onSaveASC() {
                var self = this,
                    selectedMeshes = self.state.selectedMeshes,
                    fileName = new Date().getTime() + '.asc';

                self._doManualMerge(selectedMeshes, function (outputName) {
                    self.state.scanModelingWebSocket.export(outputName, 'asc', {
                        onFinished: function onFinished(blob) {
                            saveAs(blob, fileName);
                            self._openBlocker(false);
                        }
                    });
                }, false);
                self._openBlocker(true, ProgressConstants.NONSTOP);
            },

            _onSave: function _onSave(e) {
                var self = this,
                    exportFile = function exportFile(outputName) {
                    var fileFormat = self.state.saveFileType,
                        fileName = new Date().getTime() + '.' + fileFormat;

                    if (self.state.stlBlob instanceof Blob) {
                        saveAs(self.state.stlBlob, fileName);
                        self._openBlocker(false);
                    } else {
                        self.state.scanModelingWebSocket.export(outputName, fileFormat, {
                            onFinished: function onFinished(blob) {
                                saveAs(blob, fileName);
                                self._openBlocker(false);
                            }
                        });
                    }

                    self._switchMeshes(true, false);
                };

                self._openBlocker(true, ProgressConstants.NONSTOP);
                this._mergeAll(exportFile, false);
            },

            _onScanFinished: function _onScanFinished(point_cloud) {
                var self = this,
                    mesh = self._getMesh(self.state.scanTimes),
                    onUploadFinished = function onUploadFinished() {
                    // update scan times
                    self.setState({
                        openProgressBar: false,
                        isScanStarted: false,
                        hasMultiScan: false,
                        cameraImageSrc: undefined,
                        progressPercentage: 0,
                        progressRemainingTime: 0,
                        currentSteps: 0
                    }, function () {
                        self._openBlocker(false);
                    });
                };

                self.state.scanModelingWebSocket.upload(mesh.name, point_cloud, {
                    onStarting: function onStarting() {
                        self._openBlocker(true, ProgressConstants.NONSTOP);
                    },
                    onFinished: onUploadFinished
                });
            },

            _handleCheck: function _handleCheck() {
                return this.state.scanCtrlWebSocket.check();
            },

            _handleScan: function _handleScan(e) {
                var self = this,
                    pointCloud = new PointCloudHelper(),
                    onScan = function onScan() {
                    var scanResolution = self._getScanSpeed(),
                        scanAction = self.state.scanCtrlWebSocket.scan,
                        $scanDeferred = scanAction(scanResolution, self.state.currentSteps, pointCloud, self._onRendering);

                    $scanDeferred.done(function (response) {
                        self._onScanFinished(response.pointCloud);
                    }).fail(function (response) {
                        self.setState({
                            scanCtrlWebSocket: ScanControl(self.state.selectedPrinter.uuid, {
                                printer: self.state.selectedPrinter,
                                onError: function onError(error) {
                                    self.state.scanCtrlWebSocket.takeControl(function (response) {
                                        self._openBlocker(false);
                                    });
                                },
                                onReady: function onReady() {
                                    onScan();
                                }
                            })
                        });
                    });
                },
                    meshes = self.state.meshes,
                    stage;

                meshes.forEach(function (mesh) {
                    mesh.choose = false;
                    mesh.transformMethods.hide();
                });

                self.setState({
                    // progressRemainingTime: self.AVERAGE_STEP_TIME * self._getScanSpeed(),
                    scanStartTime: new Date().getTime(),
                    scanTimes: self.state.scanTimes + 1,
                    isScanStarted: true,
                    showCamera: false,
                    stage: stage,
                    currentSteps: 0,
                    progressPercentage: 0,
                    openProgressBar: true
                }, function () {
                    onScan();
                });
            },

            _onScanAgain: function _onScanAgain(e) {
                var self = this,
                    onYes = function onYes(id) {
                    self.state.scanCtrlWebSocket.stopGettingImage();
                    self.setState(self.getInitialState());
                    ScannedModel.clear();
                    AlertStore.removeYesListener(onYes);
                };

                AlertStore.onYes(onYes);
                AlertActions.showPopupYesNo('scan-again', self.state.lang.scan.scan_again_confirm);
            },

            _onScanStop: function _onScanStop(e) {
                console.log('scan stop');
                var self = this;

                self.setState({
                    currentSteps: 0,
                    openProgressBar: false,
                    hasMultiScan: false,
                    isScanStarted: false,
                    showCamera: false,
                    progressPercentage: 100 // total complete,
                });

                if ('undefined' !== typeof self.state.scanCtrlWebSocket) {
                    self.state.scanCtrlWebSocket.stopScan();
                }

                // on scanning or had point cloud
                if (true === self.state.isScanStarted && 0 === self.state.meshes.length) {
                    self.setState(self.getInitialState());
                    ScannedModel.clear();

                    if ('undefined' !== typeof self.state.scanCtrlWebSocket) {
                        self.state.scanCtrlWebSocket.connection.close(false);
                    }
                }
            },

            _doClearNoise: function _doClearNoise(mesh) {
                var self = this,
                    delete_noise_name = 'clear-noise-' + new Date().getTime(),
                    onStarting = function onStarting(data) {
                    self._openBlocker(true, ProgressConstants.NONSTOP);
                },
                    onDumpFinished = function onDumpFinished(data) {
                    mesh.oldName = mesh.name;
                    mesh.name = delete_noise_name;
                    meshUpdateStream.onNext(mesh);
                    self._openBlocker(false);
                },
                    onDumpReceiving = function onDumpReceiving(data, len) {
                    self._onRendering(data, len, mesh);
                };

                self.state.scanModelingWebSocket.deleteNoise(mesh.name, delete_noise_name, 0.3, {
                    onStarting: onStarting,
                    onFinished: onDumpFinished,
                    onReceiving: onDumpReceiving
                });
            },

            _doCropOn: function _doCropOn(mesh) {
                mesh.transformMethods.hide();
                this.setState({
                    cylinder: ScannedModel.cylinder.create(mesh.model)
                });
            },

            _doCropOff: function _doCropOff(mesh) {
                var self = this,
                    cut_name = 'cut-' + new Date().getTime(),
                    cylider_box = new THREE.Box3().setFromObject(self.state.cylinder),
                    opts = {
                    onStarting: function onStarting() {
                        self._openBlocker(true, ProgressConstants.NONSTOP);
                    },
                    onReceiving: self._onRendering,
                    onFinished: function onFinished(data) {
                        mesh.transformMethods.show();
                        self._openBlocker(false);
                    }
                },
                    args = [
                // min z
                { mode: 'z', direction: 'True', value: cylider_box.min.z },
                // max z
                { mode: 'z', direction: 'False', value: cylider_box.max.z },
                // radius
                { mode: 'r', direction: 'False', value: Math.min(cylider_box.max.y, cylider_box.max.x) }];

                if (window.confirm('Do crop?')) {

                    self.state.scanModelingWebSocket.cut(mesh.name, cut_name, args, opts);
                    mesh.oldName = mesh.name;
                    mesh.name = cut_name;
                    meshUpdateStream.onNext(mesh);
                }

                self._removeCylinder(mesh);
            },

            _removeCylinder: function _removeCylinder(mesh) {
                ScannedModel.cylinder.remove(mesh.model);
                this.setState({
                    cylinder: undefined
                });
            },

            _doApplyTransform: function _doApplyTransform(nextAction) {
                nextAction = nextAction || function () {};

                var self = this,
                    selectedMeshes = self.state.selectedMeshes,
                    endIndex = selectedMeshes.length - 1,
                    currentIndex = 0,
                    isEnd = function isEnd() {
                    return endIndex <= currentIndex;
                },
                    doingApplyTransform = function doingApplyTransform() {
                    currentMesh = selectedMeshes[currentIndex];

                    matrixValue = ScannedModel.matrix(currentMesh.model);
                    params = {
                        pX: matrixValue.position.center.x,
                        pY: matrixValue.position.center.y,
                        pZ: matrixValue.position.center.z,
                        rX: matrixValue.rotation.x,
                        rY: matrixValue.rotation.y,
                        rZ: matrixValue.rotation.z
                    };

                    // baseName, outName, params, onFinished
                    self.state.scanModelingWebSocket.applyTransform(currentMesh.name, currentMesh.name, params, onFinished);
                },
                    onFinished = function onFinished() {
                    if (false === isEnd()) {
                        currentIndex++;
                        doingApplyTransform();
                    } else {
                        nextAction();
                    }
                },
                    params,
                    currentMesh,
                    matrixValue;

                doingApplyTransform();
            },

            _doManualMerge: function _doManualMerge(selectedMeshes, callback, isNewMesh) {
                isNewMesh = 'boolean' === typeof isNewMesh ? isNewMesh : true;

                var self = this,
                    meshes = this.state.meshes,
                    selectedMeshes = true === selectedMeshes instanceof Array ? selectedMeshes : this.state.selectedMeshes,
                    lengthSelectedMeshes = selectedMeshes.length,
                    outputName = '';

                self._doApplyTransform(function (response) {
                    var onMergeFinished = function onMergeFinished(data) {
                        if (false === isEnd()) {
                            currentIndex++;
                            doingMerge();
                        } else {
                            afterMerge(outputName);
                        }
                    },
                        afterMerge = callback || function (outputName) {
                        var mesh,
                            updatedMeshes = [],
                            deferred = $.Deferred(),
                            onUpdate = function onUpdate(response) {
                            mesh = self._getMesh(self.state.scanTimes);
                            mesh.oldName = mesh.name;
                            mesh.name = outputName;
                            mesh.associted = lengthSelectedMeshes;
                            self._updateMeshInHistory(mesh);
                        };

                        deferred.done(onUpdate);

                        self.state.scanModelingWebSocket.dump(outputName, {
                            onReceiving: function onReceiving(typedArray, blobs_len) {
                                self._onRendering(typedArray, blobs_len);
                                deferred.resolve();
                            },
                            onFinished: function onFinished(response) {
                                self.state.selectedMeshes.forEach(function (selectedMesh, i) {
                                    ScannedModel.remove(selectedMesh.model);
                                });

                                for (var i = self.state.meshes.length - 1; i >= 0; i--) {
                                    if (true === self.state.meshes[i].choose) {
                                        meshAddRemoveStream.onNext([{ mesh: self.state.meshes[i], type: 'remove' }]);
                                        self.state.meshes.splice(i, 1);
                                    }
                                }

                                self.setState({
                                    meshes: self.state.meshes,
                                    selectedMeshes: []
                                });

                                self._openBlocker(false);
                            }
                        });
                    },
                        onMergeStarting = function onMergeStarting() {
                        self._openBlocker(true, ProgressConstants.NONSTOP);
                    },
                        isEnd = function isEnd() {
                        return endIndex === currentIndex;
                    },
                        currentIndex = 0,
                        endIndex = selectedMeshes.length - 2,
                        doingMerge = function doingMerge() {
                        baseMesh = selectedMeshes[currentIndex];
                        targetMesh = selectedMeshes[currentIndex + 1];
                        baseName = baseMesh.name;

                        if ('' === outputName) {
                            outputName = 'merge-' + new Date().getTime();
                        } else {
                            baseName = outputName;
                        }

                        if ('undefined' !== typeof targetMesh) {
                            self.state.scanModelingWebSocket.merge(baseName, targetMesh.name, outputName, {
                                onStarting: onMergeStarting,
                                onReceiving: self._onRendering,
                                onFinished: onMergeFinished
                            });
                        } else {
                            afterMerge(baseMesh.name);
                        }
                    },
                        baseName,
                        baseMesh,
                        targetMesh;

                    if (1 < self.state.scanTimes && 1 < meshes.length) {
                        self.setState({
                            // take merge as scan
                            scanTimes: true === isNewMesh ? self.state.scanTimes + 1 : self.state.scanTimes
                        }, function () {
                            doingMerge();
                        });
                    } else {
                        afterMerge(selectedMeshes[currentIndex].name);
                    }
                });
            },

            _switchTransformMode: function _switchTransformMode(mode, e) {
                var self = this,
                    methods = self.state.selectedMeshes[0].transformMethods;

                switch (mode) {
                    case 'scale':
                        methods.show().scale();
                        break;
                    case 'rotate':
                        methods.show().rotate();
                        break;
                    case 'translate':
                        methods.show().translate();
                        break;
                }
            },

            _openBlocker: function _openBlocker(is_open, type, message, hasStop, caption, events) {
                events = events || {};
                this.setState({
                    openBlocker: is_open
                });

                if (true === is_open) {
                    ProgressActions.open(type, caption ? caption : '', message, hasStop, events.onFinished || function () {}, events.onOpened || function () {}, events.onStop || function () {});
                } else {
                    ProgressActions.close();
                }
            },

            _onScanCancel: function _onScanCancel(e) {
                var self = this,
                    mesh = self._getMesh(self.state.scanTimes);

                self.state.scanCtrlWebSocket.stopScan();
                // TODO: restore to the status before scan

                self.setState({
                    currentSteps: 0,
                    openProgressBar: false,
                    isScanStarted: false
                });
            },

            _onMultiScan: function _onMultiScan(isMultiScan) {
                var self = this;

                self.setState({
                    hasMultiScan: isMultiScan,
                    showCamera: isMultiScan
                });

                if (true === isMultiScan) {
                    self._refreshCamera();

                    self.state.selectedMeshes.forEach(function (mesh) {
                        self._removeCylinder(mesh);
                    });
                } else {
                    self.state.scanCtrlWebSocket.stopGettingImage();
                }
            },

            _onCalibrateFail: function _onCalibrateFail(message, Popup) {
                var self = this,
                    imageSrc,
                    failMessage = self.state.lang.scan.messages[message] || {
                    caption: '',
                    message: message
                };

                switch (message) {
                    case 'not open':
                        imageSrc = 'img/not-open.png';
                        break;
                    case 'no object':
                        imageSrc = 'img/no-object.png';
                        break;
                    case 'no laser':
                        imageSrc = 'img/no-laser.png';
                    default:
                        break;
                }

                self._openBlocker(false);
                Popup('calibrate', React.createElement(
                    'div',
                    null,
                    React.createElement('img', { className: 'calibrate-image', src: imageSrc }),
                    React.createElement(
                        'p',
                        null,
                        failMessage.message
                    )
                ), failMessage.caption);
            },

            _onCalibrate: function _onCalibrate() {
                var self = this,
                    onPass = function onPass() {
                    var scanCtrlWebSocket = self.state.scanCtrlWebSocket,
                        calibrateDeferred = scanCtrlWebSocket.calibrate(),
                        done = function done(data) {
                        self._refreshCamera();
                        self._openBlocker(false);
                        AlertActions.showPopupInfo('calibrat-done', self.state.lang.scan.calibration_done.message, self.state.lang.scan.calibration_done.caption);
                    },
                        fail = function fail(data) {
                        self._refreshCamera();
                        self._openBlocker(false);
                        self._onCalibrateFail(data.message, AlertActions.showPopupRetry);
                    };

                    calibrateDeferred.done(done).fail(fail);
                };

                var next = function next() {
                    self._handleCheck().done(function (data) {
                        switch (data.message) {
                            case 'good':
                                onPass();
                                break;
                            case 'no object':
                            case 'not open':
                            case 'no laser':
                            default:
                                self._refreshCamera();
                                self._onCalibrateFail(data.message, AlertActions.showPopupRetry);
                        }
                    });

                    self._openBlocker(true, ProgressConstants.WAITING, '', false, self.state.lang.scan.calibration_is_running);
                };

                FirmwareVersionChecker.check(self.state.selectedPrinter, 'SCAN_CALIBRATION').then(function (allowCalibration) {
                    if (allowCalibration) {
                        next();
                    } else {
                        AlertActions.showPopupError('SCAN_REQUIREMENT', self.state.lang.scan.calibration_firmware_requirement);
                    }
                });
            },

            _onDeletingMesh: function _onDeletingMesh(mesh, arrayIndex) {
                var self = this,
                    lang = self.state.lang;

                self.setState({
                    deleting_mesh: {
                        object: mesh,
                        index: arrayIndex
                    }
                }, function () {
                    AlertActions.showPopupYesNo('deleting-mesh', lang.scan.delete_mesh, lang.scan.caution);
                });
            },

            _revertDeletingMeshToHistory: function _revertDeletingMeshToHistory() {
                var self = this,
                    mesh = self.state.deleting_mesh.object,
                    newMesh = self._newMesh(mesh);

                newMesh.type = mesh.type;
                self.state.history.push(newMesh);
                self.setState({
                    history: self.state.history
                });
            },

            _onDeleteMesh: function _onDeleteMesh(index, mesh) {
                var self = this,
                    meshes = self.state.meshes;

                ScannedModel.remove(mesh.model);
                meshes.splice(index, 1);

                self.setState({
                    meshes: meshes,
                    selectedMeshes: 0 === meshes.length ? [] : self.state.selectedMeshes
                });

                if (0 === meshes.length) {
                    self._refreshCamera();
                }
            },

            _connectToScanControl: function _connectToScanControl(printer) {
                var self = this,
                    ctrlOpts = {
                    printer: printer,
                    onError: function onError(data) {
                        data.info = data.info || '';

                        if (-1 < data.info.toUpperCase().indexOf('ZOMBIE')) {
                            self.state.scanCtrlWebSocket.takeControl(function (response) {
                                self._openBlocker(false);
                            });
                        } else if ('DEVICE_BUSY' === data.error) {
                            self._openBlocker(false);
                            AlertActions.showDeviceBusyPopup('scan-device-busy');
                        } else {
                            self._openBlocker(false);
                            AlertActions.showPopupRetry('scan-retry', data.error);
                        }
                    },
                    onReady: function onReady() {
                        self._refreshCamera();
                    },
                    availableUsbChannel: printer.source === 'h2h' ? printer.addr : -1
                };

                self.setState({
                    scanCtrlWebSocket: ScanControl(printer.uuid, ctrlOpts)
                });
            },

            // render sections
            _renderSettingPanel: function _renderSettingPanel() {
                var self = this,
                    start_scan_text,
                    lang = args.state.lang,
                    className = {
                    'hide': 0 < self.state.scanTimes && false === self.state.showCamera
                };

                return React.createElement(SetupPanel, { className: className, ref: 'setupPanel', lang: lang, onCalibrate: this._onCalibrate });
            },

            _renderManipulationPanel: function _renderManipulationPanel(lang) {
                var state = this.state,
                    refreshMatrix = function refreshMatrix(mesh, matrix) {
                    mesh.model.position.set(matrix.position.x, matrix.position.y, matrix.position.z);
                    mesh.model.rotation.set(matrix.rotation.x, matrix.rotation.y, matrix.rotation.z);

                    ScannedModel.render();
                };

                return 0 < state.selectedMeshes.length && false === state.isScanStarted && false === state.openBlocker && false === state.showCamera ? React.createElement(ManipulationPanel, {
                    lang: lang,
                    selectedMeshes: state.selectedMeshes,
                    switchTransformMode: this._switchTransformMode,
                    onCropOn: this._doCropOn,
                    onCropOff: this._doCropOff,
                    onClearNoise: this._doClearNoise,
                    onSavePCD: this._onSavePCD,
                    onSaveASC: this._onSaveASC,
                    onManualMerge: this._doManualMerge,
                    object: state.selectedObject,
                    position: state.objectDialogPosition,
                    onChange: refreshMatrix
                }) : '';
            },

            _renderStageSection: function _renderStageSection(lang) {
                var self = this,
                    state = self.state,
                    camera_image_class,
                    settingPanel = self._renderSettingPanel(lang),
                    manipulationPanel = self._renderManipulationPanel(lang),
                    meshThumbnails = this._renderMeshThumbnail(lang),
                    closeSubPopup = function closeSubPopup(e) {
                    self.refs.setupPanel.openSubPopup(e);
                },
                    cameraImage = self.state.cameraImageSrc || 'img/menu/main_logo.svg';

                camera_image_class = ReactCx.cx({
                    'camera-image': true === this.state.showCamera,
                    'hide': false === this.state.showCamera
                });

                return React.createElement(
                    'section',
                    { ref: 'operatingSection', className: 'operating-section' },
                    meshThumbnails,
                    React.createElement(
                        'div',
                        { id: 'model-displayer', className: 'model-displayer' },
                        React.createElement('img', { src: cameraImage, className: camera_image_class, onClick: closeSubPopup })
                    ),
                    settingPanel,
                    manipulationPanel
                );
            },

            _renderActionButtons: function _renderActionButtons(lang) {
                var className = {
                    'hide': this.state.isScanStarted,
                    'action-buttons': true,
                    'beehive-buttons': true
                },
                    mode = 0 < this.state.meshes.length ? 'SCANNED' : 'NOT_SCAN';

                if (true === this.state.hasConvert) {
                    mode = 'CONVERTED';
                }

                if (true === this.state.hasMultiScan) {
                    mode = 'MULTI_SCAN';
                }

                return true === this.state.gettingStarted && true === this.state.printerIsReady ? React.createElement(ActionButtons, {
                    mode: mode,
                    className: className,
                    lang: lang,
                    disabledScan: this.state.meshes.length === this.MAX_MESHES,
                    hasConvert: this.state.hasConvert,
                    onScanClick: this._handleScan,
                    onRollbackClick: this._onRollback,
                    onConvertClick: this._onConvert,
                    onSaveClick: this._onSave,
                    onScanAgainClick: this._onScanAgain,
                    onMultiScanClick: this._onMultiScan.bind(null, true),
                    onCancelMultiScanClick: this._onMultiScan.bind(null, false)
                }) : '';
            },

            _renderProgressBar: function _renderProgressBar(lang) {
                return true === this.state.openProgressBar ? React.createElement(ProgressBar, {
                    lang: lang,
                    percentage: this.state.progressPercentage,
                    remainingTime: this.state.progressRemainingTime,
                    currentSteps: this.state.currentSteps,
                    onStop: this._onScanStop
                }) : '';
            },

            _renderPrinterSelectorWindow: function _renderPrinterSelectorWindow(lang) {
                var self = this,
                    onGettingPrinter = function onGettingPrinter(printer) {
                    self._connectToScanControl(printer);
                    self.setState({
                        gettingStarted: true,
                        selectedPrinter: printer,
                        scanModelingWebSocket: ScanModeling({
                            printer: printer,
                            onError: function onError(data) {
                                self._openBlocker(false);
                                AlertActions.showPopupError('scan-modeling-error', data.error);
                            },
                            onFatal: function onFatal(data) {
                                self._openBlocker(false);
                                AlertActions.showPopupError('scan-fatal-error', data.error);
                            }
                        })
                    });

                    self._openBlocker(true, ProgressConstants.NONSTOP);
                },
                    noDeviceAvailable = function noDeviceAvailable() {
                    history.go(-1);
                },
                    content = React.createElement(PrinterSelector, {
                    uniqleId: 'scan',
                    modelFilter: PrinterSelector.DELTA_FILTER,
                    className: 'scan-printer-selection',
                    lang: lang,
                    onClose: noDeviceAvailable,
                    onGettingPrinter: onGettingPrinter
                }),
                    className = {
                    'modal-printer-selecter': true
                };

                return false === self.state.gettingStarted ? React.createElement(Modal, { content: content, className: className, disabledEscapeOnBackground: true }) : '';
            },

            _renderMeshThumbnail: function _renderMeshThumbnail(lang) {
                var self = this,
                    thumbnails = [],
                    meshes = self.state.meshes,
                    itemClass = {};

                thumbnails = meshes.map(function (mesh, i) {
                    var onChooseMesh = function onChooseMesh(e) {
                        e.preventDefault();

                        var me = e.currentTarget,
                            mesh = self._getMesh(parseInt(me.dataset.index, 10)),
                            position = ScannedModel.toScreenPosition(mesh.model),
                            transformMethods = ScannedModel.attachControl(mesh.model, self._refreshObjectDialogPosition),
                            selectedMeshes;

                        mesh.transformMethods = transformMethods;

                        meshes.forEach(function (mesh, key) {
                            self._removeCylinder(mesh);

                            if (false === e.shiftKey) {
                                if (key !== i) {
                                    mesh.transformMethods.hide();
                                    mesh.choose = false;
                                    mesh.model.material.opacity = 0.3;
                                }
                            } else {
                                mesh.transformMethods.hide();
                            }
                        });

                        // store selected mesh
                        mesh.choose = !mesh.choose;

                        mesh.model.material.opacity = true === mesh.choose ? 1 : 0.3;

                        selectedMeshes = meshes.filter(function (mesh) {
                            return true === mesh.choose;
                        });

                        self.setState({
                            selectedMeshes: selectedMeshes,
                            selectedObject: ScannedModel.matrix(mesh.model),
                            objectDialogPosition: {
                                left: position.x,
                                top: position.y
                            }
                        }, function () {
                            ScannedModel.cylinder.remove();

                            if (1 === selectedMeshes.length && true === mesh.choose) {
                                mesh.transformMethods.show();
                            } else {
                                mesh.transformMethods.hide();
                            }

                            ScannedModel.render();
                        });
                    };

                    itemClass = {
                        'mesh-thumbnail-item': true,
                        'choose': mesh.choose,
                        'hide': !mesh.display || true === self.state.isScanStarted || true === self.state.showCamera
                    };

                    return {
                        label: React.createElement(
                            'div',
                            { className: ReactCx.cx(itemClass) },
                            React.createElement(
                                'div',
                                { className: 'mesh-thumbnail-no', 'data-index': mesh.index, onClick: onChooseMesh },
                                mesh.index
                            ),
                            React.createElement('div', { className: 'mesh-thumbnail-close fa fa-times', onClick: self._onDeletingMesh.bind(self, mesh, i) })
                        )
                    };
                });

                return 0 < meshes.length && false === self.state.hasConvert ? React.createElement(List, { className: 'mesh-thumbnail', items: thumbnails }) : '';
            },

            render: function render() {
                var state = this.state,
                    lang = state.lang,
                    progressBar = this._renderProgressBar(lang),
                    actionButtons = this._renderActionButtons(lang),
                    scanStage = this._renderStageSection(lang),
                    selectPrinter = this._renderPrinterSelectorWindow(lang);

                return React.createElement(
                    'div',
                    { className: 'studio-container scan-studio' },
                    React.createElement(FileUploader, {
                        ref: 'fileUploader',
                        className: { hide: true },
                        onReadingFile: this._onReadingPCD,
                        onReadEnd: this._importPCD
                    }),
                    selectPrinter,
                    scanStage,
                    actionButtons,
                    progressBar,
                    alert
                );
            }

        });

        return View;
    };
});