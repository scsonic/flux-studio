'use strict';

define(['react', 'reactPropTypes', 'reactClassset', 'jquery', 'jsx!widgets/List', 'helpers/api/discover', 'helpers/device-master', 'helpers/i18n', 'helpers/api/touch', 'app/constants/device-constants', 'app/actions/alert-actions', 'app/stores/alert-store', 'app/actions/initialize-machine', 'app/actions/progress-actions', 'app/constants/progress-constants', 'app/actions/input-lightbox-actions', 'app/constants/input-lightbox-constants', 'helpers/sprintf', 'helpers/check-device-status', 'helpers/device-list'], function (React, PropTypes, ReactCx, $, ListView, Discover, DeviceMaster, i18n, Touch, DeviceConstants, AlertActions, AlertStore, InitializeMachine, ProgressActions, ProgressConstants, InputLightboxActions, InputLightboxConstants, sprintf, CheckDeviceStatus, DeviceList) {
    'use strict';

    var lang = i18n.lang;
    var View = React.createClass({
        displayName: 'PrinterSelection',
        selected_printer: null,

        propTypes: {
            showExport: PropTypes.bool,
            modelFilter: PropTypes.string,
            onClose: PropTypes.func,
            onGettingPrinter: PropTypes.func
        },

        getDefaultProps: function getDefaultProps() {
            return {
                uniqleId: '',
                className: '',
                modelFilter: '',
                forceAuth: false,
                onGettingPrinter: function onGettingPrinter() {},
                onUnmount: function onUnmount() {},
                onClose: function onClose() {},
                arrowDirection: 'right' //'left'
            };
        },

        getInitialState: function getInitialState() {
            var modelFilter = this.props.modelFilter.split(','),
                hasDefaultPrinter = InitializeMachine.defaultPrinter.exist() && !this.props.bypassDefaultPrinter;

            var defaultPrinter = InitializeMachine.defaultPrinter.get();

            if (modelFilter.length > 0 && defaultPrinter.model) {
                // If the model of defaultPrinter is not in the whitelist
                if (modelFilter.indexOf(defaultPrinter.model) <= 0) {
                    hasDefaultPrinter = false;
                }
            }

            return {
                discoverId: 'printer-selector-' + (this.props.uniqleId || ''),
                devices: [],
                loadFinished: false,
                modelFilter: modelFilter,
                hasDefaultPrinter: hasDefaultPrinter,
                discoverMethods: {},
                componentReady: false
            };
        },

        componentDidMount: function componentDidMount() {
            var selectedPrinter = InitializeMachine.defaultPrinter.get(),
                self = this,
                currentPrinter,
                _options = [],
                refreshOption = function refreshOption(options) {
                _options = [];

                options.forEach(function (el) {
                    _options.push({
                        label: self._renderPrinterItem(el)
                    });

                    if (true === self.hasDefaultPrinter && el.uuid === selectedPrinter.uuid && this.props.bypassDefaultPrinter !== true) {
                        // update device stat
                        InitializeMachine.defaultPrinter.set({
                            name: el.name,
                            serial: el.serial,
                            uuid: el.uuid
                        });
                    }
                });

                if (self.props.showExport) {
                    _options.push({
                        label: self._renderExportItem()
                    });
                }

                self.setState({
                    devices: _options,
                    loadFinished: true
                }, function () {
                    self._openAlertWithnoPrinters();
                });
            };

            AlertStore.onCancel(self._onCancel);

            var existWifiAndUsbConnection = function existWifiAndUsbConnection(serial) {
                var devices = DeviceMaster.getAvailableDevices(),
                    num = 0;

                devices.map(function (device) {
                    if (device.serial === serial) {
                        num++;
                    }
                });

                return num >= 2;
            };

            var next = function next(status, preferredDevice) {
                console.trace("Calling Printer-Selector Next");
                if (preferredDevice) {
                    selectedPrinter = preferredDevice;
                }
                self.setState({
                    discoverMethods: Discover(self.state.discoverId, function (printers) {
                        printers = DeviceList(printers);
                        refreshOption(printers);
                    })
                }, function () {
                    var timer,
                        tryTimes = 20,
                        selectDefaultDevice = function selectDefaultDevice() {
                        if (self.state.hasDefaultPrinter) {
                            if (currentPrinter) {
                                self._selectPrinter(selectedPrinter);
                                clearInterval(timer);
                            } else {
                                tryTimes--;
                            }
                        }

                        if (0 > tryTimes) {
                            clearInterval(timer);
                            if (self.state.devices.length === 0) {
                                AlertActions.showPopupError('device-not-found', lang.message.device_not_found.message, lang.message.device_not_found.caption);
                            } else {
                                self.setState({
                                    loadFinished: false,
                                    hasDefaultPrinter: false
                                });
                            }
                        }
                    };

                    currentPrinter = self.state.discoverMethods.getLatestPrinter(selectedPrinter);

                    timer = setInterval(selectDefaultDevice, 100);
                });

                self._waitForPrinters();
            };

            //check for default printer availablity
            var defaultDeviceExists = DeviceMaster.existDevice(selectedPrinter.serial);

            var noDefaultPrinter = function noDefaultPrinter() {
                self.setState({
                    loadFinished: false,
                    hasDefaultPrinter: false
                }, next);
            };

            if (defaultDeviceExists && (this.state.modelFilter.length === 0 || this.state.modelFilter.indexOf(selectedPrinter.model) >= 0)) {
                var existBothConnection = existWifiAndUsbConnection(selectedPrinter.serial);
                if (existBothConnection) {
                    noDefaultPrinter();
                } else {
                    DeviceMaster.selectDevice(selectedPrinter).then(next).fail(noDefaultPrinter);
                }
            } else {
                noDefaultPrinter();
            }
        },

        componentWillUnmount: function componentWillUnmount() {
            if ('function' === typeof this.state.discoverMethods.removeListener) {
                this.state.discoverMethods.removeListener(this.state.discoverId);
            }

            AlertStore.removeCancelListener(this._onCancel);
            if (this.props.onUnmount) {
                this.props.onUnmount();
            }

            clearTimeout(this._noPrinterAlertTimeout);
        },

        _onCancel: function _onCancel(id) {
            this.setState({ processing: false });
            switch (id) {
                case 'no-printer':
                case 'printer-connection-timeout':
                    this._handleClose();
                    break;
                default:
                    break;
            }
        },

        _selectPrinter: function _selectPrinter(printer, e) {
            var _this = this;

            this.setState({ processing: true });
            var self = this,
                _onError;

            ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, lang.initialize.connecting);
            _onError = function onError() {
                ProgressActions.close();
                if (self.selected_printer.plaintext_password) {
                    //Skip if user entered password for the first time.
                    self._returnSelectedPrinter();
                } else {
                    InputLightboxActions.open('auth-device', {
                        type: InputLightboxConstants.TYPE_PASSWORD,
                        caption: sprintf(lang.select_printer.notification, printer.name),
                        inputHeader: lang.select_printer.please_enter_password,
                        confirmText: lang.select_printer.submit,
                        onSubmit: function onSubmit(password) {
                            printer.plaintext_password = password;
                            ProgressActions.open(ProgressConstants.NONSTOP);

                            self._auth(printer.uuid, password, {
                                onError: function onError(response) {
                                    var message = false === response.reachable ? lang.select_printer.unable_to_connect : lang.select_printer.auth_failure;

                                    ProgressActions.close();

                                    AlertActions.showPopupError('device-auth-fail', message);
                                }
                            });
                        }
                    });
                }
            };

            printer = DeviceMaster.usbDefaultDeviceCheck(printer);
            self.selected_printer = printer;

            if ('00000000000000000000000000000000' === self.selected_printer.uuid) {
                self._returnSelectedPrinter();
            } else {
                DeviceMaster.selectDevice(self.selected_printer).done(function (status) {
                    if (status === DeviceConstants.CONNECTED) {
                        printer = self.selected_printer;
                        ProgressActions.open(ProgressConstants.NONSTOP);

                        var next = function next() {
                            ProgressActions.close();
                            if (true === self.props.forceAuth && true === printer.password) {
                                _onError();
                                return;
                            }

                            self._returnSelectedPrinter();
                        };

                        if (_this.props.bypassCheck === true) {
                            next();
                        } else {
                            CheckDeviceStatus(printer).done(next);
                        }
                    } else if (status === DeviceConstants.TIMEOUT) {
                        // TODO: Check default printer
                        if (self.state.hasDefaultPrinter) {
                            AlertActions.showPopupError('printer-connection-timeout', sprintf(lang.message.device_not_found.message, self.selected_printer.name), lang.message.device_not_found.caption);
                        } else {
                            AlertActions.showPopupError('printer-connection-timeout', lang.message.connectionTimeout, lang.caption.connectionTimeout);
                        }
                    }
                }).always(function () {
                    ProgressActions.close();
                }).fail(function (status) {
                    AlertActions.showPopupError('fatal-occurred', status);
                });
            }
        },

        _auth: function _auth(uuid, password, opts) {
            ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, lang.initialize.connecting);
            opts = opts || {};
            opts.onError = opts.onError || function () {};

            var self = this,
                _opts;

            _opts = {
                onSuccess: function onSuccess(data) {
                    ProgressActions.close();
                    self._returnSelectedPrinter();
                },
                onFail: function onFail(data) {
                    ProgressActions.close();
                    opts.onError(data);
                },
                checkPassword: self.props.forceAuth
            };

            Touch(_opts).send(uuid, password);
        },

        _handleClose: function _handleClose(e) {
            this.props.onClose();
        },

        // renders
        _renderPrinterSelection: function _renderPrinterSelection() {
            var _this2 = this;

            var devices = this.state.devices;
            if (this.state.modelFilter.length > 0) {

                devices = devices.filter(function (v) {
                    return _this2.state.modelFilter.indexOf(v.label.props['data-model']) >= 0 || v.label.props.id === "export-item";
                });
            }
            var options = 0 < devices.length ? devices : [{
                label: React.createElement('div', { className: 'spinner-roller spinner-roller-reverse' })
            }],
                content = React.createElement(
                'div',
                { className: 'device-wrapper' },
                React.createElement(ListView, { className: 'printer-list', items: options })
            );
            if (this.state.processing) {
                content = React.createElement('div', { className: 'spinner-roller invert' });
            }

            return content;
        },

        _returnSelectedPrinter: function _returnSelectedPrinter() {
            var self = this;

            self.props.onGettingPrinter(self.selected_printer);
        },

        _waitForPrinters: function _waitForPrinters() {
            this._noPrinterAlertTimeout = setTimeout(this._openAlertWithnoPrinters, 5000);
        },

        _openAlertWithnoPrinters: function _openAlertWithnoPrinters() {
            var self = this;

            AlertStore.removeRetryListener(self._waitForPrinters);

            // if (self.state.devices.length === 0 && !self.state.hasDefaultPrinter) {
            //     AlertActions.showPopupRetry('no-printer', lang.device_selection.no_printers);
            //     AlertStore.onRetry(self._waitForPrinters);
            // }
        },

        _renderPrinterItem: function _renderPrinterItem(printer) {
            var meta,
                status = lang.machine_status,
                headModule = lang.head_module,
                statusId = 'st' + printer.st_id,
                statusText = status[printer.st_id] || status.UNKNOWN,
                headText = headModule[printer.head_module] || headModule.UNKNOWN;

            if (DeviceConstants.status.RUNNING === printer.st_id && 'number' === typeof printer.st_prog) {
                statusText += ' - ' + (parseInt(printer.st_prog * 1000) * 0.1).toFixed(1) + '%';
            }

            try {
                meta = JSON.stringify(printer);
            } catch (ex) {
                console.log(ex, printer);
            }

            var img = 'img/icon_' + (printer.source === 'h2h' ? 'usb' : 'wifi') + '.svg';

            return React.createElement(
                'div',
                { className: 'device printer-item', id: printer.name, 'data-model': printer.model, 'data-status': statusId, 'data-meta': meta, onClick: this._selectPrinter.bind(null, printer) },
                React.createElement(
                    'div',
                    { className: 'col device-name', id: printer.name },
                    printer.name
                ),
                React.createElement(
                    'div',
                    { className: 'col module' },
                    headText
                ),
                React.createElement(
                    'div',
                    { className: 'col status' },
                    statusText
                ),
                React.createElement(
                    'div',
                    { className: 'col connection-type' },
                    React.createElement('img', { src: img })
                )
            );
        },

        _renderExportItem: function _renderExportItem(printer) {
            var _this3 = this;

            return React.createElement(
                'div',
                { className: 'device printer-item', id: "export-item", 'data-status': 0, 'data-meta': 0, onClick: function onClick() {
                        _this3.props.onGettingPrinter("export_fcode");
                    } },
                React.createElement(
                    'div',
                    { className: 'col device-name', id: "export-item-name" },
                    React.createElement('i', { className: 'fa fa-save' }),
                    '\xA0\xA0',
                    lang.laser.export_fcode
                ),
                React.createElement('div', { className: 'col module' }),
                React.createElement('div', { className: 'col status' }),
                React.createElement('div', { className: 'col connection-type' })
            );
        },

        render: function render() {
            var self = this,
                showPassword = self.state.showPassword,
                wrapperClass = { 'select-printer': true },
                wrapperStyle = self.props.WindowStyle,
                content = self._renderPrinterSelection(lang),
                hasDefaultPrinter = self.state.hasDefaultPrinter;

            if (self.props.className) {
                wrapperClass[self.props.className] = true;
            }
            wrapperClass = ReactCx.cx(wrapperClass);

            var arrowClass = 'arrow arrow-' + this.props.arrowDirection;

            return true === hasDefaultPrinter ? React.createElement('span', null) : React.createElement(
                'div',
                { className: wrapperClass, style: wrapperStyle },
                content,
                React.createElement('div', { className: arrowClass })
            );
        }

    });

    View.BEAMBOX_FILTER = "laser-b1,laser-b2,fbm1,fbb1b,fbb1p,mozu1,darwin-dev";
    View.DELTA_FILTER = "delta-1,delta-1p";
    return View;
});