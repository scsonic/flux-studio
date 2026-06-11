'use strict';

define(['react'], function (React) {
    'use strict';

    return React.createClass({

        getDefaultProps: function getDefaultProps() {
            return {
                title: '',
                textOn: '',
                textOff: '',
                defaultChecked: false,
                defaultValue: '',
                displayText: '',
                className: '',
                // events
                onClick: function onClick() {}
            };
        },

        // UI events
        _onClick: function _onClick(e) {
            this.state.checked = !this.state.checked;

            this.setState({
                checked: this.state.checked
            });

            this.props.onClick(e);
        },

        // Public function
        isChecked: function isChecked() {
            return this.state.checked;
        },

        // Lifecycle
        render: function render() {
            var props = this.props,
                lang = props.lang,
                stateStyle = true === this.state.checked ? 'on' : 'off',
                defaultClassName = 'ui ui-control-text-toggle',
                className = defaultClassName + ('string' === typeof this.props.className ? ' ' + this.props.className : '');

            return React.createElement(
                'label',
                { className: className, title: props.title },
                React.createElement(
                    'span',
                    { className: 'caption' },
                    props.displayText
                ),
                React.createElement('input', {
                    refs: 'toggle',
                    type: 'checkbox',
                    className: stateStyle,
                    defaultValue: props.defaultValue,
                    checked: this.state.checked,
                    onClick: this._onClick
                }),
                React.createElement('span', { className: 'status', 'data-text-on': props.textOn, 'data-text-off': props.textOff })
            );
        },

        getInitialState: function getInitialState() {
            return {
                checked: this.props.defaultChecked
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                checked: nextProps.defaultChecked
            });
        }

    });
});