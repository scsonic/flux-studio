'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable react/no-multi-comp */
define(['jquery', 'react', 'reactPropTypes', 'helpers/i18n', 'app/actions/beambox/beambox-preference', 'jsx!widgets/Modal', 'jsx!widgets/Alert', 'helpers/device-master', 'helpers/version-checker', 'app/constants/device-constants', 'app/actions/alert-actions', 'helpers/check-device-status', 'app/actions/progress-actions', 'app/constants/progress-constants', 'app/actions/beambox/preview-mode-controller', 'helpers/api/camera-calibration', 'helpers/sprintf', 'app/actions/beambox/constant'], function ($, React, PropTypes, i18n, BeamboxPreference, Modal, Alert, DeviceMaster, VersionChecker, DeviceConstants, AlertActions, CheckDeviceStatus, ProgressActions, ProgressConstants, PreviewModeController, CameraCalibration, sprintf, Constant) {
    var LANG = i18n.lang.camera_calibration;

    var cameraCalibrationWebSocket = CameraCalibration();

    //View render the following steps
    var STEP_REFOCUS = Symbol();
    var STEP_BEFORE_CUT = Symbol();
    var STEP_BEFORE_ANALYZE_PICTURE = Symbol();
    var STEP_FINISH = Symbol();

    var cameraOffset = {};

    var CameraCalibrationStateMachine = function (_React$Component) {
        _inherits(CameraCalibrationStateMachine, _React$Component);

        function CameraCalibrationStateMachine(props) {
            _classCallCheck(this, CameraCalibrationStateMachine);

            var _this = _possibleConstructorReturn(this, (CameraCalibrationStateMachine.__proto__ || Object.getPrototypeOf(CameraCalibrationStateMachine)).call(this, props));

            _this.state = {
                currentStep: STEP_REFOCUS,
                imgBlobUrl: ''
            };

            _this.updateCurrentStep = _this.updateCurrentStep.bind(_this);
            _this.onClose = _this.onClose.bind(_this);
            _this.updateImgBlobUrl = _this.updateImgBlobUrl.bind(_this);
            return _this;
        }

        _createClass(CameraCalibrationStateMachine, [{
            key: 'updateCurrentStep',
            value: function updateCurrentStep(nextStep) {
                this.setState({
                    currentStep: nextStep
                });
            }
        }, {
            key: 'onClose',
            value: function onClose() {
                this.props.onClose();
            }
        }, {
            key: 'updateImgBlobUrl',
            value: function updateImgBlobUrl(val) {
                URL.revokeObjectURL(this.state.imgBlobUrl);
                this.setState({
                    imgBlobUrl: val
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var _stepsMap;

                var stepsMap = (_stepsMap = {}, _defineProperty(_stepsMap, STEP_REFOCUS, React.createElement(StepRefocus, {
                    gotoNextStep: this.updateCurrentStep,
                    onClose: this.onClose
                })), _defineProperty(_stepsMap, STEP_BEFORE_CUT, React.createElement(StepBeforeCut, {
                    gotoNextStep: this.updateCurrentStep,
                    onClose: this.onClose,
                    device: this.props.device,
                    updateImgBlobUrl: this.updateImgBlobUrl
                })), _defineProperty(_stepsMap, STEP_BEFORE_ANALYZE_PICTURE, React.createElement(StepBeforeAnalyzePicture, {
                    gotoNextStep: this.updateCurrentStep,
                    onClose: this.onClose,
                    imgBlobUrl: this.state.imgBlobUrl
                })), _defineProperty(_stepsMap, STEP_FINISH, React.createElement(StepFinish, {
                    onClose: this.onClose
                })), _stepsMap);

                var currentStep = this.state.currentStep;
                var currentStepComponent = stepsMap[currentStep];
                return React.createElement(
                    'div',
                    { className: 'always-top', ref: 'modal' },
                    React.createElement(Modal, { className: { 'modal-camera-calibration': true }, content: currentStepComponent, disabledEscapeOnBackground: false })
                );
            }
        }]);

        return CameraCalibrationStateMachine;
    }(React.Component);

    ;

    var StepRefocus = function StepRefocus(_ref) {
        var gotoNextStep = _ref.gotoNextStep,
            onClose = _ref.onClose;
        return React.createElement(Alert, {
            caption: LANG.camera_calibration,
            message: LANG.please_refocus,
            buttons: [{
                label: LANG.next,
                className: 'btn-default btn-alone-right',
                onClick: function onClick() {
                    return gotoNextStep(STEP_BEFORE_CUT);
                }
            }, {
                label: LANG.cancel,
                className: 'btn-default btn-alone-left',
                onClick: onClose
            }]
        });
    };

    var StepBeforeCut = function StepBeforeCut(_ref2) {
        var device = _ref2.device,
            updateImgBlobUrl = _ref2.updateImgBlobUrl,
            gotoNextStep = _ref2.gotoNextStep,
            onClose = _ref2.onClose;

        var cutThenCapture = async function cutThenCapture() {
            await _doCuttingTask();
            await _doCaptureTask();
        };
        var _doCuttingTask = async function _doCuttingTask() {
            await DeviceMaster.select(device);
            var laserPower = Number((await DeviceMaster.getLaserPower()).value);

            if (laserPower !== 1) {
                await DeviceMaster.setLaserPower(1);
            }

            await CheckDeviceStatus(device);
            await DeviceMaster.runBeamboxCameraTest();

            if (laserPower !== 1) {
                await DeviceMaster.setLaserPower(Number(laserPower));
            }
        };
        var _doCaptureTask = async function _doCaptureTask() {
            try {
                await PreviewModeController.start(device, function () {
                    console.log('camera fail. stop preview mode');
                });

                ProgressActions.open(ProgressConstants.NONSTOP, LANG.taking_picture);

                var movementX = Constant.camera.calibrationPicture.centerX - Constant.camera.offsetX_ideal;
                var movementY = Constant.camera.calibrationPicture.centerY - Constant.camera.offsetY_ideal;
                var blobUrl = await PreviewModeController.takePictureAfterMoveTo(movementX, movementY);
                cameraOffset = PreviewModeController.getCameraOffset();
                updateImgBlobUrl(blobUrl);
            } catch (error) {
                throw error;
            } finally {
                ProgressActions.close();
                PreviewModeController.end();
            }
        };

        return React.createElement(Alert, {
            caption: LANG.camera_calibration,
            message: LANG.please_place_paper,
            buttons: [{
                label: LANG.start_engrave,
                className: 'btn-default btn-alone-right',
                onClick: async function onClick() {
                    try {
                        await cutThenCapture();
                        gotoNextStep(STEP_BEFORE_ANALYZE_PICTURE);
                    } catch (error) {
                        console.log(error);
                        ProgressActions.close();
                        AlertActions.showPopupRetry('menu-item', error.message || 'Fail to cut and capture');
                    }
                }
            }, {
                label: LANG.cancel,
                className: 'btn-default btn-alone-left',
                onClick: onClose
            }]
        });
    };

    var StepBeforeAnalyzePicture = function StepBeforeAnalyzePicture(_ref3) {
        var imgBlobUrl = _ref3.imgBlobUrl,
            gotoNextStep = _ref3.gotoNextStep,
            onClose = _ref3.onClose;

        var sendPictureThenSetConfig = async function sendPictureThenSetConfig() {
            var resp = await _doSendPictureTask();

            switch (resp.status) {
                case 'ok':
                    var result = await _doAnalyzeResult(resp.x, resp.y, resp.angle, resp.width, resp.height);

                    if (result) {
                        await _doSetConfigTask(result.X, result.Y, result.R, result.SX, result.SY);
                    } else {
                        throw new Error(LANG.analyze_result_fail);
                    }

                    break;
                case 'fail':
                    throw new Error(LANG.analyze_result_fail);
                    break;
                case 'none':
                    throw new Error(LANG.no_lines_detected);
                default:
                    break;
            }
        };

        var _doSendPictureTask = async function _doSendPictureTask() {
            var d = $.Deferred();
            fetch(imgBlobUrl).then(function (res) {
                return res.blob();
            }).then(function (blob) {
                var fileReader = new FileReader();
                fileReader.onloadend = function (e) {
                    cameraCalibrationWebSocket.upload(e.target.result).done(function (resp) {
                        d.resolve(resp);
                    }).fail(function (resp) {
                        d.reject(resp.toString());
                    });
                };
                fileReader.readAsArrayBuffer(blob);
            }).catch(function (err) {
                d.reject(err);
            });
            return await d.promise();
        };

        var _doAnalyzeResult = async function _doAnalyzeResult(x, y, angle, squareWidth, squareHeight) {
            var blobImgSize = await new Promise(function (resolve) {
                var img = new Image();
                img.src = imgBlobUrl;
                img.onload = function () {
                    resolve({
                        width: img.width,
                        height: img.height
                    });
                };
            });

            var offsetX_ideal = Constant.camera.offsetX_ideal; // mm
            var offsetY_ideal = Constant.camera.offsetY_ideal; // mm
            var scaleRatio_ideal = Constant.camera.scaleRatio_ideal;
            var square_size = Constant.camera.calibrationPicture.size; // mm

            var scaleRatioX = square_size * Constant.dpmm / squareWidth;
            var scaleRatioY = square_size * Constant.dpmm / squareHeight;
            var deviationX = x - blobImgSize.width / 2; // pixel
            var deviationY = y - blobImgSize.height / 2; // pixel

            var offsetX = -deviationX * scaleRatioX / Constant.dpmm + offsetX_ideal;
            var offsetY = -deviationY * scaleRatioY / Constant.dpmm + offsetY_ideal;

            if (0.8 > scaleRatioX / scaleRatio_ideal || scaleRatioX / scaleRatio_ideal > 1.2) {
                return false;
            }
            if (0.8 > scaleRatioY / scaleRatio_ideal || scaleRatioY / scaleRatio_ideal > 1.2) {
                return false;
            }
            if (Math.abs(deviationX) > 400 || Math.abs(deviationY) > 400) {
                return false;
            }
            if (Math.abs(angle) > 10 * Math.PI / 180) {
                return false;
            }
            return {
                X: offsetX,
                Y: offsetY,
                R: -angle,
                SX: scaleRatioX,
                SY: scaleRatioY
            };
        };

        var _doSetConfigTask = async function _doSetConfigTask(X, Y, R, SX, SY) {
            var deviceInfo = await DeviceMaster.getDeviceInfo();
            var vc = VersionChecker(deviceInfo.version);
            if (vc.meetRequirement('BEAMBOX_CAMERA_CALIBRATION_XY_RATIO')) {
                await DeviceMaster.setDeviceSetting('camera_offset', 'Y:' + Y + ' X:' + X + ' R:' + R + ' S:' + (SX + SY) / 2 + ' SX:' + SX + ' SY:' + SY);
            } else {
                await DeviceMaster.setDeviceSetting('camera_offset', 'Y:' + Y + ' X:' + X + ' R:' + R + ' S:' + (SX + SY) / 2);
            }
        };

        return React.createElement(Alert, {
            caption: LANG.camera_calibration,
            message: sprintf(LANG.please_confirm_image, imgBlobUrl),
            buttons: [{
                label: LANG.next,
                className: 'btn-default btn-alone-right-1',
                onClick: async function onClick() {
                    try {
                        await sendPictureThenSetConfig();
                        gotoNextStep(STEP_FINISH);
                    } catch (error) {
                        console.log(error);
                        AlertActions.showPopupRetry('menu-item', error.toString().replace('Error: ', ''));
                        gotoNextStep(STEP_REFOCUS);
                    }
                }
            }, {
                label: LANG.back,
                className: 'btn-default btn-alone-right-2',
                onClick: function onClick() {
                    return gotoNextStep(STEP_BEFORE_CUT);
                }
            }, {
                label: LANG.cancel,
                className: 'btn-default btn-alone-left',
                onClick: onClose
            }]
        });
    };

    var StepFinish = function StepFinish(_ref4) {
        var onClose = _ref4.onClose;
        return React.createElement(Alert, {
            caption: LANG.camera_calibration,
            message: LANG.calibrate_done,
            buttons: [{
                label: LANG.finish,
                className: 'btn-default btn-alone-right',
                onClick: function onClick() {
                    BeamboxPreference.write('should_remind_calibrate_camera', false);
                    onClose();
                }
            }]
        });
    };

    return CameraCalibrationStateMachine;
});