"use strict";

define([], function () {
    return function (url, onMessage, onError) {
        return new Promise(function (resolve) {
            var ws = new WebSocket(url);

            ws.onopen = function () {
                resolve(ws);
            };

            ws.onmessage = function (response) {
                onMessage(response);
            };

            ws.onerror = function (response) {
                onError(response);
            };
        });
    };
});