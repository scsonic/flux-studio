'use strict';

define(['jquery', 'react', 'reactDOM', 'reactPropTypes', 'helpers/i18n', 'helpers/shortcuts', 'jsx!widgets/Modal', 'jsx!widgets/Alert', 'helpers/device-master', 'app/constants/device-constants', 'app/actions/alert-actions', 'app/stores/alert-store', 'helpers/device-error-handler'], function ($, React, ReactDOM, PropTypes, i18n, shortcuts, Modal, Alert, DeviceMaster, DeviceConstants, AlertActions, AlertStore, DeviceErrorHandler) {

    var lang = i18n.get(),
        maxTemperature = 220,
        steps = {
        HOME: 'HOME',
        GUIDE: 'GUIDE',
        HEATING: 'HEATING',
        EMERGING: 'EMERGING',
        UNLOADING: 'UNLOADING',
        COMPLETED: 'COMPLETED',
        KICKED: 'KICKED',
        DISCONNECTED: 'DISCONNECTED'
    },
        View = React.createClass({
        displayName: 'View',


        propTypes: {
            open: PropTypes.bool,
            device: PropTypes.object,
            src: PropTypes.string,
            onClose: PropTypes.func
        },

        getDefaultProps: function getDefaultProps() {
            return {
                open: false,
                device: {},
                onClose: function onClose() {}
            };
        },

        getInitialState: function getInitialState() {
            return {
                type: this.props.src === 'TUTORIAL' ? DeviceConstants.LOAD_FILAMENT : '',
                currentStep: this.props.src === 'TUTORIAL' ? steps.GUIDE : steps.HOME,
                temperature: '-',
                flexible: false
            };
        },

        componentWillUpdate: function componentWillUpdate(nextProps, nextState) {
            if (true === nextProps.open && false === this.props.open) {
                this.setState(this.getInitialState());
            }
        },

        componentDidMount: function componentDidMount() {
            if (true === this.props.open) {
                if (this.props.src === 'TUTORIAL') {
                    DeviceMaster.selectDevice(this.props.device).then(function (status) {
                        if (status !== DeviceConstants.CONNECTED) {
                            // alert and close
                            AlertActions.showPopupError('change-filament', status);
                        }
                    });
                } else {
                    var selectedDevice = DeviceMaster.getSelectedDevice();
                    if (selectedDevice.uuid !== this.props.device.uuid) {
                        DeviceMaster.selectDevice(this.props.device).then(function (status) {
                            if (status !== DeviceConstants.CONNECTED) {
                                // alert and close
                                AlertActions.showPopupError('change-filament', status);
                            }
                        });
                    }
                }

                if (this.props.src !== 'TUTORIAL') {
                    AlertStore.onCancel(this._onCancel);
                }
            }
        },

        componentWillUnmount: function componentWillUnmount() {
            AlertStore.removeCancelListener(this._onCancel);
            this._onClose();
        },

        shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
            if (this.state.currentStep === nextState.currentStep && this.state.temperature === nextState.temperature) {
                return false;
            }

            if (steps.HEATING === nextState.currentStep && steps.HEATING !== this.state.currentStep) {
                this._goMaintain(nextState.type);
            }

            return true;
        },

        _onCancel: function _onCancel(e) {
            var _this = this;

            // if change filament during pause operation
            if (this.isChangingFilamentDuringPause === true) {
                clearInterval(this.changeFilamentDuringPauseTimer);
                DeviceMaster.endToolheadOperation().then(function () {
                    _this.setState(_this.getInitialState());
                });
            } else {
                DeviceMaster.stopChangingFilament().then(function () {
                    DeviceMaster.killSelf();
                });
                if (e === steps.KICKED) {
                    AlertActions.showPopupInfo('change filament kicked', lang.change_filament.kicked, lang.change_filament.home_caption);
                }
            }
            this.setState(this.getInitialState());
        },

        _goMaintain: function _goMaintain(type) {
            var _this2 = this;

            var self = this,
                nextStep = self.state.type === DeviceConstants.LOAD_FILAMENT ? steps.EMERGING : steps.UNLOADING;

            var progress = function progress(response) {
                console.log('changing filament progress', response, response.stage);
                var status = response.stage[1];
                switch (status) {
                    case 'WAITTING':
                    case 'WAITING':
                    case 'LOADING':
                        self._next(steps.EMERGING, DeviceConstants.LOAD_FILAMENT);
                        if (self.state.loading_status !== response.stage[1]) {
                            self.setState({ loading_status: response.stage[1] });
                            self.forceUpdate();
                        }
                        break;
                    case 'UNLOADING':
                        self._next(steps.UNLOADING);
                        break;
                    case 'DISCONNECTED':
                        DeviceMaster.kickChangeFilament().always(function () {
                            self._next(steps.DISCONNECTED);
                        });
                        break;
                    default:
                        if (response.error) {
                            if (response.error[0] === 'KICKED') {
                                self._onCancel();
                            }
                        } else {
                            // update temperature
                            self.setState({
                                temperature: response.temperature || 220
                            });
                        }
                        break;
                }
            };

            var done = function done(response) {
                DeviceMaster.quitTask('maintain').done(function () {
                    self._next(steps.COMPLETED);
                });
            };

            var errorMessageHandler = function errorMessageHandler(response) {
                if (typeof response.error === 'string') {
                    response.error = [response.error];
                }
                DeviceMaster.quitTask('maintain');

                AlertActions.showPopupError('change-filament-device-error', DeviceErrorHandler.translate(response.error));
            };

            var processReport = function processReport(report) {
                console.log('processing report', report);
                // if changing filament during pause
                if (report.st_id === 48) {
                    _this2.isChangingFilamentDuringPause = true;

                    DeviceMaster.changeFilamentDuringPause(type).progress(function (p, t) {
                        _this2.changeFilamentDuringPauseTimer = t;
                        p.device_status = p.device_status || {}; // sometimes backend is not passing device_status property

                        if (p.device_status.tt && p.device_status.rt) {
                            maxTemperature = p.device_status.tt[0];
                            if (p.device_status.rt) {
                                _this2.setState({
                                    type: type,
                                    temperature: p.device_status.rt[0]
                                });
                            }
                        }

                        // change to emerging when temperature is reached
                        if (type === 'LOAD' && _this2.state.currentStep !== steps.EMERGING) {
                            if (p.loading === true) {
                                _this2.setState({
                                    currentStep: steps.EMERGING
                                });
                            }
                        }
                    }).then(function () {
                        _this2.setState({ currentStep: steps.COMPLETED });
                    });
                }
                // regular change filament
                else {
                        console.log('Changing Filament', _this2.state.flexible == true);
                        DeviceMaster.changeFilament(type, _this2.state.flexible).progress(progress).done(done).fail(function (response) {
                            // Regularize error message
                            if (response && response.info === 'TYPE_ERROR') {
                                response.error = ['HEAD_ERROR', 'TYPE_ERROR', 'EXTRUDER', 'N/A'];
                            }

                            switch (response.error[0]) {
                                case 'RESOURCE_BUSY':
                                    AlertActions.showDeviceBusyPopup('change-filament-device-busy');
                                    break;
                                case 'TIMEOUT':
                                    DeviceMaster.closeConnection();
                                    AlertActions.showPopupError('change-filament-toolhead-no-response', lang.change_filament.toolhead_no_response);
                                    self.props.onClose();
                                    break;
                                case 'HEAD_ERROR':
                                    if (response.error[3] === 'N/A') {
                                        AlertActions.showPopupError('change-filament-device-error', DeviceErrorHandler.translate(['HEAD_ERROR', 'HEAD_OFFLINE']));
                                    } else {
                                        AlertActions.showPopupError('change-filament-device-error', DeviceErrorHandler.translate(['HEAD_ERROR', 'TYPE_ERROR']));
                                    }
                                    DeviceMaster.quitTask('maintain').then(function () {
                                        self.setState({ currentStep: steps.GUIDE });
                                    });
                                    break;
                                case 'UNKNOWN_COMMAND':
                                    AlertActions.showDeviceBusyPopup('change-filament-zombie', lang.change_filament.maintain_zombie);
                                    break;
                                case 'KICKED':
                                    self._onCancel(steps.KICKED);
                                    break;
                                case 'CANCEL':
                                    break;
                                default:
                                    errorMessageHandler(response);
                            }
                        });
                    }
            };

            console.log('selecting device');
            DeviceMaster.selectDevice(self.props.device).then(function () {
                console.log('getting report');
                return DeviceMaster.getReport();
            }).then(processReport);
        },

        _onClose: function _onClose(e) {
            this.props.onClose(e);
            ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this.refs.modal).parentNode);
        },

        _next: function _next(nextStep, type) {
            var flexible = false;
            if (type == DeviceConstants.LOAD_FLEXIBLE_FILAMENT) {
                flexible = true;
                type = DeviceConstants.LOAD_FILAMENT;
            }
            if (nextStep !== this.state.currentStep) {
                var newState = {
                    type: type || this.state.type,
                    currentStep: nextStep
                };
                if (type) {
                    newState.flexible = flexible;
                }
                this.setState(newState);
            }
        },

        _loadFilamentFromComplete: function _loadFilamentFromComplete() {
            var _this3 = this;

            this.setState(this.getInitialState(), function () {
                _this3._next(steps.GUIDE, DeviceConstants.LOAD_FILAMENT);
            });
        },

        _makeCaption: function _makeCaption(caption) {
            if ('undefined' === typeof caption) {
                caption = DeviceConstants.LOAD_FILAMENT === this.state.type ? lang.change_filament.load_filament : lang.change_filament.unload_filament;
            }

            return caption + ' - ' + (this.props.device.name || '');
        },

        // sections
        _sectionHome: function _sectionHome() {
            return {
                caption: lang.change_filament.home_caption,
                message: React.createElement(
                    'div',
                    { className: 'way-to-go' },
                    React.createElement(
                        'button',
                        {
                            className: 'btn btn-default',
                            'data-ga-event': 'load-filament',
                            onClick: this._next.bind(null, steps.GUIDE, DeviceConstants.LOAD_FILAMENT)
                        },
                        lang.change_filament.load_filament_caption
                    ),
                    React.createElement(
                        'button',
                        {
                            className: 'btn btn-default',
                            'data-ga-event': 'load-filament',
                            onClick: this._next.bind(null, steps.GUIDE, DeviceConstants.LOAD_FLEXIBLE_FILAMENT)
                        },
                        lang.change_filament.load_flexible_filament_caption
                    ),
                    React.createElement(
                        'button',
                        {
                            className: 'btn btn-default',
                            'data-ga-event': 'unload-filament',
                            onClick: this._next.bind(null, steps.HEATING, DeviceConstants.UNLOAD_FILAMENT)
                        },
                        lang.change_filament.unload_filament_caption
                    )
                ),
                buttons: [{
                    label: lang.change_filament.cancel,
                    className: 'btn-default btn-alone-left',
                    dataAttrs: {
                        'ga-event': 'cancel'
                    },
                    onClick: this.props.onClose
                }]
            };
        },

        _sectionGuide: function _sectionGuide() {
            var activeLang = i18n.getActiveLang(),
                imageSrc = 'en' === activeLang ? 'img/insert-filament-en.png' : 'img/insert-filament-zh-tw.png';

            return {
                message: React.createElement('img', { className: 'guide-image', src: imageSrc }),
                buttons: [{
                    label: lang.change_filament.cancel,
                    dataAttrs: {
                        'ga-event': 'cancel'
                    },
                    onClick: this.props.onClose
                }, {
                    label: lang.change_filament.next,
                    dataAttrs: {
                        'ga-event': 'heatup'
                    },
                    onClick: this._next.bind(null, steps.HEATING, '')
                }]
            };
        },

        _sectionHeating: function _sectionHeating() {
            var _state = this.state,
                temperature = _state.temperature,
                targetTemperature = _state.targetTemperature;


            return {
                message: React.createElement(
                    'div',
                    { className: 'message-container' },
                    React.createElement(
                        'p',
                        { className: 'temperature' },
                        React.createElement(
                            'span',
                            null,
                            lang.change_filament.heating_nozzle
                        ),
                        React.createElement(
                            'span',
                            null,
                            temperature,
                            ' / ',
                            targetTemperature || maxTemperature,
                            '\xB0C'
                        )
                    ),
                    React.createElement('div', { className: 'spinner-roller spinner-roller-reverse' })
                ),
                buttons: [{
                    label: lang.change_filament.cancel,
                    onClick: this._onCancel
                }]
            };
        },

        _sectionEmerging: function _sectionEmerging() {
            var self = this,
                activeLang = i18n.getActiveLang(),
                imageSrc,
                message,
                buttons;

            imageSrc = 'en' === activeLang ? 'img/press-to-accelerate-en.png' : 'img/press-to-accelerate-zh-tw.png';

            message = React.createElement(
                'div',
                { className: 'message-container' },
                React.createElement('img', { className: 'guide-image', src: imageSrc })
            );

            buttons = [{
                label: 'ok',
                className: 'btn-default btn-alone-right',
                onClick: function onClick(e) {
                    self.setState({
                        type: type || this.state.type,
                        currentStep: steps.COMPLETED
                    });
                }
            }, {
                label: lang.change_filament.cancel,
                className: 'btn-default btn-alone-left',
                onClick: this._onCancel
            }, {
                label: [React.createElement(
                    'span',
                    { className: 'auto-emerging' },
                    this.state.loading_status === 'WAITING' ? lang.change_filament.auto_emerging : lang.change_filament.loading_filament
                ), React.createElement('div', { className: 'spinner-roller spinner-roller-reverse' })],
                type: 'icon',
                className: 'btn-icon',
                onClick: function onClick(e) {
                    e.preventDefault();
                }
            }];

            return { message: message, buttons: buttons };
        },

        _sectionUnloading: function _sectionUnloading() {
            return {
                message: React.createElement(
                    'div',
                    { className: 'message-container' },
                    React.createElement(
                        'p',
                        null,
                        lang.change_filament.unloading
                    ),
                    React.createElement('div', { className: 'spinner-roller spinner-roller-reverse' })
                ),
                buttons: []
            };
        },

        _sectionCompleted: function _sectionCompleted() {
            var loaded = void 0,
                unloaded = void 0;

            loaded = React.createElement(
                'div',
                { className: 'message-container' },
                lang.change_filament.loaded
            );

            unloaded = React.createElement(
                'div',
                { className: 'message-container' },
                lang.change_filament.unloaded,
                React.createElement(
                    'p',
                    null,
                    React.createElement(
                        'a',
                        { onClick: this._loadFilamentFromComplete },
                        lang.change_filament.load_filament
                    )
                )
            );

            return {
                message: this.state.type === DeviceConstants.LOAD_FILAMENT ? loaded : unloaded,
                buttons: [{
                    label: lang.change_filament.ok,
                    className: 'btn-default btn-alone-right',
                    dataAttrs: {
                        'ga-event': 'completed'
                    },
                    onClick: this.props.onClose
                }]
            };
        },
        _sectionDisconnected: function _sectionDisconnected() {
            var _this4 = this;

            return {
                message: React.createElement(
                    'div',
                    { className: 'message-container' },
                    lang.change_filament.disconnected
                ),
                buttons: [{
                    label: lang.change_filament.ok,
                    className: 'btn-default btn-alone-right',
                    dataAttrs: {
                        'ga-event': 'disconnected'
                    },
                    onClick: function onClick() {
                        _this4.setState(_this4.getInitialState());
                    }
                }]
            };
        },

        _sectionFactory: function _sectionFactory() {
            var self = this,
                renderFunc,
                renderName = this.state.currentStep.toLowerCase().split('');

            renderName[0] = renderName[0].toUpperCase();
            renderName = '_section' + renderName.join('').replace('_', '');

            if (this.state.currentStep === steps.COMPLETED) {
                renderName = '_sectionCompleted';
            } else if (this.state.temperature === 220) {
                renderName = '_sectionEmerging';
            }

            if (true === self.hasOwnProperty(renderName)) {
                renderFunc = self[renderName];
            } else {
                renderFunc = function renderFunc() {
                    return {
                        buttons: [{
                            label: lang.change_filament.cancel,
                            className: 'btn-default btn-alone-left',
                            dataAttrs: {
                                'ga-event': 'cancel'
                            },
                            onClick: self.props.onClose
                        }]
                    };
                };
            }

            return renderFunc();
        },

        render: function render() {
            if (false === this.props.open) {
                return React.createElement('div', null);
            }

            var section = this._sectionFactory(),
                content = React.createElement(Alert, {
                lang: lang,
                caption: this._makeCaption(section.caption),
                message: section.message,
                buttons: section.buttons
            }),
                className = {
                'modal-change-filament': true,
                'shadow-modal': true
            };

            return React.createElement(
                'div',
                { className: 'always-top', ref: 'modal' },
                React.createElement(Modal, { className: className, content: content, disabledEscapeOnBackground: false }),
                'please wait'
            );
        }

    });

    return View;
});