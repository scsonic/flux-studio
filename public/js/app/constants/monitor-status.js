'use strict';

define(['app/constants/device-constants'], function (DeviceConstants) {
    var lang = void 0;
    return {
        setLang: function setLang(l) {
            lang = l;
        },

        IDLE: function IDLE() {
            return {
                displayStatus: lang.device.ready,
                currentStatus: DeviceConstants.READY
            };
        },

        INIT: function INIT() {
            return {
                displayStatus: lang.device.starting,
                currentStatus: DeviceConstants.STARTING
            };
        },

        STARTING: function STARTING() {
            return {
                displayStatus: lang.device.starting,
                currentStatus: ''
            };
        },

        RUNNING: function RUNNING() {
            return {
                displayStatus: lang.device.running,
                currentStatus: DeviceConstants.RUNNING
            };
        },

        PAUSED: function PAUSED() {
            return {
                displayStatus: lang.device.paused,
                currentStatus: DeviceConstants.PAUSED
            };
        },

        PAUSING: function PAUSING() {
            return {
                displayStatus: lang.device.pausing,
                currentStatus: DeviceConstants.PAUSED
            };
        },

        WAITING_HEAD: function WAITING_HEAD() {
            return {
                displayStatus: lang.device.heating,
                currentStatus: DeviceConstants.HEATING
            };
        },

        CORRECTING: function CORRECTING() {
            return {
                displayStatus: lang.device.calibrating,
                currentStatus: DeviceConstants.CALIBRATING
            };
        },

        COMPLETING: function COMPLETING() {
            return {
                displayStatus: lang.device.completing,
                currentStatus: ''
            };
        },

        COMPLETED: function COMPLETED() {
            return {
                displayStatus: lang.device.completed,
                currentStatus: ''
            };
        },

        ABORTING: function ABORTING() {
            return {
                displayStatus: lang.device.aborting,
                currentStatus: ''
            };
        },

        ABORTED: function ABORTED() {
            return {
                displayStatus: lang.device.aborted,
                currentStatus: ''
            };
        },

        RESUMING: function RESUMING() {
            return {
                displayStatus: lang.device.starting,
                currentStatus: DeviceConstants.RUNNING
            };
        },

        OCCUPIED: function OCCUPIED() {
            return {
                displayStatus: lang.device.occupied,
                currentStatus: DeviceConstants.PAUSED
            };
        },

        SCANNING: function SCANNING() {
            return {
                displayStatus: lang.device.scanning,
                currentStatus: ''
            };
        }
    };
});