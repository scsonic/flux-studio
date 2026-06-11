'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['react', 'helpers/i18n', 'helpers/sprintf', 'helpers/api/cloud', 'plugins/classnames/index'], function (React, i18n, Sprintf, CloudApi, ClassNames) {
    var LANG = i18n.lang.settings.flux_cloud;
    return React.createClass({

        getInitialState: function getInitialState() {
            return {
                email: '',
                password: '',
                processing: false,
                showResendVerificationEmail: false
            };
        },

        componentDidMount: async function componentDidMount() {
            var response = await CloudApi.getMe();
            if (response.ok) {
                var responseBody = response.json();
                if (responseBody) {
                    location.hash = '#/studio/cloud/bind-machine';
                }
            }
        },

        _handleForgotPassword: function _handleForgotPassword() {
            location.hash = '#/studio/cloud/forgot-password';
        },

        _handleEditValue: function _handleEditValue(e) {
            var _e$target = e.target,
                id = _e$target.id,
                value = _e$target.value;

            this.setState(_defineProperty({}, id, value));
        },

        _handleDetectEnterKey: function _handleDetectEnterKey(e) {
            if (e.key === 'Enter') {
                this._handleSignIn(e);
            }
        },

        _handleCancel: function _handleCancel() {
            location.hash = '#/studio/print';
        },

        _handleResendVerificationEmail: async function _handleResendVerificationEmail() {
            var email = this.state.email;


            var response = await CloudApi.resendVerification(email);
            if (response.ok) {
                location.hash = '#studio/cloud/email-sent';
            } else {
                alert(LANG.contact_us);
            }
        },

        _handleSignIn: async function _handleSignIn(e) {
            e.preventDefault();
            var _state = this.state,
                email = _state.email,
                password = _state.password;


            this.setState({
                errorMessage: '',
                processing: true
            });

            var response = await CloudApi.signIn(email, password);
            var responseBody = await response.json();
            if (response.ok) {
                var nickname = responseBody.nickname;

                var displayName = nickname || email;
                location.hash = '#/studio/cloud/bind-machine';
            } else {
                if (response.status !== 200) {
                    this.setState({
                        errorMessage: LANG[responseBody.message.toLowerCase()] || LANG.SERVER_INTERNAL_ERROR,
                        processing: false
                    });
                    return;
                }
                this.setState({
                    showResendVerificationEmail: responseBody.message === 'NOT_VERIFIED',
                    errorMessage: LANG[responseBody.message.toLowerCase()],
                    processing: false
                });
            }
        },

        render: function render() {
            var verificationClass = ClassNames('resend', { hide: !this.state.showResendVerificationEmail });
            var message = this.state.processing ? LANG.processing : '';

            return React.createElement(
                'div',
                { className: 'cloud' },
                React.createElement(
                    'div',
                    { className: 'container' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        React.createElement(
                            'h3',
                            null,
                            LANG.sign_in
                        ),
                        React.createElement(
                            'h2',
                            null,
                            LANG.flux_cloud
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'controls' },
                        React.createElement(
                            'div',
                            null,
                            React.createElement('input', { id: 'email', type: 'text', placeholder: 'Email', onChange: this._handleEditValue })
                        ),
                        React.createElement(
                            'div',
                            null,
                            React.createElement('input', { id: 'password', type: 'password', placeholder: 'Password', onChange: this._handleEditValue, onKeyPress: this._handleDetectEnterKey })
                        ),
                        React.createElement(
                            'div',
                            { className: 'forget-password' },
                            React.createElement(
                                'a',
                                { href: '#/studio/cloud/forgot-password' },
                                LANG.forgot_password
                            )
                        ),
                        React.createElement('div', { className: 'sign-up-description', dangerouslySetInnerHTML: { __html: Sprintf(LANG.sign_up_statement, '#/studio/cloud/sign-up') } })
                    ),
                    React.createElement(
                        'div',
                        { className: 'processing-error' },
                        React.createElement(
                            'label',
                            null,
                            this.state.errorMessage
                        ),
                        React.createElement('br', null),
                        React.createElement(
                            'a',
                            { className: verificationClass, onClick: this._handleResendVerificationEmail },
                            LANG.resend_verification
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'processing' },
                    React.createElement(
                        'label',
                        null,
                        message
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
                            { className: 'btn btn-cancel', onClick: this._handleCancel },
                            LANG.back
                        ),
                        React.createElement(
                            'button',
                            { className: 'btn btn-default', onClick: this._handleSignIn },
                            LANG.sign_in
                        )
                    )
                )
            );
        }

    });
});