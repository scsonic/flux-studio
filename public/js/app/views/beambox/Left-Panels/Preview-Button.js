'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'reactDOM', 'jsx!widgets/Modal', 'jsx!views/beambox/Left-Panels/Clear-Preview-Graffiti-Button', 'jsx!views/beambox/Left-Panels/Image-Trace-Button', 'jsx!views/Printer-Selector', 'app/actions/alert-actions', 'app/actions/beambox/svgeditor-function-wrapper', 'app/actions/beambox/preview-mode-background-drawer', 'app/actions/beambox/preview-mode-controller', 'app/actions/beambox/beambox-version-master', 'app/actions/beambox/beambox-preference', 'app/actions/beambox', 'app/actions/global-actions', 'app/actions/progress-actions', 'app/constants/progress-constants', 'app/stores/beambox-store', 'jsx!app/actions/beambox/Image-Trace-Panel-Controller', 'plugins/classnames/index', 'helpers/api/config', 'helpers/i18n'], function (React, ReactDOM, Modal, ClearPreviewGraffitiButton, ImageTraceButton, PrinterSelector, AlertActions, FnWrapper, PreviewModeBackgroundDrawer, PreviewModeController, BeamboxVersionMaster, BeamboxPreference, BeamboxActions, GlobalActions, ProgressActions, ProgressConstants, BeamboxStore, ImageTracePanelController, classNames, ConfigHelper, i18n) {

    var LANG = i18n.lang.beambox.left_panel;

    return function (_React$Component) {
        _inherits(PreviewButton, _React$Component);

        function PreviewButton() {
            _classCallCheck(this, PreviewButton);

            var _this = _possibleConstructorReturn(this, (PreviewButton.__proto__ || Object.getPrototypeOf(PreviewButton)).call(this));

            _this.state = {
                isPreviewMode: false,
                isImageTraceMode: false,
                isDrawing: false,
                isDrawn: false
            };
            return _this;
        }

        _createClass(PreviewButton, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                BeamboxStore.onStartDrawingPreviewBlob(function () {
                    return _this2.startDrawing();
                });
                BeamboxStore.onEndDrawingPreviewBlob(function () {
                    return _this2.endDrawing();
                });
                BeamboxStore.onClearCameraCanvas(function () {
                    return _this2.hideImageTraceButton();
                });
                BeamboxStore.onEndImageTrace(function () {
                    return _this2.endImageTrace();
                });
                BeamboxStore.onResetPreviewButton(function () {
                    return _this2.resetPreviewButton();
                });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                var _this3 = this;

                BeamboxStore.removeStartDrawingPreviewBlobListener(function () {
                    return _this3.startDrawing();
                });
                BeamboxStore.removeEndDrawingPreviewBlobListener(function () {
                    return _this3.endDrawing();
                });
                BeamboxStore.removeClearCameraCanvasListener(function () {
                    return _this3.hideImageTraceButton();
                });
                BeamboxStore.removeEndImageTraceListener(function () {
                    return _this3.endImageTrace();
                });
                BeamboxStore.removeResetPreviewButton(function () {
                    return _this3.resetPreviewButton();
                });
            }
        }, {
            key: 'endImageTrace',
            value: function endImageTrace() {
                this.setState({
                    isPreviewMode: false,
                    isImageTraceMode: false
                });
            }
        }, {
            key: 'hideImageTraceButton',
            value: function hideImageTraceButton() {
                this.setState({ isDrawn: false });
            }
        }, {
            key: 'handleImageTraceClick',
            value: function handleImageTraceClick() {
                try {
                    if (this.state.isPreviewMode) {
                        PreviewModeController.end();
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    FnWrapper.useSelectTool();
                    FnWrapper.clearSelection();
                    BeamboxActions.closeInsertObjectSubmenu();
                    GlobalActions.monitorClosed();
                    this.setState({
                        isPreviewMode: false,
                        isImageTraceMode: true
                    });
                }
            }
        }, {
            key: 'endDrawing',
            value: function endDrawing() {
                ClearPreviewGraffitiButton.show();
                this.setState({ isDrawing: false, isDrawn: true });
            }
        }, {
            key: 'startDrawing',
            value: function startDrawing() {
                ClearPreviewGraffitiButton.hide();
                this.setState({ isDrawing: true, isDrawn: false });
            }
        }, {
            key: '_handlePreviewClick',
            value: function _handlePreviewClick() {
                var _this4 = this;

                if (!document.getElementById('image-trace-panel-outer')) {
                    ImageTracePanelController.render();
                }

                var tryToStartPreviewMode = async function tryToStartPreviewMode() {

                    var isAlreadyRemindUserToCalibrateCamera = function isAlreadyRemindUserToCalibrateCamera() {
                        return !BeamboxPreference.read('should_remind_calibrate_camera');
                    };

                    var remindCalibrateCamera = function remindCalibrateCamera() {
                        AlertActions.showPopupInfo('what-is-this-parameter-for?', LANG.suggest_calibrate_camera_first);
                        BeamboxPreference.write('should_remind_calibrate_camera', false);
                    };

                    var isFirmwareVersionValid = async function isFirmwareVersionValid(device) {
                        return !(await BeamboxVersionMaster.isUnusableVersion(device));
                    };

                    var alertUserToUpdateFirmware = function alertUserToUpdateFirmware() {
                        AlertActions.showPopupError('', i18n.lang.beambox.popup.should_update_firmware_to_continue);
                    };

                    // return device or false
                    var getDeviceToUse = async function getDeviceToUse() {
                        var d = $.Deferred();
                        var root = document.getElementById('printer-selector-placeholder');
                        var printerSelector = React.createElement(
                            Modal,
                            { onClose: d.reject },
                            React.createElement(PrinterSelector, {
                                uniqleId: 'laser',
                                className: 'preview-printer-selector',
                                modelFilter: PrinterSelector.BEAMBOX_FILTER,
                                onClose: d.reject,
                                onGettingPrinter: function onGettingPrinter(device) {
                                    return d.resolve(device);
                                },
                                WindowStyle: {
                                    top: 'calc(50% - 180px)',
                                    left: '173px'
                                },
                                arrowDirection: 'left'
                            })
                        );
                        try {
                            ReactDOM.render(printerSelector, root);
                            var _device = await d;
                            ReactDOM.unmountComponentAtNode(root);
                            return _device;
                        } catch (error) {
                            console.log(error);
                            ReactDOM.unmountComponentAtNode(root);
                            return false;
                        }
                    };

                    var startPreviewMode = async function startPreviewMode(device) {
                        var errorCallback = function errorCallback(errMessage) {
                            AlertActions.showPopupError('menu-item', errMessage);
                            _this4.setState({ isPreviewMode: false });
                            $(workarea).css('cursor', 'auto');
                        };

                        $(workarea).css('cursor', 'wait');

                        try {
                            await PreviewModeController.start(device, errorCallback);
                            _this4.setState({ isPreviewMode: true });
                            $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');
                        } catch (error) {
                            console.log(error);
                            AlertActions.showPopupError('menu-item', error.message || 'Fail to start preview mode');
                            FnWrapper.useSelectTool();
                        }
                    };

                    // MAIN PROCESS HERE

                    if (!isAlreadyRemindUserToCalibrateCamera()) {
                        remindCalibrateCamera();
                        return;
                    }

                    var device = await getDeviceToUse();
                    if (!device) {
                        return;
                    };

                    ProgressActions.open(ProgressConstants.NONSTOP, i18n.lang.message.tryingToConenctMachine);

                    if (!(await isFirmwareVersionValid(device))) {
                        alertUserToUpdateFirmware();
                        return;
                    }

                    ProgressActions.close();
                    startPreviewMode(device);
                };

                var endPreviewMode = function endPreviewMode() {
                    try {
                        PreviewModeController.end();
                    } catch (error) {
                        console.log(error);
                    } finally {
                        _this4.resetPreviewButton();
                    }
                };

                FnWrapper.clearSelection();
                BeamboxActions.closeInsertObjectSubmenu();
                GlobalActions.monitorClosed();

                if (!this.state.isPreviewMode) {
                    tryToStartPreviewMode();
                } else {
                    endPreviewMode();
                }
            }
        }, {
            key: '_renderImageTraceButton',
            value: function _renderImageTraceButton() {
                if (this.state.isImageTraceMode) {
                    return;
                } else {
                    return null;
                }
            }
        }, {
            key: 'resetPreviewButton',
            value: function resetPreviewButton() {
                FnWrapper.useSelectTool();
                this.setState({
                    isPreviewMode: false,
                    isImageTraceMode: false
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var _this5 = this;

                var _state = this.state,
                    isPreviewMode = _state.isPreviewMode,
                    isImageTraceMode = _state.isImageTraceMode,
                    isDrawing = _state.isDrawing,
                    isDrawn = _state.isDrawn;

                var ImageTrace = PreviewModeBackgroundDrawer.isClean() || isDrawing ? null : React.createElement(ImageTraceButton, {
                    onClick: function onClick() {
                        return _this5.handleImageTraceClick();
                    }
                });

                return React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'div',
                        {
                            className: classNames('option', 'preview-btn', { 'preview-mode-on': isPreviewMode }),
                            onClick: function onClick() {
                                return _this5._handlePreviewClick();
                            }
                        },
                        isPreviewMode ? LANG.end_preview : LANG.preview
                    ),
                    React.createElement('span', { id: 'clear-preview-graffiti-button-placeholder' }),
                    React.createElement('span', { id: 'printer-selector-placeholder' }),
                    ImageTrace
                );
            }
        }]);

        return PreviewButton;
    }(React.Component);
});