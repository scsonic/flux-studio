'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['react', 'reactDOM', 'jsx!views/beambox/Image-Trace-Panel', 'reactCreateReactClass'], function (React, ReactDOM, ImageTracePanel) {
    var ImageTracePanelController = function () {
        function ImageTracePanelController() {
            _classCallCheck(this, ImageTracePanelController);

            this.reactRoot = '';
        }

        _createClass(ImageTracePanelController, [{
            key: 'init',
            value: function init(reactRoot) {
                this.reactRoot = reactRoot;
            }
        }, {
            key: 'render',
            value: function render() {
                ReactDOM.render(React.createElement(ImageTracePanel, null), document.getElementById(this.reactRoot));
            }
        }]);

        return ImageTracePanelController;
    }();

    var instance = new ImageTracePanelController();

    return instance;
});