'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'app/actions/beambox/beambox-init', 'app/actions/beambox/beambox-global-interaction', 'app/actions/beambox/beambox-preference', 'jsx!views/beambox/Left-Panels/Left-Panel', 'jsx!views/beambox/Bottom-Right-Panel', 'jsx!pages/svg-editor'], function (React, BeamboxInit, BeamboxGlobalInteraction, BeamboxPreference, LeftPanel, BottomRightPanel, SvgEditor) {
    BeamboxInit.init();

    var view = function (_React$Component) {
        _inherits(view, _React$Component);

        function view() {
            _classCallCheck(this, view);

            return _possibleConstructorReturn(this, (view.__proto__ || Object.getPrototypeOf(view)).apply(this, arguments));
        }

        _createClass(view, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                BeamboxGlobalInteraction.attach();

                // need to run after svgedit packages loaded, so place it at componentDidMouont
                if (BeamboxPreference.read('show_guides')) {
                    BeamboxInit.displayGuides();
                }
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                BeamboxGlobalInteraction.detach();
            }
        }, {
            key: 'render',
            value: function render() {
                return React.createElement(
                    'div',
                    { className: 'studio-container beambox-studio' },
                    React.createElement(LeftPanel, null),
                    React.createElement(SvgEditor, null),
                    React.createElement(BottomRightPanel, null),
                    React.createElement('div', { id: 'object-panels-placeholder' }),
                    React.createElement('div', { id: 'image-trace-panel-placeholder' })
                );
            }
        }]);

        return view;
    }(React.Component);

    return function () {
        return view;
    };
});