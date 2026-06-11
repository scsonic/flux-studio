'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['react', 'reactDOM', 'app/actions/beambox', 'app/actions/beambox/preview-mode-background-drawer'], function (React, ReactDOM, BeamboxActions, PreviewModeBackgroundDrawer) {
    var rootId = 'clear-preview-graffiti-button-placeholder';

    var ClearPreviewGraffitiButton = function () {
        function ClearPreviewGraffitiButton() {
            _classCallCheck(this, ClearPreviewGraffitiButton);

            this.onClick = function () {
                console.error('should init by preview-mode-controller');
            };
        }

        _createClass(ClearPreviewGraffitiButton, [{
            key: 'init',
            value: function init(onClick) {
                this.onClick = onClick;
            }
        }, {
            key: 'show',
            value: function show() {
                var _this = this;

                var root = document.getElementById(rootId);
                var button = React.createElement('i', {
                    className: 'fa fa-times clear-preview',
                    title: 'Clear all',
                    onClick: function onClick() {
                        if (!PreviewModeBackgroundDrawer.isClean()) {
                            PreviewModeBackgroundDrawer.resetCoordinates();
                            _this.onClick();
                            _this.hide();
                            BeamboxActions.clearCameraCanvas();
                        }
                    }
                });
                ReactDOM.render(button, root);
            }
        }, {
            key: 'hide',
            value: function hide() {
                var root = document.getElementById(rootId);
                ReactDOM.unmountComponentAtNode(root);
            }
        }]);

        return ClearPreviewGraffitiButton;
    }();

    ;
    return new ClearPreviewGraffitiButton();
});