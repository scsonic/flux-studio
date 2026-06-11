'use strict';

define(['react', 'helpers/i18n', 'helpers/api/cloud'], function (React, i18n, CloudApi) {
    var LANG = i18n.lang.settings.flux_cloud;

    return React.createClass({
        getInitialState: function getInitialState() {
            return {
                email: ''
            };
        },

        _handleEnterEmail: function _handleEnterEmail(e) {
            this.setState({ email: e.target.value });
        },

        _handleBack: function _handleBack() {
            location.hash = '#studio/cloud/sign-in';
        },

        _handleNext: async function _handleNext() {
            var response = await CloudApi.resetPassword(this.state.email);
            if (response.ok) {
                location.hash = '#studio/cloud/email-sent';
            } else {
                alert(LANG.contact_us);
            }
        },

        render: function render() {
            return React.createElement(
                'div',
                { className: 'cloud' },
                React.createElement(
                    'div',
                    { className: 'container forgot-password' },
                    React.createElement(
                        'div',
                        { className: 'middle' },
                        React.createElement(
                            'div',
                            { className: 'description' },
                            React.createElement(
                                'h3',
                                null,
                                LANG.enter_email
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'controls' },
                            React.createElement(
                                'div',
                                { className: 'control' },
                                React.createElement('input', { type: 'text', placeholder: 'Email', onBlur: this._handleEnterEmail })
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'footer' },
                    React.createElement(
                        'div',
                        { className: 'divider' },
                        React.createElement('hr', null)
                    ),
                    React.createElement(
                        'div',
                        { className: 'actions' },
                        React.createElement(
                            'button',
                            { className: 'btn btn-cancel', onClick: this._handleBack },
                            LANG.back
                        ),
                        React.createElement(
                            'button',
                            { className: 'btn btn-default', onClick: this._handleNext },
                            LANG.next
                        )
                    )
                )
            );
        }

    });
});