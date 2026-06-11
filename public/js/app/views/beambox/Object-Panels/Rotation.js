'use strict';

define(['jquery', 'react', 'reactPropTypes', 'app/actions/beambox/svgeditor-function-wrapper', 'jsx!widgets/Unit-Input-v2', 'helpers/i18n'], function ($, React, PropTypes, FnWrapper, UnitInput, i18n) {
    'use strict';

    var LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            angle: PropTypes.number.isRequired
        },

        getInitialState: function getInitialState() {
            return {
                angle: this.props.angle
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                angle: nextProps.angle
            });
        },

        _update_angle_handler: function _update_angle_handler(angle) {
            FnWrapper.update_angle(angle);
            this.setState({ angle: angle });
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
                        LANG.rotation,
                        React.createElement(
                            'span',
                            { className: 'value' },
                            this.state.angle,
                            '\xB0'
                        )
                    ),
                    React.createElement(
                        'label',
                        { className: 'accordion-body' },
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(UnitInput, {
                                min: -180,
                                max: 180,
                                defaultUnitType: 'angle',
                                defaultUnit: '\xB0',
                                defaultValue: this.state.angle,
                                getValue: this._update_angle_handler
                            })
                        )
                    )
                )
            );
        }

    });
});