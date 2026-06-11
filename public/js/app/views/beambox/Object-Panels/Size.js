'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['jquery', 'react', 'reactPropTypes', 'app/actions/beambox/svgeditor-function-wrapper', 'jsx!widgets/Unit-Input-v2', 'helpers/i18n', 'app/actions/beambox/constant'], function ($, React, PropTypes, FnWrapper, UnitInput, i18n, Constant) {

    var LANG = i18n.lang.beambox.object_panels;

    var SizePanel = function (_React$Component) {
        _inherits(SizePanel, _React$Component);

        function SizePanel(props) {
            _classCallCheck(this, SizePanel);

            var _this = _possibleConstructorReturn(this, (SizePanel.__proto__ || Object.getPrototypeOf(SizePanel)).call(this, props));

            _this.state = {
                width: props.width,
                height: props.height,
                isRatioPreserve: props.type !== 'rect'
            };

            _this.propTypes = {
                width: PropTypes.number.isRequired,
                height: PropTypes.number.isRequired,
                type: PropTypes.oneOf(['rect', 'image', 'use']).isRequired
            };
            return _this;
        }

        _createClass(SizePanel, [{
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                this.setState({
                    width: nextProps.width,
                    height: nextProps.height
                });
            }
        }, {
            key: '_updateWidth',
            value: function _updateWidth(val) {
                switch (this.props.type) {
                    case 'rect':
                        FnWrapper.update_rect_width(val);
                        break;
                    case 'image':
                        FnWrapper.update_image_width(val);
                        break;
                    case 'polygon':
                    case 'path':
                        svgCanvas.setSvgElemSize('width', val * Constant.dpmm);
                        break;
                    case 'use':
                        svgCanvas.setSvgElemSize('width', val * Constant.dpmm);
                        break;
                }

                this.setState({ width: val });
            }
        }, {
            key: '_updateHeight',
            value: function _updateHeight(val) {
                switch (this.props.type) {
                    case 'rect':
                        FnWrapper.update_rect_height(val);
                        break;
                    case 'image':
                        FnWrapper.update_image_height(val);
                        break;
                    case 'polygon':
                    case 'path':
                        svgCanvas.setSvgElemSize('height', val * Constant.dpmm);
                        break;
                    case 'use':
                        svgCanvas.setSvgElemSize('height', val * Constant.dpmm);
                        break;
                }

                this.setState({ height: val });
            }
        }, {
            key: 'handleUpdateWidth',
            value: function handleUpdateWidth(val) {
                var _state = this.state,
                    width = _state.width,
                    height = _state.height,
                    isRatioPreserve = _state.isRatioPreserve;


                if (isRatioPreserve) {
                    var constraintHeight = Number((val * height / width).toFixed(2));

                    this._updateHeight(constraintHeight);
                }

                this._updateWidth(val);
            }
        }, {
            key: 'handleUpdateHeight',
            value: function handleUpdateHeight(val) {
                var _state2 = this.state,
                    width = _state2.width,
                    height = _state2.height,
                    isRatioPreserve = _state2.isRatioPreserve;


                if (isRatioPreserve) {
                    var constraintWidth = Number((val * width / height).toFixed(2));

                    this._updateWidth(constraintWidth);
                }

                this._updateHeight(val);
            }
        }, {
            key: 'handleRatio',
            value: function handleRatio(e) {
                this.setState({ isRatioPreserve: e.target.checked });
            }
        }, {
            key: 'getValueCaption',
            value: function getValueCaption() {
                var width = this.state.width,
                    height = this.state.height,
                    units = localStorage.getItem('default-units', 'mm');
                if (units === 'inches') {
                    return Number(width / 25.4).toFixed(3) + '" x ' + Number(height / 25.4).toFixed(3) + '"';
                } else {
                    return width + ' x ' + height + ' mm';
                }
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _state3 = this.state,
                    width = _state3.width,
                    height = _state3.height,
                    isRatioPreserve = _state3.isRatioPreserve;


                return React.createElement(
                    'div',
                    { className: 'object-panel' },
                    React.createElement(
                        'label',
                        { className: 'controls accordion' },
                        React.createElement('input', { type: 'checkbox', className: 'accordion-switcher', defaultChecked: true }),
                        React.createElement(
                            'p',
                            { className: 'caption' },
                            LANG.size,
                            React.createElement(
                                'span',
                                { className: 'value' },
                                this.getValueCaption()
                            )
                        ),
                        React.createElement(
                            'label',
                            { className: 'accordion-body with-lock' },
                            React.createElement(
                                'div',
                                null,
                                React.createElement(
                                    'div',
                                    { className: 'control' },
                                    React.createElement(
                                        'span',
                                        { className: 'text-center header' },
                                        LANG.width
                                    ),
                                    React.createElement(UnitInput, {
                                        min: 0,
                                        unit: 'mm',
                                        defaultValue: width,
                                        getValue: function getValue(val) {
                                            return _this2.handleUpdateWidth(val);
                                        }
                                    })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'control' },
                                    React.createElement(
                                        'span',
                                        { className: 'text-center header' },
                                        LANG.height
                                    ),
                                    React.createElement(UnitInput, {
                                        min: 0,
                                        unit: 'mm',
                                        defaultValue: height,
                                        getValue: function getValue(val) {
                                            return _this2.handleUpdateHeight(val);
                                        }
                                    })
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'lock' },
                                React.createElement('input', { type: 'checkbox', checked: isRatioPreserve, id: 'togglePreserveRatio', onChange: function onChange(e) {
                                        return _this2.handleRatio(e);
                                    }, hidden: true }),
                                React.createElement(
                                    'label',
                                    { htmlFor: 'togglePreserveRatio', title: LANG.lock_desc },
                                    React.createElement(
                                        'div',
                                        null,
                                        '\u2510'
                                    ),
                                    React.createElement('i', { className: isRatioPreserve ? 'fa fa-lock locked' : 'fa fa-unlock-alt unlocked' }),
                                    React.createElement(
                                        'div',
                                        null,
                                        '\u2518'
                                    )
                                )
                            )
                        )
                    )
                );
            }
        }]);

        return SizePanel;
    }(React.Component);

    ;

    return SizePanel;
});