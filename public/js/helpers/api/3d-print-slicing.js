'use strict';

/**
 * API slicing
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-slicing
 */
define(['helpers/websocket', 'helpers/convertToTypedArray', 'helpers/is-json'], function (Websocket, convertToTypedArray, isJSON) {
    'use strict';

    return function (opts) {

        opts = opts || {};
        opts.onError = opts.onError || function () {};

        var ws = new Websocket({

            method: '3dprint-slicing',

            onMessage: function onMessage(data) {
                events.onMessage(data);
                lastMessage = data;
            },

            onError: function onError(data) {
                events.onError(data);
                lastMessage = data;
            },

            onFatal: function onFatal(data) {
                events.onFatal(data);
                lastMessage = data;
            },

            onClose: function onClose(message) {
                lastMessage = message;
            }
        }),
            lastMessage = '',
            events = {
            onMessage: function onMessage() {},
            onError: function onError() {}
        };

        var slicingApi = {

            connection: ws,
            upload: function upload(name, file, ext) {
                var d = $.Deferred();

                var progress = void 0,
                    currentProgress = void 0;

                var CHUNK_PKG_SIZE = 4096;
                var nth = 5;

                events.onMessage = function (result) {
                    switch (result.status) {

                        case 'ok':
                            d.resolve(result);
                            break;

                        case 'continue':
                            var fileReader = void 0,
                                chunk = void 0,
                                length = file.length || file.size;

                            var step = 0,
                                total = parseInt((file.length || file.size) / CHUNK_PKG_SIZE);

                            for (var i = 0; i < length; i += CHUNK_PKG_SIZE) {
                                step++;
                                currentProgress = parseInt((step - step % (total / nth)) / total * 100);
                                if (currentProgress !== progress) {
                                    progress = currentProgress;
                                    d.notify(step++, total, progress);
                                }

                                chunk = file.slice(i, i + CHUNK_PKG_SIZE);

                                if (file instanceof Array) {
                                    chunk = convertToTypedArray(chunk, Uint8Array);
                                }

                                fileReader = new FileReader();

                                fileReader.onloadend = function (e) {
                                    ws.send(e.target.result);
                                };

                                fileReader.readAsArrayBuffer(chunk);
                            }
                            break;

                        case 'error':
                            d.reject(result);
                            break;

                        default:
                            // TODO: do something?
                            break;
                    }
                };

                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                ext = ext === 'obj' ? ' ' + ext : '';
                ws.send('upload ' + name + ' ' + file.size + ext);

                return d.promise();
            },

            upload_via_path: function upload_via_path(name, file, ext, fileUrl) {

                var d = $.Deferred();

                events.onMessage = function (result) {
                    switch (result.status) {

                        case 'ok':
                            d.resolve(result);
                            break;

                        case 'continue':
                            break;

                        case 'error':
                            d.reject(result);
                            break;

                        default:
                            // TODO: do something?
                            break;
                    }
                };

                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                fileUrl = encodeURI(fileUrl);
                ext = ext === 'obj' ? ' ' + ext : '';
                ws.send('load_stl_from_path ' + name + ' ' + fileUrl + ext);

                return d.promise();
            },

            set: function set(name, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ) {

                var d = $.Deferred();

                events.onMessage = function (result) {
                    d.resolve(result);
                };
                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                var args = [name, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ];
                ws.send('set ' + args.join(' '));

                return d.promise();
            },

            delete: function _delete(name) {

                var d = $.Deferred();

                events.onMessage = function (result) {
                    d.resolve(result);
                };
                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                ws.send('delete ' + name);
                return d.promise();
            },

            // need revisit
            goF: function goF(nameArray) {

                var d = $.Deferred();

                events.onMessage = function (result) {
                    d.resolve(result);
                };
                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                ws.send('go ' + nameArray.join(' ') + ' -f');
                return d.promise();
            },

            beginSlicing: function beginSlicing(nameArray, type) {

                var d = $.Deferred();

                type = type || 'f';

                events.onMessage = function (result) {
                    d.resolve(result);
                };
                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                ws.send('begin_slicing ' + nameArray.join(' ') + ' -' + type);
                return d.promise();
            },

            reportSlicing: function reportSlicing() {

                var d = $.Deferred();

                var progress = [];

                events.onMessage = function (result) {
                    if (result.status === 'ok') {
                        if (progress.length > 0) {
                            // only care about the last progress
                            var lastProgress = progress.pop();
                            progress.length = 0;
                            d.resolve(lastProgress);
                        } else {
                            d.resolve();
                        }
                    } else {
                        progress.push(result);
                    }
                };

                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                ws.send('report_slicing');
                return d.promise();
            },

            getSlicingResult: function getSlicingResult() {

                var d = $.Deferred();

                events.onMessage = function (result) {
                    if (result instanceof Blob) {
                        d.resolve(result);
                    }
                };

                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                ws.send('get_result');
                return d.promise();
            },

            stopSlicing: function stopSlicing() {

                var d = $.Deferred();

                events.onMessage = function (result) {
                    d.resolve(result);
                };
                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };
                ws.send('end_slicing');
                return d.promise();
            },

            setParameters: function setParameters(keyValueObject) {
                var d = $.Deferred();

                var keyValue = Object.keys(keyValueObject).map(function (o) {
                    return o + ' = ' + keyValueObject[o];
                });

                events.onMessage = function (result) {
                    d.resolve(result);
                };
                events.onError = function (error) {
                    d.resolve(error);
                };
                events.onFatal = function (error) {
                    d.resolve(error);
                };

                ws.send('advanced_setting ' + keyValue.join('\n'));

                return d.promise();
            },

            setParameter: function setParameter(name, value) {
                var d = $.Deferred();

                var errors = [];

                events.onMessage = function (result) {
                    d.resolve(result, errors);
                };
                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                if (name === 'advancedSettings' && value !== '') {
                    ws.send('advanced_setting ' + value);
                } else if (name === 'advancedSettingsCura2' && value !== '') {
                    ws.send('advanced_setting # slicer = cura2\n' + value);
                    //ws.send(`advanced_setting raft = 1`);
                    // console.error("Not yet implement Cura2");
                } else if (name !== 'advancedSettings') {
                    ws.send('advanced_setting ' + name + ' = ' + value);
                }

                return d.promise();
            },

            getPath: function getPath() {

                var d = $.Deferred();

                events.onMessage = function (result) {
                    d.resolve(result);
                };
                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                ws.send('get_path');
                return d.promise();
            },

            uploadPreviewImage: function uploadPreviewImage(file) {

                var d = $.Deferred();

                events.onMessage = function (result) {
                    switch (result.status) {

                        case 'ok':
                            d.resolve(result);
                            break;

                        case 'continue':
                            ws.send(file);
                            break;

                        default:
                            // TODO: do something?
                            break;
                    }
                };

                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                ws.send('upload_image ' + file.size); // + file.size);
                return d.promise();
            },

            duplicate: function duplicate(oldName, newName) {

                var d = $.Deferred();

                events.onMessage = function (result) {
                    d.resolve(result);
                };
                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                ws.send('duplicate ' + oldName + ' ' + newName);
                return d.promise();
            },

            changeEngine: function changeEngine(engine) {

                var d = $.Deferred();

                events.onMessage = function (result) {
                    d.resolve(result);
                };
                events.onError = function (error) {
                    d.reject(error);
                };
                events.onFatal = function (error) {
                    d.reject(error);
                };

                ws.send('change_engine ' + engine + ' default');
                return d.promise();
            },

            // this is a helper  for unit test
            trigger: function trigger(message, type) {
                // console.log(message, type);
                if (type) {
                    type === 'FATAL' ? events.onFatal(message) : events.onError(message);
                } else {
                    events.onMessage(message);
                }
            }
        };
        return slicingApi;
    };
});