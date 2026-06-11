'use strict';

define(['react'], function (React) {
    return function (_ref) {
        var currentIsFill = _ref.currentIsFill,
            onChange = _ref.onChange;

        return React.createElement(
            'label',
            { className: 'shading-checkbox', onClick: function onClick() {
                    return onChange(!currentIsFill);
                } },
            React.createElement('i', { className: currentIsFill ? 'fa fa-toggle-on' : 'fa fa-toggle-off' })
        );
    };
});