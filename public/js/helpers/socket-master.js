'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(['jquery'], function ($) {

    function SocketMaster() {
        var _tasks = [],
            _task = void 0,
            _ws = void 0,
            processing = false,
            _callback = function _callback() {};

        var setWebSocket = function setWebSocket(ws) {
            _ws = ws;
            _task = null;
            _tasks = [];
        };

        var addTask = function addTask(command) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            // if traffic is jammed, reset
            if (_tasks.length > 7) {
                console.log('==== more than 7 ws tasks!');
                _tasks = [];
                _task = null;
                processing = false;
            }
            var d = $.Deferred();
            _tasks.push({ d: d, command: command, args: args });
            if (!_task && !processing) {
                doTask();
            }

            return d.promise();
        };

        var doTask = function doTask() {
            _task = _tasks.shift();
            processing = true;

            var fnName = _task.command.split('@')[0],
                mode = _task.command.split('@')[1];

            if (mode === 'maintain' && _ws.mode !== 'maintain') {
                // Ensure maintain mode, if not then reject with "edge case" error
                _task.d.reject({ status: 'error', error: ['EDGE_CASE', 'MODE_ERROR'] });
            } else {
                runTaskFunction(_task, fnName);
            }
        };

        var runTaskFunction = function runTaskFunction(task, fnName) {
            var _ws2;

            // Do regular stuff
            var t = setTimeout(function () {
                task.d.reject({ error: ['TIMEOUT'] });
                doNext();
            }, 20 * 1000);

            // timeout only for play and maintain commands
            if (task.command.indexOf('play') === -1 && task.command.indexOf('maintain') === -1) {
                clearTimeout(t);
            }

            (_ws2 = _ws)[fnName].apply(_ws2, _toConsumableArray(task.args)).then(function (result) {
                processing = false;
                task.d.resolve(result);
                doNext();
            }).progress(function (result) {
                clearTimeout(t);
                task.d.notify(result);
            }).fail(function (result) {
                processing = false;
                task.d.reject(result);
                doNext();
            }).always(function () {
                clearTimeout(t);
            });
        };

        var doNext = function doNext() {
            _tasks.length > 0 ? doTask() : _task = null;
        };

        var nextTask = function nextTask() {
            return _tasks.length > 0 ? _tasks[0] : null;
        };

        var clearTasks = function clearTasks() {
            _tasks = [];
            _task = null;
        };

        var onTimeout = function onTimeout(callback) {
            _callback = callback;
        };

        return {
            setWebSocket: setWebSocket,
            addTask: addTask,
            doTask: doTask,
            nextTask: nextTask,
            clearTasks: clearTasks,
            onTimeout: onTimeout
        };
    }

    return SocketMaster;
});