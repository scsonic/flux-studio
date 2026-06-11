'use strict';

define(['jquery', 'react', 'reactPropTypes', 'jsx!views/holder/Setup-Panel', 'jsx!pages/Holder', 'helpers/api/config', 'helpers/i18n'], function ($, React, PropTypes, HolderSetupPanel, HolderGenerator, ConfigHelper, i18n) {

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
                        liftHeight: 55,
                        drawHeight: 50,
                        speed: 20
                    }
                };
            },

            componentDidMount: function componentDidMount() {
                var options = Config.read('draw-defaults') || {};
                options = {
                    liftHeight: options.liftHeight || 55,
                    drawHeight: options.drawHeight || 50,
                    speed: options.speed || 20
                };
                if (!Config.read('draw-defaults')) {
                    Config.write('draw-defaults', options);
                }
                this.setState({ options: options });
            },

            _fetchFormalSettings: function _fetchFormalSettings(holder) {
                var options = Config.read('draw-defaults') || {};
                return {
                    lift_height: options.liftHeight || 0.1,
                    draw_height: options.drawHeight || 0.1,
                    speed: options.speed || 20
                };;
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
                console.log('Load Holder', Holder);
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