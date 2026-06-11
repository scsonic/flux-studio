'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'jsx!widgets/Modal', 'jsx!widgets/Dropdown-Control', 'jsx!widgets/Switch-Control', 'jsx!widgets/Radio-Control', 'app/actions/beambox/beambox-preference', 'helpers/i18n'], function (React, Modal, DropDownControl, SwitchControl, RadioControl, BeamboxPreference, i18n) {
    var LANG = i18n.lang.beambox.left_panel.advanced_panel;

    // value is one of low, medium, high
    // onChange() will get one of low, medium, high
    var EngraveDpiSlider = function EngraveDpiSlider(_ref) {
        var value = _ref.value,
            onChange = _ref.onChange,
            onClick = _ref.onClick;

        var dpiMap = ['low', 'medium', 'high'];

        var sliderValue = dpiMap.indexOf(value);

        var onSliderValueChange = function onSliderValueChange(e) {
            var newSliderValue = e.target.value;
            var dpi = dpiMap[newSliderValue];
            onChange(dpi);
        };

        return React.createElement(
            'div',
            { className: 'controls', onClick: onClick },
            React.createElement(
                'div',
                { className: 'control' },
                React.createElement(
                    'span',
                    { className: 'label pull-left' },
                    LANG.engrave_dpi
                ),
                React.createElement('input', {
                    className: 'slider',
                    type: 'range',
                    min: 0,
                    max: 2,
                    value: sliderValue,
                    onChange: onSliderValueChange
                }),
                React.createElement('input', {
                    className: 'value',
                    type: 'text',
                    value: LANG[value],
                    disabled: true
                })
            )
        );
    };

    return function (_React$PureComponent) {
        _inherits(AdvancedPanel, _React$PureComponent);

        function AdvancedPanel() {
            _classCallCheck(this, AdvancedPanel);

            var _this = _possibleConstructorReturn(this, (AdvancedPanel.__proto__ || Object.getPrototypeOf(AdvancedPanel)).call(this));

            _this.state = {
                engraveDpi: BeamboxPreference.read('engrave_dpi'),
                rotaryMode: BeamboxPreference.read('rotary_mode')
            };
            return _this;
        }

        _createClass(AdvancedPanel, [{
            key: '_handleEngraveDpiChange',
            value: function _handleEngraveDpiChange(value) {
                this.setState({
                    engraveDpi: value
                });
            }
        }, {
            key: '_handleRotaryModeChange',
            value: function _handleRotaryModeChange(value) {
                this.setState({
                    rotaryMode: value
                });
                svgCanvas.setRotaryMode(value);
                svgCanvas.runExtensions('updateRotaryAxis');
            }
        }, {
            key: 'save',
            value: function save() {
                BeamboxPreference.write('engrave_dpi', this.state.engraveDpi);
                BeamboxPreference.write('rotary_mode', this.state.rotaryMode);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                return React.createElement(
                    Modal,
                    { onClose: function onClose() {
                            return _this2.props.onClose();
                        } },
                    React.createElement(
                        'div',
                        { className: 'advanced-panel' },
                        React.createElement(
                            'section',
                            { className: 'main-content' },
                            React.createElement(
                                'div',
                                { className: 'title' },
                                LANG.engrave_parameters
                            ),
                            React.createElement(EngraveDpiSlider, {
                                value: this.state.engraveDpi,
                                onChange: function onChange(val) {
                                    return _this2._handleEngraveDpiChange(val);
                                }
                            }),
                            React.createElement(SwitchControl, {
                                id: 'rotary_mode',
                                name: 'rotary_mode',
                                label: LANG.rotary_mode,
                                'default': this.state.rotaryMode,
                                onChange: function onChange(id, val) {
                                    return _this2._handleRotaryModeChange(val);
                                } })
                        ),
                        React.createElement(
                            'section',
                            { className: 'footer' },
                            React.createElement(
                                'button',
                                {
                                    className: 'btn btn-default pull-right',
                                    onClick: function onClick() {
                                        return _this2.props.onClose();
                                    }
                                },
                                LANG.cancel
                            ),
                            React.createElement(
                                'button',
                                {
                                    className: 'btn btn-default pull-right',
                                    onClick: function onClick() {
                                        _this2.save();
                                        _this2.props.onClose();
                                    }
                                },
                                LANG.save
                            )
                        )
                    )
                );
            }
        }]);

        return AdvancedPanel;
    }(React.PureComponent);
});