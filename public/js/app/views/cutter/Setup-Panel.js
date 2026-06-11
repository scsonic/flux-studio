'use strict';

define(['jquery', 'react', 'jsx!widgets/List', 'jsx!widgets/Modal', 'jsx!views/laser/Advanced-Panel', 'jsx!widgets/Text-Toggle', 'jsx!widgets/Unit-Input', 'jsx!widgets/Button-Group', 'jsx!widgets/Alert', 'jsx!widgets/Dialog-Menu', 'helpers/api/config', 'helpers/i18n', 'helpers/round', 'plugins/classnames/index'], function ($, React, List, Modal, AdvancedPanel, TextToggle, UnitInput, ButtonGroup, Alert, DialogMenu, ConfigHelper, i18n, round, ClassNames) {
    'use strict';

    var Config = ConfigHelper(),
        lang = i18n.lang;

    return React.createClass({

        getDefaultProps: function getDefaultProps() {
            return {
                defaults: {},
                imageFormat: 'svg' // svg, bitmap
            };
        },

        getInitialState: function getInitialState() {
            return {
                defaults: this.props.defaults
            };
        },

        isShading: function isShading() {
            return false;
        },

        // UI Events
        _saveLastestSet: function _saveLastestSet() {
            var self = this,
                refs = self.refs,
                opts = {
                zOffset: refs.zOffset.value(),
                //overcut: refs.overcut.value(),
                speed: refs.speed.value(),
                bladeRadius: refs.bladeRadius.value()
            },
                state = {
                defaults: opts
            };

            Config.write('cut-defaults', opts);

            self.setState(state);
        },

        openSubPopup: function openSubPopup(e) {
            this.refs.dialogMenu.toggleSubPopup(e);
        },

        _updateDefaults: function _updateDefaults(e, value) {
            this._saveLastestSet();
            this.openSubPopup(e);
        },

        // Lifecycle
        _renderZOffset: function _renderZOffset() {
            var min = -1;

            return {
                label: React.createElement(
                    'div',
                    { title: lang.cut.zOffsetTip },
                    React.createElement(
                        'span',
                        { className: 'caption' },
                        lang.cut.zOffset
                    ),
                    React.createElement(
                        'span',
                        null,
                        this.state.defaults.zOffset
                    ),
                    React.createElement(
                        'span',
                        null,
                        lang.draw.units.mm
                    )
                ),
                content: React.createElement(
                    'div',
                    { className: 'object-height-input' },
                    React.createElement(UnitInput, {
                        ref: 'zOffset',
                        defaultUnit: 'mm',
                        defaultValue: this.state.defaults.zOffset,
                        getValue: this._updateDefaults,
                        min: min,
                        max: 5
                    })
                )
            };
        },

        _renderOvercut: function _renderOvercut() {
            return {
                label: React.createElement(
                    'div',
                    { title: lang.cut.overcutTip },
                    React.createElement(
                        'span',
                        { className: 'caption' },
                        lang.cut.overcut
                    ),
                    React.createElement(
                        'span',
                        null,
                        this.state.defaults.overcut
                    ),
                    React.createElement(
                        'span',
                        null,
                        lang.draw.units.mm
                    )
                ),
                content: React.createElement(
                    'div',
                    { className: 'object-height-input' },
                    React.createElement(UnitInput, {
                        ref: 'overcut',
                        defaultUnit: 'mm',
                        defaultValue: this.state.defaults.overcut,
                        getValue: this._updateDefaults,
                        min: 0,
                        max: 10
                    })
                )
            };
        },

        _renderSpeed: function _renderSpeed() {
            return {
                label: React.createElement(
                    'div',
                    { title: lang.cut.speedTip },
                    React.createElement(
                        'span',
                        { className: 'caption' },
                        lang.cut.speed
                    ),
                    React.createElement(
                        'span',
                        null,
                        this.state.defaults.speed
                    ),
                    React.createElement(
                        'span',
                        null,
                        lang.draw.units.mms
                    )
                ),
                content: React.createElement(
                    'div',
                    { className: 'object-height-input' },
                    React.createElement(UnitInput, {
                        ref: 'speed',
                        defaultUnit: 'mm/s',
                        defaultUnitType: 'speed',
                        defaultValue: this.state.defaults.speed,
                        getValue: this._updateDefaults,
                        min: 0.8,
                        max: 200
                    })
                )
            };
        },

        _renderBladeRadius: function _renderBladeRadius() {

            return {
                label: React.createElement(
                    'div',
                    { title: lang.cut.bladeRadiusTip },
                    React.createElement(
                        'span',
                        { className: 'caption' },
                        lang.cut.bladeRadius
                    ),
                    React.createElement(
                        'span',
                        null,
                        this.state.defaults.bladeRadius
                    ),
                    React.createElement(
                        'span',
                        null,
                        lang.draw.units.mm
                    )
                ),
                content: React.createElement(
                    'div',
                    { className: 'object-height-input' },
                    React.createElement(UnitInput, {
                        ref: 'bladeRadius',
                        defaultUnit: 'mm',
                        defaultValue: this.state.defaults.bladeRadius,
                        getValue: this._updateDefaults,
                        min: 0,
                        max: 3
                    })
                )
            };
        },

        render: function render() {
            var items = [this._renderZOffset(),
            // this._renderOvercut(),
            this._renderSpeed(), this._renderBladeRadius()];

            return React.createElement(
                'div',
                { className: 'setup-panel operating-panel' },
                React.createElement(DialogMenu, { ref: 'dialogMenu', items: items })
            );
        }

    });
});