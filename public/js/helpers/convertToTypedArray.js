'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * typed array convertor
 */
define(function () {
    'use strict';

    return function (arr, TypedArray) {
        var typedArray;

        if ('object' === (typeof typedArray === 'undefined' ? 'undefined' : _typeof(typedArray))) {
            // TODO: throw exception
        }

        typedArray = new TypedArray(arr.length);

        arr.forEach(function (value, i) {
            typedArray[i] = value;
        });

        return typedArray;
    };
});