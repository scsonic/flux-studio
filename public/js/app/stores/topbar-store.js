'use strict';

define(['app/dispatcher/topbar-dispatcher', 'app/constants/topbar-constants', 'events', 'helpers/object-assign'], function (Dispatcher, Constants, EventEmitter) {
    'use strict';

    var topbarStore;

    topbarStore = Object.assign(EventEmitter.prototype, {

        onAlignToolboxShowed: function onAlignToolboxShowed(callback) {
            this.on(Constants.SHOW_ALIGN_TOOLBOX, callback);
            return topbarStore;
        },

        onAlignToolboxClosed: function onAlignToolboxClosed(callback) {
            this.on(Constants.CLOSE_ALIGN_TOOLBOX, callback);
            return topbarStore;
        },

        onDistributeToolboxShowed: function onDistributeToolboxShowed(callback) {
            this.on(Constants.SHOW_DISTRIBUTE_TOOLBOX, callback);
            return topbarStore;
        },

        onDistributeToolboxClosed: function onDistributeToolboxClosed(callback) {
            this.on(Constants.CLOSE_DISTRIBUTE_TOOLBOX, callback);
            return topbarStore;
        },

        onImageToolboxShowed: function onImageToolboxShowed(callback) {
            this.on(Constants.SHOW_IMAGE_TOOLBOX, callback);
            return topbarStore;
        },

        onImageToolboxClosed: function onImageToolboxClosed(callback) {
            this.on(Constants.CLOSE_IMAGE_TOOLBOX, callback);
            return topbarStore;
        },

        removeAlignToolboxShowedListener: function removeAlignToolboxShowedListener(callback) {
            this.removeListener(Constants.SHOW_ALIGN_TOOLBOX, callback);
            return topbarStore;
        },

        removeAlignToolboxClosedListener: function removeAlignToolboxClosedListener(callback) {
            this.removeListener(Constants.CLOSE_ALIGN_TOOLBOX, callback);
            return topbarStore;
        },

        removeDistributeToolboxShowedListener: function removeDistributeToolboxShowedListener(callback) {
            this.removeListener(Constants.SHOW_DISTRIBUTE_TOOLBOX, callback);
            return topbarStore;
        },

        removeDistributeToolboxClosedListener: function removeDistributeToolboxClosedListener(callback) {
            this.removeListener(Constants.CLOSE_DISTRIBUTE_TOOLBOX, callback);
            return topbarStore;
        },

        removeImageToolboxShowedListener: function removeImageToolboxShowedListener(callback) {
            this.removeListener(Constants.SHOW_IMAGE_TOOLBOX, callback);
            return topbarStore;
        },

        removeImageToolboxClosedListener: function removeImageToolboxClosedListener(callback) {
            this.removeListener(Constants.CLOSE_IMAGE_TOOLBOX, callback);
            return topbarStore;
        },

        dispatcherIndex: Dispatcher.register(function (payload) {
            var actionType = payload.actionType;

            if (Constants[actionType]) {
                topbarStore.emit(actionType, payload);
            } else {
                throw new console.error('unknown method');
            }
        })

    });

    return topbarStore;
});