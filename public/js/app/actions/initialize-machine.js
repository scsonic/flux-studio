'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * initialize machine helper
 */
define(['helpers/api/config', 'helpers/local-storage', 'app/app-settings'], function (config, _localStorage, settings) {
    'use strict';

    var methods = {
        reset: function reset(callback) {
            callback = 'function' === typeof callback ? callback : function () {};
            config().write('printer-is-ready', false);
            callback();
        },
        completeSettingUp: function completeSettingUp(redirect) {
            var d = $.Deferred();
            var completed = methods.hasBeenCompleted();

            redirect = 'boolean' === typeof redirect ? redirect : true;

            // add laser-default
            config().write('laser-defaults', JSON.stringify(settings.laser_default));

            config().write('printer-is-ready', true, {
                onFinished: function onFinished() {
                    methods.settedPrinter.add(methods.settingPrinter.get());

                    methods.settingPrinter.clear();
                    methods.settingWifi.clear();

                    if (true === redirect) {
                        location.hash = '#studio/' + (config().read('default-app') || 'print');
                    }
                    d.resolve();
                }
            });
            return d.promise();
        },
        hasBeenCompleted: function hasBeenCompleted() {
            // If you initialized before and you're not in initialization screen
            return 'true' === config().read('printer-is-ready') && !~location.href.indexOf('initialize/');
        },
        settingPrinter: {
            get: function get() {
                return _localStorage.get('setting-printer');
            },
            set: function set(printer) {
                _localStorage.set('setting-printer', printer);
            },
            clear: function clear() {
                _localStorage.removeAt('setting-printer');
            }
        },
        settedPrinter: {
            get: function get() {
                return _localStorage.get('printers') || [];
            },
            set: function set(printers) {
                _localStorage.set('printers', printers);
            },
            add: function add(printer) {
                var settedPrinters = methods.settedPrinter.get(),
                    findPrinter = function findPrinter(existingPrinter) {
                    return existingPrinter.uuid === printer.uuid;
                };

                if ('object' === (typeof printer === 'undefined' ? 'undefined' : _typeof(printer)) && false === settedPrinters.some(findPrinter)) {
                    settedPrinters.push(printer);
                }

                _localStorage.set('printers', JSON.stringify(settedPrinters));
            },
            removeAt: function removeAt(printer) {
                var settedPrinters = methods.settedPrinter.get(),
                    survivalPrinters = [];

                settedPrinters.forEach(function (el) {
                    if (el.uuid !== printer.uuid) {
                        survivalPrinters.push(el);
                    }
                });

                methods.settedPrinter.set(survivalPrinters);
            },
            clear: function clear() {
                _localStorage.removeAt('printers');
            }
        },
        settingWifi: {
            get: function get() {
                return _localStorage.get('setting-wifi') || {};
            },
            set: function set(wifi) {
                _localStorage.set('setting-wifi', wifi);
            },
            clear: function clear() {
                _localStorage.removeAt('setting-wifi');
            }
        },
        defaultPrinter: {
            set: function set(printer) {
                config().write('default-printer', JSON.stringify(printer));
            },
            exist: function exist() {
                var defaultPrinter = config().read('default-printer') || {};

                return 'string' === typeof defaultPrinter.uuid;
            },
            get: function get() {
                return config().read('default-printer') || {};
            },
            clear: function clear() {
                _localStorage.removeAt('default-printer');
            }
        }
    };

    return methods;
});