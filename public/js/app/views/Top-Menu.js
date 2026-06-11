'use strict';

define(['jquery', 'react', 'helpers/i18n', 'app/app-settings', 'helpers/detect-webgl', 'helpers/api/discover', 'helpers/device-master', 'helpers/check-device-status', 'helpers/check-firmware', 'helpers/firmware-updater', 'helpers/firmware-version-checker', 'helpers/api/3d-scan-control', 'helpers/api/cloud', 'helpers/output-error', 'plugins/classnames/index', 'app/constants/device-constants', 'jsx!views/toolbox/Toolbox', 'jsx!views/print/Monitor', 'jsx!widgets/Modal', 'app/actions/alert-actions', 'app/stores/alert-store', 'app/actions/global-actions', 'app/stores/global-store', 'helpers/device-list', 'app/actions/progress-actions', 'app/constants/progress-constants', 'app/constants/global-constants', 'app/actions/initialize-machine', 'app/actions/beambox/preview-mode-background-drawer', 'app/actions/beambox/preview-mode-controller', 'app/actions/beambox/svgeditor-function-wrapper'], function ($, React, i18n, appSettings, detectWebgl, Discover, DeviceMaster, checkDeviceStatus, checkFirmware, firmwareUpdater, FirmwareVersionChecker, ScanControl, CloudApi, OutputError, ClassNames, DeviceConstants, Toolbox, Monitor, Modal, AlertActions, AlertStore, GlobalActions, GlobalStore, DeviceList, ProgressActions, ProgressConstants, GlobalConstants, InitializeMachine, PreviewModeBackgroundDrawer, PreviewModeController, FnWrapper) {
    'use strict';

    if (window["electron"]) {
        var _window$electron = window.electron,
            ipc = _window$electron.ipc,
            events = _window$electron.events;
    } else {
        var EM = require('events');
        var ipc = new EM();
        var events = {};
    }

    return function (args) {
        args = args || {};
        var _id = 'TopMenu',
            lang = args.state.lang,
            genericClassName = {
            'item': true
        },
            options = [{
            name: 'print',
            displayName: 'PRINT',
            className: genericClassName,
            label: lang.menu.print,
            imgSrc: 'img/menu/icon_print.svg',
            group: 'delta'
        }, {
            name: 'laser',
            displayName: 'ENGRAVE',
            className: genericClassName,
            label: lang.menu.laser,
            imgSrc: 'img/menu/icon_laser.svg',
            group: 'delta'
        }, {
            name: 'scan',
            displayName: 'SCAN',
            className: genericClassName,
            label: lang.menu.scan,
            imgSrc: 'img/menu/icon_scan.svg',
            group: 'delta'
        }, {
            name: 'draw',
            displayName: 'DRAW',
            className: genericClassName,
            label: lang.menu.draw,
            imgSrc: 'img/menu/icon-draw.svg',
            group: 'delta'
        }, {
            name: 'cut',
            displayName: 'CUT',
            className: genericClassName,
            label: lang.menu.cut,
            imgSrc: 'img/menu/icon-cut.svg',
            group: 'delta'
        }, {
            name: 'beambox',
            displayName: 'ENGRAVE',
            className: genericClassName,
            label: lang.menu.laser,
            imgSrc: 'img/menu/icon_laser.svg',
            group: 'beambox'
        }],
            getLog = async function getLog(printer, log) {
            await DeviceMaster.select(printer);
            ProgressActions.open(ProgressConstants.WAITING, '');
            var downloader = DeviceMaster.downloadLog(log);
            downloader.then(function (file) {
                ProgressActions.close();
                saveAs(file[1], log);
            }).progress(function (progress) {
                ProgressActions.open(ProgressConstants.STEPPING);
                ProgressActions.updating('downloading', progress.completed / progress.size * 100, function () {
                    downloader.reject('canceled');
                });
            }).fail(function (data) {
                var msg = data === 'canceled' ? lang.device.download_log_canceled : lang.device.download_log_error;
                AlertActions.showPopupInfo('', msg);
            });
        },
            executeFirmwareUpdate = function executeFirmwareUpdate(printer, type) {
            //var currentPrinter = discoverMethods.getLatestPrinter(printer),
            var currentPrinter = printer,
                checkToolheadFirmware = function checkToolheadFirmware() {
                var $deferred = $.Deferred();

                ProgressActions.open(ProgressConstants.NONSTOP, lang.update.checkingHeadinfo);

                if ('toolhead' === type) {
                    DeviceMaster.headInfo().done(function (response) {
                        currentPrinter.toolhead_version = response.version || '';

                        if ('undefined' === typeof response.version) {
                            $deferred.reject();
                        } else {
                            $deferred.resolve({ status: 'ok' });
                        }
                    }).fail(function () {
                        $deferred.reject();
                    });
                } else {
                    $deferred.resolve({ status: 'ok' });
                }

                return $deferred;
            },
                updateFirmware = function updateFirmware() {
                checkFirmware(currentPrinter, type).done(function (response) {
                    var latestVersion = currentPrinter.version,
                        caption = lang.update.firmware.latest_firmware.caption,
                        message = lang.update.firmware.latest_firmware.message;

                    if ('toolhead' === type) {
                        latestVersion = currentPrinter.toolhead_version;
                        caption = lang.update.toolhead.latest_firmware.caption;
                        message = lang.update.toolhead.latest_firmware.message;
                    }

                    if (!response.needUpdate) {
                        var forceUpdate = {
                            custom: function custom() {
                                firmwareUpdater(response, currentPrinter, type, true);
                            },
                            no: function no() {
                                if ('toolhead' === type) {
                                    DeviceMaster.quitTask();
                                }
                            }
                        };
                        AlertActions.showPopupCustomCancel('latest-firmware', message + ' (v' + latestVersion + ')', lang.update.firmware.latest_firmware.still_update, caption, forceUpdate);
                    } else {
                        firmwareUpdater(response, currentPrinter, type);
                    }
                }).fail(function (response) {
                    firmwareUpdater(response, currentPrinter, type);
                    AlertActions.showPopupInfo('latest-firmware', lang.monitor.cant_get_toolhead_version);
                });
            },
                checkStatus = function checkStatus() {
                var processUpdate = function processUpdate() {
                    checkToolheadFirmware().always(function () {
                        ProgressActions.close();
                        updateFirmware();
                    }).fail(function () {
                        AlertActions.showPopupError('toolhead-offline', lang.monitor.cant_get_toolhead_version);
                    });
                };

                var handleYes = function handleYes(id) {
                    if (id === 'head-missing') {
                        processUpdate();
                    }
                };

                var handleCancel = function handleCancel(id) {
                    if (id === 'head-missing') {
                        AlertStore.removeYesListener(handleYes);
                        AlertStore.removeCancelListener(handleCancel);
                        DeviceMaster.endMaintainMode();
                    }
                };

                AlertStore.onRetry(handleYes);
                AlertStore.onCancel(handleCancel);

                ProgressActions.open(ProgressConstants.NONSTOP, lang.update.preparing);
                if (type === 'toolhead') {
                    DeviceMaster.enterMaintainMode().then(function () {
                        setTimeout(function () {
                            ProgressActions.close();
                            processUpdate();
                        }, 3000);
                    });
                } else {
                    processUpdate();
                }
            };

            DeviceMaster.select(printer).then(function (status) {
                checkStatus();
            }).fail(function (resp) {
                AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
            });
        };
        //============ end var================================================

        // Special Feature
        if (window.FLUX && window.FLUX.dev) {
            options.push({
                name: 'mill',
                displayName: 'Mill',
                className: genericClassName,
                label: lang.menu.mill,
                imgSrc: 'img/menu/icon-draw.svg'
            });
        }

        var registerAllDeviceMenuClickEvents = function registerAllDeviceMenuClickEvents() {

            window.menuEventRegistered = true;

            var showPopup = async function showPopup(currentPrinter, type) {

                var allowPause = await FirmwareVersionChecker.check(currentPrinter, 'OPERATE_DURING_PAUSE');
                var status = await checkDeviceStatus(currentPrinter, allowPause);
                switch (status) {
                    case 'ok':
                        if (type === 'SET_TEMPERATURE') {
                            AlertActions.showHeadTemperature(currentPrinter);
                        } else {
                            AlertActions.showChangeFilament(currentPrinter);
                        }
                        break;
                    case 'auth':
                        var callback = {
                            onSuccess: function onSuccess() {
                                AlertActions.showChangeFilament(currentPrinter);
                            },
                            onError: function onError() {
                                InputLightboxActions.open('auth-device', {
                                    type: InputLightboxConstants.TYPE_PASSWORD,
                                    caption: lang.select_printer.notification,
                                    inputHeader: lang.select_printer.please_enter_password,
                                    confirmText: lang.select_printer.submit,
                                    onSubmit: function onSubmit(password) {
                                        _auth(printer.uuid, password, {
                                            onError: function onError(response) {
                                                var message = false === response.reachable ? lang.select_printer.unable_to_connect : lang.select_printer.auth_failure;
                                                AlertActions.showPopupError('device-auth-fail', message);
                                            }
                                        });
                                    }
                                });
                            }
                        };
                        _auth(currentPrinter.uuid, '', callback);
                        break;
                }
            };

            ipc.on(events.MENU_CLICK, function (e, menuItem) {
                var _action = {},
                    lang = i18n.get();

                _action['DASHBOARD'] = function (device) {
                    DeviceMaster.selectDevice(device).then(function (status) {
                        if (status === DeviceConstants.CONNECTED) {
                            GlobalActions.showMonitor(device, '', '', GlobalConstants.DEVICE_LIST);
                        } else if (status === DeviceConstants.TIMEOUT) {
                            AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                        }
                    });
                };

                _action['MACHINE_INFO'] = function (device) {
                    var info = lang.device.model_name + ': ' + device.model.toUpperCase() + '\n' + lang.device.IP + ': ' + device.ipaddr + '\n' + lang.device.serial_number + ': ' + device.serial + '\n' + lang.device.firmware_version + ': ' + device.version + '\n' + lang.device.UUID + ': ' + device.uuid;
                    AlertActions.showPopupInfo('', info);
                };

                _action['TOOLHEAD_INFO'] = async function (device) {
                    var status = await DeviceMaster.selectDevice(device);
                    if (status === DeviceConstants.TIMEOUT) {
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                        return;
                    }
                    ProgressActions.open(ProgressConstants.NONSTOP, lang.message.connecting);
                    await checkDeviceStatus(device);
                    await DeviceMaster.enterMaintainMode();
                    var info = await DeviceMaster.headInfo();
                    ProgressActions.close();
                    DeviceMaster.endMaintainMode();

                    var headModule = info.head_module;

                    if (headModule === null) {
                        AlertActions.showPopupInfo('', lang.head_info.cannot_get_info);
                        return;
                    }

                    var fields = ['ID', 'VERSION', 'HEAD_MODULE', 'USED'];
                    if (headModule === 'LASER') {
                        fields.push('FOCAL_LENGTH');
                    }

                    var displayInfo = fields.map(function (field) {
                        var k = info[field];
                        if (field.toUpperCase() === 'HEAD_MODULE') {
                            k = lang.head_info[info[field.toLowerCase()]];
                        } else if (field === 'USED') {
                            k = parseInt(info[field] / 60) + ' ' + lang.head_info.hours;
                        }
                        return lang.head_info[field] + ':  ' + k;
                    });

                    AlertActions.showPopupInfo('', displayInfo.join('\n'));
                };

                _action['CALIBRATE_BEAMBOX_CAMERA'] = function (device) {
                    if (location.hash !== '#studio/beambox') {
                        AlertActions.showPopupInfo('', lang.camera_calibration.please_goto_beambox_first);
                        return;
                    }
                    ProgressActions.open(ProgressConstants.NONSTOP, lang.message.connecting);
                    DeviceMaster.select(device).done(function () {
                        ProgressActions.close();
                        AlertActions.showCameraCalibration(device);
                    }).fail(function () {
                        ProgressActions.close();
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                };

                _action['CHANGE_FILAMENT'] = function (device) {
                    DeviceMaster.selectDevice(device).then(function (status) {
                        DeviceMaster.getReport().then(function (report) {
                            if (report.st_id === 16 || report.st_id === 2) {
                                AlertActions.showPopupError('OCCUPIED', lang.message.device_in_use);
                            } else if (status === DeviceConstants.CONNECTED) {
                                showPopup(device, 'CHANGE_FILAMENT');
                            } else if (status === DeviceConstants.TIMEOUT) {
                                AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                            }
                        });
                    });
                };

                _action['AUTO_LEVELING'] = function (device) {
                    DeviceMaster.selectDevice(device).then(function (status) {
                        if (status === DeviceConstants.CONNECTED) {
                            var handleStopCalibrate = function handleStopCalibrate() {
                                DeviceMaster.killSelf();
                            };
                            var emptyFunction = function emptyFunction(object) {
                                return object || {};
                            };
                            checkDeviceStatus(device).then(function () {
                                ProgressActions.open(ProgressConstants.WAITING, lang.device.calibrating, lang.device.pleaseWait, true, emptyFunction, emptyFunction, handleStopCalibrate);
                                DeviceMaster.calibrate().done(function (debug_message) {
                                    setTimeout(function () {
                                        AlertActions.showPopupInfo('calibrated', JSON.stringify(debug_message), lang.calibration.calibrated);
                                    }, 100);
                                }).fail(function (resp) {
                                    if (resp.error[0] === 'EDGE_CASE') {
                                        return;
                                    }
                                    if (resp.module === 'LASER') {
                                        AlertActions.showPopupError('calibrate-fail', lang.calibration.extruderOnly);
                                    } else {
                                        DeviceErrorHandler.processDeviceMasterResponse(resp);
                                        AlertActions.showPopupError('calibrate-fail', DeviceErrorHandler.translate(resp.error));
                                    }
                                }).always(function () {
                                    ProgressActions.close();
                                });
                            });
                        } else if (status === DeviceConstants.TIMEOUT) {
                            AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                        }
                    });
                };

                _action['CALIBRATE_ORIGIN'] = function (device) {
                    ProgressActions.open(ProgressConstants.NONSTOP, lang.message.connecting);
                    DeviceMaster.select(device).then(function () {
                        checkDeviceStatus(device).then(function () {
                            ProgressActions.open(ProgressConstants.NONSTOP);
                            DeviceMaster.home().done(function () {
                                ProgressActions.close();
                                setTimeout(function () {
                                    console.log('lang is', lang);
                                    AlertActions.showPopupInfo('set-to-origined', lang.topmenu.device.set_to_origin_complete);
                                }, 100);
                            }).always(function () {
                                ProgressActions.close();
                            });
                        });
                    }).fail(function () {
                        ProgressActions.close();
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                };

                _action['MOVEMENT_TEST'] = function (device) {
                    ProgressActions.open(ProgressConstants.NONSTOP, lang.message.connecting);
                    DeviceMaster.select(device).then(function () {
                        ProgressActions.open(ProgressConstants.NONSTOP, lang.tutorial.runningMovementTests);
                        checkDeviceStatus(device).then(function () {
                            DeviceMaster.runMovementTests().then(function () {
                                console.log('ran movemnt test');
                                ProgressActions.close();
                                AlertActions.showPopupInfo('movement-tests', lang.topmenu.device.movement_tests_complete);
                            }).fail(function (resp) {
                                console.log('ran movemnt test failed', resp);
                                ProgressActions.close();
                                AlertActions.showPopupInfo('movement-tests', lang.topmenu.device.movement_tests_failed);
                            });
                        });
                    }).fail(function () {
                        ProgressActions.close();
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                };

                _action['TURN_ON_LASER'] = function (device) {
                    ProgressActions.open(ProgressConstants.WAITING, lang.message.connecting);
                    DeviceMaster.select(device).then(function () {
                        ProgressActions.open(ProgressConstants.WAITING);
                        checkDeviceStatus(device).then(function () {
                            ProgressActions.open(ProgressConstants.WAITING, lang.topmenu.device.calibrating, lang.device.pleaseWait, false);
                            var scanControl,
                                opts = {
                                onError: function onError(data) {
                                    scanControl.takeControl(function (response) {
                                        ProgressActions.close();
                                    });
                                },
                                onReady: function onReady() {
                                    ProgressActions.close();
                                    scanControl.turnLaser(true).then(function () {
                                        AlertActions.showPopupCustom('scan-laser-turned-on', lang.topmenu.device.scan_laser_complete, lang.topmenu.device.finish, '');
                                        var _handleFinish = function _handleFinish(dialog_name) {
                                            scanControl.turnLaser(false).then(function () {
                                                scanControl.quit(true).then(function () {
                                                    opts.onReady = function () {};
                                                }).fail(function () {
                                                    ProgressActions.close();
                                                });
                                            });
                                            AlertStore.removeCustomListener(_handleFinish);
                                        };
                                        AlertStore.onCustom(_handleFinish);
                                    });
                                }
                            };
                            scanControl = ScanControl(device.uuid, opts);
                        });
                    }).fail(function () {
                        ProgressActions.close();
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                };

                _action['AUTO_LEVELING_CLEAN'] = function (device) {
                    ProgressActions.open(ProgressConstants.WAITING, lang.message.connecting);
                    DeviceMaster.select(device).then(function () {
                        checkDeviceStatus(device).then(function () {
                            ProgressActions.open(ProgressConstants.WAITING, lang.topmenu.device.calibrating, lang.topmenu.device.pleaseWait, false);
                            DeviceMaster.cleanCalibration().done(function () {
                                setTimeout(function () {
                                    AlertActions.showPopupInfo('calibrated', lang.calibration.calibrated);
                                }, 100);
                            }).always(function () {
                                ProgressActions.close();
                            });
                        });
                    }).fail(function () {
                        ProgressActions.close();
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                };

                _action['SET_TOOLHEAD_TEMPERATURE'] = function (device) {
                    DeviceMaster.select(device).then(function () {
                        showPopup(device, 'SET_TEMPERATURE');
                    }).fail(function () {
                        AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                    });
                };

                _action['UPDATE_FIRMWARE'] = function (device) {
                    checkDeviceStatus(device).then(function () {
                        executeFirmwareUpdate(device, 'firmware');
                    });
                };

                _action['UPDATE_TOOLHEAD'] = function (device) {
                    checkDeviceStatus(device).then(function () {
                        executeFirmwareUpdate(device, 'toolhead');
                    });
                };

                _action['LOG_NETWORK'] = function (device) {
                    getLog(device, 'fluxnetworkd.log');
                };

                _action['LOG_HARDWARE'] = function (device) {
                    getLog(device, 'fluxhald.log');
                };

                _action['LOG_DISCOVER'] = function (device) {
                    getLog(device, 'fluxupnpd.log');
                };

                _action['LOG_USB'] = function (device) {
                    getLog(device, 'fluxusbd.log');
                };

                _action['LOG_CAMERA'] = function (device) {
                    getLog(device, 'fluxcamerad.log');
                };

                _action['LOG_CLOUD'] = function (device) {
                    getLog(device, 'fluxcloudd.log');
                };

                _action['LOG_PLAYER'] = function (device) {
                    getLog(device, 'fluxplayerd.log');
                };

                _action['LOG_ROBOT'] = function (device) {
                    getLog(device, 'fluxrobotd.log');
                };

                _action['SET_AS_DEFAULT'] = function (device) {
                    InitializeMachine.defaultPrinter.clear();
                    InitializeMachine.defaultPrinter.set(device);
                    ipc.send(events.SET_AS_DEFAULT, device);
                };

                _action['BUG_REPORT'] = function () {
                    OutputError();
                };

                _action['SIGN_IN'] = function () {
                    location.hash = '#studio/cloud/sign-in';
                };

                _action['SIGN_OUT'] = function () {
                    CloudApi.signOut().then(function () {
                        location.hash = '#studio/cloud/sign-in';
                    });
                };

                _action['MY_ACCOUNT'] = function () {
                    location.hash = '#studio/cloud/bind-machine';
                };

                if (typeof _action[menuItem.id] === 'function') {
                    if (menuItem.id === 'SIGN_IN' || menuItem.id === 'SIGN_OUT' || menuItem.id === 'MY_ACCOUNT' || menuItem.id === 'BUG_REPORT') {
                        _action[menuItem.id]();
                    } else {
                        var callback = {
                            timeout: 20000,
                            onSuccess: function onSuccess(device) {
                                _action[menuItem.id](device);
                            },
                            onTimeout: function onTimeout() {
                                console.log('select device timeout');
                            }
                        };

                        DeviceMaster.getDeviceBySerial(menuItem.serial, menuItem.source === 'h2h', callback);
                    }
                }
            });
        };

        var unregisterEvents = function unregisterEvents() {
            var _window$electron2 = window.electron,
                ipc = _window$electron2.ipc,
                events = _window$electron2.events;

            ipc.removeAllListeners(events.MENU_CLICK);
        };

        if (!window.menuEventRegistered) {
            registerAllDeviceMenuClickEvents();
        }
        // registerMenuItemClickEvents();

        return React.createClass({

            getDefaultProps: function getDefaultProps() {
                return {
                    show: true
                };
            },

            getInitialState: function getInitialState() {
                return {
                    sourceId: '',
                    deviceList: [],
                    refresh: '',
                    showDeviceList: false,
                    customText: '',
                    fcode: {},
                    previewUrl: ''
                };
            },

            componentDidMount: function componentDidMount() {
                this._toggleDeviceListBind = this._toggleDeviceList.bind(null, false);

                AlertStore.onCancel(this._toggleDeviceListBind);
                AlertStore.onRetry(this._waitForPrinters);
                GlobalStore.onMonitorClosed(this._toggleDeviceListBind);
            },

            componentWillUnmount: function componentWillUnmount() {
                AlertStore.removeCancelListener(this._toggleDeviceListBind);
                AlertStore.removeRetryListener(this._waitForPrinters);
                GlobalStore.removeMonitorClosedListener(this._toggleDeviceListBind);
                // unregisterEvents();
            },

            _waitForPrinters: function _waitForPrinters() {
                setTimeout(this._openAlertWithnoPrinters, 5000);
            },

            _openAlertWithnoPrinters: function _openAlertWithnoPrinters() {
                if (0 === this.state.deviceList.length && true === this.state.showDeviceList) {
                    if (location.hash === '#studio/beambox') {
                        AlertActions.showPopupRetry('no-printer', lang.device_selection.no_beambox);
                    } else {
                        AlertActions.showPopupRetry('no-printer', lang.device_selection.no_printers);
                    }
                }
            },

            _toggleDeviceList: function _toggleDeviceList(open) {
                this.setState({
                    showDeviceList: open
                });

                if (true === open) {
                    this._waitForPrinters();
                }
            },

            _handleNavigation: function _handleNavigation(address) {
                if (-1 < appSettings.needWebGL.indexOf(address) && false === detectWebgl()) {
                    AlertActions.showPopupError('no-webgl-support', lang.support.no_webgl);
                } else {
                    if (location.hash.indexOf('beambox') > 0 && address !== 'beambox') {
                        FnWrapper.clearSelection();
                        PreviewModeController.end();
                        PreviewModeBackgroundDrawer.clear();
                    }

                    location.hash = '#studio/' + address;
                }
            },

            _handleShowDeviceList: function _handleShowDeviceList() {
                var self = this,
                    refreshOption = function refreshOption(devices) {
                    self.setState({
                        deviceList: devices
                    });
                };

                Discover('top-menu', function (printers) {
                    printers = DeviceList(printers);
                    refreshOption(printers);
                });

                this._toggleDeviceList(!this.state.showDeviceList);
            },

            _handleSelectDevice: function _handleSelectDevice(device, e) {
                e.preventDefault();
                AlertStore.removeCancelListener(this._toggleDeviceListBind);
                ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, lang.initialize.connecting);
                DeviceMaster.selectDevice(device).then(function (status) {
                    if (status === DeviceConstants.CONNECTED) {
                        ProgressActions.close();
                        GlobalActions.showMonitor(device);
                    } else if (status === DeviceConstants.TIMEOUT) {
                        ProgressActions.close();
                        AlertActions.showPopupError(_id, lang.message.connectionTimeout);
                    }
                }).fail(function (status) {
                    ProgressActions.close();
                    AlertActions.showPopupError('fatal-occurred', status);
                });

                this._toggleDeviceList(false);
            },

            _handleMonitorClose: function _handleMonitorClose() {
                this.setState({
                    showMonitor: false
                });
            },

            _handleContextMenu: function _handleContextMenu(event) {
                window.electron && window.electron.ipc.send("POPUP_MENU_ITEM", { x: event.screenX, y: event.screenY }, {});
            },
            _renderStudioFunctions: function _renderStudioFunctions() {
                var groupName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'delta';

                var itemClass = '',
                    label = '',
                    isActiveItem,
                    menuItems;

                menuItems = options.filter(function (v) {
                    return v.group == groupName;
                }).map(function (opt, i) {
                    isActiveItem = -1 < location.hash.indexOf(opt.name);
                    itemClass = '';
                    label = '';

                    if ('' !== opt.label) {
                        label = React.createElement(
                            'p',
                            null,
                            opt.label
                        );
                    }

                    opt.className.active = isActiveItem;
                    itemClass = ClassNames(opt.className);

                    return React.createElement(
                        'li',
                        { className: itemClass, key: 'menu' + i,
                            'data-display-name': opt.displayName,
                            onClick: this._handleNavigation.bind(null, opt.name) },
                        React.createElement('img', { src: opt.imgSrc, draggable: 'false' }),
                        label
                    );
                }, this);

                return menuItems;
            },

            _renderDeviceList: function _renderDeviceList() {
                var status = lang.machine_status,
                    headModule = lang.head_module,
                    statusText,
                    headText,
                    progress,
                    deviceList = this.state.deviceList,
                    options = deviceList.map(function (device) {
                    statusText = status[device.st_id] || status.UNKNOWN;
                    headText = headModule[device.head_module] || headModule.UNKNOWN;

                    if (device.st_prog === 0) {
                        progress = '';
                    } else if (16 === device.st_id && 'number' === typeof device.st_prog) {
                        progress = (parseInt(device.st_prog * 1000) * 0.1).toFixed(1) + '%';
                    } else {
                        progress = '';
                    }

                    var img = 'img/icon_' + (device.source === 'h2h' ? 'usb' : 'wifi') + '.svg';

                    return React.createElement(
                        'li',
                        {
                            key: device.uuid,
                            name: device.uuid,
                            onClick: this._handleSelectDevice.bind(null, device),
                            'data-test-key': device.serial
                        },
                        React.createElement(
                            'label',
                            { className: 'name' },
                            device.name
                        ),
                        React.createElement(
                            'label',
                            { className: 'status' },
                            headText,
                            ' ',
                            statusText
                        ),
                        React.createElement(
                            'label',
                            { className: 'progress' },
                            progress
                        ),
                        React.createElement(
                            'label',
                            { className: 'connection-type' },
                            React.createElement(
                                'div',
                                { className: 'type' },
                                React.createElement('img', { src: img })
                            )
                        )
                    );
                }, this),
                    list;

                list = 0 < options.length ? options : [React.createElement('div', { key: 'spinner-roller', className: 'spinner-roller spinner-roller-reverse' })];

                return React.createElement(
                    'ul',
                    null,
                    list
                );
            },

            render: function render() {
                var deltaMenuItems = this._renderStudioFunctions('delta'),
                    beamboxMenuItems = this._renderStudioFunctions('beambox'),
                    deviceList = this._renderDeviceList(),
                    currentWorkingFunction,
                    menuClass,
                    topClass;

                currentWorkingFunction = options.filter(function (el) {
                    return -1 < location.hash.search(el.name);
                })[0] || {};

                menuClass = ClassNames('menu', { show: this.state.showDeviceList });
                topClass = {
                    'hide': !this.props.show
                };

                return React.createElement(
                    'div',
                    { className: ClassNames(topClass) },
                    React.createElement(
                        'div',
                        { className: 'brand-logo', onContextMenu: this._handleContextMenu },
                        React.createElement('img', { className: 'logo-icon', src: 'img/menu/main_logo.svg', draggable: 'false' }),
                        React.createElement(
                            'span',
                            { className: 'func-name' },
                            currentWorkingFunction.displayName
                        ),
                        React.createElement(
                            'div',
                            { className: 'menu' },
                            React.createElement('div', { className: 'arrow arrow-left arrow-top-left-flat' }),
                            React.createElement(
                                'div',
                                { className: 'product-group-title' },
                                'Delta Family'
                            ),
                            React.createElement(
                                'ul',
                                { className: 'inner-menu delta' },
                                deltaMenuItems
                            ),
                            React.createElement(
                                'div',
                                { className: 'product-group-title' },
                                'Beambox Family'
                            ),
                            React.createElement(
                                'ul',
                                { className: 'inner-menu beambox' },
                                beamboxMenuItems
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { title: lang.print.deviceTitle, className: 'device', onClick: this._handleShowDeviceList },
                        React.createElement(
                            'p',
                            { className: 'device-icon' },
                            React.createElement('img', { src: 'img/btn-device.svg', draggable: 'false' }),
                            React.createElement(
                                'span',
                                null,
                                lang.menu.device
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: menuClass },
                            React.createElement('div', { className: 'arrow arrow-right' }),
                            React.createElement(
                                'div',
                                { className: 'device-list' },
                                deviceList
                            )
                        )
                    ),
                    React.createElement(Toolbox, null)
                );
            }

        });
    };
});