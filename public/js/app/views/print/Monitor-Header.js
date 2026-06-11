'use strict';

define(['react', 'reactPropTypes', 'app/constants/global-constants', 'app/constants/device-constants'], function (React, PropTypes, GlobalConstants, DeviceConstants) {

    return React.createClass({
        PropTypes: {
            name: PropTypes.string,
            source: PropTypes.string,
            history: PropTypes.array,
            onBackClick: PropTypes.func,
            onFolderClick: PropTypes.func,
            onCloseClick: PropTypes.func
        },

        contextTypes: {
            store: PropTypes.object
        },

        componentWillMount: function componentWillMount() {
            var _this = this;

            var store = this.context.store;


            this.unsubscribe = store.subscribe(function () {
                _this.forceUpdate();
            });
        },

        componentWillUpdate: function componentWillUpdate() {
            return false;
        },

        componentWillUnmount: function componentWillUnmount() {
            this.unsubscribe();
        },

        _renderNavigation: function _renderNavigation() {
            var _this2 = this;

            var _context$store$getSta = this.context.store.getState(),
                Monitor = _context$store$getSta.Monitor,
                Device = _context$store$getSta.Device,
                history = this.props.history,
                source = this.props.source;

            var back = function back() {
                return React.createElement(
                    'div',
                    { className: 'back', onClick: _this2.props.onBackClick },
                    React.createElement('i', { className: 'fa fa-angle-left' })
                );
            };

            var folder = function folder() {
                return React.createElement(
                    'div',
                    { className: 'back', onClick: _this2.props.onFolderClick },
                    React.createElement('img', { src: 'img/folder.svg' })
                );
            };

            var none = function none() {
                return React.createElement('div', null);
            };

            if (source === GlobalConstants.DEVICE_LIST) {
                var go = {};

                go[GlobalConstants.CAMERA] = function () {
                    return back();
                };

                go[GlobalConstants.FILE] = function () {
                    if (Device.status.st_id === DeviceConstants.status.IDLE) {
                        return history.length >= 1 ? back() : none();
                    }
                    return back();
                };

                if (typeof go[Monitor.mode] === 'function') {
                    return go[Monitor.mode]();
                } else {
                    return history.length > 1 ? back() : folder();
                }
            } else {
                return Monitor.mode === GlobalConstants.PREVIEW && history.length === 0 ? folder() : back();
            };
        },

        render: function render() {
            var nav = this._renderNavigation();

            return React.createElement(
                'div',
                { className: 'header' },
                React.createElement(
                    'div',
                    { className: 'title' },
                    React.createElement(
                        'span',
                        null,
                        this.props.name
                    ),
                    React.createElement(
                        'div',
                        { className: 'close', onClick: this.props.onCloseClick },
                        React.createElement('div', { className: 'x' })
                    ),
                    nav
                )
            );
        }

    });
});