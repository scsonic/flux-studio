'use strict';

define(['react', 'helpers/i18n', 'jsx!views/cloud/sign-in', 'jsx!views/cloud/sign-up', 'jsx!views/cloud/sign-up-success', 'jsx!views/cloud/sign-up-fail', 'jsx!views/cloud/forgot-password', 'jsx!views/cloud/email-sent', 'jsx!views/cloud/bind-machine', 'jsx!views/cloud/bind-success', 'jsx!views/cloud/bind-fail', 'jsx!views/cloud/bind-error', 'jsx!views/cloud/sign-out', 'jsx!views/cloud/change-password', 'jsx!views/cloud/terms', 'jsx!views/cloud/privacy'], function (React, i18n, SignIn, SignUp, SignUpSuccess, SignUpFail, ForgotPassword, EmailSent, BindMachine, BindSuccess, BindFail, BindError, SignOut, ChangePassword, Terms, Privacy) {
    return function (_ref) {
        var child = _ref.child;

        return React.createClass({
            getInitialState: function getInitialState() {
                return {};
            },

            componentWillUpdate: function componentWillUpdate(nextProps, nextState) {
                console.log('test next props', nextProps, nextState, this.props, this.state);
            },

            logError: function logError(errorArray) {
                this.setState({
                    error: errorArray,
                    view: 'bind-fail'
                });
            },

            clear: function clear() {
                this.setState({ view: '' });
            },

            renderContent: function renderContent() {
                var _this = this;

                var content = {};
                var view = this.state.view || child;

                content['sign-in'] = function () {
                    return React.createElement(SignIn, null);
                };
                content['sign-up'] = function () {
                    return React.createElement(SignUp, null);
                };
                content['sign-up-success'] = function () {
                    return React.createElement(SignUpSuccess, null);
                };
                content['sign-up-fail'] = function () {
                    return React.createElement(SignUpFail, null);
                };
                content['forgot-password'] = function () {
                    return React.createElement(ForgotPassword, null);
                };
                content['email-sent'] = function () {
                    return React.createElement(EmailSent, null);
                };
                content['bind-machine'] = function () {
                    return React.createElement(BindMachine, { lang: i18n.lang, onError: _this.logError });
                };
                content['bind-success'] = function () {
                    return React.createElement(BindSuccess, null);
                };
                content['bind-fail'] = function () {
                    return React.createElement(BindFail, { error: _this.state.error, clear: _this.clear });
                };
                content['bind-error'] = function () {
                    return React.createElement(BindError, null);
                };
                content['change-password'] = function () {
                    return React.createElement(ChangePassword, { lang: i18n.lang });
                };
                content['sign-out'] = function () {
                    return React.createElement(SignOut, null);
                };
                content['terms'] = function () {
                    return React.createElement(Terms, null);
                };
                content['privacy'] = function () {
                    return React.createElement(Privacy, null);
                };

                if (typeof content[view] === 'undefined') {
                    view = 'sign-in';
                }
                return content[view]();
            },

            render: function render() {
                return React.createElement(
                    'div',
                    { className: 'studio-container settings-cloud' },
                    React.createElement(
                        'div',
                        { className: 'cloud' },
                        this.renderContent()
                    )
                );
            }

        });
    };
});