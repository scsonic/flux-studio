'use strict';

define(['react'], function (React) {
    'use strict';

    return React.createClass({

        render: function render() {
            var options = this.props.options.map(function (opt, i) {
                var checked = false;

                if (opt.checked === true || opt.checked === 'checked') {
                    checked = true;
                }

                return React.createElement(
                    'label',
                    null,
                    React.createElement('input', { type: 'radio', defaultChecked: checked, name: this.props.name, value: opt.value }),
                    opt.label
                );
            }, this);

            return React.createElement(
                'div',
                {
                    id: this.props.id,
                    className: this.props.className
                },
                options
            );
        }
    });
});