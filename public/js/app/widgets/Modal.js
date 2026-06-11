'use strict';

define(['jquery', 'react', 'reactDOM', 'reactPropTypes', 'reactClassset', 'helpers/shortcuts', 'reactCreateReactClass'], function ($, React, ReactDOM, PropTypes, ReactCx, shortcuts) {

    var View = React.createClass({
        displayName: 'View',


        propTypes: {
            onOpen: PropTypes.func,
            onClose: PropTypes.func,
            content: PropTypes.element,
            className: PropTypes.object
        },

        getDefaultProps: function getDefaultProps() {
            return {
                onOpen: function onOpen() {},
                onClose: function onClose() {},
                content: React.createElement('div', null),
                disabledEscapeOnBackground: false,
                className: {}
            };
        },

        componentDidMount: function componentDidMount() {
            var self = this;

            self.onOpen();

            shortcuts.on(['esc'], function (e) {
                if (false === self.props.disabledEscapeOnBackground) {
                    self.props.onClose(e);
                }
            });
        },

        componentWillUnmount: function componentWillUnmount() {
            shortcuts.off(['esc']);
        },

        onOpen: function onOpen() {
            if (this.props.onOpen) {
                this.props.onOpen(this);
            }
        },

        _onClose: function _onClose(e) {
            ReactDOM.unmountComponentAtNode(View);
            this.props.onClose(e);
        },

        _onEscapeOnBackground: function _onEscapeOnBackground(e) {
            var self = this;

            if (false === self.props.disabledEscapeOnBackground) {
                self.props.onClose(e);
            }
        },

        render: function render() {
            var backgroundClass;

            this.props.className['modal-window'] = true;
            backgroundClass = ReactCx.cx(this.props.className);

            return React.createElement(
                'div',
                { className: backgroundClass },
                React.createElement('div', { className: 'modal-background', onClick: this._onEscapeOnBackground }),
                React.createElement(
                    'div',
                    { className: 'modal-body' },
                    this.props.children || this.props.content
                )
            );
        }
    });

    return View;
});