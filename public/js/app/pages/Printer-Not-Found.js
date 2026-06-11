'use strict';

define(['react', 'app/actions/initialize-machine', 'helpers/api/discover', 'helpers/api/upnp-config', 'helpers/i18n', 'jsx!widgets/Modal', 'app/actions/progress-actions', 'app/constants/progress-constants', 'app/actions/alert-actions'], function (React, initializeMachine, discover, upnpConfig, i18n, Modal, ProgressActions, ProgressConstants, AlertActions) {
    'use strict';

    return function (args) {
        var upnpMethods;

        args = args || {};

        return React.createClass({

            // Lifecycle
            getInitialState: function getInitialState() {
                return {
                    lang: args.state.lang
                };
            },

            componentWillUnmount: function componentWillUnmount() {
                if (typeof upnpMethods !== 'undefined') {
                    upnpMethods.connection.close();
                }
            },

            _retrieveDevice: function _retrieveDevice(e) {
                var self = this,
                    currentPrinter,
                    discoverMethods = discover('upnp-config', function (printers) {
                    clearTimeout(timer);
                    ProgressActions.close();

                    currentPrinter = printers[0] || {};
                    currentPrinter.from = 'WIFI';
                    upnpMethods = upnpConfig(currentPrinter.uuid);

                    discoverMethods.removeListener('upnp-config');

                    // temporary store for setup
                    initializeMachine.settingPrinter.set(currentPrinter);
                    location.hash = '#initialize/wifi/set-printer';
                }),
                    timer = setTimeout(function () {
                    ProgressActions.close();
                    AlertActions.showPopupError('retrieve-device-fail', self.state.lang.initialize.errors.not_found);
                    clearTimeout(timer);
                }, 1000);

                ProgressActions.open(ProgressConstants.NONSTOP);
            },

            render: function render() {
                var lang = this.state.lang;
                var localLang = lang.initialize.notice_from_device;
                var wrapperClassName = {
                    'initialization': true
                };

                var imgLang = 'en' === i18n.getActiveLang() ? 'en' : 'zh';
                var imgSrc = 'img/wifi-error-notify-delta-' + imgLang + '.png';
                var content = React.createElement(
                    'div',
                    { className: 'device-not-found text-center' },
                    React.createElement('img', { className: 'brand-image', src: 'img/menu/main_logo.svg' }),
                    React.createElement(
                        'div',
                        null,
                        React.createElement('img', { className: 'not-found-img', src: imgSrc }),
                        React.createElement(
                            'div',
                            { className: 'button-group btn-v-group' },
                            React.createElement(
                                'button',
                                { 'data-ga-event': 'retry-getting-device-from-wifi', className: 'btn btn-action btn-large', onClick: this._retrieveDevice },
                                lang.initialize.retry
                            ),
                            React.createElement(
                                'a',
                                { href: '#initialize/wifi/connect-machine', 'data-ga-event': 'back', className: 'btn btn-link btn-large' },
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