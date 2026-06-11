'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(['jquery', 'helpers/i18n', 'helpers/sprintf', 'app/actions/alert-actions', 'app/actions/beambox', 'app/actions/progress-actions', 'app/constants/progress-constants', 'app/actions/input-lightbox-actions', 'app/constants/device-constants', 'helpers/api/control', 'helpers/api/3d-scan-control', 'helpers/usb-checker', 'helpers/api/touch', 'helpers/api/discover', 'helpers/api/config', 'app/actions/global-actions', 'app/constants/input-lightbox-constants', 'helpers/device-list', 'helpers/api/camera', 'helpers/api/simple-websocket', 'helpers/socket-master', 'helpers/device-error-handler', 'helpers/array-findindex'], function ($, i18n, sprintf, AlertActions, BeamboxActions, ProgressActions, ProgressConstants, InputLightboxActions, DeviceConstants, DeviceController, ScanController, UsbChecker, Touch, Discover, Config, GlobalActions, InputLightBoxConstants, DeviceList, Camera, SimpleWebsocket, Sm, DeviceErrorHandler) {

    var lang = i18n.get(),
        SocketMaster = void 0,
        defaultPrinter = void 0,
        defaultPrinterWarningShowed = false,
        _instance = null,
        _stopChangingFilament = false,
        _stopChangingFilamentCallback = void 0,
        _selectedDevice = {},
        _deviceNameMap = {},
        _controllerMap = {},
        _device = void 0,
        _wasKilled = false,
        usbDeviceReport = {},
        _devices = [],
        _availableDevices = [],
        _errors = {},
        availableUsbChannel = -1,
        usbEventListeners = {},
        self = this;

    // Better select device
    function select(device, opts) {
        var d = $.Deferred();
        selectDevice(device).then(function (result) {
            if (result == DeviceConstants.CONNECTED) {
                d.resolve();
            } else {
                d.reject(lang.message.connectionTimeout);
            }
        }, function (error) {
            console.error('Selection error in DeviceMaster. Should handle error here', error);
        });

        return d.promise();
    }

    // Deprecated!
    function selectDevice(device, deferred) {
        var _this = this;

        var goAuth = function goAuth(uuid) {
            ProgressActions.close();
            _selectedDevice = {};

            var handleSubmit = function handleSubmit(password) {
                ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, lang.message.authenticating);

                auth(device.uuid, password).done(function (data) {
                    device.plaintext_password = password;
                    selectDevice(device, d);
                }).fail(function (response) {
                    var message = false === response.reachable ? lang.select_printer.unable_to_connect : lang.select_printer.auth_failure;

                    goAuth(device.uuid);

                    AlertActions.showPopupError('device-auth-fail', message);
                });
            };

            var callback = {
                caption: sprintf(lang.input_machine_password.require_password, _device.name),
                inputHeader: lang.input_machine_password.password,
                confirmText: lang.input_machine_password.connect,
                type: InputLightBoxConstants.TYPE_PASSWORD,
                onSubmit: handleSubmit
            };

            InputLightboxActions.open('auth', callback);
        };
        var createDeviceController = function createDeviceController(uuid) {
            var availableUsbChannel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
            var success = arguments[2];

            return DeviceController(device.uuid, {
                availableUsbChannel: availableUsbChannel,
                onConnect: function onConnect(response, options) {
                    d.notify(response);

                    if (response.status.toUpperCase() === DeviceConstants.CONNECTED) {
                        if (options == null || options && !options.dedicated) {
                            ProgressActions.close();
                        }
                        var exist = _devices.some(function (dev) {
                            return dev.uuid === device.uuid;
                        });
                        if (!exist) {
                            _devices.push(device);
                        }
                        success(true);
                    }
                },
                onError: function onError(response) {
                    console.log('createDeviceController onError', response);
                    ProgressActions.close();
                    // TODO: shouldn't do replace
                    response.error = response.error.replace(/^.*\:\s+(\w+)$/g, '$1');
                    switch (response.error.toUpperCase()) {
                        case DeviceConstants.TIMEOUT:
                            // TODO d.reject, come on...
                            d.reject(DeviceConstants.TIMEOUT);
                            break;
                        case DeviceConstants.AUTH_ERROR:
                        case DeviceConstants.AUTH_FAILED:
                            _selectedDevice = {};

                            if (device.password) {
                                goAuth(_device.uuid);
                            } else {
                                ProgressActions.open(ProgressConstants.NONSTOP, sprintf(lang.message.connectingMachine, _device.name));

                                auth(_device.uuid, '').done(function (data) {
                                    selectDevice(device, d);
                                }).fail(function () {
                                    ProgressActions.close();
                                    AlertActions.showPopupError('auth-error-with-diff-computer', lang.message.need_1_1_7_above);
                                });
                            }
                            break;
                        case DeviceConstants.MONITOR_TOO_OLD:
                            AlertActions.showPopupError('fatal-occurred', lang.message.monitor_too_old.content, lang.message.monitor_too_old.caption);
                            break;
                        default:
                            var message = lang.message.unknown_error;

                            if (response.error === 'NOT_FOUND' || response.error === 'DISCONNECTED') {
                                // if connected usb is the usb version of default device
                                // if(device.serial === self.usbProfile.serial) {
                                if (_devices.some(function (d) {
                                    return d.serial === device.serial;
                                })) {
                                    success(false);
                                    return;
                                } else {
                                    message = lang.message.unable_to_find_machine;
                                }
                            }

                            if (response.error === 'UNKNOWN_DEVICE') {
                                message = lang.message.unknown_device;
                            }

                            success(false);
                            AlertActions.showPopupError('unhandle-exception', message);
                    }
                },
                onFatal: function onFatal(response) {
                    console.log('createDeviceController onFatal', response);
                    // process fatal
                    if (!_wasKilled) {
                        _selectedDevice = {};
                        _wasKilled = false;
                    }

                    var removeTimedOutConnection = function removeTimedOutConnection(uuid) {
                        var newConnectedDevice = [];
                        _devices.forEach(function (d) {
                            if (d.uuid != uuid) {
                                newConnectedDevice.push(d);
                            }
                        });
                        _devices = newConnectedDevice;
                    };

                    removeTimedOutConnection(availableUsbChannel);

                    if (response.reason === 'error [\'KICKED\']') {
                        BeamboxActions.resetPreviewButton();
                    }
                }
            });
        };
        var initSocketMaster = function initSocketMaster() {
            if (device && typeof _controllerMap[device.uuid] !== 'undefined') {
                _device.controller = _controllerMap[device.uuid];
                return;
            }

            SocketMaster = new Sm();
            SocketMaster.onTimeout(handleSMTimeout);

            //*******************************************************************
            // just for backup, can be delete if everything is fine
            // if usb not detected but device us using usb
            if (typeof self !== 'undefined' && !_devices.some(function (d) {
                return d.addr === device.addr;
            }) &&
            // self.availableUsbChannel === -1 &&
            device.source === 'h2h') {
                device = getDeviceBySerialFromAvailableList(device.serial, false);
            }
            //********************************************************************/

            // if availableUsbChannel has been defined
            if (typeof self !== 'undefined' && typeof self.availableUsbChannel !== 'undefined' && device.source === 'h2h') {
                _device.controller = createDeviceController(null, _this.availableUsbChannel, function (success) {
                    console.log('_device.controller', _device.controller);
                    console.log('success', success);
                    if (success) {
                        d.resolve(DeviceConstants.CONNECTED);
                    } else {
                        // createDeviceController will auto reject with errors
                    }
                });
            } else {
                _device.controller = createDeviceController(device.uuid, null, function (success) {
                    if (success) {
                        d.resolve(DeviceConstants.CONNECTED);
                    } else {
                        // if default device wifi is not available, we use usb
                        // if(_device.serial === self.usbProfile.serial) {
                        var foundDevice = void 0;
                        _devices.forEach(function (d) {
                            if (d.source === 'h2h' && d.serial === _device.serial) {
                                console.log('found usb version', d);
                                foundDevice = d;
                            }
                        });
                        console.log('foundDevice', foundDevice);
                        if (foundDevice) {
                            foundDevice.uuid = foundDevice.addr;
                            foundDevice.name = foundDevice.nickname;
                            d.resolve(DeviceConstants.CONNECTED, foundDevice);
                        } else {
                            console.log('create device action failed');
                        }
                    }
                });
            }

            _controllerMap[device.uuid] = _device.controller;
            SocketMaster.setWebSocket(_device.controller);
        };

        var d = deferred || $.Deferred();

        if (device) {
            // Match the device from the newest received device list
            var latestDevice = _availableDevices.filter(function (d) {
                return d.serial === device.serial && d.source === device.source;
            }),
                _self = this;

            Object.assign(_selectedDevice, latestDevice[0]);

            if (_existConnection(device.uuid, device.source)) {
                _device = _switchDevice(device.uuid);
                SocketMaster.setWebSocket(_controllerMap[device.uuid]);
                d.resolve(DeviceConstants.CONNECTED);
            } else {
                ProgressActions.open(ProgressConstants.NONSTOP, sprintf(lang.message.connectingMachine, device.name));
                _device = {
                    uuid: device.uuid,
                    source: device.source,
                    name: device.name,
                    serial: device.serial
                };
                delete _controllerMap[device.uuid];
            }

            initSocketMaster();
        }

        return d.promise();
    }

    function auth(uuid, password) {
        ProgressActions.open(ProgressConstants.NONSTOP, lang.message.authenticating);

        var d = $.Deferred(),
            opts = {
            onError: function onError(data) {
                ProgressActions.close();
                d.reject(data);
            },
            onSuccess: function onSuccess(data) {
                ProgressActions.close();
                d.resolve(data);
            },
            onFail: function onFail(data) {
                ProgressActions.close();
                d.reject(data);
            }
        };

        Touch(opts).send(uuid, password);

        return d.promise();
    }

    function reconnectWs() {
        var d = $.Deferred();
        _device.controller = DeviceController(_selectedDevice.uuid, {
            availableUsbChannel: _selectedDevice.source === 'h2h' ? _selectedDevice.addr : -1,
            onConnect: function onConnect(response) {
                d.notify(response);

                if (response.status.toUpperCase() === DeviceConstants.CONNECTED) {
                    d.resolve(DeviceConstants.CONNECTED);
                }
            },
            onError: function onError(response) {
                ProgressActions.close();
                // TODO: shouldn't do replace
                response.error = response.error.replace(/^.*\:\s+(\w+)$/g, '$1');
                switch (response.error.toUpperCase()) {
                    case DeviceConstants.TIMEOUT:
                        d.resolve(DeviceConstants.TIMEOUT);
                        break;
                    case DeviceConstants.AUTH_ERROR:
                    case DeviceConstants.AUTH_FAILED:
                        if (device.password) {
                            goAuth(_device.uuid);
                        } else {
                            ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, lang.message.authenticating);
                            auth(_device.uuid, '').then(function (data) {
                                ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, sprintf(lang.message.connectingMachine, _device.name));
                                selectDevice(device, d);
                            }).fail(function () {
                                ProgressActions.close();
                                AlertActions.showPopupError('auth-error-with-diff-computer', lang.message.need_1_1_7_above);
                            });
                        }
                        break;
                    case DeviceConstants.MONITOR_TOO_OLD:
                        ProgressActions.close();
                        AlertActions.showPopupError('fatal-occurred', lang.message.monitor_too_old.content, lang.message.monitor_too_old.caption);
                        break;
                    default:
                        AlertActions.showPopupError('unhandle-exception', lang.message.unknown_error);
                }
            },
            onFatal: function onFatal(response) {
                // if channel is not available, (opcode -1),
                // default in createDeviceController will catch first
            }
        });

        SocketMaster = new Sm();
        SocketMaster.onTimeout(handleSMTimeout);
        SocketMaster.setWebSocket(_device.controller);
        return d.promise();
    }

    function handleSMTimeout(status) {
        console.log('=== sm timeout: ', status);
    }

    function uploadToDirectory(data, path, fileName) {
        var d = $.Deferred();

        SocketMaster.addTask('upload', data, path, fileName).then(function () {
            d.resolve();
        }).progress(function (progress) {
            d.notify(progress);
        }).fail(function (error) {
            d.reject(error);
        });

        return d.promise();
    }

    function go(data) {
        var d = $.Deferred();
        if (!data || !(data instanceof Blob)) {
            d.resolve(DeviceConstants.READY);
        } else {
            var handleOk = function handleOk() {
                d.resolve();
            };
            var handleProgress = function handleProgress(progress) {
                d.notify(progress);
            };
            var handleError = function handleError(error) {
                d.reject(error);
            };

            SocketMaster.addTask('upload', data).then(function () {
                SocketMaster.addTask('start').then(handleOk).fail(handleError);
            }).progress(handleProgress).fail(handleError);
        }

        return d.promise();
    }

    function goFromFile(path, fileName) {
        var d = $.Deferred();
        SocketMaster.addTask('select', path, fileName).then(function (selectResult) {
            if (selectResult.status.toUpperCase() === DeviceConstants.OK) {
                SocketMaster.addTask('start').then(function (startResult) {
                    d.resolve(startResult);
                }).fail(function (error) {
                    d.reject(error);
                });
            } else {
                d.resolve({ status: 'error' });
            }
        });
        return d.promise();
    }

    function waitTillCompleted() {
        var d = $.Deferred(),
            statusChanged = false;

        var t = setInterval(function () {
            SocketMaster.addTask('report').then(function (r) {
                d.notify(r, t);
                var _r$device_status = r.device_status,
                    st_id = _r$device_status.st_id,
                    error = _r$device_status.error;

                if (st_id === 64) {
                    clearInterval(t);
                    setTimeout(function () {
                        quit().then(function () {
                            d.resolve();
                        }).fail(function () {
                            d.reject('Quit failed');
                        });
                    }, 2000);
                } else if ((st_id === 128 || st_id === 48 || st_id === 36) && error && error.length > 0) {
                    // Error occured
                    clearInterval(t);
                    d.reject(error);
                } else if (st_id === 128) {
                    clearInterval(t);
                    d.reject(error);
                } else if (st_id === 0) {
                    // Resolve if the status was running and some how skipped the completed part
                    if (statusChanged) {
                        clearInterval(t);
                        d.resolve();
                    }
                } else {
                    statusChanged = true;
                }
            });
        }, 2000);

        return d.promise();
    }

    function runMovementTests() {
        var d = $.Deferred();

        fetch(DeviceConstants.MOVEMENT_TEST).then(function (res) {
            return res.blob();
        }).then(function (blob) {
            go(blob).fail(function () {
                // Error while uploading task
                d.reject(['UPLOAD_FAILED']);
            }).then(function () {
                ProgressActions.open(ProgressConstants.NONSTOP, lang.message.runningTests);
                waitTillCompleted().fail(function (error) {
                    // Error while running test
                    d.reject(error);
                }).then(function () {
                    // Completed
                    d.resolve();
                });
            });
        });

        return d.promise();
    }

    function runBeamboxCameraTest() {
        var d = $.Deferred();

        fetch(DeviceConstants.BEAMBOX_CAMERA_TEST).then(function (res) {
            return res.blob();
        }).then(function (blob) {
            go(blob).fail(function () {
                d.reject('UPLOAD_FAILED'); // Error while uploading task
            }).then(function () {
                ProgressActions.open(ProgressConstants.NONSTOP, lang.camera_calibration.drawing_calibration_image);
                waitTillCompleted().fail(function (err) {
                    d.reject(err); // Error while running test
                }).then(function () {
                    d.resolve();
                });
            });
        });

        return d.promise();
    }

    function resume() {
        return SocketMaster.addTask('resume');
    }

    function pause() {
        return SocketMaster.addTask('pause');
    }

    function stop() {
        var d = $.Deferred();
        SocketMaster.addTask('abort').then(function (r) {
            d.resolve(r);
        });
        return d.promise();
    }

    function quit() {
        return SocketMaster.addTask('quit');
    }

    function quitTask(mode) {
        if (typeof mode === 'string') {
            return SocketMaster.addTask('quitTask@' + mode);
        } else {
            return SocketMaster.addTask('quitTask');
        }
    }

    function kick() {
        return SocketMaster.addTask('kick');
    }

    function killSelf() {
        _wasKilled = true;
        var d = $.Deferred();
        _device.controller.killSelf().then(function (response) {
            d.resolve(response);
        }).always(function () {
            reconnectWs();
        });
        return d.promise();
    }

    function ls(path) {
        return SocketMaster.addTask('ls', path);
    }

    function downloadLog(log) {
        return _device.controller.downloadLog(log);
    }

    function fileInfo(path, fileName) {
        return SocketMaster.addTask('fileInfo', path, fileName);
    }

    function deleteFile(path, fileName) {
        var fileNameWithPath = path + '/' + fileName;
        return SocketMaster.addTask('deleteFile', fileNameWithPath);
    }

    function downloadFile(path, fileName) {
        return SocketMaster.addTask('downloadFile', path + '/' + fileName);
    }

    function readyCamera() {
        var d = $.Deferred();
        _device.scanController = ScanController(_device.uuid, {
            availableUsbChannel: this.availableUsbChannel,
            onReady: function onReady() {
                d.resolve('');
            },
            onError: function onError(error) {
                AlertActions.showPopupError('', error);
            }
        });

        return d.promise();
    }

    function changeFilament(type, flexible) {
        _stopChangingFilament = false;
        var d = $.Deferred();

        (async function () {
            await SocketMaster.addTask('enterMaintainMode');

            if (_stopChangingFilament) {
                d.reject({ error: ['CANCEL'] });
                _stopChangingFilamentCallback();
                return;
            }

            await SocketMaster.addTask('maintainHome');

            if (_stopChangingFilament) {
                d.reject({ error: ['CANCEL'] });
                _stopChangingFilamentCallback();
                return;
            }

            await SocketMaster.addTask('changeFilament', type, flexible).progress(function (response) {
                if (_stopChangingFilament) {
                    d.reject({ error: ['CANCEL'] });
                    _stopChangingFilamentCallback();
                } else {
                    d.notify(response);
                }
            });

            if (_stopChangingFilament) {
                d.reject({ error: ['CANCEL'] });
                _stopChangingFilamentCallback();
                return;
            }

            d.resolve();
        })().catch(function (response) {
            return d.reject(response);
        });
        return d.promise();
    }

    function stopChangingFilament() {
        var d = $.Deferred();
        _stopChangingFilamentCallback = function _stopChangingFilamentCallback() {
            d.resolve();
        };
        _stopChangingFilament = true;
        return d.promise();
    }

    function changeFilamentDuringPause(type) {
        var d = $.Deferred();

        var initOperation = function initOperation() {
            return new Promise(function (resolve) {
                SocketMaster.addTask('startToolheadOperation').then(function (r) {
                    resolve(r);
                });
            });
        };

        var waitForTemperature = function waitForTemperature() {
            return new Promise(function (resolve) {
                var fluctuation = 3;
                var t = setInterval(function () {
                    SocketMaster.addTask('report').then(function (r) {
                        d.notify(r, t);
                        var _r$device_status2 = r.device_status,
                            rt = _r$device_status2.rt,
                            tt = _r$device_status2.tt;

                        if (rt[0] && tt[0]) {
                            var current = Math.round(rt[0]),
                                // current temperature rounded
                            target = tt[0]; // goal temperature

                            if (current >= target - fluctuation && // min
                            current <= target + fluctuation // max
                            ) {
                                    clearInterval(t);
                                    resolve();
                                }
                        };
                    });
                }, 3000);
            });
        };

        var startOperation = function startOperation() {
            return new Promise(function (resolve) {
                SocketMaster.addTask('changeFilamentDuringPause', type).always(function (r) {
                    resolve(r);
                });
            });
        };

        var endLoading = function endLoading() {
            return new Promise(function (resolve) {
                SocketMaster.addTask('endLoadingDuringPause').always(function (r) {
                    resolve(r);
                });
            });
        };

        var monitorStatus = function monitorStatus() {
            return new Promise(function (resolve) {
                var t = setInterval(function () {
                    getReport().then(function (r) {
                        r.loading = true;
                        // if button is pressed from the machine, status will change from LOAD_FILAMENT to PAUSE
                        if (r.st_label === 'PAUSED' || r.st_label === 'RESUMING') {
                            clearInterval(t);
                            resolve();
                        } else {
                            d.notify(r, t);
                        }
                    });
                }, 2000);
            });
        };

        var operation = async function operation() {
            await initOperation();
            await waitForTemperature();
            await startOperation();
            await monitorStatus();
            d.resolve();
        };

        operation();

        return d.promise();
    }

    function startToolheadOperation() {
        return SocketMaster.addTask('startToolheadOperation');
    }

    function endToolheadOperation() {
        return SocketMaster.addTask('endToolheadOperation');
    }

    function endLoadingDuringPause() {
        return SocketMaster.addTask('endLoadingDuringPause');
    }

    function detectHead() {
        var d = $.Deferred();

        SocketMaster.addTask('getHeadInfo@maintain').then(function (response) {
            response.module ? d.resolve() : d.reject(response);
        }).fail(function () {
            d.reject();
        });

        return d.promise();
    }

    function maintainMove(args) {
        var d = $.Deferred();

        SocketMaster.addTask('maintainMove', args).then(function (result) {
            if (result.status === 'ok') {
                d.resolve();
            }
        }).fail(function () {
            d.reject();
        });

        return d.promise();
    }

    function maintainCloseFan() {
        console.log('addTask maintainCloseFan');
        return SocketMaster.addTask('maintainCloseFan');
    }

    function enterMaintainMode() {
        return SocketMaster.addTask('enterMaintainMode');
    }

    function endMaintainMode() {
        return SocketMaster.addTask('endMaintainMode');
    }

    function getLaserPower() {
        return SocketMaster.addTask('getLaserPower');
    }

    function getLaserSpeed() {
        return SocketMaster.addTask('getLaserSpeed');
    }

    function setLaserPower(power) {
        return SocketMaster.addTask('setLaserPower', power);
    }

    function setLaserSpeed(speed) {
        return SocketMaster.addTask('setLaserSpeed', speed);
    }

    function reconnect() {
        var d = $.Deferred();
        _devices.some(function (device, i) {
            if (device.uuid === _selectedDevice.uuid) {
                _devices.splice(i, 1);
            }
        });

        killSelf().always(function () {
            selectDevice(_selectedDevice);
        });
        return d.promise();
    }

    function kickChangeFilament() {
        var d = $.Deferred();
        //return result is success always even the USB disconnected on device side.
        //need to be figure it out.
        selectDevice(_selectedDevice).then(function (result) {
            kick();
            d.resolve();
        });
        return d.promise();
    }

    // get functions
    function getReport() {
        // Jim Kang's code below
        var d = $.Deferred();
        var timeout = void 0;

        SocketMaster.addTask('report').then(function (result) {
            // Set timeout
            timeout = setTimeout(function () {
                d.reject({ status: 'fatal', error: ['TIMEOUT'] });
            }, 10 * 1000);

            // Force update st_label for a backend inconsistancy
            var s = result.device_status;
            if (s.st_id === DeviceConstants.status.ABORTED) {
                s.st_label = 'ABORTED';
            }
            d.resolve(s);
        }).fail(function (error) {
            d.reject(error);
        }).always(function () {
            clearTimeout(timeout);
        });
        return d.promise();;
    }

    function getSelectedDevice() {
        // retrieve the whole device information from discover.js
        var foundDevices = _availableDevices.filter(function (d) {
            return d.uuid === _device.uuid;
        });

        return foundDevices.length > 0 ? foundDevices[0] : _device;
    }

    function getPreviewInfo() {
        var d = $.Deferred();
        SocketMaster.addTask('getPreview').then(function (result) {
            d.resolve(result);
        });
        return d.promise();
    }

    function getFirstDevice() {
        return _deviceNameMap[Object.keys(_deviceNameMap)[0]];
    }

    function getDeviceByName(name) {
        return _deviceNameMap[name];
    }

    function updateFirmware(file) {
        return SocketMaster.addTask('fwUpdate', file);
    }

    function updateToolhead(file) {
        return SocketMaster.addTask('toolheadUpdate', file);
    }

    function headInfo() {
        return SocketMaster.addTask('getHeadInfo@maintain');
    }

    function closeConnection() {
        _device.controller.connection.close();
        _removeConnection(_device.uuid);
    }

    function getCloudValidationCode() {
        return SocketMaster.addTask('getCloudValidationCode');
    }

    function enableCloud() {
        return SocketMaster.addTask('enableCloud');
    }

    // Private Functions

    function _existConnection(uuid, source) {
        return _devices.some(function (d) {
            return d.uuid === uuid && d.source === source;
        });
    }

    function _removeConnection(uuid) {
        var index = _devices.findIndex(function (d) {
            return d.uuid === uuid;
        });

        if (-1 < index) {
            _devices.splice(index, 1);
        }
    }

    function _switchDevice(uuid) {
        var index = _devices.findIndex(function (d) {
            return d.uuid === uuid;
        });

        return _devices[index];
    }

    async function connectCamera(device) {
        _device.camera = new Camera();
        await _device.camera.createWs(device);
    }

    async function takeOnePicture() {
        return await _device.camera.oneShot();
    }

    async function streamCamera(device) {
        await this.connectCamera(device);

        // return an instance of RxJS Observable.
        return _device.camera.getLiveStreamSource();
    }

    function disconnectCamera() {
        if (!_device || !_device.camera) {
            return;
        }
        _device.camera.closeWs();
        _device.camera = null;
    }

    async function showOutline(object_height, positions) {
        await SocketMaster.addTask('showOutline', object_height, positions);
    }

    function calibrate(opts) {
        var d = $.Deferred(),
            debug_data = {};

        opts = opts || {};
        opts.forceExtruder = opts.forceExtruder === null ? true : opts.forceExtruder;
        opts.doubleZProbe = opts.doubleZProbe === null ? false : opts.doubleZProbe;
        opts.withoutZProbe = opts.withoutZProbe === null ? false : opts.withoutZProbe;

        var processError = function processError() {
            var resp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            if (typeof resp === 'string') {
                resp = { error: [resp] };
            }
            if (resp.error && resp.error === 'EDGE_CASE') {
                return;
            }
            DeviceErrorHandler.processDeviceMasterResponse(resp);
            AlertActions.showPopupError('device-busy', DeviceErrorHandler.translate(resp.error));
            SocketMaster.addTask('endMaintainMode');
        };

        var step1 = function step1() {
            var _d = $.Deferred();
            SocketMaster.addTask('enterMaintainMode').then(function (response) {
                if (response.status === 'ok') {
                    return SocketMaster.addTask('getHeadInfo@maintain');
                } else {
                    _d.reject(response);
                }
            }).then(function (headResp) {
                if (opts.forceExtruder) {
                    if (headResp.module === null) {
                        return $.Deferred().reject({ module: null, error: ['HEAD_ERROR', 'HEAD_OFFLINE'] });
                    } else if (headResp.module !== 'EXTRUDER') {
                        return $.Deferred().reject({ module: 'LASER', error: ['HEAD_ERROR', 'TYPE_ERROR'] });
                    }
                }
                return SocketMaster.addTask('maintainHome');
            }).then(function (response) {
                response.status === 'ok' ? _d.resolve() : _d.reject();
            }).fail(function (error) {
                _d.reject(error);
            });
            return _d.promise();
        };

        var step2 = function step2() {
            var _d = $.Deferred();
            SocketMaster.addTask(opts.doubleZProbe ? 'calibrateDoubleZProbe@maintain' : opts.withoutZProbe ? 'calibrateWithoutZProbe@maintain' : 'calibrate@maintain').then(function (response) {
                debug_data = response.debug;
                return SocketMaster.addTask('endMaintainMode');
            }).then(function () {
                _d.resolve();
            }).fail(function (error) {
                _d.reject(error);
            });
            return _d.promise();
        };

        step1().then(function () {
            return step2();
        }).then(function () {
            d.resolve(debug_data);
        }).fail(function (error) {
            console.log(error);
            processError(error);
            d.reject(error);
        });

        return d.promise();
    }

    function zprobe(opts) {
        var d = $.Deferred(),
            debug_data = {};

        opts = opts || {};
        opts.forceExtruder = opts.forceExtruder === null ? true : opts.forceExtruder;

        var processError = function processError() {
            var resp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            if (typeof resp === 'string') {
                resp = { error: [resp] };
            }
            if (resp.error && resp.error === 'EDGE_CASE') {
                return;
            }
            DeviceErrorHandler.processDeviceMasterResponse(resp);
            AlertActions.showPopupError('device-busy', DeviceErrorHandler.translate(resp.error));
            SocketMaster.addTask('endMaintainMode');
        };

        var step1 = function step1() {
            var _d = $.Deferred();
            SocketMaster.addTask('enterMaintainMode').then(function (response) {
                if (response.status === 'ok') {
                    return SocketMaster.addTask('getHeadInfo@maintain');
                } else {
                    _d.reject(response);
                }
            }).then(function (headResp) {
                if (opts.forceExtruder) {
                    if (headResp.module === null) {
                        return $.Deferred().reject({ module: null, error: ['HEAD_ERROR', 'HEAD_OFFLINE'] });
                    } else if (headResp.module !== 'EXTRUDER') {
                        return $.Deferred().reject({ module: 'LASER', error: ['HEAD_ERROR', 'TYPE_ERROR'] });
                    }
                }
                return SocketMaster.addTask('maintainHome');
            }).then(function (response) {
                response.status === 'ok' ? _d.resolve() : _d.reject();
            }).fail(function (error) {
                _d.reject(error);
            });
            return _d.promise();
        };

        var step2 = function step2() {
            var _d = $.Deferred();
            SocketMaster.addTask('zprobe@maintain').then(function (response) {
                debug_data = response.debug;
                return SocketMaster.addTask('endMaintainMode');
            }).then(function () {
                _d.resolve();
            }).fail(function (error) {
                _d.reject(error);
            });
            return _d.promise();
        };

        step1().then(function () {
            return step2();
        }).then(function () {
            d.resolve(debug_data);
        }).fail(function (error) {
            console.log(error);
            processError(error);
            d.reject(error);
        });

        return d.promise();
    }

    function home() {
        var d = $.Deferred();

        var processError = function processError() {
            var resp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            DeviceErrorHandler.processDeviceMasterResponse(resp);
            AlertActions.showPopupError('device-busy', DeviceErrorHandler.translate(resp.error));
            SocketMaster.addTask('endMaintainMode');
        };

        var step1 = function step1() {
            var _d = $.Deferred();
            SocketMaster.addTask('enterMaintainMode').then(function (response) {
                if (response.status === 'ok') {
                    return SocketMaster.addTask('maintainHome');
                } else {
                    _d.reject(response);
                }
            }).then(function (response) {
                response.status === 'ok' ? _d.resolve() : _d.reject();
            }).fail(function (error) {
                _d.reject(error);
            });
            return _d.promise();
        };

        step1().then(function () {
            return SocketMaster.addTask('endMaintainMode');
        }).then(function () {
            d.resolve();
        }).fail(function (error) {
            processError(error);
            d.reject(error);
        });

        return d.promise();
    }

    function cleanCalibration() {
        var d = $.Deferred();

        var processError = function processError() {
            var resp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            DeviceErrorHandler.processDeviceMasterResponse(resp);
            AlertActions.showPopupError('device-busy', DeviceErrorHandler.translate(resp.error));
            SocketMaster.addTask('endMaintainMode');
        };

        var step1 = function step1() {
            var _d = $.Deferred();
            SocketMaster.addTask('enterMaintainMode').then(function () {
                return SocketMaster.addTask('maintainHome');
            }).then(function (response) {
                if (response.status === 'ok') {
                    return SocketMaster.addTask('calibrate', true);
                } else {
                    _d.reject(response);
                }
            }).then(function (response) {
                response.status === 'ok' ? _d.resolve() : _d.reject();
            }).fail(function (error) {
                _d.reject(error);
            });
            return _d.promise();
        };

        step1().then(function () {
            return SocketMaster.addTask('endMaintainMode');
        }).then(function () {
            d.resolve();
        }).fail(function (error) {
            processError(error);
            d.reject(error);
        });

        return d.promise();
    }

    function _scanDeviceError(devices) {
        devices.forEach(function (device) {
            if (typeof _errors[device.serial] === 'string') {
                if (_errors[device.serial] !== device.error_label && device.error_label) {
                    if (window.debug) {
                        AlertActions.showError(device.name + ': ' + device.error_label);
                        _errors[device.serial] = device.error_label;
                    }
                } else if (!device.error_label) {
                    _errors[device.serial] = '';
                }
            } else {
                _errors[device.serial] = '';
            }
            if (defaultPrinter) {
                if (defaultPrinter.serial === device.serial) {
                    if (device.st_id === DeviceConstants.status.PAUSED_FROM_RUNNING || device.st_id === DeviceConstants.status.COMPLETED || device.st_id === DeviceConstants.status.ABORTED) {
                        if (!defaultPrinterWarningShowed) {
                            var message = '';
                            if (device.st_id === DeviceConstants.status.COMPLETED) {
                                message = '' + lang.device.completed;
                            } else if (device.st_id === DeviceConstants.status.ABORTED) {
                                message = '' + lang.device.aborted;
                            } else {
                                message = '' + lang.device.pausedFromError;
                                message = device.error_label === '' ? '' : message;
                            }

                            if (device.st_id === DeviceConstants.status.COMPLETED) {
                                AlertActions.showInfo(message, function (growl) {
                                    growl.remove(function () {});
                                    selectDevice(defaultPrinter).then(function () {
                                        GlobalActions.showMonitor(defaultPrinter);
                                    });
                                }, true);
                            } else {
                                if (message !== '') {
                                    AlertActions.showWarning(message, function (growl) {
                                        growl.remove(function () {});
                                        selectDevice(defaultPrinter).then(function () {
                                            GlobalActions.showMonitor(defaultPrinter);
                                        });
                                    }, true);
                                }
                            }

                            defaultPrinterWarningShowed = true;

                            if (Config().read('notification') === '1') {
                                Notification.requestPermission(function (permission) {
                                    if (permission === 'granted') {
                                        var notification = new Notification(device.name, {
                                            icon: 'img/icon-home-s.png',
                                            body: message
                                        });
                                    }
                                });
                            }
                        }
                    } else {
                        if ($('#growls').length > 0) {
                            AlertActions.closeNotification();
                            defaultPrinterWarningShowed = false;
                        }
                    }
                }
            }
        });
    }

    // device names are keys to _deviceNameMap object
    function getDeviceList() {
        return _deviceNameMap;
    }

    // device are stored in array _devices
    function getAvailableDevices() {
        return _availableDevices;
    }

    function getDeviceSetting(name) {
        return SocketMaster.addTask('getDeviceSetting', name);
    }

    function getDeviceSettings(withBacklash, withUpgradeKit, withM666R_MMTest) {
        var d = $.Deferred(),
            settings = {},
            _settings = ['correction', 'filament_detect', 'head_error_level', 'autoresume', 'broadcast', 'enable_cloud'];

        if (withBacklash === true) {
            _settings.push('backlash');
        }

        if (withUpgradeKit) {
            _settings = [].concat(_toConsumableArray(_settings), ['camera_version', 'plus_extrusion', 'player_postback_url']);
        }

        if (withM666R_MMTest) {
            _settings.push('leveling');
            _settings.push('movement_test');
        }

        var worker = /*#__PURE__*/regeneratorRuntime.mark(function worker() {
            var i;
            return regeneratorRuntime.wrap(function worker$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            i = 0;

                        case 1:
                            if (!(i < _settings.length)) {
                                _context.next = 7;
                                break;
                            }

                            _context.next = 4;
                            return SocketMaster.addTask('getDeviceSetting', _settings[i]);

                        case 4:
                            i++;
                            _context.next = 1;
                            break;

                        case 7:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, worker, this);
        });

        var go = function go(result) {
            if (!result.done) {
                result.value.then(function (r) {
                    var key = r.key,
                        value = r.value;

                    settings[key] = value;
                    go(w.next());
                }).fail(function (err) {
                    console.log(err);
                });
            } else {
                d.resolve(settings);
            }
        };

        var w = worker();
        go(w.next());

        return d.promise();
    }

    function setDeviceSetting(name, value) {
        if (value === 'delete') {
            return SocketMaster.addTask('deleteDeviceSetting', name);
        } else {
            return SocketMaster.addTask('setDeviceSetting', name, value);
        }
    }

    function getDeviceInfo() {
        return SocketMaster.addTask('deviceInfo');
    }

    function downloadErrorLog() {
        return _device.controller.downloadErrorLog();
    }

    function setHeadTemperature(temperature) {
        return SocketMaster.addTask('setHeadTemperature', temperature);
    }

    function setHeadTemperatureDuringPause(temperature) {
        return SocketMaster.addTask('setHeadTemperatureDuringPause', temperature);
    }

    function getHeadStatus() {
        return SocketMaster.addTask('getHeadStatus');
    }

    function startMonitoringUsb() {
        var _this2 = this;

        var ws = {},
            requestingReport = void 0,
            deviceInfo = {};

        var createWebSocket = function createWebSocket() {
            var availableUsbChannel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

            if (availableUsbChannel === -1) {
                return;
            }
            var url = 'control/usb/' + availableUsbChannel;
            console.log('createWebSocket', url);

            return SimpleWebsocket(url, handleMessage, handleError);
        };

        var handleMessage = function handleMessage(response) {
            if (response.cmd === 'play report') {
                // specify nickname with usb
                usbDeviceReport = Object.assign(deviceInfo, response.device_status);
                console.log('usbDeviceReport', usbDeviceReport);
                clearTimeout(requestingReport);
                requestingReport = setTimeout(function () {
                    getUsbDeviceReport();
                }, 2000);
            }
        };

        var handleError = function handleError(error) {
            usbDeviceReport = {};
            console.log('handle error', error);
        };

        var getUsbDeviceReport = function getUsbDeviceReport() {
            ws.send('play report');
        };

        var self = this;

        UsbChecker(function (connectedUsbDevices) {
            var newList = [],
                connectedUsbChannels = Object.keys(connectedUsbDevices).filter(function (c) {
                return connectedUsbDevices[c].connected;
            });

            // remove old usb connection
            _devices.forEach(function (d) {
                if (d.source !== 'h2h' || connectedUsbChannels.indexOf(d.addr) !== -1) {
                    newList.push(d);
                }
            });

            _devices = newList;

            // add new usb connection
            connectedUsbChannels.forEach(function (c) {
                _this2.availableUsbChannel = c;
                // if not exist, add
                if (!_devices.some(function (d) {
                    return d.addr === connectedUsbChannels;
                })) {
                    // if profile not exist, we grab from discover
                    // if usb is plugged before FS starts, it'll appear in discover list
                    if (connectedUsbDevices[c].profile) {
                        _devices.push(connectedUsbDevices[c].profile);
                    } else {
                        _availableDevices.forEach(function (ad) {
                            if (ad.source === 'h2h' && ad.addr === c) {
                                _devices.push(ad);
                            }
                        });
                    }
                }
            });

            if (connectedUsbChannels.length == 0) {
                self.availableUsbChannel = -1;
            }

            // to be replaced when redux is implemented
            // notify if usb is unplugged
            if (_device && _device.source === 'h2h') {
                Object.keys(usbEventListeners).forEach(function (id) {
                    usbEventListeners[id](connectedUsbChannels.some(function (c) {
                        return c == _device.uuid;
                    }));
                });
            }
        });
    }

    function getAvailableUsbChannel() {
        return this.availableUsbChannel;
    }

    // id    : string, required,
    // event : function, required, will callback with ture || false
    function registerUsbEvent(id, event) {
        usbEventListeners[id] = event;
    }

    function unregisterUsbEvent(id) {
        delete usbEventListeners[id];
    }

    function getDeviceBySerial(serial, isUsb, callback) {
        var matchedDevice = _availableDevices.filter(function (d) {
            var a = d.serial === serial;
            if (isUsb) {
                a = a && d.source === 'h2h';
            };
            return a;
        });

        if (matchedDevice.length > 0) {
            callback.onSuccess(matchedDevice[0]);
            return;
        }

        if (callback.timeout > 0) {
            setTimeout(function () {
                callback.timeout -= 500;
                getDeviceBySerial(name, isUsb, callback);
            }, 500);
        } else {
            callback.onTimeout();
        }
    }

    function getDeviceBySerialFromAvailableList(serial) {
        var isUsb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var matchedDevice = _availableDevices.filter(function (device) {
            var a = device.serial === serial;
            if (isUsb) {
                a = a && device.source === 'h2h';
            };
            return a;
        });

        return matchedDevice[0];
    }

    function usbDefaultDeviceCheck(device) {
        if (device.source !== 'h2h') {
            return device;
        }

        // if(this.availableUsbChannel !== device.addr) {
        if (!_devices.some(function (d) {
            return d.addr === device.addr;
        })) {
            // get wifi version instead of h2h
            var dev = _availableDevices.filter(function (_dev) {
                return _dev.serial === device.serial;
            });
            if (dev[0]) {
                return dev[0];
            }
        } else {
            return device;
        }
    }

    function existDevice(serial) {
        var found = _availableDevices.filter(function (device) {
            return device.serial === serial;
        });

        return found.length > 0;
    }

    // Core

    function DeviceSingleton() {
        if (_instance !== null) {
            throw new Error('Cannot instantiate more than one DeviceSingleton, use DeviceSingleton.get_instance()');
        }

        this.init();
    }

    DeviceSingleton.prototype = {
        init: function init() {
            this.calibrate = calibrate;
            this.changeFilament = changeFilament;
            this.changeFilamentDuringPause = changeFilamentDuringPause;
            this.cleanCalibration = cleanCalibration;
            this.closeConnection = closeConnection;
            this.connectCamera = connectCamera;
            this.deleteFile = deleteFile;
            this.detectHead = detectHead;
            this.disconnectCamera = disconnectCamera;
            this.downloadErrorLog = downloadErrorLog;
            this.downloadFile = downloadFile;
            this.downloadLog = downloadLog;
            this.enableCloud = enableCloud;
            this.endLoadingDuringPause = endLoadingDuringPause;
            this.endMaintainMode = endMaintainMode;
            this.endToolheadOperation = endToolheadOperation;
            this.enterMaintainMode = enterMaintainMode;
            this.existDevice = existDevice;
            this.fileInfo = fileInfo;
            this.getAvailableDevices = getAvailableDevices;
            this.getAvailableUsbChannel = getAvailableUsbChannel;
            this.getCloudValidationCode = getCloudValidationCode;
            this.getDeviceByName = getDeviceByName;
            this.getDeviceBySerial = getDeviceBySerial;
            this.getDeviceInfo = getDeviceInfo;
            this.getDeviceList = getDeviceList;
            this.getDeviceSetting = getDeviceSetting;
            this.getDeviceSettings = getDeviceSettings;
            this.getFirstDevice = getFirstDevice;
            this.getHeadStatus = getHeadStatus;
            this.getLaserPower = getLaserPower;
            this.getLaserSpeed = getLaserSpeed;
            this.getPreviewInfo = getPreviewInfo;
            this.getReport = getReport;
            this.getSelectedDevice = getSelectedDevice;
            this.go = go;
            this.goFromFile = goFromFile;
            this.headInfo = headInfo;
            this.home = home;
            this.kick = kick;
            this.kickChangeFilament = kickChangeFilament;
            this.killSelf = killSelf;
            this.ls = ls;
            this.maintainCloseFan = maintainCloseFan;
            this.maintainMove = maintainMove;
            this.pause = pause;
            this.quit = quit;
            this.quitTask = quitTask;
            this.readyCamera = readyCamera;
            this.reconnect = reconnect;
            this.registerUsbEvent = registerUsbEvent;
            this.resume = resume;
            this.runBeamboxCameraTest = runBeamboxCameraTest;
            this.runMovementTests = runMovementTests;
            this.select = select;
            this.selectDevice = selectDevice;
            this.setDeviceSetting = setDeviceSetting;
            this.setHeadTemperature = setHeadTemperature;
            this.setHeadTemperatureDuringPause = setHeadTemperatureDuringPause;
            this.setLaserPower = setLaserPower;
            this.setLaserSpeed = setLaserSpeed;
            this.showOutline = showOutline;
            this.startMonitoringUsb = startMonitoringUsb;
            this.startToolheadOperation = startToolheadOperation;
            this.stop = stop;
            this.stopChangingFilament = stopChangingFilament;
            this.streamCamera = streamCamera;
            this.takeOnePicture = takeOnePicture;
            this.unregisterUsbEvent = unregisterUsbEvent;
            this.updateFirmware = updateFirmware;
            this.updateToolhead = updateToolhead;
            this.uploadToDirectory = uploadToDirectory;
            this.usbDefaultDeviceCheck = usbDefaultDeviceCheck;
            this.zprobe = zprobe;

            Discover('device-master', function (devices) {
                devices = DeviceList(devices);
                devices.forEach(function (d) {
                    _deviceNameMap[d.name] = d;
                });
                _availableDevices = devices;
                _scanDeviceError(devices);
            });
        }
    };

    DeviceSingleton.get_instance = function () {
        if (_instance === null) {
            _instance = new DeviceSingleton();
        }
        defaultPrinter = Config().read('default-printer');
        return _instance;
    };

    return DeviceSingleton.get_instance();
});