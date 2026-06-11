'use strict';

define(['react', 'helpers/i18n', 'helpers/device-master'], function (React, i18n, DeviceMaster) {
    var LANG = i18n.lang.settings.flux_cloud;

    return function () {

        var _handleDownloadError = async function _handleDownloadError(e) {
            e.preventDefault();
            var info = await DeviceMaster.downloadErrorLog();
            saveAs(info[1], 'error-log.txt');
        };

        var _handleCancel = function _handleCancel() {
            return location.hash = '#studio/print';
        };

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
                        LANG.binding_error_description
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
                        { className: 'btn btn-default', onClick: _handleDownloadError },
                        LANG.retrieve_error_log
                    )
                )
            )
        );
    };
});