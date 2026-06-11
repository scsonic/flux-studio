"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define([], function () {
    var MENU_ITEMS = ["IMPORT", "EXPORT_FLUX_TASK", "SAVE_SCENE", "UNDO", "DUPLICATE", "SCALE", "ROTATE", "RESET", "ALIGN_CENTER", "CLEAR_SCENE", "TUTORIAL"];

    var ipc, events, defaultAction, currentHandler;

    if (window["electron"]) {
        ipc = window.electron.ipc;
        events = window.electron.events;

        defaultAction = {
            PREFERENCE: function PREFERENCE() {
                location.hash = '#studio/settings';
            },
            ADD_NEW_MACHINE: function ADD_NEW_MACHINE() {
                location.hash = '#initialize/wifi/select-machine-type';
            },
            RELOAD_APP: function RELOAD_APP() {
                location.reload();
            }
        };

        ipc.on(events.MENU_CLICK, function (event, menuItem) {
            for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                args[_key - 2] = arguments[_key];
            }

            var action = defaultAction[menuItem.id];
            if (action) {
                action.apply(undefined, [menuItem.id].concat(args));
            } else if (currentHandler) {
                var _currentHandler;

                (_currentHandler = currentHandler).trigger.apply(_currentHandler, [menuItem.id].concat(args));
            }
        });
    }

    var GlobalInteraction = function () {
        function GlobalInteraction() {
            _classCallCheck(this, GlobalInteraction);

            this._actions = {};
        }

        _createClass(GlobalInteraction, [{
            key: "attach",
            value: function attach(enabled_items) {
                currentHandler = this;
                if (ipc) {
                    if (enabled_items) {
                        var disabled_items = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = MENU_ITEMS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var item = _step.value;

                                if (enabled_items.indexOf(item) < 0) {
                                    disabled_items.push(item);
                                }
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        this.enableMenuItems(enabled_items);
                        this.disableMenuItems(disabled_items);
                    } else {
                        this.disableMenuItems(MENU_ITEMS);
                    }
                }
            }
        }, {
            key: "detach",
            value: function detach() {
                if (currentHandler === this) {
                    currentHandler = undefined;
                    this.disableMenuItems(MENU_ITEMS);
                }
            }
        }, {
            key: "enableMenuItems",
            value: function enableMenuItems(items) {
                if (ipc) {
                    ipc.send(events.ENABLE_MENU_ITEM, items);
                }
            }
        }, {
            key: "disableMenuItems",
            value: function disableMenuItems(items) {
                if (ipc) {
                    ipc.send(events.DISABLE_MENU_ITEM, items);
                }
            }
        }, {
            key: "trigger",
            value: function trigger(eventName) {
                var action = this._actions[eventName];
                if (action) {
                    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                        args[_key2 - 1] = arguments[_key2];
                    }

                    action.apply(undefined, [eventName].concat(args));
                    return true;
                } else {
                    return false;
                }
            }
        }]);

        return GlobalInteraction;
    }();

    return GlobalInteraction;
});