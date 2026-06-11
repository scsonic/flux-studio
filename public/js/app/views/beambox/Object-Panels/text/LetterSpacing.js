'use strict';

define(['react', 'jsx!widgets/Unit-Input-v2'], function (React, UnitInput) {

    var LetterSpacing = function LetterSpacing(_ref) {
        var currentLetterSpacing = _ref.currentLetterSpacing,
            onChange = _ref.onChange;

        return React.createElement(UnitInput, {
            unit: 'em',
            step: 0.05,
            defaultValue: currentLetterSpacing,
            getValue: onChange
        });
    };

    return LetterSpacing;
});