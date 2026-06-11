'use strict';

define(['helpers/websocket'], function (Websocket) {
    var CHANNELS = {},
        TEST = void 0,
        interval = 3000,
        WS = void 0;

    // callback should receive opened usb channel, -1 if not available
    return function (callback) {

        var channelToOpen = void 0,
            notifyChange = false;

        var manageChannel = function manageChannel(availableChannels) {
            var _channels = {};
            var channelHasChanged = Object.keys(CHANNELS).length !== Object.keys(_channels).length;
            var knownChannel = function knownChannel(c) {
                return Object.keys(CHANNELS).indexOf(c) >= 0;
            };

            Object.keys(availableChannels).forEach(function (c) {
                if (knownChannel(c)) {
                    _channels[c] = CHANNELS[c];
                } else {
                    _channels[c] = availableChannels[c];
                    _channels[c].connected = true;
                }
                if (!availableChannels[c]) {
                    _channels[c] = {
                        connected: false
                    };
                }
            });

            if (channelHasChanged) {
                notifyChange = true;
            }
            CHANNELS = _channels;
        };

        var nextUnopenedChannel = function nextUnopenedChannel() {
            var _channel = '';
            Object.keys(CHANNELS).forEach(function (c) {
                if (!CHANNELS[c].connected && !CHANNELS[c].hasError) {
                    _channel = c;
                }
            });

            return _channel;
        };

        var processResult = function processResult(response) {
            var _handleList = function _handleList() {
                var _interval = interval;
                var DetectedUSBCable = Object.keys(response.h2h).length > 0;

                // record new channels, remove unavailable channels
                manageChannel(response.h2h);

                if (DetectedUSBCable) {
                    channelToOpen = nextUnopenedChannel();
                    if (channelToOpen !== '') {
                        _interval = 2 * interval;
                        setTimeout(function () {
                            WS.send('open ' + channelToOpen);
                        }, interval);
                    }
                }
                setTimeout(function () {
                    WS.send('list');
                }, _interval);
            };

            var _handleOpen = function _handleOpen() {
                if (response.status === 'error') {
                    // if port has been opened
                    var error = response.error.join('');
                    console.log('error', error);

                    if (error === 'RESOURCE_BUSY') {
                        // weird logic. need to fix
                        console.log('usb connected and opened!');
                        notifyChange = true;
                        CHANNELS[channelToOpen].connected = false;
                    } else if (error === 'TIMEOUT') {
                        console.log('usb connect timeout!');
                        notifyChange = true;
                        CHANNELS[channelToOpen].connected = false;
                    }
                }

                if (response.devopen) {
                    CHANNELS[response.devopen].connected = true;
                    CHANNELS[response.devopen].profile = response.profile;
                    CHANNELS[response.devopen].profile.source = 'h2h';
                    CHANNELS[response.devopen].profile.addr = response.devopen;
                    notifyChange = true;
                }
            };

            if (response.cmd === 'list') {
                _handleList();
            } else if (response.cmd === 'open') {
                _handleOpen();
            }

            if (notifyChange) {
                notifyChange = false;
                callback(CHANNELS);
            }
        };

        if (!WS) {
            WS = new Websocket({
                method: 'usb/interfaces',
                onMessage: processResult,
                onError: function onError() {},
                onFatal: function onFatal() {
                    console.log('usb checker onFatal');
                }
            });
        }

        WS.send('list');
    };
});