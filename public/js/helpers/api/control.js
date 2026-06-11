'use strict';

/**
 * API control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-control
 */
define(['jquery', 'helpers/i18n', 'helpers/websocket', 'helpers/convertToTypedArray', 'app/constants/device-constants', 'helpers/rsa-key', 'app/actions/alert-actions', 'app/actions/progress-actions'], function ($, i18n, Websocket, convertToTypedArray, DeviceConstants, rsaKey, AlertActions, ProgressActions) {
    'use strict';

    return function (uuid, opts) {
        opts = opts || {};
        opts.onError = opts.onError || function () {};
        opts.onConnect = opts.onConnect || function () {};

        var timeout = 12 * 1000,
            timer = void 0,
            isConnected = false,
            lang = i18n.get(),
            ws = void 0,
            dedicatedWs = [],
            fileInfoWsId = 0,
            events = {
            onMessage: function onMessage() {},
            onError: opts.onError
        },
            isTimeout = function isTimeout() {
            var error = {
                'status': 'error',
                'error': 'TIMEOUT',
                'info': 'connection timeoout'
            };
            opts.onError(error);
        };

        var createWs = function createWs(wsOptions) {
            var url = opts.availableUsbChannel >= 0 && opts.availableUsbChannel !== null ? 'usb/' + opts.availableUsbChannel : uuid.length < 3 ? 'usb/' + uuid : uuid;
            var _ws = new Websocket({
                method: 'control/' + url,
                onMessage: function onMessage(data) {
                    switch (data.status) {
                        case 'connecting':
                            opts.onConnect(data);
                            clearTimeout(timer);
                            timer = setTimeout(isTimeout, timeout);
                            break;
                        case 'connected':
                            clearTimeout(timer);
                            createDedicatedWs(fileInfoWsId);
                            opts.onConnect(data, wsOptions);
                            break;
                        default:
                            isConnected = true;
                            events.onMessage(data);
                            break;
                    }
                },
                onDebug: function onDebug(response) {
                    if (events.onDebug) {
                        events.onDebug(response);
                    }
                },
                onError: function onError(response) {
                    clearTimeout(timer);
                    events.onError(response);
                },
                onFatal: function onFatal(response) {
                    clearTimeout(timer);
                    if (response.error === 'REMOTE_IDENTIFY_ERROR') {
                        setTimeout(function () {
                            createWs();
                        }, 3 * 1000);
                    } else if (response.error === 'UNKNOWN_DEVICE') {
                        ProgressActions.close();
                        AlertActions.showPopupError('unhandle-exception', lang.message.unknown_device);
                    } else if (response.error === 'NOT_FOUND' || response.error === 'DISCONNECTED') {
                        opts.onError(response);
                    } else if (response.code === 1006) {
                        ProgressActions.close();
                        AlertActions.showPopupError('NO-CONNECTION', lang.message.cant_connect_to_device);
                        opts.onFatal(response);
                    } else {
                        clearTimeout(timer);
                        events.onError(response);
                    }
                },
                onClose: function onClose(response) {
                    clearTimeout(timer);
                    isConnected = false;
                    opts.onFatal(response);
                },
                onOpen: function onOpen() {
                    _ws.send(rsaKey());
                },
                autoReconnect: false
            });

            return _ws;
        };

        // id is int
        var createDedicatedWs = function createDedicatedWs(id) {
            if (!dedicatedWs[id]) {
                dedicatedWs[id] = createWs({ dedicated: true });
            }
            return dedicatedWs[id];
        };

        var useDefaultResponse = function useDefaultResponse(command) {
            var d = $.Deferred();

            events.onMessage = function (response) {
                d.resolve(response);
            };
            events.onError = function (response) {
                d.reject(response);
            };
            events.onFatal = function (response) {
                d.reject(response);
            };

            ws.send(command);
            return d.promise();
        };

        var prepareUpload = function prepareUpload(d, data) {
            var CHUNK_PKG_SIZE = 4096;
            var length = data.length || data.size,
                step = 0;

            events.onMessage = function (response) {
                if ('continue' === response.status) {
                    for (var i = 0; i < length; i += CHUNK_PKG_SIZE) {
                        var chunk = data.slice(i, i + CHUNK_PKG_SIZE);
                        step++;
                        ws.send(chunk);
                    }
                } else if (response.status === 'uploading') {
                    d.notify({ step: response.sent, total: data.size });
                } else if (response.status === 'ok') {
                    d.resolve();
                } else if (response.status === 'error') {
                    d.reject(response);
                }
            };

            events.onError = function (response) {
                d.reject(response);
            };
            events.onFatal = function (response) {
                d.reject(response);
            };
        };

        ws = createWs();

        var ctrl = {
            connection: ws,
            mode: '',
            ls: function ls(path) {
                var d = $.Deferred();
                events.onMessage = function (response) {
                    switch (response.status) {
                        case 'ok':
                            d.resolve(response);
                            break;
                        case 'connected':
                        default:
                            break;
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.reject(response);
                };

                ws.send('file ls ' + path);
                return d.promise();
            },

            fileInfo: function fileInfo(path, fileName) {
                var d = $.Deferred(),
                    data = [],
                    _ws = void 0;

                data.push(fileName);
                _ws = createDedicatedWs(fileInfoWsId);

                events.onMessage = function (response) {
                    data.push(response);
                    if (response.status === 'ok') {
                        d.resolve(data);
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.reject(response);
                };

                _ws.send('file fileinfo ' + path + '/' + fileName);
                return d.promise();
            },

            report: function report() {
                var d = $.Deferred(),
                    counter = 0;

                events.onMessage = function (response) {
                    if (response.status === 'ok') {
                        counter = 0;
                        d.resolve(response);
                    } else {
                        // 3 consecutive error should alert restart machine
                        if (counter >= 3) {
                            d.reject(response);
                        } else {
                            counter++;
                            console.log('retry report');
                            ws.send('play report');
                        }
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.reject(response);
                };

                setTimeout(function () {
                    d.reject({ status: "Timeout" });
                }, 3000);
                ws.send('play report');
                return d.promise();
            },

            // upload: function(filesize, print_data) {
            upload: function upload(data, path, fileName) {
                var d = $.Deferred();

                prepareUpload(d, data);

                if (path && fileName) {
                    fileName = fileName.replace(/ /g, '_');
                    var ext = fileName.split('.');
                    if (ext[ext.length - 1] === 'fc') {
                        ws.send('upload application/fcode ' + data.size + ' ' + path + '/' + fileName);
                    } else if (ext[ext.length - 1] === 'gcode') {
                        fileName = fileName.split('.');
                        fileName.pop();
                        fileName.push('fc');
                        fileName = fileName.join('.');
                        ws.send('upload text/gcode ' + data.size + ' ' + path + '/' + fileName);
                    }
                } else {
                    ws.send('file upload application/fcode ' + data.size);
                }
                return d.promise();
            },

            abort: function abort() {
                var d = $.Deferred(),
                    counter = 0;

                var retryLength = 2000;

                var isAborted = function isAborted(response) {
                    response.device_status = response.device_status || {};
                    return response.device_status.st_id === 128 || response.device_status === 0;
                };

                var retry = function retry(needsQuit) {
                    counter++;
                    setTimeout(function () {
                        needsQuit ? ws.send('play abort') : ws.send('play report');
                    }, retryLength);
                };

                events.onMessage = function (response) {
                    if (counter >= 3) {
                        console.log('tried 3 times');
                        if (response.cmd === 'play report') {
                            switch (response.device_status.st_id) {
                                case 0:
                                    d.resolve();
                                    break;
                                case 64:
                                    ws.send('play quit');
                                    break;
                            }
                        }

                        d.reject(response);
                    }
                    isAborted(response) ? d.resolve() : retry(response.status !== 'ok');
                };
                events.onError = function (response) {
                    counter >= 3 ? d.reject(response) : retry();
                };
                events.onFatal = function (response) {
                    counter >= 3 ? d.reject(response) : retry();
                };

                ws.send('play abort');
                return d.promise();
            },

            start: function start() {
                return useDefaultResponse('play start');
            },

            pause: function pause() {
                return useDefaultResponse('play pause');
            },

            resume: function resume() {
                return useDefaultResponse('play resume');
            },

            kick: function kick() {
                return useDefaultResponse('kick');
            },

            quitTask: function quitTask() {
                ctrl.mode = '';
                return useDefaultResponse('task quit');
            },

            quit: function quit() {
                var d = $.Deferred(),
                    counter = 0;

                var retryLength = 2000;

                var isIdle = function isIdle(response) {
                    response.device_status = response.device_status || {};
                    return response.device_status.st_id === 0;
                };

                var retry = function retry(needsQuit) {
                    counter++;
                    setTimeout(function () {
                        needsQuit ? ws.send('play quit') : ws.send('play report');
                    }, retryLength);
                };

                events.onMessage = function (response) {
                    isIdle(response) ? d.resolve() : retry(response.status !== 'ok');
                };
                events.onError = function (response) {
                    counter >= 3 ? d.reject(response) : retry();
                };
                events.onFatal = function (response) {
                    counter >= 3 ? d.reject(response) : retry();
                };

                ws.send('play quit');
                return d.promise();
            },

            killSelf: function killSelf() {
                var d = $.Deferred();
                dedicatedWs[fileInfoWsId].send('kick');
                dedicatedWs[fileInfoWsId].close();
                ws.send('kick');
                ws.close();
                setInterval(function () {
                    d.resolve();
                }, 500);
                return d.promise();
            },

            deviceInfo: function deviceInfo() {
                return useDefaultResponse('deviceinfo');
            },

            getPreview: function getPreview() {
                var d = $.Deferred(),
                    data = [];

                events.onMessage = function (response) {
                    if (response.status === 'ok') {
                        data.push(response);
                        d.resolve(data);
                    } else {
                        data.push(response);
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.resolve(response);
                };

                ws.send('play info');
                return d.promise();
            },

            select: function select(path, fileName) {
                return useDefaultResponse(fileName === '' ? 'play select ' + path.join('/') : 'play select ' + path + '/' + fileName);
            },

            deleteFile: function deleteFile(fileNameWithPath) {
                return useDefaultResponse('file rmfile ' + fileNameWithPath);
            },

            downloadFile: function downloadFile(fileNameWithPath) {
                var d = $.Deferred(),
                    file = [];

                events.onMessage = function (response) {
                    if (response.status === 'continue') {
                        d.notify(response);
                    } else {
                        file.push(response);
                    }

                    if (response instanceof Blob) {
                        d.resolve(file);
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.resolve(response);
                };

                ws.send('file download ' + fileNameWithPath);
                return d.promise();
            },

            downloadLog: function downloadLog(log) {
                var d = $.Deferred(),
                    file = [];

                events.onMessage = function (response) {
                    if (response.status === 'transfer') {
                        d.notify(response);
                    } else if (!~Object.keys(response).indexOf('completed')) {
                        file.push(response);
                    }

                    if (response instanceof Blob) {
                        d.resolve(file);
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.resolve(response);
                };

                ws.send('fetch_log ' + log);
                return d;
            },

            downloadErrorLog: function downloadErrorLog() {
                var d = $.Deferred(),
                    file = [];

                events.onMessage = function (response) {
                    if (!~Object.keys(response).indexOf('completed')) {
                        file.push(response);
                    }

                    if (response instanceof Blob) {
                        d.resolve(file);
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.resolve(response);
                };

                ws.send('fetch_log fluxcloudd.log');
                return d.promise();
            },

            calibrate: function calibrate(clean, doubleZProbe, withoutZProbe) {
                var d = $.Deferred(),
                    errorCount = 0,
                    temp = { debug: [] },
                    doubleZProbeDone = false;

                events.onMessage = function (response) {
                    if (response.status === 'ok') {
                        if (withoutZProbe) {
                            response.debug = temp.debug;
                            d.resolve(response);
                        } else if (response.data.length > 1) {
                            ws.send('maintain zprobe');
                        } else {
                            if (doubleZProbe && !doubleZProbeDone) {
                                doubleZProbeDone = true;
                                ws.send('maintain zprobe');
                                return;
                            }

                            response.debug = temp.debug;
                            d.resolve(response);
                        }
                    } else if (response.status === 'operating') {
                        temp.operation_info = response;
                        d.notify(response);
                    }
                };

                events.onDebug = function (response) {
                    if (response.log) {
                        if (temp.operation_info) {
                            if (typeof temp.operation_info.pos !== 'undefined') {
                                response.log += ' POS ' + temp.operation_info.pos;
                            } else {
                                response.log += ' Z';
                            }
                        }
                        temp.debug.push(response.log);
                    }
                };

                events.onError = function (response) {
                    if (response.status === 'error') {
                        if (errorCount === 0 && response.error[0] === 'HEAD_ERROR') {
                            setTimeout(function () {
                                errorCount++;
                                if (clean === true) {
                                    ws.send('maintain calibrating clean');
                                } else {
                                    ws.send('maintain calibrating');
                                }
                            }, 500);
                        } else {
                            d.reject(response);
                        }
                    } else {
                        d.reject(response);
                    }
                };
                events.onFatal = function (response) {
                    d.resolve(response);
                };

                var cmd = 'maintain calibrating' + (clean ? ' clean' : '');
                ws.send(cmd);
                return d.promise();
            },

            getLaserPower: function getLaserPower() {
                var d = $.Deferred();

                events.onMessage = function (response) {
                    switch (response.status) {
                        case 'ok':
                            d.resolve(response);
                            break;
                        default:
                            console.log('strange message', response);
                            break;
                    }
                };

                events.onError = function (response) {
                    d.reject(response);console.log('on error', response);
                };
                events.onFatal = function (response) {
                    d.reject(response);console.log('on fatal', response);
                };

                ws.send('play get_laser_power');
                return d.promise();
            },

            getLaserSpeed: function getLaserSpeed() {
                var d = $.Deferred();

                events.onMessage = function (response) {
                    switch (response.status) {
                        case 'ok':
                            d.resolve(response);
                            break;
                        default:
                            console.log('strange message', response);
                            break;
                    }
                };

                events.onError = function (response) {
                    d.reject(response);console.log('on error', response);
                };
                events.onFatal = function (response) {
                    d.reject(response);console.log('on fatal', response);
                };

                ws.send('play get_laser_speed');
                return d.promise();
            },

            setLaserPower: function setLaserPower(power) {
                var d = $.Deferred();

                events.onMessage = function (response) {
                    switch (response.status) {
                        case 'ok':
                            d.resolve(response);
                            break;
                        default:
                            console.log('strange message', response);
                            break;
                    }
                };

                events.onError = function (response) {
                    d.reject(response);console.log('on error', response);
                };
                events.onFatal = function (response) {
                    d.reject(response);console.log('on fatal', response);
                };

                ws.send('play set_laser_power ' + power);
                return d.promise();
            },

            setLaserSpeed: function setLaserSpeed(speed) {
                var d = $.Deferred();

                events.onMessage = function (response) {
                    switch (response.status) {
                        case 'ok':
                            d.resolve(response);
                            break;
                        default:
                            console.log('strange message', response);
                            break;
                    }
                };

                events.onError = function (response) {
                    d.reject(response);console.log('on error', response);
                };
                events.onFatal = function (response) {
                    d.reject(response);console.log('on fatal', response);
                };

                ws.send('play set_laser_speed ' + speed);
                return d.promise();
            },

            zprobe: function zprobe() {
                var d = $.Deferred(),
                    errorCount = 0,
                    temp = { debug: [] };

                events.onMessage = function (response) {
                    if (response.status === 'ok') {
                        response.debug = temp.debug;
                        d.resolve(response);
                    } else if (response.status === 'operating') {
                        temp.operation_info = response;
                        d.notify(response);
                    }
                };

                events.onDebug = function (response) {
                    if (response.log) {
                        if (temp.operation_info) {
                            if (typeof temp.operation_info.pos !== 'undefined') {
                                response.log += ' POS ' + temp.operation_info.pos;
                            } else {
                                response.log += ' Z';
                            }
                        }
                        temp.debug.push(response.log);
                    }
                };

                events.onError = function (response) {
                    if (response.status === 'error') {
                        if (errorCount === 0 && response.error[0] === 'HEAD_ERROR') {
                            setTimeout(function () {
                                errorCount++;
                                ws.send('maintain zprobe');
                            }, 500);
                        } else {
                            d.reject(response);
                        }
                    } else {
                        d.reject(response);
                    }
                };
                events.onFatal = function (response) {
                    d.reject(response);
                };
                ws.send('maintain zprobe');
                return d.promise();
            },

            getHeadInfo: function getHeadInfo() {
                return useDefaultResponse('maintain headinfo');
            },

            getDeviceSetting: function getDeviceSetting(name) {
                return useDefaultResponse('config get ' + name);
            },

            setDeviceSetting: function setDeviceSetting(name, value) {
                return useDefaultResponse('config set ' + name + ' ' + value);
            },

            deleteDeviceSetting: function deleteDeviceSetting(name) {
                return useDefaultResponse('config del ' + name);
            },

            getCloudValidationCode: function getCloudValidationCode() {
                return useDefaultResponse('cloud_validate_code');
            },

            enableCloud: function enableCloud() {
                return useDefaultResponse('config set enable_cloud A');
            },

            /**
             * enter maintain mode
             * @param {Int} timeout - timeout (ms)
             *
             * @return {Promise}
             */
            enterMaintainMode: function enterMaintainMode() {
                var d = $.Deferred();

                events.onMessage = function (response) {
                    setTimeout(function () {
                        ctrl.mode = 'maintain';
                        d.resolve(response);
                    }, 3000);
                };
                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.reject(response);
                };

                ws.send('task maintain');
                return d.promise();
            },

            showOutline: function showOutline(object_height, positions) {
                var frames = '';
                positions.forEach(function (position) {
                    var frame = [position.first, position.second, position.third, position.fourth];
                    frames += JSON.stringify(frame) + ' ';
                });

                return useDefaultResponse('laser show_outline ' + object_height + ' ' + frames);
            },

            maintainMove: function maintainMove(args) {
                var command = '';
                args.f = args.f || '6000';
                command += ' f:' + args.f;
                if (typeof args.x !== 'undefined') {
                    command += ' x:' + args.x;
                };
                if (typeof args.y !== 'undefined') {
                    command += ' y:' + args.y;
                };
                if (typeof args.z !== 'undefined') {
                    command += ' z:' + args.z;
                };
                return useDefaultResponse('maintain move' + command);
            },

            maintainCloseFan: function maintainCloseFan() {
                return useDefaultResponse('maintain close_fan');
            },

            endMaintainMode: function endMaintainMode() {
                ctrl.mode = '';
                return useDefaultResponse('task quit');
            },

            startToolheadOperation: function startToolheadOperation() {
                return useDefaultResponse('play toolhead operation');
            },

            endToolheadOperation: function endToolheadOperation() {
                return useDefaultResponse('play toolhead standby');
            },

            endLoadingDuringPause: function endLoadingDuringPause() {
                return useDefaultResponse('play press_button');
            },

            setHeadTemperatureDuringPause: function setHeadTemperatureDuringPause(temperature) {
                return useDefaultResponse('play toolhead heater 0 ' + temperature);
            },

            /**
             * maintain home
             *
             * @return {Promise}
             */
            maintainHome: function maintainHome() {
                return useDefaultResponse('maintain home');
            },

            /**
             * change filament
             * @param {String} type - [LOAD|UNLOAD]
             *
             * @return {Promise}
             */
            changeFilament: function changeFilament(type, flexible) {
                var d = $.Deferred(),
                    timeout = void 0;

                var getType = function getType(t) {
                    if (flexible) return 'load_flexible_filament';
                    return t === DeviceConstants.LOAD_FILAMENT ? 'load_filament' : 'unload_filament';
                };

                events.onMessage = function (response) {

                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        response = {
                            stage: ["DISCONNECTED", "DISCONNECTED"],
                            status: "error",
                            error: ["DISCONNECTED", ""]
                        };
                        d.notify(response);
                    }, 10 * 500);

                    response.status !== 'ok' ? d.notify(response) : d.resolve(response);
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.reject(response);
                };

                setTimeout(function () {
                    ws.send('maintain ' + getType(type) + ' 0 220');
                }, 3000);

                return d.promise();
            },

            changeFilamentDuringPause: function changeFilamentDuringPause(type) {
                var cmd = type === 'LOAD' ? 'load_filament' : 'unload_filament';
                return useDefaultResponse('play ' + cmd + ' 0');
            },

            setHeadTemperature: function setHeadTemperature(temperature) {
                return useDefaultResponse('maintain set_heater 0 ' + temperature);
            },

            getHeadStatus: function getHeadStatus() {
                return useDefaultResponse('maintain headstatus');
            },

            /**
             * update firmware
             * @param {File} file - file
             */
            fwUpdate: function fwUpdate(file) {
                var d = $.Deferred(),
                    blob = new Blob([file], { type: 'binary/flux-firmware' });

                events.onMessage = function (response) {
                    switch (response.status) {
                        case 'ok':
                            d.resolve(response);
                            break;
                        case 'continue':
                            d.notify(response);
                            ws.send(blob);
                            break;
                        case 'uploading':
                            response.percentage = (response.sent || 0) / blob.size * 100;
                            d.notify(response);
                            break;
                        default:
                            d.reject(response);
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.reject(response);
                };

                ws.send('update_fw binary/flux-firmware ' + blob.size);

                return d.promise();
            },

            /**
             * update toolhead firmware - device should in `Maintain mode`
             * @param {File} file - file
             */
            toolheadUpdate: function toolheadUpdate(file) {
                var d = $.Deferred(),
                    mimeType = 'binary/flux-firmware',
                    blob = new Blob([file], { type: mimeType }),
                    args = ['maintain', 'update_hbfw', 'binary/fireware', blob.size];

                events.onMessage = function (response) {
                    switch (response.status) {
                        case 'ok':
                            d.resolve(response);
                            break;
                        case 'continue':
                            d.notify(response);
                            ws.send(blob);
                            break;
                        case 'operating':
                        case 'uploading':
                        case 'update_hbfw':
                            response.percentage = (response.written || 0) / blob.size * 100;
                            d.notify(response);
                            break;
                        default:
                            d.reject(response);
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.reject(response);
                };

                ws.send(args.join(' '));
                return d.promise();
            }
        };

        ctrl.maintainClean = function () {
            return ctrl.calibrate(true);
        };

        ctrl.calibrateDoubleZProbe = function () {
            return ctrl.calibrate(true, true);
        };

        ctrl.calibrateWithoutZProbe = function () {
            return ctrl.calibrate(true, false, true);
        };

        return ctrl;
    };
});