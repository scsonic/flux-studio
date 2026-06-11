'use strict';

define(['react', 'reactClassset', 'app/actions/initialize-machine', 'helpers/api/discover', 'helpers/api/usb-config', 'helpers/api/upnp-config', 'jsx!widgets/Modal', 'jsx!views/Printer-Selector', 'app/actions/alert-actions', 'app/actions/progress-actions', 'app/constants/progress-constants', 'helpers/device-master'], function (React, ReactCx, initializeMachine, discover, usbConfig, upnpConfig, Modal, PrinterSelector, AlertActions, ProgressActions, ProgressConstants, DeviceMaster) {
    'use strict';

    return function (args) {
        var upnpMethods,
            usbConnectionTestingTimer,
            args = args || {};

        return React.createClass({
            // Lifecycle

            componentWillMount: function componentWillMount() {},

            getInitialState: function getInitialState() {
                var self = this;
                usbConnectionTestingTimer = setInterval(function () {
                    self.setState({ usbConnected: DeviceMaster.getAvailableUsbChannel() >= 0 });
                }, 1000);
                return {
                    lang: args.state.lang,
                    showPrinters: false,
                    usbConnected: false
                };
            },

            componentWillUnmount: function componentWillUnmount() {
                if ('undefined' !== typeof upnpMethods) {
                    upnpMethods.connection.close();
                }
                clearInterval(usbConnectionTestingTimer);
            },

            // UI events
            _setSettingPrinter: function _setSettingPrinter(printer) {
                // temporary store for setup
                initializeMachine.settingPrinter.set(printer);
                location.hash = '#initialize/wifi/set-printer';
            },

            _onUsbStartingSetUp: function _onUsbStartingSetUp(e) {
                var self = this,
                    lang = this.state.lang,
                    usb = usbConfig({ forceReconnect: true });

                self._toggleBlocker(true);

                usb.list({
                    onSuccess: function onSuccess(response) {
                        response = response || {};
                        self._toggleBlocker(false);
                        response.from = 'USB';
                        self._setSettingPrinter(response);
                    },
                    onError: function onError(response) {
                        self._toggleBlocker(false);
                        AlertActions.showPopupError('connection-fail', lang.initialize.errors.keep_connect.content, lang.initialize.errors.keep_connect.caption);
                    }
                });
            },

            _onWifiStartingSetUp: function _onWifiStartingSetUp(e) {
                var self = this,
                    discoverMethods,
                    timer;

                discoverMethods = discover('upnp-config', function (printers) {
                    clearTimeout(timer);

                    // if (1 < printers.length) {
                    if (Object.keys(printers).length > 1) {
                        self._toggleBlocker(false);
                        self.setState({
                            showPrinters: true
                        });
                    } else {
                        self._onGettingPrinter(printers[0]);
                    }

                    discoverMethods.removeListener('upnp-config');
                });

                timer = setTimeout(function () {
                    clearTimeout(timer);
                    self._toggleBlocker(false);
                    location.hash = '#initialize/wifi/not-found';
                }, 1000);

                self._toggleBlocker(true);
            },

            _toggleBlocker: function _toggleBlocker(open) {
                if (true === open) {
                    ProgressActions.open(ProgressConstants.NONSTOP);
                } else {
                    ProgressActions.close();
                }
            },

            _onGettingPrinter: function _onGettingPrinter(currentPrinter) {
                var self = this,
                    lastError;

                self._toggleBlocker(true);

                currentPrinter = currentPrinter || {};
                currentPrinter.from = 'WIFI';
                currentPrinter.apName = currentPrinter.name;
                upnpMethods = upnpConfig(currentPrinter.uuid);

                upnpMethods.ready(function () {
                    self._toggleBlocker(false);

                    if ('undefined' !== typeof lastError) {
                        upnpMethods.addKey();
                    }

                    self._setSettingPrinter(currentPrinter);
                }).always(function () {
                    self._toggleBlocker(false);
                }).progress(function (response) {
                    switch (response.status) {
                        case 'error':
                            lastError = response;
                            self._toggleBlocker(false);
                            break;
                        case 'waiting':
                            currentPrinter.plaintext_password = response.plaintext_password;
                            self._toggleBlocker(true);
                            break;
                    }
                });
            },

            _closePrinterList: function _closePrinterList() {
                this.setState({
                    showPrinters: false
                });
            },

            _renderPrinters: function _renderPrinters(lang) {
                var content = React.createElement(PrinterSelector, {
                    uniqleId: 'connect-via-wifi',
                    className: 'absolute-center',
                    lang: lang,
                    forceAuth: true,
                    bypassDefaultPrinter: true,
                    bypassCheck: true,
                    onGettingPrinter: this._onGettingPrinter
                });

                return true === this.state.showPrinters ? React.createElement(Modal, { onClose: this._closePrinterList, content: content }) : '';
            },

            _renderConnectionStep: function _renderConnectionStep() {
                var lang = this.state.lang;
                var usbButtonClass = ReactCx.cx({
                    'btn': true,
                    'btn-action': true,
                    'btn-large': true,
                    'usb-disabled': !this.state.usbConnected
                });
                var useWifi = React.createElement(
                    'button',
                    {
                        className: 'btn btn-action btn-large',
                        'data-ga-event': 'next-via-wifi',
                        onClick: this._onWifiStartingSetUp
                    },
                    React.createElement(
                        'h1',
                        { className: 'headline' },
                        lang.initialize.connect_flux
                    ),
                    React.createElement(
                        'p',
                        { className: 'subtitle' },
                        lang.initialize.via_wifi
                    ),
                    React.createElement('img', { className: 'scene', src: 'img/via-wifi.png' })
                );
                var useUsb = React.createElement(
                    'button',
                    {
                        className: usbButtonClass,
                        'data-ga-event': 'next-via-usb',
                        onClick: this._onUsbStartingSetUp
                    },
                    React.createElement(
                        'h1',
                        { className: 'headline' },
                        lang.initialize.connect_flux
                    ),
                    React.createElement(
                        'p',
                        { className: 'subtitle' },
                        lang.initialize.via_usb
                    ),
                    React.createElement('img', { className: 'scene', src: 'img/wifi-plug-01.png' })
                );
                return React.createElement(
                    'div',
                    { className: 'btn-h-group' },
                    useWifi,
                    useUsb
                );
            },

            render: function render() {
                var lang = this.state.lang;
                var wrapperClassName = {
                    'initialization': true
                };
                var printersSelection = this._renderPrinters(lang);
                var innerContent = this._renderConnectionStep();
                var content = React.createElement(
                    'div',
                    { className: 'connect-machine text-center' },
                    React.createElement('img', { className: 'brand-image', src: 'img/menu/main_logo.svg' }),
                    React.createElement(
                        'div',
                        { className: 'connecting-means' },
                        innerContent,
                        React.createElement(
                            'a',
                            { href: '#initialize/wifi/setup-complete/with-usb', 'data-ga-event': 'skip', className: 'btn btn-link btn-large' },
                            lang.initialize.no_machine
                        )
                    ),
                    printersSelection
                );

                return React.createElement(Modal, { className: wrapperClassName, content: content });
            }

        });
    };
});