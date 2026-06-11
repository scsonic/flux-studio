'use strict';

define(['app/dispatcher/beambox-dispatcher', 'app/constants/beambox-constants', 'events', 'helpers/object-assign'], function (Dispatcher, Constants, EventEmitter) {
    'use strict';

    var beamboxStore;

    beamboxStore = Object.assign(EventEmitter.prototype, {

        onUpdateLaserPanel: function onUpdateLaserPanel(callback) {
            this.on(Constants.UPDATE_LASER_PANEL, callback);
            return beamboxStore;
        },

        onEndDrawingPreviewBlob: function onEndDrawingPreviewBlob(callback) {
            this.on(Constants.END_DRAWING_PREVIEW_BLOB, callback);
            return beamboxStore;
        },

        onStartDrawingPreviewBlob: function onStartDrawingPreviewBlob(callback) {
            this.on(Constants.START_DRAWING_PREVIEW_BLOB, callback);
            return beamboxStore;
        },

        onCropperShown: function onCropperShown(callback) {
            this.on(Constants.SHOW_CROPPER, callback);
            return beamboxStore;
        },

        onEndImageTrace: function onEndImageTrace(callback) {
            this.on(Constants.END_IMAGE_TRACE, callback);
            return beamboxStore;
        },

        onClearCameraCanvas: function onClearCameraCanvas(callback) {
            this.on(Constants.CLEAR_CAMERA_CANVAS, callback);
            return beamboxStore;
        },

        onCloseInsertObjectSubmenu: function onCloseInsertObjectSubmenu(callback) {
            this.on(Constants.CLOSE_INSERT_OBJECT_SUBMENU, callback);
            return beamboxStore;
        },

        onResetPreviewButton: function onResetPreviewButton(callback) {
            this.on(Constants.RESET_PREVIEW_BUTTON, callback);
            return beamboxStore;
        },

        removeUpdateLaserPanelListener: function removeUpdateLaserPanelListener(callback) {
            this.removeListener(Constants.UPDATE_LASER_PANEL, callback);
            return beamboxStore;
        },

        removeEndDrawingPreviewBlobListener: function removeEndDrawingPreviewBlobListener(callback) {
            this.removeListener(Constants.END_DRAWINGk_PREVIEW_BLOB, callback);
            return beamboxStore;
        },

        removeStartDrawingPreviewBlobListener: function removeStartDrawingPreviewBlobListener(callback) {
            this.removeListener(Constants.START_DRAWING_PREVIEW_BLOB, callback);
            return beamboxStore;
        },

        removeCropperShownListener: function removeCropperShownListener(callback) {
            this.removeListener(Constants.SHOW_CROPPER, callback);
            return beamboxStore;
        },

        removeEndImageTraceListener: function removeEndImageTraceListener(callback) {
            this.removeListener(Constants.END_IMAGE_TRACE, callback);
            return beamboxStore;
        },

        removeClearCameraCanvasListener: function removeClearCameraCanvasListener(callback) {
            this.removeListener(Constants.CLEAR_CAMERA_CANVAS, callback);
            return beamboxStore;
        },

        removeCloseInsertObjectSubmenuListener: function removeCloseInsertObjectSubmenuListener(callback) {
            this.removeListener(Constants.CLOSE_INSERT_OBJECT_SUBMENU, callback);
            return beamboxStore;
        },

        removeResetPreviewButton: function removeResetPreviewButton(callback) {
            this.removeListener(Constants.RESET_PREVIEW_BUTTON, callback);
            return beamboxStore;
        },

        dispatcherIndex: Dispatcher.register(function (payload) {
            var actionType = payload.actionType;

            if (Constants[actionType]) {
                beamboxStore.emit(actionType, payload);
            } else {
                throw new console.error('unknown method');
            }
        })

    });

    return beamboxStore;
});