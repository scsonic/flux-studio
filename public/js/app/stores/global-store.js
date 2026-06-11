'use strict';

define(['app/dispatcher/global-dispatcher', 'app/constants/global-constants', 'events', 'helpers/object-assign'], function (Dispatcher, GlobalConstants, EventEmitter) {

    var GlobalStore;

    GlobalStore = Object.assign(EventEmitter.prototype, {
        onShowMonitor: function onShowMonitor(callback) {
            this.on(GlobalConstants.SHOW_MONITOR, callback);
        },
        onCloseMonitor: function onCloseMonitor(callback) {
            this.on(GlobalConstants.CLOSE_MONITOR, callback);
        },
        onCloseAllView: function onCloseAllView(callback) {
            this.on(GlobalConstants.CLOSE_ALL_VIEW, callback);
        },
        onCancelPreview: function onCancelPreview(callback) {
            this.on(GlobalConstants.CANCEL_PREVIEW, callback);
        },
        onSliceComplete: function onSliceComplete(callback) {
            this.on(GlobalConstants.SLICE_COMPLETE, callback);
        },
        onMonitorClosed: function onMonitorClosed(callback) {
            this.on(GlobalConstants.MONITOR_CLOSED, callback);
        },
        onResetDialogMenuIndex: function onResetDialogMenuIndex(callback) {
            this.on(GlobalConstants.RESET_DIALOG_MENU_INDEX, callback);
        },
        removeShowMoniotorListener: function removeShowMoniotorListener(callback) {
            this.removeListener(GlobalConstants.SHOW_MONITOR, callback);
        },
        removeCloseMonitorListener: function removeCloseMonitorListener(callback) {
            this.removeListener(GlobalConstants.CLOSE_MONITOR, callback);
        },
        removeCloseAllViewListener: function removeCloseAllViewListener(callback) {
            this.removeListener(GlobalConstants.CLOSE_ALL_VIEW, callback);
        },
        removeCancelPreviewListener: function removeCancelPreviewListener(callback) {
            this.removeListener(GlobalConstants.CANCEL_PREVIEW, callback);
        },
        removeSliceCompleteListener: function removeSliceCompleteListener(callback) {
            this.removeListener(GlobalConstants.SLICE_COMPLETE, callback);
        },
        removeMonitorClosedListener: function removeMonitorClosedListener(callback) {
            this.removeListener(GlobalConstants.MONITOR_CLOSED, callback);
        },
        removeResetDialogMenuIndexListener: function removeResetDialogMenuIndexListener(callback) {
            this.removeListener(GlobalConstants.RESET_DIALOG_MENU_INDEX, callback);
        },


        dispatcherIndex: Dispatcher.register(function (payload) {
            var actionType = payload.actionType;

            if (GlobalConstants[actionType]) {
                GlobalStore.emit(actionType, payload);
            } else {
                throw new console.error('unknown method');
            }
        })

    });

    return GlobalStore;
});