'use strict';

/**
 * API upnp-config
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-upnp-config-(wifi)
 */
define(['jquery', 'helpers/websocket', 'helpers/rsa-key', 'helpers/i18n', 'app/actions/alert-actions', 'app/actions/input-lightbox-actions', 'app/constants/input-lightbox-constants'], function ($, Websocket, rsaKey, i18n, AlertActions, InputLightboxActions, InputLightboxConstants) {
    'use strict';

    return function (uuid) {

        var stages = {
            UPLOAD: 'UPLOAD',
            CONNECTED: 'CONNECTED'
        },
            $deferred = $.Deferred(),
            lang = i18n.get(),
            currentStage = stages.UPLOAD,
            isReady = false,
            onMessage = function onMessage(messageHandler, response) {
            isReady = 'ok' === response.status;
            messageHandler(response);
        },
            onError = function onError(errorHandler, response) {
            isReady = true;
            errorHandler(response);
        },
            genericSender = function genericSender(command, messageHandler) {
            var timer = setInterval(function () {
                if (true === isReady) {
                    ws.send(command);
                    ws.onMessage(onMessage.bind(null, messageHandler));
                    clearInterval(timer);
                    isReady = false;
                }
            }, 0);
        },
            doConnect = function doConnect() {
            currentStage = stages.CONNECTED;

            ws.send(['connect', uuid].join(' '));
        },
            ws = new Websocket({
            method: 'upnp-config',
            autoReconnect: false,
            onOpen: function onOpen() {
                ws.send(['upload_key', rsaKey()].join(' '));
            },
            onMessage: function onMessage(response) {
                switch (currentStage) {
                    case stages.UPLOAD:
                        doConnect();
                        break;

                    case stages.CONNECTED:
                        $deferred.resolve();
                        isReady = true;
                        break;
                }
            },
            onError: function onError(response) {

                switch (response.error) {
                    case 'UPNP_PASSWORD_FAIL':
                        AlertActions.showPopupError(response.error, lang.initialize.set_machine_generic.incorrect_password);
                    case 'UPNP_CONNECTION_FAIL':
                        InputLightboxActions.open('need_password', {
                            type: InputLightboxConstants.TYPE_PASSWORD,
                            caption: lang.message.need_password,
                            confirmText: lang.initialize.confirm,
                            onSubmit: function onSubmit(password) {
                                $deferred.notify({
                                    status: 'waiting',
                                    plaintext_password: password
                                });
                                currentStage = stages.UPLOAD;
                                ws.send(['upload_password', password].join(' '));
                            }
                        });
                        break;
                }

                $deferred.notify(response);
            },
            onFatal: function onFatal(response) {
                if (0 < response.error.indexOf('not supported')) {
                    AlertActions.showPopupError('not-supported', lang.initialize.errors.not_support);
                } else {
                    AlertActions.showPopupError(response.error, lang.initialize.errors.not_support);
                }
            }
        });

        return {
            connection: ws,

            ready: function ready(callback) {
                return $deferred.done(callback).promise();
            },

            addKey: function addKey() {
                var $deferred = $.Deferred();

                genericSender('add_key', function (response) {
                    $deferred.resolve(response);
                });

                ws.onError(onError.bind(null, function (response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            },

            getWifiNetwork: function getWifiNetwork() {
                var $deferred = $.Deferred(),
                    strength = {
                    BEST: 'best',
                    GOOD: 'good',
                    POOR: 'poor',
                    BAD: 'bad'
                };

                genericSender('scan_wifi', function (data) {
                    data.items = data.items || [];

                    data.wifi.forEach(function (wifi, i) {
                        wifi.rssi = Math.abs(wifi.rssi || 0);

                        if (75 < wifi.rssi) {
                            data.wifi[i].strength = strength.BEST;
                        } else if (50 < strength) {
                            data.wifi[i].strength = strength.GOOD;
                        } else if (25 < strength) {
                            data.wifi[i].strength = strength.POOR;
                        } else {
                            data.wifi[i].strength = strength.BAD;
                        }

                        data.items.push({
                            security: data.wifi[i].security,
                            ssid: data.wifi[i].ssid,
                            password: '' !== data.wifi[i].security,
                            rssi: wifi.rssi,
                            strength: wifi.strength
                        });
                    });

                    $deferred.resolve(data);
                });

                ws.onError(onError.bind(null, function (response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            },

            setWifiNetwork: function setWifiNetwork(wifi, password, hiddenSSID) {
                var $deferred = $.Deferred(),
                    wifiConfig = {
                    wifi_mode: 'client',
                    ssid: wifi.ssid,
                    security: wifi.security,
                    method: 'dhcp'
                },
                    comamnd = ['config_network'];

                switch (wifiConfig.security.toUpperCase()) {
                    case 'WEP':
                        wifiConfig.wepkey = password;
                        break;
                    case 'WPA-PSK':
                    case 'WPA2-PSK':
                        wifiConfig.psk = password;
                        break;
                }

                if (hiddenSSID) {
                    wifiConfig.scan_ssid = '1';
                }
                comamnd.push(JSON.stringify(wifiConfig));

                genericSender(comamnd.join(' '), function (response) {
                    $deferred.resolve(response);
                });

                ws.onError(onError.bind(null, function (response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            },

            setAPMode: function setAPMode(ssid, pass) {
                var $deferred = $.Deferred(),
                    args = ['config_network', JSON.stringify({
                    ssid: ssid,
                    psk: pass,
                    security: 'WPA2-PSK',
                    wifi_mode: 'host',
                    method: 'dhcp'
                })],
                    comamnd = args.join(' ');

                genericSender(comamnd, function (response) {
                    $deferred.resolve(response);
                });

                ws.onError(onError.bind(null, function (response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            },

            name: function name(_name) {
                var $deferred = $.Deferred(),
                    comamnd = ['set_name', _name].join(' ');

                genericSender(comamnd, function (response) {
                    $deferred.resolve(response);
                });

                ws.onError(onError.bind(null, function (response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            },

            password: function password(old_pass, new_pass) {
                var $deferred = $.Deferred(),
                    comamnd = ['set_password', old_pass, new_pass].join(' ');

                if ('' !== old_pass && '' !== new_pass) {
                    genericSender(comamnd, function (response) {
                        $deferred.resolve(response);
                    });
                } else {
                    $deferred.resolve();
                }

                ws.onError(onError.bind(null, function (response) {
                    $deferred.reject(response);
                }));

                return $deferred.promise();
            }
        };
    };
});