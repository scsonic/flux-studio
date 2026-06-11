'use strict';

define(['app/constants/global-constants', 'app/dispatcher/global-dispatcher'], function (GlobalConstants, Dispatcher) {
    return {
        showMonitor: function showMonitor(printer, fcode, previewUrl, opener) {
            Dispatcher.dispatch({
                actionType: GlobalConstants.SHOW_MONITOR, printer: printer, fcode: fcode, previewUrl: previewUrl, opener: opener
            });
        },

        closeMonitor: function closeMonitor() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.CLOSE_MONITOR
            });
        },

        closeAllView: function closeAllView() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.CLOSE_ALL_VIEW
            });
        },

        cancelPreview: function cancelPreview() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.CANCEL_PREVIEW
            });
        },

        sliceComplete: function sliceComplete(report) {
            Dispatcher.dispatch({
                actionType: GlobalConstants.SLICE_COMPLETE, report: report
            });
        },

        monitorClosed: function monitorClosed() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.MONITOR_CLOSED
            });
        },

        resetDialogMenuIndex: function resetDialogMenuIndex() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.RESET_DIALOG_MENU_INDEX
            });
        }
    };
});