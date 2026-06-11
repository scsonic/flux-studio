'use strict';

define(['react', 'app/actions/initialize-machine', 'jsx!widgets/Modal', 'helpers/sprintf'], function (React, initializeMachine, Modal, sprintf) {
    'use strict';

    return function (args) {

        args = args || {};

        return React.createClass({

            // Lifecycle
            getInitialState: function getInitialState() {
                return {
                    lang: args.state.lang
                };
            },

            _restartStudio: function _restartStudio(e) {
                initializeMachine.completeSettingUp(true);
                location.reload();
            },

            render: function render() {
                var wifi = initializeMachine.settingWifi.get();
                var lang = this.state.lang,
                    localLang = lang.initialize.notice_from_device,
                    settingPrinter = initializeMachine.settingPrinter.get(),
                    wrapperClassName = {
                    'initialization': true
                },
                    successfullyStatement = sprintf(localLang.successfully_statement, wifi.ssid),
                    content = React.createElement(
                    'div',
                    { className: 'notice-from-device text-center' },
                    React.createElement('img', { className: 'brand-image', src: 'img/menu/main_logo.svg' }),
                    React.createElement(
                        'div',
                        { className: 'connecting-means' },
                        React.createElement(
                            'h1',
                            { className: 'headline' },
                            localLang.headline
                        ),
                        React.createElement(
                            'h2',
                            { className: 'subtitle' },
                            localLang.subtitle
                        ),
                        React.createElement(
                            'div',
                            { className: 'signal-means row-fluid clearfix' },
                            React.createElement('img', { className: 'signal-position col', src: 'img/wifi-indicator.png' }),
                            React.createElement(
                                'div',
                                { className: 'signal-description col' },
                                React.createElement(
                                    'article',
                                    { className: 'row-fluid clearfix' },
                                    React.createElement('span', { className: 'green-light col' }),
                                    React.createElement(
                                        'h4',
                                        { className: 'green-light-desc col' },
                                        localLang.light_on,
                                        React.createElement(
                                            'p',
                                            null,
                                            localLang.light_on_desc
                                        )
                                    )
                                ),
                                React.createElement(
                                    'article',
                                    { className: 'row-fluid clearfix' },
                                    React.createElement('span', { className: 'green-light breathing col' }),
                                    React.createElement(
                                        'h4',
                                        { className: 'green-light-desc col' },
                                        localLang.breathing,
                                        React.createElement(
                                            'p',
                                            null,
                                            localLang.breathing_desc
                                        )
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'article',
                            null,
                            React.createElement(
                                'p',
                                { className: 'headline' },
                                localLang.successfully
                            ),
                            React.createElement(
                                'p',
                                { className: 'subtitle' },
                                successfullyStatement
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'button-group btn-v-group' },
                            React.createElement(
                                'button',
                                { 'data-ga-event': 'restart-flux-studio', className: 'btn btn-action btn-large', onClick: this._restartStudio },
                                localLang.restart
                            ),
                            React.createElement(
                                'a',
                                { href: '#initialize/wifi/select', 'data-ga-event': 'back', className: 'btn btn-link btn-large' },
                                lang.initialize.back
                            )
                        )
                    )
                );

                return React.createElement(Modal, { className: wrapperClassName, content: content });
            }
        });
    };
});