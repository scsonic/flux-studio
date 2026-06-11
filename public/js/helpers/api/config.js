'use strict';

/**
 * API config
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-config
 */
define(['helpers/websocket', 'helpers/local-storage'], function (Websocket, _localStorage) {
    'use strict';

    return function () {
        var stardardOptions = function stardardOptions(opts) {
            opts = opts || {};
            opts.onFinished = opts.onFinished || function () {};

            return opts;
        };

        return {
            connection: {},
            write: function write(key, value, opts) {
                opts = stardardOptions(opts);

                _localStorage.set(key, value);
                opts.onFinished();

                return this;
            },
            read: function read(key, opts) {
                var value = _localStorage.get(key);

                opts = stardardOptions(opts);

                opts.onFinished(value);

                return value;
            },

            update: function update(key, item_key, item_value) {
                var configs = this.read(key);
                if (configs === '') configs = {};
                configs[item_key] = item_value;
                this.write(key, configs);
            }
        };
    };
});