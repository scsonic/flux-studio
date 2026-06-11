'use strict';

define(['jquery', 'react', 'reactPropTypes', 'app/actions/beambox/svgeditor-function-wrapper', 'jsx!widgets/Unit-Input-v2', 'helpers/i18n', 'app/actions/beambox/constant'], function ($, React, PropTypes, FnWrapper, UnitInput, i18n, Constant) {
    'use strict';

    var LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
            type: PropTypes.oneOf(['rect', 'image', 'use']).isRequired
        },

        getInitialState: function getInitialState() {
            return {
                x: this.props.x,
                y: this.props.y
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                x: nextProps.x,
                y: nextProps.y
            });
        },

        _update_x_handler: function _update_x_handler(x) {
            if (this.props.type === 'use') {
                svgCanvas.setSvgElemPosition('x', x * Constant.dpmm);
            } else {
                FnWrapper.update_selected_x(x);
            }
            this.setState({ x: x });
        },
        _update_y_handler: function _update_y_handler(y) {
            if (this.props.type === 'use') {
                svgCanvas.setSvgElemPosition('y', y * Constant.dpmm);
            } else {
                FnWrapper.update_selected_y(y);
            }
            this.setState({ y: y });
        },

        getValueCaption: function getValueCaption() {
            var x = this.state.x,
                y = this.state.y,
                units = localStorage.getItem('default-units', 'mm');
            if (units === 'inches') {
                return Number(x / 25.4).toFixed(3) + '", ' + Number(y / 25.4).toFixed(3) + '"';
            } else {
                return x + ', ' + y + ' mm';
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
                        LANG.position,
                        React.createElement(
                            'span',
                            { className: 'value' },
                            this.getValueCaption()
                        )
                    ),
                    React.createElement(
                        'label',
                        { className: 'accordion-body' },
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'span',
                                { className: 'text-center header' },
                                'X'
                            ),
                            React.createElement(UnitInput, {
                                unit: 'mm',
                                defaultValue: this.state.x,
                                getValue: this._update_x_handler
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
                                unit: 'mm',
                                defaultValue: this.state.y,
                                getValue: this._update_y_handler
                            })
                        )
                    )
                )
            );
        }

    });
});