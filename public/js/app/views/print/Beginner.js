'use strict';

define(['jquery', 'react', 'jsx!widgets/Select', 'jsx!widgets/Radio-Group'], function ($, React, SelectView, RadioGroupView) {
    'use strict';

    return function (args) {
        args = args || {};
        var options = [],
            View = React.createClass({
            displayName: 'View',

            render: function render() {
                var lang = this.state.lang;
                console.log('beginner');
                return React.createElement(
                    'div',
                    { className: 'panel beginner-panel' },
                    React.createElement(
                        'div',
                        { className: 'params horizontal-form' },
                        React.createElement(
                            'h2',
                            null,
                            React.createElement('span', { className: 'fa fa-clock-o' }),
                            '1 hr 30min'
                        ),
                        React.createElement(
                            'div',
                            { className: 'row-fluid clearfix' },
                            React.createElement(
                                'div',
                                { className: 'col span3' },
                                React.createElement('span', { className: 'param-icon fa fa-print' })
                            ),
                            React.createElement(
                                'div',
                                { className: 'param col span9' },
                                React.createElement(
                                    'h4',
                                    null,
                                    lang.print.params.beginner.print_speed.text
                                ),
                                React.createElement(
                                    'p',
                                    null,
                                    React.createElement(SelectView, { className: 'span12', options: lang.print.params.beginner.print_speed.options })
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'row-fluid clearfix' },
                            React.createElement(
                                'div',
                                { className: 'col span3' },
                                React.createElement('span', { className: 'param-icon fa fa-bullseye' })
                            ),
                            React.createElement(
                                'div',
                                { className: 'param col span9' },
                                React.createElement(
                                    'h4',
                                    null,
                                    lang.print.params.beginner.meterial.text
                                ),
                                React.createElement(
                                    'p',
                                    null,
                                    React.createElement(SelectView, { className: 'span12', options: lang.print.params.beginner.meterial.options })
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'row-fluid clearfix' },
                            React.createElement(
                                'div',
                                { className: 'col span3' },
                                React.createElement('span', { className: 'param-icon fa fa-check' })
                            ),
                            React.createElement(
                                'div',
                                { className: 'param col span9' },
                                React.createElement(
                                    'h4',
                                    null,
                                    lang.print.params.beginner.support.text
                                ),
                                React.createElement(
                                    'p',
                                    null,
                                    React.createElement(RadioGroupView, { name: 'support', options: lang.print.params.beginner.support.options })
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'row-fluid clearfix' },
                            React.createElement(
                                'div',
                                { className: 'col span3' },
                                React.createElement('span', { className: 'param-icon fa fa-check' })
                            ),
                            React.createElement(
                                'div',
                                { className: 'param col span9' },
                                React.createElement(
                                    'h4',
                                    null,
                                    lang.print.params.beginner.platform.text
                                ),
                                React.createElement(
                                    'p',
                                    null,
                                    React.createElement(RadioGroupView, { name: 'platform', options: lang.print.params.beginner.platform.options })
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'button',
                                { 'data-ga-event': 'show-print-advanced', className: 'btn btn-default span12' },
                                lang.print.advanced
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'button',
                            { 'data-ga-event': 'print-started', className: 'btn btn-default span12' },
                            lang.print.start_print
                        )
                    )
                );
            },

            getInitialState: function getInitialState() {
                return args.state;
            }

        });

        return View;
    };
});