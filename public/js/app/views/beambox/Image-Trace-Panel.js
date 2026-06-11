'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable react/no-multi-comp */
define(['jquery', 'react', 'reactPropTypes', 'app/actions/beambox', 'app/actions/beambox/preview-mode-background-drawer', 'app/actions/beambox/svgeditor-function-wrapper', 'app/stores/beambox-store', 'helpers/i18n', 'helpers/image-data', 'helpers/api/image-tracer', 'jsx!widgets/Modal', 'jsx!widgets/Slider-Control', 'lib/cropper'], function ($, React, PropTypes, BeamboxActions, PreviewModeBackgroundDrawer, FnWrapper, BeamboxStore, i18n, ImageData, ImageTracerApi, Modal, SliderControl, Cropper) {
    var LANG = i18n.lang.beambox.image_trace_panel;

    var imageTracerWebSocket = ImageTracerApi();

    var TESTING_IT = false;

    //View render the following steps
    var STEP_NONE = Symbol();
    var STEP_OPEN = Symbol();
    var STEP_CROP = Symbol();
    var STEP_TUNE = Symbol();
    var STEP_APPLY = Symbol();

    var cropper = null;
    var grayscaleCroppedImg = null;

    var TestImg = 'img/hehe.png';

    var ImageTracePanel = function (_React$Component) {
        _inherits(ImageTracePanel, _React$Component);

        function ImageTracePanel(props) {
            _classCallCheck(this, ImageTracePanel);

            var _this = _possibleConstructorReturn(this, (ImageTracePanel.__proto__ || Object.getPrototypeOf(ImageTracePanel)).call(this, props));

            _this.state = {
                currentStep: STEP_NONE,
                croppedBlobUrl: '',
                croppedCameraCanvasBlobUrl: '',
                imageTrace: '',
                cropData: {},
                preCrop: {},
                threshold: 128
            };
            return _this;
        }

        _createClass(ImageTracePanel, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                window.addEventListener('resize', function () {
                    return _this2._handleResizeWindow();
                });
                BeamboxStore.onCropperShown(function () {
                    return _this2.openCropper();
                });

                if (TESTING_IT) {
                    console.log('dev ! testing it-panel');
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');

                    var img = new Image();
                    img.src = TestImg;
                    img.onload = function () {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        context.drawImage(img, 0, 0);
                        canvas.toBlob(function (blob) {
                            var croppedBlobUrl = URL.createObjectURL(blob);

                            _this2.setState({ croppedBlobUrl: croppedBlobUrl });
                            ImageData(croppedBlobUrl, {
                                height: 0,
                                width: 0,
                                grayscale: {
                                    is_binary: true,
                                    is_rgba: true,
                                    is_shading: false,
                                    threshold: 128,
                                    is_svg: false
                                },
                                onComplete: function onComplete(result) {
                                    grayscaleCroppedImg = result.canvas.toDataURL('image/png');
                                    _this2.setState({ currentStep: STEP_TUNE });
                                }
                            });
                        });
                    };
                }
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                var _this3 = this;

                window.removeEventListener('resize', function () {
                    return _this3._handleResizeWindow();
                });
                BeamboxStore.removeCropperShownListener(function () {
                    return _this3.openCropper();
                });
            }
        }, {
            key: '_handleResizeWindow',
            value: function _handleResizeWindow() {
                if (this.state.currentStep !== STEP_APPLY) {
                    return;
                }

                var imageTrace = document.getElementById('imageTrace');
                var tunedImage = document.getElementById('tunedImage');
                var style = 'left: ' + tunedImage.x + 'px; top: ' + tunedImage.y + 'px; width: ' + tunedImage.width + 'px; height: ' + tunedImage.height + 'px;';

                imageTrace.style = style;
            }
        }, {
            key: '_getImageTrace',
            value: function _getImageTrace(imageTrace) {
                this.setState({ imageTrace: imageTrace });

                if (this.state.currentStep === STEP_TUNE) {
                    this.next();
                }
            }
        }, {
            key: 'openCropper',
            value: function openCropper() {
                if (this.state.currentStep === STEP_NONE) {
                    this.next();
                }
            }
        }, {
            key: 'next',
            value: function next() {
                switch (this.state.currentStep) {
                    case STEP_NONE:
                        this.setState({ currentStep: STEP_OPEN });
                        break;
                    case STEP_OPEN:
                        this.setState({ currentStep: STEP_CROP });
                        break;
                    case STEP_CROP:
                        this.setState({ currentStep: STEP_TUNE });
                        this._destroyCropper();
                        break;
                    case STEP_TUNE:
                        this.setState({ currentStep: STEP_APPLY });
                        break;
                    case STEP_APPLY:
                        this.setState({ currentStep: STEP_NONE });
                        break;
                }
            }
        }, {
            key: 'prev',
            value: function prev() {
                switch (this.state.currentStep) {
                    case STEP_CROP:
                        this.setState({ currentStep: STEP_NONE });
                        break;
                    case STEP_TUNE:
                        this.setState({ currentStep: STEP_CROP });
                        break;
                    case STEP_APPLY:
                        this.setState({ currentStep: STEP_TUNE });
                        break;
                    default:
                        break;
                }
            }
        }, {
            key: '_backToCropper',
            value: function _backToCropper() {
                this.prev();
                URL.revokeObjectURL(this.state.croppedBlobUrl);
                this.setState({
                    threshold: 128
                });
            }
        }, {
            key: '_backToTune',
            value: function _backToTune() {
                this.prev();
                this.setState({ imageTrace: '' });
            }
        }, {
            key: '_calculateImageTrace',
            value: async function _calculateImageTrace() {
                var _this4 = this;

                var _state = this.state,
                    croppedBlobUrl = _state.croppedBlobUrl,
                    threshold = _state.threshold;

                var d = $.Deferred();
                var img = document.getElementById('tunedImage');

                fetch(grayscaleCroppedImg).then(function (res) {
                    return res.blob();
                }).then(function (blob) {
                    var fileReader = new FileReader();
                    fileReader.onloadend = function (e) {
                        imageTracerWebSocket.upload(e.target.result, { threshold: threshold }).done(function (res) {
                            d.resolve(res);
                            _this4._getImageTrace(res.svg);
                        }).fail(function (res) {
                            d.reject(res.toString());
                        });
                    };
                    fileReader.readAsArrayBuffer(blob);
                }).catch(function (err) {
                    d.reject(err);
                });
            }
        }, {
            key: '_handleCropping',
            value: function _handleCropping() {
                var _this5 = this;

                var cropData = cropper.getData();
                var croppedCanvas = cropper.getCroppedCanvas();

                croppedCanvas.toBlob(function (blob) {
                    var croppedBlobUrl = URL.createObjectURL(blob);

                    _this5.setState({ cropData: cropData, croppedBlobUrl: croppedBlobUrl });

                    ImageData(croppedBlobUrl, {
                        height: 0,
                        width: 0,
                        grayscale: {
                            is_binary: true,
                            is_rgba: true,
                            is_shading: false,
                            threshold: 128,
                            is_svg: false
                        },
                        onComplete: function onComplete(result) {
                            if (grayscaleCroppedImg) {
                                URL.revokeObjectURL(grayscaleCroppedImg);
                            }
                            grayscaleCroppedImg = result.canvas.toDataURL('image/png');
                            _this5.next();
                        }
                    });
                });
            }
        }, {
            key: '_handleCropperCancel',
            value: function _handleCropperCancel() {
                this._destroyCropper();
                this.prev();
                BeamboxActions.endImageTrace();
            }
        }, {
            key: '_handleParameterChange',
            value: function _handleParameterChange(id, value) {
                var _this6 = this;

                switch (id) {
                    case 'threshold':
                        ImageData(this.state.croppedBlobUrl, {
                            height: 0,
                            width: 0,
                            grayscale: {
                                is_binary: true,
                                is_rgba: true,
                                is_shading: false,
                                threshold: parseInt(value),
                                is_svg: false
                            },
                            onComplete: function onComplete(result) {
                                if (grayscaleCroppedImg) {
                                    URL.revokeObjectURL(grayscaleCroppedImg);
                                }
                                grayscaleCroppedImg = result.canvas.toDataURL('image/png');
                                _this6.setState({ threshold: value });
                            }
                        });
                        break;
                }
            }
        }, {
            key: '_destroyCropper',
            value: function _destroyCropper() {
                if (cropper) {
                    cropper.destroy();
                }
            }
        }, {
            key: '_handleImageTraceCancel',
            value: function _handleImageTraceCancel() {
                URL.revokeObjectURL(this.state.croppedBlobUrl);
                if (this.state.croppedCameraCanvasBlobUrl != '') {
                    URL.revokeObjectURL(this.state.croppedCameraCanvasBlobUrl);
                }
                this.setState({
                    currentStep: STEP_NONE,
                    croppedBlobUrl: '',
                    croppedCameraCanvasBlobUrl: '',
                    imageTrace: '',
                    threshold: 128
                });
                BeamboxActions.endImageTrace();
            }
        }, {
            key: '_handleImageTraceComplete',
            value: function _handleImageTraceComplete() {
                this.next();
            }
        }, {
            key: '_pushImageTrace',
            value: async function _pushImageTrace() {
                var _state2 = this.state,
                    cropData = _state2.cropData,
                    preCrop = _state2.preCrop,
                    imageTrace = _state2.imageTrace,
                    threshold = _state2.threshold,
                    croppedBlobUrl = _state2.croppedBlobUrl;

                var tunedImage = document.getElementById('tunedImage');

                var d = $.Deferred();

                if (TESTING_IT) {
                    var testingCropData = {
                        x: tunedImage.x,
                        y: tunedImage.y,
                        width: 1150,
                        height: 918
                    };
                    var testingPreCrop = {
                        offsetX: 100,
                        offsetY: 100
                    };

                    FnWrapper.insertImage(croppedBlobUrl, testingCropData, testingPreCrop, 1, threshold, true);
                    FnWrapper.insertSvg(imageTrace, 'image-trace', testingCropData, testingPreCrop);
                } else {
                    FnWrapper.insertImage(croppedBlobUrl, cropData, preCrop, 1, threshold, true);
                    FnWrapper.insertSvg(imageTrace, 'image-trace', cropData, preCrop);
                }

                URL.revokeObjectURL(grayscaleCroppedImg);
                if (this.state.croppedCameraCanvasBlobUrl != '') {
                    URL.revokeObjectURL(this.state.croppedCameraCanvasBlobUrl);
                }
                this.setState({
                    currentStep: STEP_NONE,
                    croppedBlobUrl: '',
                    croppedCameraCanvasBlobUrl: '',
                    imageTrace: '',
                    threshold: 128
                });
                BeamboxActions.endImageTrace();
            }
        }, {
            key: '_renderImageToCrop',
            value: function _renderImageToCrop() {
                var _this7 = this;

                var previewBlobUrl = PreviewModeBackgroundDrawer.getCameraCanvasUrl();

                return React.createElement('img', {
                    id: 'previewForCropper',
                    onLoad: function onLoad() {
                        return _this7._renderCropper();
                    },
                    src: previewBlobUrl
                });
            }
        }, {
            key: '_renderCropper',
            value: function _renderCropper() {
                var imageObj = document.getElementById('previewForCropper');
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                var coordinates = PreviewModeBackgroundDrawer.getCoordinates();
                var sourceWidth = coordinates.maxX - coordinates.minX + 465.17;
                var sourceHeight = coordinates.maxY - coordinates.minY + 465.17;
                var reference = 640 / sourceWidth < 600 / sourceHeight ? 'w' : 'h';
                var ratio = reference === 'w' ? sourceHeight / sourceWidth : sourceWidth / sourceHeight;
                var destWidth = reference === 'w' ? 640 : 640 * ratio;
                var destHeight = reference === 'h' ? 600 : 600 * ratio;

                this.setState({
                    preCrop: {
                        offsetX: coordinates.minX,
                        offsetY: coordinates.minY
                    }
                });

                cropper = new Cropper(imageObj, {
                    zoomable: false,
                    viewMode: 0,
                    targetWidth: destWidth,
                    targetHeight: destHeight
                });
            }
        }, {
            key: '_renderCropperModal',
            value: function _renderCropperModal() {
                var _this8 = this;

                return React.createElement(
                    Modal,
                    null,
                    React.createElement(
                        'div',
                        { className: 'cropper-panel' },
                        React.createElement(
                            'div',
                            { className: 'main-content' },
                            React.createElement('img', {
                                id: 'previewForCropper',
                                onLoad: function onLoad() {
                                    return _this8._renderCropper();
                                },
                                src: this.state.croppedCameraCanvasBlobUrl
                            })
                        ),
                        React.createElement(
                            'div',
                            { className: 'footer' },
                            React.createElement(
                                'button',
                                {
                                    className: 'btn btn-default pull-right',
                                    onClick: function onClick() {
                                        return _this8._handleCropping();
                                    }
                                },
                                LANG.next
                            ),
                            React.createElement(
                                'button',
                                {
                                    className: 'btn btn-default pull-right',
                                    onClick: function onClick() {
                                        return _this8._handleCropperCancel();
                                    }
                                },
                                LANG.cancel
                            )
                        )
                    )
                );
            }
        }, {
            key: '_getImageTraceDom',
            value: function _getImageTraceDom() {
                var tunedImage = document.getElementById('tunedImage');
                var x = tunedImage.x;
                var y = tunedImage.y;
                var w = tunedImage.width;
                var h = tunedImage.height;

                var imgStyle = {
                    left: x + 'px',
                    top: y + 'px',
                    width: w + 'px',
                    height: h + 'px'
                };

                if (this.state.imageTrace === null) {
                    return null;
                }

                return React.createElement('img', {
                    id: 'imageTrace',
                    style: imgStyle,
                    src: 'data:image/svg+xml; utf8, ' + encodeURIComponent(this.state.imageTrace)
                });
            }
        }, {
            key: '_cropCameraCanvas',
            value: function _cropCameraCanvas() {
                var _this9 = this;

                var imageObj = document.getElementById('cameraCanvas');
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                var canvasBackground = document.getElementById('canvasBackground');
                var coordinates = PreviewModeBackgroundDrawer.getCoordinates();
                var sourceX = coordinates.minX;
                var sourceY = coordinates.minY;
                var sourceWidth = coordinates.maxX - coordinates.minX + 465.17;
                var sourceHeight = coordinates.maxY - coordinates.minY + 465.17;
                var destX = 0;
                var destY = 0;
                var destWidth = (coordinates.maxX - coordinates.minX) / 6.286 + 74;
                var destHeight = (coordinates.maxY - coordinates.minY) / 6.286 + 74;

                canvas.width = sourceWidth;
                canvas.height = sourceHeight;

                context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, sourceWidth, sourceHeight);
                canvas.toBlob(function (blob) {
                    var url = URL.createObjectURL(blob);

                    if (_this9.state.croppedCameraCanvasBlobUrl != '') {
                        URL.revokeObjectURL(_this9.state.croppedCameraCanvasBlobUrl);
                    }

                    _this9.setState({ croppedCameraCanvasBlobUrl: url });

                    if (_this9.state.currentStep === STEP_OPEN) {
                        _this9.next();
                    }
                });
            }
        }, {
            key: '_renderImageTraceModal',
            value: function _renderImageTraceModal() {
                var _this10 = this;

                var _state3 = this.state,
                    threshold = _state3.threshold,
                    currentStep = _state3.currentStep,
                    imageTrace = _state3.imageTrace,
                    cropData = _state3.cropData;

                var footer = this._renderImageTraceFooter();
                var it = currentStep === STEP_APPLY && imageTrace !== '' ? this._getImageTraceDom() : null;
                var containerStyle = TESTING_IT || cropData.width > cropData.height ? { width: '400px' } : { height: '520px' };

                return React.createElement(
                    Modal,
                    null,
                    React.createElement(
                        'div',
                        { className: 'image-trace-panel' },
                        React.createElement(
                            'div',
                            { className: 'main-content' },
                            React.createElement(
                                'div',
                                { className: 'cropped-container', style: containerStyle },
                                React.createElement('img', { id: 'tunedImage', src: grayscaleCroppedImg }),
                                it
                            ),
                            React.createElement(
                                'div',
                                { className: 'right-part' },
                                React.createElement(
                                    'div',
                                    { className: 'scroll-bar-container' },
                                    React.createElement(
                                        'div',
                                        { className: 'title' },
                                        LANG.tuning
                                    ),
                                    React.createElement(SliderControl, {
                                        id: 'threshold',
                                        key: 'threshold',
                                        label: LANG.threshold,
                                        min: 0,
                                        max: 255,
                                        step: 1,
                                        'default': parseInt(threshold),
                                        onChange: function onChange(id, val) {
                                            return _this10._handleParameterChange(id, val);
                                        }
                                    })
                                )
                            )
                        ),
                        footer
                    )
                );
            }
        }, {
            key: '_renderImageTraceFooter',
            value: function _renderImageTraceFooter() {
                var _this11 = this;

                if (this.state.currentStep === STEP_TUNE) {
                    return React.createElement(
                        'div',
                        { className: 'footer' },
                        React.createElement(
                            'button',
                            {
                                className: 'btn btn-default pull-right',
                                onClick: function onClick() {
                                    return _this11._handleImageTraceCancel();
                                }
                            },
                            LANG.cancel
                        ),
                        React.createElement(
                            'button',
                            {
                                className: 'btn btn-default pull-right',
                                onClick: function onClick() {
                                    return _this11._calculateImageTrace();
                                }
                            },
                            LANG.apply
                        ),
                        React.createElement(
                            'button',
                            {
                                className: 'btn btn-default pull-right',
                                onClick: function onClick() {
                                    return _this11._backToCropper();
                                }
                            },
                            LANG.back
                        )
                    );
                } else {
                    return React.createElement(
                        'div',
                        { className: 'footer' },
                        React.createElement(
                            'button',
                            {
                                className: 'btn btn-default pull-right',
                                onClick: function onClick() {
                                    return _this11._handleImageTraceCancel();
                                }
                            },
                            LANG.cancel
                        ),
                        React.createElement(
                            'button',
                            {
                                className: 'btn btn-default pull-right',
                                onClick: function onClick() {
                                    return _this11._pushImageTrace();
                                }
                            },
                            LANG.okay
                        ),
                        React.createElement(
                            'button',
                            {
                                className: 'btn btn-default pull-right',
                                onClick: function onClick() {
                                    return _this11._calculateImageTrace();
                                }
                            },
                            LANG.apply
                        ),
                        React.createElement(
                            'button',
                            {
                                className: 'btn btn-default pull-right',
                                onClick: function onClick() {
                                    return _this11._backToTune();
                                }
                            },
                            LANG.back
                        )
                    );
                }
            }
        }, {
            key: '_renderContent',
            value: function _renderContent() {
                var _this12 = this;

                var renderContent = null;
                var canvasBackgroundUrl = PreviewModeBackgroundDrawer.getCameraCanvasUrl() || '';

                switch (this.state.currentStep) {
                    case STEP_OPEN:
                        renderContent = React.createElement('img', {
                            id: 'cameraCanvas',
                            onLoad: function onLoad() {
                                return _this12._cropCameraCanvas();
                            },
                            src: canvasBackgroundUrl
                        });
                        break;
                    case STEP_CROP:
                        renderContent = this._renderCropperModal();
                        break;
                    case STEP_TUNE:
                        renderContent = this._renderImageTraceModal();
                        break;
                    case STEP_APPLY:
                        renderContent = this._renderImageTraceModal();
                        break;
                    default:
                        break;
                }

                return renderContent;
            }
        }, {
            key: 'render',
            value: function render() {
                var renderContent = this._renderContent();
                var canvasBackgroundUrl = PreviewModeBackgroundDrawer.getCameraCanvasUrl() || '';

                return React.createElement(
                    'div',
                    { id: 'image-trace-panel-outer' },
                    renderContent
                );
            }
        }]);

        return ImageTracePanel;
    }(React.Component);

    ;
    return ImageTracePanel;
});