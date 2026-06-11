'use strict';

define(['app/constants/action-creator-monitor'], function (C) {

    var initialState = {
        mode: 'PREVIEW',
        currentPath: '',
        selectedItem: {},
        currentFolderContent: {},
        selectedFileInfo: [],
        downloadProgress: { size: '', left: '' },
        isWaiting: false
    };

    /***
    * State list
    * mode                  : (string), monitor mode: PREVIEW, FILE, CAMERA, PRINT, FILE_PREVIEW
    * currentPath           : (string), current displaying path (FILE mode)
    * selectedItem          : (object), name: name of the file / folder, type: FILE / FOLDER
    * currentFolderContent  : (object), current folder content: folders and files
    * selectedFileInfo      : (array), array of objects contains file info, binary preview pic
    * downloadProgress      : (object), download file from monitor {size, left}
    * uploadProgress        : (string), uploading fcode to device, % finished. Empty if not uploading
    */

    // TODO: update to object spread when available

    return function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
        var action = arguments[1];


        var _action = {};

        _action[C.CHANGE_MODE] = function () {
            return Object.assign({}, state, {
                mode: action.mode
            });
        };

        _action[C.UPDATE_FOLDER_CONTENT] = function () {
            return Object.assign({}, state, {
                currentFolderContent: action.folderContent,
                mode: action.mode
            });
        };

        _action[C.CHANGE_PATH] = function () {
            return Object.assign({}, state, {
                mode: action.mode,
                currentPath: action.path,
                currentFolderContent: action.folderContent,
                isWaiting: action.isWaiting
            });
        };

        _action[C.PREVIEW_FILE] = function () {
            return Object.assign({}, state, {
                mode: action.mode,
                selectedFileInfo: action.selectedFileInfo,
                isWaiting: action.isWaiting
            });
        };

        _action[C.SELECT_ITEM] = function () {
            return Object.assign({}, state, {
                selectedItem: action.selectedItem
            });
        };

        _action[C.SET_DOWNLOAD_PROGRESS] = function () {
            return Object.assign({}, state, {
                downloadProgress: action.downloadProgress
            });
        };

        _action[C.SET_UPLOAD_PROGRESS] = function () {
            return Object.assign({}, state, {
                uploadProgress: action.uploadProgress
            });
        };

        _action[C.SHOW_WAIT] = function () {
            return Object.assign({}, state, {
                isWaiting: action.isWaiting
            });
        };

        _action[C.CLOSE_WAIT] = function () {
            return Object.assign({}, state, {
                isWaiting: action.isWaiting
            });
        };

        if (typeof _action[action.type] !== 'function') {
            return state;
        }

        return _action[action.type]();
    };
});