'use strict';

define(['react', 'jsx!widgets/Button-Group', 'app/constants/keycode-constants', 'helpers/i18n'], function (React, ButtonGroup, KeyCodeConstants, i18n) {
    var lang = i18n.lang;

    var DxfDpiSelector = function DxfDpiSelector(_ref) {
        var defaultDpiValue = _ref.defaultDpiValue,
            onSubmit = _ref.onSubmit,
            onCancel = _ref.onCancel;

        var submitValue = function submitValue() {
            var dpi = Number($('#dpi-input').val());
            onSubmit(dpi);
        };
        var _handleKeyDown = function _handleKeyDown(e) {
            if (e.keyCode === KeyCodeConstants.KEY_RETURN) {
                submitValue();
            }
        };
        var clearInputValue = function clearInputValue() {
            $('#dpi-input').val('');
        };

        var buttons = [{
            label: lang.alert.cancel,
            right: true,
            onClick: function onClick() {
                return onCancel();
            }
        }, {
            label: lang.alert.ok,
            right: true,
            onClick: function onClick() {
                return submitValue();
            }
        }];
        var style = {
            padding: '3px 10px',
            width: '120px',
            textAlign: 'left'
        };
        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { className: 'caption' },
                lang.message.please_enter_dpi,
                React.createElement('br', null),
                '2.54, 25.4, 72, 96 etc.'
            ),
            React.createElement(
                'div',
                { className: 'message', style: { textAlign: 'center' } },
                React.createElement('input', {
                    id: 'dpi-input',
                    defaultValue: defaultDpiValue,
                    onClick: clearInputValue,
                    onKeyDown: _handleKeyDown,
                    style: style
                })
            ),
            React.createElement(ButtonGroup, { buttons: buttons })
        );
    };
    return DxfDpiSelector;
});