'use strict';

define(['jquery', 'react', 'reactPropTypes', 'app/actions/beambox/svgeditor-function-wrapper', 'jsx!widgets/Unit-Input-v2', 'helpers/i18n', 'app/actions/beambox/constant'], function ($, React, PropTypes, FnWrapper, UnitInput, i18n, Constant) {
    'use strict';

    var LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            rx: PropTypes.number.isRequired,
            ry: PropTypes.number.isRequired
        },

        getInitialState: function getInitialState() {
            return {
                rx: this.props.rx,
                ry: this.props.ry,
                isRatioPreserve: false
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                rx: nextProps.rx,
                ry: nextProps.ry
            });
        },

        _update_rx_handler: function _update_rx_handler(val) {
            val = val / 2;
            if (this.state.isRatioPreserve) {
                var ry = val * (this.state.ry / this.state.rx);
                FnWrapper.update_ellipse_ry(ry);
                this.setState({ ry: ry });
            }
            FnWrapper.update_ellipse_rx(val);
            this.setState({ rx: val });
        },
        _update_ry_handler: function _update_ry_handler(val) {
            val = val / 2;
            if (this.state.isRatioPreserve) {
                var rx = val * (this.state.rx / this.state.ry);
                FnWrapper.update_ellipse_rx(rx);
                this.setState({ rx: rx });
            }
            FnWrapper.update_ellipse_ry(val);
            this.setState({ ry: val });
        },
        _ratio_handler: function _ratio_handler(e) {
            this.setState({
                isRatioPreserve: e.target.checked
            });
        },
        getValueCaption: function getValueCaption() {
            var rx = this.state.rx,
                ry = this.state.ry,
                units = localStorage.getItem('default-units', 'mm');
            if (units === 'inches') {
                return Number(rx * 2 / 25.4).toFixed(3) + '", ' + Number(ry * 2 / 25.4).toFixed(3) + '"';
            } else {
                return rx * 2 + ', ' + ry * 2 + ' mm';
            }
        },
        render: function render() {
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
                        LANG.ellipse_radius,
                        React.createElement(
                            'span',
                            { className: 'value' },
                            this.getValueCaption()
                        )
                    ),
                    React.createElement(
                        'label',
                        { className: 'accordion-body  with-lock' },
                        React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'div',
                                { className: 'control' },
                                React.createElement(
                                    'span',
                                    { className: 'text-center header' },
                                    'X'
                                ),
                                React.createElement(UnitInput, {
                                    min: 0,
                                    max: Constant.dimension.width / Constant.dpmm,
                                    unit: 'mm',
                                    defaultValue: this.state.rx * 2,
                                    getValue: this._update_rx_handler
                                })
                            ),
                            React.createElement(
                                'div',
                                { className: 'control' },
                                React.createElement(
                                    'span',
                                    { className: 'text-center header' },
                                    'Y'
                                ),
                                React.createElement(UnitInput, {
                                    min: 0,
                                    max: Constant.dimension.height / Constant.dpmm,
                                    unit: 'mm',
                                    defaultValue: this.state.ry * 2,
                                    getValue: this._update_ry_handler
                                })
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'lock' },
                            React.createElement('input', { type: 'checkbox', checked: this.state.isRatioPreserve, id: 'togglePreserveRatio', onChange: this._ratio_handler, hidden: true }),
                            React.createElement(
                                'label',
                                { htmlFor: 'togglePreserveRatio', title: LANG.lock_desc },
                                React.createElement(
                                    'div',
                                    null,
                                    '\u2510'
                                ),
                                React.createElement('i', { className: this.state.isRatioPreserve ? "fa fa-lock locked" : "fa fa-unlock-alt unlocked" }),
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

    });
});