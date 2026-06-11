'use strict';

define(['react', 'reactPropTypes', 'app/constants/global-constants', 'app/constants/device-constants', 'plugins/classnames/index'], function (React, PropTypes, GlobalConstants, DeviceConstants, ClassNames) {

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

    var type = { FILE: 'FILE', FOLDER: 'FOLDER' };

    return React.createClass({
        PropTypes: {},

        contextTypes: {
            store: PropTypes.object,
            lang: PropTypes.object
        },

        componentWillMount: function componentWillMount() {
            var _this = this;

            var store = this.context.store;


            this.unsubscribe = store.subscribe(function () {
                _this.forceUpdate();
            });
        },

        componentWillUpdate: function componentWillUpdate() {
            return false;
        },

        componentWillUnmount: function componentWillUnmount() {
            this.unsubscribe();
        },

        _operation: function _operation() {
            var _this2 = this;

            var _context$store$getSta = this.context.store.getState(),
                Monitor = _context$store$getSta.Monitor,
                Device = _context$store$getSta.Device;

            var lang = this.context.lang;


            var cameraClass = ClassNames('btn-camera btn-control', { 'on': Monitor.mode === GlobalConstants.CAMERA }),
                cameraDescriptionClass = ClassNames('description', { 'on': Monitor.mode === GlobalConstants.CAMERA }),
                className = void 0;

            return {

                go: function go(enable) {
                    className = ClassNames('controls center', { 'disabled': !enable });
                    return React.createElement(
                        'div',
                        { className: className, onClick: _this2.props.onGo },
                        React.createElement('div', { className: 'btn-go btn-control' }),
                        React.createElement(
                            'div',
                            { className: 'description' },
                            lang.monitor.go
                        )
                    );
                },

                pause: function pause(enable) {
                    className = ClassNames('controls center', { 'disabled': !enable });
                    return React.createElement(
                        'div',
                        { className: className, onClick: _this2.props.onPause },
                        React.createElement('div', { className: 'btn-pause btn-control' }),
                        React.createElement(
                            'div',
                            { className: 'description' },
                            lang.monitor.pause
                        )
                    );
                },

                stop: function stop(enable) {
                    className = ClassNames('controls left', { 'disabled': !enable });
                    return React.createElement(
                        'div',
                        { className: className, onClick: _this2.props.onStop },
                        React.createElement('div', { className: 'btn-stop btn-control' }),
                        React.createElement(
                            'div',
                            { className: 'description' },
                            lang.monitor.stop
                        )
                    );
                },

                upload: function upload(enable) {
                    className = ClassNames('controls left', { 'disabled': !enable });
                    return React.createElement(
                        'div',
                        { className: className, onClick: _this2.props.onUpload },
                        React.createElement('div', { className: 'btn-upload btn-control' }),
                        React.createElement('input', { className: 'upload-control', type: 'file', accept: '.fc, .gcode', onChange: _this2.props.onUpload }),
                        React.createElement(
                            'div',
                            { className: 'description' },
                            lang.monitor.upload
                        )
                    );
                },

                download: function download(enable) {
                    className = ClassNames('controls center', { 'disabled': !enable });
                    return React.createElement(
                        'div',
                        { className: className, onClick: _this2.props.onDownload },
                        React.createElement('div', { className: 'btn-download btn-control' }),
                        React.createElement(
                            'div',
                            { className: 'description' },
                            lang.monitor.download
                        )
                    );
                },

                camera: function camera(enable) {
                    className = ClassNames('controls right', { 'disabled': !enable });
                    return React.createElement(
                        'div',
                        { className: className, onClick: _this2.props.onToggleCamera },
                        React.createElement('div', { className: cameraClass }),
                        React.createElement(
                            'div',
                            { className: cameraDescriptionClass },
                            lang.monitor.camera
                        )
                    );
                },

                preparing: function preparing(enable) {
                    className = ClassNames('controls center', { 'disabled': true });
                    return React.createElement(
                        'div',
                        { className: className },
                        React.createElement('div', { className: 'btn-pause btn-control' }),
                        React.createElement(
                            'div',
                            { className: 'description' },
                            lang.monitor.pause
                        )
                    );
                }
            };
        },

        _isAbortedOrCompleted: function _isAbortedOrCompleted(statusId) {
            var _context$store$getSta2 = this.context.store.getState(),
                Device = _context$store$getSta2.Device;

            statusId = statusId || Device.status.st_id;
            return statusId === DeviceConstants.status.ABORTED || statusId === DeviceConstants.status.COMPLETED;
        },

        _getJobType: function _getJobType() {
            var lang = this.context.lang,
                jobInfo = void 0,
                o = void 0;
            var _context$store$getSta3 = this.context.store.getState(),
                Monitor = _context$store$getSta3.Monitor,
                Device = _context$store$getSta3.Device;

            jobInfo = Monitor.mode === GlobalConstants.FILE_PREVIEW ? Monitor.selectedFileInfo : Device.jobInfo;
            o = findObjectContainsProperty(jobInfo, 'HEAD_TYPE');

            // this should be updated when slicer returns the same info as play info
            if (jobInfo.length === 0 && this.props.previewUrl) {
                return lang.monitor.task['EXTRUDER'];
            }

            return o.length > 0 ? lang.monitor.task[o[0].HEAD_TYPE.toUpperCase()] : '';
        },

        _renderButtons: function _renderButtons() {
            var _this3 = this;

            var _context$store$getSta4 = this.context.store.getState(),
                Monitor = _context$store$getSta4.Monitor,
                Device = _context$store$getSta4.Device;

            var selectedItem = Monitor.selectedItem;

            var commands = void 0,
                action = void 0,
                statusId = void 0,
                currentStatus = void 0;
            var leftButtonOn = false,
                middleButtonOn = false,
                rightButtonOn = true;

            statusId = Device.status.st_id;
            currentStatus = Device.status.st_label;
            commands = {
                'IDLE': function IDLE() {
                    return _this3._operation().go;
                },
                'RUNNING': function RUNNING() {
                    return _this3._operation().pause;
                },
                'STARTING': function STARTING() {
                    return _this3._operation().preparing;
                },
                'INIT': function INIT() {
                    return _this3._operation().preparing;
                },
                'WAITING_HEAD': function WAITING_HEAD() {
                    return _this3._operation().preparing;
                },
                'CORRECTING': function CORRECTING() {
                    return _this3._operation().preparing;
                },
                'PAUSING': function PAUSING() {
                    return _this3._operation().go;
                },
                'PAUSED': function PAUSED() {
                    return _this3._operation().go;
                },
                'ABORTED': function ABORTED() {
                    return _this3._operation().go;
                },
                'HEATING': function HEATING() {
                    return _this3._operation().preparing;
                },
                'CALIBRATING': function CALIBRATING() {
                    return _this3._operation().preparing;
                },
                'RESUMING': function RESUMING() {
                    return _this3._operation().pause;
                },
                'COMPLETED': function COMPLETED() {
                    return _this3._operation().go;
                }
            };

            action = !!commands[currentStatus] ? commands[currentStatus]() : '';

            // CAMERA mode
            if (Monitor.mode === GlobalConstants.CAMERA) {
                if (statusId === DeviceConstants.status.MAINTAIN || this._getJobType() === '') {
                    middleButtonOn = false;
                } else {
                    middleButtonOn = true;
                }

                if (statusId === DeviceConstants.status.IDLE || statusId === DeviceConstants.status.COMPLETED || statusId === DeviceConstants.status.ABORTED) {
                    leftButtonOn = false;

                    if (this.props.source === 'DEVICE_LIST') {
                        middleButtonOn = false;
                    }
                } else {
                    leftButtonOn = true;
                }
            }

            // FILE mode
            else if (Monitor.mode === GlobalConstants.FILE) {
                    leftButtonOn = Monitor.currentPath !== '';
                    middleButtonOn = selectedItem.type === type.FILE;
                }

                // PRINT mode
                else if (Monitor.mode === GlobalConstants.PRINT) {
                        leftButtonOn = true;

                        if (currentStatus === DeviceConstants.IDLE || currentStatus === DeviceConstants.STARTING || currentStatus === DeviceConstants.RESUMING || statusId === DeviceConstants.status.PAUSING_FROM_RUNNING || statusId === DeviceConstants.status.MAINTAIN || statusId === DeviceConstants.status.SCAN || this._getJobType() === '' || this._isAbortedOrCompleted()) {
                            middleButtonOn = false;
                            leftButtonOn = false;
                        } else {
                            middleButtonOn = true;
                        }

                        if (this.props.source === GlobalConstants.DEVICE_LIST && statusId === DeviceConstants.status.IDLE) {
                            leftButtonOn = false;
                            middleButtonOn = false;
                        }

                        if (statusId === DeviceConstants.status.INIT) {
                            leftButtonOn = false;
                        }
                    }

                    // PREVIEW mode
                    else if (Monitor.mode === GlobalConstants.PREVIEW) {
                            middleButtonOn = true;
                            if (statusId === DeviceConstants.status.IDLE || statusId === DeviceConstants.status.COMPLETED || statusId === DeviceConstants.status.ABORTED) {
                                leftButtonOn = false;
                            }

                            if (statusId === DeviceConstants.status.MAINTAIN || statusId === DeviceConstants.status.SCAN || this._isAbortedOrCompleted(statusId)) {
                                middleButtonOn = false;
                            } else {
                                middleButtonOn = true;
                            }
                        }

                        // FILE PREVIEW mode
                        else if (Monitor.mode === GlobalConstants.FILE_PREVIEW) {
                                leftButtonOn = true;
                                middleButtonOn = true;

                                if (currentStatus === DeviceConstants.IDLE) {
                                    leftButtonOn = false;
                                }
                            }

            if (Object.keys(Device.status).length === 0) {
                leftButtonOn = false;
                middleButtonOn = false;
            }

            var leftButton = Monitor.mode === GlobalConstants.FILE ? this._operation().upload : this._operation().stop,
                middleButton = Monitor.mode === GlobalConstants.FILE ? this._operation().download : action,
                rightButton = this._operation().camera;

            if (leftButton !== '') {
                leftButton = leftButton(leftButtonOn);
            }

            if (middleButton !== '') {
                middleButton = middleButton(middleButtonOn);
            }

            if (rightButton !== '') {
                rightButton = rightButton(rightButtonOn);
            }

            return {
                leftButton: leftButton,
                middleButton: middleButton,
                rightButton: rightButton
            };
        },

        render: function render() {
            var _renderButtons2 = this._renderButtons(),
                leftButton = _renderButtons2.leftButton,
                middleButton = _renderButtons2.middleButton,
                rightButton = _renderButtons2.rightButton;

            return React.createElement(
                'div',
                { className: 'operation' },
                leftButton,
                middleButton,
                rightButton
            );
        }

    });
});