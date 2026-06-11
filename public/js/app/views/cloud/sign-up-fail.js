'use strict';

define(['react', 'helpers/i18n', 'helpers/sprintf'], function (React, i18n, Sprintf) {
    var LANG = i18n.lang.settings.flux_cloud;
    return function () {
        var _handleCancel = function _handleCancel() {
            return location.hash = '#studio/print';
        };
        var _handleRetry = function _handleRetry() {
            return location.hash = '#studio/cloud/sign-up';
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
                        LANG.fail
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'description' },
                    React.createElement('div', { className: 'sign-up-description', dangerouslySetInnerHTML: { __html: Sprintf(LANG.try_sign_up_again, '#/studio/cloud/sign-up') } })
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
                        { className: 'btn btn-default', onClick: _handleRetry },
                        LANG.try_again
                    )
                )
            )
        );
    };
});