'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['react', 'helpers/i18n', 'helpers/api/cloud'], function (React, i18n, CloudApi) {
    var LANG = i18n.lang.settings.flux_cloud;
    var Controls = function Controls(_ref) {
        var id = _ref.id,
            value = _ref.value,
            label = _ref.label,
            errorOn = _ref.errorOn,
            errorMessage = _ref.errorMessage,
            type = _ref.type,
            _onChange = _ref.onChange,
            _onBlur = _ref.onBlur;

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
                React.createElement('input', {
                    type: type || 'text',
                    onChange: function onChange(e) {
                        _onChange(id, e.target.value);
                    },
                    onBlur: function onBlur(e) {
                        // somehow pressing delete key in my mac did delete input field but not trigger onChange event. So wierd..
                        _onChange(id, e.target.value);
                        _onBlur(id);
                    },
                    value: value })
            ),
            React.createElement(
                'div',
                { className: 'error' },
                errorOn ? errorMessage : ' '
            )
        );
    };

    return React.createClass({
        getInitialState: function getInitialState() {
            return {
                nickname: '',
                email: '',
                password: '',
                rePassword: '',
                agreeToTerms: false,
                userNameError: false,
                emailError: false,
                agreeToTermError: false,
                passwordMismatch: false
            };
        },

        _handleControlChange: function _handleControlChange(id, val) {
            this.setState(_defineProperty({}, id, val));
        },

        _checkValue: function _checkValue(id) {
            switch (id) {
                case 'nickname':
                    this.setState({ userNameError: this.state.nickname === '' });
                    break;
                case 'email':
                    if (this.state.email === '') {
                        this.setState({
                            emailError: true,
                            emailErrorMessage: LANG.error_blank_email
                        });
                        break;
                    }
                    var emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
                    if (!emailRegex.test(this.state.email)) {
                        this.setState({
                            emailError: true,
                            emailErrorMessage: LANG.error_email_format
                        });
                        break;
                    }
                    this.setState({
                        emailError: false,
                        emailErrorMessage: ''
                    });
                    break;
                case 'password':
                case 'rePassword':
                    if (this.state.password !== '' || this.state.rePassword !== '') {
                        var mismatch = this.state.password !== this.state.rePassword;
                        this.setState({ passwordMismatch: mismatch });
                    }
                    break;
            }
        },

        _allValid: function _allValid() {
            var _state = this.state,
                userNameError = _state.userNameError,
                emailError = _state.emailError,
                passwordMismatch = _state.passwordMismatch,
                password = _state.password,
                agreeToTerms = _state.agreeToTerms;

            this.setState({
                agreeToTermError: !agreeToTerms
            });
            return !userNameError && !emailError && !passwordMismatch && password !== '' && agreeToTerms === true;
        },

        _handleAgreementChange: function _handleAgreementChange(e) {
            this.setState({ agreeToTerms: e.target.checked });
        },

        _handleSignUp: async function _handleSignUp() {
            if (this._allValid()) {
                this.setState({ processing: true });
                var _state2 = this.state,
                    nickname = _state2.nickname,
                    email = _state2.email,
                    password = _state2.password;


                var response = await CloudApi.signUp(nickname, email, password);
                if (response.ok) {
                    this.setState({ processing: false });
                    alert(LANG.check_email);
                    location.hash = '#studio/cloud/sign-in';
                } else {
                    var error = await response.json();
                    this.setState({
                        processing: false,
                        emailError: true,
                        emailErrorMessage: LANG[error.message.toLowerCase()]
                    });
                }
            }
        },

        _handleCancel: function _handleCancel() {
            location.hash = '#studio/cloud/sign-in';
        },

        render: function render() {
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
                            LANG.sign_up
                        ),
                        React.createElement(
                            'h2',
                            null,
                            LANG.flux_cloud
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'row' },
                        React.createElement(Controls, {
                            id: 'nickname',
                            label: LANG.nickname,
                            errorMessage: LANG.error_blank_username,
                            errorOn: this.state.userNameError,
                            value: this.state.nickname,
                            onChange: this._handleControlChange,
                            onBlur: this._checkValue }),
                        React.createElement(Controls, {
                            id: 'email',
                            label: LANG.email,
                            errorMessage: this.state.emailErrorMessage,
                            errorOn: this.state.emailError,
                            value: this.state.email,
                            onChange: this._handleControlChange,
                            onBlur: this._checkValue })
                    ),
                    React.createElement(
                        'div',
                        { className: 'row' },
                        React.createElement(Controls, {
                            id: 'password',
                            type: 'password',
                            label: LANG.password,
                            value: this.state.password,
                            onChange: this._handleControlChange,
                            onBlur: this._checkValue }),
                        React.createElement(Controls, {
                            id: 'rePassword',
                            type: 'password',
                            label: LANG.re_enter_password,
                            errorMessage: LANG.error_password_not_match,
                            errorOn: this.state.passwordMismatch,
                            value: this.state.rePassword,
                            onChange: this._handleControlChange,
                            onBlur: this._checkValue })
                    ),
                    React.createElement(
                        'div',
                        { className: 'controls' },
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement('input', {
                                id: 'agreeToTerms',
                                className: 'pointer',
                                type: 'checkbox',
                                checked: this.state.agreeToTerms,
                                onChange: this._handleAgreementChange }),
                            React.createElement('label', { dangerouslySetInnerHTML: { __html: LANG.agreement } })
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'processing-error' },
                        React.createElement(
                            'label',
                            null,
                            this.state.agreeToTermError ? LANG.agree_to_terms : ''
                        ),
                        React.createElement('br', null)
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'processing' },
                    React.createElement(
                        'label',
                        null,
                        this.state.processing ? LANG.processing : ''
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
                            LANG.cancel
                        ),
                        React.createElement(
                            'button',
                            { className: 'btn btn-default', onClick: this._handleSignUp },
                            LANG.sign_up
                        )
                    )
                )
            );
        }
    });
});