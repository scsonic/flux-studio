'use strict';

/**
 * API discover
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-discover
 */
define(['helpers/websocket', 'app/actions/initialize-machine', 'helpers/api/config', 'helpers/device-list', 'helpers/logger', 'helpers/smart-upnp', 'helpers/api/cloud'], function (Websocket, initializeMachine, Config, DeviceList, Logger, SmartUpnp, CloudApi) {
    'use strict';

    var ws = ws || new Websocket({
        method: 'discover'
    }),
        discoverLogger = new Logger('discover'),
        printers = [],
        dispatchers = [],
        idList = [],
        _devices = {},
        existDefaultPrinter = initializeMachine.defaultPrinter.exist(),
        defaultPrinter = initializeMachine.defaultPrinter.get(),
        sendFoundPrinter = function sendFoundPrinter() {
        discoverLogger.clear().append(_devices);

        dispatchers.forEach(function (dispatcher) {
            dispatcher.sender(_devices);
        });
    },
        findIndex = function findIndex(base, target) {
        return base.uuid === target.uuid;
    },
        onMessage = function onMessage(device) {
        if (device.alive) {
            if (device.source === 'h2h') {
                device.h2h_uuid = device.uuid;
                device.uuid = device.addr.toString();
            }

            var _pokeIPAddr = localStorage.getItem('poke-ip-addr');

            if (_pokeIPAddr && _pokeIPAddr !== '') {
                var pokeIPAddrArr = _pokeIPAddr.split(/[,;] ?/);

                if (pokeIPAddrArr.indexOf(device.ipaddr) === -1) {
                    if (pokeIPAddrArr.length > 19) {
                        _pokeIPAddr = pokeIPAddrArr.slice(pokeIPAddrArr.length - 19, pokeIPAddrArr.length);
                    }

                    localStorage.setItem('poke-ip-addr', _pokeIPAddr + ', ' + device.ipaddr);
                }
            } else {
                localStorage.setItem('poke-ip-addr', device.ipaddr);
            }

            _devices[device.uuid] = device;

            //SmartUpnp.addSolidIP(device.ip);
        } else {
            if (typeof _devices[device.uuid] === 'undefined') {
                delete _devices[device.uuid];
            }
        }

        //    if (existDefaultPrinter && device.uuid === defaultPrinter.uuid ) {
        //        initializeMachine.defaultPrinter.set(device);
        //    }

        clearTimeout(timer);
        timer = setTimeout(function () {
            printers = DeviceList(_devices);
            sendFoundPrinter();
        }, BUFFER);
    },
        poke = function poke(targetIP) {
        if (targetIP == null) {
            return;
        };
        printers = [];
        _devices = {};
        ws.send(JSON.stringify({ 'cmd': 'poke', 'ipaddr': targetIP }));
    },
        BUFFER = 100,
        pokeIPAddr = localStorage.getItem('poke-ip-addr'),
        pokeIPs = pokeIPAddr ? pokeIPAddr.split(/[,;] ?/) : [''],
        timer;

    if ('' === pokeIPs[0]) {
        Config().write('poke-ip-addr', '192.168.1.1');
        pokeIPs = ['192.168.1.1'];
    }

    ws.onMessage(onMessage);

    var self = function self(id, getPrinters) {
        getPrinters = getPrinters || function () {};

        var index = idList.indexOf(id);

        if (0 === idList.length || -1 === index) {
            idList.push(id);
            dispatchers.push({
                id: id,
                sender: getPrinters
            });
        } else {
            dispatchers[index] = {
                id: id,
                sender: getPrinters
            };
        }

        // force callback always executed after return
        setTimeout(function () {
            if (0 < printers.length) {
                getPrinters(printers);
            }
        }, 0);

        return {
            connection: ws,
            poke: poke,
            countDevices: function countDevices() {
                var count = 0;
                for (var i in _devices) {
                    count++;
                }return count;
            },
            removeListener: function removeListener(_id) {
                var _index = idList.indexOf(_id);
                idList.splice(_index, 1);
                dispatchers.splice(_index, 1);
            },
            sendAggressive: function sendAggressive() {
                ws.send('aggressive');
            },
            getLatestPrinter: function getLatestPrinter(printer) {
                return _devices[printer.uuid];
            }
        };
    };

    SmartUpnp.init(self());
    for (var i in pokeIPs) {
        SmartUpnp.startPoke(pokeIPs[i]);
    }

    CloudApi.getDevices().then(function (resp) {
        if (resp.ok) {
            resp.json().then(function (content) {
                if (content.devices) {
                    content.devices.map(function (device) {
                        console.log(device.alias, device.ip_addr);
                        if (device.ip_addr) {
                            // console.log("Start poking cloud device IP:", device.ip_addr);
                            SmartUpnp.startPoke(device.ip_addr.trim().replace(/\u0000/g, ''));
                        }
                    });
                }
            });
        }
    });

    return self;
});