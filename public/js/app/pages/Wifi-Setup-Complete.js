'use strict';

define(['react', 'helpers/sprintf', 'app/actions/initialize-machine', 'helpers/api/config', 'helpers/api/usb-config', 'jsx!widgets/Modal', 'helpers/device-master'], function (React, sprintf, initializeMachine, config, usbConfig, Modal, DeviceMaster) {
    'use strict';

    return function (args) {

        args = args || {};

        return React.createClass({

            getInitialState: function getInitialState() {
                return args.state;
            },

            componentDidMount: function componentDidMount() {
                if ('with-usb' !== this.props.other) {
                    initializeMachine.completeSettingUp(false);
                }

                DeviceMaster.unregisterUsbEvent('SETUP');
            },

            _goBack: function _goBack(e) {
                history.go(-1);
            },

            _onStart: function _onStart(e) {
                initializeMachine.completeSettingUp(true);
            },

            _getArticle: function _getArticle(lang, method) {
                var settingPrinter = initializeMachine.settingPrinter.get(),
                    article = {};

                switch (method) {
                    case 'with-wifi':
                        article = {
                            caption: lang.initialize.setting_completed.brilliant,
                            content: lang.initialize.setting_completed.begin_journey
                        };
                        break;
                    case 'with-usb':
                        article = {
                            caption: lang.initialize.setting_completed.great,
                            content: lang.initialize.setting_completed.upload_via_usb
                        };
                        break;
                    case 'station-mode':
                        article = {
                            caption: sprintf(lang.initialize.setting_completed.is_ready, settingPrinter.name || ''),
                            content: sprintf(lang.initialize.setting_completed.station_ready_statement, settingPrinter.name)
                        };
                        break;
                }

                return article;
            },

            render: function render() {
                var method = this.props.other || 'with-wifi';
                var wrapperClassName = {
                    'initialization': true
                },
                    lang = this.state.lang,
                    article = this._getArticle(lang, method);

                function createMarkup() {
                    return { __html: article.content };
                }

                var startText = 'with-usb' === method ? lang.initialize.setting_completed.ok : lang.initialize.setting_completed.start,
                    backToWifiSelect = 'with-usb' === method ? React.createElement(
                    'button',
                    { className: 'btn btn-link btn-large', 'data-ga-event': 'back', onClick: this._goBack },
                    lang.initialize.setting_completed.back
                ) : '',
                    content = React.createElement(
                    'div',
                    { className: 'setting-completed text-center' },
                    React.createElement('img', { className: 'brand-image', src: 'img/menu/main_logo.svg' }),
                    React.createElement(
                        'h1',
                        { className: 'headline' },
                        article.caption
                    ),
                    React.createElement('p', { className: 'notice', dangerouslySetInnerHTML: createMarkup() }),
                    React.createElement(
                        'div',
                        { className: 'btn-v-group' },
                        React.createElement(
                            'button',
                            { className: 'btn btn-action btn-large', 'data-ga-event': 'start', onClick: this._onStart },
                            startText
                        ),
                        backToWifiSelect
                    )
                );

                return React.createElement(Modal, { className: wrapperClassName, content: content });
            }
        });
    };
});