'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define([], function () {
    var BeamboxVersionMaster = function () {
        function BeamboxVersionMaster() {
            _classCallCheck(this, BeamboxVersionMaster);
        }

        _createClass(BeamboxVersionMaster, [{
            key: 'isUnusableVersion',
            value: async function isUnusableVersion(device) {
                var unUsableVersions = await this.getUnusableVersion().catch(function () {
                    console.log('cannot request unusable beambox firmware from flux3dp.com');
                    return Promise.resolve([]);
                });
                console.log('unUsableVersions: ', unUsableVersions);
                return unUsableVersions.includes(device.version);
            }
        }, {
            key: 'getUnusableVersion',
            value: async function getUnusableVersion() {
                if (!navigator.onLine) {
                    console.log('fail to get network');
                    return [];
                }

                var request_data = {
                    feature: 'check_update',
                    key: 'unusable-beambox-firmware-version'
                };

                return await $.ajax({
                    url: 'https://flux3dp.com/api_entry/',
                    data: request_data
                });
            }
        }]);

        return BeamboxVersionMaster;
    }();

    return new BeamboxVersionMaster();
});