'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['helpers/api/config'], function (Config) {

    var DEFAULT_PREFERENCE = {
        'should_remind_calibrate_camera': true,
        'mouse_input_device': process.platform === 'darwin' ? 'TOUCHPAD' : 'MOUSE',
        'model': 'fbb1b',
        'show_guides': false,
        'guide_x0': 0,
        'guide_y0': 0,
        'engrave_dpi': 'medium' // low, medium, high
    };

    var config = Config();

    var BeamboxPreference = function () {
        function BeamboxPreference() {
            _classCallCheck(this, BeamboxPreference);

            // set default preference if key or even beambox-preference doesn't exist
            var pref = config.read('beambox-preference');
            pref = pref === '' ? {} : pref;
            var fullPref = Object.assign(DEFAULT_PREFERENCE, pref);
            config.write('beambox-preference', fullPref);
        }

        _createClass(BeamboxPreference, [{
            key: 'read',
            value: function read(key) {
                return config.read('beambox-preference')[key];
            }
        }, {
            key: 'write',
            value: function write(key, value) {
                var pref = config.read('beambox-preference');
                pref[key] = value;
                config.write('beambox-preference', pref);
            }
        }]);

        return BeamboxPreference;
    }();

    var instance = new BeamboxPreference();
    return instance;
});