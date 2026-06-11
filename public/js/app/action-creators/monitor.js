'use strict';

define(['app/constants/action-creator-monitor', 'app/constants/global-constants'], function (C, GC) {

    var changeMode = function changeMode(mode) {
        return {
            type: C.CHANGE_MODE,
            mode: mode
        };
    };

    var changePath = function changePath(path, content) {
        return {
            type: C.CHANGE_PATH,
            mode: GC.FILE,
            path: path,
            folderContent: content,
            isWaiting: false
        };
    };

    var updateFoldercontent = function updateFoldercontent(content) {
        return {
            type: C.UPDATE_FOLDER_CONTENT,
            folderContent: content,
            mode: GC.FILE,
            isWaiting: false
        };
    };

    var previewFile = function previewFile(info) {
        return {
            type: C.PREVIEW_FILE,
            mode: GC.FILE_PREVIEW,
            selectedFileInfo: info
        };
    };

    var selectItem = function selectItem(item) {
        return {
            type: C.SELECT_ITEM,
            selectedItem: item
        };
    };

    var setDownloadProgress = function setDownloadProgress(progress) {
        return {
            type: C.SET_DOWNLOAD_PROGRESS,
            downloadProgress: progress
        };
    };

    var setUploadProgress = function setUploadProgress(progress) {
        return {
            type: C.SET_UPLOAD_PROGRESS,
            uploadProgress: progress
        };
    };

    var showWait = function showWait() {
        return {
            type: C.SHOW_WAIT,
            isWaiting: true
        };
    };

    var closeWait = function closeWait() {
        return {
            type: C.CLOSE_WAIT,
            isWaiting: false
        };
    };

    return {
        changeMode: changeMode,
        changePath: changePath,
        updateFoldercontent: updateFoldercontent,
        previewFile: previewFile,
        selectItem: selectItem,
        setDownloadProgress: setDownloadProgress,
        setUploadProgress: setUploadProgress,
        showWait: showWait,
        closeWait: closeWait
    };
});