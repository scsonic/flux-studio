'use strict';

/**
 * firmware updater
 */
define(['jquery', 'helpers/i18n', 'helpers/check-firmware', 'helpers/device-master', 'app/actions/alert-actions', 'app/actions/progress-actions', 'app/constants/progress-constants', 'app/actions/input-lightbox-actions', 'app/constants/input-lightbox-constants', 'helpers/round'], function ($, i18n, checkFirmware, DeviceMaster, AlertActions, ProgressActions, ProgressConstants, InputLightboxActions, InputLightboxConstants, round) {
    'use strict';

    var lang = i18n.get();

    return function (response, printer, type, forceUpdate) {
        var lang = i18n.get(),
            doUpdate,
            onDownload,
            onInstall,
            onSubmit,
            _uploadToDevice,
            _onFinishUpdate;

        doUpdate = 'firmware' === type ? DeviceMaster.updateFirmware : DeviceMaster.updateToolhead;

        _uploadToDevice = function _uploadToDevice(file) {
            DeviceMaster.selectDevice(printer).done(function () {
                ProgressActions.open(ProgressConstants.STEPPING, '', '', false);
                doUpdate(file).progress(function (r) {
                    r.percentage = round(r.percentage || 0, -2);
                    ProgressActions.updating(lang.update.updating + ' (' + r.percentage + '%)', r.percentage);
                }).always(function () {
                    ProgressActions.close();
                }).done(_onFinishUpdate.bind(null, true)).fail(_onFinishUpdate.bind(null, false));
            });
        };

        _onFinishUpdate = function _onFinishUpdate(isSuccess) {
            console.log('finished update', isSuccess, type);
            if (type === 'toolhead') {
                quitTask();
            }

            if (true === isSuccess) {
                AlertActions.showPopupInfo('firmware-update-success', lang.update.firmware.update_success);
            } else {
                AlertActions.showPopupError('firmware-update-fail', lang.update.firmware.update_fail);
            }
        };

        onDownload = function onDownload() {
            var req = new XMLHttpRequest();

            // get firmware from flux3dp website.
            req.open("GET", response.downloadUrl, true);
            req.responseType = "blob";

            req.onload = function (event) {
                if (this.status == 200) {
                    var file = req.response;
                    _uploadToDevice(file);
                } else {
                    AlertActions.showPopupError('firmware-update-fail', lang.update.cannot_reach_internet);
                }
            };
            req.send();
        };

        onInstall = function onInstall() {
            var name = 'upload-firmware',
                content = void 0;

            content = {
                type: InputLightboxConstants.TYPE_FILE,
                caption: lang.update.firmware.upload_file,
                onSubmit: onSubmit,
                onClose: function onClose() {
                    if ('toolhead' === type) {
                        DeviceMaster.quitTask();
                    }
                },
                confirmText: lang.update.firmware.confirm
            };

            InputLightboxActions.open(name, content);
        };

        onSubmit = function onSubmit(files, e) {
            var file = files.item(0),
                onFinishUpdate = void 0;

            DeviceMaster.selectDevice(printer).done(function () {
                ProgressActions.open(ProgressConstants.STEPPING, '', '', false);
                doUpdate(file).progress(function (r) {
                    r.percentage = round(r.percentage || 0, -2);
                    ProgressActions.updating(lang.update.updating + ' (' + r.percentage + '%)', r.percentage);
                }).always(function () {
                    ProgressActions.close();
                }).done(_onFinishUpdate.bind(null, true)).fail(_onFinishUpdate.bind(null, false));
            });
        };

        var quitTask = function quitTask() {
            console.log('quitting task');
            DeviceMaster.quitTask().then(function (r) {
                console.log('task quitted?', r);
                if (r.error) {
                    setTimeout(function () {
                        quitTask();
                    }, 2000);
                };
            }).fail(function (e) {
                console.log('error from quit task', e);
                setTimeout(function () {
                    quitTask();
                }, 2000);
            });
        };

        if (forceUpdate) {
            onInstall();
        } else {
            AlertActions.showUpdate(printer, type, response || {}, onDownload, onInstall);
        }
    };
});