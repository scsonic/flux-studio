'use strict';

define(['react', 'reactDOM', 'reactPropTypes'], function (React, ReactDOM, PropTypes) {
    'use strict';

    return React.createClass({
        // Public
        value: function value() {
            return ReactDOM.findDOMNode(this.refs.textInput).value;
        },

        // Lifecycle
        render: function render() {
            return React.createElement('input', {
                ref: 'textInput',
                className: 'ui ui-control-text-input',
                type: 'text',
                defaultValue: this.props.displayValue
            });
        },

        propTypes: {
            defaultValue: PropTypes.string
        }
    });
});