'use strict';

define(['jquery', 'react', 'reactDOM', 'reactPropTypes', 'reactClassset', 'helpers/i18n'], function ($, React, ReactDOM, PropTypes, ReactCx, i18n) {
    'use strict';

    return React.createClass({
        PropTypes: {
            onSetPrinter: PropTypes.func
        },

        getInitialState: function getInitialState() {
            return {
                validPrinterName: true,
                validPrinterPassword: true
            };
        },

        _handleSetPrinter: function _handleSetPrinter() {
            var name = ReactDOM.findDOMNode(this.refs.name).value,
                password = ReactDOM.findDOMNode(this.refs.password).value;

            this.setState({
                validPrinterName: name !== '',
                validPrinterPassword: password !== ''
            });

            if (name !== '') {
                this.props.onSetPrinter(name, password);
            }
        },

        render: function render() {
            var lang = this.props.lang,
                printerNameClass;

            printerNameClass = ReactCx.cx({
                'required': true,
                'error': !this.state.validPrinterName
            });

            return React.createElement(
                'div',
                { className: 'wifi center' },
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h2',
                        null,
                        lang.wifi.set_printer.caption
                    ),
                    React.createElement(
                        'div',
                        { className: 'wifi-form row-fluid clearfix' },
                        React.createElement(
                            'div',
                            { className: 'col span5 flux-printer' },
                            React.createElement('img', { src: 'img/img-flux-printer.png' })
                        ),
                        React.createElement(
                            'div',
                            { className: 'col span7 text-left' },
                            React.createElement(
                                'p',
                                null,
                                React.createElement(
                                    'label',
                                    { 'for': 'printer-name' },
                                    lang.wifi.set_printer.printer_name
                                ),
                                React.createElement('input', { ref: 'name', id: 'printer-name', type: 'text', className: printerNameClass,
                                    placeholder: lang.wifi.set_printer.printer_name_placeholder })
                            ),
                            React.createElement(
                                'p',
                                null,
                                React.createElement(
                                    'label',
                                    { 'for': 'printer-password' },
                                    lang.wifi.set_printer.password
                                ),
                                React.createElement('input', { ref: 'password', type: 'password',
                                    placeholder: lang.wifi.set_printer.password_placeholder })
                            ),
                            React.createElement(
                                'p',
                                { className: 'notice' },
                                lang.wifi.set_printer.notice
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'a',
                            { id: 'btn-set-printer', className: 'btn btn-large', onClick: this._handleSetPrinter },
                            lang.wifi.set_printer.next
                        )
                    )
                )
            );
        }

    });
});