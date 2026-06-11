'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['react', 'reactDOM', 'jsx!views/beambox/Object-Panels/Object-Panels', 'app/actions/beambox/svgeditor-function-wrapper', 'app/actions/beambox/constant', 'app/actions/beambox/beambox-global-interaction'], function (React, ReactDOM, ObjectPanels, FnWrapper, Constant, BeamboxGlobalInteraction) {
    var _pixel2mm = function _pixel2mm(pixel_input) {
        var dpmm = Constant.dpmm;
        return Number(pixel_input) / dpmm;
    };

    var _toFixed = function _toFixed(val) {
        var decimal = 2;
        return Number(Number(val).toFixed(decimal));
    };

    var ObjectPanelsController = function () {
        function ObjectPanelsController() {
            _classCallCheck(this, ObjectPanelsController);

            this.reactRoot = '';
            this.isVisible = false;
            this.type = 'unknown';
            this.$me = $();
            this.data = {
                position: {
                    x: undefined, y: undefined
                },
                rotation: {
                    angle: undefined
                },
                size: {
                    width: undefined, height: undefined
                },
                ellipsePosition: {
                    cx: undefined, cy: undefined
                },
                ellipseRadius: {
                    rx: undefined, ry: undefined
                },
                rectRoundedCorner: {
                    rx: 0
                },
                line: {
                    x1: undefined, y1: undefined, x2: undefined, y2: undefined
                },
                image: {
                    threshold: undefined, shading: undefined
                },
                font: {
                    fontFamily: undefined, fontSize: undefined, fontWeight: undefined, italic: undefined, leterSpacing: undefined, isFill: undefined
                }
            };

            //bind all
            for (var obj = this; obj; obj = Object.getPrototypeOf(obj)) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = Object.getOwnPropertyNames(obj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var name = _step.value;

                        if (typeof this[name] === 'function') {
                            this[name] = this[name].bind(this);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        }

        _createClass(ObjectPanelsController, [{
            key: 'init',
            value: function init(reactRoot) {
                this.reactRoot = reactRoot;
            }
        }, {
            key: 'setVisibility',
            value: function setVisibility(isVisible) {
                this.isVisible = isVisible;
                if (isVisible) {
                    BeamboxGlobalInteraction.onObjectFocus();
                } else {
                    BeamboxGlobalInteraction.onObjectBlur();
                }
            }
        }, {
            key: 'setEditable',
            value: function setEditable(isEditable) {
                this.isEditable = isEditable;
            }
        }, {
            key: 'setType',
            value: function setType(type) {
                this.type = type;
            }
        }, {
            key: 'setMe',
            value: function setMe(theObject) {
                this.$me = theObject;
            }
        }, {
            key: 'setPosition',
            value: function setPosition(x, y) {
                this.data.position.x = _toFixed(_pixel2mm(x));
                this.data.position.y = _toFixed(_pixel2mm(y));
            }
        }, {
            key: 'setRotation',
            value: function setRotation(val) {
                this.data.rotation.angle = _toFixed(val);
            }
        }, {
            key: 'setWidth',
            value: function setWidth(val) {
                this.data.size.width = _toFixed(_pixel2mm(val));
            }
        }, {
            key: 'setHeight',
            value: function setHeight(val) {
                this.data.size.height = _toFixed(_pixel2mm(val));
            }
        }, {
            key: 'setEllipsePositionX',
            value: function setEllipsePositionX(val) {
                this.data.ellipsePosition.cx = _toFixed(_pixel2mm(val));
            }
        }, {
            key: 'setEllipsePositionY',
            value: function setEllipsePositionY(val) {
                this.data.ellipsePosition.cy = _toFixed(_pixel2mm(val));
            }
        }, {
            key: 'setEllipseRadiusX',
            value: function setEllipseRadiusX(val) {
                this.data.ellipseRadius.rx = _toFixed(_pixel2mm(val));
            }
        }, {
            key: 'setEllipseRadiusY',
            value: function setEllipseRadiusY(val) {
                this.data.ellipseRadius.ry = _toFixed(_pixel2mm(val));
            }
        }, {
            key: 'setRectRoundedCornerRadiusX',
            value: function setRectRoundedCornerRadiusX(val) {
                this.data.rectRoundedCorner.rx = _toFixed(_pixel2mm(val));
            }
        }, {
            key: 'setLineX1',
            value: function setLineX1(val) {
                this.data.line.x1 = _toFixed(_pixel2mm(val));
            }
        }, {
            key: 'setLineY1',
            value: function setLineY1(val) {
                this.data.line.y1 = _toFixed(_pixel2mm(val));
            }
        }, {
            key: 'setLineX2',
            value: function setLineX2(val) {
                this.data.line.x2 = _toFixed(_pixel2mm(val));
            }
        }, {
            key: 'setLineY2',
            value: function setLineY2(val) {
                this.data.line.y2 = _toFixed(_pixel2mm(val));
            }
        }, {
            key: 'setImageShading',
            value: function setImageShading(val) {
                this.data.image.shading = val;
            }
        }, {
            key: 'setImageThreshold',
            value: function setImageThreshold(val) {
                this.data.image.threshold = val;
            }
        }, {
            key: 'setFontFamily',
            value: function setFontFamily(val) {
                this.data.font.fontFamily = val;
            }
        }, {
            key: 'setFontSize',
            value: function setFontSize(val) {
                this.data.font.fontSize = val;
            }
        }, {
            key: 'setFontStyle',
            value: function setFontStyle(_ref) {
                var weight = _ref.weight,
                    italic = _ref.italic;

                this.data.font.fontWeight = weight;
                this.data.font.italic = italic;
            }
        }, {
            key: 'setLetterSpacing',
            value: function setLetterSpacing(val) {
                this.data.font.letterSpacing = val;
            }
        }, {
            key: 'setFontIsFill',
            value: function setFontIsFill(val) {
                this.data.font.isFill = val;
            }
        }, {
            key: 'isResizeFixed',
            value: function isResizeFixed() {
                var useSizePanel = ['rect', 'image', 'use'];
                var useRadiusPanel = ['ellipse'];

                if (useSizePanel.includes(this.type) || useRadiusPanel.includes(this.type)) {
                    return $('.object-panels #togglePreserveRatio').is(':checked');
                } else {
                    return false;
                }
            }
        }, {
            key: 'render',
            value: function render() {
                if (this.isVisible) {
                    this._render();
                } else {
                    this.unmount();
                }
            }
        }, {
            key: 'unmount',
            value: function unmount() {
                ReactDOM.unmountComponentAtNode(document.getElementById(this.reactRoot));
            }
        }, {
            key: '_render',
            value: function _render() {
                ReactDOM.render(React.createElement(ObjectPanels, {
                    isEditable: this.isEditable,
                    type: this.type,
                    data: this.data,
                    $me: this.$me
                }), document.getElementById(this.reactRoot));
            }
        }]);

        return ObjectPanelsController;
    }();

    var instance = new ObjectPanelsController();

    return instance;
});