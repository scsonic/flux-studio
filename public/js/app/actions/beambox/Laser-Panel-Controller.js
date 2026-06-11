'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['react', 'reactDOM', 'jsx!views/beambox/Right-Panels/Laser-Panel', 'reactCreateReactClass'], function (React, ReactDOM, LaserPanel) {

    var _defaultConfig = {
        configName: '',
        speed: 50,
        strength: 15,
        repeat: 1
    };

    var _tracedImageConfig = {
        configName: '',
        speed: 200,
        strength: 20,
        repeat: 1
    };

    var _tracedPathConfig = {
        configName: '',
        speed: 5,
        strength: 70,
        repeat: 1
    };

    var _getConfig = function _getConfig(name) {
        switch (name) {
            case 'Traced Image':
                return _tracedImageConfig;
            case 'Traced Path':
                return _tracedPathConfig;
            default:
                return _defaultConfig;
        }
    };

    var _getLayer = function _getLayer(name) {
        var layer = $('#svgcontent').find('g.layer').filter(function () {
            return $(this).find('title').text() === name;
        });
        return layer;
    };
    var _getData = function _getData(name, attr) {
        var val = _getLayer(name).attr('data-' + attr);
        val = val || _writeData(name, attr, _getConfig(name)[attr]);
        return val;
    };
    var _writeData = function _writeData(name, attr, val) {
        return _getLayer(name).attr('data-' + attr, val);
    };

    var _getSpeed = function _getSpeed(name) {
        return _getData(name, 'speed');
    };

    var _getStrength = function _getStrength(name) {
        return _getData(name, 'strength');
    };

    var _getRepeat = function _getRepeat(name) {
        return _getData(name, 'repeat');
    };

    var getConfigName = function getConfigName(name) {
        return _getData(name, 'configName');
    };

    var resetConfigName = function resetConfigName(name) {
        return _writeData(nane, '', val);
    };

    var writeSpeed = function writeSpeed(name, val) {
        return _writeData(name, 'speed', val);
    };

    var writeStrength = function writeStrength(name, val) {
        return _writeData(name, 'strength', val);
    };

    var writeRepeat = function writeRepeat(name, val) {
        return _writeData(name, 'repeat', val);
    };

    var writeConfigName = function writeConfigName(name, val) {
        return _writeData(name, 'configName', val);
    };

    var LaserPanelController = function () {
        function LaserPanelController() {
            _classCallCheck(this, LaserPanelController);

            this.reactRoot = '';
            this.funcs = {
                writeSpeed: writeSpeed,
                writeStrength: writeStrength,
                writeRepeat: writeRepeat,
                writeConfigName: writeConfigName
            };
        }

        _createClass(LaserPanelController, [{
            key: 'init',
            value: function init(reactRoot) {
                this.reactRoot = reactRoot;
            }
        }, {
            key: 'initConfig',
            value: function initConfig(name) {
                _getSpeed(name, _getConfig(name).speed);
                _getStrength(name, _getConfig(name).strength);
                _getRepeat(name, _getConfig(name).repeat);
            }
        }, {
            key: 'cloneConfig',
            value: function cloneConfig(name, baseName) {
                writeSpeed(name, _getSpeed(baseName));
                writeStrength(name, _getStrength(baseName));
                writeRepeat(name, _getRepeat(baseName));
                writeConfigName(name, getConfigName(baseName));
            }
        }, {
            key: 'render',
            value: function render(name) {
                var speed = _getSpeed(name);
                var strength = _getStrength(name);
                var repeat = _getRepeat(name);
                var configName = getConfigName(name);

                ReactDOM.render(React.createElement(LaserPanel, {
                    configName: configName,
                    layerName: name,
                    speed: speed,
                    strength: strength,
                    repeat: repeat,
                    funcs: this.funcs
                }), document.getElementById(this.reactRoot));
            }
        }]);

        return LaserPanelController;
    }();

    var instance = new LaserPanelController();

    return instance;
});