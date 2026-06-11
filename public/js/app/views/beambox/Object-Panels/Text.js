'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'reactPropTypes', 'app/actions/beambox/svgeditor-function-wrapper', 'app/actions/beambox/font-funcs', 'app/actions/progress-actions', 'app/constants/progress-constants', 'jsx!views/beambox/Object-Panels/text/FontFamily', 'jsx!views/beambox/Object-Panels/text/FontStyle', 'jsx!views/beambox/Object-Panels/text/FontSize', 'jsx!views/beambox/Object-Panels/text/LetterSpacing', 'jsx!views/beambox/Object-Panels/text/FontFill', 'helpers/i18n'], function (React, PropTypes, FnWrapper, FontFuncs, ProgressActions, ProgressConstants, FontFamilySelector, FontStyleSelector, FontSizeInput, LetterSpacingInput, IsFillCheckbox, i18n) {
    if (!window.electron) {
        console.log('font is not supported in web browser');
        return function () {
            return null;
        };
    }

    var LANG = i18n.lang.beambox.object_panels;

    var Text = function (_React$Component) {
        _inherits(Text, _React$Component);

        function Text(props) {
            _classCallCheck(this, Text);

            //should handle imported unusable font in other place,
            //font should e sanitized when user import new file

            var _this = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, props));

            var sanitizedDefaultFontFamily = function () {
                // use these font if props.fontFamily cannot find in user PC
                var fontFamilyFallback = ['PingFang TC', 'Arial', 'Times New Roman', 'Ubuntu', FontFuncs.availableFontFamilies[0]];

                var sanitizedFontFamily = [props.fontFamily].concat(fontFamilyFallback).find(function (f) {
                    return FontFuncs.availableFontFamilies.includes(f);
                });

                return sanitizedFontFamily;
            }();

            if (sanitizedDefaultFontFamily !== props.fontFamily) {
                console.log('unsupported font ' + props.fontFamily + ', fallback to ' + sanitizedDefaultFontFamily);
                FnWrapper.update_font_family(sanitizedDefaultFontFamily);
            }

            _this.state = {
                fontFamily: sanitizedDefaultFontFamily,
                fontStyle: FontFuncs.requestFontByFamilyAndStyle({
                    family: props.fontFamily,
                    weight: props.fontWeight,
                    italic: props.italic
                }).style,
                fontSize: props.fontSize,
                letterSpacing: props.letterSpacing,
                isFill: props.isFill
            };
            // this.state = {
            //     fontFamily: props.fontFamily,
            //     fontStyle: FontFuncs.requestFontByFamilyAndStyle({
            //         family: props.fontFamily,
            //         weight: props.fontWeight,
            //         italic: props.italic
            //     }).style,
            //     fontSize: props.fontSize,
            //     letterSpacing: props.letterSpacing,
            //     isFill: props.isFill
            // };
            return _this;
        }

        _createClass(Text, [{
            key: 'handleFontFamilyChange',
            value: function handleFontFamilyChange(newFamily) {
                // update family
                FnWrapper.update_font_family(newFamily);

                // new style
                var newStyle = FontFuncs.requestFontStylesOfTheFontFamily(newFamily)[0];

                // set fontFamily and change fontStyle
                this.setState({
                    fontFamily: newFamily
                }, this.handleFontStyleChange(newStyle));
            }
        }, {
            key: 'handleFontStyleChange',
            value: function handleFontStyleChange(val) {
                var font = FontFuncs.requestFontByFamilyAndStyle({
                    family: this.state.fontFamily,
                    style: val
                });
                FnWrapper.update_font_italic(font.italic);
                FnWrapper.update_font_weight(font.weight);
                this.setState({
                    fontStyle: val
                });
            }
        }, {
            key: 'handleFontSizeChange',
            value: function handleFontSizeChange(val) {
                FnWrapper.update_font_size(val);
                this.setState({
                    fontSize: val
                });
            }
        }, {
            key: 'handleLetterSpacingChange',
            value: function handleLetterSpacingChange(val) {
                FnWrapper.update_letter_spacing(val);
                this.setState({
                    letterSpacing: val
                });
            }
        }, {
            key: 'handleIsFillChange',
            value: function handleIsFillChange(val) {
                FnWrapper.update_font_is_fill(val);
                this.setState({
                    isFill: val
                });
            }
        }, {
            key: 'convertToPath',
            value: async function convertToPath() {
                var _this2 = this;

                ProgressActions.open(ProgressConstants.WAITING, LANG.wait_for_parsing_font);
                //delay FontFuncs.requestToConvertTextToPath() to ensure ProgressActions has already popup
                await new Promise(function (resolve) {
                    setTimeout(async function () {
                        await FontFuncs.requestToConvertTextToPath(_this2.props.$me);
                        resolve();
                    }, 50);
                });
                ProgressActions.close();

                FnWrapper.reset_select_mode();
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var fontStyles = FontFuncs.requestFontStylesOfTheFontFamily(this.state.fontFamily);
                return React.createElement(
                    'div',
                    { className: 'object-panel text-panel' },
                    React.createElement(
                        'label',
                        { className: 'controls accordion' },
                        React.createElement('input', { type: 'checkbox', className: 'accordion-switcher', defaultChecked: true }),
                        React.createElement(
                            'p',
                            { className: 'caption' },
                            LANG.text,
                            React.createElement(
                                'span',
                                { className: 'value' },
                                FontFuncs.fontNameMap.get(this.state.fontFamily),
                                ', ',
                                this.state.fontStyle
                            )
                        ),
                        React.createElement(
                            'label',
                            { className: 'accordion-body' },
                            React.createElement(
                                'div',
                                null,
                                React.createElement(
                                    'div',
                                    { className: 'control' },
                                    React.createElement(FontFamilySelector, {
                                        currentFontFamily: this.state.fontFamily,
                                        fontFamilyOptions: FontFuncs.availableFontFamilies,
                                        onChange: function onChange(val) {
                                            return _this3.handleFontFamilyChange(val);
                                        }
                                    })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'control' },
                                    React.createElement(FontStyleSelector, {
                                        currentFontStyle: this.state.fontStyle,
                                        fontStyleOptions: fontStyles,
                                        onChange: function onChange(val) {
                                            return _this3.handleFontStyleChange(val);
                                        }
                                    })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'control' },
                                    React.createElement(
                                        'div',
                                        { className: 'text-center header', style: { fontSize: '16px' } },
                                        LANG.font_size
                                    ),
                                    React.createElement(FontSizeInput, {
                                        currentFontSize: this.state.fontSize,
                                        onChange: function onChange(val) {
                                            return _this3.handleFontSizeChange(val);
                                        }
                                    })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'control' },
                                    React.createElement(
                                        'div',
                                        { className: 'text-center header', style: { fontSize: '16px' } },
                                        LANG.letter_spacing
                                    ),
                                    React.createElement(LetterSpacingInput, {
                                        currentLetterSpacing: this.state.letterSpacing,
                                        onChange: function onChange(val) {
                                            return _this3.handleLetterSpacingChange(val);
                                        }
                                    })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'control' },
                                    React.createElement(
                                        'div',
                                        { className: 'text-center header', style: { fontSize: '16px' } },
                                        LANG.fill
                                    ),
                                    React.createElement(IsFillCheckbox, {
                                        currentIsFill: this.state.isFill,
                                        onChange: function onChange(val) {
                                            return _this3.handleIsFillChange(val);
                                        }
                                    })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'control' },
                                    React.createElement(
                                        'button',
                                        {
                                            className: 'btn-default',
                                            onClick: function onClick() {
                                                return _this3.convertToPath();
                                            },
                                            title: LANG.convert_to_path_to_get_precise_result,
                                            style: {
                                                width: '100%',
                                                lineHeight: '1.5em'
                                            }
                                        },
                                        LANG.convert_to_path
                                    )
                                )
                            )
                        )
                    )
                );
            }
        }]);

        return Text;
    }(React.Component);

    Text.propTypes = {
        fontFamily: PropTypes.string.isRequired,
        fontWeight: PropTypes.number.isRequired,
        italic: PropTypes.bool.isRequired,
        fontSize: PropTypes.number.isRequired,
        letterSpacing: PropTypes.number.isRequired
    };

    return Text;
});