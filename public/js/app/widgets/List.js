'use strict';

define(['react'], function (React) {
    'use strict';

    return React.createClass({

        getDefaultProps: function getDefaultProps() {
            return {
                name: '',
                id: '',
                emptyMessage: '',
                className: '',
                items: [],
                onClick: function onClick() {},
                ondblclick: function ondblclick() {}
            };
        },

        render: function render() {

            var list_items = this.props.items.map(function (opt, i) {
                var metadata = JSON.stringify(opt.data),
                    labelItem = opt.label;
                if (labelItem.item) labelItem = labelItem.item;
                return React.createElement(
                    'li',
                    { 'data-meta': metadata, 'data-value': opt.value, key: i },
                    labelItem
                );
            }, this);

            return React.createElement(
                'ul',
                {
                    name: this.props.name,
                    id: this.props.id,
                    className: this.props.className,
                    'data-empty-message': this.props.emptyMessage,
                    onClick: this.props.onClick,
                    onDoubleClick: this.props.ondblclick },
                list_items
            );
        }
    });
});