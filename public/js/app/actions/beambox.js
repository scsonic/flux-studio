'use strict';

// It's Flux actions of beambox by Net

define(['app/constants/beambox-constants', 'app/dispatcher/beambox-dispatcher'], function (BeamboxConstants, Dispatcher) {
    return {
        updateLaserPanel: function updateLaserPanel() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.UPDATE_LASER_PANEL
            });
        },
        backToPreviewMode: function backToPreviewMode() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.BACK_TO_PREVIEW
            });
        },
        startDrawingPreviewBlob: function startDrawingPreviewBlob() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.START_DRAWING_PREVIEW_BLOB
            });
        },
        endDrawingPreviewBlob: function endDrawingPreviewBlob() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.END_DRAWING_PREVIEW_BLOB
            });
        },
        showCropper: function showCropper() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.SHOW_CROPPER
            });
        },
        endImageTrace: function endImageTrace() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.END_IMAGE_TRACE
            });
        },
        clearCameraCanvas: function clearCameraCanvas() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.CLEAR_CAMERA_CANVAS
            });
        },
        closeInsertObjectSubmenu: function closeInsertObjectSubmenu() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.CLOSE_INSERT_OBJECT_SUBMENU
            });
        },
        resetPreviewButton: function resetPreviewButton() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.RESET_PREVIEW_BUTTON
            });
        }
    };
});