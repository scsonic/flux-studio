'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * API camera
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-camera(monitoring)
 */
define(['Rx', 'helpers/websocket', 'helpers/rsa-key', 'helpers/version-checker', 'helpers/i18n'], function (Rx, Websocket, rsaKey, VersionChecker, i18n) {

    var TIMEOUT = 15000;
    var LANG = i18n.lang;

    var Camera = function () {
        function Camera() {
            var _this = this;

            _classCallCheck(this, Camera);

            this.cameraNeedFlip = undefined;
            this._device = '';
            this._ws = null;
            this._wsSubject = new Rx.Subject();
            this._source = this._wsSubject.asObservable().filter(function (x) {
                return x instanceof Blob;
            }).switchMap(function (blob) {
                if (blob.size < 30) {
                    // if stream return extremely small blob (i.e. when camera hardware connection fail)
                    return Rx.Observable.throw(new Error(LANG.message.camera_fail_to_transmit_image));
                } else {
                    return Rx.Observable.of(blob);
                }
            }).map(function (blob) {
                return _this.preprocessImage(blob);
            }).concatMap(function (p) {
                return Rx.Observable.fromPromise(p);
            });
        }

        // let subject get response from websocket


        _createClass(Camera, [{
            key: 'createWs',
            value: async function createWs(device) {
                var _this2 = this;

                this._device = device;
                console.log("Device ", device);
                console.assert(device.version, 'device miss version!', device);
                var method = device.source === 'h2h' ? 'camera/usb/' + parseInt(device.uuid) : 'camera/' + device.uuid;

                this._ws = new Websocket({
                    method: method,
                    onOpen: function onOpen() {
                        return _this2._ws.send(rsaKey());
                    },
                    onMessage: function onMessage(res) {
                        return _this2._wsSubject.onNext(res);
                    },
                    onError: function onError(res) {
                        return _this2._wsSubject.onError(new Error(res.error ? res.error.toString() : res));
                    },
                    onFatal: function onFatal(res) {
                        return _this2._wsSubject.onError(new Error(res.error ? res.error.toString() : res));
                    },
                    onClose: function onClose() {
                        return _this2._wsSubject.onCompleted();
                    },
                    autoReconnect: false
                });

                // if response.status === 'connected' within TIMEOUT, the promise resolve. and the websocket will keep listening.
                await this._wsSubject.filter(function (res) {
                    return res.status === 'connected';
                }).take(1).timeout(TIMEOUT).toPromise();

                // check whether the camera need flip
                if (device && device['model'].indexOf('delta-') < 0) {
                    this.cameraNeedFlip = !!Number((/F:\s?(\-?\d+\.?\d+)/.exec((await this._getCameraOffset())) || ['', ''])[1]);
                }
            }
        }, {
            key: '_getCameraOffset',
            value: async function _getCameraOffset() {
                var tempWsSubject = new Rx.Subject();
                var tempWs = new Websocket({
                    method: this._device.source === 'h2h' ? 'control/usb/' + parseInt(this._device.uuid) : 'control/' + this._device.uuid,
                    onOpen: function onOpen() {
                        return tempWs.send(rsaKey());
                    },
                    onMessage: function onMessage(res) {
                        return tempWsSubject.onNext(res);
                    },
                    onError: function onError(res) {
                        return tempWsSubject.onError(new Error(res.error ? res.error.toString() : res));
                    },
                    onFatal: function onFatal(res) {
                        return tempWsSubject.onError(new Error(res.error ? res.error.toString() : res));
                    },
                    onClose: function onClose() {
                        return tempWsSubject.onCompleted();
                    },
                    autoReconnect: false
                });
                await tempWsSubject.filter(function (res) {
                    return res.status === 'connected';
                }).take(1).timeout(TIMEOUT).toPromise();

                tempWs.send('config get camera_offset');
                var camera_offset = await tempWsSubject.take(1).timeout(TIMEOUT).toPromise();
                return camera_offset.value;
            }
        }, {
            key: 'oneShot',
            value: async function oneShot() {
                this._ws.send('require_frame');
                return await this._source.take(1).timeout(TIMEOUT).toPromise();
            }
        }, {
            key: 'getLiveStreamSource',
            value: function getLiveStreamSource() {
                this._ws.send('enable_streaming');
                return this._source.timeout(TIMEOUT).asObservable();
            }
        }, {
            key: 'closeWs',
            value: function closeWs() {
                this._ws.close(false);
            }
        }, {
            key: 'preprocessImage',
            value: async function preprocessImage(blob) {
                var _this3 = this;

                // load blob and flip if necessary
                var imageLoadBlob = async function imageLoadBlob() {
                    var img = new Image();
                    var imgUrl = URL.createObjectURL(blob);
                    img.src = imgUrl;
                    await new Promise(function (resolve) {
                        return img.onload = resolve;
                    });
                    URL.revokeObjectURL(imgUrl);

                    var canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    if (_this3.cameraNeedFlip) {
                        canvas.getContext('2d').scale(-1, -1);
                        canvas.getContext('2d').drawImage(img, -img.width, -img.height, img.width, img.height);
                    } else {
                        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
                    }
                    return canvas;
                };
                var resize1280x720ImageTo640x280 = async function resize1280x720ImageTo640x280() {
                    var img = await imageLoadBlob();
                    console.assert(img.width === 1280 && img.height === 720, 'image should be 1280x720', img.width, img.height);

                    var canvas = document.createElement('canvas');
                    canvas.width = 640;
                    canvas.height = 280;
                    canvas.getContext('2d').drawImage(img, 0, -40, 640, 360); // resize
                    var preprocessedBlob = await new Promise(function (resolve) {
                        return canvas.toBlob(function (b) {
                            return resolve(b);
                        });
                    });
                    return preprocessedBlob;
                };

                var crop640x480ImageTo640x280 = async function crop640x480ImageTo640x280() {
                    var img = await imageLoadBlob();
                    console.assert(img.width === 640 && img.height === 480, 'image should be 640x480', img.width, img.height);

                    var canvas = document.createElement('canvas');
                    canvas.width = 640;
                    canvas.height = 280;
                    canvas.getContext('2d').drawImage(img, 0, -100, 640, 480); // crop top and bottom
                    var preprocessedBlob = await new Promise(function (resolve) {
                        return canvas.toBlob(function (b) {
                            return resolve(b);
                        });
                    });
                    return preprocessedBlob;
                };

                if (!['mozu1', 'fbm1', 'fbb1b', 'fbb1p', 'laser-b1', 'darwin-dev'].includes(this._device.model)) {
                    return blob;
                }

                if (VersionChecker(this._device.version).meetRequirement('BEAMBOX_CAMERA_SPEED_UP')) {
                    return await crop640x480ImageTo640x280();
                } else {
                    return await resize1280x720ImageTo640x280();
                }
            }
        }]);

        return Camera;
    }();

    return Camera;
});