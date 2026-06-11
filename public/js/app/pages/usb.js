'use strict';

define(['jquery', 'react'], function ($, React) {
    'use strict';

    return function (args) {
        args = args || {};

        var view = React.createClass({
            displayName: 'view',

            _handleSlideToggle: function _handleSlideToggle(e) {
                var _target = e.target.attributes["data-target"].value;
                $('#' + _target).slideToggle();
            },
            render: function render() {
                var lang = args.state.lang;

                return React.createElement(
                    'div',
                    { className: 'usb' },
                    React.createElement(
                        'div',
                        { className: 'usb-sidebar' },
                        React.createElement(
                            'div',
                            { className: 'usb-sidebar-header' },
                            'My Drive'
                        ),
                        React.createElement(
                            'div',
                            { className: 'usb-sidebar-body' },
                            React.createElement(
                                'div',
                                { className: 'folder' },
                                React.createElement(
                                    'div',
                                    { className: 'folder-icon' },
                                    React.createElement('img', { src: 'img/icon-folder.png', height: '30px' })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'folder-name' },
                                    'Folder Name'
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'expand-icon' },
                                    React.createElement('img', { src: 'img/icon-arrow-d.png', height: '35px' })
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'folder' },
                                React.createElement(
                                    'div',
                                    { className: 'folder-icon' },
                                    React.createElement('img', { src: 'img/icon-folder.png', height: '30px' })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'folder-name' },
                                    'Folder Name'
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'expand-icon' },
                                    React.createElement('img', { src: 'img/icon-arrow-d.png', height: '35px', 'data-target': 'exp', onClick: this._handleSlideToggle })
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'hide', id: 'exp' },
                                React.createElement(
                                    'div',
                                    { className: 'file level2' },
                                    React.createElement(
                                        'div',
                                        { className: 'file-icon' },
                                        React.createElement('img', { src: 'http://placehold.it/35x35' })
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'file-name' },
                                        'file1.gcode'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'file level2' },
                                    React.createElement(
                                        'div',
                                        { className: 'file-icon' },
                                        React.createElement('img', { src: 'http://placehold.it/35x35' })
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'file-name' },
                                        'file2.gcode'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'file level2' },
                                    React.createElement(
                                        'div',
                                        { className: 'file-icon' },
                                        React.createElement('img', { src: 'http://placehold.it/35x35' })
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'file-name' },
                                        'file3.gcode'
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'file' },
                                React.createElement(
                                    'div',
                                    { className: 'file-icon' },
                                    React.createElement('img', { src: 'http://placehold.it/35x35' })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'file-name' },
                                    'file1.gcode'
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'file' },
                                React.createElement(
                                    'div',
                                    { className: 'file-icon' },
                                    React.createElement('img', { src: 'http://placehold.it/35x35' })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'file-name' },
                                    'file2.gcode'
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'file' },
                                React.createElement(
                                    'div',
                                    { className: 'file-icon' },
                                    React.createElement('img', { src: 'http://placehold.it/35x35' })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'file-name' },
                                    'file3.gcode'
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'usb-sidebar-footer' },
                            React.createElement(
                                'a',
                                { className: 'btn btn-print green full-width align-bottom no-border-radius' },
                                'Print'
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'file-content' },
                        React.createElement('div', { className: 'main-content' }),
                        React.createElement(
                            'div',
                            { className: 'file-detail align-bottom' },
                            React.createElement(
                                'div',
                                { className: 'file-name' },
                                'file1.gcode'
                            ),
                            React.createElement(
                                'div',
                                { className: 'detail-info' },
                                React.createElement(
                                    'div',
                                    { className: 'row-fluid' },
                                    React.createElement(
                                        'div',
                                        { className: 'span2 info-header' },
                                        'Size'
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'span8 info-content' },
                                        '100 MB'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'row-fluid' },
                                    React.createElement(
                                        'div',
                                        { className: 'span2 info-header' },
                                        'Created'
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'span8 info-content' },
                                        'xxxx/xx/xx, xx:xx AM'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'row-fluid' },
                                    React.createElement(
                                        'div',
                                        { className: 'span2 info-header' },
                                        'Modified'
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'span8 info-content' },
                                        'xxxx/xx/xx, xx:xx AM'
                                    )
                                )
                            )
                        )
                    )
                );
            }
        });

        return view;
    };
});