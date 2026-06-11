'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable react/no-multi-comp */
define(['jquery', 'react', 'reactPropTypes', 'helpers/i18n', 'jsx!app/actions/beambox/Image-Trace-Panel-Controller', 'app/actions/beambox', 'app/actions/beambox/preview-mode-background-drawer', 'app/actions/beambox/preview-mode-controller', 'app/stores/beambox-store', 'helpers/api/image-tracer'], function ($, React, PropTypes, i18n, ImageTracePanelController, BeamboxActions, PreviewModeBackgroundDrawer, PreviewModeController, BeamboxStore, ImageTracerApi) {
    var LANG = i18n.lang.beambox.left_panel;

    var ImageTraceButton = function (_React$Component) {
        _inherits(ImageTraceButton, _React$Component);

        function ImageTraceButton(props) {
            _classCallCheck(this, ImageTraceButton);

            return _possibleConstructorReturn(this, (ImageTraceButton.__proto__ || Object.getPrototypeOf(ImageTraceButton)).call(this, props));
        }

        _createClass(ImageTraceButton, [{
            key: '_handleClick',
            value: function _handleClick() {
                this.props.onClick();
                BeamboxActions.showCropper();
            }
        }, {
            key: '_renderButton',
            value: function _renderButton() {
                var _this2 = this;

                return React.createElement(
                    'div',
                    {
                        className: 'option preview-btn',
                        onClick: function onClick() {
                            return _this2._handleClick();
                        }
                    },
                    LANG.image_trace
                );
            }
        }, {
            key: 'render',
            value: function render() {
                var button = PreviewModeBackgroundDrawer.isClean() ? null : this._renderButton();

                return React.createElement(
                    'div',
                    null,
                    button
                );
            }
        }]);

        return ImageTraceButton;
    }(React.Component);

    ;
    return ImageTraceButton;
});