'use strict';

define(['jquery', 'react', 'reactPropTypes', 'jsx!views/miller/Setup-Panel', 'jsx!pages/Holder', 'helpers/api/config', 'helpers/i18n'], function ($, React, PropTypes, MillSetupPanel, HolderGenerator, ConfigHelper, i18n) {

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
                        zOffset: 0.1,
                        overcut: 2,
                        speed: 20,
                        bladeRadius: 0,
                        repeat: 0,
                        stepHeight: 0.1
                    }
                };
            },

            componentDidMount: function componentDidMount() {
                var options = Config.read('mill-defaults') || {};
                options = {
                    zOffset: options.zOffset || 0.1,
                    overcut: options.overcut || 2,
                    speed: options.speed || 10,
                    bladeRadius: options.bladeRadius || 0.24,
                    repeat: options.repeat || 1,
                    stepHeight: options.stepHeight || 0.1
                };
                if (!Config.read('mill-defaults')) {
                    Config.write('mill-defaults', options);
                }
                this.setState({ options: options });
            },

            _fetchFormalSettings: function _fetchFormalSettings() {
                var options = Config.read('mill-defaults') || {};
                return {
                    cutting_zheight: options.zOffset || 0.1,
                    overcut: options.overcut || 2,
                    speed: options.speed || 10,
                    blade_radius: 0.01,
                    repeat: options.repeat || 0,
                    step_height: options.stepHeight || 0.1
                };
            },

            _renderSetupPanel: function _renderSetupPanel(holder) {
                return React.createElement(MillSetupPanel, {
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