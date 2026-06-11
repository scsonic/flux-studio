'use strict';

/**
 * API fcode reader
 * Ref: https://github.com/flux3dp/fluxghost/wiki/fcode-reader
 */
define(['helpers/websocket', 'helpers/convertToTypedArray', 'helpers/data-history', 'helpers/api/set-params'], function (Websocket, convertToTypedArray, history, setParams) {
    'use strict';

    return function () {
        var ws = new Websocket({
            method: 'fcode-reader',
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
             * upload fcode
             *
             * @param {ArrayBuffer} data    - binary data with array buffer type
             * @param {Bool}        isGCode - fired when process finished
             */
            upload: function upload(data, isGcode) {
                var d = $.Deferred();
                events.onMessage = function (response) {
                    response.status === 'ok' ? d.resolve() : ws.send(data);
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.resolve(response);
                };

                ws.send('upload ' + (data.size || data.byteLength) + ' ' + (isGcode ? '-g' : '-f'));
                return d.promise();
            },

            /**
             * get thumbnail from the last uploaded fcode
             */
            getThumbnail: function getThumbnail() {
                var d = $.Deferred();
                var blobs = [],
                    totalLength = 0,
                    blob;

                events.onMessage = function (response) {
                    if ('complete' === response.status) {
                        totalLength = response.length;
                    } else if (response instanceof Blob) {
                        blobs.push(response);
                        blob = new Blob(blobs, { type: 'image/png' });
                        if (totalLength === blob.size) {
                            // onFinished(blob);
                            d.resolve(blob);
                        }
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.resolve(response);
                };

                ws.send('get_img');
                return d.promise();
            },

            /**
             * get metadata from the last uploaded fcode
             */
            getMetadata: function getMetadata() {
                var d = $.Deferred();

                events.onMessage = function (response) {
                    if ('complete' === response.status) {
                        d.resolve(response);
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.resolve(response);
                };

                ws.send('get_meta');
                return d.promise();
            },

            getPath: function getPath() {
                var d = $.Deferred();

                events.onMessage = function (response) {
                    d.resolve(response);
                };
                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.resolve(response);
                };

                ws.send('get_path');
                return d.promise();
            },

            getFCode: function getFCode() {
                var d = $.Deferred(),
                    totalLength = 0;

                events.onMessage = function (response) {
                    if (response.status === 'complete') {
                        totalLength = response.length;
                    } else if (response instanceof Blob) {
                        if (totalLength === response.size) {
                            d.resolve(response);
                        }
                    }
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.resolve(response);
                };

                ws.send('get_fcode');
                return d.promise();
            },

            changeImage: function changeImage(data) {
                var d = $.Deferred();

                events.onMessage = function (response) {
                    response.status === 'ok' ? d.resolve() : ws.send(data);
                };

                events.onError = function (response) {
                    d.reject(response);
                };
                events.onFatal = function (response) {
                    d.resolve(response);
                };

                ws.send('change_img ' + data.size);
                return d.promise();
            }
        };
    };
});