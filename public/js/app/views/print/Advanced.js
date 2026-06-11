'use strict';

define(['jquery', 'react', 'reactDOM', 'reactPropTypes', 'jsx!widgets/Slider-Control', 'jsx!widgets/Dropdown-Control', 'jsx!widgets/Switch-Control', 'jsx!widgets/Radio-Control', 'jsx!widgets/Modal', 'app/actions/input-lightbox-actions', 'plugins/classnames/index', 'helpers/api/config', 'app/actions/alert-actions', 'app/default-print-settings', 'helpers/slicer-settings', 'helpers/object-assign'], function ($, React, ReactDOM, PropTypes, SliderControl, DropdownControl, SwitchControl, RadioControl, Modal, InputLightboxActions, ClassNames, Config, AlertActions, DefaultPrintSettings, SlicerSettings) {
    'use strict';

    var mode = {
        'setup': 1,
        'load': 2,
        'save': 3
    },
        tab = {
        'GENERAL': 1,
        'LAYERS': 2,
        'OFFSET': 3,
        'SUPPORT': 4,
        'SPEED': 5,
        'CUSTOM': 6
    },
        lang,
        currentKey,
        lastValidValue;

    var hiddenPresets = ['engine', 'custom', 'raft_on'],
        slic3rInfill,
        slic3rSupport,
        curaInfill,
        cura2Infill,
        curaSupport,
        cura2Support,
        configs = ['avoid_crossing_perimeters', 'bed_shape', 'bed_temperature', 'before_layer_gcode', 'bottom_solid_layers', 'bridge_acceleration', 'bridge_fan_speed', 'bridge_flow_ratio', 'bridge_speed', 'brim_width', 'complete_objects', 'cooling', 'default_acceleration', 'disable_fan_first_layers', 'dont_support_bridges', 'duplicate_distance', 'end_gcode', 'external_fill_pattern', 'external_perimeter_extrusion_width', 'external_perimeter_speed', 'external_perimeters_first', 'extra_perimeters', 'extruder_clearance_height', 'extruder_clearance_radius', 'extruder_offset', 'extrusion_axis', 'extrusion_multiplier', 'extrusion_width', 'fan_always_on', 'fan_below_layer_time', 'filament_colour', 'filament_diameter', 'fill_angle', 'fill_density', 'fill_pattern', 'first_layer_acceleration', 'first_layer_bed_temperature', 'first_layer_extrusion_width', 'first_layer_height', 'first_layer_speed', 'first_layer_temperature', 'gap_fill_speed', 'gcode_arcs', 'gcode_comments', 'gcode_flavor', 'infill_acceleration', 'infill_every_layers', 'infill_extruder', 'infill_extrusion_width', 'infill_first', 'infill_only_where_needed', 'infill_overlap', 'infill_speed', 'interface_shells', 'layer_gcode', 'layer_height', 'max_fan_speed', 'max_print_speed', 'max_volumetric_speed', 'min_fan_speed', 'min_print_speed', 'min_skirt_length', 'notes', 'nozzle_diameter', 'octoprint_apikey', 'octoprint_host', 'only_retract_when_crossing_perimeters', 'ooze_prevention', 'output_filename_format', 'overhangs', 'perimeter_acceleration', 'perimeter_extruder', 'perimeter_extrusion_width', 'perimeter_speed', 'perimeters', 'post_process', 'pressure_advance', 'raft', 'raft_layers', 'resolution', 'retract_before_travel', 'retract_layer_change', 'retract_length', 'retract_length_toolchange', 'retract_lift', 'retract_restart_extra', 'retract_restart_extra_toolchange', 'retract_speed', 'seam_position', 'skirt_distance', 'skirt_height', 'skirts', 'slowdown_below_layer_time', 'small_perimeter_speed', 'solid_infill_below_area', 'solid_infill_every_layers', 'solid_infill_extruder', 'solid_infill_extrusion_width', 'solid_infill_speed', 'spiral_vase', 'standby_temperature_delta', 'start_gcode', 'support_material', 'support_material_angle', 'support_material_contact_distance', 'support_material_enforce_layers', 'support_material_extruder', 'support_material_extrusion_width', 'support_material_interface_extruder', 'support_material_interface_layers', 'support_material_interface_spacing', 'support_material_interface_speed', 'support_material_pattern', 'support_material_spacing', 'support_material_speed', 'support_material_threshold', 'temperature', 'thin_walls', 'threads', 'toolchange_gcode', 'top_infill_extrusion_width', 'top_solid_infill_speed', 'top_solid_layers', 'travel_speed', 'use_firmware_retraction', 'use_relative_e_distances', 'use_volumetric_e', 'vibration_limit', 'wipe', 'xy_size_compensation', 'z_offset'],
        advancedSetting = new SlicerSettings('advanced');

    return React.createClass({

        propTypes: {
            lang: PropTypes.object,
            setting: PropTypes.object,
            onClose: PropTypes.func,
            onApply: PropTypes.func
        },

        getInitialState: function getInitialState() {
            return {
                mode: 1,
                selectedTab: 1,
                configStr: null,
                showBridgeSpeed: this.props.setting.engine !== 'cura2',

                // Presets
                selectedPreset: '',
                presets: {}
            };
        },

        componentWillMount: function componentWillMount() {
            lang = this.props.lang.print.advanced;
            cura2Infill = [{ label: lang.curaInfill.automatic, value: 'AUTOMATIC' }, { label: lang.curaInfill.grid, value: 'GRID' }, { label: lang.curaInfill.lines, value: 'LINES' }, { label: lang.curaInfill.concentric, value: 'CONCENTRIC' }, { label: lang.curaInfill.concentric_3d, value: 'CONCENTRIC_3D' }, { label: lang.curaInfill.cubic, value: 'CUBIC' }, { label: lang.curaInfill.cubicsubdiv, value: 'CUBICSUBDIV' }, { label: lang.curaInfill.tetrahedral, value: 'TETRAHEDRAL' }, { label: lang.curaInfill.triangles, value: 'TRIANGLES' }, { label: lang.curaInfill.zigzag, value: 'ZIGZAG' }];
            cura2Support = [{ label: lang.curaSupport.grid, value: 'GRID' }, { label: lang.curaSupport.lines, value: 'LINES' }, { label: lang.curaSupport.zigzag, value: 'ZIGZAG' }];
            advancedSetting.engine = this.props.setting.engine;
            advancedSetting.load(this.props.setting, true);

            this.setState({ configStr: advancedSetting.getConfigStr() });
        },

        _createState: function _createState(key, value) {
            var newState = {};
            newState[key] = value;
            return newState;
        },

        _validateValue: function _validateValue(e) {
            e.preventDefault();
            if (!this._isValidValue(currentKey, this.state[currentKey])) {
                this.setState(this._createState(currentKey, lastValidValue));
            }
        },

        _isValidValue: function _isValidValue(key, value) {
            var min = parseInt(ReactDOM.findDOMNode(this.refs[key]).min),
                max = parseInt(ReactDOM.findDOMNode(this.refs[key]).max);

            return min <= value && value <= max;
        },

        _getLineNumber: function _getLineNumber(array, key) {
            var entry,
                _key,
                lineNumber = -1;

            for (var i = 0; i < array.length; i++) {
                entry = array[i].split('=');
                _key = entry[0].replace(/ /g, '');
                if (key === _key) {
                    lineNumber = i;
                    break;
                }
            }

            return lineNumber;
        },

        _getPresets: function _getPresets(callback) {
            Config().read('preset-settings', {
                onFinished: function onFinished(response) {
                    callback(response);
                }
            });
        },

        _savePreset: function _savePreset(presetName, presets) {
            var self = this,
                p = presets === '' ? {} : presets;

            p[presetName] = advancedSetting.toString();

            Config().write('preset-settings', JSON.stringify(p), {
                onFinished: function onFinished() {
                    self._handleBackToSetting();
                },
                onError: function onError(error) {
                    // TODO: log error
                    console.log(error);
                }
            });
        },

        _listPresets: function _listPresets(presets) {
            if (presets.length === 0) {
                return;
            }

            this.setState({
                presets: presets,
                selectedPreset: Object.keys(presets)[0]
            });
        },

        _JSONToKeyValue: function _JSONToKeyValue(presetInJSON) {
            if (Object.keys(presetInJSON).length === 0) {
                return '';
            }
            var settings = [];

            Object.keys(presetInJSON).forEach(function (name) {
                if (hiddenPresets.indexOf(name) < 0) {
                    settings.push(name.replace(/,/g, '') + ' = ' + presetInJSON[name] + '\n');
                }
            });

            // remove last newline wow fast
            settings[settings.length - 1] = settings[settings.length - 1].replace(/\r?\n|\r/g, '');
            return settings.join('');
        },

        _processCustomInput: function _processCustomInput() {
            var c = this.state.configStr,
                i = c.indexOf('support_enable');

            advancedSetting.load(this.state.configStr);
        },

        _handleNavigate: function _handleNavigate(selectedTab, e) {
            e.preventDefault();
            if (this.state.selectedTab === tab.CUSTOM) {
                this._processCustomInput();
            }
            this.setState({
                selectedTab: selectedTab
            });
        },

        _handleParameterChange: function _handleParameterChange(key, e) {
            if (e.type === 'keyup') {
                if (e.keyCode !== 8) {
                    return;
                }
            }
            var value = e.target.value;
            if (e.target.type === 'checkbox') {
                value = e.target.checked;
            }
            this.setState(this._createState(key, value));
        },

        _handleSelectPreset: function _handleSelectPreset(name) {
            this.setState({ selectedPreset: name });
        },

        _handleListPreset: function _handleListPreset() {
            var self = this;
            this.setState({ mode: mode.load });
            this._getPresets(function (settings) {
                self._listPresets(settings);
            });
        },

        _handleBackToSetting: function _handleBackToSetting() {
            this.setState({ mode: mode.setup });
        },

        _handleOpenSaveAsPreset: function _handleOpenSaveAsPreset() {
            this.setState({ mode: mode.save });

            InputLightboxActions.open('save-print-preset', {
                caption: lang.saveAsPreset,
                inputHeader: lang.name,
                confirmText: lang.save,
                onSubmit: this._handleSavePreset,
                onClose: this._handleBackToSetting
            });
        },

        _handleSavePreset: function _handleSavePreset(presetName) {
            var self = this;
            this._getPresets(function (presets) {
                self._savePreset(presetName, presets);
            });
        },

        _handleControlValueChange: function _handleControlValueChange(id, value) {
            switch (id) {
                case 'skirts':
                    advancedSetting.set(id, value ? 2 : 0);
                    break;
                case 'support_material':
                    advancedSetting.set('support_enable', value ? 1 : 0, true);
                    break;
                default:
                    if (typeof value === 'boolean') value = value ? 1 : 0;
                    advancedSetting.set(id, value);
            }
            advancedSetting.update();
            this.setState({ configStr: advancedSetting.getConfigStr() });
        },

        _handleApplyPreset: function _handleApplyPreset() {
            var p = this.state.presets[this.state.selectedPreset];
            advancedSetting.load(JSON.parse(p));

            this.setState({ configStr: advancedSetting.getConfigStr() }, function () {
                this._handleBackToSetting();
            });
        },

        _handleApply: function _handleApply(showAdvancedSetting) {
            this._processCustomInput();

            var _settings = advancedSetting.deepClone();
            this.props.onApply(_settings);
            if (!showAdvancedSetting) {
                this.props.onClose();
            }
        },

        _handleDeletePreset: function _handleDeletePreset(e) {
            var self = this,
                presets = this.state.presets;

            delete presets[this.state.selectedPreset];

            self.setState({
                presets: presets,
                selectedPreset: Object.keys(presets)[0]
            });

            Config().write('preset-settings', JSON.stringify(presets));
        },

        _handleCloseAdvancedSetting: function _handleCloseAdvancedSetting(e) {
            e.preventDefault();
            this.props.onClose();
        },

        _handleLoadPreset: function _handleLoadPreset() {
            this.setState({
                configStr: DefaultPrintSettings.cura2
            });

            advancedSetting.load(DefaultPrintSettings.cura2);
        },

        _renderTabs: function _renderTabs() {
            var tabGeneral = ClassNames('tab tab-general', { selected: this.state.selectedTab === tab.GENERAL }),
                tabLayers = ClassNames('tab tab-layer', { selected: this.state.selectedTab === tab.LAYERS }),
                tabOffset = ClassNames('tab tab-infill', { selected: this.state.selectedTab === tab.OFFSET }),
                tabSupport = ClassNames('tab tab-support', { selected: this.state.selectedTab === tab.SUPPORT }),
                tabSpeed = ClassNames('tab tab-speed', { selected: this.state.selectedTab === tab.SPEED }),
                tabCustom = ClassNames('tab tab-custom', { selected: this.state.selectedTab === tab.CUSTOM });

            return React.createElement(
                'div',
                { className: 'tab-container' },
                React.createElement(
                    'ul',
                    { className: 'tab-list' },
                    React.createElement(
                        'li',
                        { className: tabGeneral, onClick: this._handleNavigate.bind(null, 1) },
                        React.createElement(
                            'a',
                            { href: '#' },
                            lang.general
                        )
                    ),
                    React.createElement(
                        'li',
                        { className: tabLayers, onClick: this._handleNavigate.bind(null, 2) },
                        React.createElement(
                            'a',
                            { href: '#' },
                            lang.layers
                        )
                    ),
                    React.createElement(
                        'li',
                        { className: tabSupport, onClick: this._handleNavigate.bind(null, 4) },
                        React.createElement(
                            'a',
                            { href: '#' },
                            lang.support
                        )
                    ),
                    React.createElement(
                        'li',
                        { className: tabSpeed, onClick: this._handleNavigate.bind(null, 5) },
                        React.createElement(
                            'a',
                            { href: '#' },
                            lang.speed
                        )
                    ),
                    React.createElement(
                        'li',
                        { className: tabOffset, onClick: this._handleNavigate.bind(null, 3) },
                        React.createElement(
                            'a',
                            { href: '#' },
                            lang.offset
                        )
                    ),
                    React.createElement(
                        'li',
                        { className: tabCustom, onClick: this._handleNavigate.bind(null, 6) },
                        React.createElement(
                            'a',
                            { href: '#' },
                            lang.custom
                        )
                    )
                )
            );
        },

        _renderGeneralSection: function _renderGeneralSection() {
            var options = [{
                id: 'MostUsed',
                name: "Most Used"
            }, {
                id: 'Expert',
                name: "Full Options"
            }];
            return React.createElement(
                'div',
                { className: 'content-wrapper' },
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        lang.temperature
                    ),
                    React.createElement(SliderControl, {
                        id: 'temperature',
                        key: 'temperature',
                        label: lang.printing,
                        min: 170,
                        max: 230,
                        step: 1,
                        unit: 'degree',
                        'default': advancedSetting.config.temperature,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'first_layer_temperature',
                        key: 'first_layer_temperature',
                        label: lang.firstLayerTemperature,
                        min: 180,
                        max: 230,
                        step: 1,
                        unit: 'degree',
                        'default': advancedSetting.config.first_layer_temperature,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SwitchControl, {
                        id: 'flexible_material',
                        name: 'flexible_material',
                        label: lang.flexibleMaterial,
                        'default': advancedSetting.config.flexible_material,
                        onChange: this._handleControlValueChange })
                ),
                React.createElement(
                    'div',
                    { className: 'content-wrapper' },
                    React.createElement(
                        'div',
                        { className: 'section' },
                        React.createElement(
                            'div',
                            { className: 'title' },
                            lang.infill
                        ),
                        React.createElement(SliderControl, {
                            id: 'fill_density',
                            key: 'fill_density',
                            label: lang.density,
                            min: 0,
                            max: 100,
                            step: 1,
                            unit: 'percent',
                            'default': advancedSetting.config.fill_density,
                            onChange: this._handleControlValueChange }),
                        React.createElement(DropdownControl, {
                            id: 'fill_pattern',
                            label: lang.pattern,
                            options: cura2Infill,
                            'default': advancedSetting.config.fill_pattern,
                            onChange: this._handleControlValueChange })
                    )
                )
            );
        },

        _renderLayersSection: function _renderLayersSection() {
            return React.createElement(
                'div',
                { className: 'content-wrapper' },
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        lang.layer_height_title
                    ),
                    React.createElement(SliderControl, {
                        id: 'layer_height',
                        key: 'layer_height',
                        label: lang.layer_height,
                        min: 0.05,
                        max: 0.3,
                        step: 0.025,
                        unit: 'mm',
                        'default': advancedSetting.config.layer_height,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'first_layer_height',
                        key: 'first_layer_height',
                        label: lang.firstLayerHeight,
                        min: 0.2,
                        max: 0.35,
                        step: 0.05,
                        unit: 'mm',
                        'default': advancedSetting.config.first_layer_height,
                        onChange: this._handleControlValueChange })
                ),
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        lang.shell
                    ),
                    React.createElement(SliderControl, {
                        id: 'perimeters',
                        key: 'perimeters',
                        label: lang.shellSurface,
                        min: 1,
                        max: 6,
                        step: 1,
                        'default': advancedSetting.config.perimeters,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'top_solid_layers',
                        key: 'top_solid_layers',
                        label: lang.solidLayerTop,
                        min: 0,
                        max: 12,
                        step: 1,
                        'default': advancedSetting.config.top_solid_layers,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'bottom_solid_layers',
                        key: 'bottom_solid_layers',
                        label: lang.solidLayerBottom,
                        min: 0,
                        max: 12,
                        step: 1,
                        'default': advancedSetting.config.bottom_solid_layers,
                        onChange: this._handleControlValueChange })
                )
            );
        },

        _renderOffsetSection: function _renderOffsetSection() {
            return React.createElement(
                'div',
                { className: 'content-wrapper' },
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        lang.offset
                    ),
                    React.createElement(SliderControl, {
                        id: 'z_offset',
                        key: 'z_offset',
                        label: lang.zOffset,
                        min: 0,
                        max: 210,
                        step: 0.01,
                        unit: 'mm',
                        'default': advancedSetting.config.z_offset,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'xy_offset',
                        key: 'xy_offset',
                        label: lang.xyOffset,
                        min: -0.4,
                        max: 0.4,
                        step: 0.01,
                        unit: 'mm',
                        'default': advancedSetting.config.xy_offset,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'cut_bottom',
                        name: 'cut_bottom',
                        label: lang.cutBottom,
                        min: 0,
                        max: 210,
                        step: 0.01,
                        unit: 'mm',
                        'default': advancedSetting.config.cut_bottom,
                        onChange: this._handleControlValueChange })
                )
            );
        },

        _renderSupportSection: function _renderSupportSection() {
            // determin support on / off
            var supportOn = advancedSetting.config.support_enable === 1,
                supportPattern = cura2Support;

            return React.createElement(
                'div',
                { className: 'content-wrapper' },
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        lang.support
                    ),
                    React.createElement(SwitchControl, {
                        id: 'support_material',
                        name: 'support_material',
                        label: lang.generalSupport,
                        'default': supportOn,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'support_material_spacing',
                        key: 'support_material_spacing',
                        label: lang.spacing,
                        min: 0.4,
                        max: 5,
                        step: 0.1,
                        unit: 'mm',
                        'default': advancedSetting.config.support_material_spacing,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'support_material_threshold',
                        key: 'support_material_threshold',
                        label: lang.overhang,
                        min: 0,
                        max: 90,
                        step: 1,
                        unit: 'angle',
                        'default': advancedSetting.config.support_material_threshold,
                        onChange: this._handleControlValueChange }),
                    React.createElement(DropdownControl, {
                        id: 'support_material_pattern',
                        label: lang.pattern,
                        options: supportPattern,
                        unit: 'mm',
                        'default': advancedSetting.config.support_material_pattern,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'support_material_contact_distance',
                        key: 'support_material_contact_distance',
                        label: lang.zDistance,
                        min: 0,
                        max: 1,
                        step: 0.1,
                        unit: 'mm',
                        'default': advancedSetting.config.support_material_contact_distance,
                        onChange: this._handleControlValueChange })
                ),
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        lang.raft
                    ),
                    React.createElement(SwitchControl, {
                        id: 'raft',
                        label: lang.raft,
                        'default': advancedSetting.config.raft === 1,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'raft_layers',
                        key: 'raft_layers',
                        label: lang.raftLayers,
                        min: 0,
                        max: 6,
                        step: 1,
                        'default': advancedSetting.config.raft_layers,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'brim_width',
                        key: 'brim_width',
                        label: lang.brim,
                        min: 0,
                        max: 10,
                        step: 1,
                        'default': advancedSetting.config.brim_width,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SwitchControl, {
                        id: 'skirts',
                        label: lang.skirts,
                        'default': advancedSetting.config.skirts > 0,
                        onChange: this._handleControlValueChange })
                )
            );
        },

        _renderSpeedSection: function _renderSpeedSection() {
            var bridgeSpeed = React.createElement(SliderControl, {
                id: 'bridge_speed',
                key: 'bridge_speed',
                label: lang.bridge,
                min: 1,
                max: 100,
                step: 1,
                unit: 'mms',
                'default': advancedSetting.config.bridge_speed,
                onChange: this._handleControlValueChange });
            return React.createElement(
                'div',
                { className: 'content-wrapper' },
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        lang.movement
                    ),
                    React.createElement(SliderControl, {
                        id: 'travel_speed',
                        key: 'travel_speed',
                        label: lang.traveling,
                        min: 10,
                        max: 200,
                        step: 1,
                        unit: 'mms',
                        'default': advancedSetting.config.travel_speed,
                        onChange: this._handleControlValueChange })
                ),
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        lang.structure
                    ),
                    React.createElement(SliderControl, {
                        id: 'support_material_speed',
                        key: 'support_material_speed',
                        label: lang.support,
                        min: 10,
                        max: 100,
                        step: 1,
                        unit: 'mms',
                        'default': advancedSetting.config.support_material_speed,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'infill_speed',
                        key: 'infill_speed',
                        label: lang.infill,
                        min: 10,
                        max: 100,
                        step: 1,
                        unit: 'mms',
                        'default': advancedSetting.config.infill_speed,
                        onChange: this._handleControlValueChange })
                ),
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        lang.surface
                    ),
                    React.createElement(SliderControl, {
                        id: 'first_layer_speed',
                        key: 'first_layer_speed',
                        label: lang.firstLayer,
                        min: 1,
                        max: 100,
                        step: 1,
                        unit: 'mms',
                        'default': advancedSetting.config.first_layer_speed,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'solid_infill_speed',
                        key: 'solid_infill_speed',
                        label: lang.solidLayers,
                        min: 1,
                        max: 100,
                        step: 1,
                        unit: 'mms',
                        'default': advancedSetting.config.solid_infill_speed,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'perimeter_speed',
                        key: 'perimeter_speed',
                        label: lang.innerShell,
                        min: 1,
                        max: 100,
                        step: 1,
                        unit: 'mms',
                        'default': advancedSetting.config.perimeter_speed,
                        onChange: this._handleControlValueChange }),
                    React.createElement(SliderControl, {
                        id: 'external_perimeter_speed',
                        key: 'external_perimeter_speed',
                        label: lang.outerShell,
                        min: 1,
                        max: 100,
                        step: 1,
                        unit: 'mms',
                        'default': advancedSetting.config.external_perimeter_speed,
                        onChange: this._handleControlValueChange }),
                    bridgeSpeed
                )
            );
        },

        _renderCustomSection: function _renderCustomSection() {
            return React.createElement(
                'div',
                { className: 'content-wrapper' },
                React.createElement(
                    'div',
                    { className: 'section' },
                    React.createElement(
                        'div',
                        { className: 'title' },
                        lang.config,
                        React.createElement(
                            'div',
                            { className: 'load-preset', onClick: this._handleLoadPreset },
                            lang.reloadPreset
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'controls' },
                        React.createElement('div', { className: 'label pull-left' }),
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'div',
                                { className: 'textarea-container' },
                                React.createElement('textarea', {
                                    rows: '20',
                                    cols: '50',
                                    value: this.state.configStr,
                                    onChange: this._handleParameterChange.bind(null, 'configStr')
                                    // onKeyUp={this._handleParameterChange.bind(null, advancedSetting.engine === 'cura2' ? 'customCura2' : 'custom')}
                                })
                            )
                        )
                    )
                )
            );
        },

        _renderContent: function _renderContent() {
            var self = this,
                content;

            switch (this.state.selectedTab) {

                case tab.GENERAL:
                    content = self._renderGeneralSection();
                    break;

                case tab.LAYERS:
                    content = self._renderLayersSection();
                    break;

                case tab.OFFSET:
                    content = self._renderOffsetSection();
                    break;

                case tab.SUPPORT:
                    content = self._renderSupportSection();
                    break;

                case tab.SPEED:
                    content = self._renderSpeedSection();
                    break;

                case tab.CUSTOM:
                    content = self._renderCustomSection();
                    break;

                default:
                    break;
            }

            return content;
        },

        _renderFooter: function _renderFooter() {
            var buttons = [];

            switch (this.state.mode) {

                case mode.setup:
                    buttons[0] = React.createElement(
                        'button',
                        { className: 'btn btn-default', 'data-ga-event': 'load-preset', title: lang.loadPreset, onClick: this._handleListPreset },
                        React.createElement('i', { className: 'fa fa-folder-open-o' })
                    );
                    buttons[1] = React.createElement(
                        'button',
                        { className: 'btn btn-default', 'data-ga-event': 'cancel-preset', onClick: this._handleCloseAdvancedSetting },
                        lang.cancel
                    );
                    buttons[2] = React.createElement(
                        'button',
                        { className: 'btn btn-default', 'data-ga-event': 'save-preset', title: lang.savePreset, onClick: this._handleOpenSaveAsPreset },
                        React.createElement('i', { className: 'fa fa-floppy-o' })
                    );
                    buttons[3] = React.createElement(
                        'button',
                        { className: 'btn btn-default', 'data-ga-event': 'apply-preset', onClick: this._handleApply.bind(null, false) },
                        lang.apply
                    );
                    break;

                case mode.load:
                    buttons[0] = React.createElement(
                        'button',
                        { className: 'btn btn-default', 'data-ga-event': 'delete-preset', onClick: this._handleDeletePreset },
                        lang.delete
                    );
                    buttons[2] = '';
                    buttons[1] = React.createElement(
                        'button',
                        { className: 'btn btn-default', 'data-ga-event': 'back-to-preset-setting', onClick: this._handleBackToSetting },
                        lang.cancel
                    );
                    buttons[3] = React.createElement(
                        'button',
                        { className: 'btn btn-default', 'data-ga-event': 'apply-preset', onClick: this._handleApplyPreset },
                        lang.apply
                    );
                    break;

                default:
                    break;

            }

            return React.createElement(
                'div',
                { className: 'footer' },
                React.createElement(
                    'div',
                    { className: 'left' },
                    buttons[0],
                    buttons[2]
                ),
                React.createElement(
                    'div',
                    { className: 'right' },
                    buttons[1],
                    buttons[3]
                )
            );
        },

        _renderSetupUI: function _renderSetupUI() {
            var tabs = this._renderTabs(),
                content = this._renderContent(),
                footer = this._renderFooter();

            return React.createElement(
                'div',
                { id: 'advanced-panel', className: 'advanced-panel' },
                tabs,
                content,
                footer
            );
        },

        _renderLoadPresetUI: function _renderLoadPresetUI() {
            var self = this,
                footer = this._renderFooter(),
                entries,
                entryClass,
                presetList = Object.keys(this.state.presets);

            entries = presetList.map(function (entry) {
                entryClass = ClassNames('preset-entry', { 'selected': self.state.selectedPreset === entry });
                return React.createElement(
                    'div',
                    { className: entryClass, onClick: self._handleSelectPreset.bind(null, entry) },
                    React.createElement(
                        'span',
                        null,
                        entry
                    )
                );
            });

            var preset = this.state.presets[this.state.selectedPreset] || '{}',
                presetContent = JSON.parse(preset),
                custom = preset.engine === 'cura2' ? presetContent.customCura2 : presetContent.custom;

            console.log('preset.engine', preset.engine);

            return React.createElement(
                'div',
                { id: 'advanced-panel', className: 'advanced-panel' },
                React.createElement(
                    'div',
                    { className: 'preset-wrapper' },
                    React.createElement(
                        'div',
                        { className: 'preset-header' },
                        lang.loadPreset
                    ),
                    React.createElement(
                        'div',
                        { className: 'preset-list' },
                        entries
                    ),
                    React.createElement('textarea', { className: 'preset-content', value: custom, disabled: true }),
                    footer
                )
            );
        },

        _renderSavePresetUI: function _renderSavePresetUI() {
            var divStyle = {
                height: '190px'
            },
                footer = this._renderFooter();

            return React.createElement(
                'div',
                { id: 'advanced-panel', className: 'advanced-panel', style: divStyle },
                React.createElement(
                    'div',
                    { className: 'preset-wrapper' },
                    React.createElement(
                        'div',
                        { className: 'preset-header' },
                        lang.saveAsPreset
                    ),
                    React.createElement(
                        'div',
                        { className: 'preset-name' },
                        React.createElement(
                            'span',
                            null,
                            lang.name
                        ),
                        React.createElement('input', { ref: 'presetName', type: 'text' })
                    ),
                    footer
                )
            );
        },

        render: function render() {
            var self = this,
                className = {
                'hide': this.state.mode === mode.save,
                'box-shadow': true
            },
                UI;

            switch (this.state.mode) {

                case mode.setup:
                    UI = self._renderSetupUI();break;

                case mode.load:
                    UI = self._renderLoadPresetUI();break;

                default:
                    break;
            }

            return React.createElement(Modal, { className: className, content: UI, onClose: this._handleCloseAdvancedSetting });
        }

    });
});