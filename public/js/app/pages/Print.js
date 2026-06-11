'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define(['jquery', 'react', 'reactDOM', 'app/actions/print', 'plugins/classnames/index', 'jsx!views/print/Advanced', 'jsx!views/print/Left-Panel', 'jsx!views/print/Right-Panel', 'jsx!views/print/Monitor', 'jsx!views/print/Object-Dialogue', 'jsx!widgets/Modal', 'helpers/api/config', 'jsx!views/Printer-Selector', 'helpers/device-master', 'app/stores/global-store', 'app/actions/global-actions', 'app/constants/global-constants', 'app/constants/device-constants', 'jsx!widgets/Tour-Guide', 'app/actions/alert-actions', 'app/stores/alert-store', 'helpers/object-assign', 'helpers/sprintf', 'app/actions/initialize-machine', 'app/actions/progress-actions', 'app/constants/progress-constants', 'helpers/shortcuts', 'helpers/packer', 'app/default-print-settings', 'app/actions/input-lightbox-actions', 'app/constants/input-lightbox-constants', 'helpers/local-storage', 'helpers/api/cloud', 'helpers/i18n', 'app/tutorial-steps', 'helpers/slicer-settings', 'helpers/get-device'], function ($, React, ReactDOM, director, ClassNames, AdvancedPanel, LeftPanel, RightPanel, Monitor, ObjectDialogue, Modal, Config, PrinterSelector, DeviceMaster, GlobalStore, GlobalActions, GlobalConstants, DeviceConstants, TourGuide, AlertActions, AlertStore, ObjectAssign, sprintf, InitializeMachine, ProgressActions, ProgressConstants, shortcuts, packer, DefaultPrintSettings, InputLightboxActions, InputLightboxConstants, LocalStorage, CloudApi, i18n, TutorialSteps, SlicerSettings, GetDevice) {

    return function (args) {
        'use strict';

        args = args || {};

        var advancedSettings = new SlicerSettings('main'),
            fineAdvancedSettings = {},
            _scale = {
            locked: true,
            x: 1,
            y: 1,
            z: 1
        },
            _rotation = {
            x: 0,
            y: 0,
            z: 0
        },
            lang = args.state.lang,
            selectedPrinter,
            $importBtn,
            finishedSnapshot = false,
            listeningToCancel = false,
            defaultRaftLayer = 4,
            allowDeleteObject = true,
            tutorialMode = false,
            defaultSlicingEngine = 'cura2',
            tourGuide = TutorialSteps,
            view = React.createClass({
            displayName: 'view',


            getInitialState: function getInitialState() {
                var storedSlicingConfig = Config().read('slicing-config'),
                    tutorialFinished = Config().read('tutorial-finished'),
                    configuredPrinter = Config().read('configured-printer');

                this._checkDefaultPrintSettingsVersion();

                if (!storedSlicingConfig) {
                    advancedSettings.load(DefaultPrintSettings.cura2);
                    var defaultMedium = DefaultPrintSettings[Config().read('default-model') || Config().read('preferred-model') || 'fd1']['med'];
                    console.log("loading default medium", defaultMedium);
                    advancedSettings.update(defaultMedium);
                } else {
                    advancedSettings.load(storedSlicingConfig, true);
                }

                if (tutorialFinished !== 'true' && configuredPrinter !== '') {
                    tutorialMode = true;
                }

                // processing support
                var supportOn = advancedSettings.config.support_enable === 1;

                return {
                    showAdvancedSettings: false,
                    modelSelected: null,
                    openPrinterSelectorWindow: false,
                    openObjectDialogue: false,
                    openWaitWindow: false,
                    openImportWindow: true,
                    isTransforming: false,
                    hasOutOfBoundsObject: false,
                    hasObject: false,
                    tutorialOn: false,
                    leftPanelReady: true,
                    previewMode: false,
                    previewModeOnly: false,
                    disablePreview: false,
                    disableGoButtons: false,
                    slicingPercentage: 0,
                    currentTutorialStep: 0,
                    layerHeight: 0.1,
                    raftOn: advancedSettings.config.raft === 1,
                    supportOn: supportOn,
                    displayModelControl: !Config().read('default-model'),
                    model: Config().read('default-model') || Config().read('preferred-model') || 'fd1',
                    quality: 'high',
                    mode: 'scale',
                    previewLayerCount: 0,
                    progressMessage: '',
                    fcode: {},
                    objectDialogueStyle: {},
                    camera: {},
                    rotation: {},
                    scale: _scale,
                    printerControllerStatus: '',
                    me: {}
                };
            },

            componentWillMount: function componentWillMount() {
                if (window["electron"]) {
                    var _window$electron = window.electron,
                        ipc = _window$electron.ipc,
                        events = _window$electron.events;

                    CloudApi.getMe().then(function (response) {
                        if (response.ok) {
                            response.json().then(function (content) {
                                var _ref = content || {},
                                    nickname = _ref.nickname,
                                    email = _ref.email;

                                var displayName = nickname || email || '';

                                console.log('account is', content);
                                ipc.send(events.UPDATE_ACCOUNT, content);
                            });
                        } else {
                            ipc.send(events.UPDATE_ACCOUNT, {});
                        }
                    });
                    ipc.send(events.UPDATE_ACCOUNT, {});
                }
            },

            componentDidMount: function componentDidMount() {
                var _this = this;

                director.init(this);

                // prevent user to operate before settings are set
                this.showSpinner();
                this._handleApplyAdvancedSetting().always(function () {
                    _this.hideSpinner();
                });

                // events

                $importBtn = ReactDOM.findDOMNode(this.refs.importBtn);

                if (!window.customEvent) {
                    window.customEvent = {};
                }
                window.customEvent.onTutorialClick = function () {
                    _this.setState({ currentTutorialStep: 0 }, function () {
                        _this._handleYes('tour');
                    });
                };

                this._registerKeyEvents();
                this._registerTracking();

                if (tutorialMode) {
                    var name = '';
                    if (Config().read('configured-printer') !== '') {
                        name = Config().read('configured-printer').name;
                    }
                    //First time using, with usb-configured printer..
                    AlertActions.showPopupYesNo('set_default', sprintf(lang.tutorial.set_first_default, name), lang.tutorial.set_first_default_caption);
                }

                AlertStore.onYes(this._handleYes);
                AlertStore.onNo(this._handleNo);
                AlertStore.onCancel(this._handleDefaultCancel);
                listeningToCancel = true;
                GlobalStore.onCancelPreview(this._handleCancelPreview);
                GlobalStore.onMonitorClosed(this._handleMonitorClosed);
                GlobalStore.onSliceComplete(this._handleSliceReport);

                $('.print-studio').mouseup(function () {
                    GlobalActions.resetDialogMenuIndex();
                });

                document.addEventListener('mouseup', function () {
                    GlobalActions.monitorClosed();
                });
            },

            componentWillUnmount: function componentWillUnmount() {
                director.clear();
                director.willUnmount();

                AlertStore.removeYesListener(this._handleYes);
                AlertStore.removeCancelListener(this._handleDefaultCancel);
                GlobalStore.removeCancelPreviewListener(this._handleCancelPreview);
                GlobalStore.removeMonitorClosedListener(this._handleMonitorClosed);
                GlobalStore.removeSliceCompleteListener(this._handleSliceReport);

                document.removeEventListener('mouseup', function () {
                    GlobalActions.monitorClosed();
                    //GlobalActions.resetDialogMenuIndex();
                });
            },

            _startTutorial: function _startTutorial() {
                var _this2 = this;

                this.setState({ currentTutorialStep: 0 }, function () {
                    _this2._handleYes('tour');
                });
            },

            _registerKeyEvents: function _registerKeyEvents() {
                var _this3 = this;

                // delete event
                shortcuts.on(['del'], function () {
                    if (allowDeleteObject && !_this3._isMonitorOn()) {
                        director.removeSelected();
                    }
                });
            },

            _registerTutorial: function _registerTutorial() {
                if (tutorialMode) {
                    AlertActions.showPopupYesNo('tour', lang.tutorial.startTour);
                }
            },

            _registerTracking: function _registerTracking() {
                var allowTracking = Config().read('allow-tracking');
                if (allowTracking === '') {
                    AlertActions.showPopupYesNo('allow_tracking', lang.settings.allow_tracking);
                }
            },

            showSpinner: function showSpinner(caption) {
                ProgressActions.open(ProgressConstants.NONSTOP, caption);
            },

            hideSpinner: function hideSpinner() {
                ProgressActions.close();
            },

            _updateAdvancedSettings: function _updateAdvancedSettings(opts) {
                var uploadingConfig = {};
                Object.keys(opts).map(function (key) {
                    var value = opts[key];
                    var filteredParam = advancedSettings.filter({ key: key, value: value });
                    if (filteredParam) {
                        if (filteredParam.key instanceof Array) {
                            for (var i = 0; i < filteredParam.key.length; i++) {
                                uploadingConfig[filteredParam.key[i]] = filteredParam.value[i];
                            }
                        } else {
                            uploadingConfig[filteredParam.key] = filteredParam.value;
                        }
                    };
                });
                console.log("Uploading config", uploadingConfig);
                director.setParameters(uploadingConfig);
                advancedSettings.update(opts);

                // update dom state
                this.setState(opts);
                this._saveSetting();
            },

            _getDevice: function _getDevice() {
                return GetDevice();
            },

            _handleYes: function _handleYes(answer, args) {
                var _this4 = this;

                console.log('answer', answer);
                if (answer === 'tour') {
                    var activeLang = i18n.getActiveLang();
                    console.log('activeLang', activeLang);

                    if (this.state.hasObject) {
                        director.clearScene();
                    };

                    var startTutorial = function startTutorial() {
                        _this4.setState({ tutorialOn: true });
                        tutorialMode = true;
                    };

                    var befaultTutorial = function befaultTutorial() {
                        var d = $.Deferred();
                        var callback = function callback() {
                            var shell = require('electron').shell;
                            var href = activeLang === 'en' ? 'https://flux3dp.zendesk.com/hc/en-us/articles/115003538848-FLUX-Delta-Unboxing-Guide' : 'https://flux3dp.zendesk.com/hc/zh-tw/articles/115003538848-FLUX-Delta-開箱導引';
                            shell.openExternal(href);
                            d.resolve();
                        };

                        AlertActions.showPopupCustom('tutorial-welcome', lang.tutorial.befaultTutorialWelcome, lang.tutorial.openBrowser, 'WELCOME', null, callback);

                        return d.promise();
                    };

                    var showTutorialImage = function showTutorialImage() {
                        var d = $.Deferred();
                        var callback = function callback() {
                            d.resolve();
                        };
                        var imageObject = {
                            images: ['img/tutorial/' + activeLang + '/n01.png', 'img/tutorial/' + activeLang + '/n02.png', 'img/tutorial/' + activeLang + '/n03.png', 'img/tutorial/' + activeLang + '/n04.png', 'img/tutorial/' + activeLang + '/n05.png', 'img/tutorial/' + activeLang + '/n06.png'],
                            imgClass: 'img640x480'
                        };

                        setTimeout(function () {
                            AlertActions.showPopupCustom('tutorial-images', 'Test Message', 'custom_text', null, imageObject, callback);
                        }, 1);

                        return d.promise();
                    };

                    befaultTutorial().done(showTutorialImage).done(startTutorial);
                } else if (answer === 'set_default') {
                    Config().write('default-model', Config().read('configured-model'));
                    this.setState({ displayModelControl: false });
                    this.showSpinner();

                    var self = this,
                        device = {},
                        callback = void 0;

                    if (Config().read('configured-printer') !== '') {
                        device = Config().read('configured-printer');
                    }

                    callback = {
                        timeout: 20000,
                        onSuccess: function (printer) {
                            ProgressActions.close();
                            InitializeMachine.defaultPrinter.set({
                                name: printer.name,
                                serial: printer.serial,
                                uuid: printer.uuid
                            });
                            setTimeout(function () {
                                AlertActions.showInfo(sprintf(lang.set_default.success, device.name));
                            }, 100);
                            //Start tutorial
                            setTimeout(function () {
                                this._registerTutorial();
                            }.bind(this), 100);
                        }.bind(this),
                        onTimeout: function onTimeout() {
                            self.hideSpinner();
                            setTimeout(function () {
                                AlertActions.showWarning(sprintf(lang.set_default.error, device.name));
                            }, 100);
                        }
                    };

                    var addr = parseInt(device.addr || '-1');
                    DeviceMaster.getDeviceBySerial(device.serial, false, callback);
                } else if (answer === 'print-setting-version') {
                    advancedSettings.load(DefaultPrintSettings.cura2);
                    Config().write('slicing-config', advancedSettings.toString());
                    Config().write('print-setting-version', GlobalConstants.DEFAULT_PRINT_SETTING_VERSION);
                } else if (answer === GlobalConstants.EXIT_PREVIEW) {
                    director.cancelPreview();
                } else if (answer === GlobalConstants.IMPORT_FCODE) {
                    director.doFCodeImport(args);
                } else if (answer === GlobalConstants.IMPORT_SCENE) {
                    director.loadScene();
                } else if (answer === 'allow_tracking') {
                    Config().write('allow-tracking', 'true');
                }
            },

            _handleNo: function _handleNo(answer, args) {
                console.log(answer);
            },


            _handleCancelTutorial: function _handleCancelTutorial(answer) {
                if (answer === 'tour') {
                    this.setState({ tutorialOn: false });
                    tutorialMode = false;
                    Config().write('tutorial-finished', true);
                }
            },

            _handleRaftClick: function _handleRaftClick() {
                this.setState({ leftPanelReady: false });
                var isOn = !this.state.raftOn;
                director.setParameter('raft', isOn ? '1' : '0').then(function () {
                    this.setState({
                        leftPanelReady: true,
                        raftOn: isOn
                    });
                }.bind(this));

                advancedSettings.set('raft', isOn ? 1 : 0, true);
                this._saveSetting();
            },

            _handleSupportClick: function _handleSupportClick() {
                this.setState({ leftPanelReady: false });
                var isOn = !this.state.supportOn;

                var filteredItem = advancedSettings.filter({ key: 'support_material', value: isOn ? 1 : 0 });
                director.setParameter(filteredItem.key, filteredItem.value ? 1 : 0).then(function () {
                    this.setState({
                        leftPanelReady: true,
                        supportOn: isOn
                    });
                }.bind(this));

                var configStr = advancedSettings.configStr;

                advancedSettings.set('support_enable', isOn ? 1 : 0, true);

                this._saveSetting();
            },

            _handleToggleAdvancedSettingPanel: function _handleToggleAdvancedSettingPanel() {
                this.setState({ showAdvancedSettings: !this.state.showAdvancedSettings }, function () {
                    allowDeleteObject = !this.state.showAdvancedSettings;
                });
            },

            _handleGoClick: function _handleGoClick() {
                AlertStore.removeCancelListener(this._handleDefaultCancel);
                listeningToCancel = false;
                finishedSnapshot = false;
                director.takeSnapShot().then(function () {
                    finishedSnapshot = true;
                    director.clearSelection();
                });
                this.setState({
                    openPrinterSelectorWindow: true
                });
            },

            _handleRotationChange: function _handleRotationChange(rotation) {
                director.addHistory();
                director.setRotation(rotation.enteredX, rotation.enteredY, rotation.enteredZ, true);
            },

            _handleResetRotation: function _handleResetRotation() {
                _rotation.x = 0;
                _rotation.y = 0;
                _rotation.z = 0;
                this.setState({ rotation: _rotation });
                director.setRotation(0, 0, 0, true);
            },

            _handleScaleChange: function _handleScaleChange(src) {
                var axis = src.target.id;
                _scale[axis] = src.type === 'blur' && !$.isNumeric(src.target.value) ? 1 : src.target.value;
                director.setScale(scale.x, scale.y, scale.z, scale.locked, true);
            },

            _handleToggleScaleLock: function _handleToggleScaleLock(size, isLocked) {
                _scale.locked = isLocked;
                this.setState({ scale: _scale });
                director.toggleScaleLock(isLocked);
            },

            _handleResize: function _handleResize(size, isLocked) {
                director.addHistory();
                director.setSize(size, isLocked);
            },

            _handleResetScale: function _handleResetScale() {
                director.setScale(1, 1, 1, true);
            },

            _handleCloseAdvancedSetting: function _handleCloseAdvancedSetting() {
                this.setState({ showAdvancedSettings: false });
                allowDeleteObject = true;
            },

            _handleApplyAdvancedSetting: function _handleApplyAdvancedSetting(setting) {
                var _this5 = this;

                var d = $.Deferred(),
                    quality = 'custom',
                    supportOn = void 0;

                advancedSettings.load(setting || {}, true);
                // remove old properties
                delete advancedSettings.config.raft_on;

                this._saveSetting();

                ['high', 'med', 'low'].forEach(function (q) {
                    // Do comparsion with default settings
                    var params = DefaultPrintSettings[_this5.state.model][q];
                    for (var i in params) {
                        if (params[i] !== advancedSettings.config[i]) {
                            return;
                        }
                    }
                    // No difference then quality equals q
                    quality = q;
                });

                this.setState({
                    supportOn: advancedSettings.config.support_enable === 1,
                    layerHeight: advancedSettings.config.layer_height,
                    raftOn: advancedSettings.config.raft === 1,
                    quality: quality
                });

                if (!setting) {
                    var self = this;
                    var uploadSettings = function uploadSettings() {
                        console.log("Uploading Settings", advancedSettings);
                        director.setAdvanceParameter(advancedSettings.deepClone()).then(function () {
                            fineAdvancedSettings = advancedSettings.deepClone();
                        }).fail(function () {
                            console.log("Uploading Settings Failed", advancedSettings);
                            advancedSettings.load(fineAdvancedSettings);
                            director.setAdvanceParameter(advancedSettings);
                            self._saveSetting();
                        }).always(function () {
                            d.resolve();
                        });
                    };

                    this._handleSlicingEngineChange('cura2').then(uploadSettings).fail(function () {
                        d.reject();
                    });
                } else {
                    this._handleSlicingEngineChange('cura2').then(function () {
                        director.setAdvanceParameter(advancedSettings).then(function () {
                            Object.assign(fineAdvancedSettings, advancedSettings);
                        }).fail(function () {
                            advancedSettings.load(fineAdvancedSettings);
                            director.setAdvanceParameter(advancedSettings);
                            _this5._saveSetting();
                        }).always(function () {
                            d.resolve();
                        });
                    });
                }

                return d.promise();
            },

            _handleImport: function _handleImport(e) {
                var t = e.target;
                director.appendModels(t.files, 0, function () {
                    t.value = null;
                }.bind(this));
            },

            _handleDownloadGCode: function _handleDownloadGCode() {
                if (director.getModelCount() !== 0) {
                    director.downloadGCode().then(function () {
                        this.setState({ openWaitWindow: false });
                    });
                }
            },

            _handleDownloadFCode: function _handleDownloadFCode() {
                director.downloadFCode();
            },

            _handleDownloadScene: function _handleDownloadScene() {
                allowDeleteObject = true;
                director.downloadScene();
            },

            _handlePreview: function _handlePreview(isOn) {
                if (this.state.previewMode !== isOn) {
                    this.setState({ previewMode: isOn }, function () {
                        director.togglePreview();
                    });
                }
            },

            _handlePrinterSelectorWindowClose: function _handlePrinterSelectorWindowClose() {
                this.setState({ openPrinterSelectorWindow: false });
            },

            _handlePrinterSelectorUnmount: function _handlePrinterSelectorUnmount() {
                AlertStore.onCancel(this._handleDefaultCancel);
                listeningToCancel = true;
            },

            _handleDeviceSelected: function _handleDeviceSelected(printer) {
                var _this6 = this;

                if (printer === 'export_fcode') {
                    if (director.getModelCount() !== 0) {
                        director.downloadFCode().then(function () {
                            _this6.setState({ openWaitWindow: false });
                        });
                    }
                    return;
                }
                selectedPrinter = printer;
                this.setState({
                    openPrinterSelectorWindow: false
                }, function () {
                    var go = function go() {
                        if (director.getSlicingStatus().isComplete && finishedSnapshot) {
                            clearInterval(t);
                            director.getFCode().then(function (fcode, previewUrl) {
                                if (!(fcode instanceof Blob)) {
                                    AlertActions.showPopupError('', lang.print.out_of_range_message, lang.print.out_of_range);
                                    return;
                                }
                                AlertStore.removeCancelListener(_this6._handleDefaultCancel);
                                GlobalActions.showMonitor(selectedPrinter, fcode, previewUrl, GlobalConstants.PRINT);
                                //Tour popout after show monitor delay
                                var tour = function tour() {
                                    if (tutorialMode) {
                                        _this6.setState({
                                            tutorialOn: true,
                                            currentTutorialStep: 6
                                        });
                                        //Insert into root html
                                        $('.tour-overlay').append($('.tour'));
                                        $('.tour').click(function () {
                                            $('.print-studio').append($('.tour'));
                                            _this6._handleTutorialComplete();
                                        });
                                    };
                                };
                                setTimeout(tour, 1000);
                            });
                        }
                    };

                    var t = setInterval(go, 100);
                });
            },

            _handlePreviewLayerChange: function _handlePreviewLayerChange(targetLayer) {
                director.changePreviewLayer(targetLayer);
            },

            _handleCameraPositionChange: function _handleCameraPositionChange(position, rotation) {
                director.setCameraPosition(position, rotation);
            },

            _handleMonitorClosed: function _handleMonitorClosed() {
                if (!listeningToCancel) {
                    AlertStore.removeCancelListener(this._handleDefaultCancel);
                    listeningToCancel = true;
                }
            },

            _handleModeChange: function _handleModeChange(mode) {
                this.setState({ mode: mode });
                if (mode === 'rotate') {
                    director.setRotateMode();
                } else {
                    director.setScaleMode();
                }
            },

            _handleQualityModelSelected: function _handleQualityModelSelected(quality, machineModel) {
                if (['high', 'med', 'low'].indexOf(quality) < 0) {
                    quality = 'med';
                }
                var parameters = DefaultPrintSettings[machineModel || 'fd1'][quality];
                this.setState({ model: machineModel, quality: quality });
                Config().write('preferred-model', machineModel);
                this._updateAdvancedSettings(parameters);
                this._saveSetting();
            },

            _handleTutorialStep: function _handleTutorialStep() {
                if (!tutorialMode) {
                    return;
                }
                this.setState({ currentTutorialStep: this.state.currentTutorialStep + 1 }, function () {
                    if (this.state.currentTutorialStep === 1) {
                        var selectedDevice = this._getDevice();
                        var isNotEmptyObject = function isNotEmptyObject(o) {
                            return Object.keys(o).length > 0;
                        };

                        if (isNotEmptyObject(selectedDevice)) {
                            var addr = parseInt(selectedDevice.addr || '-1'),
                                callback = void 0;

                            callback = {
                                timeout: 20000,
                                onSuccess: function (printer) {
                                    //Found ya default printer
                                    ProgressActions.close();
                                    setTimeout(function () {
                                        AlertActions.showChangeFilament(printer, 'TUTORIAL');
                                    }, 100);
                                }.bind(this),
                                onTimeout: function onTimeout() {
                                    //Unable to find configured printer...
                                    ProgressActions.close();
                                    setTimeout(function () {
                                        AlertActions.showWarning(sprintf(lang.set_default.error, selectedDevice.name));
                                    }, 100);
                                }
                            };

                            DeviceMaster.getDeviceBySerial(selectedDevice.serial, false, callback);
                        }
                    } else if (this.state.currentTutorialStep === 3) {
                        var fileEntry = {};
                        fileEntry.name = 'guide-example.stl';
                        fileEntry.toURL = function () {
                            return 'guide-example.stl';
                        };
                        var oReq = new XMLHttpRequest();
                        oReq.open('GET', 'guide-example.stl', true);
                        oReq.responseType = 'blob';

                        oReq.onload = function (oEvent) {
                            var blob = oReq.response;
                            var url = URL.createObjectURL(blob);
                            blob.name = 'guide-example.stl';
                            director.appendModel(url, blob, 'st', function () {
                                director.startSlicing();
                            });
                        };

                        oReq.send();
                        AlertStore.removeCancelListener(this._handleDefaultCancel);
                    } else if (this.state.currentTutorialStep === 5) {
                        this.setState({ tutorialOn: false });
                        $('.btn-go').click();
                    }
                });
            },

            _handleTutorialComplete: function _handleTutorialComplete() {
                tutorialMode = false;
                Config().write('tutorial-finished', true);
                $('.tour').hide();
                this.setState({ tutorialOn: false });
            },

            _handleCloseAllView: function _handleCloseAllView() {
                GlobalActions.closeAllView();
            },

            _handleObjectDialogueFocus: function _handleObjectDialogueFocus(isFocused) {
                allowDeleteObject = !isFocused;
            },

            _handleDefaultCancel: function _handleDefaultCancel(ans) {
                //Use setTimeout to avoid multiple modal display conflict
                console.log('ans', ans);
                if (ans === 'set_default') {
                    AlertStore.removeYesListener(this._handleYes);

                    setTimeout(function () {
                        this._registerTutorial();
                    }.bind(this), 10);
                } else if (ans === 'tour') {
                    this.setState({ tutorialOn: false });
                    tutorialMode = false;
                    Config().write('tutorial-finished', true);
                } else if (ans === 'change-filament-device-busy') {
                    this.setState({ tutorialOn: false });
                    tutorialMode = false;
                } else if (ans === 'print-setting-version') {
                    Config().write('print-setting-version', GlobalConstants.DEFAULT_PRINT_SETTING_VERSION);
                } else if (ans === 'allow_tracking') {
                    Config().write('allow-tracking', 'false');
                    window.location.reload();
                }
            },

            _handleSliceReport: function _handleSliceReport(data) {
                this.setState({ slicingStatus: data.report });
            },

            _handleCancelPreview: function _handleCancelPreview() {
                director.cancelPreview();
            },

            _handleClearScene: function _handleClearScene() {
                director.clearScene();
            },

            _handleSlicingEngineChange: function _handleSlicingEngineChange(engineName) {
                engineName = engineName || defaultSlicingEngine;
                var d = $.Deferred(),
                    path = 'default';

                director.changeEngine(engineName).then(function (error) {
                    if (error) {
                        AlertActions.showPopupWarning('engine-change', lang.settings.engine_change_fail[error.error] + ', ' + error.info, '' + lang.settings.engine_change_fail.caption);
                    }
                    d.resolve();
                }).fail(function (error) {
                    d.reject(error);
                });

                return d.promise();
            },

            _saveSetting: function _saveSetting() {
                // extra process for raft (because it's a direct control on left panel)
                Config().write('slicing-config', advancedSettings.toString());
            },

            _checkDefaultPrintSettingsVersion: function _checkDefaultPrintSettingsVersion() {
                var version = Config().read('print-setting-version');
                if (version !== GlobalConstants.DEFAULT_PRINT_SETTING_VERSION) {
                    AlertActions.showPopupYesNo('print-setting-version', lang.monitor.updatePrintPresetSetting);
                }
            },

            _isMonitorOn: function _isMonitorOn() {
                // yuk! needs to be changed when redux is fully implemented
                return $('.flux-monitor').length > 0;
            },

            _renderAdvancedPanel: function _renderAdvancedPanel() {
                return React.createElement(AdvancedPanel, {
                    lang: lang,
                    setting: advancedSettings,
                    raftLayers: this.state.raftLayers,
                    onClose: this._handleCloseAdvancedSetting,
                    onApply: this._handleApplyAdvancedSetting });
            },

            _renderPrinterSelectorWindow: function _renderPrinterSelectorWindow() {
                var content = React.createElement(PrinterSelector, {
                    uniqleId: 'print',
                    lang: lang,
                    modelFilter: PrinterSelector.DELTA_FILTER,
                    showExport: true,
                    onClose: this._handlePrinterSelectorWindowClose,
                    onUnmount: this._handlePrinterSelectorUnmount,
                    onGettingPrinter: this._handleDeviceSelected });
                return React.createElement(Modal, _extends({}, this.props, {
                    content: content,
                    onClose: this._handlePrinterSelectorWindowClose }));
            },

            _renderImportWindow: function _renderImportWindow() {
                var importWindowClass = ClassNames('importWindow', { 'hide': !this.state.openImportWindow });
                return React.createElement(
                    'div',
                    { className: importWindowClass },
                    React.createElement(
                        'div',
                        { className: 'arrowBox', onClick: this._handleCloseAllView },
                        React.createElement(
                            'div',
                            { title: lang.print.importTitle, className: 'file-importer' },
                            React.createElement(
                                'div',
                                { className: 'import-btn' },
                                lang.print.import
                            ),
                            React.createElement('input', { ref: 'import', type: 'file', 'data-file-input': 'stl_import', accept: '.stl,.fc,.gcode,.obj,.fsc', onChange: this._handleImport, multiple: true })
                        )
                    )
                );
            },

            _renderLeftPanel: function _renderLeftPanel() {
                return React.createElement(LeftPanel, {
                    lang: lang,
                    enable: this.state.leftPanelReady,
                    hasObject: this.state.hasObject,
                    hasOutOfBoundsObject: this.state.hasOutOfBoundsObject,
                    previewMode: this.state.previewMode,
                    previewModeOnly: this.state.previewModeOnly,
                    previewLayerCount: this.state.previewLayerCount,
                    disablePreview: this.state.disablePreview,
                    displayModelControl: this.state.displayModelControl,
                    raftOn: this.state.raftOn,
                    supportOn: this.state.supportOn,
                    quality: this.state.quality,
                    model: this.state.model,
                    onQualityModelSelected: this._handleQualityModelSelected,
                    onRaftClick: this._handleRaftClick,
                    onSupportClick: this._handleSupportClick,
                    onPreviewClick: this._handlePreview,
                    onPreviewLayerChange: this._handlePreviewLayerChange,
                    onShowAdvancedSettingPanel: this._handleToggleAdvancedSettingPanel });
            },

            _renderRightPanel: function _renderRightPanel() {
                return React.createElement(RightPanel, {
                    lang: lang,
                    slicingPercentage: this.state.slicingPercentage,
                    slicingStatus: this.state.slicingStatus,
                    camera: this.state.camera,
                    updateCamera: this.state.updateCamera,
                    hasObject: this.state.hasObject,
                    disableGoButtons: this.state.disableGoButtons,
                    hasOutOfBoundsObject: this.state.hasOutOfBoundsObject,
                    onGoClick: this._handleGoClick,
                    onDownloadGCode: this._handleDownloadGCode,
                    onCameraPositionChange: this._handleCameraPositionChange,
                    onDownloadFCode: this._handleDownloadFCode });
            },

            _renderObjectDialogue: function _renderObjectDialogue() {
                return React.createElement(ObjectDialogue, {
                    lang: lang,
                    model: this.state.modelSelected,
                    style: this.state.objectDialogueStyle,
                    mode: this.state.mode,
                    isTransforming: this.state.isTransforming,
                    scaleLocked: _scale.locked,
                    onRotate: this._handleRotationChange,
                    onResize: this._handleResize,
                    onScaleLock: this._handleToggleScaleLock,
                    onFocus: this._handleObjectDialogueFocus,
                    onModeChange: this._handleModeChange });
            },

            _renderWaitWindow: function _renderWaitWindow() {
                var spinner = React.createElement('div', { className: 'spinner-flip spinner-reverse' });
                return React.createElement(Modal, { content: spinner });
            },

            _renderProgressWindow: function _renderProgressWindow() {
                var content = React.createElement(
                    'div',
                    { className: 'progressWindow' },
                    React.createElement(
                        'div',
                        { className: 'message' },
                        this.state.progressMessage
                    ),
                    React.createElement('div', { className: 'spinner-flip spinner-reverse' })
                );
                return React.createElement(Modal, { content: content });
            },

            _renderPercentageBar: function _renderPercentageBar() {
                var slicingPercentage = this.state.slicingPercentage;

                if (slicingPercentage === 1 || slicingPercentage === 0) {
                    return '';
                }
                var computed_style = {
                    width: this.state.slicingPercentage * 100 + '%'
                };
                return React.createElement(
                    'div',
                    { className: 'slicingProgressBar' },
                    React.createElement('div', { className: 'slicingProgressBarInner', style: computed_style })
                );
            },

            _renderTourGuide: function _renderTourGuide() {
                return React.createElement(TourGuide, {
                    lang: lang,
                    enable: this.state.tutorialOn,
                    guides: tourGuide,
                    step: this.state.currentTutorialStep,
                    onNextClick: this._handleTutorialStep,
                    onComplete: this._handleTutorialComplete });
            },

            render: function render() {
                var advancedPanel = this.state.showAdvancedSettings ? this._renderAdvancedPanel() : '',
                    importWindow = this._renderImportWindow(),
                    leftPanel = this._renderLeftPanel(),
                    rightPanel = this._renderRightPanel(),
                    objectDialogue = this.state.openObjectDialogue ? this._renderObjectDialogue() : '',
                    printerSelectorWindow = this.state.openPrinterSelectorWindow ? this._renderPrinterSelectorWindow() : '',
                    waitWindow = this.state.openWaitWindow ? this._renderWaitWindow() : '',
                    progressWindow = this.state.progressMessage ? this._renderProgressWindow() : '',
                    percentageBar = this._renderPercentageBar(),
                    tourGuideSection = this.state.tutorialOn ? this._renderTourGuide() : '';

                return React.createElement(
                    'div',
                    { className: 'studio-container print-studio' },
                    importWindow,
                    leftPanel,
                    percentageBar,
                    rightPanel,
                    objectDialogue,
                    printerSelectorWindow,
                    advancedPanel,
                    waitWindow,
                    progressWindow,
                    React.createElement(
                        'div',
                        { id: 'model-displayer', className: 'model-displayer' },
                        React.createElement('div', { className: 'import-indicator' })
                    ),
                    React.createElement('input', { className: 'hide', ref: 'importBtn', type: 'file', accept: '.stl,.fc,.gcode,.obj', onChange: this._handleImport, multiple: true }),
                    tourGuideSection
                );
            }
        });

        return view;
    };
});