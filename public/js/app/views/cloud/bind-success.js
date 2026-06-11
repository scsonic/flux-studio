'use strict';

define(['react', 'helpers/i18n'], function (React, i18n) {
    var LANG = i18n.lang.settings.flux_cloud;

    return function () {
        var _handleBindAnother = function _handleBindAnother() {
            return location.hash = '#studio/cloud/bind-machine';
        };
        var _handleDone = function _handleDone() {
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
                        LANG.binding_success
                    ),
                    React.createElement(
                        'label',
                        null,
                        LANG.binding_success_description
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'icon' },
                    React.createElement('img', { src: 'img/ok-icon.svg' })
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
                        { className: 'btn btn-cancel', onClick: _handleBindAnother },
                        LANG.bind_another
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn btn-default', onClick: _handleDone },
                        LANG.done
                    )
                )
            )
        );
    };
});