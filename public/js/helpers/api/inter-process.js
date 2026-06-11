'use strict';

/**
 * API image tracer
 * Ref: none
 */
define(['helpers/websocket', 'app/actions/beambox', 'app/actions/beambox/svgeditor-function-wrapper', 'jsx!app/actions/beambox/Laser-Panel-Controller'], function (Websocket, BeamboxActions, FnWrapper, LaserPanelController) {
    'use strict';

    return function () {
        var ws = new Websocket({
            method: 'push-studio',
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
            onMessage: function onMessage(data) {
                if (data.svg) {
                    FnWrapper.insertSvg(data.svg, 'layer');
                }

                setTimeout(function () {
                    if (data.layerData) {
                        var layerDataJSON = JSON.parse(data.layerData);

                        for (var layerName in layerDataJSON) {
                            var _layerDataJSON$layerN = layerDataJSON[layerName],
                                name = _layerDataJSON$layerN.name,
                                speed = _layerDataJSON$layerN.speed,
                                power = _layerDataJSON$layerN.power;


                            LaserPanelController.funcs.writeSpeed(name, parseInt(speed));
                            LaserPanelController.funcs.writeStrength(name, parseInt(power));
                        }

                        BeamboxActions.updateLaserPanel();
                    }
                }, 50);
            },
            onError: function onError() {
                console.log('IP_ERROR');
            },
            onFatal: function onFatal() {
                console.log('FATAL');
            },
            onOpen: function onOpen() {
                console.log('Open interprocess socket! ');
            }
        };

        return {
            connection: ws
        };
    };
});