'use strict';

define(['jquery', 'react', 'helpers/i18n', 'helpers/device-master', 'helpers/device-list', 'helpers/pad-string', 'plugins/classnames/index', 'helpers/api/cloud', 'app/actions/alert-actions', 'helpers/firmware-version-checker'], function ($, React, i18n, DeviceMaster, DeviceList, PadString, ClassNames, CloudApi, AlertActions, FirmwareVersionChecker) {
    return React.createClass({

        lang: {},

        getInitialState: function getInitialState() {
            return {
                selectedDevice: {},
                bindingInProgress: false,
                me: {}
            };
        },

        componentWillMount: function componentWillMount() {
            this.lang = i18n.get();
        },

        componentDidMount: function componentDidMount() {
            var _this = this;

            var getList = function getList() {
                var deviceList = DeviceList(DeviceMaster.getDeviceList());
                _this.setState({ deviceList: deviceList });
            };

            getList();

            setInterval(function () {
                getList();
            }, 2000);

            CloudApi.getMe().then(function (response) {
                if (response.ok) {
                    response.json().then(function (content) {
                        _this.setState({ me: content });
                        if (content.needPasswordReset) {
                            location.hash = '#/studio/cloud/change-password';
                        }
                    });
                }
            });
        },

        _handleSignout: async function _handleSignout() {
            await CloudApi.signOut();
            location.hash = '#studio/cloud/sign-in';
        },

        _handleSelectDevice: async function _handleSelectDevice(device) {
            var allowCloud = await FirmwareVersionChecker.check(device, 'CLOUD');
            if (allowCloud) {
                this.setState({
                    meetVersionRequirement: allowCloud,
                    selectedDevice: device
                });
            } else {
                var lang = this.props.lang.settings.flux_cloud;

                AlertActions.showPopupError('error-vcredist', lang.not_supported_firmware);
            }
        },

        _handleCancel: function _handleCancel() {
            location.hash = '#/studio/print';
        },

        _handleCancelBinding: function _handleCancelBinding() {
            this.setState({ bindingInProgress: false });
        },

        _handleBind: async function _handleBind() {
            var _this2 = this;

            this.setState({ bindingInProgress: true });
            var status = await DeviceMaster.selectDevice(this.state.selectedDevice);
            if (status === 'TIMEOUT') {
                location.hash = '#/studio/cloud/bind-fail';
            } else {
                var waitForDevice = function waitForDevice(deferred) {
                    deferred = deferred || $.Deferred();

                    DeviceMaster.getDeviceInfo().then(function (response) {
                        var result = response.cloud[1].join('_');

                        if (response.cloud[0] === false && result === 'DISABLE') {
                            setTimeout(function () {
                                waitForDevice(deferred);
                            }, 2 * 1000);
                        } else {
                            var error = response.cloud[1];
                            error.unshift('CLOUD');
                            _this2.props.onError(error);
                        }
                    });

                    return deferred.promise();
                };

                var response = await DeviceMaster.getDeviceInfo();
                var tried = 0;

                var bindDevice = async function bindDevice(uuid, token, accessId, signature) {
                    var r = await CloudApi.bindDevice(uuid, token, accessId, signature);
                    if (r.ok) {
                        _this2.setState({ bindingInProgress: false });
                        location.hash = '#/studio/cloud/bind-success';
                    } else {
                        if (tried > 2) {
                            location.hash = '#/studio/cloud/bind-fail';
                        } else {
                            tried++;
                            // try another time
                            setTimeout(function () {
                                bindDevice(uuid, token, accessId, signature);
                            }, 2 * 1000);
                        }
                    }
                };

                var processEnableCloudResult = function processEnableCloudResult(cloudResult) {
                    if (typeof cloudResult === 'undefined') {
                        return;
                    }

                    if (cloudResult.status === 'ok') {
                        waitForDevice().then(function () {
                            getCloudValidationCodeAndBind();
                        }).fail(function (error) {
                            _this2.props.onError(error);
                        });
                    } else {
                        location.hash = '#/studio/cloud/bind-fail';
                    }
                };

                var getCloudValidationCodeAndBind = async function getCloudValidationCodeAndBind(uuid) {
                    var r = await DeviceMaster.getCloudValidationCode();
                    console.log('Got cloud validation code', r);
                    var _r$code = r.code,
                        token = _r$code.token,
                        signature = _r$code.signature,
                        accessId = r.code.access_id;


                    signature = encodeURIComponent(signature);
                    bindDevice(uuid, token, accessId, signature);
                };

                if (response.cloud[0] === true) {
                    getCloudValidationCodeAndBind(response.uuid);
                } else {
                    if (response.cloud[1].join('') === 'DISABLE') {
                        var resp = await DeviceMaster.enableCloud();
                        await processEnableCloudResult(resp);
                    } else {
                        var error = response.cloud[1];
                        error.unshift('CLOUD');
                        this.props.onError(error);
                    }
                }
            }
        },

        _handleUnbind: function _handleUnbind(uuid) {
            var _this3 = this;

            var lang = this.props.lang.settings.flux_cloud;
            console.log('unbind', uuid);

            var removeDevice = function removeDevice() {
                var me = _this3.state.me;
                delete me.devices[uuid];
                _this3.setState({ me: me });
            };

            if (confirm(lang.unbind_device)) {
                CloudApi.unbindDevice(uuid).then(function (r) {
                    if (r.ok) {
                        removeDevice(uuid);
                    }
                });
            }
        },

        _renderBindingWindow: function _renderBindingWindow() {
            var lang = this.props.lang.settings.flux_cloud,
                bindingWindow = void 0;

            bindingWindow = React.createElement(
                'div',
                { className: 'binding-window' },
                React.createElement(
                    'h1',
                    null,
                    lang.binding
                ),
                React.createElement('div', { className: 'spinner-roller absolute-center' }),
                React.createElement(
                    'div',
                    { className: 'footer' },
                    React.createElement(
                        'a',
                        { onClick: this._handleCancelBinding },
                        lang.cancel
                    )
                )
            );

            return this.state.bindingInProgress ? bindingWindow : '';
        },

        _renderBlind: function _renderBlind() {
            var blind = React.createElement('div', { className: 'blind' });

            return this.state.bindingInProgress ? blind : '';
        },

        render: function render() {
            var _this4 = this;

            var lang = this.props.lang.settings.flux_cloud,
                deviceList = void 0,
                bindingWindow = void 0,
                blind = void 0;

            bindingWindow = this._renderBindingWindow();
            blind = this._renderBlind();

            if (!this.state.deviceList) {
                deviceList = React.createElement(
                    'div',
                    null,
                    this.lang.device.please_wait
                );
            } else {
                deviceList = this.state.deviceList.map(function (d) {
                    var me = _this4.state.me,
                        uuid = d.source === 'h2h' ? d.h2h_uuid : d.uuid,
                        rowClass = void 0,
                        linkedClass = void 0;


                    var isLinked = function isLinked() {
                        return Object.keys(me.devices || {}).indexOf(uuid) !== -1;
                    };

                    rowClass = ClassNames('device', { 'selected': _this4.state.selectedDevice.name === d.name });

                    linkedClass = ClassNames({
                        'linked': isLinked()
                    });

                    return React.createElement(
                        'div',
                        { className: rowClass, onClick: function onClick() {
                                return _this4._handleSelectDevice(d);
                            } },
                        React.createElement(
                            'div',
                            { className: 'name' },
                            d.name
                        ),
                        React.createElement(
                            'div',
                            { className: 'status' },
                            _this4.lang.machine_status[d.st_id]
                        ),
                        React.createElement('div', { className: linkedClass, onClick: _this4._handleUnbind.bind(null, uuid) })
                    );
                });
            }

            return React.createElement(
                'div',
                { className: 'cloud' },
                React.createElement(
                    'div',
                    { className: 'container bind-machine' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        React.createElement(
                            'h3',
                            null,
                            lang.select_to_bind
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'controls' },
                        React.createElement(
                            'div',
                            { className: 'select' },
                            deviceList
                        ),
                        React.createElement(
                            'div',
                            { className: 'user-info' },
                            React.createElement(
                                'div',
                                { className: 'name' },
                                this.state.me.nickname
                            ),
                            React.createElement(
                                'div',
                                { className: 'email' },
                                this.state.me.email
                            ),
                            React.createElement(
                                'div',
                                { className: 'change-password-link' },
                                React.createElement(
                                    'a',
                                    { href: '#/studio/cloud/change-password' },
                                    lang.change_password
                                ),
                                ' / ',
                                React.createElement(
                                    'a',
                                    { href: '#/studio/cloud/bind-machine', onClick: this._handleSignout },
                                    lang.sign_out
                                )
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'footer' },
                    React.createElement(
                        'div',
                        { className: 'divider' },
                        React.createElement('hr', null)
                    ),
                    React.createElement(
                        'div',
                        { className: 'actions' },
                        React.createElement(
                            'button',
                            { className: 'btn btn-cancel', onClick: this._handleCancel },
                            lang.back
                        ),
                        React.createElement(
                            'button',
                            { className: 'btn btn-default', disabled: !this.state.meetVersionRequirement, onClick: this._handleBind },
                            lang.bind
                        )
                    )
                ),
                bindingWindow,
                blind
            );
        }

    });
});