'use strict';

define(['app/constants/topbar-constants', 'app/dispatcher/topbar-dispatcher'], function (TopbarConstants, Dispatcher) {
    return {
        showAlignToolbox: function showAlignToolbox() {
            Dispatcher.dispatch({
                actionType: TopbarConstants.SHOW_ALIGN_TOOLBOX
            });
        },
        closeAlignToolbox: function closeAlignToolbox() {
            Dispatcher.dispatch({
                actionType: TopbarConstants.CLOSE_ALIGN_TOOLBOX
            });
        },
        showDistributeToolbox: function showDistributeToolbox() {
            Dispatcher.dispatch({
                actionType: TopbarConstants.SHOW_DISTRIBUTE_TOOLBOX
            });
        },
        closeDistributeToolbox: function closeDistributeToolbox() {
            Dispatcher.dispatch({
                actionType: TopbarConstants.CLOSE_DISTRIBUTE_TOOLBOX
            });
        },
        showImageToolbox: function showImageToolbox() {
            Dispatcher.dispatch({
                actionType: TopbarConstants.SHOW_IMAGE_TOOLBOX
            });
        },
        closeImageToolbox: function closeImageToolbox() {
            Dispatcher.dispatch({
                actionType: TopbarConstants.CLOSE_IMAGE_TOOLBOX
            });
        }
    };
});