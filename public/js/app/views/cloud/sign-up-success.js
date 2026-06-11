'use strict';

define(['react', 'helpers/i18n'], function (React, i18n) {
    var LANG = i18n.lang.settings.flux_cloud;

    return function () {
        var _handleSignIn = function _handleSignIn() {
            return location.hash = '#studio/cloud/sign-in';
        };

        return React.createElement(
            'div',
            { className: 'cloud' },
            React.createElement(
                'div',
                { className: 'container' },
                React.createElement(
                    'div',
                    { className: 'icon' },
                    React.createElement('img', { src: 'http://placehold.it/150x150' })
                ),
                React.createElement(
                    'div',
                    { className: 'title no-margin' },
                    React.createElement(
                        'h3',
                        null,
                        LANG.sign_up
                    ),
                    React.createElement(
                        'h2',
                        null,
                        LANG.success
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'description' },
                    React.createElement(
                        'label',
                        null,
                        LANG.pleaseSignIn
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
                        { className: 'btn btn-default', onClick: _handleSignIn },
                        LANG.sign_in
                    )
                )
            )
        );
    };
});