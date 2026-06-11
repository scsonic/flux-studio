'use strict';

define(['jquery', 'react', 'reactDOM', 'reactPropTypes', 'app/actions/beambox/beambox-preference', 'app/actions/beambox/svgeditor-function-wrapper', 'app/constants/right-panel-constants', 'app/stores/beambox-store', 'jsx!widgets/Unit-Input-v2', 'jsx!widgets/Button-Group', 'jsx!widgets/Dropdown-Control', 'jsx!widgets/List', 'jsx!widgets/Modal', 'helpers/local-storage', 'helpers/i18n', 'plugins/classnames/index'], function ($, React, ReactDOM, PropTypes, BeamboxPreference, FnWrapper, RightPanelConstants, BeamboxStore, UnitInput, ButtonGroup, DropdwonControl, List, Modal, LocalStorage, i18n, ClassNames) {
    'use strict';

    var LANG = i18n.lang.beambox.right_panel.laser_panel;
    var defaultLaserOptions = ['parameters', 'wood_3mm_cutting', 'wood_5mm_cutting', 'wood_bw_engraving', 'wood_shading_engraving', 'acrylic_3mm_cutting', 'acrylic_5mm_cutting', 'acrylic_bw_engraving', 'acrylic_shading_engraving', 'leather_3mm_cutting', 'leather_5mm_cutting', 'leather_bw_engraving', 'leather_shading_engraving', 'fabric_3mm_cutting', 'fabric_5mm_cutting', 'fabric_bw_engraving', 'fabric_shading_engraving'];

    var functionalLaserOptions = ['save', 'more'];

    return React.createClass({
        propTypes: {
            layerName: PropTypes.string.isRequired,
            speed: PropTypes.number.isRequired,
            strength: PropTypes.number.isRequired,
            repeat: PropTypes.number.isRequired,
            funcs: PropTypes.object.isRequired
        },

        getInitialState: function getInitialState() {
            return {
                speed: this.props.speed,
                strength: this.props.strength,
                repeat: this.props.repeat,
                original: defaultLaserOptions[0],
                modal: '',
                selectedItem: LocalStorage.get('customizedLaserConfigs')[0] ? LocalStorage.get('customizedLaserConfigs')[0].name : ''
            };
        },

        componentDidMount: function componentDidMount() {
            var _this = this;

            BeamboxStore.onUpdateLaserPanel(function () {
                return _this.updateData();
            });
        },
        componentWillUnmount: function componentWillUnmount() {
            var _this2 = this;

            BeamboxStore.removeUpdateLaserPanelListener(function () {
                return _this2.updateData();
            });
        },


        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            if (nextProps.configName != '') {
                if (defaultLaserOptions.indexOf(nextProps.configName) > 0 || LocalStorage.get('customizedLaserConfigs').findIndex(function (e) {
                    return e.name === nextProps.configName;
                }) > -1) {
                    document.getElementById('laser-config-dropdown').value = nextProps.configName;
                } else {
                    document.getElementById('laser-config-dropdown').value = defaultLaserOptions[0];
                }
            } else {
                document.getElementById('laser-config-dropdown').value = defaultLaserOptions[0];
            }

            this.setState({
                speed: nextProps.speed,
                strength: nextProps.strength,
                repeat: nextProps.repeat,
                original: defaultLaserOptions[0],
                modal: '',
                selectedItem: LocalStorage.get('customizedLaserConfigs')[0] ? LocalStorage.get('customizedLaserConfigs')[0].name : ''
            });
        },

        updateData: function updateData() {
            var layerData = FnWrapper.getCurrentLayerData();

            this.setState({
                speed: layerData.speed,
                strength: layerData.power,
                repeat: layerData.repeat
            });
        },

        _handleSpeedChange: function _handleSpeedChange(val) {
            this.setState({ speed: val });
            this.props.funcs.writeSpeed(this.props.layerName, val);
        },

        _handleStrengthChange: function _handleStrengthChange(val) {
            this.setState({ strength: val });
            this.props.funcs.writeStrength(this.props.layerName, val);
        },

        _handleRepeatChange: function _handleRepeatChange(val) {
            this.setState({ repeat: val });
            this.props.funcs.writeRepeat(this.props.layerName, val);
        },

        _handleSaveConfig: function _handleSaveConfig() {
            var name = document.getElementsByClassName('configName')[0].value;
            var customizedConfigs = LocalStorage.get('customizedLaserConfigs');

            if (!customizedConfigs || customizedConfigs.length < 1) {
                LocalStorage.set('customizedLaserConfigs', [{
                    name: name,
                    speed: this.state.speed,
                    power: this.state.strength,
                    repeat: this.state.repeat
                }]);

                this.setState({ selectedItem: name });
            } else {
                LocalStorage.set('customizedLaserConfigs', customizedConfigs.concat([{
                    name: name,
                    speed: this.state.speed,
                    power: this.state.strength,
                    repeat: this.state.repeat
                }]));
            }

            this.setState({ modal: '' });
            this.props.funcs.writeConfigName(this.props.layerName, name);
        },

        _handleDeleteConfig: function _handleDeleteConfig() {
            var _this3 = this;

            var customizedLaserConfigs = LocalStorage.get('customizedLaserConfigs');
            var index = customizedLaserConfigs.findIndex(function (e) {
                return e.name === _this3.state.selectedItem;
            });
            customizedLaserConfigs.splice(index, 1);

            LocalStorage.set('customizedLaserConfigs', customizedLaserConfigs);

            this.setState({ selectedItem: customizedLaserConfigs[0] ? customizedLaserConfigs[0].name : '' });
        },

        _handleCancelModal: function _handleCancelModal() {
            document.getElementById('laser-config-dropdown').value = this.state.original;
            this.setState({ modal: '' });
        },

        _handleApply: function _handleApply() {
            if (this.selectedItem != '') {
                document.getElementById('laser-config-dropdown').value = this.state.selectedItem;
            }
            this.setState({ modal: '' });
        },

        _handleParameterTypeChanged: function _handleParameterTypeChanged(id, value) {
            if (value === defaultLaserOptions[0]) {
                this.setState({ original: value });
                return;
            }
            if (defaultLaserOptions.indexOf(value) > -1) {
                var model = BeamboxPreference.read('model');
                switch (model) {
                    case 'fbm1':
                    case 'fbb1b':
                        this.setState({
                            original: value,
                            speed: RightPanelConstants.BEAMBOX[value].speed,
                            strength: RightPanelConstants.BEAMBOX[value].power,
                            repeat: 1
                        });

                        this.props.funcs.writeSpeed(this.props.layerName, RightPanelConstants.BEAMBOX[value].speed);
                        this.props.funcs.writeStrength(this.props.layerName, RightPanelConstants.BEAMBOX[value].power);
                        this.props.funcs.writeRepeat(this.props.layerName, 1);
                        this.props.funcs.writeConfigName(this.props.layerName, value);

                        break;
                    case 'fbb1p':
                        this.setState({
                            original: value,
                            speed: RightPanelConstants.BEAMBOX_PRO[value].speed,
                            strength: RightPanelConstants.BEAMBOX_PRO[value].power,
                            repeat: 1
                        });

                        this.props.funcs.writeSpeed(this.props.layerName, RightPanelConstants.BEAMBOX_PRO[value].speed);
                        this.props.funcs.writeStrength(this.props.layerName, RightPanelConstants.BEAMBOX_PRO[value].power);
                        this.props.funcs.writeRepeat(this.props.layerName, 1);
                        this.props.funcs.writeConfigName(this.props.layerName, value);

                        break;
                    default:
                        console.error('wrong machine', model);
                }
            } else if (value === 'save') {
                this.setState({ modal: 'save' });
            } else if (value === 'more') {
                this.setState({ modal: 'more' });
            } else {
                var customizedConfigs = LocalStorage.get('customizedLaserConfigs').find(function (e) {
                    return e.name === value;
                });
                var speed = customizedConfigs.speed,
                    power = customizedConfigs.power,
                    repeat = customizedConfigs.repeat;


                if (customizedConfigs) {
                    this.setState({
                        speed: speed,
                        strength: power,
                        repeat: repeat
                    });

                    this.props.funcs.writeSpeed(this.props.layerName, speed);
                    this.props.funcs.writeStrength(this.props.layerName, power);
                    this.props.funcs.writeRepeat(this.props.layerName, repeat);
                    this.props.funcs.writeConfigName(this.props.layerName, value);
                } else {
                    console.error('No such value', value);
                }
            }
        },

        _renderStrength: function _renderStrength() {
            return React.createElement(
                'div',
                { className: 'panel' },
                React.createElement(
                    'span',
                    { className: 'title' },
                    LANG.strength
                ),
                React.createElement(UnitInput, {
                    min: 1,
                    max: 100,
                    unit: '%',
                    defaultValue: this.state.strength,
                    getValue: this._handleStrengthChange,
                    decimal: 1
                })
            );
        },
        _renderSpeed: function _renderSpeed() {
            return React.createElement(
                'div',
                { className: 'panel' },
                React.createElement(
                    'span',
                    { className: 'title' },
                    LANG.speed
                ),
                React.createElement(UnitInput, {
                    min: 3,
                    max: 300,
                    unit: 'mm/s',
                    defaultValue: this.state.speed,
                    getValue: this._handleSpeedChange,
                    decimal: 1
                })
            );
        },

        _renderRepeat: function _renderRepeat() {
            return React.createElement(
                'div',
                { className: 'panel' },
                React.createElement(
                    'span',
                    { className: 'title' },
                    LANG.repeat
                ),
                React.createElement(UnitInput, {
                    min: 0,
                    max: 100,
                    unit: LANG.times,
                    defaultValue: this.state.repeat,
                    getValue: this._handleRepeatChange,
                    decimal: 0
                })
            );
        },

        _renderSaveModal: function _renderSaveModal() {
            var _this4 = this;

            return React.createElement(
                Modal,
                null,
                React.createElement(
                    'div',
                    { className: 'save-config-panel' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        LANG.dropdown.save
                    ),
                    React.createElement(
                        'div',
                        { className: 'name' },
                        React.createElement(
                            'span',
                            null,
                            LANG.name
                        ),
                        React.createElement('input', { className: 'configName', type: 'text' })
                    ),
                    React.createElement(
                        'div',
                        { className: 'footer' },
                        React.createElement(
                            'button',
                            {
                                className: 'btn btn-default',
                                onClick: function onClick() {
                                    return _this4._handleCancelModal();
                                }
                            },
                            LANG.cancel
                        ),
                        React.createElement(
                            'button',
                            {
                                className: 'btn btn-default pull-right',
                                onClick: function onClick() {
                                    return _this4._handleSaveConfig();
                                }
                            },
                            LANG.save
                        )
                    )
                )
            );
        },

        _renderMoreModal: function _renderMoreModal() {
            var _this5 = this;

            var customizedLaserConfigs = LocalStorage.get('customizedLaserConfigs');
            var selectedConfig = customizedLaserConfigs.find(function (e) {
                return e.name === _this5.state.selectedItem;
            });
            var entries = void 0,
                entryClass = void 0;

            entries = customizedLaserConfigs.map(function (entry) {
                entryClass = ClassNames('config-entry', { 'selected': _this5.state.selectedItem === entry.name });
                return React.createElement(
                    'div',
                    { className: entryClass, onClick: function onClick() {
                            _this5.setState({ selectedItem: entry.name });
                        } },
                    React.createElement(
                        'span',
                        null,
                        entry.name
                    )
                );
            });

            return React.createElement(
                Modal,
                null,
                React.createElement(
                    'div',
                    { className: 'more-config-panel' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        LANG.more
                    ),
                    React.createElement(
                        'div',
                        { className: 'config-list' },
                        entries
                    ),
                    React.createElement(
                        'div',
                        { className: 'controls' },
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'span',
                                { className: 'label' },
                                LANG.laser_speed.text
                            ),
                            React.createElement('input', {
                                type: 'range',
                                ref: 'configSpeed',
                                min: LANG.laser_speed.min,
                                max: LANG.laser_speed.max,
                                step: LANG.laser_speed.step,
                                value: selectedConfig ? selectedConfig.speed : 0,
                                className: 'readonly',
                                onChange: function onChange() {}
                            }),
                            React.createElement(
                                'span',
                                { className: 'value-text', ref: 'presetSpeedDisplay', 'data-tail': ' ' + LANG.laser_speed.unit },
                                selectedConfig ? selectedConfig.speed : 0
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'span',
                                { className: 'label' },
                                LANG.power.text
                            ),
                            React.createElement('input', {
                                type: 'range',
                                ref: 'configPower',
                                min: LANG.power.min,
                                max: LANG.power.max,
                                step: LANG.power.step,
                                value: selectedConfig ? selectedConfig.power : 0,
                                className: 'readonly',
                                onChange: function onChange() {}
                            }),
                            React.createElement(
                                'span',
                                { className: 'value-text', ref: 'presetPowerDisplay', 'data-tail': ' %' },
                                selectedConfig ? selectedConfig.power : 0
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'footer' },
                        React.createElement(
                            'div',
                            { className: 'left' },
                            React.createElement(
                                'button',
                                {
                                    className: 'btn btn-default pull-right',
                                    onClick: function onClick() {
                                        return _this5._handleDeleteConfig();
                                    }
                                },
                                LANG.delete
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'right' },
                            React.createElement(
                                'button',
                                {
                                    className: 'btn btn-default',
                                    onClick: function onClick() {
                                        return _this5._handleCancelModal();
                                    }
                                },
                                LANG.cancel
                            ),
                            React.createElement(
                                'button',
                                {
                                    className: 'btn btn-default pull-right',
                                    onClick: function onClick() {
                                        return _this5._handleApply();
                                    }
                                },
                                LANG.apply
                            )
                        )
                    )
                )
            );
        },

        _renderModal: function _renderModal() {
            switch (this.state.modal) {
                case 'save':
                    return this._renderSaveModal();
                case 'more':
                    return this._renderMoreModal();
                default:
                    return null;
            }
        },

        render: function render() {
            var speedPanel = this._renderSpeed();
            var strengthPanel = this._renderStrength();
            var repeatPanel = this._renderRepeat();
            var modalDialog = this._renderModal();

            var defaultOptions = defaultLaserOptions.map(function (item) {
                return {
                    value: item,
                    key: item,
                    label: LANG.dropdown[item] ? LANG.dropdown[item] : item
                };
            });
            var functionalOptions = functionalLaserOptions.map(function (item) {
                return {
                    value: item,
                    key: item,
                    label: LANG.dropdown[item]
                };
            });
            var customizedConfigs = LocalStorage.get('customizedLaserConfigs');
            var customizedOptions = customizedConfigs || customizedConfigs.length > 0 ? customizedConfigs.map(function (e) {
                return {
                    value: e.name,
                    key: e.name,
                    label: e.name
                };
            }) : null;

            var dropdownOptions = customizedOptions ? defaultOptions.concat(customizedOptions).concat(functionalOptions) : defaultOptions.concat(functionalOptions);

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'layername' },
                    this.props.layerName
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement(DropdwonControl, {
                        id: 'laser-config-dropdown',
                        'default': defaultLaserOptions[0],
                        onChange: this._handleParameterTypeChanged,
                        options: dropdownOptions
                    }),
                    strengthPanel,
                    speedPanel,
                    repeatPanel,
                    modalDialog
                )
            );
        }

    });
});