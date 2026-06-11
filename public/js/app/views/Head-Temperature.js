'use strict';

define(['react', 'reactDOM', 'helpers/i18n', 'jsx!widgets/Modal', 'jsx!widgets/Alert', 'helpers/device-master', 'app/constants/device-constants', 'app/actions/alert-actions'], function (React, ReactDOM, i18n, Modal, Alert, DeviceMaster, DeviceConstants, AlertActions) {
    'use strict';

    var lang = i18n.get(),
        view;

    view = React.createClass({
        displayName: 'view',


        getInitialState: function getInitialState() {
            return {
                currentTemperature: 0,
                enteredTemperature: '',
                targetTemperature: ''
            };
        },

        componentDidMount: function componentDidMount() {
            var _this = this;

            var checkToolhead = function checkToolhead() {
                DeviceMaster.headInfo().then(function (info) {
                    if (info.TYPE === DeviceConstants.EXTRUDER) {
                        _this._startReport();
                    } else {
                        var message = lang.head_temperature.incorrect_toolhead;

                        if (info.head_module === null) {
                            message = lang.head_temperature.attach_toolhead;
                        }

                        AlertActions.showPopupError('HEAD-ERROR', message);
                        _this.props.onClose();
                    }
                });
            };

            DeviceMaster.getReport().then(function (report) {
                _this.operateDuringPause = report.st_id === 48;

                if (_this.operateDuringPause) {
                    DeviceMaster.startToolheadOperation().then(function () {
                        _this._startReport();
                    });
                } else {
                    DeviceMaster.enterMaintainMode().then(function () {
                        checkToolhead();
                    });
                }
            });
        },

        componentWillUnmount: function componentWillUnmount() {
            if (this.operateDuringPause) {
                DeviceMaster.endToolheadOperation();
            } else {
                DeviceMaster.quitTask();
            }
            clearInterval(this.report);
        },

        _startReport: function _startReport() {
            var _this2 = this;

            this.report = setInterval(function () {
                var getStatus = function getStatus() {
                    return _this2.operateDuringPause ? DeviceMaster.getReport() : DeviceMaster.getHeadStatus();
                };

                getStatus().then(function (status) {
                    if (status.rt) {
                        _this2.setState({ currentTemperature: Math.round(status.rt[0]) });
                    }
                });
            }, 1500);
        },

        _handleChangeTemperature: function _handleChangeTemperature(e) {
            this.setState({ enteredTemperature: e.target.value });
        },

        _handleSetTemperature: function _handleSetTemperature(e) {
            e.preventDefault();
            var t = parseInt(this.state.enteredTemperature);

            if (t > 230) {
                t = 230;
            } else if (t < 60) {
                t = 60;
            }

            this.setState({ targetTemperature: t });
            ReactDOM.findDOMNode(this.refs.temperature).value = t;

            if (this.operateDuringPause) {
                DeviceMaster.setHeadTemperatureDuringPause(t);
            } else {
                DeviceMaster.setHeadTemperature(t);
            }
        },

        render: function render() {
            var _state = this.state,
                currentTemperature = _state.currentTemperature,
                targetTemperature = _state.targetTemperature,
                temperature = void 0,
                buttons = void 0,
                content = void 0,
                className = void 0;


            buttons = [{
                label: lang.head_temperature.done,
                className: 'btn-default btn-alone-right',
                onClick: this.props.onClose
            }];

            temperature = currentTemperature + (targetTemperature ? ' / ' + targetTemperature : '');
            temperature += ' °C';

            content = React.createElement(
                'div',
                { className: 'info' },
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        React.createElement(
                            'label',
                            null,
                            lang.head_temperature.target_temperature
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement('input', {
                            type: 'number',
                            ref: 'temperature',
                            onChange: this._handleChangeTemperature
                        }),
                        React.createElement(
                            'button',
                            { className: 'btn-default', onClick: this._handleSetTemperature },
                            lang.head_temperature.set
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        React.createElement(
                            'label',
                            null,
                            lang.head_temperature.current_temperature
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            { className: 'temperature' },
                            temperature
                        )
                    )
                )
            );

            content = React.createElement(Alert, {
                lang: lang,
                caption: lang.head_temperature.title,
                message: content,
                buttons: buttons
            });

            className = {
                'modal-change-filament': true,
                'shadow-modal': true,
                'head-temperature': true
            };

            return React.createElement(
                'div',
                { className: 'always-top head-temperature', ref: 'modal' },
                React.createElement(Modal, {
                    className: className,
                    content: content,
                    disabledEscapeOnBackground: false
                })
            );
        }

    });

    return view;
});