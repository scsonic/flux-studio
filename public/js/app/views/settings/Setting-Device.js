'use strict';

define(['jquery', 'react', 'helpers/i18n', 'helpers/api/config', 'app/actions/alert-actions', 'helpers/device-master', 'jsx!widgets/Dropdown-Control', 'jsx!widgets/Radio-Control', 'jsx!widgets/Checkbox-Control', 'helpers/firmware-version-checker'], function ($, React, i18n, config, AlertActions, DeviceMaster, DropdownControl, RadioControl, CheckboxControl, FirmwareVersionChecker) {
    'use strict';

    var lang = i18n.lang;

    return React.createClass({
        getDefaultProps: function getDefaultProps() {
            return {
                lang: {},
                supported_langs: '',
                onLangChange: function onLangChange() {}
            };
        },

        getInitialState: function getInitialState() {
            return {
                config: {},
                showBacklash: false,
                postbackUrl: 'http://your-domain/flux-status-changed?st_id=%(st_id)i'
            };
        },

        componentWillMount: function componentWillMount() {
            this.devices = [];
        },

        componentDidMount: function componentDidMount() {
            var _this = this;

            this.t = setInterval(function () {
                var d = DeviceMaster.getAvailableDevices();

                if (_this.devices.length !== d.length) {
                    _this.devices = [];
                    _this.forceUpdate(function () {
                        _this.devices = d;
                        _this.setState({
                            config: {}
                        });
                    });
                }
            }, 3000);
        },

        componentWillUnmount: function componentWillUnmount() {
            clearTimeout(this.t);
        },

        _handleDeviceChange: function _handleDeviceChange(dropdownId, deviceName, selectedIndex) {
            var _this2 = this;

            if (selectedIndex === 0) {
                this.setState({ config: {} });
                return;
            }

            var usingUSB = deviceName.indexOf('(USB)') !== -1;
            var device = DeviceMaster.getAvailableDevices().filter(function (d) {
                var a = d.name === deviceName.replace(' (USB)', '');
                if (usingUSB) {
                    a = a && d.source === 'h2h';
                };
                return a;
            })[0];

            this.setState({ device: device }, function () {
                if (['fbm1', 'mozu1', 'fbb1b', 'fbb1p', 'laser-b1', 'darwin-dev'].includes(device.model)) {} else {
                    _this2._getDeviceConfig();
                }
            });
        },

        _handleComponentValueChange: function _handleComponentValueChange(id, value, source) {
            var config = Object.assign({}, this.state.config);

            if (id === 'head_error_level') {
                var v = 'delete';
                if (source === 'delete') {
                    value = ['delete'];
                } else if (source === 'N') {
                    value = ['N'];
                    v = 0;
                } else {
                    var i = value.indexOf('delete');
                    if (i !== -1) {
                        value = value.slice(0, i).concat(value.slice(i + 1));
                    }

                    i = value.indexOf('N');
                    if (i !== -1) {
                        value = value.slice(0, i).concat(value.slice(i + 1));
                    }

                    var types = ['LASER_DOWN', 'FAN_FAILURE', 'TILT', 'SHAKE'];
                    var configInBinary = types.map(function (o) {
                        return value.indexOf(o) !== -1 ? '1' : '0';
                    }).join('');
                    configInBinary = configInBinary + '0000';
                    v = parseInt(configInBinary, 2);
                }

                DeviceMaster.setDeviceSetting(id, v);
            } else {
                DeviceMaster.setDeviceSetting(id, value);
            }

            config[id] = value;
            this.setState({ config: config });
        },

        _updateBacklash: function _updateBacklash(e) {
            if (e.type === 'blur') {
                var v = parseFloat(e.target.value);
                if (v > 0.2) {
                    v = 0.2;
                }
                this.setState({ backlash: v });
                v = v * 80; // 80 is the offset value for backend
                DeviceMaster.setDeviceSetting('backlash', '"A:' + v + ' B:' + v + ' C:' + v + '"');
            } else {
                this.setState({ backlash: e.target.value });
            }
        },

        _updateMachineRadius: function _updateMachineRadius(e) {
            if (e.type === 'blur') {
                var v = parseFloat(e.target.value);

                if (v > 99.7) {
                    v = 99.7;
                }
                if (v < 93.7) {
                    v = 93.7;
                }

                this.setState({ machine_radius: v });
                DeviceMaster.setDeviceSetting('leveling', 'R:' + v);
            } else {
                this.setState({ machine_radius: e.target.value });
            }
        },

        _updatePostBackUrl: function _updatePostBackUrl(e) {
            var url = e.target.value || this.getInitialState().postbackUrl;
            this.setState({ postbackUrl: url });
            if (e.type === 'blur') {
                DeviceMaster.setDeviceSetting('player_postback_url', url);
            }
        },

        _getDeviceList: function _getDeviceList() {
            var nameList = void 0;

            nameList = this.devices.map(function (d) {
                return d.source === 'h2h' ? d.name + ' (USB)' : d.name;
            });

            if (nameList.length === 0) {
                return React.createElement(
                    'div',
                    { style: {
                            'margin-top': '20px',
                            'color': '#333'
                        } },
                    lang.device.please_wait
                );
            }

            nameList.unshift(lang.device.select);

            return React.createElement(DropdownControl, {
                id: 'device-list',
                label: lang.device.deviceList,
                onChange: this._handleDeviceChange,
                options: nameList });
        },

        _getDeviceConfig: function _getDeviceConfig() {
            var _this3 = this;

            var types = ['LASER_DOWN', 'FAN_FAILURE', 'TILT', 'SHAKE'];
            var pad = function pad(num, size) {
                var s = num + '';
                while (s.length < size) {
                    s = '0' + s;
                }
                return s;
            };
            var mapNumberToTypeArray = function mapNumberToTypeArray(num) {
                if (num === 0) {
                    return ['N'];
                }
                var t = [],
                    configs = void 0;

                configs = pad(num.toString(2), 8).slice(0, 4).split('');
                for (var i = 0; i < types.length; i++) {
                    if (configs[i] !== '0') {
                        t.push(types[i]);
                    }
                }

                return t;
            };

            var device = this.state.device;

            FirmwareVersionChecker.check(device, 'UPGRADE_KIT_PROFILE_SETTING').then(function (allowUpgradeKit) {
                allowUpgradeKit = allowUpgradeKit && device.model === 'delta-1';
                _this3.setState({ allowUpgradeKit: allowUpgradeKit });
                _this3.allowUpgradeKit = allowUpgradeKit;
                return FirmwareVersionChecker.check(device, 'BACKLASH');
            }).then(function (allowBacklash) {
                _this3.setState({ showBacklash: allowBacklash });
                _this3.allowBacklash = allowBacklash;
                return FirmwareVersionChecker.check(device, 'M666R_MMTEST');
            }).then(function (allowM666R_MMTest) {
                _this3.setState({ allowM666R_MMTest: allowM666R_MMTest });
                _this3.allowM666R_MMTest = allowM666R_MMTest;
                DeviceMaster.getDeviceSettings(_this3.allowBacklash, _this3.allowUpgradeKit, _this3.allowM666R_MMTest).then(function (config) {
                    config.head_error_level = config.head_error_level ? mapNumberToTypeArray(parseInt(config.head_error_level)) : null;
                    _this3.setState({ config: config });

                    if (config['backlash']) {
                        var _value = _this3.state.config['backlash'];
                        _value = _value.split(' ')[0].split(':')[1];
                        _this3.setState({ backlash: parseFloat(_value) / 80 });
                    }

                    if (config['leveling']) {
                        var _value2 = _this3.state.config['leveling'].split(' '),
                            leveling = {};
                        _value2.map(function (v) {
                            return v.split(':');
                        }).map(function (v) {
                            leveling[v[0]] = v[1];
                        });
                        _this3.setState({ machine_radius: parseFloat(leveling['R']) });
                        console.log('leveling', leveling);
                    }
                });
            });
        },

        _renderCorrectionSetting: function _renderCorrectionSetting() {
            var options = void 0,
                content = void 0;

            options = [{ id: 'A', name: lang.device.calibration.A }, { id: 'H', name: lang.device.calibration.H }, { id: 'N', name: lang.device.calibration.N }, { id: 'delete', name: lang.device.calibration.byFile }];

            content = React.createElement(
                'div',
                { className: 'controls' },
                React.createElement(
                    'div',
                    { className: 'label' },
                    lang.device.calibration.title
                ),
                React.createElement(RadioControl, {
                    id: 'correction',
                    options: options,
                    'default': this.state.config['correction'] || 'delete',
                    onChange: this._handleComponentValueChange
                })
            );

            return Object.keys(this.state.config).length > 0 ? content : '';
        },

        _renderDetectFilamentSetting: function _renderDetectFilamentSetting() {
            var options = void 0,
                content = void 0;

            options = [{ id: 'Y', name: lang.device.detectFilament.on }, { id: 'N', name: lang.device.detectFilament.off }, { id: 'delete', name: lang.device.detectFilament.byFile }];

            content = React.createElement(
                'div',
                { className: 'controls' },
                React.createElement(
                    'div',
                    { className: 'label' },
                    lang.device.detectFilament.title
                ),
                React.createElement(RadioControl, {
                    id: 'filament_detect',
                    options: options,
                    'default': this.state.config['filament_detect'] || 'delete',
                    onChange: this._handleComponentValueChange
                })
            );

            return Object.keys(this.state.config).length > 0 ? content : '';
        },

        _renderFilterHeadErrorSetting: function _renderFilterHeadErrorSetting() {
            var options = void 0,
                content = void 0;

            options = [{ id: 'LASER_DOWN', name: lang.device.filterHeadError.laser_down }, { id: 'FAN_FAILURE', name: lang.device.filterHeadError.fan_failure }, { id: 'TILT', name: lang.device.filterHeadError.tilt }, { id: 'SHAKE', name: lang.device.filterHeadError.shake }, { id: 'N', name: lang.device.filterHeadError.no }, { id: 'delete', name: lang.device.filterHeadError.byFile }];

            content = React.createElement(
                'div',
                { className: 'controls' },
                React.createElement(
                    'div',
                    { className: 'label' },
                    lang.device.filterHeadError.title
                ),
                React.createElement(CheckboxControl, {
                    id: 'head_error_level',
                    options: options,
                    'default': this.state.config['head_error_level'] || ['delete'],
                    onChange: this._handleComponentValueChange
                })
            );

            return Object.keys(this.state.config).length > 0 ? content : '';
        },

        _renderAutoResumeSetting: function _renderAutoResumeSetting() {
            var options = void 0,
                content = void 0;

            options = [{ id: 'Y', name: lang.device.autoresume.on }, { id: 'N', name: lang.device.autoresume.off }];

            content = React.createElement(
                'div',
                { className: 'controls' },
                React.createElement(
                    'div',
                    { className: 'label' },
                    lang.device.autoresume.title
                ),
                React.createElement(RadioControl, {
                    id: 'autoresume',
                    options: options,
                    'default': this.state.config['autoresume'] || 'N',
                    onChange: this._handleComponentValueChange
                })
            );

            return Object.keys(this.state.config).length > 0 ? content : '';
        },

        _renderBroadcast: function _renderBroadcast() {
            var options = void 0,
                content = void 0;

            options = [{ id: 'L', name: lang.device.broadcast.L }, { id: 'A', name: lang.device.broadcast.A }, { id: 'N', name: lang.device.broadcast.N }];

            content = React.createElement(
                'div',
                { className: 'controls' },
                React.createElement(
                    'div',
                    { className: 'label' },
                    lang.device.broadcast.title
                ),
                React.createElement(RadioControl, {
                    id: 'broadcast',
                    options: options,
                    'default': this.state.config['broadcast'] || 'L',
                    onChange: this._handleComponentValueChange
                })
            );

            return Object.keys(this.state.config).length > 0 ? content : '';
        },

        _renderEnableCloud: function _renderEnableCloud() {
            var options = void 0,
                content = void 0;

            options = [{ id: 'A', name: lang.device.enableCloud.A }, { id: 'N', name: lang.device.enableCloud.N }];

            content = React.createElement(
                'div',
                { className: 'controls' },
                React.createElement(
                    'div',
                    { className: 'label' },
                    lang.device.enableCloud.title
                ),
                React.createElement(RadioControl, {
                    id: 'enable_cloud',
                    options: options,
                    'default': this.state.config['enable_cloud'] || 'N',
                    onChange: this._handleComponentValueChange
                })
            );

            return Object.keys(this.state.config).length > 0 ? content : '';
        },

        _renderBackLash: function _renderBackLash() {
            var content = void 0;

            content = React.createElement(
                'div',
                { className: 'controls' },
                React.createElement(
                    'div',
                    { className: 'label' },
                    lang.device.backlash
                ),
                React.createElement('input', {
                    id: 'backlash',
                    value: this.state.backlash,
                    onChange: this._updateBacklash,
                    onBlur: this._updateBacklash
                }),
                React.createElement(
                    'label',
                    null,
                    'mm'
                )
            );

            return this.state.showBacklash && Object.keys(this.state.config).length > 0 ? content : '';
        },

        _renderCamera: function _renderCamera() {
            if (this.state.allowUpgradeKit) {
                var options = void 0,
                    content = void 0;

                options = [{ id: '0', name: lang.device.disable }, { id: '1', name: lang.device.enable }];

                content = React.createElement(
                    'div',
                    { className: 'controls' },
                    React.createElement(
                        'div',
                        { className: 'label' },
                        lang.device.plus_camera
                    ),
                    React.createElement(RadioControl, {
                        id: 'camera_version',
                        options: options,
                        'default': this.state.config['camera_version'] || '0',
                        onChange: this._handleComponentValueChange
                    })
                );

                return Object.keys(this.state.config).length > 0 ? content : '';
            } else {
                return React.createElement('div', null);
            }
        },

        _renderPlusExtrusion: function _renderPlusExtrusion() {
            if (this.state.allowUpgradeKit) {
                var options = void 0,
                    content = void 0;

                options = [{ id: 'N', name: lang.device.disable }, { id: 'Y', name: lang.device.enable }];

                content = React.createElement(
                    'div',
                    { className: 'controls' },
                    React.createElement(
                        'div',
                        { className: 'label' },
                        lang.device.plus_extrusion
                    ),
                    React.createElement(RadioControl, {
                        id: 'plus_extrusion',
                        options: options,
                        'default': this.state.config['plus_extrusion'] || 'N',
                        onChange: this._handleComponentValueChange
                    })
                );

                return Object.keys(this.state.config).length > 0 ? content : '';
            } else {
                return React.createElement('div', null);
            }
        },

        _renderPlayerPostBack: function _renderPlayerPostBack() {
            if (this.state.allowUpgradeKit) {
                var content = React.createElement(
                    'div',
                    { className: 'controls' },
                    React.createElement(
                        'div',
                        { className: 'label' },
                        lang.device.postback_url
                    ),
                    React.createElement('input', {
                        className: 'url',
                        id: 'player_postback_url',
                        value: this.state.postbackUrl,
                        onChange: this._updatePostBackUrl,
                        onBlur: this._updatePostBackUrl
                    })
                );

                return Object.keys(this.state.config).length > 0 ? content : '';
            } else {
                return React.createElement('div', null);
            }
        },

        _renderMovementTest: function _renderMovementTest() {
            if (this.state.allowM666R_MMTest) {
                var options = void 0,
                    content = void 0;

                options = [{ id: 'N', name: lang.device.disable }, { id: 'Y', name: lang.device.enable }];

                content = React.createElement(
                    'div',
                    { className: 'controls' },
                    React.createElement(
                        'div',
                        { className: 'label' },
                        lang.device.movement_test
                    ),
                    React.createElement(RadioControl, {
                        id: 'movement_test',
                        options: options,
                        'default': this.state.config['movement_test'] || 'Y',
                        onChange: this._handleComponentValueChange
                    })
                );

                return Object.keys(this.state.config).length > 0 ? content : '';
            } else {
                return React.createElement('div', null);
            }
        },

        _renderMachineRadius: function _renderMachineRadius() {
            var content = React.createElement(
                'div',
                { className: 'controls' },
                React.createElement(
                    'div',
                    { className: 'label' },
                    lang.device.machine_radius
                ),
                React.createElement('input', {
                    id: 'machine_radius',
                    value: this.state.machine_radius,
                    onChange: this._updateMachineRadius,
                    onBlur: this._updateMachineRadius
                }),
                React.createElement(
                    'label',
                    null,
                    'mm'
                )
            );

            return this.state.allowM666R_MMTest && Object.keys(this.state.config).length > 0 ? content : '';
        },

        render: function render() {
            var isBeamoxSeries = this.state.device && ['fbb1b', 'fbb1p', 'laser-b1', 'darwin-dev'].includes(this.state.device.model);
            var deviceList = this._getDeviceList(),
                correction = this._renderCorrectionSetting(),
                detectFilament = this._renderDetectFilamentSetting(),
                filterHeadError = this._renderFilterHeadErrorSetting(),
                autoResume = this._renderAutoResumeSetting(),
                broadcast = this._renderBroadcast(),
                cloud = this._renderEnableCloud(),
                backlash = this._renderBackLash(),
                camera = this._renderCamera(),
                plusExtrusion = this._renderPlusExtrusion(),
                playerPostBack = this._renderPlayerPostBack(),
                movementTest = this._renderMovementTest(),
                machineRadius = this._renderMachineRadius();
            var deltaPanel = React.createElement(
                'div',
                null,
                correction,
                detectFilament,
                filterHeadError,
                autoResume,
                broadcast,
                cloud,
                backlash,
                camera,
                plusExtrusion,
                playerPostBack,
                movementTest,
                machineRadius
            );
            var beamboxPanel = React.createElement(
                'div',
                { style: {
                        'margin-top': '20px',
                        'color': '#333'
                    } },
                lang.device.beambox_should_use_touch_panel_to_adjust
            );
            return React.createElement(
                'div',
                { className: 'form general' },
                deviceList,
                this.state.device ? isBeamoxSeries ? beamboxPanel : deltaPanel : ''
            );
        }

    });
});