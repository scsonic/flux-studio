'use strict';

define(['jquery', 'react', 'reactPropTypes', 'app/actions/beambox/svgeditor-function-wrapper', 'jsx!widgets/Unit-Input-v2', 'helpers/i18n', 'app/actions/beambox/constant'], function ($, React, PropTypes, FnWrapper, UnitInput, i18n, Constant) {
    'use strict';

    var LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            cx: PropTypes.number.isRequired,
            cy: PropTypes.number.isRequired
        },

        getInitialState: function getInitialState() {
            return {
                cx: this.props.cx,
                cy: this.props.cy
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                cx: nextProps.cx,
                cy: nextProps.cy
            });
        },

        _update_cx_handler: function _update_cx_handler(val) {
            FnWrapper.update_ellipse_cx(val);
            this.setState({ cx: val });
        },
        _update_cy_handler: function _update_cy_handler(val) {
            FnWrapper.update_ellipse_cy(val);
            this.setState({ cy: val });
        },
        getValueCaption: function getValueCaption() {
            var cx = this.state.cx,
                cy = this.state.cy,
                units = localStorage.getItem('default-units', 'mm');
            if (units === 'inches') {
                return Number(cx / 25.4).toFixed(3) + '", ' + Number(cy / 25.4).toFixed(3) + '"';
            } else {
                return cx + ', ' + cy + ' mm';
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
                        LANG.center,
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
                                min: 0,
                                max: Constant.dimension.width / Constant.dpmm,
                                unit: 'mm',
                                defaultValue: this.state.cx,
                                getValue: this._update_cx_handler
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
                                defaultValue: this.state.cy,
                                getValue: this._update_cy_handler
                            })
                        )
                    )
                )
            );
        }

    });
});