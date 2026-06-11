'use strict';

define(['react', 'reactPropTypes', 'plugins/classnames/index'], function (React, PropTypes, ClassNames) {
    'use strict';

    return React.createClass({

        propTypes: {
            id: PropTypes.string,
            label: PropTypes.string,
            default: PropTypes.array,
            options: PropTypes.array.isRequired,
            onChange: PropTypes.func.isRequired
        },

        getInitialState: function getInitialState() {
            var selected = this.props.default;
            return { selected: selected };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            var _new = JSON.stringify(nextProps.default),
                _old = JSON.stringify(this.state.selected);

            if (_new !== _old) {
                this.setState({ selected: nextProps.default });
            }
        },

        _handleToggleChange: function _handleToggleChange(id) {
            var selected = this.state.selected;

            if (selected.indexOf(id) === -1) {
                selected.push(id);
            } else {
                var i = selected.indexOf(id);
                selected = selected.slice(0, i).concat(selected.slice(i + 1));
            }

            this.props.onChange(this.props.id, selected, id);
        },

        render: function render() {
            var _options = this.props.options.map(function (option) {
                var checkboxClass = ClassNames({ 'selected': this.state.selected.indexOf(option.id) !== -1 });
                return React.createElement(
                    'div',
                    { className: 'checkbox', onClick: this._handleToggleChange.bind(null, option.id) },
                    React.createElement('div', { className: checkboxClass }),
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