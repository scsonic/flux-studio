'use strict';

/**
 * Data history handler
 */
define(['helpers/array-findindex'], function () {
    'use strict';

    var History = function History(undefined) {
        var history = [];

        return {
            push: function push(name, data) {
                history.push({
                    name: name,
                    data: data
                });
            },
            pop: function pop() {
                return history.pop();
            },
            update: function update(name, data) {
                var filtered = history.filter(function (arr) {
                    return name === arr.name;
                });

                filtered.forEach(function (el) {
                    el.data = data;
                });

                return filtered.length;
            },
            findByName: function findByName(name) {
                return history.filter(function (arr) {
                    return name === arr.name;
                });
            },
            get: function get() {
                return history;
            },
            clearAll: function clearAll() {
                history = [];
            },
            deleteAt: function deleteAt(name) {
                var index = history.findIndex(function (obj) {
                    return obj.name === name;
                });

                if (-1 !== index) {
                    history.splice(index, 1);
                    return true;
                } else {
                    return false;
                }
            },
            getLatest: function getLatest() {
                return 0 < history.length ? history.slice(-1)[0] : undefined;
            },
            isEmpty: function isEmpty() {
                return 0 === history.length;
            }
        };
    };

    return function () {
        return new History(undefined);
    };
});