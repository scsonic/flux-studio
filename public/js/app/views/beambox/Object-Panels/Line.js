'use strict';

define(['jquery', 'react', 'reactPropTypes', 'app/actions/beambox/svgeditor-function-wrapper', 'jsx!widgets/Unit-Input-v2', 'helpers/i18n', 'app/actions/beambox/constant'], function ($, React, PropTypes, FnWrapper, UnitInput, i18n, Constant) {
    'use strict';

    var LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            x1: PropTypes.number.isRequired,
            y1: PropTypes.number.isRequired,
            x2: PropTypes.number.isRequired,
            y2: PropTypes.number.isRequired
        },

        getInitialState: function getInitialState() {
            return {
                x1: this.props.x1,
                y1: this.props.y1,
                x2: this.props.x2,
                y2: this.props.y2
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                x1: nextProps.x1,
                y1: nextProps.y1,
                x2: nextProps.x2,
                y2: nextProps.y2
            });
        },

        _update_x1_handler: function _update_x1_handler(val) {
            FnWrapper.update_line_x1(val);
            this.setState({ x1: val });
        },
        _update_y1_handler: function _update_y1_handler(val) {
            FnWrapper.update_line_y1(val);
            this.setState({ y1: val });
        },
        _update_x2_handler: function _update_x2_handler(val) {
            FnWrapper.update_line_x2(val);
            this.setState({ x2: val });
        },
        _update_y2_handler: function _update_y2_handler(val) {
            FnWrapper.update_line_y2(val);
            this.setState({ y2: val });
        },
        getValueCaption: function getValueCaption() {
            var x1 = this.state.x1,
                y1 = this.state.y1,
                x2 = this.state.x2,
                y2 = this.state.y2,
                units = localStorage.getItem('default-units', 'mm');
            if (units === 'inches') {
                return 'A (' + Number(x1 / 25.4).toFixed(2) + ', ' + Number(y1 / 25.4).toFixed(2) + '), B (' + Number(x2 / 25.4).toFixed(2) + ', ' + Number(y2 / 25.4).toFixed(2) + ')';
            } else {
                return 'A (' + x1 + ', ' + y1 + '), B (' + x2 + ', ' + y2 + ')';
            }
        },
        render: function render() {
            return React.createElement(
                'div',
                { className: 'object-panel' },
                React.createElement(
                    'label',
                    { className: 'controls accordion' },
                    React.createElement('input', { type: 'checkbox', className: 'accordion-switcher' }),
                    React.createElement(
                        'p',
                        { className: 'caption' },
                        LANG.points,
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
                                'A'
                            ),
                            React.createElement(
                                'span',
                                null,
                                React.createElement(UnitInput, {
                                    min: 0,
                                    max: Constant.dimension.width / Constant.dpmm,
                                    unit: 'mm',
                                    abbr: true,
                                    defaultValue: this.state.x1,
                                    getValue: this._update_x1_handler,
                                    className: { 'input-halfsize': true }
                                }),
                                React.createElement(UnitInput, {
                                    min: 0,
                                    max: Constant.dimension.height / Constant.dpmm,
                                    unit: 'mm',
                                    abbr: true,
                                    defaultValue: this.state.y1,
                                    getValue: this._update_y1_handler,
                                    className: { 'input-halfsize': true }
                                })
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'span',
                                { className: 'text-center header' },
                                'B'
                            ),
                            React.createElement(
                                'span',
                                null,
                                React.createElement(UnitInput, {
                                    min: 0,
                                    max: Constant.dimension.width / Constant.dpmm,
                                    unit: 'mm',
                                    abbr: true,
                                    defaultValue: this.state.x2,
                                    getValue: this._update_x2_handler,
                                    className: { 'input-halfsize': true }
                                }),
                                React.createElement(UnitInput, {
                                    min: 0,
                                    max: Constant.dimension.height / Constant.dpmm,
                                    unit: 'mm',
                                    abbr: true,
                                    defaultValue: this.state.y2,
                                    getValue: this._update_y2_handler,
                                    className: { 'input-halfsize': true }
                                })
                            )
                        )
                    )
                )
            );
        }

    });
});