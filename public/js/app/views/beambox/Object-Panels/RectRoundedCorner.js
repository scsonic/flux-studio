'use strict';

define(['jquery', 'react', 'reactPropTypes', 'app/actions/beambox/svgeditor-function-wrapper', 'jsx!widgets/Unit-Input-v2', 'helpers/i18n', 'app/actions/beambox/constant'], function ($, React, PropTypes, FnWrapper, UnitInput, i18n, Constant) {

    var LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            rx: PropTypes.number.isRequired
        },

        getInitialState: function getInitialState() {
            return {
                rx: this.props.rx
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                rx: nextProps.rx
            });
        },

        _update_rx_handler: function _update_rx_handler(val) {
            FnWrapper.update_ellipse_rx(val);
            this.setState({ rx: val });
        },

        getValueCaption: function getValueCaption() {
            var rx = this.state.rx,
                units = localStorage.getItem('default-units', 'mm');
            if (units === 'inches') {
                return Number(rx / 25.4).toFixed(3) + '"';
            } else {
                return rx + ' mm';
            }
        },

        render: function render() {
            return React.createElement(
                'div',
                { className: 'object-panel' },
                React.createElement(
                    'label',
                    { className: 'controls accordion' },
                    React.createElement('input', { type: 'checkbox', className: 'accordion-switcher', defaultChecked: false }),
                    React.createElement(
                        'p',
                        { className: 'caption' },
                        LANG.rounded_corner,
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
                                    LANG.radius
                                ),
                                React.createElement(UnitInput, {
                                    min: 0,
                                    max: Constant.dimension.width / Constant.dpmm,
                                    unit: 'mm',
                                    defaultValue: this.state.rx,
                                    getValue: this._update_rx_handler
                                })
                            )
                        )
                    )
                )
            );
        }
    });
});