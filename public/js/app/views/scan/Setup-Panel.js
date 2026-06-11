'use strict';

define(['jquery', 'react', 'reactClassset', 'helpers/api/config', 'jsx!widgets/List', 'jsx!widgets/Dialog-Menu'], function ($, React, ReactCx, config, List, DialogMenu) {
    'use strict';

    return React.createClass({

        getDefaultProps: function getDefaultProps() {
            return {
                className: {},
                lang: {},
                getSetting: function getSetting(setting) {},
                onCalibrate: function onCalibrate() {}
            };
        },

        getInitialState: function getInitialState() {
            var defaultSettings = {
                resolution: this.props.lang.scan.resolution[0]
            },
                defaults = config().read('scan-defaults') || defaultSettings;

            return {
                defaults: defaults
            };
        },

        openSubPopup: function openSubPopup(e) {
            this.refs.dialogMenu.toggleSubPopup(e);
        },

        getSettings: function getSettings() {
            return this.state.defaults;
        },

        _onPickupResolution: function _onPickupResolution(e) {
            var $me = $(e.target).parents('li'),
                settings = {
                resolution: $me.data('meta')
            };

            this.props.getSetting(settings);

            config().write('scan-defaults', settings);

            this.setState({
                defaults: settings
            });

            this.openSubPopup(e);
        },

        _getResolutionOptions: function _getResolutionOptions(lang) {
            var resolution = JSON.parse(JSON.stringify(lang.scan.resolution)),
                options = [];

            resolution.forEach(function (opt, i) {
                options.push({
                    data: opt,
                    label: React.createElement(
                        'div',
                        { className: 'resolution-item resolution-' + opt.text.toLowerCase() },
                        React.createElement(
                            'span',
                            { className: 'caption' },
                            opt.text
                        ),
                        React.createElement(
                            'span',
                            { className: 'time' },
                            opt.time
                        )
                    )
                });
            });

            // for avoid a strange issue happened on windows 64 that display 
            // "TypeError": Cannot read property 'text' of undefined. cause scan function crashed.
            try {
                var quality = this.state.defaults.resolution.text;
            } catch (err) {
                console.log(err);
                var quality = '';
            }
            return {
                label: React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        { className: 'caption resolution' },
                        quality
                    ),
                    React.createElement(
                        'span',
                        null,
                        lang.scan.quality
                    )
                ),
                content: React.createElement(List, { items: options, onClick: this._onPickupResolution })
            };
        },

        _getCalibrate: function _getCalibrate(lang) {
            return {
                label: React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'button',
                        { className: 'btn btn-default btn-calibrate caption', 'data-ga-event': 'calibrate', onClick: this.props.onCalibrate },
                        lang.scan.calibrate
                    )
                )
            };
        },

        render: function render() {
            var props = this.props,
                lang = props.lang,
                resolutionOptions = this._getResolutionOptions(lang),
                calibrate = this._getCalibrate(lang),
                className = props.className,
                items = [resolutionOptions, calibrate];

            className['setup-panel'] = true;

            return React.createElement(
                'div',
                { className: ReactCx.cx(className) },
                React.createElement(DialogMenu, { ref: 'dialogMenu', items: items })
            );
        }

    });
});