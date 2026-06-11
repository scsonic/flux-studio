'use strict';

define(['react', 'reactPropTypes', 'plugins/classnames/index'], function (React, PropTypes, ClassNames) {
    'use strict';

    return React.createClass({

        propTypes: {
            id: PropTypes.string.isRequired,
            label: PropTypes.string,
            default: PropTypes.bool,
            onChange: PropTypes.func.isRequired
        },

        getInitialState: function getInitialState() {
            return {
                checked: this.props.default
            };
        },

        shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
            var newPropIsDifferent = nextProps.default !== this.state.checked,
                newStateIsDifferent = this.state.checked !== nextState.checked;

            return newPropIsDifferent || newStateIsDifferent;
        },

        _fireChange: function _fireChange(newValue) {
            this.props.onChange(this.props.id, newValue);
        },

        _handleToggle: function _handleToggle(e) {
            var isChecked = e.target.checked;
            this.setState({ checked: isChecked }, function () {
                this._fireChange(isChecked);
            });
        },

        render: function render() {
            return React.createElement(
                'div',
                { className: 'controls', name: this.props.id },
                React.createElement(
                    'div',
                    { className: 'label pull-left' },
                    this.props.label
                ),
                React.createElement(
                    'div',
                    { className: 'control' },
                    React.createElement(
                        'div',
                        { className: 'switch-container' },
                        React.createElement(
                            'div',
                            { className: 'switch-status' },
                            this.state.checked ? 'ON' : 'OFF'
                        ),
                        React.createElement(
                            'div',
                            { className: 'onoffswitch', name: this.props.name || '' },
                            React.createElement('input', { type: 'checkbox', name: 'onoffswitch', className: 'onoffswitch-checkbox', id: this.props.id,
                                onChange: this._handleToggle,
                                checked: this.state.checked }),
                            React.createElement(
                                'label',
                                { className: 'onoffswitch-label', htmlFor: this.props.id },
                                React.createElement('span', { className: 'onoffswitch-inner' }),
                                React.createElement('span', { className: 'onoffswitch-switch' })
                            )
                        )
                    )
                )
            );
        }

    });
});