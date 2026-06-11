'use strict';

define(['react', 'helpers/i18n', 'helpers/device-master', 'helpers/device-error-handler'], function (React, i18n, DeviceMaster, DeviceErrorHandler) {
    var LANG = i18n.lang.settings.flux_cloud;

    return function (_ref) {
        var error = _ref.error,
            clear = _ref.clear;


        var _handleBackToList = function _handleBackToList() {
            clear();
            setTimeout(function () {
                location.hash = '#studio/cloud/bind-machine';
            }, 10);
        };

        var _handleCancel = function _handleCancel() {
            return location.hash = '#studio/print';
        };

        var message = Boolean(error) ? DeviceErrorHandler.translate(error) : LANG.binding_error_description;

        return React.createElement(
            'div',
            { className: 'cloud bind-success' },
            React.createElement(
                'div',
                { className: 'container' },
                React.createElement(
                    'div',
                    { className: 'title' },
                    React.createElement(
                        'h3',
                        null,
                        LANG.binding_fail
                    ),
                    React.createElement(
                        'label',
                        null,
                        message
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'icon' },
                    React.createElement('img', { src: 'img/error-icon.svg' })
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
                        { className: 'btn btn-cancel', onClick: _handleCancel },
                        LANG.cancel
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn btn-default', onClick: _handleBackToList },
                        LANG.back_to_list
                    )
                )
            )
        );
    };
});