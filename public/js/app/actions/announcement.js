'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['react', 'reactDOM', 'jsx!widgets/Modal'], function (React, ReactDOM, Modal) {
    var Announcement = function () {
        function Announcement() {
            _classCallCheck(this, Announcement);
        }

        _createClass(Announcement, [{
            key: 'init',
            value: function init(reactRoot) {
                this.reactRoot = reactRoot;
                this.contents = new Map();
            }
        }, {
            key: 'post',
            value: function post(reactComponent, key) {
                if (!key) {
                    console.warn('please enter key! announcement.jsx use the key to remove the post in case of there are several posts at the same time');
                    return;
                }
                if (this.contents.has(key)) {
                    console.warn('duplicate key! announcement.jsx use the key to remove the post in case of there are several posts at the same time');
                    return;
                }
                this.contents.set(key, reactComponent);
                this.render();
            }
        }, {
            key: 'unpost',
            value: function unpost(key) {
                this.contents.delete(key);
                this.render();
            }
        }, {
            key: 'stopPropagation',
            value: function stopPropagation(e) {
                console.log('stopProㄇpagation of:', e);
                e.stopPropagation();
            }

            //because this is not a react component, this is not a react render function of course.

        }, {
            key: 'render',
            value: function render() {
                if (this.contents.size === 0) {
                    ReactDOM.unmountComponentAtNode(document.getElementById(this.reactRoot));
                } else {
                    var content = React.createElement(
                        'div',
                        { className: 'modal-alert' },
                        [].concat(_toConsumableArray(this.contents.values()))
                    );
                    ReactDOM.render(React.createElement(
                        'div',
                        { className: 'always-top' },
                        React.createElement(Modal, {
                            className: { 'shadow-modal': true, 'camera-calibration': true },
                            content: content,
                            disabledEscapeOnBackground: false,
                            onKeyDown: this.stopPropagation
                        })
                    ), document.getElementById(this.reactRoot));
                }
            }
        }]);

        return Announcement;
    }();

    var instance = new Announcement();

    return instance;
});