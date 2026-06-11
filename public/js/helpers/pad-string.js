'use strict';

define(function () {
    return function pad(str, length, left) {
        var spacer = '';
        for (var i = 0; i < length; i++) {
            spacer += ' ';
        }
        var newStr = left ? (spacer + str).slice(-length) : (str + spacer).slice(0, length);
        return newStr.split('').map(function (c) {
            return c === ' ' ? '&nbsp;' : c;
        }).join('');
    };
});