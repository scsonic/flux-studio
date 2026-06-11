'use strict';

define(['jquery', 'helpers/version-checker', 'helpers/device-master'], function ($, VersionChecker, DeviceMaster) {
    var check = async function check(device, key) {
        if (device.version) {
            await DeviceMaster.selectDevice(device);
            var vc = VersionChecker(device.version);
            return vc.meetRequirement(key);
        } else {
            await DeviceMaster.selectDevice(device);
            var deviceInfo = await DeviceMaster.getDeviceInfo();
            var _vc = VersionChecker(deviceInfo.version);
            return _vc.meetRequirement(key);
        }
    };

    return {
        check: check
    };
});