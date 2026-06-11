'use strict';

define(['react', 'helpers/api/cloud'], function (React, CloudApi) {

    var Controls = function Controls(props) {
        var _handleEntered = function _handleEntered(e) {
            return props.onEntered(props.id, e.target.value);
        };
        var label = props.label,
            errorMessage = props.errorMessage,
            errorOn = props.errorOn,
            type = props.type;

        return React.createElement(
            'div',
            { className: 'controls' },
            React.createElement(
                'div',
                { className: 'label' },
                label
            ),
            React.createElement(
                'div',
                { className: 'control' },
                React.createElement('input', { type: type || 'text', onBlur: _handleEntered })
            ),
            React.createElement(
                'div',
                { className: 'error' },
                errorOn ? errorMessage : ' '
            )
        );
    };

    return React.createClass({

        values: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        },

        getInitialState: function getInitialState() {
            return {
                currentPasswordError: '',
                newPasswordError: '',
                confirmPasswordError: '',
                passwordMismatch: false,
                emptyCurrentPassword: false,
                emptyNewPassword: false,
                emptyConfirmPassword: false
            };
        },

        componentDidMount: async function componentDidMount() {
            var resp = await CloudApi.getMe();
            if (!resp.ok) {
                location.hash = '#/studio/cloud';
            }
        },

        _checkValue: function _checkValue(id, value) {
            var _this = this;

            var lang = this.props.lang.settings.flux_cloud,
                f = {};

            f['currentPassword'] = function () {
                _this.values['currentPassword'] = value;
                _this.setState({
                    emptyCurrentPassword: value === '',
                    currentPasswordError: value === '' ? lang.empty_password_warning : ''
                });
            };

            f['newPassword'] = function () {
                _this.values['newPassword'] = value;
                _this.setState({
                    emptyNewPassword: value === '',
                    newPasswordError: value === '' ? lang.empty_password_warning : ''
                });
            };

            f['confirmPassword'] = function () {
                _this.values['confirmPassword'] = value;
                _this.setState({
                    emptyConfirmPassword: value === '',
                    confirmPasswordError: value === '' ? lang.empty_password_warning : ''
                });
            };

            if (typeof f[id] !== 'undefined') {
                f[id]();
            };

            if (this.values.newPassword !== '' && this.values.confirmPassword !== '') {
                var mismatch = this.values.newPassword !== this.values.confirmPassword;
                this.setState({ confirmPasswordError: mismatch ? lang.error_password_not_match : '' });
            }
        },

        allValid: function allValid() {
            var _state = this.state,
                currentPasswordError = _state.currentPasswordError,
                newPasswordError = _state.newPasswordError,
                confirmPasswordError = _state.confirmPasswordError;

            return currentPasswordError === '' && newPasswordError === '' && confirmPasswordError === '';
        },

        _handleCancel: function _handleCancel() {
            location.hash = '#/studio/cloud/bind-machine';
        },

        _handleChangePassword: async function _handleChangePassword() {
            if (!this.allValid()) {
                return;
            }
            var lang = this.props.lang.settings.flux_cloud;

            var info = {
                password: this.values.newPassword,
                oldPassword: this.values.currentPassword
            };

            var j = (await CloudApi.changePassword(info)).json();
            if (j.status === 'error') {
                this.setState({ responseError: lang[j.message] });
            } else {
                location.hash = '#/studio/cloud/bind-machine';
            }
        },

        render: function render() {
            var lang = this.props.lang.settings.flux_cloud;

            return React.createElement(
                'div',
                { className: 'cloud' },
                React.createElement(
                    'div',
                    { className: 'change-password container' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        React.createElement(
                            'h3',
                            null,
                            lang.change_password.toUpperCase()
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'row' },
                        React.createElement(Controls, {
                            id: 'currentPassword',
                            type: 'password',
                            label: lang.current_password,
                            errorMessage: this.state.currentPasswordError,
                            errorOn: this.state.currentPasswordError !== '',
                            onEntered: this._checkValue
                        })
                    ),
                    React.createElement(
                        'div',
                        { className: 'row' },
                        React.createElement(Controls, {
                            id: 'newPassword',
                            type: 'password',
                            label: lang.new_password,
                            errorMessage: this.state.newPasswordError,
                            errorOn: this.state.newPasswordError !== '',
                            onEntered: this._checkValue
                        })
                    ),
                    React.createElement(
                        'div',
                        { className: 'row' },
                        React.createElement(Controls, {
                            id: 'confirmPassword',
                            type: 'password',
                            label: lang.confirm_password,
                            errorMessage: this.state.confirmPasswordError,
                            errorOn: this.state.confirmPasswordError !== '',
                            onEntered: this._checkValue
                        })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'change-password footer' },
                    React.createElement(
                        'div',
                        { className: 'divider' },
                        React.createElement(
                            'span',
                            { className: 'error' },
                            this.state.responseError
                        ),
                        React.createElement('hr', null)
                    ),
                    React.createElement(
                        'div',
                        { className: 'actions' },
                        React.createElement(
                            'button',
                            { className: 'btn btn-cancel', onClick: this._handleCancel },
                            lang.cancel
                        ),
                        React.createElement(
                            'button',
                            { className: 'btn btn-default', onClick: this._handleChangePassword },
                            lang.submit
                        )
                    )
                )
            );
        }
    });
});