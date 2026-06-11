'use strict';

define(['react', 'plugins/classnames/index'], function (React, ClassNames) {

    var FontStyle = function FontStyle(_ref) {
        var currentFontStyle = _ref.currentFontStyle,
            fontStyleOptions = _ref.fontStyleOptions,
            _onChange = _ref.onChange;

        var options = fontStyleOptions.map(function (option) {
            return React.createElement(
                'option',
                { key: option, value: option },
                option
            );
        });
        var onlyOneOption = options.length === 1;
        return React.createElement(
            'select',
            {
                value: currentFontStyle,
                onChange: function onChange(e) {
                    return _onChange(e.target.value);
                },
                onKeyDown: function onKeyDown(e) {
                    return e.stopPropagation();
                },
                className: ClassNames({ 'no-triangle': onlyOneOption }),
                disabled: onlyOneOption,
                style: {
                    lineHeight: '1.5em'
                }
            },
            options
        );
    };

    return FontStyle;
});