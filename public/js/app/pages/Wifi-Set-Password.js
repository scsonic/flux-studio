'use strict';

define(['react', 'app/actions/initialize-machine', 'jsx!widgets/Button-Group', 'jsx!widgets/Modal', 'helpers/api/usb-config', 'helpers/api/config', 'app/actions/alert-actions', 'app/stores/alert-store'], function (React, initializeMachine, ButtonGroup, Modal, usbConfig, config, AlertActions, AlertStore) {
    'use strict';

    return function (args) {
        args = args || {};

        var Page = React.createClass({
            displayName: 'Page',


            // Lifecycle
            getInitialState: function getInitialState() {
                return {
                    lang: args.state.lang,
                    openAlert: false,
                    alertContent: {}
                };
            },

            componentDidMount: function componentDidMount() {
                this._handleSetPassword();
            },

            // UI events

            _onCancelConnection: function _onCancelConnection(e) {
                clearTimeout(this.t);
                var wifi = initializeMachine.settingWifi.get();

                delete wifi.plain_password;
                initializeMachine.settingWifi.set(wifi);

                location.hash = '#initialize/wifi/select';
            },

            _handleSetPassword: function _handleSetPassword(e) {
                var _this = this;

                var self = this,
                    wifi = initializeMachine.settingWifi.get(),
                    usb = usbConfig(),
                    lang = self.state.lang,
                    password = wifi.plain_password,
                    diffTime = 60000,
                    // check network within 60 secs
                startTime = new Date().getTime(),
                    checkCountdown = function checkCountdown(response) {
                    if (diffTime <= new Date().getTime() - startTime) {
                        genericFailureHandler();
                        return false;
                    }

                    return true;
                },
                    genericFailureHandler = function genericFailureHandler() {
                    AlertActions.showPopupError('wifi-authenticate-fail', lang.initialize.errors.wifi_connection.connecting_fail, lang.initialize.errors.wifi_connection.caption);
                },
                    genericPerviousSSIDError = function genericPerviousSSIDError() {
                    AlertActions.showPopupCustom('wifi-authenticate-fail', lang.initialize.errors.wifi_connection.connecting_fail, lang.initialize.errors.close, lang.initialize.errors.wifi_connection.caption, '', function () {});
                },
                    checkNetworkStatus = function checkNetworkStatus() {
                    var tryAgain = function tryAgain(response) {
                        if (true === checkCountdown(response)) {
                            clearTimeout(_this.t);
                            _this.t = setTimeout(function () {
                                var d = initializeMachine.settingWifi.get();
                                usb.getMachineNetwork(deferred, d.ssid);
                            }, 1000);
                        }
                    },
                        deferred;

                    // NOTICE: Wait for 2 sec due to the device may not refresh its IP.
                    clearTimeout(_this.t);
                    _this.t = setTimeout(function () {
                        var d = initializeMachine.settingWifi.get();
                        deferred = usb.getMachineNetwork(deferred, d.ssid).fail(tryAgain).progress(tryAgain).done(function (response) {
                            if (response.action === 'GOOD') {
                                var pokeIPAddr = localStorage.getItem('poke-ip-addr');

                                if (pokeIPAddr && pokeIPAddr !== '') {
                                    var pokeIPAddrArr = pokeIPAddr.split(/[,;] ?/);

                                    if (pokeIPAddrArr.indexOf(response.ipaddr[0]) === -1) {
                                        if (pokeIPAddrArr.length > 19) {
                                            pokeIPAddr = pokeIPAddrArr.slice(pokeIPAddrArr.length - 19, pokeIPAddrArr.length);
                                        }

                                        localStorage.setItem('poke-ip-addr', pokeIPAddr + ', ' + response.ipaddr[0]);
                                    }
                                } else {
                                    localStorage.setItem('poke-ip-addr', response.ipaddr[0]);
                                }

                                location.hash = '#initialize/wifi/setup-complete';
                                usb.close();
                            } else if (response.action === 'PREVIOUS_SSID') {
                                genericPerviousSSIDError();
                                location.hash = '#initialize/wifi/select';
                            };
                        });
                    }, 2000);
                };

                usb.setWifiNetwork(wifi, password, {
                    onSuccess: function onSuccess(response) {
                        checkNetworkStatus();
                    },
                    onError: function onError(response) {
                        genericFailureHandler();
                    }
                });
            },

            render: function render() {
                var wrapperClassName = {
                    'initialization': true
                },
                    lang = this.state.lang,
                    content = React.createElement(
                    'div',
                    { className: 'connecting-wifi text-center' },
                    React.createElement(
                        'h1',
                        null,
                        lang.initialize.connecting
                    ),
                    React.createElement('div', { className: 'spinner-roller' }),
                    React.createElement(
                        'button',
                        {
                            className: 'btn btn-action btn-large',
                            'data-ga-event': 'cancel',
                            onClick: this._onCancelConnection
                        },
                        lang.initialize.cancel
                    )
                );

                return React.createElement(Modal, { className: wrapperClassName, content: content });
            }
        });

        return Page;
    };
});