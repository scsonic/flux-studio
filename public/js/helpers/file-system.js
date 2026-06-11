'use strict';

define(function () {
    'use strict';

    var defaults = {
        size: 5 * 1024 * 1024 /*50MB*/
        , onComplete: function onComplete() {},
        onError: function onError() {}
    },
        defaultOptions = function defaultOptions(options) {
        options = options || {};

        for (var key in defaults) {
            if (true === defaults.hasOwnProperty(key) && false === options.hasOwnProperty(key)) {
                options[key] = defaults[key];
            }
        }

        return options;
    },

    /**
     * Options:
     *     file: the file you wanna to write to filesystem
     *     size: how many capacity you take
     *
     *     // Events
     *     onComplete: firing when process complete
     *     onError: firing when error occurred
     */
    requestFileSystem = function requestFileSystem(options, callback) {
        var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

        requestFileSystem(window.TEMPORARY, options.size || defaults.size, function (fileSystem) {
            callback(fileSystem);
        });
    },

    /**
     * write file into local drive
     */
    _writeFile = function _writeFile(options) {
        options.onError = options.onError || defaults.onError;
        options.onComplete = options.onComplete || defaults.onComplete;

        requestFileSystem(options, function (fileSystem) {
            fileSystem.root.getFile(options.file.name, {
                create: true
            }, function (fileEntry) {
                // Do something with fileEntry.
                fileEntry.createWriter(function (fileWriter) {
                    var fr = new FileReader();

                    fileEntry.fileExtension = '';

                    if (true === fileEntry.isFile) {
                        fileEntry.fileExtension = fileEntry.name.split('.').reverse()[0];
                    }

                    fileWriter.onwriteend = function (e) {
                        options.onComplete(e, fileEntry);
                    };

                    if (true === options.append) {
                        fileWriter.seek(fileWriter.length);
                    }

                    fileWriter.onerror = options.onError;

                    fr.onloadend = function (e) {
                        var contentBlob = new Blob([fr.result], { type: options.file.type || 'text/plain' });
                        fileWriter.write(contentBlob);
                    };

                    fr.onerror = options.onError;
                    fr.readAsArrayBuffer(options.file);
                }, options.onError);
            }, options.onError);
        });
    },
        _readDir = function _readDir(options) {
        options.onError = options.onError || defaults.onError;
        options.onComplete = options.onComplete || defaults.onComplete;

        requestFileSystem(options, function (fileSystem) {
            var dirReader = fileSystem.root.createReader(),


            // Call the reader.readEntries() until no more results are returned.
            readEntries = function readEntries() {
                dirReader.readEntries(function (results) {
                    options.onComplete(results);
                }, options.onError);
            };

            readEntries(); // Start reading dirs.
        });
    },
        _getFile = function _getFile(options) {
        options.onError = options.onError || defaults.onError;
        options.append = false;
        options.onComplete = options.onComplete || defaults.onComplete;

        requestFileSystem(options, function (fileSystem) {
            fileSystem.root.getFile(options.file.name, {}, function (fileEntry) {
                // Do something with fileEntry.
                fileEntry.file(function (file) {
                    var fileReader = new FileReader();

                    fileReader.onloadend = function (e) {
                        var contentBlob = new Blob([fileReader.result]);
                        options.onComplete(e);
                    };

                    fileReader.onerror = options.onError;
                    fileReader.readAsArrayBuffer(file);
                }, options.onError);
            }, options.onError);
        });
    };

    return {
        getFile: function getFile(file, options) {
            options = defaultOptions(options);
            options.file = file;

            _getFile(options);

            return this;
        },
        writeFile: function writeFile(file, options) {
            options = defaultOptions(options);
            options.file = file;

            _writeFile(options);

            return this;
        },
        readDir: function readDir(callback, options) {
            options = defaultOptions(options);
            options.onComplete = callback || defaults.onComplete;

            _readDir(options);

            return this;
        }
    };
});