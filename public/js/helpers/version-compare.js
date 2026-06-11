'use strict';

define(function () {
    var padArrayWithZero = function padArrayWithZero(arr, length) {
        while (arr.length < length) {
            arr.push('0');
        }
        return arr;
    };

    return function (currVer, promoteVer) {
        currVer = currVer || '0.0.0';
        promoteVer = promoteVer || '0.0.0';

        if (currVer === promoteVer) {
            return false;
        }

        var currVerArr = currVer.split('.');
        var promoteVerArr = promoteVer.split('.');

        var len = Math.max(currVerArr.length, promoteVerArr.length);

        currVerArr = padArrayWithZero(currVerArr, len);
        promoteVerArr = padArrayWithZero(promoteVerArr, len);

        for (var i = 0; i < len; i++) {
            var proVal = promoteVerArr[i],
                curVal = currVerArr[i];
            if (proVal < curVal) {
                return false;
            } else if (proVal > curVal) {
                return true;
            }
        }
        return false;
    };
});