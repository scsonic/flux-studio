'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

requirejs.config({
    waitSeconds: 30,
    paths: {
        svgEditor: 'app/actions/beambox/svg-editor',

        jsHotkeys: 'lib/svgeditor/js-hotkeys/jquery.hotkeys.min',
        jquerybbq: 'lib/svgeditor/jquerybbq/jquery.bbq.min',
        svgicons: 'lib/svgeditor/svgicons/jquery.svgicons',
        jgraduate: 'lib/svgeditor/jgraduate/jquery.jgraduate.min',
        spinbtn: 'lib/svgeditor/spinbtn/JQuerySpinBtn.min',
        touch: 'lib/svgeditor/touch',

        svgedit: 'lib/svgeditor/svgedit',
        jquerySvg: 'lib/svgeditor/jquery-svg',
        jqueryContextMenu: 'lib/svgeditor/contextmenu/jquery.contextMenu',
        pathseg: 'lib/svgeditor/pathseg',
        browser: 'lib/svgeditor/browser',
        svgtransformlist: 'lib/svgeditor/svgtransformlist',
        math: 'lib/svgeditor/math',
        units: 'lib/svgeditor/units',
        svgutils: 'lib/svgeditor/svgutils',
        sanitize: 'lib/svgeditor/sanitize',
        history: 'lib/svgeditor/history',
        historyrecording: 'lib/svgeditor/historyrecording',
        coords: 'lib/svgeditor/coords',
        recalculate: 'lib/svgeditor/recalculate',
        select: 'lib/svgeditor/select',
        draw: 'lib/svgeditor/draw',
        layer: 'lib/svgeditor/layer',
        path: 'lib/svgeditor/path',
        svgcanvas: 'lib/svgeditor/svgcanvas',
        locale: 'lib/svgeditor/locale/locale',
        contextmenu: 'lib/svgeditor/contextmenu',

        jqueryUi: 'lib/svgeditor/jquery-ui/jquery-ui-1.8.17.custom.min',
        jpicker: 'lib/svgeditor/jgraduate/jpicker'
    },
    shim: {
        //load in the same order with js/lib/svgeditor/svg-editor.html
        jsHotkeys: {
            deps: ['jquery']
        },
        jquerybbq: {
            deps: ['jsHotkeys']
        },
        svgicons: {
            deps: ['jquerybbq']
        },
        jgraduate: {
            deps: ['svgicons']
        },
        spinbtn: {
            deps: ['jgraduate']
        },
        touch: {
            deps: ['spinbtn']
        },

        svgedit: {
            deps: ['touch']
        },
        jquerySvg: {
            deps: ['svgedit']
        },
        jqueryContextMenu: {
            deps: ['jquerySvg']
        },
        pathseg: {
            deps: ['jqueryContextMenu']
        },
        browser: {
            deps: ['pathseg']
        },
        svgtransformlist: {
            deps: ['browser']
        },
        math: {
            deps: ['svgtransformlist']
        },
        units: {
            deps: ['math']
        },
        svgutils: {
            deps: ['units']
        },
        sanitize: {
            deps: ['svgutils']
        },
        history: {
            deps: ['sanitize']
        },
        historyrecording: {
            deps: ['history']
        },
        coords: {
            deps: ['historyrecording']
        },
        recalculate: {
            deps: ['coords']
        },
        select: {
            deps: ['recalculate']
        },
        draw: {
            deps: ['select']
        },
        layer: {
            deps: ['draw']
        },
        path: {
            deps: ['layer']
        },
        svgcanvas: {
            deps: ['path']
        },
        svgEditor: {
            deps: ['svgcanvas']
        },
        locale: {
            deps: ['svgEditor']
        },
        contextmenu: {
            deps: ['locale']
        },
        jqueryUi: {
            deps: ['contextmenu']
        },
        jpicker: {
            deps: ['jqueryUi']
        }

    }
});
define(['react', 'helpers/i18n', 'jsHotkeys', 'jquerybbq', 'svgicons', 'jgraduate', 'spinbtn', 'touch', 'svgedit', 'jquerySvg', 'jqueryContextMenu', 'pathseg', 'browser', 'svgtransformlist', 'math', 'units', 'svgutils', 'sanitize', 'history', 'historyrecording', 'coords', 'recalculate', 'select', 'draw', 'layer', 'path', 'svgcanvas', 'svgEditor', 'locale', 'contextmenu', 'jqueryUi', 'jpicker', 'css!svgeditor/svg-editor', 'css!svgeditor/jgraduate/css/jPicker', 'css!svgeditor/jgraduate/css/jgraduate', 'css!svgeditor/spinbtn/JQuerySpinBtn',
//'css!svgeditor/custom.css'

'lib/svgeditor/canvg/canvg', 'lib/svgeditor/canvg/rgbcolor'], function (React, i18n) {
    var LANG = i18n.lang.beambox;

    'use strict';

    var view = function (_React$Component) {
        _inherits(view, _React$Component);

        function view() {
            _classCallCheck(this, view);

            return _possibleConstructorReturn(this, (view.__proto__ || Object.getPrototypeOf(view)).apply(this, arguments));
        }

        _createClass(view, [{
            key: 'componentDidMount',
            value: function componentDidMount(node) {
                $(svgEditor.init);
            }
        }, {
            key: '_handleDisableHref',
            value: function _handleDisableHref(e) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }, {
            key: 'render',
            value: function render() {
                // HIDE ALMOST ALL TOOLS USING CSS
                return React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'div',
                        { id: 'svg_editor' },
                        React.createElement(
                            'div',
                            { id: 'rulers' },
                            React.createElement('div', { id: 'ruler_corner' }),
                            React.createElement(
                                'div',
                                { id: 'ruler_x' },
                                React.createElement(
                                    'div',
                                    null,
                                    React.createElement('canvas', { height: 15 })
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'ruler_y' },
                                React.createElement(
                                    'div',
                                    null,
                                    React.createElement('canvas', { width: 15 })
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'ruler_unit_shower' },
                                'mm'
                            )
                        ),
                        React.createElement(
                            'div',
                            { id: 'workarea' },
                            React.createElement('style', {
                                id: 'styleoverrides',
                                type: 'text/css',
                                media: 'screen',
                                scoped: 'scoped',
                                dangerouslySetInnerHTML: {
                                    __html: ''
                                }
                            }),
                            React.createElement('div', {
                                id: 'svgcanvas',
                                style: {
                                    position: 'relative'
                                }
                            })
                        ),
                        React.createElement(
                            'div',
                            { id: 'sidepanels' },
                            React.createElement(
                                'div',
                                { id: 'layerpanel' },
                                React.createElement(
                                    'fieldset',
                                    { id: 'layerbuttons' },
                                    React.createElement(
                                        'div',
                                        {
                                            id: 'layer_new',
                                            className: 'layer_button',
                                            title: 'New Layer'
                                        },
                                        React.createElement('i', { className: 'fa fa-plus' })
                                    ),
                                    React.createElement(
                                        'div',
                                        {
                                            id: 'layer_delete',
                                            className: 'layer_button',
                                            title: 'Delete Layer'
                                        },
                                        React.createElement('i', { className: 'fa fa-trash-o' })
                                    ),
                                    React.createElement(
                                        'div',
                                        {
                                            id: 'layer_rename',
                                            className: 'layer_button',
                                            title: 'Rename Layer'
                                        },
                                        React.createElement('i', { className: 'fa fa-font' })
                                    ),
                                    React.createElement(
                                        'div',
                                        {
                                            id: 'layer_up',
                                            className: 'layer_button',
                                            title: 'Move Layer Up'
                                        },
                                        React.createElement('i', { className: 'fa fa-arrow-up' })
                                    ),
                                    React.createElement(
                                        'div',
                                        {
                                            id: 'layer_down',
                                            className: 'layer_button',
                                            title: 'Move Layer Down'
                                        },
                                        React.createElement('i', { className: 'fa fa-arrow-down' })
                                    ),
                                    React.createElement(
                                        'div',
                                        {
                                            id: 'layer_moreopts',
                                            className: 'layer_button',
                                            title: 'More Options'
                                        },
                                        React.createElement('i', { className: 'fa fa-bars' })
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { id: 'layerlist_container' },
                                    React.createElement(
                                        'table',
                                        { id: 'layerlist' },
                                        React.createElement(
                                            'tbody',
                                            null,
                                            React.createElement(
                                                'tr',
                                                { className: 'layer' },
                                                React.createElement('td', { className: 'layervis' }),
                                                React.createElement(
                                                    'td',
                                                    { className: 'layername' },
                                                    'Layer 1'
                                                )
                                            )
                                        )
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'selLayerBlock' },
                                React.createElement(
                                    'span',
                                    { id: 'selLayerLabel' },
                                    'Move elements to:'
                                ),
                                React.createElement(
                                    'select',
                                    {
                                        value: LANG.right_panel.layer_panel.layer1,
                                        id: 'selLayerNames',
                                        title: 'Move selected elements to a different layer',
                                        disabled: 'disabled'
                                    },
                                    React.createElement(
                                        'option',
                                        { value: LANG.right_panel.layer_panel.layer1 },
                                        LANG.right_panel.layer_panel.layer1
                                    )
                                )
                            ),
                            React.createElement('div', { id: 'layer-laser-panel-placeholder' }),
                            React.createElement(
                                'div',
                                {
                                    id: 'sidepanel_handle',
                                    title: 'Drag left/right to resize side panel [X]'
                                },
                                'L a y e r s'
                            )
                        ),
                        React.createElement(
                            'div',
                            { id: 'main_button' },
                            React.createElement(
                                'div',
                                { id: 'main_icon', className: 'tool_button', title: 'Main Menu' },
                                React.createElement(
                                    'span',
                                    null,
                                    'SVG-Edit'
                                ),
                                React.createElement('div', { id: 'logo' }),
                                React.createElement('div', { className: 'dropdown' })
                            ),
                            React.createElement(
                                'div',
                                { id: 'main_menu' },
                                React.createElement(
                                    'ul',
                                    null,
                                    React.createElement(
                                        'li',
                                        { id: 'tool_clear' },
                                        React.createElement('div', null),
                                        'New Image (N)'
                                    ),
                                    React.createElement(
                                        'li',
                                        {
                                            id: 'tool_open',
                                            style: {
                                                display: 'none'
                                            }
                                        },
                                        React.createElement(
                                            'div',
                                            { id: 'fileinputs' },
                                            React.createElement('div', null)
                                        ),
                                        'Open SVG'
                                    ),
                                    React.createElement(
                                        'li',
                                        {
                                            id: 'tool_import',
                                            style: {
                                                display: 'none'
                                            }
                                        },
                                        React.createElement(
                                            'div',
                                            { id: 'fileinputs_import' },
                                            React.createElement('div', null)
                                        ),
                                        'Import Image'
                                    ),
                                    React.createElement(
                                        'li',
                                        { id: 'tool_save' },
                                        React.createElement('div', null),
                                        'Save Image (S)'
                                    ),
                                    React.createElement(
                                        'li',
                                        { id: 'tool_export' },
                                        React.createElement('div', null),
                                        'Export'
                                    ),
                                    React.createElement(
                                        'li',
                                        { id: 'tool_docprops' },
                                        React.createElement('div', null),
                                        'Document Properties (D)'
                                    )
                                ),
                                React.createElement(
                                    'p',
                                    null,
                                    React.createElement(
                                        'a',
                                        { href: 'https://github.com/SVG-Edit/svgedit', target: '_blank' },
                                        'SVG-edit Home Page'
                                    )
                                ),
                                React.createElement(
                                    'button',
                                    { id: 'tool_prefs_option' },
                                    'Editor Options'
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { id: 'tools_top', className: 'tools_panel' },
                            React.createElement(
                                'div',
                                { id: 'editor_panel' },
                                React.createElement('div', { className: 'tool_sep' }),
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_source',
                                    title: 'Edit Source [U]'
                                }),
                                React.createElement('div', {
                                    className: 'tool_button',
                                    id: 'tool_wireframe',
                                    title: 'Wireframe Mode [F]'
                                })
                            ),
                            React.createElement(
                                'div',
                                { id: 'history_panel' },
                                React.createElement('div', { className: 'tool_sep' }),
                                React.createElement('div', {
                                    className: 'push_button tool_button_disabled',
                                    id: 'tool_undo',
                                    title: 'Undo [Z]'
                                }),
                                React.createElement('div', {
                                    className: 'push_button tool_button_disabled',
                                    id: 'tool_redo',
                                    title: 'Redo [Y]'
                                })
                            ),
                            React.createElement(
                                'div',
                                { id: 'selected_panel' },
                                React.createElement(
                                    'div',
                                    { className: 'toolset' },
                                    React.createElement('div', { className: 'tool_sep' }),
                                    React.createElement('div', {
                                        className: 'push_button',
                                        id: 'tool_clone',
                                        title: 'Duplicate Element [D]'
                                    }),
                                    React.createElement('div', {
                                        className: 'push_button',
                                        id: 'tool_delete',
                                        title: 'Delete Element [Delete/Backspace]'
                                    }),
                                    React.createElement('div', { className: 'tool_sep' }),
                                    React.createElement('div', {
                                        className: 'push_button',
                                        id: 'tool_move_top',
                                        title: 'Bring to Front [ Ctrl+Shift+] ]'
                                    }),
                                    React.createElement('div', {
                                        className: 'push_button',
                                        id: 'tool_move_bottom',
                                        title: 'Send to Back [ Ctrl+Shift+[ ]'
                                    }),
                                    React.createElement('div', {
                                        className: 'push_button',
                                        id: 'tool_topath',
                                        title: 'Convert to Path'
                                    }),
                                    React.createElement('div', {
                                        className: 'push_button',
                                        id: 'tool_reorient',
                                        title: 'Reorient path'
                                    }),
                                    React.createElement('div', {
                                        className: 'push_button',
                                        id: 'tool_make_link',
                                        title: 'Make (hyper)link'
                                    }),
                                    React.createElement('div', { className: 'tool_sep' }),
                                    React.createElement(
                                        'label',
                                        { id: 'idLabel', title: 'Identify the element' },
                                        React.createElement(
                                            'span',
                                            null,
                                            'id:'
                                        ),
                                        React.createElement('input', {
                                            id: 'elem_id',
                                            className: 'attr_changer',
                                            'data-attr': 'id',
                                            size: 10,
                                            type: 'text'
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        { id: 'classLabel', title: 'Element class' },
                                        React.createElement(
                                            'span',
                                            null,
                                            'class:'
                                        ),
                                        React.createElement('input', {
                                            id: 'elem_class',
                                            className: 'attr_changer',
                                            'data-attr': 'class',
                                            size: 10,
                                            type: 'text'
                                        })
                                    )
                                ),
                                React.createElement(
                                    'label',
                                    {
                                        id: 'tool_angle',
                                        title: 'Change rotation angle',
                                        className: 'toolset'
                                    },
                                    React.createElement('span', { id: 'angleLabel', className: 'icon_label' }),
                                    React.createElement('input', { id: 'angle', size: 2, defaultValue: 0, type: 'text' })
                                ),
                                React.createElement(
                                    'div',
                                    {
                                        className: 'toolset',
                                        id: 'tool_blur',
                                        title: 'Change gaussian blur value'
                                    },
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement('span', { id: 'blurLabel', className: 'icon_label' }),
                                        React.createElement('input', { id: 'blur', size: 2, defaultValue: 0, type: 'text' })
                                    ),
                                    React.createElement(
                                        'div',
                                        { id: 'blur_dropdown', className: 'dropdown' },
                                        React.createElement('button', null),
                                        React.createElement(
                                            'ul',
                                            null,
                                            React.createElement(
                                                'li',
                                                { className: 'special' },
                                                React.createElement('div', { id: 'blur_slider' })
                                            )
                                        )
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    {
                                        className: 'dropdown toolset',
                                        id: 'tool_position',
                                        title: 'Align Element to Page'
                                    },
                                    React.createElement('div', { id: 'cur_position', className: 'icon_label' }),
                                    React.createElement('button', null)
                                ),
                                React.createElement(
                                    'div',
                                    { id: 'xy_panel', className: 'toolset' },
                                    React.createElement(
                                        'label',
                                        null,
                                        'x:',
                                        ' ',
                                        React.createElement('input', {
                                            id: 'selected_x',
                                            className: 'attr_changer',
                                            title: 'Change X coordinate',
                                            size: 3,
                                            'data-attr': 'x'
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        'y:',
                                        ' ',
                                        React.createElement('input', {
                                            id: 'selected_y',
                                            className: 'attr_changer',
                                            title: 'Change Y coordinate',
                                            size: 3,
                                            'data-attr': 'y'
                                        })
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'multiselected_panel' },
                                React.createElement('div', { className: 'tool_sep' }),
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_clone_multi',
                                    title: 'Clone Elements [C]'
                                }),
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_delete_multi',
                                    title: 'Delete Selected Elements [Delete/Backspace]'
                                }),
                                React.createElement('div', { className: 'tool_sep' }),
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_group_elements',
                                    title: 'Group Elements [G]'
                                }),
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_make_link_multi',
                                    title: 'Make (hyper)link'
                                }),
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_alignleft',
                                    title: 'Align Left'
                                }),
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_aligncenter',
                                    title: 'Align Center'
                                }),
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_alignright',
                                    title: 'Align Right'
                                }),
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_aligntop',
                                    title: 'Align Top'
                                }),
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_alignmiddle',
                                    title: 'Align Middle'
                                }),
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_alignbottom',
                                    title: 'Align Bottom'
                                }),
                                React.createElement(
                                    'label',
                                    { id: 'tool_align_relative' },
                                    React.createElement(
                                        'span',
                                        { id: 'relativeToLabel' },
                                        'relative to:'
                                    ),
                                    React.createElement(
                                        'select',
                                        { id: 'align_relative_to', title: 'Align relative to ...' },
                                        React.createElement(
                                            'option',
                                            { id: 'selected_objects', value: 'selected' },
                                            'selected objects'
                                        ),
                                        React.createElement(
                                            'option',
                                            { id: 'largest_object', value: 'largest' },
                                            'largest object'
                                        ),
                                        React.createElement(
                                            'option',
                                            { id: 'smallest_object', value: 'smallest' },
                                            'smallest object'
                                        ),
                                        React.createElement(
                                            'option',
                                            { id: 'page', value: 'page' },
                                            'page'
                                        )
                                    )
                                ),
                                React.createElement('div', { className: 'tool_sep' })
                            ),
                            React.createElement(
                                'div',
                                { id: 'rect_panel' },
                                React.createElement(
                                    'div',
                                    { className: 'toolset' },
                                    React.createElement(
                                        'label',
                                        { id: 'rect_width_tool', title: 'Change rectangle width' },
                                        React.createElement('span', { id: 'rwidthLabel', className: 'icon_label' }),
                                        React.createElement('input', {
                                            id: 'rect_width',
                                            className: 'attr_changer',
                                            size: 3,
                                            'data-attr': 'width'
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        { id: 'rect_height_tool', title: 'Change rectangle height' },
                                        React.createElement('span', { id: 'rheightLabel', className: 'icon_label' }),
                                        React.createElement('input', {
                                            id: 'rect_height',
                                            className: 'attr_changer',
                                            size: 3,
                                            'data-attr': 'height'
                                        })
                                    )
                                ),
                                React.createElement(
                                    'label',
                                    {
                                        id: 'cornerRadiusLabel',
                                        title: 'Change Rectangle Corner Radius',
                                        className: 'toolset'
                                    },
                                    React.createElement('span', { className: 'icon_label' }),
                                    React.createElement('input', {
                                        id: 'rect_rx',
                                        size: 3,
                                        defaultValue: 0,
                                        type: 'text',
                                        'data-attr': 'Corner Radius'
                                    })
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'image_panel' },
                                React.createElement(
                                    'div',
                                    { className: 'toolset' },
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement('span', { id: 'iwidthLabel', className: 'icon_label' }),
                                        React.createElement('input', {
                                            id: 'image_width',
                                            className: 'attr_changer',
                                            title: 'Change image width',
                                            size: 3,
                                            'data-attr': 'width'
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement('span', { id: 'iheightLabel', className: 'icon_label' }),
                                        React.createElement('input', {
                                            id: 'image_height',
                                            className: 'attr_changer',
                                            title: 'Change image height',
                                            size: 3,
                                            'data-attr': 'height'
                                        })
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'toolset' },
                                    React.createElement(
                                        'label',
                                        { id: 'tool_image_url' },
                                        'url:',
                                        React.createElement('input', {
                                            id: 'image_url',
                                            type: 'text',
                                            title: 'Change URL',
                                            size: 35
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        { id: 'tool_change_image' },
                                        React.createElement(
                                            'button',
                                            {
                                                id: 'change_image_url',
                                                style: {
                                                    display: 'none'
                                                }
                                            },
                                            'Change Image'
                                        ),
                                        React.createElement('span', {
                                            id: 'url_notice',
                                            title: 'NOTE: This image cannot be embedded. It will depend on this path to be displayed'
                                        })
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'circle_panel' },
                                React.createElement(
                                    'div',
                                    { className: 'toolset' },
                                    React.createElement(
                                        'label',
                                        { id: 'tool_circle_cx' },
                                        'cx:',
                                        React.createElement('input', {
                                            id: 'circle_cx',
                                            className: 'attr_changer',
                                            title: 'Change circle\'s cx coordinate',
                                            size: 3,
                                            'data-attr': 'cx'
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        { id: 'tool_circle_cy' },
                                        'cy:',
                                        React.createElement('input', {
                                            id: 'circle_cy',
                                            className: 'attr_changer',
                                            title: 'Change circle\'s cy coordinate',
                                            size: 3,
                                            'data-attr': 'cy'
                                        })
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'toolset' },
                                    React.createElement(
                                        'label',
                                        { id: 'tool_circle_r' },
                                        'r:',
                                        React.createElement('input', {
                                            id: 'circle_r',
                                            className: 'attr_changer',
                                            title: 'Change circle\'s radius',
                                            size: 3,
                                            'data-attr': 'r'
                                        })
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'ellipse_panel' },
                                React.createElement(
                                    'div',
                                    { className: 'toolset' },
                                    React.createElement(
                                        'label',
                                        { id: 'tool_ellipse_cx' },
                                        'cx:',
                                        React.createElement('input', {
                                            id: 'ellipse_cx',
                                            className: 'attr_changer',
                                            title: 'Change ellipse\'s cx coordinate',
                                            size: 3,
                                            'data-attr': 'cx'
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        { id: 'tool_ellipse_cy' },
                                        'cy:',
                                        React.createElement('input', {
                                            id: 'ellipse_cy',
                                            className: 'attr_changer',
                                            title: 'Change ellipse\'s cy coordinate',
                                            size: 3,
                                            'data-attr': 'cy'
                                        })
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'toolset' },
                                    React.createElement(
                                        'label',
                                        { id: 'tool_ellipse_rx' },
                                        'rx:',
                                        React.createElement('input', {
                                            id: 'ellipse_rx',
                                            className: 'attr_changer',
                                            title: 'Change ellipse\'s x radius',
                                            size: 3,
                                            'data-attr': 'rx'
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        { id: 'tool_ellipse_ry' },
                                        'ry:',
                                        React.createElement('input', {
                                            id: 'ellipse_ry',
                                            className: 'attr_changer',
                                            title: 'Change ellipse\'s y radius',
                                            size: 3,
                                            'data-attr': 'ry'
                                        })
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'line_panel' },
                                React.createElement(
                                    'div',
                                    { className: 'toolset' },
                                    React.createElement(
                                        'label',
                                        { id: 'tool_line_x1' },
                                        'x1:',
                                        React.createElement('input', {
                                            id: 'line_x1',
                                            className: 'attr_changer',
                                            title: 'Change line\'s starting x coordinate',
                                            size: 3,
                                            'data-attr': 'x1'
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        { id: 'tool_line_y1' },
                                        'y1:',
                                        React.createElement('input', {
                                            id: 'line_y1',
                                            className: 'attr_changer',
                                            title: 'Change line\'s starting y coordinate',
                                            size: 3,
                                            'data-attr': 'y1'
                                        })
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'toolset' },
                                    React.createElement(
                                        'label',
                                        { id: 'tool_line_x2' },
                                        'x2:',
                                        React.createElement('input', {
                                            id: 'line_x2',
                                            className: 'attr_changer',
                                            title: 'Change line\'s ending x coordinate',
                                            size: 3,
                                            'data-attr': 'x2'
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        { id: 'tool_line_y2' },
                                        'y2:',
                                        React.createElement('input', {
                                            id: 'line_y2',
                                            className: 'attr_changer',
                                            title: 'Change line\'s ending y coordinate',
                                            size: 3,
                                            'data-attr': 'y2'
                                        })
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'text_panel' },
                                React.createElement(
                                    'div',
                                    { className: 'toolset' },
                                    React.createElement(
                                        'div',
                                        {
                                            className: 'tool_button',
                                            id: 'tool_bold',
                                            title: 'Bold Text [B]'
                                        },
                                        React.createElement('span', null),
                                        'B'
                                    ),
                                    React.createElement(
                                        'div',
                                        {
                                            className: 'tool_button',
                                            id: 'tool_italic',
                                            title: 'Italic Text [I]'
                                        },
                                        React.createElement('span', null),
                                        'i'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'toolset', id: 'tool_font_family' },
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement('input', {
                                            id: 'font_family',
                                            type: 'text',
                                            title: 'Change Font Family',
                                            size: 12
                                        })
                                    ),
                                    React.createElement(
                                        'div',
                                        { id: 'font_family_dropdown', className: 'dropdown' },
                                        React.createElement('button', null),
                                        React.createElement(
                                            'ul',
                                            null,
                                            React.createElement(
                                                'li',
                                                {
                                                    style: {
                                                        fontFamily: 'serif'
                                                    }
                                                },
                                                'Serif'
                                            ),
                                            React.createElement(
                                                'li',
                                                {
                                                    style: {
                                                        fontFamily: 'sans-serif'
                                                    }
                                                },
                                                'Sans-serif'
                                            ),
                                            React.createElement(
                                                'li',
                                                {
                                                    style: {
                                                        fontFamily: 'cursive'
                                                    }
                                                },
                                                'Cursive'
                                            ),
                                            React.createElement(
                                                'li',
                                                {
                                                    style: {
                                                        fontFamily: 'fantasy'
                                                    }
                                                },
                                                'Fantasy'
                                            ),
                                            React.createElement(
                                                'li',
                                                {
                                                    style: {
                                                        fontFamily: 'monospace'
                                                    }
                                                },
                                                'Monospace'
                                            )
                                        )
                                    )
                                ),
                                React.createElement(
                                    'label',
                                    { id: 'tool_font_size', title: 'Change Font Size' },
                                    React.createElement('span', { id: 'font_sizeLabel', className: 'icon_label' }),
                                    React.createElement('input', { id: 'font_size', size: 3, defaultValue: 0, type: 'text' })
                                ),
                                React.createElement('input', { id: 'text', type: 'text', size: 35 })
                            ),
                            React.createElement(
                                'div',
                                { id: 'container_panel' },
                                React.createElement('div', { className: 'tool_sep' }),
                                React.createElement(
                                    'label',
                                    { id: 'group_title', title: 'Group identification label' },
                                    React.createElement(
                                        'span',
                                        null,
                                        'label:'
                                    ),
                                    React.createElement('input', { id: 'g_title', 'data-attr': 'title', size: 10, type: 'text' })
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'use_panel' },
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_unlink_use',
                                    title: 'Break link to reference element (make unique)'
                                })
                            ),
                            React.createElement(
                                'div',
                                { id: 'g_panel' },
                                React.createElement('div', {
                                    className: 'push_button',
                                    id: 'tool_ungroup',
                                    title: 'Ungroup Elements [G]'
                                })
                            ),
                            React.createElement(
                                'div',
                                { id: 'a_panel' },
                                React.createElement(
                                    'label',
                                    {
                                        id: 'tool_link_url',
                                        title: 'Set link URL (leave empty to remove)'
                                    },
                                    React.createElement('span', { id: 'linkLabel', className: 'icon_label' }),
                                    React.createElement('input', { id: 'link_url', type: 'text', size: 35 })
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'path_node_panel' },
                                React.createElement('div', { className: 'tool_sep' }),
                                React.createElement('div', {
                                    className: 'tool_button push_button_pressed',
                                    id: 'tool_node_link',
                                    title: 'Link Control Points'
                                }),
                                React.createElement('div', { className: 'tool_sep' }),
                                React.createElement(
                                    'label',
                                    { id: 'tool_node_x' },
                                    'x:',
                                    React.createElement('input', {
                                        id: 'path_node_x',
                                        className: 'attr_changer',
                                        title: 'Change node\'s x coordinate',
                                        size: 3,
                                        'data-attr': 'x'
                                    })
                                ),
                                React.createElement(
                                    'label',
                                    { id: 'tool_node_y' },
                                    'y:',
                                    React.createElement('input', {
                                        id: 'path_node_y',
                                        className: 'attr_changer',
                                        title: 'Change node\'s y coordinate',
                                        size: 3,
                                        'data-attr': 'y'
                                    })
                                ),
                                React.createElement(
                                    'select',
                                    { id: 'seg_type', title: 'Change Segment type', defaultValue: 4 },
                                    React.createElement(
                                        'option',
                                        { id: 'straight_segments', value: 4 },
                                        'Straight'
                                    ),
                                    React.createElement(
                                        'option',
                                        { id: 'curve_segments', value: 6 },
                                        'Curve'
                                    )
                                ),
                                React.createElement('div', {
                                    className: 'tool_button',
                                    id: 'tool_node_clone',
                                    title: 'Clone Node'
                                }),
                                React.createElement('div', {
                                    className: 'tool_button',
                                    id: 'tool_node_delete',
                                    title: 'Delete Node'
                                }),
                                React.createElement('div', {
                                    className: 'tool_button',
                                    id: 'tool_openclose_path',
                                    title: 'Open/close sub-path'
                                }),
                                React.createElement('div', {
                                    className: 'tool_button',
                                    id: 'tool_add_subpath',
                                    title: 'Add sub-path'
                                })
                            )
                        ),
                        ' ',
                        React.createElement('div', { id: 'cur_context_panel' }),
                        React.createElement(
                            'div',
                            { id: 'tools_left', className: 'tools_panel' },
                            React.createElement('div', { className: 'tool_button', id: 'tool_select', title: 'Select Tool' }),
                            React.createElement('div', { className: 'tool_button', id: 'tool_fhpath', title: 'Pencil Tool' }),
                            React.createElement('div', { className: 'tool_button', id: 'tool_line', title: 'Line Tool' }),
                            React.createElement(
                                'div',
                                {
                                    className: 'tool_button flyout_current',
                                    id: 'tools_rect_show',
                                    title: 'Square/Rect Tool'
                                },
                                React.createElement('div', { className: 'flyout_arrow_horiz' })
                            ),
                            React.createElement(
                                'div',
                                {
                                    className: 'tool_button flyout_current',
                                    id: 'tools_ellipse_show',
                                    title: 'Ellipse/Circle Tool'
                                },
                                React.createElement('div', { className: 'flyout_arrow_horiz' })
                            ),
                            React.createElement('div', { className: 'tool_button', id: 'tool_path', title: 'Path Tool' }),
                            React.createElement('div', { className: 'tool_button', id: 'tool_text', title: 'Text Tool' }),
                            React.createElement('div', { className: 'tool_button', id: 'tool_image', title: 'Image Tool' }),
                            React.createElement('div', {
                                className: 'tool_button',
                                id: 'tool_zoom',
                                title: 'Zoom Tool [Ctrl+Up/Down]'
                            }),
                            React.createElement(
                                'div',
                                {
                                    style: {
                                        display: 'none'
                                    }
                                },
                                React.createElement('div', { id: 'tool_rect', title: 'Rectangle' }),
                                React.createElement('div', { id: 'tool_square', title: 'Square' }),
                                React.createElement('div', { id: 'tool_fhrect', title: 'Free-Hand Rectangle' }),
                                React.createElement('div', { id: 'tool_ellipse', title: 'Ellipse' }),
                                React.createElement('div', { id: 'tool_path', title: 'Path' }),
                                React.createElement('div', { id: 'tool_polygon', title: 'Polygon' }),
                                React.createElement('div', { id: 'tool_circle', title: 'Circle' }),
                                React.createElement('div', { id: 'tool_fhellipse', title: 'Free-Hand Ellipse' })
                            )
                        ),
                        ' ',
                        React.createElement(
                            'div',
                            { id: 'tools_bottom', className: 'tools_panel' },
                            React.createElement(
                                'div',
                                { id: 'zoom_panel', className: 'toolset', title: 'Change zoom level' },
                                React.createElement(
                                    'label',
                                    null,
                                    React.createElement('span', { id: 'zoomLabel', className: 'zoom_tool icon_label' }),
                                    React.createElement('input', { id: 'zoom', size: 3, defaultValue: 100, type: 'text' })
                                ),
                                React.createElement('div', { className: 'tool_sep' })
                            ),
                            React.createElement(
                                'div',
                                { id: 'tools_bottom_2' },
                                React.createElement(
                                    'div',
                                    { id: 'color_tools' },
                                    React.createElement(
                                        'div',
                                        { className: 'color_tool', id: 'tool_fill' },
                                        React.createElement('label', {
                                            className: 'icon_label',
                                            htmlFor: 'fill_color',
                                            title: 'Change fill color'
                                        }),
                                        React.createElement(
                                            'div',
                                            { className: 'color_block' },
                                            React.createElement('div', { id: 'fill_bg' }),
                                            React.createElement('div', { id: 'fill_color', className: 'color_block' })
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'color_tool', id: 'tool_stroke' },
                                        React.createElement('label', { className: 'icon_label', title: 'Change stroke color' }),
                                        React.createElement(
                                            'div',
                                            { className: 'color_block' },
                                            React.createElement('div', { id: 'stroke_bg' }),
                                            React.createElement('div', {
                                                id: 'stroke_color',
                                                className: 'color_block',
                                                title: 'Change stroke color'
                                            })
                                        ),
                                        React.createElement(
                                            'label',
                                            { className: 'stroke_label' },
                                            React.createElement('input', {
                                                id: 'stroke_width',
                                                title: 'Change stroke width by 1, shift-click to change by 0.1',
                                                size: 2,
                                                defaultValue: 5,
                                                type: 'text',
                                                'data-attr': 'Stroke Width'
                                            })
                                        ),
                                        React.createElement('div', {
                                            id: 'toggle_stroke_tools',
                                            title: 'Show/hide more stroke tools'
                                        }),
                                        React.createElement(
                                            'label',
                                            { className: 'stroke_tool' },
                                            React.createElement(
                                                'select',
                                                { id: 'stroke_style', defaultValue: 'none', title: 'Change stroke dash style' },
                                                React.createElement(
                                                    'option',
                                                    { value: 'none' },
                                                    '\u2014'
                                                ),
                                                React.createElement(
                                                    'option',
                                                    { value: '2,2' },
                                                    '...'
                                                ),
                                                React.createElement(
                                                    'option',
                                                    { value: '5,5' },
                                                    '- -'
                                                ),
                                                React.createElement(
                                                    'option',
                                                    { value: '5,2,2,2' },
                                                    '- .'
                                                ),
                                                React.createElement(
                                                    'option',
                                                    { value: '5,2,2,2,2,2' },
                                                    '- ..'
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'stroke_tool dropdown', id: 'stroke_linejoin' },
                                            React.createElement('div', { id: 'cur_linejoin', title: 'Linejoin: Miter' }),
                                            React.createElement('button', null)
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'stroke_tool dropdown', id: 'stroke_linecap' },
                                            React.createElement('div', { id: 'cur_linecap', title: 'Linecap: Butt' }),
                                            React.createElement('button', null)
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        {
                                            className: 'color_tool',
                                            id: 'tool_opacity',
                                            title: 'Change selected item opacity'
                                        },
                                        React.createElement(
                                            'label',
                                            null,
                                            React.createElement('span', { id: 'group_opacityLabel', className: 'icon_label' }),
                                            React.createElement('input', {
                                                id: 'group_opacity',
                                                size: 3,
                                                defaultValue: 100,
                                                type: 'text'
                                            })
                                        ),
                                        React.createElement(
                                            'div',
                                            { id: 'opacity_dropdown', className: 'dropdown' },
                                            React.createElement('button', null),
                                            React.createElement(
                                                'ul',
                                                null,
                                                React.createElement(
                                                    'li',
                                                    null,
                                                    '0%'
                                                ),
                                                React.createElement(
                                                    'li',
                                                    null,
                                                    '25%'
                                                ),
                                                React.createElement(
                                                    'li',
                                                    null,
                                                    '50%'
                                                ),
                                                React.createElement(
                                                    'li',
                                                    null,
                                                    '75%'
                                                ),
                                                React.createElement(
                                                    'li',
                                                    null,
                                                    '100%'
                                                ),
                                                React.createElement(
                                                    'li',
                                                    { className: 'special' },
                                                    React.createElement('div', { id: 'opac_slider' })
                                                )
                                            )
                                        )
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'tools_bottom_3' },
                                React.createElement(
                                    'div',
                                    { id: 'palette_holder' },
                                    React.createElement('div', {
                                        id: 'palette',
                                        title: 'Click to change fill color, shift-click to change stroke color'
                                    })
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { id: 'option_lists', className: 'dropdown' },
                            React.createElement(
                                'ul',
                                { id: 'linejoin_opts' },
                                React.createElement('li', {
                                    className: 'tool_button current',
                                    id: 'linejoin_miter',
                                    title: 'Linejoin: Miter'
                                }),
                                React.createElement('li', {
                                    className: 'tool_button',
                                    id: 'linejoin_round',
                                    title: 'Linejoin: Round'
                                }),
                                React.createElement('li', {
                                    className: 'tool_button',
                                    id: 'linejoin_bevel',
                                    title: 'Linejoin: Bevel'
                                })
                            ),
                            React.createElement(
                                'ul',
                                { id: 'linecap_opts' },
                                React.createElement('li', {
                                    className: 'tool_button current',
                                    id: 'linecap_butt',
                                    title: 'Linecap: Butt'
                                }),
                                React.createElement('li', {
                                    className: 'tool_button',
                                    id: 'linecap_square',
                                    title: 'Linecap: Square'
                                }),
                                React.createElement('li', {
                                    className: 'tool_button',
                                    id: 'linecap_round',
                                    title: 'Linecap: Round'
                                })
                            ),
                            React.createElement(
                                'ul',
                                { id: 'position_opts', className: 'optcols3' },
                                React.createElement('li', {
                                    className: 'push_button',
                                    id: 'tool_posleft',
                                    title: 'Align Left'
                                }),
                                React.createElement('li', {
                                    className: 'push_button',
                                    id: 'tool_poscenter',
                                    title: 'Align Center'
                                }),
                                React.createElement('li', {
                                    className: 'push_button',
                                    id: 'tool_posright',
                                    title: 'Align Right'
                                }),
                                React.createElement('li', { className: 'push_button', id: 'tool_postop', title: 'Align Top' }),
                                React.createElement('li', {
                                    className: 'push_button',
                                    id: 'tool_posmiddle',
                                    title: 'Align Middle'
                                }),
                                React.createElement('li', {
                                    className: 'push_button',
                                    id: 'tool_posbottom',
                                    title: 'Align Bottom'
                                })
                            )
                        ),
                        React.createElement('div', { id: 'color_picker' })
                    ),
                    ' ',
                    React.createElement(
                        'div',
                        { id: 'svg_source_editor' },
                        React.createElement('div', { className: 'overlay' }),
                        React.createElement(
                            'div',
                            { id: 'svg_source_container' },
                            React.createElement(
                                'div',
                                { id: 'tool_source_back', className: 'toolbar_button' },
                                React.createElement(
                                    'button',
                                    { id: 'tool_source_save' },
                                    'Apply Changes'
                                ),
                                React.createElement(
                                    'button',
                                    { id: 'tool_source_cancel' },
                                    'Cancel'
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: 'save_output_btns' },
                                React.createElement(
                                    'p',
                                    { id: 'copy_save_note' },
                                    'Copy the contents of this box into a text editor, then save the file with a .svg extension.'
                                ),
                                React.createElement(
                                    'button',
                                    { id: 'copy_save_done' },
                                    'Done'
                                )
                            ),
                            React.createElement(
                                'form',
                                null,
                                React.createElement('textarea', {
                                    id: 'svg_source_textarea',
                                    spellCheck: 'false',
                                    defaultValue: ''
                                })
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { id: 'svg_docprops' },
                        React.createElement('div', { className: 'overlay' }),
                        React.createElement(
                            'div',
                            { id: 'svg_docprops_container' },
                            React.createElement(
                                'div',
                                { id: 'tool_docprops_back', className: 'toolbar_button' },
                                React.createElement(
                                    'button',
                                    { id: 'tool_docprops_save' },
                                    'OK'
                                ),
                                React.createElement(
                                    'button',
                                    { id: 'tool_docprops_cancel' },
                                    'Cancel'
                                )
                            ),
                            React.createElement(
                                'fieldset',
                                { id: 'svg_docprops_docprops' },
                                React.createElement(
                                    'legend',
                                    { id: 'svginfo_image_props' },
                                    'Image Properties'
                                ),
                                React.createElement(
                                    'label',
                                    null,
                                    React.createElement(
                                        'span',
                                        { id: 'svginfo_title' },
                                        'Title:'
                                    ),
                                    React.createElement('input', { type: 'text', id: 'canvas_title' })
                                ),
                                React.createElement(
                                    'fieldset',
                                    { id: 'change_resolution' },
                                    React.createElement(
                                        'legend',
                                        { id: 'svginfo_dim' },
                                        'Canvas Dimensions'
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement(
                                            'span',
                                            { id: 'svginfo_width' },
                                            'width:'
                                        ),
                                        ' ',
                                        React.createElement('input', { type: 'text', id: 'canvas_width', size: 6 })
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement(
                                            'span',
                                            { id: 'svginfo_height' },
                                            'height:'
                                        ),
                                        ' ',
                                        React.createElement('input', { type: 'text', id: 'canvas_height', size: 6 })
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement(
                                            'select',
                                            { id: 'resolution', defaultValue: 'predefined' },
                                            React.createElement(
                                                'option',
                                                { id: 'selectedPredefined', value: 'predefined' },
                                                'Select predefined:'
                                            ),
                                            React.createElement(
                                                'option',
                                                null,
                                                '640x480'
                                            ),
                                            React.createElement(
                                                'option',
                                                null,
                                                '800x600'
                                            ),
                                            React.createElement(
                                                'option',
                                                null,
                                                '1024x768'
                                            ),
                                            React.createElement(
                                                'option',
                                                null,
                                                '1280x960'
                                            ),
                                            React.createElement(
                                                'option',
                                                null,
                                                '1600x1200'
                                            ),
                                            React.createElement(
                                                'option',
                                                { id: 'fitToContent', value: 'content' },
                                                'Fit to Content'
                                            )
                                        )
                                    )
                                ),
                                React.createElement(
                                    'fieldset',
                                    { id: 'image_save_opts' },
                                    React.createElement(
                                        'legend',
                                        { id: 'includedImages' },
                                        'Included Images'
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement('input', {
                                            type: 'radio',
                                            name: 'image_opt',
                                            defaultValue: 'embed',
                                            defaultChecked: 'checked'
                                        }),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { id: 'image_opt_embed' },
                                            'Embed data (local files)'
                                        ),
                                        ' '
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement('input', {
                                            type: 'radio',
                                            name: 'image_opt',
                                            defaultValue: 'ref'
                                        }),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { id: 'image_opt_ref' },
                                            'Use file reference'
                                        ),
                                        ' '
                                    )
                                )
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { id: 'svg_prefs' },
                        React.createElement('div', { className: 'overlay' }),
                        React.createElement(
                            'div',
                            { id: 'svg_prefs_container' },
                            React.createElement(
                                'div',
                                { id: 'tool_prefs_back', className: 'toolbar_button' },
                                React.createElement(
                                    'button',
                                    { id: 'tool_prefs_save' },
                                    'OK'
                                ),
                                React.createElement(
                                    'button',
                                    { id: 'tool_prefs_cancel' },
                                    'Cancel'
                                )
                            ),
                            React.createElement(
                                'fieldset',
                                null,
                                React.createElement(
                                    'legend',
                                    { id: 'svginfo_editor_prefs' },
                                    'Editor Preferences'
                                ),
                                React.createElement(
                                    'label',
                                    null,
                                    React.createElement(
                                        'span',
                                        { id: 'svginfo_lang' },
                                        'Language:'
                                    ),
                                    React.createElement(
                                        'select',
                                        { id: 'lang_select', defaultValue: 'en' },
                                        React.createElement(
                                            'option',
                                            { id: 'lang_en', value: 'en' },
                                            'English'
                                        ),
                                        React.createElement(
                                            'option',
                                            { id: 'lang_zh-TW', value: 'zh-TW' },
                                            '\u7E41\u9AD4\u4E2D\u6587'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'label',
                                    null,
                                    React.createElement(
                                        'span',
                                        { id: 'svginfo_icons' },
                                        'Icon size:'
                                    ),
                                    React.createElement(
                                        'select',
                                        { id: 'iconsize', defaultValue: 'm' },
                                        React.createElement(
                                            'option',
                                            { id: 'icon_small', value: 's' },
                                            'Small'
                                        ),
                                        React.createElement(
                                            'option',
                                            { id: 'icon_medium', value: 'm' },
                                            'Medium'
                                        ),
                                        React.createElement(
                                            'option',
                                            { id: 'icon_large', value: 'l' },
                                            'Large'
                                        ),
                                        React.createElement(
                                            'option',
                                            { id: 'icon_xlarge', value: 'xl' },
                                            'Extra Large'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'fieldset',
                                    { id: 'change_background' },
                                    React.createElement(
                                        'legend',
                                        { id: 'svginfo_change_background' },
                                        'Editor Background'
                                    ),
                                    React.createElement('div', { id: 'bg_blocks' }),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement(
                                            'span',
                                            { id: 'svginfo_bg_url' },
                                            'URL:'
                                        ),
                                        ' ',
                                        React.createElement('input', { type: 'text', id: 'canvas_bg_url' })
                                    ),
                                    React.createElement(
                                        'p',
                                        { id: 'svginfo_bg_note' },
                                        'Note: Background will not be saved with image.'
                                    )
                                ),
                                React.createElement(
                                    'fieldset',
                                    { id: 'change_grid' },
                                    React.createElement(
                                        'legend',
                                        { id: 'svginfo_grid_settings' },
                                        'Grid'
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement(
                                            'span',
                                            { id: 'svginfo_snap_onoff' },
                                            'Snapping on/off'
                                        ),
                                        React.createElement('input', {
                                            type: 'checkbox',
                                            defaultValue: 'snapping_on',
                                            id: 'grid_snapping_on'
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement(
                                            'span',
                                            { id: 'svginfo_snap_step' },
                                            'Snapping Step-Size:'
                                        ),
                                        ' ',
                                        React.createElement('input', {
                                            type: 'text',
                                            id: 'grid_snapping_step',
                                            size: 3,
                                            defaultValue: 10
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement(
                                            'span',
                                            { id: 'svginfo_grid_color' },
                                            'Grid color:'
                                        ),
                                        ' ',
                                        React.createElement('input', {
                                            type: 'text',
                                            id: 'grid_color',
                                            size: 3,
                                            defaultValue: '#000'
                                        })
                                    )
                                ),
                                React.createElement(
                                    'fieldset',
                                    { id: 'units_rulers' },
                                    React.createElement(
                                        'legend',
                                        { id: 'svginfo_units_rulers' },
                                        'Units & Rulers'
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement(
                                            'span',
                                            { id: 'svginfo_rulers_onoff' },
                                            'Show rulers'
                                        ),
                                        React.createElement('input', {
                                            type: 'checkbox',
                                            defaultValue: 'show_rulers',
                                            id: 'show_rulers',
                                            defaultChecked: 'checked'
                                        })
                                    ),
                                    React.createElement(
                                        'label',
                                        null,
                                        React.createElement(
                                            'span',
                                            { id: 'svginfo_unit' },
                                            'Base Unit:'
                                        ),
                                        React.createElement(
                                            'select',
                                            { id: 'base_unit' },
                                            React.createElement(
                                                'option',
                                                { value: 'px' },
                                                'Pixels'
                                            ),
                                            React.createElement(
                                                'option',
                                                { value: 'cm' },
                                                'Centimeters'
                                            ),
                                            React.createElement(
                                                'option',
                                                { value: 'mm' },
                                                'Millimeters'
                                            ),
                                            React.createElement(
                                                'option',
                                                { value: 'in' },
                                                'Inches'
                                            ),
                                            React.createElement(
                                                'option',
                                                { value: 'pt' },
                                                'Points'
                                            ),
                                            React.createElement(
                                                'option',
                                                { value: 'pc' },
                                                'Picas'
                                            ),
                                            React.createElement(
                                                'option',
                                                { value: 'em' },
                                                'Ems'
                                            ),
                                            React.createElement(
                                                'option',
                                                { value: 'ex' },
                                                'Exs'
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { id: 'dialog_box' },
                        React.createElement('div', { className: 'overlay' }),
                        React.createElement(
                            'div',
                            { id: 'dialog_container' },
                            React.createElement('div', { id: 'dialog_content' }),
                            React.createElement('div', { id: 'dialog_buttons' })
                        )
                    ),
                    React.createElement(
                        'ul',
                        { id: 'cmenu_canvas', className: 'contextMenu' },
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#cut', onClick: this._handleDisableHref },
                                'Cut'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#copy', onClick: this._handleDisableHref },
                                'Copy'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#paste', onClick: this._handleDisableHref },
                                'Paste'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#paste_in_place', onClick: this._handleDisableHref },
                                'Paste in Place'
                            )
                        ),
                        React.createElement(
                            'li',
                            { className: 'separator' },
                            React.createElement(
                                'a',
                                { href: '#delete', onClick: this._handleDisableHref },
                                'Delete'
                            )
                        ),
                        React.createElement(
                            'li',
                            { className: 'separator' },
                            React.createElement(
                                'a',
                                { href: '#group', onClick: this._handleDisableHref },
                                'Group'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#ungroup', onClick: this._handleDisableHref },
                                'Ungroup'
                            )
                        ),
                        React.createElement(
                            'li',
                            { className: 'separator' },
                            React.createElement(
                                'a',
                                { href: '#move_front', onClick: this._handleDisableHref },
                                'Bring to Front'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#move_up', onClick: this._handleDisableHref },
                                'Bring Forward'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#move_down', onClick: this._handleDisableHref },
                                'Send Backward'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#move_back', onClick: this._handleDisableHref },
                                'Send to Back'
                            )
                        )
                    ),
                    React.createElement(
                        'ul',
                        { id: 'cmenu_layers', className: 'contextMenu' },
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#dupe', onClick: this._handleDisableHref },
                                'Duplicate Layer...'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#merge_down', onClick: this._handleDisableHref },
                                'Merge Down'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#merge_all', onClick: this._handleDisableHref },
                                'Merge All'
                            )
                        )
                    )
                );
            }
        }]);

        return view;
    }(React.Component);

    return view;
});