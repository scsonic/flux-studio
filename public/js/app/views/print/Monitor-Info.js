'use strict';

define(['react', 'reactPropTypes', 'app/constants/global-constants', 'app/constants/device-constants', 'app/constants/monitor-status', 'helpers/duration-formatter'], function (React, PropTypes, GlobalConstants, DeviceConstants, MonitorStatus, FormatDuration) {

    'use strict';

    var findObjectContainsProperty = function findObjectContainsProperty() {
        var infoArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var propertyName = arguments[1];

        return infoArray.filter(function (o) {
            return Object.keys(o).some(function (n) {
                return n === propertyName;
            });
        });
    };

    return React.createClass({
        contextTypes: {
            store: PropTypes.object,
            slicingResult: PropTypes.object,
            lang: PropTypes.object
        },

        componentWillMount: function componentWillMount() {
            var _this = this;

            var _context = this.context,
                store = _context.store,
                lang = _context.lang;

            MonitorStatus['setLang'](lang);

            this.lang = lang;
            this.unsubscribe = store.subscribe(function () {
                _this.forceUpdate();
            });
        },

        componentWillUnmount: function componentWillUnmount() {
            clearInterval(this.timer);
            this.unsubscribe();
        },

        _isAbortedOrCompleted: function _isAbortedOrCompleted() {
            var _context$store$getSta = this.context.store.getState(),
                Device = _context$store$getSta.Device;

            return Device.status.st_id === DeviceConstants.status.ABORTED || Device.status.st_id === DeviceConstants.status.COMPLETED;
        },

        _getHeadInfo: function _getHeadInfo() {
            var _context$store$getSta2 = this.context.store.getState(),
                Device = _context$store$getSta2.Device;

            return Device.status.module ? this.lang.monitor.device[Device.status.module] : '';
        },

        _getStatus: function _getStatus() {
            var _context$store$getSta3 = this.context.store.getState(),
                Monitor = _context$store$getSta3.Monitor,
                Device = _context$store$getSta3.Device;

            if (Boolean(Monitor.uploadProgress)) {
                return this.lang.device.uploading;
            }
            if (Device.status.st_label && Device.status.st_label !== 'LOAD_FILAMENT' && Device.status.st_label !== 'UNLOAD_FILAMENT') {
                var _MonitorStatus$Device = MonitorStatus[Device.status.st_label](),
                    displayStatus = _MonitorStatus$Device.displayStatus;

                return displayStatus;
            } else {
                return '';
            }
        },

        _getTemperature: function _getTemperature() {
            var _context$store$getSta4 = this.context.store.getState(),
                Device = _context$store$getSta4.Device;

            if (!Device.status || this._isAbortedOrCompleted()) {
                return '';
            }

            // rt = real temperature, tt = target temperature
            var _Device$status = Device.status,
                st_label = _Device$status.st_label,
                rt = _Device$status.rt,
                tt = _Device$status.tt,
                lang = this.lang.monitor;


            if (st_label === DeviceConstants.RUNNING) {
                return rt ? lang.temperature + ' ' + parseInt(rt * 10) / 10 + ' \xB0C' : '';
            } else {
                return rt ? lang.temperature + ' ' + parseInt(rt * 10) / 10 + ' \xB0C / ' + tt + ' \xB0C' : '';
            }
        },

        _getProgress: function _getProgress() {
            this.context.slicingResult = this.context.slicingResult || {};

            var _context$store$getSta5 = this.context.store.getState(),
                Monitor = _context$store$getSta5.Monitor,
                Device = _context$store$getSta5.Device,
                time = this.context.slicingResult.time,
                lang = this.lang.monitor;

            if (Object.keys(Device.status).length === 0) {
                return lang.connecting;
            }

            if (Number.isInteger(Monitor.uploadProgress)) {
                return lang.processing + ' ' + Monitor.uploadProgress + '%';
            }

            if (Monitor.downloadProgress.size !== '') {
                return lang.processing + ' ' + parseInt((Monitor.downloadProgress.size - Monitor.downloadProgress.left) / Monitor.downloadProgress.size * 100) + '%';
            }

            var o = findObjectContainsProperty(Device.jobInfo, 'TIME_COST');
            if (o.length !== 0) {
                time = o[0].TIME_COST;
            }

            if (!Device.status || !Device.jobInfo || typeof time === 'undefined' || Monitor.mode === GlobalConstants.FILE_PREVIEW || this._isAbortedOrCompleted() || Device.status.st_label === 'WAITING_HEAD' || !Device.status.prog) {
                return '';
            }

            var percentageDone = parseInt(Device.status.prog * 100),

            // timeLeft = FormatDuration(o[0].TIME_COST * (1 - Device.status.prog));
            timeLeft = FormatDuration(time * (1 - Device.status.prog));

            return percentageDone + '%, ' + timeLeft + ' ' + this.lang.monitor.left;
        },

        render: function render() {
            return React.createElement(
                'div',
                { className: 'wrapper' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'head-info' },
                        this._getHeadInfo()
                    ),
                    React.createElement(
                        'div',
                        { className: 'status right' },
                        this._getStatus()
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'temperature' },
                        this._getTemperature()
                    ),
                    React.createElement(
                        'div',
                        { className: 'time-left right' },
                        this._getProgress()
                    )
                )
            );
        }
    });

    return monitorInfo;
});