'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['Rx', 'app/actions/beambox/constant', 'app/actions/beambox', 'helpers/i18n'], function (Rx, Constant, BeamboxActions, i18n) {
    var LANG = i18n.lang.beambox.left_panel;

    var PreviewModeBackgroundDrawer = function () {
        function PreviewModeBackgroundDrawer() {
            _classCallCheck(this, PreviewModeBackgroundDrawer);

            this.canvas = document.createElement('canvas');
            this.cameraCanvasUrl = '';

            this.coordinates = {
                maxX: 0,
                maxY: 0,
                minX: 10000,
                minY: 10000
            };

            this.canvas.width = Constant.dimension.width;
            this.canvas.height = Constant.dimension.height;

            this.cameraOffset = null;
        }

        _createClass(PreviewModeBackgroundDrawer, [{
            key: 'start',
            value: function start(cameraOffset) {
                var _this = this;

                // { x, y, angle, scaleRatioX, scaleRatioY }
                this.cameraOffset = cameraOffset;

                this.backgroundDrawerSubject = new Rx.Subject();
                this.backgroundDrawerSubject.concatMap(function (p) {
                    return Rx.Observable.fromPromise(p);
                }).subscribe(function (blob) {
                    return _this._drawBlobToBackground(blob);
                });
            }
        }, {
            key: 'end',
            value: function end() {
                if (this.backgroundDrawerSubject) {
                    this.backgroundDrawerSubject.onCompleted();
                }
            }
        }, {
            key: 'draw',
            value: async function draw(imgUrl, x, y) {
                var last = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

                var p = this._prepareCroppedAndRotatedImgBlob(imgUrl, x, y, last);

                this.backgroundDrawerSubject.onNext(p);
                // await p;  if you want to know the time when image transfer to Blob, which is almost the same time background is drawn.
            }
        }, {
            key: 'drawBoundary',
            value: function drawBoundary() {
                var canvasBackground = svgedit.utilities.getElem('canvasBackground');
                var previewBoundary = this._getPreviewBoundary();

                canvasBackground.appendChild(previewBoundary);
            }
        }, {
            key: 'clearBoundary',
            value: function clearBoundary() {
                var canvasBackground = svgedit.utilities.getElem('canvasBackground');
                var previewBoundary = svgedit.utilities.getElem('previewBoundary');

                if (previewBoundary) {
                    canvasBackground.removeChild(previewBoundary);
                }
            }
        }, {
            key: 'isClean',
            value: function isClean() {
                return this.cameraCanvasUrl === '';
            }
        }, {
            key: 'clear',
            value: function clear() {
                if (this.isClean()) {
                    return;
                }

                window.svgCanvas.setBackground('#fff');

                // clear canvas
                this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);

                // reset cameraCanvasUrl
                URL.revokeObjectURL(this.cameraCanvasUrl);
                this.cameraCanvasUrl = '';
            }
        }, {
            key: 'getCameraCanvasUrl',
            value: function getCameraCanvasUrl() {
                return this.cameraCanvasUrl;
            }
        }, {
            key: 'getCoordinates',
            value: function getCoordinates() {
                return this.coordinates;
            }
        }, {
            key: 'resetCoordinates',
            value: function resetCoordinates() {
                this.coordinates.maxX = 0;
                this.coordinates.maxY = 0;
                this.coordinates.minX = 10000;
                this.coordinates.minY = 10000;
            }
        }, {
            key: '_drawBlobToBackground',
            value: function _drawBlobToBackground(blob) {
                if (this.cameraCanvasUrl) {
                    URL.revokeObjectURL(this.cameraCanvasUrl);
                }

                this.cameraCanvasUrl = URL.createObjectURL(blob);
                window.svgCanvas.setBackground('#fff', this.cameraCanvasUrl);
            }
        }, {
            key: '_prepareCroppedAndRotatedImgBlob',
            value: function _prepareCroppedAndRotatedImgBlob(imgUrl, x, y) {
                var _this2 = this;

                var last = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

                var img = new Image();
                img.src = imgUrl;

                return new Promise(function (resolve) {
                    img.onload = function () {
                        // free unused blob memory
                        URL.revokeObjectURL(imgUrl);

                        var img_regulated = _this2._cropAndRotateImg(img);

                        var dstX = x - img_regulated.width / 2;
                        var dstY = y - img_regulated.height / 2;

                        if (dstX > _this2.coordinates.maxX) {
                            _this2.coordinates.maxX = dstX;
                        }
                        if (dstX < _this2.coordinates.minX) {
                            _this2.coordinates.minX = dstX;
                        }
                        if (dstY > _this2.coordinates.maxY) {
                            _this2.coordinates.maxY = dstY;
                        }
                        if (dstY < _this2.coordinates.minY) {
                            _this2.coordinates.minY = dstY;
                        }

                        _this2.canvas.getContext('2d').drawImage(img_regulated, dstX, dstY);
                        _this2.canvas.toBlob(function (blob) {
                            resolve(blob);
                            if (last) {
                                setTimeout(function () {
                                    return BeamboxActions.endDrawingPreviewBlob();
                                }, 1000);
                            }
                        });
                    };
                });
            }
        }, {
            key: '_cropAndRotateImg',
            value: function _cropAndRotateImg(imageObj) {
                var _cameraOffset = this.cameraOffset,
                    angle = _cameraOffset.angle,
                    scaleRatioX = _cameraOffset.scaleRatioX,
                    scaleRatioY = _cameraOffset.scaleRatioY;


                var cvs = document.createElement('canvas');
                var ctx = cvs.getContext('2d');

                var a = angle;
                var w = imageObj.width;
                var h = imageObj.height;

                var l = h * scaleRatioY / (Math.cos(a) + Math.sin(a));
                cvs.width = cvs.height = l;
                ctx.translate(l / 2, l / 2);
                ctx.rotate(a);
                ctx.scale(scaleRatioX, scaleRatioY);
                ctx.drawImage(imageObj, -w / 2, -h / 2, w, h);

                return cvs;
            }
        }, {
            key: '_getPreviewBoundary',
            value: function _getPreviewBoundary() {
                var previewBoundaryId = 'previewBoundary';
                var color = 'rgba(200,200,200,0.8)';
                var uncapturabledHeight = this.cameraOffset.y * Constant.dpmm - Constant.camera.imgHeight * this.cameraOffset.scaleRatioY / 2;

                var svgdoc = document.getElementById('svgcanvas').ownerDocument;
                var NS = svgedit.NS;
                var boundaryGroup = svgdoc.createElementNS(NS.SVG, 'svg');
                var borderTop = svgdoc.createElementNS(NS.SVG, 'rect');
                var descText = svgdoc.createElementNS(NS.SVG, 'text');

                svgedit.utilities.assignAttributes(boundaryGroup, {
                    'id': previewBoundaryId,
                    'width': '100%',
                    'height': '100%',
                    'viewBox': '0 0 ' + Constant.dimension.width + ' ' + Constant.dimension.height,
                    'x': 0,
                    'y': 0,
                    'style': 'pointer-events:none'
                });

                svgedit.utilities.assignAttributes(borderTop, {
                    'width': Constant.dimension.width,
                    'height': uncapturabledHeight,
                    'x': 0,
                    'y': 0,
                    'fill': color,
                    'style': 'pointer-events:none'
                });

                svgedit.utilities.assignAttributes(descText, {
                    'font-size': 30,
                    'x': 10,
                    'y': 30,
                    'fill': '#fff',
                    'style': 'pointer-events:none'
                });

                var textNode = document.createTextNode(LANG.unpreviewable_area);

                descText.appendChild(textNode);

                boundaryGroup.appendChild(borderTop);
                boundaryGroup.appendChild(descText);

                return boundaryGroup;
            }
        }]);

        return PreviewModeBackgroundDrawer;
    }();

    var instance = new PreviewModeBackgroundDrawer();

    return instance;
});