'use strict';

define(['react', 'jsx!widgets/Unit-Input-v2'], function (React, UnitInput) {

    var FontSize = function FontSize(_ref) {
        var currentFontSize = _ref.currentFontSize,
            onChange = _ref.onChange;

        return React.createElement(UnitInput, {
            min: 1,
            unit: 'px',
            decimal: 0,
            defaultValue: currentFontSize,
            getValue: onChange
        });
    };

    return FontSize;
});