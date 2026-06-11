'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'app/actions/beambox/svgeditor-function-wrapper', 'app/stores/topbar-store', 'jsx!views/toolbox/Toolbox-Item', 'helpers/i18n'], function (React, FnWrapper, TopbarStore, ToolboxItem, i18n) {
    var LANG = i18n.lang.beambox.toolbox;

    var Toolbox = function (_React$Component) {
        _inherits(Toolbox, _React$Component);

        function Toolbox() {
            _classCallCheck(this, Toolbox);

            var _this = _possibleConstructorReturn(this, (Toolbox.__proto__ || Object.getPrototypeOf(Toolbox)).call(this));

            _this.state = {
                showAlign: false,
                showDistribute: false,
                showImage: false
            };
            return _this;
        }

        _createClass(Toolbox, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                TopbarStore.onAlignToolboxShowed(function () {
                    return _this2.showAlign();
                });
                TopbarStore.onAlignToolboxClosed(function () {
                    return _this2.closeAlign();
                });
                TopbarStore.onDistributeToolboxShowed(function () {
                    return _this2.showDistribute();
                });
                TopbarStore.onDistributeToolboxClosed(function () {
                    return _this2.closeDistribute();
                });
                TopbarStore.onImageToolboxShowed(function () {
                    return _this2.showImage();
                });
                TopbarStore.onImageToolboxClosed(function () {
                    return _this2.closeImage();
                });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                var _this3 = this;

                TopbarStore.removeAlignToolboxShowedListener(function () {
                    return _this3.showAlign();
                });
                TopbarStore.removeAlignToolboxClosedListener(function () {
                    return _this3.closeAlign();
                });
                TopbarStore.removeDistributeToolboxShowedListener(function () {
                    return _this3.showDistribute();
                });
                TopbarStore.removeDistributeToolboxClosedListener(function () {
                    return _this3.closeDistribute();
                });
                TopbarStore.removeImageToolboxShowedListener(function () {
                    return _this3.showImage();
                });
                TopbarStore.removeImageToolboxClosedListener(function () {
                    return _this3.closeImage();
                });
            }
        }, {
            key: 'showDistribute',
            value: function showDistribute() {
                if (!this.state.showDistribute) {
                    this.setState({ showDistribute: true });
                }
            }
        }, {
            key: 'closeDistribute',
            value: function closeDistribute() {
                if (this.state.showDistribute) {
                    this.setState({ showDistribute: false });
                }
            }
        }, {
            key: 'showAlign',
            value: function showAlign() {
                if (!this.state.showAlign) {
                    this.setState({ showAlign: true });
                }
            }
        }, {
            key: 'closeAlign',
            value: function closeAlign() {
                if (this.state.showAlign) {
                    this.setState({ showAlign: false });
                }
            }
        }, {
            key: 'showImage',
            value: function showImage() {
                if (!this.state.showImage) {
                    this.setState({ showImage: true });
                }
            }
        }, {
            key: 'closeImage',
            value: function closeImage() {
                if (this.state.showImage) {
                    this.setState({ showImage: false });
                }
            }
        }, {
            key: 'renderElement',
            value: function renderElement() {
                var alignToolbox = null,
                    distributeToolbox = null,
                    imageToolbox = null;
                if (this.state.showAlign) {
                    alignToolbox = React.createElement(
                        'div',
                        { className: 'Toolbox-content' },
                        React.createElement(ToolboxItem, { onClick: FnWrapper.alignLeft, src: 'img/beambox/align-left.png', title: LANG.ALIGN_LEFT }),
                        React.createElement(ToolboxItem, { onClick: FnWrapper.alignCenter, src: 'img/beambox/align-center-horizontal.png', title: LANG.ALIGN_CENTER }),
                        React.createElement(ToolboxItem, { onClick: FnWrapper.alignRight, src: 'img/beambox/align-right.png', title: LANG.ALIGN_RIGHT }),
                        React.createElement(ToolboxItem, { onClick: FnWrapper.alignTop, src: 'img/beambox/align-top.png', title: LANG.ALIGN_TOP }),
                        React.createElement(ToolboxItem, { onClick: FnWrapper.alignMiddle, src: 'img/beambox/align-center-vertical.png', title: LANG.ALIGN_MIDDLE }),
                        React.createElement(ToolboxItem, { onClick: FnWrapper.alignBottom, src: 'img/beambox/align-bottom.png', title: LANG.ALIGN_BOTTOM })
                    );
                }
                if (this.state.showDistribute) {
                    distributeToolbox = React.createElement(
                        'div',
                        { className: 'Toolbox-content' },
                        React.createElement(ToolboxItem, { onClick: FnWrapper.distHori, src: 'img/beambox/arrange-horizontal.png', title: LANG.ARRANGE_HORIZONTAL }),
                        React.createElement(ToolboxItem, { onClick: FnWrapper.distVert, src: 'img/beambox/arrange-vertical.png', title: LANG.ARRANGE_VERTICAL }),
                        React.createElement(ToolboxItem, { onClick: FnWrapper.distEven, src: 'img/beambox/diffusion2.png', title: LANG.ARRANGE_DIAGONAL })
                    );
                }
                if (this.state.showImage) {
                    imageToolbox = React.createElement(
                        'div',
                        { className: 'Toolbox-content' },
                        React.createElement(ToolboxItem, { onClick: FnWrapper.flipHorizontal, src: 'img/beambox/flip-horizontal.png', title: LANG.FLIP }),
                        React.createElement(ToolboxItem, { onClick: FnWrapper.flipVertical, src: 'img/beambox/flip-vertical.png', title: LANG.FLIP })
                    );
                }
                if (this.state.showAlign) {
                    return React.createElement(
                        'div',
                        { className: 'toolbox' },
                        alignToolbox,
                        distributeToolbox,
                        imageToolbox
                    );
                } else {
                    return null;
                }
            }
        }, {
            key: 'render',
            value: function render() {
                var renderElement = this.renderElement();
                return renderElement;
            }
        }]);

        return Toolbox;
    }(React.Component);

    return Toolbox;
});