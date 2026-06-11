'use strict';

define(['react', 'app/actions/beambox/beambox-preference', 'jsx!widgets/Modal', 'helpers/i18n'], function (React, BeamboxPreference, Modal, i18n) {
    'use strict';

    var lang = i18n.lang;

    return function () {
        return React.createClass({

            _renderSelectMachineStep: function _renderSelectMachineStep() {
                return React.createElement(
                    'div',
                    { className: 'select-machine-type' },
                    React.createElement(
                        'h1',
                        { className: 'main-title' },
                        lang.initialize.select_beambox_type
                    ),
                    React.createElement(
                        'div',
                        { className: 'btn-h-group' },
                        React.createElement(
                            'button',
                            {
                                className: 'btn btn-action btn-large',
                                onClick: function onClick() {
                                    return location.hash = '#initialize/wifi/connect-beambox';
                                }
                            },
                            React.createElement(
                                'p',
                                { className: 'subtitle' },
                                'Beambox'
                            )
                        ),
                        React.createElement(
                            'button',
                            {
                                className: 'btn btn-action btn-large',
                                onClick: function onClick() {
                                    return location.hash = '#initialize/wifi/connect-beambox#Pro';
                                }
                            },
                            React.createElement(
                                'p',
                                { className: 'subtitle' },
                                'Beambox Pro'
                            )
                        )
                    )
                );
            },

            render: function render() {
                var wrapperClassName = {
                    'initialization': true
                };
                var innerContent = this._renderSelectMachineStep();
                var content = React.createElement(
                    'div',
                    { className: 'connect-machine text-center' },
                    React.createElement('img', { className: 'brand-image', src: 'img/menu/main_logo.svg' }),
                    React.createElement(
                        'div',
                        { className: 'connecting-means' },
                        innerContent,
                        React.createElement(
                            'a',
                            { href: '#initialize/wifi/setup-complete/with-usb', 'data-ga-event': 'skip', className: 'btn btn-link btn-large' },
                            lang.initialize.no_machine
                        )
                    )
                );

                return React.createElement(Modal, { className: wrapperClassName, content: content });
            }

        });
    };
});