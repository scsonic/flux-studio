'use strict';

define(['react', 'reactDOM', 'reactPropTypes', 'helpers/i18n', 'app/constants/input-lightbox-constants', 'jsx!widgets/Modal', 'jsx!widgets/Alert', 'plugins/classnames/index'], function (React, ReactDOM, PropTypes, i18n, Constants, Modal, Alert, classNames) {
    'use strict';

    var acceptableTypes = [Constants.TYPE_TEXT, Constants.TYPE_NUMBER, Constants.TYPE_PASSWORD, Constants.TYPE_FILE],
        View = React.createClass({
        displayName: 'View',


        propTypes: {
            isOpen: PropTypes.bool,
            lang: PropTypes.object,
            type: PropTypes.oneOf(acceptableTypes),
            maxLength: PropTypes.number,
            inputHeader: PropTypes.string,
            defaultValue: PropTypes.string,
            confirmText: PropTypes.string,
            onCustom: PropTypes.func,
            onClose: PropTypes.func
        },

        getDefaultProps: function getDefaultProps() {
            return {
                isOpen: true,
                lang: i18n.get(),
                type: Constants.TYPE_TEXT,
                maxLength: 255,
                inputHeader: '',
                defaultValue: '',
                confirmText: '',
                caption: '',
                onClose: function onClose() {},
                onSubmit: function onSubmit() {}
            };
        },

        getInitialState: function getInitialState() {
            return {
                allowSubmit: false
            };
        },

        // button actions
        _onClose: function _onClose(e, reactid, from) {
            e.preventDefault();
            this.props.onClose.apply(null, [e, reactid, from]);
        },

        _onCancel: function _onCancel(e, reactid) {
            e.preventDefault();
            this._onClose.apply(null, [e, reactid, 'cancel']);
        },

        _onSubmit: function _onSubmit(e, reactid) {
            e.preventDefault();

            var returnValue, result;

            if (Constants.TYPE_FILE === this.props.type) {
                returnValue = ReactDOM.findDOMNode(this.refs.inputField).files;
            } else {
                returnValue = ReactDOM.findDOMNode(this.refs.inputField).value;
            }

            result = this.props.onSubmit(returnValue, e);

            if ('boolean' === typeof result && true === result || 'undefined' === typeof result) {
                this._onClose.apply(null, [e, reactid, 'submit']);
            }
        },

        _inputKeyUp: function _inputKeyUp(e) {
            var targetFiles = e.currentTarget.files || {};
            this.setState({
                allowSubmit: 0 < e.currentTarget.value.length || 0 < (targetFiles.length || 0)
            });
        },

        _getButtons: function _getButtons(lang) {
            var buttons = [];

            buttons.push({
                label: lang.alert.cancel,
                dataAttrs: {
                    'ga-event': 'cancel'
                },
                onClick: this._onCancel
            });

            buttons.push({
                label: this.props.confirmText || lang.alert.confirm,
                className: classNames({
                    'btn-default': true,
                    'btn-disabled': false === this.state.allowSubmit
                }),
                dataAttrs: {
                    'ga-event': 'confirm'
                },
                onClick: this._onSubmit
            });

            return buttons;
        },

        _getMessage: function _getMessage() {
            var typeMap = {},
                type = 'text',
                inputHeader = '' !== this.props.inputHeader ? React.createElement(
                'span',
                { className: 'inputHeader' },
                this.props.inputHeader
            ) : '';

            typeMap[Constants.TYPE_TEXT] = 'text';
            typeMap[Constants.TYPE_NUMBER] = 'number';
            typeMap[Constants.TYPE_PASSWORD] = 'password';
            typeMap[Constants.TYPE_FILE] = 'file';

            if ('string' === typeof typeMap[this.props.type]) {
                type = typeMap[this.props.type];
            }

            return React.createElement(
                'label',
                { className: 'control' },
                inputHeader,
                React.createElement('input', {
                    type: type,
                    ref: 'inputField',
                    defaultValue: this.props.defaultValue,
                    autoFocus: true,
                    onKeyUp: this._inputKeyUp,
                    onChange: this._inputKeyUp,
                    maxLength: this.props.maxLength
                })
            );
        },

        render: function render() {
            if (false === this.props.isOpen) {
                return React.createElement('div', null);
            }

            var lang = this.props.lang,
                buttons = this._getButtons(lang),
                message = this._getMessage(),
                content = React.createElement(
                'form',
                { className: 'form', onSubmit: this._onSubmit },
                React.createElement(Alert, {
                    lang: lang,
                    caption: this.props.caption,
                    message: message,
                    buttons: buttons
                })
            ),
                className = {
                'shadow-modal': true,
                'modal-input-lightbox': true
            };

            return React.createElement(Modal, { className: className, content: content, disabledEscapeOnBackground: false });
        }

    });

    return View;
});