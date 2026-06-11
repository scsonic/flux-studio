'use strict';

define(['app/constants/action-creator-device'], function (C) {

    var updateDeviceStatus = function updateDeviceStatus(status) {
        return {
            type: C.UPDATE_DEVICE_STATUS,
            status: status
        };
    };

    var updateJobInfo = function updateJobInfo(jobInfo) {
        return {
            type: C.UPDATE_JOB_INFO,
            jobInfo: jobInfo
        };
    };

    var updateUsbFolderExistance = function updateUsbFolderExistance(usbFolderExist) {
        return {
            type: C.UPDATE_USB_FOLDER_EXISTANCE,
            usbFolderExist: usbFolderExist
        };
    };

    return {
        updateDeviceStatus: updateDeviceStatus,
        updateJobInfo: updateJobInfo,
        updateUsbFolderExistance: updateUsbFolderExistance
    };
});