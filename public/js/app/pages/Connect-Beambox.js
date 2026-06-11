'use strict';

define(['react', 'jsx!widgets/Modal', 'jsx!widgets/Button-Group', 'app/actions/initialize-machine', 'app/actions/beambox/beambox-preference', 'helpers/api/config', 'helpers/i18n'], function (React, Modal, ButtonGroup, initializeMachine, BeamboxPreference, Config, i18n) {
    var LANG = i18n.lang.initialize.connect_beambox;

    return function () {
        return React.createClass({
            onStart: function onStart() {
                var splitUrl = location.href.split('#');
                if (splitUrl.length > 2 && splitUrl[2] === 'Pro') {
                    BeamboxPreference.write('model', 'fbb1p');
                } else {
                    BeamboxPreference.write('model', 'fbb1b');
                }
                Config().write('default-app', 'beambox');
                initializeMachine.completeSettingUp(true);
                location.reload();
            },
            onOpenTutorialLink: function onOpenTutorialLink() {
                var url = LANG.tutorial_url;
                window.open(url);
            },
            _renderSelectMachineStep: function _renderSelectMachineStep() {
                var buttons = [{
                    label: LANG.please_see_tutorial_video,
                    className: 'btn btn-link btn-large',
                    type: 'link',
                    onClick: this.onOpenTutorialLink
                }, {
                    label: i18n.lang.initialize.setting_completed.start,
                    className: 'btn btn-action btn-large start',
                    onClick: this.onStart,
                    href: '#initialize/wifi/setup-complete/with-usb'
                }];
                return React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h1',
                        { className: 'main-title' },
                        LANG.set_beambox_connection
                    ),
                    React.createElement(
                        'div',
                        null,
                        LANG.please_goto_touchpad
                    ),
                    React.createElement(
                        'div',
                        { className: 'tutorial' },
                        LANG.tutorial
                    ),
                    React.createElement(ButtonGroup, { className: 'btn-v-group', buttons: buttons })
                );
            },

            render: function render() {
                var wrapperClassName = {
                    'initialization': true
                };
                var innerContent = this._renderSelectMachineStep();
                var content = React.createElement(
                    'div',
                    { className: 'connect-beambox text-center' },
                    React.createElement('img', { className: 'brand-image', src: 'img/menu/main_logo.svg' }),
                    innerContent
                );

                return React.createElement(Modal, { className: wrapperClassName, content: content });
            }

        });
    };
});