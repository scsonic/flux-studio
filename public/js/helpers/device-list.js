'use strict';

define(['helpers/local-storage'], function (LocalStorage) {
    return function (deviceListObject) {
        var bl = LocalStorage.get('black-list');
        if (bl !== '') {
            var list = bl.split(',');
            return Object.keys(deviceListObject).filter(function (o) {
                return list.indexOf(deviceListObject[o].name) === -1;
            }).map(function (p) {
                return deviceListObject[p];
            });
        }
        return Object.keys(deviceListObject).filter(function (k) {
            return k !== '';
        }).map(function (p) {
            return deviceListObject[p];
        });
    };
});