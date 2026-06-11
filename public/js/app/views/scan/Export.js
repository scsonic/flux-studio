'use strict';

define(['react', 'jsx!widgets/Radio-Group'], function (React, RadioGroupView) {
    'use strict';

    return React.createClass({

        getDefaultProps: function getDefaultProps() {
            return {
                lang: {},
                onExport: function onExport() {}
            };
        },

        _onExport: function _onExport(e) {
            this.props.onExport(e);
        },

        render: function render() {
            var lang = this.props.lang;

            return React.createElement(
                'div',
                { className: 'scan-model-save-as absolute-center' },
                React.createElement(
                    'h4',
                    { className: 'caption' },
                    lang.scan.save_as
                ),
                React.createElement(RadioGroupView, { className: 'file-formats clearfix', name: 'file-format', options: lang.scan.save_mode }),
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'button',
                        { 'data-ga-event': 'scan-export-to-file', className: 'btn btn-default', onClick: this._onExport },
                        lang.scan.do_save
                    )
                )
            );
        }
    });
});