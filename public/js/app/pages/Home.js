'use strict';

define(['react', 'helpers/i18n', 'jsx!widgets/Select', 'jsx!widgets/Modal'], function (React, i18n, SelectView, Modal) {
    'use strict';

    return function (args) {
        args = args || {};

        return React.createClass({
            getInitialState: function getInitialState() {
                return {
                    lang: args.state.lang
                };
            },

            // Private methods
            _getLanguageOptions: function _getLanguageOptions() {
                var options = [];

                for (var lang_code in args.props.supported_langs) {
                    options.push({
                        value: lang_code,
                        label: args.props.supported_langs[lang_code],
                        selected: lang_code === i18n.getActiveLang()
                    });
                }

                return options;
            },

            _changeActiveLang: function _changeActiveLang(e) {
                i18n.setActiveLang(e.currentTarget.value);
                this.setState({
                    lang: i18n.get()
                });
            },

            // Lifecycle
            render: function render() {
                var lang = this.state.lang,
                    options = this._getLanguageOptions(),
                    wrapperClassName = {
                    'initialization': true
                },
                    content = React.createElement(
                    'div',
                    { className: 'home text-center' },
                    React.createElement('img', { className: 'brand-image', src: 'img/menu/main_logo.svg' }),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'h1',
                            { className: 'headline' },
                            lang.initialize.select_language
                        ),
                        React.createElement(
                            'div',
                            { className: 'language' },
                            React.createElement(SelectView, { id: 'select-lang', options: options, onChange: this._changeActiveLang })
                        ),
                        React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'a',
                                { href: '#initialize/wifi/select-machine-type', className: 'btn btn-action btn-large' },
                                lang.initialize.next
                            )
                        )
                    )
                );

                return React.createElement(Modal, { className: wrapperClassName, content: content });
            }
        });
    };
});