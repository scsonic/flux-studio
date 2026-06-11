'use strict';

/**
 * API camera calibration
 * Ref: none
 */
define(['helpers/websocket'], function (Websocket) {
    'use strict';

    return function () {
        var ws = new Websocket({
            method: 'camera-calibration',
            onMessage: function onMessage(data) {
                events.onMessage(data);
            },
            onError: function onError(response) {
                events.onError(response);
            },
            onFatal: function onFatal(response) {
                events.onFatal(response);
            }
        }),
            events = {
            onMessage: function onMessage() {},
            onError: function onError() {},
            onFatal: function onFatal() {}
        };

        return {
            connection: ws,

            /**
             * @param {ArrayBuffer} data    - binary data with array buffer type
             */
            upload: function upload(data, opts) {
                opts = opts || {};
                var d = $.Deferred();
                events.onMessage = function (response) {
                    switch (response.status) {
                        case 'ok':
                            d.resolve(response);
                            break;
                        case 'fail':
                            d.resolve(response);
                            break;
                        case 'none':
                            d.resolve(response);
                            break;
                        case 'continue':
                            ws.send(data);
                            break;
                        default:
                            console.log('strange message', response);
                            break;
                    }
                };

                events.onError = function (response) {
                    d.reject(response);console.log('on error', response);
                };
                events.onFatal = function (response) {
                    d.reject(response);console.log('on fatal', response);
                };

                ws.send('upload ' + (data.size || data.byteLength));
                return d.promise();
            }
        };
    };
});