'use strict';

define(['lib/flux.min'], function (Flux) {
    var flux = new Flux.Dispatcher();
    return {

        register: function register(callback) {
            return flux.register(callback);
        },

        dispatch: function dispatch(actionType) {
            flux.dispatch(actionType);
        }
    };
});