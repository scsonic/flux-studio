'use strict';

/**
 * API image tracer
 * Ref: none
 */
define(['helpers/websocket', 'app/actions/beambox'], function (Websocket, BeamboxActions) {
    'use strict';

    return function () {
        var ws = new Websocket({
            method: 'image-tracer',
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

                ws.send('image_trace ' + (data.size || data.byteLength) + ' ' + opts.threshold);
                return d.promise();
            }

            /**
             * @param {ArrayBuffer} data    - binary data with array buffer type
             */

        };
    };
});