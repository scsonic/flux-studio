'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'app/actions/beambox/svgeditor-function-wrapper', 'helpers/shortcuts', 'helpers/i18n'], function (React, FnWrapper, Shortcuts, i18n) {

    var LANG = i18n.lang.beambox.left_panel.insert_object_submenu;

    return function (_React$Component) {
        _inherits(InsertObjectSubmenu, _React$Component);

        function InsertObjectSubmenu() {
            _classCallCheck(this, InsertObjectSubmenu);

            return _possibleConstructorReturn(this, (InsertObjectSubmenu.__proto__ || Object.getPrototypeOf(InsertObjectSubmenu)).apply(this, arguments));
        }

        _createClass(InsertObjectSubmenu, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                Shortcuts.on(['esc'], function () {
                    return _this2.props.onClose();
                });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                Shortcuts.off(['esc']);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                return React.createElement(
                    'div',
                    { className: 'dialog-window', style: { display: 'flex' } },
                    React.createElement('div', { className: 'arrow arrow-left' }),
                    React.createElement(
                        'div',
                        { className: 'dialog-window-content' },
                        React.createElement(
                            'ul',
                            { onClick: function onClick() {
                                    return _this3.props.onClose();
                                }, style: { margin: '0px' } },
                            React.createElement(
                                'li',
                                { onClick: FnWrapper.insertRectangle, key: 'rectangle' },
                                LANG.rectangle
                            ),
                            React.createElement(
                                'li',
                                { onClick: FnWrapper.insertEllipse, key: 'ellipse' },
                                LANG.ellipse
                            ),
                            React.createElement(
                                'li',
                                { onClick: FnWrapper.insertLine, key: 'line' },
                                LANG.line
                            ),
                            React.createElement(
                                'li',
                                { onClick: FnWrapper.importImage, key: 'image' },
                                LANG.image
                            ),
                            React.createElement(
                                'li',
                                { onClick: FnWrapper.insertText, key: 'text' },
                                LANG.text
                            ),
                            React.createElement(
                                'li',
                                { onClick: FnWrapper.insertPath, key: 'path' },
                                LANG.path
                            ),
                            React.createElement(
                                'li',
                                { onClick: FnWrapper.insertPolygon, key: 'polygon' },
                                LANG.polygon
                            )
                        )
                    )
                );
            }
        }]);

        return InsertObjectSubmenu;
    }(React.Component);
});