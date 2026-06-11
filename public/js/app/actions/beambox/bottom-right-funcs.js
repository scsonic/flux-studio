'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

define(['helpers/device-master', 'helpers/i18n', 'app/actions/beambox/beambox-preference', 'app/actions/progress-actions', 'app/constants/progress-constants', 'app/actions/beambox/font-funcs', 'helpers/api/svg-laser-parser', 'app/actions/alert-actions', 'app/actions/beambox', 'app/actions/global-actions'], function (DeviceMaster, i18n, BeamboxPreference, ProgressActions, ProgressConstants, FontFuncs, svgLaserParser, AlertActions, BeamboxActions, GlobalActions) {
    var lang = i18n.lang;
    var svgeditorParser = svgLaserParser({ type: 'svgeditor' });

    // capture the scene of the svgCanvas to bitmap
    var fetchThumbnail = async function fetchThumbnail() {
        function cloneAndModifySvg($svg) {
            var $clonedSvg = $svg.clone(false);

            $clonedSvg.find('text').remove();
            $clonedSvg.find('#selectorParentGroup').remove();
            $clonedSvg.find('#canvasBackground image#background_image').remove();
            $clonedSvg.find('#canvasBackground #previewBoundary').remove();
            $clonedSvg.find('#canvasBackground #guidesLines').remove();

            return $clonedSvg;
        }

        async function DOM2Image($svg) {
            var $modifiedSvg = cloneAndModifySvg($svg);
            var svgString = new XMLSerializer().serializeToString($modifiedSvg.get(0));

            return await new Promise(function (resolve) {
                var img = new Image();
                img.onload = function () {
                    return resolve(img);
                };

                img.src = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgString);
            });
        }

        function cropAndDrawOnCanvas(img) {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            //cropping
            var ratio = img.width / $('#svgroot').width();
            var W = ratio * $('#svgroot').width();
            var H = ratio * $('#svgroot').height();
            var w = ratio * $('#canvasBackground').attr('width');
            var h = ratio * $('#canvasBackground').attr('height');
            var x = -(W - w) / 2;
            var y = -(H - h) / 2;

            canvas.width = w;
            canvas.height = h;

            ctx.drawImage(img, x, y, img.width, img.height);
            return canvas;
        }

        var $svg = cloneAndModifySvg($('#svgroot'));
        var img = await DOM2Image($svg);
        var canvas = cropAndDrawOnCanvas(img);

        return await new Promise(function (resolve) {
            canvas.toBlob(function (blob) {
                resolve([canvas.toDataURL(), URL.createObjectURL(blob)]);
            });
        });
    };

    //return {uploadFile, thumbnailBlobURL}
    var prepareFileWrappedFromSvgStringAndThumbnail = async function prepareFileWrappedFromSvgStringAndThumbnail() {
        var _ref = await fetchThumbnail(),
            _ref2 = _slicedToArray(_ref, 2),
            thumbnail = _ref2[0],
            thumbnailBlobURL = _ref2[1];

        var svgString = svgCanvas.getSvgString();
        var blob = new Blob([thumbnail, svgString], { type: 'application/octet-stream' });
        var reader = new FileReader();
        var uploadFile = await new Promise(function (resolve) {
            reader.onload = function () {
                //not sure whether all para is needed
                var file = {
                    data: reader.result,
                    name: 'svgeditor.svg',
                    uploadName: thumbnailBlobURL.split('/').pop(),
                    extension: 'svg',
                    type: 'application/octet-stream',
                    size: blob.size,
                    thumbnailSize: thumbnail.length,
                    index: 0,
                    totalFiles: 1
                };
                resolve(file);
            };
            reader.readAsArrayBuffer(blob);
        });

        return {
            uploadFile: uploadFile,
            thumbnailBlobURL: thumbnailBlobURL
        };
    };

    var fetchFcode = async function fetchFcode() {
        ProgressActions.open(ProgressConstants.WAITING, lang.beambox.bottom_right_panel.convert_text_to_path_before_export);
        await FontFuncs.convertTextToPathAmoungSvgcontent();
        ProgressActions.close();

        var _ref3 = await prepareFileWrappedFromSvgStringAndThumbnail(),
            uploadFile = _ref3.uploadFile,
            thumbnailBlobURL = _ref3.thumbnailBlobURL;

        await svgeditorParser.uploadToSvgeditorAPI([uploadFile], {
            model: BeamboxPreference.read('model'),
            engraveDpi: BeamboxPreference.read('engrave_dpi'),
            onProgressing: function onProgressing(data) {
                ProgressActions.open(ProgressConstants.STEPPING, '', data.message, false);
                ProgressActions.updating(data.message, data.percentage * 100);
            },
            onFinished: function onFinished() {
                ProgressActions.updating(lang.message.uploading_fcode, 100);
            }
        });
        var fcodeBlob = await new Promise(function (resolve) {
            var names = []; //don't know what this is for
            svgeditorParser.getTaskCode(names, {
                onProgressing: function onProgressing(data) {
                    ProgressActions.open(ProgressConstants.STEPPING, '', data.message, false);
                    ProgressActions.updating(data.message, data.percentage * 100);
                },
                onFinished: function onFinished(blob, fileName, fileTimeCost) {
                    GlobalActions.sliceComplete({ time: fileTimeCost });
                    ProgressActions.updating(lang.message.uploading_fcode, 100);
                    resolve(blob);
                },
                fileMode: '-f',
                model: BeamboxPreference.read('model')
            });
        });
        return {
            fcodeBlob: fcodeBlob,
            thumbnailBlobURL: thumbnailBlobURL
        };
    };

    return {
        uploadFcode: async function uploadFcode(device) {
            var _ref4 = await fetchFcode(),
                fcodeBlob = _ref4.fcodeBlob,
                thumbnailBlobURL = _ref4.thumbnailBlobURL;

            await DeviceMaster.select(device).done(function () {
                GlobalActions.showMonitor(device, fcodeBlob, thumbnailBlobURL, 'LASER');
            }).fail(function (errMsg) {
                AlertActions.showPopupError('menu-item', errMsg);
            });

            ProgressActions.close();
        },

        exportFcode: async function exportFcode() {
            var _ref5 = await fetchFcode(),
                fcodeBlob = _ref5.fcodeBlob;

            var defaultFCodeName = svgCanvas.getLatestImportFileName() || 'untitled';
            var langFile = i18n.lang.topmenu.file;
            var fileReader = new FileReader();

            ProgressActions.close();

            fileReader.onload = function () {
                window.electron.ipc.send('save-dialog', langFile.save_fcode, langFile.all_files, langFile.fcode_files, ['fc'], defaultFCodeName, new Uint8Array(this.result));
            };

            fileReader.readAsArrayBuffer(fcodeBlob);
        }
    };
});