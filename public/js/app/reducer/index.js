'use strict';

define(['Redux', './monitor', './device'], function (Redux, Monitor, Device) {
    var combineReducers = Redux.combineReducers;


    return combineReducers({
        Monitor: Monitor,
        Device: Device
    });
});