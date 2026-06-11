'use strict';

/* eslint-disable react/no-multi-comp */
define(['jquery', 'react', 'helpers/i18n', 'helpers/api/config', 'jsx!widgets/Select', 'jsx!widgets/Unit-Input-v2', 'app/actions/alert-actions', 'helpers/local-storage', 'app/actions/beambox/constant', 'app/actions/beambox/beambox-preference', 'app/actions/initialize-machine'], function ($, React, i18n, Config, SelectView, UnitInput, AlertActions, LocalStorage, BeamboxConstant, BeamboxPreference, initializeMachine) {

    var Controls = function Controls(props) {
        var style = { width: 'calc(100% / 10 * 3 - 10px)' };
        var innerHtml = { __html: props.label };
        return React.createElement(
            'div',
            { className: 'row-fluid' },
            React.createElement(
                'div',
                { className: 'span3 no-left-margin', style: style },
                React.createElement('label', { className: 'font2',
                    dangerouslySetInnerHTML: innerHtml
                })
            ),
            React.createElement(
                'div',
                { className: 'span8 font3' },
                props.children
            )
        );
    };

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
                lang: i18n.lang
            };
        },

        _checkIPFormat: function _checkIPFormat(e) {
            var me = e.currentTarget,
                lang = this.state.lang,
                originalIP = Config().read('poke-ip-addr'),
                ips = me.value.split(/[,;] ?/),
                ipv4Pattern = /^\d{1,3}[\.]\d{1,3}[\.]\d{1,3}[\.]\d{1,3}$/g,
                isCorrectFormat = true;

            ips.forEach(function (ip) {
                if ('' !== ip && typeof ips === 'string' && false === ipv4Pattern.test(ip)) {
                    me.value = originalIP;
                    AlertActions.showPopupError('wrong-ip-error', lang.settings.wrong_ip_format + '\n' + ip);
                    isCorrectFormat = false;
                    return;
                }
            });

            if (isCorrectFormat) {
                Config().write('poke-ip-addr', me.value);
            }
        },

        _changeActiveLang: function _changeActiveLang(e) {
            i18n.setActiveLang(e.currentTarget.value);
            this.setState({
                lang: i18n.get()
            });
            this.props.onLangChange(e);
        },

        _updateOptions: function _updateOptions(id, e) {
            Config().write(id, e.target.value);
            this.forceUpdate();
        },

        _updateBeamboxPreference: function _updateBeamboxPreference(item_key, val) {
            if (val === 'true') {
                val = true;
            } else if (val === 'false') {
                val = false;
            }
            BeamboxPreference.write(item_key, val);
            this.forceUpdate();
        },

        _removeDefaultMachine: function _removeDefaultMachine() {
            if (confirm(this.state.lang.settings.confirm_remove_default)) {
                initializeMachine.defaultPrinter.clear();
                this.forceUpdate();
            }
        },

        _resetFS: function _resetFS() {
            if (confirm(this.state.lang.settings.confirm_reset)) {
                LocalStorage.clearAllExceptIP();
                location.hash = '#';
            }
        },

        render: function render() {
            var _this = this;

            var supported_langs = this.props.supported_langs,
                printer = initializeMachine.defaultPrinter.get(),
                default_machine_button = void 0,
                tableStyle = { width: '70%' },
                pokeIP = Config().read('poke-ip-addr'),
                lang = this.state.lang,
                options = [];


            Object.keys(supported_langs).map(function (l) {
                options.push({
                    value: l,
                    label: supported_langs[l],
                    selected: l === i18n.getActiveLang()
                });
            });

            var notificationOptions = [{
                value: 0,
                label: lang.settings.notification_off,
                selected: Config().read('notification') === '0'
            }, {
                value: 1,
                label: lang.settings.notification_on,
                selected: Config().read('notification') === '1'
            }];

            var defaultAppOptions = [{
                value: 'print',
                label: lang.menu.print,
                selected: Config().read('default-app') === 'print'
            }, {
                value: 'laser',
                label: lang.menu.laser,
                selected: Config().read('default-app') === 'laser'
            }, {
                value: 'scan',
                label: lang.menu.scan,
                selected: Config().read('default-app') === 'scan'
            }, {
                value: 'draw',
                label: lang.menu.draw,
                selected: Config().read('default-app') === 'draw'
            }, {
                value: 'cut',
                label: lang.menu.cut,
                selected: Config().read('default-app') === 'cut'
            }, {
                value: 'beambox',
                label: lang.menu.beambox,
                selected: Config().read('default-app') === 'beambox'
            }];

            var defaultUnitsOptions = [{
                value: 'mm',
                label: lang.menu.mm,
                selected: Config().read('default-units') === 'mm'
            }, {
                value: 'inches',
                label: lang.menu.inches,
                selected: Config().read('default-units') === 'inches'
            }];

            var projectionOptions = [{
                value: 'Perspective',
                label: lang.settings.projection_perspective,
                selected: Config().read('camera-projection') === 'Perspective'
            }, {
                value: 'Orthographic',
                label: lang.settings.projection_orthographic,
                selected: Config().read('camera-projection') === 'Orthographic'
            }];

            var antialiasingOptions = [{
                value: 0,
                label: lang.settings.off,
                selected: Config().read('antialiasing') === '0'
            }, {
                value: 1,
                label: lang.settings.on,
                selected: Config().read('antialiasing') === '1'
            }];

            var autoSlicingOptions = [{
                value: 'true',
                label: lang.settings.on,
                selected: Config().read('auto-slicing') !== 'false'
            }, {
                value: 'false',
                label: lang.settings.off,
                selected: Config().read('auto-slicing') === 'false'
            }];

            var lockSelectionOptions = [{
                value: 'true',
                label: lang.settings.on,
                selected: Config().read('lock-selection') !== 'false'
            }, {
                value: 'false',
                label: lang.settings.off,
                selected: Config().read('lock-selection') === 'false'
            }];

            var guideSelectionOptions = [{
                value: 'false',
                label: lang.settings.off,
                selected: BeamboxPreference.read('show_guides') === false
            }, {
                value: 'true',
                label: lang.settings.on,
                selected: BeamboxPreference.read('show_guides') !== false
            }];

            var defaultModelOptions = [{
                value: '',
                label: lang.settings.none,
                selected: Config().read('default-model') === ''
            }, {
                value: 'fd1',
                label: lang.settings.fd1,
                selected: Config().read('default-model') === 'fd1'
            }, {
                value: 'fd1p',
                label: lang.settings.fd1p,
                selected: Config().read('default-model') === 'fd1p'
            }];

            var defaultBeamboxModelOptions = [{
                value: 'fbm1',
                label: 'Beamo',
                selected: BeamboxPreference.read('model') === 'fbm1'
            }, {
                value: 'fbb1b',
                label: 'Beambox',
                selected: BeamboxPreference.read('model') === 'fbb1b'
            }, {
                value: 'fbb1p',
                label: 'Beambox Pro',
                selected: BeamboxPreference.read('model') === 'fbb1p'
            }];

            if (printer.name !== undefined) {
                default_machine_button = React.createElement(
                    'a',
                    { className: 'font3',
                        onClick: this._removeDefaultMachine
                    },
                    lang.settings.remove_default_machine_button
                );
            } else {
                default_machine_button = React.createElement(
                    'span',
                    null,
                    lang.settings.default_machine_button
                );
            }

            return React.createElement(
                'div',
                { className: 'form general' },
                React.createElement(
                    Controls,
                    { label: lang.settings.language },
                    React.createElement(SelectView, {
                        id: 'select-lang',
                        className: 'font3',
                        options: options,
                        onChange: this._changeActiveLang
                    })
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.notifications },
                    React.createElement(SelectView, {
                        className: 'font3',
                        options: notificationOptions,
                        onChange: this._updateOptions.bind(null, 'notification')
                    })
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.default_app },
                    React.createElement(SelectView, {
                        className: 'font3',
                        options: defaultAppOptions,
                        onChange: this._updateOptions.bind(null, 'default-app')
                    })
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.default_machine },
                    React.createElement(
                        'table',
                        { style: tableStyle },
                        React.createElement(
                            'tr',
                            null,
                            React.createElement(
                                'td',
                                null,
                                printer.name
                            ),
                            React.createElement(
                                'td',
                                null,
                                default_machine_button
                            )
                        )
                    )
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.ip },
                    React.createElement('input', {
                        type: 'text',
                        autoComplete: 'false',
                        defaultValue: pokeIP,
                        onBlur: this._checkIPFormat
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'subtitle' },
                    lang.settings.delta_series
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.projection },
                    React.createElement(SelectView, {
                        id: 'select-lang',
                        className: 'font3',
                        options: projectionOptions,
                        onChange: this._updateOptions.bind(null, 'camera-projection')
                    })
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.antialiasing },
                    React.createElement(SelectView, {
                        id: 'select-lang',
                        className: 'font3',
                        options: antialiasingOptions,
                        onChange: this._updateOptions.bind(null, 'antialiasing')
                    })
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.auto_slice },
                    React.createElement(SelectView, {
                        id: 'select-lang',
                        className: 'font3',
                        options: autoSlicingOptions,
                        onChange: this._updateOptions.bind(null, 'auto-slicing')
                    })
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.lock_selection },
                    React.createElement(SelectView, {
                        id: 'select-lang',
                        className: 'font3',
                        options: lockSelectionOptions,
                        onChange: this._updateOptions.bind(null, 'lock-selected')
                    })
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.default_model },
                    React.createElement(SelectView, {
                        id: 'select-lang',
                        className: 'font3',
                        options: defaultModelOptions,
                        onChange: this._updateOptions.bind(null, 'default-model')
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'subtitle' },
                    lang.settings.beambox_series
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.default_units },
                    React.createElement(SelectView, {
                        className: 'font3',
                        options: defaultUnitsOptions,
                        onChange: this._updateOptions.bind(null, 'default-units')
                    })
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.loop_compensation },
                    React.createElement(UnitInput, {
                        unit: 'mm',
                        min: 0,
                        max: 20,
                        defaultValue: Number(localStorage.getItem('loop_compensation') || '0') / 10,
                        getValue: function getValue(val) {
                            return localStorage.setItem('loop_compensation', Number(val) * 10);
                        },
                        className: { half: true }
                    })
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.default_beambox_model },
                    React.createElement(SelectView, {
                        className: 'font3',
                        options: defaultBeamboxModelOptions,
                        onChange: function onChange(e) {
                            return _this._updateBeamboxPreference('model', e.target.value);
                        }
                    })
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.guides },
                    React.createElement(SelectView, {
                        id: 'select-lang',
                        className: 'font3',
                        options: guideSelectionOptions,
                        onChange: function onChange(e) {
                            return _this._updateBeamboxPreference('show_guides', e.target.value);
                        }
                    })
                ),
                React.createElement(
                    Controls,
                    { label: lang.settings.guides_origin },
                    React.createElement(
                        'span',
                        { className: 'font2', style: { marginRight: '10px' } },
                        'X'
                    ),
                    React.createElement(UnitInput, {
                        unit: 'mm',
                        min: 0,
                        max: BeamboxConstant.dimension.width / 10,
                        defaultValue: BeamboxPreference.read('guide_x0'),
                        getValue: function getValue(val) {
                            return _this._updateBeamboxPreference('guide_x0', val);
                        },
                        className: { half: true }
                    }),
                    React.createElement(
                        'span',
                        { className: 'font2', style: { marginRight: '10px' } },
                        'Y'
                    ),
                    React.createElement(UnitInput, {
                        unit: 'mm',
                        min: 0,
                        max: BeamboxConstant.dimension.height / 10,
                        defaultValue: BeamboxPreference.read('guide_y0'),
                        getValue: function getValue(val) {
                            return _this._updateBeamboxPreference('guide_y0', val);
                        },
                        className: { half: true }
                    })
                ),
                React.createElement(
                    Controls,
                    { label: '' },
                    React.createElement(
                        'a',
                        { className: 'font3',
                            onClick: this._resetFS
                        },
                        React.createElement(
                            'b',
                            null,
                            lang.settings.reset_now
                        )
                    )
                )
            );
        }

    });
});