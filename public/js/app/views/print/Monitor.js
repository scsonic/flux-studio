'use strict';

define(['jquery', 'react', 'reactPropTypes', 'plugins/classnames/index', 'helpers/device-master', 'app/actions/alert-actions', 'app/stores/alert-store', 'app/constants/device-constants', 'app/actions/global-actions', 'app/constants/global-constants', 'helpers/sprintf', 'helpers/shortcuts', 'Redux', 'app/reducer/index', 'jsx!app/views/print/Monitor-Header', 'jsx!app/views/print/Monitor-Display', 'jsx!app/views/print/Monitor-Control', 'jsx!app/views/print/Monitor-Info', 'app/action-creators/monitor', 'app/action-creators/device', 'helpers/device-error-handler'], function ($, React, PropTypes, ClassNames, DeviceMaster, AlertActions, AlertStore, DeviceConstants, GlobalActions, GlobalConstants, sprintf, shortcuts, Redux, MainReducer, MonitorHeader, MonitorDisplay, MonitorControl, MonitorInfo, MonitorActionCreator, DeviceActionCreator, DeviceErrorHandler) {
    'use strict';

    var _id = 'MONITOR',
        start = void 0,
        scrollSize = 1,
        _history = [],
        usbExist = false,
        showingPopup = false,
        messageViewed = false,
        operationStatus = void 0,
        previewUrl = '',
        lang = void 0,
        lastAction = void 0,
        fileToBeUpload = {},
        openedFrom = void 0,
        currentDirectoryContent = void 0,
        socketStatus = {},
        statusId = 0,
        refreshTime = 3000;

    var mode = {
        PRINT: 'PRINT',
        PREVIEW: 'PREVIEW',
        FILE: 'FILE',
        CAMERA: 'CAMERA'
    };

    var type = {
        FILE: 'FILE',
        FOLDER: 'FOLDER'
    };

    var source = {
        DEVICE_LIST: 'DEVICE_LIST',
        GO: 'GO'
    };

    var store = void 0,
        leftButtonOn = true,
        middleButtonOn = true,
        rightButtonOn = true;

    operationStatus = [DeviceConstants.RUNNING, DeviceConstants.PAUSED, DeviceConstants.RESUMING, DeviceConstants.ABORTED];

    return React.createClass({

        propTypes: {
            lang: PropTypes.object,
            selectedDevice: PropTypes.object,
            fCode: PropTypes.object,
            slicingStatus: PropTypes.object,
            previewUrl: PropTypes.string,
            opener: PropTypes.string,
            onClose: PropTypes.func
        },

        componentWillMount: function componentWillMount() {
            lang = this.props.lang;
            previewUrl = this.props.previewUrl;
            statusId = DeviceConstants.status.IDLE;

            socketStatus.ready = true;
            socketStatus.cancel = false;

            var _mode = mode.PREVIEW;
            openedFrom = this.props.opener || GlobalConstants.DEVICE_LIST;
            if (openedFrom === GlobalConstants.DEVICE_LIST) {
                var st_id = this.props.selectedDevice.st_id;

                if (st_id === DeviceConstants.status.IDLE) {
                    _mode = mode.FILE;
                } else {
                    _mode = mode.PRINT;
                }
            }

            store = Redux.createStore(MainReducer);
            store.dispatch(MonitorActionCreator.changeMode(_mode));

            this._preFetchInfo();
        },

        componentDidMount: function componentDidMount() {
            AlertStore.onRetry(this._handleRetry);
            AlertStore.onCancel(this._handleCancel);
            AlertStore.onYes(this._handleYes);

            this._registerDeleteKey();
            this._startReport();
        },

        shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
            return false;
        },

        componentWillUnmount: function componentWillUnmount() {
            AlertStore.removeRetryListener(this._handleRetry);
            AlertStore.removeCancelListener(this._handleCancel);
            AlertStore.removeYesListener(this._handleYes);

            var _store$getState = store.getState(),
                Monitor = _store$getState.Monitor;

            if (Monitor.mode === GlobalConstants.CAMERA) {
                this._stopCamera();
            }
            _history = [];
            messageViewed = false;

            DeviceMaster.disconnectCamera();
            GlobalActions.monitorClosed();

            clearInterval(this.reporter);
            this.unsubscribeDeleteKey();
        },

        childContextTypes: {
            store: PropTypes.object,
            slicingResult: PropTypes.object,
            lang: PropTypes.object
        },

        getChildContext: function getChildContext() {
            return {
                store: store,
                slicingResult: this.props.slicingStatus,
                lang: this.props.lang
            };
        },

        _registerDeleteKey: function _registerDeleteKey() {
            var _this = this;

            this.unsubscribeDeleteKey = shortcuts.on(['DEL'], function (e) {
                e.preventDefault();
                if (store.getState().Monitor.selectedItem && _this.state.focused) {
                    AlertActions.showPopupYesNo('DELETE_FILE', lang.monitor.confirmFileDelete);
                }
            });
        },

        _preFetchInfo: function _preFetchInfo() {
            var _store$getState2 = store.getState(),
                Monitor = _store$getState2.Monitor;

            var go = function go(result) {
                if (!result.done) {
                    result.value.then(function () {
                        go(s.next());
                    }).fail(function (error) {
                        console.log('monitor', error);
                        if (error.status === 'fatal') {
                            DeviceMaster.reconnect();
                        }
                    });
                }
            };

            var starter = /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this._checkUSBFolderExistance();

                            case 2:
                                _context.next = 4;
                                return this._getInitialStatus();

                            case 4:
                                if (!(openedFrom === GlobalConstants.DEVICE_LIST)) {
                                    _context.next = 12;
                                    break;
                                }

                                if (!(Monitor.mode === mode.FILE)) {
                                    _context.next = 10;
                                    break;
                                }

                                _context.next = 8;
                                return this._dispatchFolderContent('');

                            case 8:
                                _context.next = 12;
                                break;

                            case 10:
                                _context.next = 12;
                                return this._getPreviewInfo();

                            case 12:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }).bind(this);

            var s = starter();
            go(s.next());
        },

        _getPreviewInfo: function _getPreviewInfo() {
            var d = $.Deferred();
            DeviceMaster.getPreviewInfo().then(function (info) {
                console.log('Device Master upload preview info', info);
                store.dispatch(DeviceActionCreator.updateJobInfo(info));
                d.resolve();
            });
            return d.promise();
        },

        _getInitialStatus: function _getInitialStatus() {
            var d = $.Deferred();
            DeviceMaster.getReport().then(function (result) {
                store.dispatch(DeviceActionCreator.updateDeviceStatus(result));
                d.resolve();
            });
            return d.promise();
        },

        _hasFCode: function _hasFCode() {
            return this.props.fCode instanceof Blob;
        },

        _stopCamera: function _stopCamera() {
            DeviceMaster.disconnectCamera();
        },

        _refreshDirectory: function _refreshDirectory() {
            this._retrieveFolderContent(store.getState().Monitor.currentPath);
        },

        _existFileInDirectory: function _existFileInDirectory(path, fileName) {
            var d = $.Deferred();
            fileName = fileName.replace('.gcode', '.fc');
            DeviceMaster.fileInfo(path, fileName).then(function () {
                d.resolve(true);
            }).fail(function () {
                d.resolve(false);
            });
            return d.promise();
        },

        _doFileUpload: function _doFileUpload(file) {
            var _this2 = this;

            var reader = new FileReader();

            store.dispatch(MonitorActionCreator.setUploadProgress(0));
            reader.readAsArrayBuffer(file);
            reader.onload = function () {
                var fileInfo = file.name.split('.'),
                    ext = fileInfo[fileInfo.length - 1],
                    type = void 0,
                    isValid = false;

                if (ext === 'fc') {
                    type = { type: 'application/fcode' };
                    isValid = true;
                } else if (ext === 'gcode') {
                    type = { type: 'text/gcode' };
                    isValid = true;
                }

                if (isValid) {
                    var _store$getState3 = store.getState(),
                        Monitor = _store$getState3.Monitor;

                    var blob = new Blob([reader.result], type);

                    DeviceMaster.uploadToDirectory(blob, Monitor.currentPath, file.name).then(function () {
                        store.dispatch(MonitorActionCreator.setUploadProgress(''));
                        _this2._refreshDirectory();
                    }).progress(function (progress) {
                        var p = parseInt(progress.step / progress.total * 100);
                        store.dispatch(MonitorActionCreator.setUploadProgress(p));
                    }).fail(function (error) {
                        // TODO: show upload error
                    });
                } else {
                    AlertActions.showPopupInfo('', lang.monitor.extensionNotSupported);
                }
            };
        },

        _clearSelectedItem: function _clearSelectedItem() {
            store.dispatch(MonitorActionCreator.selectItem({ name: '', type: '' }));
        },

        _handleClose: function _handleClose() {
            this.props.onClose();
        },

        _handleRetry: function _handleRetry(id) {
            var _this3 = this;

            if (id === _id) {
                var _store$getState4 = store.getState(),
                    Device = _store$getState4.Device;

                if (Device.status.st_id === DeviceConstants.status.ABORTED) {
                    DeviceMaster.quit().then(function () {
                        _this3._handleGo();
                    });
                } else if (this._isPaused()) {
                    DeviceMaster.resume();
                    messageViewed = false;
                    showingPopup = false;

                    var resumeStatus = { st_label: 'RESUMING', st_id: 6 };
                    store.dispatch(DeviceActionCreator.updateDeviceStatus(resumeStatus));
                }
            }
        },

        _handleCancel: function _handleCancel() {
            messageViewed = true;
            showingPopup = false;
        },

        _handleYes: function _handleYes(id) {
            if (id === DeviceConstants.KICK) {
                DeviceMaster.kick();
            } else if (id === 'UPLOAD_FILE') {
                var info = fileToBeUpload.name.split('.'),
                    ext = info[info.length - 1];

                if (ext === 'gcode') {
                    setTimeout(function () {
                        AlertActions.showPopupYesNo('CONFIRM_G_TO_F', lang.monitor.confirmGToF);
                    }, 1000);
                } else {
                    this._doFileUpload(fileToBeUpload);
                }
            } else if (id === 'CONFIRM_G_TO_F') {
                this._doFileUpload(fileToBeUpload);
            } else if (id === 'DELETE_FILE') {
                var _store$getState5 = store.getState(),
                    Monitor = _store$getState5.Monitor;

                this._handleDeleteFile(Monitor.currentPath, Monitor.selectedItem.name);
            }
        },

        _handleBrowseFolder: function _handleBrowseFolder() {
            this._addHistory();
            this._dispatchFolderContent('');
            // avoid error occur, but don't know that will cause any bug, so mark it only.
            //this.unsubscribeEnterKey();
        },

        _handleFileCrossIconClick: function _handleFileCrossIconClick() {
            AlertActions.showPopupYesNo('DELETE_FILE', lang.monitor.confirmFileDelete);
        },

        _dispatchFolderContent: function _dispatchFolderContent(path) {
            var d = $.Deferred();
            this._stopCamera();

            this._retrieveFolderContent(path).then(function (content) {
                store.dispatch(MonitorActionCreator.changePath(path, content));
                return d.resolve();
            });
            return d.promise();
        },

        _handleFolderclick: function _handleFolderclick(event) {
            var _this4 = this;

            var folderName = event.currentTarget.dataset.foldername;
            this.unsubscribeEnterKey = shortcuts.on(['RETURN'], function (e) {
                // if a folder is selected
                if (folderName) {
                    _this4._handleFolderDoubleClick(folderName);
                    _this4.unsubscribeEnterKey();
                }
            });
            store.dispatch(MonitorActionCreator.selectItem({
                name: folderName,
                type: type.FOLDER
            }));
        },

        _handleFolderDoubleClick: function _handleFolderDoubleClick(event) {
            var folderName = event.currentTarget.dataset.foldername;
            this._addHistory();
            this._dispatchFolderContent(store.getState().Monitor.currentPath + '/' + folderName);
        },

        _handleDeleteFile: function _handleDeleteFile(pathToFile, fileName) {
            var _this5 = this;

            DeviceMaster.deleteFile(pathToFile, fileName).then(function () {
                _this5._refreshDirectory();
            });
        },

        _handleBack: function _handleBack() {
            var _this6 = this;

            if (typeof this.unsubscribeEnterKey === 'function') {
                this.unsubscribeEnterKey();
            }
            if (_history.length === 0) {
                return;
            }
            lastAction = _history.pop();

            var _store$getState6 = store.getState(),
                Monitor = _store$getState6.Monitor;

            if (Monitor.mode === mode.CAMERA) {
                this._stopCamera();
            }

            this._clearSelectedItem();

            var actions = {
                'PREVIEW': function PREVIEW() {},
                'FILE': function FILE() {
                    _this6._dispatchFolderContent(lastAction.path);
                },
                'CAMERA': function CAMERA() {},
                'PRINT': function PRINT() {
                    store.dispatch(MonitorActionCreator.changeMode(GlobalConstants.PRINT));
                }
            };

            if (actions[lastAction.mode]) {
                actions[lastAction.mode]();
                store.dispatch(MonitorActionCreator.changeMode(lastAction.mode));
            }
        },

        _handleFileClick: function _handleFileClick(event) {
            var filename = event.currentTarget.dataset.filename;

            store.dispatch(MonitorActionCreator.selectItem({
                name: filename,
                type: type.FILE
            }));
        },

        _handleFileDoubleClick: function _handleFileDoubleClick(event) {
            var _this7 = this;

            var filename = event.currentTarget.dataset.filename;

            event.stopPropagation();

            var handlePreviewFile = function handlePreviewFile() {
                _this7._addHistory();

                var _store$getState7 = store.getState(),
                    Monitor = _store$getState7.Monitor;

                start = 0;
                currentDirectoryContent.files.length = 0; // clear folder content

                DeviceMaster.fileInfo(Monitor.currentPath, filename).then(function (info) {
                    if (info[1] instanceof Blob) {
                        previewUrl = info[1].size === 0 ? 'img/ph_l.png' : URL.createObjectURL(info[1]);
                    } else {
                        previewUrl = 'img/ph_l.png';
                    }
                    if (info[2]) {
                        _this7._generatePreview([info[2]]);
                    }
                    store.dispatch(MonitorActionCreator.previewFile(info));
                    _this7.forceUpdate();
                });
            };

            this.unsubscribeEnterKey = shortcuts.on(['RETURN'], function (e) {
                e.preventDefault();
                if (filename) {
                    handlePreviewFile();
                    _this7.unsubscribeEnterKey();
                }
            });
            handlePreviewFile();
        },

        _handleUpload: function _handleUpload(e) {
            var _this8 = this;

            if (e.target.files.length > 0) {
                fileToBeUpload = e.target.files[0];
                this._existFileInDirectory(store.getState().Monitor.currentPath, fileToBeUpload.name.replace(/ /g, '_')).then(function (exist) {
                    if (exist) {
                        AlertActions.showPopupYesNo('UPLOAD_FILE', lang.monitor.fileExistContinue);
                    } else {
                        var info = fileToBeUpload.name.split('.'),
                            ext = info[info.length - 1];

                        if (ext === 'gcode') {
                            AlertActions.showPopupYesNo('CONFIRM_G_TO_F', lang.monitor.confirmGToF);
                        } else {
                            _this8._doFileUpload(fileToBeUpload);
                        }
                    }
                });
                e.target.value = null;
            }
        },

        _handleDownload: function _handleDownload() {
            var downloadProgressDisplay = function downloadProgressDisplay(p) {
                store.dispatch(MonitorActionCreator.setDownloadProgress(p));
            };

            var _store$getState8 = store.getState(),
                Monitor = _store$getState8.Monitor;

            DeviceMaster.downloadFile(Monitor.currentPath, Monitor.selectedItem.name).then(function (file) {
                store.dispatch(MonitorActionCreator.setDownloadProgress({ size: '', left: '' }));
                saveAs(file[1], Monitor.selectedItem.name);
            }).progress(function (p) {
                downloadProgressDisplay(p);
            }).fail(function (error) {
                // TODO: show download error
            });
        },

        _handleToggleCamera: function _handleToggleCamera() {
            var _store$getState9 = store.getState(),
                Monitor = _store$getState9.Monitor;

            if (Monitor.mode === mode.CAMERA) {
                this._handleBack();
            } else {
                this._addHistory();
                store.dispatch(MonitorActionCreator.changeMode(GlobalConstants.CAMERA));
            }
        },

        _handleGo: function _handleGo() {
            var _this9 = this;

            messageViewed = false;

            var _store$getState10 = store.getState(),
                Monitor = _store$getState10.Monitor,
                Device = _store$getState10.Device;

            var startingStatus = { st_label: 'INIT', st_id: 1 };

            store.dispatch(DeviceActionCreator.updateDeviceStatus(startingStatus));
            store.dispatch(MonitorActionCreator.changeMode(Monitor.mode === GlobalConstants.CAMERA ? GlobalConstants.CAMERA : GlobalConstants.PRINT));

            if (Device.status.st_label === DeviceConstants.IDLE) {
                var fCode = this.props.fCode;

                store.dispatch(MonitorActionCreator.changeMode(GlobalConstants.PRINT));

                if (fCode) {
                    this._stopReport();
                    DeviceMaster.go(fCode).then(function () {
                        _this9._startReport();
                        store.dispatch(MonitorActionCreator.setUploadProgress(''));
                    }).progress(function (progress) {
                        var p = parseInt(progress.step / progress.total * 100);
                        store.dispatch(MonitorActionCreator.setUploadProgress(p));
                    }).fail(function (error) {
                        // reset status
                        store.dispatch(MonitorActionCreator.setUploadProgress(''));
                        store.dispatch(MonitorActionCreator.changeMode(mode.PREVIEW));
                        _this9._startReport();

                        AlertActions.showPopupError('', lang.message.unable_to_start + error.error.join('_'));
                    });
                } else {
                    var executeGo = function executeGo() {
                        DeviceMaster.goFromFile(Monitor.currentPath, Monitor.selectedItem.name);
                    };

                    if (this._isAbortedOrCompleted()) {
                        DeviceMaster.quit().then(function () {
                            executeGo();
                        });
                    } else {
                        executeGo();
                    }
                }
            } else if (this._isAbortedOrCompleted() && Monitor.mode === GlobalConstants.FILE_PREVIEW) {
                // TODO: this to be changed when alert action is restructured
                if (confirm(lang.monitor.forceStop)) {
                    DeviceMaster.quit().then(function () {
                        DeviceMaster.goFromFile(Monitor.currentPath, Monitor.selectedItem.name);
                    });
                }
            } else {
                DeviceMaster.resume();
            }
        },

        _handlePause: function _handlePause() {
            DeviceMaster.pause();
        },

        _handleStop: function _handleStop() {
            var _this10 = this;

            if (statusId < 0) {
                AlertActions.showPopupYesNo('KICK', lang.monitor.forceStop);
            } else {
                var _store$getState11 = store.getState(),
                    Monitor = _store$getState11.Monitor,
                    Device = _store$getState11.Device;

                if (this._isAbortedOrCompleted()) {
                    DeviceMaster.quit();
                    store.dispatch(MonitorActionCreator.showWait());
                } else if (this._isPaused()) {
                    DeviceMaster.stop();
                } else {
                    var p = $.Deferred();
                    if (Device.status.st_id < 0) {
                        if (confirm(lang.monitor.forceStop)) {
                            p = DeviceMaster.kick();
                        } else {
                            p.resolve();
                        }
                    } else {
                        p = DeviceMaster.stop();
                    }
                    p.always(function () {
                        var mode = Monitor.selectedFileInfo.length > 0 ? GlobalConstants.FILE_PREVIEW : GlobalConstants.PREVIEW;
                        if (Device.status.st_id < 0) {
                            mode = GlobalConstants.FILE;
                            _this10._dispatchFolderContent('');
                        } else if (Monitor.mode === GlobalConstants.CAMERA) {
                            mode = GlobalConstants.CAMERA;
                        }
                        store.dispatch(MonitorActionCreator.changeMode(mode));
                    });
                }
            }
        },

        _addHistory: function _addHistory() {
            var _store$getState12 = store.getState(),
                Monitor = _store$getState12.Monitor,
                history = { mode: Monitor.mode, previewUrl: previewUrl, path: Monitor.currentPath };

            _history.push(history);
        },

        _startReport: function _startReport() {
            var _this11 = this;

            this.reporter = setInterval(function () {
                // if(window.stopReport === true) { return; }
                DeviceMaster.getReport().fail(function (error) {

                    //Maybe we should handle SUBSYSTEM_ERROR rather than doing this. 2018/1/12
                    //It was said that SUBSYSTEM_ERROR will not appear anymore 2018/1/13
                    //so the following 2 lines can be deleted
                    if (error.error && error.error[0] === "SUBSYSTEM_ERROR") {
                        _this11._processReport(error);
                    } else {
                        clearInterval(_this11.reporter);
                        _this11._processReport(error);
                    }
                }).then(function (result) {
                    store.dispatch(DeviceActionCreator.updateDeviceStatus(result));
                    _this11._processReport(result);
                });
            }, refreshTime);
        },

        _stopReport: function _stopReport() {
            clearInterval(this.reporter);
        },

        _generatePreview: function _generatePreview(info) {
            if (info === '') {
                return;
            }
            info = info || [];

            if (!this._hasFCode()) {
                var blobIndex = info.findIndex(function (o) {
                    return o instanceof Blob;
                });
                if (blobIndex > 0) {
                    previewUrl = window.URL.createObjectURL(info[blobIndex]);
                }
            }

            this.forceUpdate();
        },

        _processReport: function _processReport(report) {
            if (!report.error) {
                if (this._isAbortedOrCompleted() && openedFrom !== GlobalConstants.DEVICE_LIST) {
                    DeviceMaster.quit();
                }
                if (showingPopup) {
                    showingPopup = false;
                    AlertActions.closePopup();
                }
            } else {
                var error = report.error;
                var state = [DeviceConstants.status.PAUSED_FROM_STARTING, DeviceConstants.status.PAUSED_FROM_RUNNING, DeviceConstants.status.ABORTED, DeviceConstants.status.PAUSING_FROM_RUNNING, DeviceConstants.status.PAUSING_FROM_STARTING];

                // always process as error, hard fix for backend
                error = error instanceof Array ? error : [error];

                if (showingPopup) {
                    if (error.length === 0) {
                        showingPopup = false;
                        AlertActions.closePopup();
                    }
                }

                if (error[0] === 'TIMEOUT') {
                    if (this.reconnected) {
                        AlertActions.showPopupError('', lang.message.connectionTimeout);
                        this.props.onClose();
                    } else {
                        this.reconnected = true;
                        DeviceMaster.reconnect();
                    }

                    return;
                }

                // only display error during these state
                if (state.indexOf(report.st_id) >= 0) {
                    // jug down errors as main and sub error for later use

                    var errorMessage = DeviceErrorHandler.translate(error);
                    console.log("ERR ", errorMessage, error);

                    if (!messageViewed && !showingPopup && errorMessage.length > 0) {
                        AlertActions.showPopupRetry(_id, errorMessage);
                        showingPopup = true;
                    }
                }

                if (this._isAbortedOrCompleted()) {
                    DeviceMaster.quit();
                    store.dispatch(MonitorActionCreator.changeMode(mode.PREVIEW));
                }
            }
        },

        _isError: function _isError(s) {
            return operationStatus.indexOf(s) < 0;
        },

        _isAbortedOrCompleted: function _isAbortedOrCompleted() {
            var _store$getState13 = store.getState(),
                Device = _store$getState13.Device;

            return Device.status.st_id === DeviceConstants.status.ABORTED || Device.status.st_id === DeviceConstants.status.COMPLETED;
        },

        _isPaused: function _isPaused() {
            var _store$getState14 = store.getState(),
                Device = _store$getState14.Device;

            var s = [DeviceConstants.status.PAUSED, DeviceConstants.status.PAUSED_FROM_STARTING, DeviceConstants.status.PAUSING_FROM_STARTING, DeviceConstants.status.PAUSED_FROM_RUNNING, DeviceConstants.status.PAUSING_FROM_RUNNING];
            return s.indexOf(Device.status.st_id) > 0;
        },

        _retrieveFolderContent: function _retrieveFolderContent(path) {
            var _this12 = this;

            var d = $.Deferred();

            DeviceMaster.ls(path).then(function (result) {
                if (result.error) {
                    if (result.error !== DeviceConstants.NOT_EXIST) {
                        AlertActions.showPopupError(result.error);
                        result.directories = [];
                    }
                }
                currentDirectoryContent = result;
                start = 0;
                if (!usbExist && path === '') {
                    var i = currentDirectoryContent.directories.indexOf('USB');
                    if (i >= 0) {
                        currentDirectoryContent.directories.splice(i, 1);
                    }
                }
                currentDirectoryContent.files = currentDirectoryContent.files.map(function (file) {
                    var a = [];
                    a.push(file);
                    return a;
                });
                _this12._renderFolderFilesWithPreview();
                d.resolve(currentDirectoryContent);
            });

            return d.promise();
        },

        _renderFolderFilesWithPreview: function _renderFolderFilesWithPreview() {
            var _this13 = this;

            if (start > currentDirectoryContent.files.length || currentDirectoryContent.files.length === 0) {
                return;
            }

            var handleCallback = function handleCallback(filesArray) {
                if (start > currentDirectoryContent.files.length) {
                    return;
                }
                var files = currentDirectoryContent.files;

                Array.prototype.splice.apply(files, [start, filesArray.length].concat(filesArray));
                var content = store.getState().Monitor.currentFolderContent;
                content.files = files;
                store.dispatch(MonitorActionCreator.updateFoldercontent(content));
                start = start + scrollSize;
                if (end < currentDirectoryContent.files.length) {
                    _this13._renderFolderFilesWithPreview();
                }
            };

            var end = start + scrollSize;
            if (end > currentDirectoryContent.files.length) {
                end = currentDirectoryContent.files.length;
            }
            this._retrieveFileInfo(start, end, handleCallback);
        },

        _retrieveFileInfo: function _retrieveFileInfo(index, end, callback, filesArray) {
            var _this14 = this;

            filesArray = filesArray || [];
            if (index < end) {
                if (currentDirectoryContent.files.length === 0) {
                    return;
                }
                DeviceMaster.fileInfo(currentDirectoryContent.path, currentDirectoryContent.files[index][0]).then(function (r) {
                    r.error ? filesArray.push(currentDirectoryContent.files[index]) : filesArray.push(r);
                    if (socketStatus.cancel) {
                        callback(filesArray);
                    } else {
                        _this14._retrieveFileInfo(index + 1, end, callback, filesArray);
                    }
                }).fail(function (error) {
                    // TODO: display file info error
                });
            } else {
                callback(filesArray);
            }
        },

        _checkUSBFolderExistance: function _checkUSBFolderExistance() {
            var d = $.Deferred();
            DeviceMaster.ls('USB').then(function () {
                store.dispatch(DeviceActionCreator.updateUsbFolderExistance(true));
                d.resolve();
            }).fail(function () {
                store.dispatch(DeviceActionCreator.updateUsbFolderExistance(false));
                d.resolve();
            });

            return d.promise();
        },

        _findObjectContainsProperty: function _findObjectContainsProperty(infoArray, propertyName) {
            return infoArray.filter(function (o) {
                return Object.keys(o).some(function (o) {
                    return o === propertyName;
                });
            });
        },

        onBlur: function onBlur(e) {
            e.preventDefault();
            this.setState({ focused: false });
        },

        onFocus: function onFocus(e) {
            e.preventDefault();
            this.setState({ focused: true });
        },

        render: function render() {
            var subClass = ClassNames('sub', { 'hide': false });

            return React.createElement(
                'div',
                { className: 'flux-monitor', tabIndex: '1', onBlur: this.onBlur, onFocus: this.onFocus },
                React.createElement(
                    'div',
                    { className: 'main' },
                    React.createElement(MonitorHeader, {
                        name: DeviceMaster.getSelectedDevice().name,
                        source: openedFrom,
                        history: _history,
                        onBackClick: this._handleBack,
                        onFolderClick: this._handleBrowseFolder,
                        onCloseClick: this._handleClose }),
                    React.createElement(MonitorDisplay, {
                        selectedDevice: this.props.selectedDevice,
                        previewUrl: previewUrl,
                        onFolderClick: this._handleFolderclick,
                        onFolderDoubleClick: this._handleFolderDoubleClick,
                        onFileClick: this._handleFileClick,
                        onFileDoubleClick: this._handleFileDoubleClick,
                        onFileCrossIconClick: this._handleFileCrossIconClick }),
                    React.createElement(MonitorControl, {
                        source: openedFrom,
                        previewUrl: previewUrl,
                        onGo: this._handleGo,
                        onPause: this._handlePause,
                        onStop: this._handleStop,
                        onUpload: this._handleUpload,
                        onDownload: this._handleDownload,
                        onToggleCamera: this._handleToggleCamera })
                ),
                React.createElement(
                    'div',
                    { className: subClass },
                    React.createElement(MonitorInfo, null)
                )
            );
        }
    });
});