'use strict';

define(['jquery', 'react', 'helpers/i18n', 'jsx!views/settings/Setting-General', 'jsx!views/settings/Setting-Device', 'plugins/classnames/index', 'app/app-settings', 'helpers/api/config'], function ($, React, i18n, GeneralSetting, DeviceSetting, ClassNames, settings, config) {
    'use strict';

    return function (args) {
        args = args || {};

        var HomeView;

        HomeView = React.createClass({
            displayName: 'HomeView',

            getInitialState: function getInitialState() {
                return {
                    lang: args.state.lang
                };
            },

            _handleDone: function _handleDone() {
                location.hash = 'studio/' + (config().read('default-app') || 'print');
                location.reload();
            },

            _onLangChange: function _onLangChange() {
                this.setState({
                    lang: i18n.get()
                });
            },

            _renderContent: function _renderContent() {
                var _this = this;

                var content = {},
                    view = args.child;

                content.general = function () {
                    return React.createElement(GeneralSetting, {
                        lang: _this.state.lang,
                        supported_langs: settings.i18n.supported_langs,
                        onLangChange: _this._onLangChange });
                };

                content.device = function () {
                    return React.createElement(DeviceSetting, { lang: _this.state.lang });
                };

                if (typeof content[view] === 'undefined') {
                    view = 'general';
                }
                return content[view]();
            },

            render: function render() {
                var lang = this.state.lang,
                    menu_item = 'nav-item',
                    generalClass = ClassNames(menu_item, { active: args.child === 'general' }),
                    deviceClass = ClassNames(menu_item, { active: args.child === 'device' }),

                // printerClass = ClassNames( menu_item, {active: 'printer' === args.child}),
                // tabContainerClass = ClassNames( 'tab-container', {'no-top-margin': !this.state.displayMenu}),
                tabs,
                    footer;

                tabs = React.createElement(
                    'header',
                    null,
                    React.createElement(
                        'ul',
                        { className: 'nav clearfix' },
                        React.createElement(
                            'li',
                            { className: generalClass },
                            React.createElement(
                                'a',
                                { href: '#studio/settings/general' },
                                lang.settings.tabs.general
                            )
                        ),
                        React.createElement(
                            'li',
                            { className: deviceClass },
                            React.createElement(
                                'a',
                                { href: '#studio/settings/device' },
                                lang.settings.tabs.device
                            )
                        )
                    )
                );

                footer = React.createElement(
                    'footer',
                    { className: 'sticky-bottom' },
                    React.createElement(
                        'div',
                        { className: 'actions' },
                        React.createElement(
                            'a',
                            { className: 'btn btn-done', onClick: this._handleDone },
                            lang.settings.done
                        )
                    )
                );

                return React.createElement(
                    'div',
                    { className: 'studio-container settings-studio' },
                    React.createElement(
                        'div',
                        { className: 'settings' },
                        tabs,
                        React.createElement(
                            'div',
                            { className: 'tab-container' },
                            this._renderContent()
                        ),
                        footer
                    )
                );
            }

        });

        return HomeView;
    };
});