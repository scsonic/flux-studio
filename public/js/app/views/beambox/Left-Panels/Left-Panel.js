'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'reactDOM', 'app/actions/beambox/svgeditor-function-wrapper', 'app/actions/global-actions', 'app/stores/beambox-store', 'jsx!views/beambox/Left-Panels/Insert-Object-Submenu', 'jsx!views/beambox/Left-Panels/Preview-Button', 'jsx!views/beambox/Left-Panels/Advanced-Panel', 'helpers/api/inter-process', 'helpers/i18n'], function (React, ReactDOM, FnWrapper, GlobalActions, BeamboxStore, InsertObjectSubmenu, PreviewButton, AdvancedPanel, InterProcessApi, i18n) {
    var LANG = i18n.lang.beambox.left_panel;
    var interProcessWebSocket = InterProcessApi();

    var LeftPanel = function (_React$Component) {
        _inherits(LeftPanel, _React$Component);

        function LeftPanel() {
            _classCallCheck(this, LeftPanel);

            var _this = _possibleConstructorReturn(this, (LeftPanel.__proto__ || Object.getPrototypeOf(LeftPanel)).call(this));

            _this.state = {
                isInsertObjectMenuOpen: false,
                isAdvancedPanelOpen: false
                // preview button is managed by itself
            };
            return _this;
        }

        _createClass(LeftPanel, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                // Selection Management
                $('#svgcanvas').mouseup(function () {
                    _this2._toggleInsert(false);
                    GlobalActions.monitorClosed();
                });

                $('#layerpanel').mouseup(function () {
                    _this2._toggleInsert(false);
                    _this2._toggleAdvanced(false);
                    FnWrapper.clearSelection();
                    GlobalActions.monitorClosed();
                });

                $('#layerpanel').mouseup(function () {
                    _this2._toggleInsert(false);
                    _this2._toggleAdvanced(false);
                    FnWrapper.clearSelection();
                    GlobalActions.monitorClosed();
                });

                $('#layer-laser-panel-placeholder').mouseup(function () {
                    _this2._toggleInsert(false);
                    _this2._toggleAdvanced(false);
                    FnWrapper.clearSelection();
                    GlobalActions.monitorClosed();
                });

                $('.selLayerBlock').mouseup(function () {
                    GlobalActions.monitorClosed();
                });
                _;
                $('#tools_top').mouseup(function () {
                    _this2._toggleAdvanced(false);
                    _this2._toggleInsert(false);
                    FnWrapper.clearSelection();
                    GlobalActions.monitorClosed();
                });

                // Add class color to #svg_editor
                $('#svg_editor').addClass('color');

                BeamboxStore.onCloseInsertObjectSubmenu(function () {
                    return _this2.closeInsertObjectSubmenu();
                });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                var _this3 = this;

                $('#svg_editor').removeClass('color');

                BeamboxStore.removeCloseInsertObjectSubmenuListener(function () {
                    return _this3.closeInsertObjectSubmenu();
                });
            }
        }, {
            key: 'closeInsertObjectSubmenu',
            value: function closeInsertObjectSubmenu() {
                this._toggleInsert(false);
            }
        }, {
            key: '_toggleAdvanced',
            value: function _toggleAdvanced(isOpen) {
                if (this.state.isAdvancedPanelOpen === isOpen) {
                    return;
                }

                this.setState({ isAdvancedPanelOpen: isOpen });

                if (isOpen) {
                    this._toggleInsert(false);
                    FnWrapper.clearSelection();
                    GlobalActions.monitorClosed();
                }
            }
        }, {
            key: '_toggleInsert',
            value: function _toggleInsert(isOpen) {
                if (this.state.isInsertObjectMenuOpen === isOpen) {
                    return;
                }

                this.setState({ isInsertObjectMenuOpen: isOpen });

                if (isOpen) {
                    FnWrapper.clearSelection();
                    GlobalActions.monitorClosed();
                }
            }
        }, {
            key: '_renderInsertObject',
            value: function _renderInsertObject() {
                var _this4 = this;

                var insertObjectPanel = React.createElement(InsertObjectSubmenu, { onClose: function onClose() {
                        return _this4._toggleInsert(false);
                    } });

                return React.createElement(
                    'div',
                    { className: 'ui ui-dialog-menu' },
                    React.createElement(
                        'div',
                        { className: 'ui-dialog-menu-item' },
                        React.createElement(
                            'div',
                            { className: 'dialog-label', style: { width: 'auto' }, onClick: function onClick() {
                                    return _this4._toggleInsert(true);
                                } },
                            LANG.insert_object
                        ),
                        this.state.isInsertObjectMenuOpen ? insertObjectPanel : ''
                    )
                );
            }
        }, {
            key: '_renderAdvanced',
            value: function _renderAdvanced() {
                var _this5 = this;

                var advancedPanel = React.createElement(AdvancedPanel, { onClose: function onClose() {
                        return _this5._toggleAdvanced(false);
                    } });

                return React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'div',
                        { className: 'option', onClick: function onClick() {
                                return _this5._toggleAdvanced(true);
                            }, style: { display: 'inline-block', width: 'unset' } },
                        LANG.advanced
                    ),
                    this.state.isAdvancedPanelOpen ? advancedPanel : ''
                );
            }
        }, {
            key: 'render',
            value: function render() {
                return React.createElement(
                    'div',
                    { className: 'left-panel' },
                    this._renderInsertObject(),
                    React.createElement(PreviewButton, null),
                    this._renderAdvanced()
                );
            }
        }]);

        return LeftPanel;
    }(React.Component);

    return LeftPanel;
});