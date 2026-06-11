'use strict';

define(['app/constants/action-creator-device'], function (C) {

    var initialState = {
        status: {},
        jobInfo: []
    };

    /**
    * State list
    * status            : (object), machine status
    * jobInfo           : (array), active job info, array of object
    * usbFolderExist    : (bool), wether usb drive (folder) exist in machine or not
    */

    return function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
        var action = arguments[1];


        var _action = {};

        _action[C.UPDATE_DEVICE_STATUS] = function () {
            return Object.assign({}, state, { status: action.status });
        };
        _action[C.UPDATE_JOB_INFO] = function () {
            return Object.assign({}, state, { jobInfo: action.jobInfo });
        };
        _action[C.UPDATE_USB_FOLDER_EXISTANCE] = function () {
            return Object.assign({}, state, { usbFolderExist: action.usbFolderExist });
        };

        if (typeof _action[action.type] !== 'function') {
            return state;
        }

        return _action[action.type]();
    };
});