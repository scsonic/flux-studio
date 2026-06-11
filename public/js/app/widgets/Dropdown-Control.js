'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

define(['react', 'reactPropTypes', 'plugins/classnames/index'], function (React, PropTypes, ClassNames) {
    'use strict';

    return React.createClass({

        propTypes: {
            id: PropTypes.string.isRequired,
            label: PropTypes.string,
            options: PropTypes.array,
            default: PropTypes.string,
            onChange: PropTypes.func.isRequired
        },

        getInitialState: function getInitialState() {
            return {
                selectedValue: this.props.default
            };
        },

        shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
            var newPropIsDifferent = nextProps.default !== this.state.sliderValue,
                newStateIsDifferent = this.state.selectedValue !== nextState.selectedValue;

            return newPropIsDifferent || newStateIsDifferent;
        },

        _fireChange: function _fireChange(newValue, selectedIndex) {
            if (this.props.id) {
                this.props.onChange(this.props.id, newValue, selectedIndex);
            } else {
                this.props.onChange(newValue, selectedIndex);
            }
        },

        _handleChange: function _handleChange(e) {
            var _e$target = e.target,
                value = _e$target.value,
                selectedIndex = _e$target.selectedIndex;

            this.setState({ selectedValue: value }, function () {
                this._fireChange(value, selectedIndex);
            });
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            if (nextProps.options.length !== this.props.options.length) {
                this.forceUpdate();
            }
        },

        render: function render() {
            var self = this,
                _options;

            _options = this.props.options.map(function (option) {
                if ((typeof option === 'undefined' ? 'undefined' : _typeof(option)) === 'object') {
                    return React.createElement(
                        'option',
                        { key: option.value, value: option.value },
                        option.label
                    );
                } else {
                    return React.createElement(
                        'option',
                        { key: option, value: option },
                        option
                    );
                }
            });

            var firstChildSelected = this.props.options ? this.state.selectedValue === this.props.options[0].value : false;
            var classNames = firstChildSelected ? 'dropdown-container first-child-selected' : 'dropdown-container';

            return React.createElement(
                'div',
                { className: 'controls' },
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
                        { className: classNames },
                        React.createElement(
                            'select',
                            { id: this.props.id, onChange: this._handleChange, defaultValue: self.props.default },
                            _options
                        )
                    )
                )
            );
        }

    });
});