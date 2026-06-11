'use strict';

define(['react', 'helpers/i18n'], function (React, i18n) {
    var LANG = i18n.lang.settings.flux_cloud;

    return function () {
        var _handleDone = function _handleDone() {
            return location.hash = '#studio/cloud';
        };
        return React.createElement(
            'div',
            { className: 'cloud' },
            React.createElement(
                'div',
                { className: 'container email-sent' },
                React.createElement(
                    'div',
                    { className: 'middle' },
                    React.createElement(
                        'div',
                        { className: 'description' },
                        React.createElement(
                            'h3',
                            null,
                            LANG.check_inbox
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
                        { className: 'btn btn-default', onClick: _handleDone },
                        LANG.done
                    )
                )
            )
        );
    };
});