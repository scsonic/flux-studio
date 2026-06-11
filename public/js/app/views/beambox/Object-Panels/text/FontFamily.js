'use strict';

define(['react', 'app/actions/beambox/font-funcs'], function (React, FontFuncs) {

    var FontFamily = function FontFamily(_ref) {
        var currentFontFamily = _ref.currentFontFamily,
            fontFamilyOptions = _ref.fontFamilyOptions,
            _onChange = _ref.onChange;

        var options = fontFamilyOptions.map(function (option) {
            return React.createElement(
                'option',
                { value: option, key: option },
                FontFuncs.fontNameMap.get(option)
            );
        });
        return React.createElement(
            'select',
            {
                value: currentFontFamily,
                onChange: function onChange(e) {
                    _onChange(e.target.value);
                },
                onKeyDown: function onKeyDown(e) {
                    return e.stopPropagation();
                },
                style: {
                    lineHeight: '1.5em'
                }
            },
            options
        );
    };

    return FontFamily;
});