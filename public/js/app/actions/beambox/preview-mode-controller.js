'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['Rx', 'app/actions/beambox/preview-mode-background-drawer', 'jsx!views/beambox/Left-Panels/Clear-Preview-Graffiti-Button', 'helpers/device-master', 'app/constants/device-constants', 'app/actions/progress-actions', 'app/constants/progress-constants', 'app/actions/global-actions', 'helpers/sprintf', 'helpers/check-device-status', 'helpers/firmware-version-checker', 'helpers/i18n', 'app/actions/beambox/constant', 'app/actions/beambox'], function (Rx, PreviewModeBackgroundDrawer, ClearPreviewGraffitiButton, DeviceMaster, DeviceConstants, ProgressActions, ProgressConstants, GlobalActions, sprintf, checkDeviceStatus, FirmwareVersionChecker, i18n, Constant, BeamboxActions) {
    var PreviewModeController = function () {
        function PreviewModeController() {
            _classCallCheck(this, PreviewModeController);

            this.originalSpeed = 1;
            this.storedPrinter = null;
            this.isPreviewModeOn = false;
            this.isPreviewBlocked = false;
            this.cameraOffset = null;
            this.lastPosition = [0, 0]; // in mm
            this.errorCallback = function () {};

            ClearPreviewGraffitiButton.init(function () {
                return PreviewModeBackgroundDrawer.clear();
            });
        }

        //main functions

        _createClass(PreviewModeController, [{
            key: 'start',
            value: async function start(selectedPrinter, errCallback) {
                await this._reset();

                await DeviceMaster.select(selectedPrinter);

                ProgressActions.open(ProgressConstants.NONSTOP, sprintf(i18n.lang.message.connectingMachine, selectedPrinter.name));

                try {
                    await this._retrieveCameraOffset();
                    var laserSpeed = await DeviceMaster.getLaserSpeed();

                    if (Number(laserSpeed.value) !== 1) {
                        this.originalSpeed = Number(laserSpeed.value);
                        await DeviceMaster.setLaserSpeed(1);
                    }
                    await DeviceMaster.enterMaintainMode();
                    if (await FirmwareVersionChecker.check(selectedPrinter, 'CLOSE_FAN')) {
                        DeviceMaster.maintainCloseFan(); // this is async function, but we don't have to wait it
                    }
                    await DeviceMaster.connectCamera(selectedPrinter);
                    PreviewModeBackgroundDrawer.start(this.cameraOffset);
                    PreviewModeBackgroundDrawer.drawBoundary();

                    this.storedPrinter = selectedPrinter;
                    this.errorCallback = errCallback;
                    this.isPreviewModeOn = true;
                } catch (error) {
                    if (this.originalSpeed !== 1) {
                        await DeviceMaster.setLaserSpeed(this.originalSpeed);
                        this.originalSpeed = 1;
                    }
                    throw error;
                } finally {
                    ProgressActions.close();
                }
            }
        }, {
            key: 'end',
            value: async function end() {
                console.log('end of pmc');
                PreviewModeBackgroundDrawer.clearBoundary();
                PreviewModeBackgroundDrawer.end();
                var storedPrinter = this.storedPrinter;
                await this._reset();
                await DeviceMaster.select(storedPrinter);
                await DeviceMaster.endMaintainMode();
                if (this.originalSpeed !== 1) {
                    await DeviceMaster.setLaserSpeed(this.originalSpeed);
                    this.originalSpeed = 1;
                }
            }
        }, {
            key: 'preview',
            value: async function preview(x, y) {
                var last = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

                if (this.isPreviewBlocked) {
                    return;
                }
                this.isPreviewBlocked = true;
                var constrainedXY = this._constrainPreviewXY(x, y);
                x = constrainedXY.x;
                y = constrainedXY.y;

                $(workarea).css('cursor', 'wait');

                try {
                    var imgUrl = await this._getPhotoAfterMove(x, y);
                    var p = PreviewModeBackgroundDrawer.draw(imgUrl, x, y, last);

                    $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');
                    this.isPreviewBlocked = false;
                    return true;
                } catch (error) {
                    console.log(error);
                    if (!PreviewModeBackgroundDrawer.isClean()) {
                        BeamboxActions.endDrawingPreviewBlob();
                    }
                    this.end();
                }
            }
        }, {
            key: 'previewRegion',
            value: async function previewRegion(x1, y1, x2, y2) {
                var _this = this;

                var points = function () {
                    var size = function () {
                        var h = Constant.camera.imgHeight;
                        var a = _this._getCameraOffset().angle;
                        var s = _this._getCameraOffset().scaleRatioY;
                        var c = h / (Math.cos(a) + Math.sin(a));
                        // overlap a little bit to fix empty area between pictures
                        // (some machine will have it, maybe due to cameraOffset.angle).
                        // it seems like something wrong handling image rotation.
                        return c * s - 2;
                    }();

                    var _ref = function () {
                        var l = Math.min(x1, x2) + size / 2;
                        var r = Math.max(x1, x2) - size / 2;
                        var t = Math.min(y1, y2) + size / 2;
                        var b = Math.max(y1, y2) - size / 2;

                        return {
                            left: _this._constrainPreviewXY(l, 0).x,
                            right: _this._constrainPreviewXY(r, 0).x,
                            top: _this._constrainPreviewXY(0, t).y,
                            bottom: _this._constrainPreviewXY(0, b).y
                        };
                    }(),
                        left = _ref.left,
                        right = _ref.right,
                        top = _ref.top,
                        bottom = _ref.bottom;

                    var pointsArray = [];
                    var shouldRowReverse = false; // let camera 走Ｓ字型
                    for (var curY = top; curY < bottom + size; curY += size) {

                        var row = [];
                        for (var curX = left; curX < right + size; curX += size) {
                            row.push([curX, curY]);
                        }

                        if (shouldRowReverse) {
                            row.reverse();
                        }
                        pointsArray = pointsArray.concat(row);
                        shouldRowReverse = !shouldRowReverse;
                    }
                    return pointsArray;
                }();

                for (var i = 0; i < points.length; i++) {
                    var result = await this.preview(points[i][0], points[i][1], i === points.length - 1);

                    if (!result) {
                        BeamboxActions.endDrawingPreviewBlob();
                        return;
                    }
                }
            }

            // x, y in mm

        }, {
            key: 'takePictureAfterMoveTo',
            value: function takePictureAfterMoveTo(movementX, movementY) {
                return this._getPhotoAfterMoveTo(movementX, movementY);
            }
        }, {
            key: 'isPreviewMode',
            value: function isPreviewMode() {
                return this.isPreviewModeOn;
            }
        }, {
            key: 'getCameraOffset',
            value: function getCameraOffset() {
                return this.cameraOffset;
            }

            //helper functions

        }, {
            key: '_retrieveCameraOffset',
            value: async function _retrieveCameraOffset() {
                // cannot getDeviceSetting during maintainMode. So we force to end it.
                try {
                    await DeviceMaster.endMaintainMode();
                } catch (error) {
                    if (error.status === 'error' && error.error && error.error[0] === 'OPERATION_ERROR') {
                        // do nothing.
                    } else {
                        console.log(error);
                    }
                }

                var resp = await DeviceMaster.getDeviceSetting('camera_offset');
                this.cameraOffset = {
                    x: Number(/X:\s?(\-?\d+\.?\d+)/.exec(resp.value)[1]),
                    y: Number(/Y:\s?(\-?\d+\.?\d+)/.exec(resp.value)[1]),
                    angle: Number(/R:\s?(\-?\d+\.?\d+)/.exec(resp.value)[1]),
                    scaleRatioX: Number(/SX:\s?(\-?\d+\.?\d+)/.exec(resp.value) || /S:\s?(\-?\d+\.?\d+)/.exec(resp.value)[1]),
                    scaleRatioY: Number(/SY:\s?(\-?\d+\.?\d+)/.exec(resp.value) || /S:\s?(\-?\d+\.?\d+)/.exec(resp.value)[1])
                };

                if (this.cameraOffset.x === 0 && this.cameraOffset.y === 0) {
                    this.cameraOffset = {
                        x: Constant.camera.offsetX_ideal,
                        y: Constant.camera.offsetY_ideal,
                        angle: 0,
                        scaleRatioX: Constant.camera.scaleRatio_ideal,
                        scaleRatioY: Constant.camera.scaleRatio_ideal
                    };
                }
            }
        }, {
            key: '_getCameraOffset',
            value: function _getCameraOffset() {
                return this.cameraOffset;
            }
        }, {
            key: '_reset',
            value: async function _reset() {
                this.storedPrinter = null;
                this.isPreviewModeOn = false;
                this.isPreviewBlocked = false;
                this.cameraOffset = null;
                this.lastPosition = [0, 0];
                await DeviceMaster.disconnectCamera();
            }
        }, {
            key: '_constrainPreviewXY',
            value: function _constrainPreviewXY(x, y) {
                var maxWidth = Constant.dimension.width;
                var maxHeight = Constant.dimension.height;

                x = Math.max(x, this._getCameraOffset().x * 10);
                x = Math.min(x, maxWidth);
                y = Math.max(y, this._getCameraOffset().y * 10);
                y = Math.min(y, maxHeight);
                return {
                    x: x,
                    y: y
                };
            }

            //x, y in pixel

        }, {
            key: '_getPhotoAfterMove',
            value: function _getPhotoAfterMove(x, y) {
                var movementX = x / Constant.dpmm - this._getCameraOffset().x;
                var movementY = y / Constant.dpmm - this._getCameraOffset().y;

                return this._getPhotoAfterMoveTo(movementX, movementY);
            }

            //movementX, movementY in mm

        }, {
            key: '_getPhotoAfterMoveTo',
            value: async function _getPhotoAfterMoveTo(movementX, movementY) {
                var movement = {
                    f: Math.max(Constant.camera.movementSpeed.x, Constant.camera.movementSpeed.y), // firmware will used limited x, y speed still
                    x: movementX, // mm
                    y: movementY // mm
                };

                await DeviceMaster.select(this.storedPrinter);
                await DeviceMaster.maintainMove(movement);
                await this._waitUntilEstimatedMovementTime(movementX, movementY);

                var imgUrl = await this._getPhotoFromMachine();

                return imgUrl;
            }

            //movementX, movementY in mm

        }, {
            key: '_waitUntilEstimatedMovementTime',
            value: async function _waitUntilEstimatedMovementTime(movementX, movementY) {
                var speed = {
                    x: Constant.camera.movementSpeed.x / 60 / 1000, // speed: mm per millisecond
                    y: Constant.camera.movementSpeed.y / 60 / 1000 // speed: mm per millisecond
                };
                var timeToWait = Math.hypot((this.lastPosition[0] - movementX) / speed.x, (this.lastPosition[1] - movementY) / speed.y);

                // wait for moving camera to take a stable picture, this value need to be optimized
                timeToWait *= 1.2;
                timeToWait += 100;
                this.lastPosition = [movementX, movementY];
                await Rx.Observable.timer(timeToWait).toPromise();
            }

            //just fot _getPhotoAfterMoveTo()

        }, {
            key: '_getPhotoFromMachine',
            value: async function _getPhotoFromMachine() {
                var imgBlob = await DeviceMaster.takeOnePicture();
                var imgUrl = URL.createObjectURL(imgBlob);
                return imgUrl;
            }
        }]);

        return PreviewModeController;
    }();

    var instance = new PreviewModeController();

    return instance;
});