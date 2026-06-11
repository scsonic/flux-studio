'use strict';

define(['react', 'reactPropTypes', 'plugins/classnames/index'], function (React, PropTypes, ClassNames) {
    'use strict';

    return React.createClass({

        propTypes: {
            id: PropTypes.string,
            label: PropTypes.string,
            default: PropTypes.string,
            options: PropTypes.array.isRequired,
            onChange: PropTypes.func.isRequired
        },

        getInitialState: function getInitialState() {
            return {
                selected: this.props.default,
                default: this.props.options[0].id
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            var _new = nextProps.default,
                _old = this.state.selected;

            if (_new !== _old) {
                this.setState({ selected: nextProps.default });
            }
        },


        _handleChange: function _handleChange(newValue, disable) {
            if (disable !== true) {
                this.setState({ selected: newValue });
                this.props.onChange(this.props.id, newValue);
            }
        },

        render: function render() {
            var _options = this.props.options.map(function (option) {
                var radioClass = ClassNames({ 'selected': this.state.selected === option.id });
                return React.createElement(
                    'div',
                    { key: option.id, className: 'radio ' + option.id, onClick: this._handleChange.bind(null, option.id, option.disable) },
                    React.createElement('div', { className: radioClass }),
                    React.createElement(
                        'span',
                        null,
                        option.name
                    )
                );
            }.bind(this));

            return React.createElement(
                'div',
                { className: 'controls' },
                React.createElement(
                    'div',
                    { className: 'label' },
                    this.props.label
                ),
                React.createElement(
                    'div',
                    { className: 'control' },
                    _options
                )
            );
        }

    });
});