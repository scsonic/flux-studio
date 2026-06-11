'use strict';

define(['jquery', 'react', 'reactPropTypes', 'helpers/i18n'], function ($, React, PropTypes, i18n, localStorage) {
    'use strict';

    return React.createClass({
        PropTypes: {
            onJoin: PropTypes.func,
            onBack: PropTypes.func,
            wifiName: PropTypes.string
        },
        getInitialState: function getInitialState() {
            return {
                connecting: false
            };
        },
        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            console.log(nextProps);
        },
        _handleJoin: function _handleJoin() {
            this.setState({ connecting: true });
            this.props.onJoin();
        },
        _handleBack: function _handleBack() {
            this.props.onBack();
        },
        _renderActions: function _renderActions(lang) {
            return this.state.connecting ? React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    null,
                    React.createElement('img', { className: 'loading', src: 'img/ring.svg' })
                ),
                React.createElement(
                    'div',
                    null,
                    lang.wifi.set_password.connecting
                )
            ) : React.createElement(
                'div',
                { className: 'btn-h-group' },
                React.createElement(
                    'a',
                    { id: 'btn-cancel', className: 'btn', onClick: this._handleBack },
                    lang.wifi.set_password.back
                ),
                React.createElement(
                    'a',
                    { id: 'btn-join', className: 'btn', onClick: this._handleJoin },
                    lang.wifi.set_password.join
                )
            );
        },
        render: function render() {
            var lang = this.props.lang,
                actions = this._renderActions(lang);

            return React.createElement(
                'div',
                { className: 'wifi text-center' },
                React.createElement('img', { className: 'wifi-symbol', src: 'img/img-wifi-lock.png' }),
                React.createElement(
                    'div',
                    { className: 'wifi-form' },
                    React.createElement(
                        'h2',
                        null,
                        lang.wifi.set_password.line1,
                        this.props.wifiName,
                        lang.wifi.set_password.line2
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement('input', { ref: 'password', type: 'password', id: 'text-password',
                            placeholder: lang.wifi.set_password.password_placeholder, defaultValue: '' })
                    ),
                    actions
                )
            );
        }

    });
});