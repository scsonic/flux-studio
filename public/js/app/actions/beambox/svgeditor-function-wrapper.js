'use strict';

define(['app/actions/beambox/constant', 'helpers/image-data', 'lib/cropper', 'helpers/i18n'], function (Constant, ImageData, Cropper, i18n) {
    var LANG = i18n.lang.beambox;

    var _mm2pixel = function _mm2pixel(mm_input) {
        var dpmm = Constant.dpmm;

        return mm_input * dpmm;
    };

    var _update_attr_changer = function _update_attr_changer(name, val) {
        $('#' + name).val(val);
        $('#' + name).change();
    };

    var _setCrosshairCursor = function _setCrosshairCursor() {
        $('#workarea').css('cursor', 'crosshair');
    };

    var _flipImage = function _flipImage() {
        var horizon = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var vertical = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var image = window.svgCanvas.getSelectedElems()[0];
        var flipCanvas = document.createElement('canvas');
        var flipContext = flipCanvas.getContext('2d');
        flipCanvas.width = $(image).attr('width');
        flipCanvas.height = $(image).attr('height');
        flipContext.translate(horizon < 0 ? flipCanvas.width : 0, vertical < 0 ? flipCanvas.height : 0);
        flipContext.scale(horizon, vertical);
        flipContext.drawImage(image, 0, 0, flipCanvas.width, flipCanvas.height);
        $(image).attr('xlink:href', flipCanvas.toDataURL());
    };

    var funcs = {
        clearSelection: function clearSelection() {
            svgCanvas.clearSelection();
        },
        isAnyElementSelected: function isAnyElementSelected() {
            if (!window.svgCanvas) {
                return false;
            }

            var selectedElements = window.svgCanvas.getSelectedElems();

            return selectedElements.length > 0 && selectedElements[0] !== null;
        },
        cloneSelectedElement: function cloneSelectedElement() {
            window.svgCanvas.cloneSelectedElements(20, 20);
        },
        undo: function undo() {
            window.svgeditorClickUndo();
        },

        //main panel
        importImage: function importImage() {
            $('#tool_import input').click();
        },

        insertSvg: function insertSvg(svgString, type) {
            var cropData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { x: 0, y: 0 };
            var preCrop = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { offsetX: 0, offsetY: 0 };

            var imageElement = svgString.split('<image');

            svgString = svgString.replace(/fill(: ?#(fff(fff)?|FFF(FFF)?));/g, 'fill: none;');
            svgString = svgString.replace(/fill= ?"#(fff(fff)?|FFF(FFF))"/g, 'fill="none"');
            svgString = svgString.replace(/<image(.|\n)+\/image>/g, '');
            svgString = svgString.replace(/<image(.|\n)+\/>/g, '');

            var newElement = svgCanvas.importSvgString(svgString, type);
            var x = cropData.x,
                y = cropData.y;
            var offsetX = preCrop.offsetX,
                offsetY = preCrop.offsetY;


            if (imageElement.length > 1) {
                for (var i = 1; i < imageElement.length; i++) {
                    var nodeString = imageElement[i].substr(0, imageElement[i].indexOf('>'));
                    var widthString = nodeString.match(/width="\d+"/)[0];
                    var heightString = nodeString.match(/height="\d+"/)[0];
                    var matrixString = nodeString.match(/matrix\(.+\)/)[0];
                    var xlink = nodeString.indexOf('xlink:href=') + 12;
                    var width = parseInt(widthString.substr(widthString.indexOf('"') + 1, widthString.lastIndexOf('"') - 1));
                    var height = parseInt(heightString.substr(heightString.indexOf('"') + 1, heightString.lastIndexOf('"') - 1));
                    var matrix = matrixString.substring(matrixString.indexOf('(') + 1, matrixString.indexOf(')') - 1).split(' ').map(function (e) {
                        return Number(e);
                    });
                    var imageHref = nodeString.substr(xlink, nodeString.substr(xlink).indexOf('"')).replace(/\n/g, '');
                    var sizeFactor = matrix[0] === matrix[3] ? matrix[0] : 1;

                    this.insertImage(imageHref, { x: matrix[4], y: matrix[5], width: width, height: height }, preCrop, sizeFactor);
                }
            }

            svgCanvas.ungroupSelectedElement();
            svgCanvas.ungroupSelectedElement();
            svgCanvas.groupSelectedElements();
            svgCanvas.alignSelectedElements('m', 'page');
            svgCanvas.alignSelectedElements('c', 'page');
            // highlight imported element, otherwise we get strange empty selectbox
            try {
                svgCanvas.selectOnly([newElement]);

                if (type === 'image-trace') {
                    svgCanvas.setSvgElemPosition('x', offsetX + x);
                    svgCanvas.setSvgElemPosition('y', offsetY + y);
                    svgCanvas.zoomSvgElem(72 / 254);
                }
            } catch (e) {
                console.warn('Reading empty SVG');
            }

            $('#dialog_box').hide();
        },
        insertImage: function insertImage(insertedImageSrc, cropData, preCrop) {
            var sizeFactor = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
            var threshold = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 128;
            var imageTrace = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;


            // let's insert the new image until we know its dimensions
            var insertNewImage = function insertNewImage(img, cropData, preCrop, sizeFactor, threshold) {
                var x = cropData.x,
                    y = cropData.y,
                    width = cropData.width,
                    height = cropData.height;
                var offsetX = preCrop.offsetX,
                    offsetY = preCrop.offsetY;

                var scale = imageTrace ? 1 : 3.5277777;
                var newImage = svgCanvas.addSvgElementFromJson({
                    element: 'image',
                    attr: {
                        x: (offsetX + x) * scale,
                        y: (offsetY + y) * scale,
                        width: width * scale * sizeFactor,
                        height: height * scale * sizeFactor,
                        id: svgCanvas.getNextId(),
                        style: 'pointer-events:inherit',
                        preserveAspectRatio: 'none',
                        'data-threshold': parseInt(threshold),
                        'data-shading': false,
                        origImage: img.src
                    }
                });

                ImageData(newImage.getAttribute('origImage'), {
                    height: height,
                    width: width,
                    grayscale: {
                        is_rgba: true,
                        is_shading: false,
                        threshold: parseInt(threshold),
                        is_svg: false
                    },
                    onComplete: function onComplete(result) {
                        svgCanvas.setHref(newImage, result.canvas.toDataURL());
                    }
                });

                svgCanvas.selectOnly([newImage]);

                window.updateContextPanel();
                $('#dialog_box').hide();
            };

            // create dummy img so we know the default dimensions
            var img = new Image();
            var layerName = LANG.right_panel.layer_panel.layer_bitmap;

            img.src = insertedImageSrc;
            img.style.opacity = 0;
            img.onload = function () {
                if (!svgCanvas.setCurrentLayer(layerName)) {
                    svgCanvas.createLayer(layerName);
                }

                insertNewImage(img, cropData, preCrop, sizeFactor, threshold);
            };
        },

        getCurrentLayerData: function getCurrentLayerData() {
            var drawing = svgCanvas.getCurrentDrawing();
            var currentLayer = drawing.getCurrentLayer();
            var layerData = {
                speed: currentLayer.getAttribute('data-speed'),
                power: currentLayer.getAttribute('data-strength'),
                repeat: currentLayer.getAttribute('data-repeat')
            };

            return layerData;
        },

        renameLayer: function renameLayer(oldName, newName) {
            if (svgCanvas.setCurrentLayer(oldName)) {
                svgCanvas.renameCurrentLayer(newName);
            }
        },

        //align toolbox
        alignLeft: function alignLeft() {
            svgCanvas.alignSelectedElements('l', 'page');
        },
        alignCenter: function alignCenter() {
            svgCanvas.alignSelectedElements('c', 'page');
        },
        alignRight: function alignRight() {
            svgCanvas.alignSelectedElements('r', 'page');
        },
        alignTop: function alignTop() {
            svgCanvas.alignSelectedElements('t', 'page');
        },
        alignMiddle: function alignMiddle() {
            svgCanvas.alignSelectedElements('m', 'page');
        },
        alignBottom: function alignBottom() {
            svgCanvas.alignSelectedElements('b', 'page');
        },
        // distribute toolbox
        distHori: function distHori() {
            svgCanvas.distHori();
        },
        distVert: function distVert() {
            svgCanvas.distHori();
        },
        distEven: function distEven() {
            svgCanvas.distEven();
        },
        flipHorizontal: function flipHorizontal() {
            _flipImage(-1, 1);
        },
        flipVertical: function flipVertical() {
            _flipImage(1, -1);
        },
        //left panel
        useSelectTool: function useSelectTool() {
            $('#tool_select').click();
        },
        insertRectangle: function insertRectangle() {
            $('#tool_rect').mouseup();
            _setCrosshairCursor();
        },
        insertEllipse: function insertEllipse() {
            $('#tool_ellipse').mouseup();
            _setCrosshairCursor();
        },
        insertPath: function insertPath() {
            $('#tool_path').mouseup();
            _setCrosshairCursor();
        },
        insertPolygon: function insertPolygon() {
            svgCanvas.setMode('polygon');
            _setCrosshairCursor();
        },
        insertLine: function insertLine() {
            $('#tool_line').mouseup();
            _setCrosshairCursor();
        },
        insertText: function insertText() {
            $('#tool_text').click();
            if (svgedit.browser.isTouch()) {
                $('#tool_text').mousedown();
            }
            $('#workarea').css('cursor', 'text');
        },
        saveFile: function saveFile() {
            var output = svgCanvas.getSvgString();
            var defaultFileName = svgCanvas.getLatestImportFileName() || 'untitled';
            var langFile = i18n.lang.topmenu.file;

            window.electron.ipc.send('save-dialog', langFile.save_scene, langFile.all_files, langFile.bvg_files, ['bvg'], defaultFileName, output, localStorage.getItem('lang'));
        },

        //top panel
        update_image_width: function update_image_width(val) {
            _update_attr_changer('image_width', _mm2pixel(val));
        },
        update_image_height: function update_image_height(val) {
            _update_attr_changer('image_height', _mm2pixel(val));
        },
        update_rect_width: function update_rect_width(val) {
            _update_attr_changer('rect_width', _mm2pixel(val));
        },
        update_rect_height: function update_rect_height(val) {
            _update_attr_changer('rect_height', _mm2pixel(val));
        },
        update_angle: function update_angle(val) {
            _update_attr_changer('angle', val);
        },
        update_selected_x: function update_selected_x(val) {
            _update_attr_changer('selected_x', _mm2pixel(val));
        },
        update_selected_y: function update_selected_y(val) {
            _update_attr_changer('selected_y', _mm2pixel(val));
        },
        update_ellipse_cx: function update_ellipse_cx(val) {
            _update_attr_changer('ellipse_cx', _mm2pixel(val));
        },
        update_rect_rx: function update_rect_rx(val) {
            _update_attr_changer('rect_rx', _mm2pixel(val));
        },
        update_ellipse_cy: function update_ellipse_cy(val) {
            _update_attr_changer('ellipse_cy', _mm2pixel(val));
        },
        update_ellipse_rx: function update_ellipse_rx(val) {
            _update_attr_changer('ellipse_rx', _mm2pixel(val));
        },
        update_ellipse_ry: function update_ellipse_ry(val) {
            _update_attr_changer('ellipse_ry', _mm2pixel(val));
        },
        update_line_x1: function update_line_x1(val) {
            _update_attr_changer('line_x1', _mm2pixel(val));
        },
        update_line_y1: function update_line_y1(val) {
            _update_attr_changer('line_y1', _mm2pixel(val));
        },
        update_line_x2: function update_line_x2(val) {
            _update_attr_changer('line_x2', _mm2pixel(val));
        },
        update_line_y2: function update_line_y2(val) {
            _update_attr_changer('line_y2', _mm2pixel(val));
        },
        update_font_family: function update_font_family(val) {
            _update_attr_changer('font_family', val);
        },
        update_font_size: function update_font_size(val) {
            _update_attr_changer('font_size', val);
        },
        update_font_italic: function update_font_italic(val) {
            svgCanvas.setItalic(val);
            window.updateContextPanel();
        },
        update_font_weight: function update_font_weight(val) {
            svgCanvas.setFontWeight(val);
            window.updateContextPanel();
        },
        update_letter_spacing: function update_letter_spacing(val) {
            svgCanvas.setLetterSpacing(val);
            window.updateContextPanel();
        },
        update_font_is_fill: function update_font_is_fill(val) {
            svgCanvas.setFontIsFill(val);
            window.updateContextPanel();
        },
        write_image_data_shading: function write_image_data_shading(elem, val) {
            elem.attr('data-shading', val);
        },
        write_image_data_threshold: function write_image_data_threshold(elem, val) {
            elem.attr('data-threshold', val);
        },

        // others
        reset_select_mode: function reset_select_mode() {
            // simulate user click on empty area of canvas.
            svgCanvas.textActions.clear();
            svgCanvas.setMode('select');
            $(svgroot).trigger({
                type: 'mousedown',
                pageX: 0,
                pageY: 0
            });
            $(svgroot).trigger({
                type: 'mouseup',
                pageX: 0,
                pageY: 0
            });
        }
    };

    return funcs;
});