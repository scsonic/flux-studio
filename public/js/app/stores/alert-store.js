'use strict';

define(['app/dispatcher/alert-dispatcher', 'app/constants/alert-constants', 'events', 'helpers/object-assign'], function (Dispatcher, AlertConstants, EventEmitter) {
    'use strict';

    var NOTIFY_EVENT = 'notify',
        POPUP_EVENT = 'popup',
        _CLOSE_NOTIFICATION = 'closeNotification',
        _CLOSE_POPUP = 'closePopup',
        UPDATE_EVENT = 'update',
        CHANGE_FILAMENT_EVENT = 'change_filament',
        CAMERA_CALIBRATION_EVENT = 'camera_calibration',
        EDIT_HEAD_TEMPERATURE = 'edit_head_temperature',
        _NOTIFY_RETRY = 'retry',
        _NOTIFY_ABORT = 'abort',
        _NOTIFY_YES = 'yes',
        _NOTIFY_NO = 'no',
        _NOTIFY_CANCEL = 'cancel',
        // including the "no", "cancel", "ok" button fired
    _NOTIFY_CUSTOM = 'custom',
        _NOTIFY_CUSTOM_GROUP = 'customGroup',
        _NOTIFY_ANSWER = 'answer',
        AlertStore;

    AlertStore = Object.assign(EventEmitter.prototype, {
        onChangeFilament: function onChangeFilament(callback) {
            this.on(CHANGE_FILAMENT_EVENT, callback);
        },
        onShowHeadTemperature: function onShowHeadTemperature(callback) {
            this.on(EDIT_HEAD_TEMPERATURE, callback);
        },
        onCameraCalibration: function onCameraCalibration(callback) {
            this.on(CAMERA_CALIBRATION_EVENT, callback);
        },
        onUpdate: function onUpdate(callback) {
            this.on(UPDATE_EVENT, callback);
        },
        onNotify: function onNotify(callback) {
            this.on(NOTIFY_EVENT, callback);
        },
        onPopup: function onPopup(callback) {
            this.on(POPUP_EVENT, callback);
        },
        onRetry: function onRetry(callback) {
            this.on(_NOTIFY_RETRY, callback);
        },
        onYes: function onYes(callback, oneTime) {
            oneTime === true ? this.once(_NOTIFY_YES, callback) : this.on(_NOTIFY_YES, callback);
        },
        onNo: function onNo(callback, oneTime) {
            oneTime === true ? this.once(_NOTIFY_NO, callback) : this.on(_NOTIFY_NO, callback);
        },
        onCancel: function onCancel(callback, oneTime) {
            oneTime === true ? this.once(_NOTIFY_CANCEL, callback) : this.on(_NOTIFY_CANCEL, callback);
        },
        onAbort: function onAbort(callback) {
            this.on(_NOTIFY_ABORT, callback);
        },
        onCustom: function onCustom(callback, oneTime) {
            oneTime === true ? this.once(_NOTIFY_CUSTOM, callback) : this.on(_NOTIFY_CUSTOM, callback);
        },
        onCustomGroup: function onCustomGroup(callback, oneTime) {
            oneTime === true ? this.once(_NOTIFY_CUSTOM_GROUP, callback) : this.on(_NOTIFY_CUSTOM_GROUP, callback);
        },
        onAnswer: function onAnswer(callback) {
            this.on(_NOTIFY_ANSWER, callback);
        },
        onCloseNotify: function onCloseNotify(callback) {
            this.on(_CLOSE_NOTIFICATION, callback);
        },
        onClosePopup: function onClosePopup(callback) {
            this.on(_CLOSE_POPUP, callback);
        },
        removeNotifyListener: function removeNotifyListener(callback) {
            this.removeListener(NOTIFY_EVENT, callback);
        },
        removePopupListener: function removePopupListener(callback) {
            this.removeListener(POPUP_EVENT, callback);
        },
        removeCloseNotifyListener: function removeCloseNotifyListener(callback) {
            this.removeListener(_CLOSE_NOTIFICATION, callback);
        },
        removeClosePopupListener: function removeClosePopupListener(callback) {
            this.removeListener(_CLOSE_POPUP, callback);
        },
        removeRetryListener: function removeRetryListener(callback) {
            this.removeListener(_NOTIFY_RETRY, callback);
        },
        removeAbortListener: function removeAbortListener(callback) {
            this.removeListener(_NOTIFY_ABORT, callback);
        },
        removeYesListener: function removeYesListener(callback) {
            this.removeListener(_NOTIFY_YES, callback);
        },
        removeNoListener: function removeNoListener(callback) {
            this.removeListener(_NOTIFY_NO, callback);
        },
        removeCancelListener: function removeCancelListener(callback) {
            this.removeListener(_NOTIFY_CANCEL, callback);
        },
        removeCustomListener: function removeCustomListener(callback) {
            this.removeListener(_NOTIFY_CUSTOM, callback);
        },


        dispatcherIndex: Dispatcher.register(function (payload) {
            var actionType = payload.actionType,
                action = {

                'SHOW_INFO': function SHOW_INFO() {
                    AlertStore.emit(NOTIFY_EVENT, AlertConstants.INFO, payload.message, payload.callback);
                },

                'SHOW_WARNING': function SHOW_WARNING() {
                    AlertStore.emit(NOTIFY_EVENT, AlertConstants.WARNING, payload.message, payload.onClickCallback, payload.fixed);
                },

                'SHOW_ERROR': function SHOW_ERROR() {
                    AlertStore.emit(NOTIFY_EVENT, AlertConstants.ERROR, payload.message);
                },

                'SHOW_POPUP_INFO': function SHOW_POPUP_INFO() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.INFO, payload.id, payload.caption, payload.message);
                },

                'SHOW_POPUP_WARNING': function SHOW_POPUP_WARNING() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.WARNING, payload.id, payload.caption, payload.message);
                },

                'SHOW_POPUP_ERROR': function SHOW_POPUP_ERROR() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.ERROR, payload.id, payload.caption, payload.message);
                },

                'SHOW_POPUP_DEVICE_BUSY': function SHOW_POPUP_DEVICE_BUSY() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.ERROR, payload.id, payload.caption, payload.message);
                },

                'SHOW_POPUP_RETRY': function SHOW_POPUP_RETRY() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.RETRY_CANCEL, payload.id, payload.caption, payload.message);
                },

                'SHOW_POPUP_RETRY_ABORT': function SHOW_POPUP_RETRY_ABORT() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.RETRY_ABORT_CANCEL, payload.id, payload.caption, payload.message);
                },

                'SHOW_POPUP_YES_NO': function SHOW_POPUP_YES_NO() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.YES_NO, payload.id, payload.caption, payload.message, '', payload.args);
                },

                'SHOW_POPUP_CUSTOM': function SHOW_POPUP_CUSTOM() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.CUSTOM, payload.id, payload.caption, payload.message, payload.customText, payload.args);
                },

                'SHOW_POPUP_CUSTOM_GROUP': function SHOW_POPUP_CUSTOM_GROUP() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.CUSTOM_GROUP, payload.id, payload.caption, payload.message, payload.customText, payload.args, payload.callback);
                },

                'SHOW_POPUP_CUSTOM_CANCEL': function SHOW_POPUP_CUSTOM_CANCEL() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.CUSTOM_CANCEL, payload.id, payload.caption, payload.message, payload.customText);
                },

                'SHOW_POPUP_QUESTION': function SHOW_POPUP_QUESTION() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.QUESTION, payload.id, payload.caption, payload.message);
                },

                'SHOW_HEAD_TEMPERATURE': function SHOW_HEAD_TEMPERATURE() {
                    AlertStore.emit(EDIT_HEAD_TEMPERATURE, payload);
                },

                'NOTIFY_RETRY': function NOTIFY_RETRY() {
                    AlertStore.emit(_NOTIFY_RETRY, payload.id);
                },

                'NOTIFY_ABORT': function NOTIFY_ABORT() {
                    AlertStore.emit(_NOTIFY_ABORT, payload.id);
                },

                'NOTIFY_YES': function NOTIFY_YES() {
                    AlertStore.emit(_NOTIFY_YES, payload.id, payload.args);
                },

                'NOTIFY_NO': function NOTIFY_NO() {
                    AlertStore.emit(_NOTIFY_NO, payload.id);
                },

                'NOTIFY_CANCEL': function NOTIFY_CANCEL() {
                    AlertStore.emit(_NOTIFY_CANCEL, payload.id);
                },

                'NOTIFY_CUSTOM': function NOTIFY_CUSTOM() {
                    AlertStore.emit(_NOTIFY_CUSTOM, payload.id);
                },

                'NOTIFY_CUSTOM_GROUP': function NOTIFY_CUSTOM_GROUP() {
                    AlertStore.emit(_NOTIFY_CUSTOM_GROUP, payload.id);
                },

                'NOTIFY_ANSWER': function NOTIFY_ANSWER() {
                    AlertStore.emit(_NOTIFY_ANSWER, payload.id, payload.isYes);
                },

                'SHOW_POPUP_UPDATE': function SHOW_POPUP_UPDATE() {
                    AlertStore.emit(UPDATE_EVENT, payload);
                },

                'CLOSE_NOTIFICATION': function CLOSE_NOTIFICATION() {
                    AlertStore.emit(_CLOSE_NOTIFICATION);
                },

                'CLOSE_POPUP': function CLOSE_POPUP() {
                    AlertStore.emit(_CLOSE_POPUP);
                },

                'SHOW_POPUP_CHANGE_FILAMENT': function SHOW_POPUP_CHANGE_FILAMENT() {
                    AlertStore.emit(CHANGE_FILAMENT_EVENT, payload);
                },

                'SHOW_POPUP_CAMERA_CALIBRATION': function SHOW_POPUP_CAMERA_CALIBRATION() {
                    AlertStore.emit(CAMERA_CALIBRATION_EVENT, payload);
                }

            };

            if (!!action[actionType]) {
                action[actionType]();
            }
        })

    });

    return AlertStore;
});