'use strict';

define(['jquery', 'react', 'reactPropTypes', 'jsx!views/cutter/Setup-Panel', 'jsx!pages/Holder', 'helpers/api/config', 'helpers/i18n'], function ($, React, PropTypes, HolderSetupPanel, HolderGenerator, ConfigHelper, i18n) {

    var Config = ConfigHelper(),
        lang = i18n.lang;

    'use strict';

    return function (args) {
        args = args || {};

        var Holder = HolderGenerator(args);

        var view = React.createClass({
            displayName: 'view',

            propTypes: {
                page: PropTypes.string
            },

            getInitialState: function getInitialState() {
                return {
                    options: {
                        zOffset: 0,
                        overcut: 2,
                        speed: 30,
                        bladeRadius: 0.5
                    }
                };
            },

            componentDidMount: function componentDidMount() {
                var options = Config.read('cut-defaults') || {};
                options = {
                    zOffset: options.zOffset || 0,
                    overcut: options.overcut || 2,
                    speed: options.speed || 30,
                    bladeRadius: options.bladeRadius || 0.5
                };
                if (!Config.read('cut-defaults')) {
                    Config.write('cut-defaults', options);
                }
                this.setState({ options: options });
            },

            _fetchFormalSettings: function _fetchFormalSettings() {
                var options = Config.read('cut-defaults') || {};
                return {
                    cutting_zheight: options.zOffset || 0,
                    overcut: options.overcut || 2,
                    speed: options.speed || 30,
                    blade_radius: options.bladeRadius || 0.5
                };
            },

            _renderSetupPanel: function _renderSetupPanel(holder) {
                return React.createElement(HolderSetupPanel, {
                    page: holder.props.page,
                    className: 'operating-panel',
                    imageFormat: holder.state.fileFormat,
                    defaults: holder.state.panelOptions,
                    ref: 'setupPanel'
                });
            },

            render: function render() {
                // return <div />;

                return React.createElement(Holder, {
                    page: this.props.page,
                    acceptFormat: 'image/svg',
                    panelOptions: this.state.options,
                    fetchFormalSettings: this._fetchFormalSettings,
                    renderSetupPanel: this._renderSetupPanel
                });
            }
        });

        return view;
    };
});