'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['app/actions/global-interaction'], function (GlobalInteraction) {
    var HolderGlobalInteraction = function (_GlobalInteraction) {
        _inherits(HolderGlobalInteraction, _GlobalInteraction);

        function HolderGlobalInteraction() {
            _classCallCheck(this, HolderGlobalInteraction);

            var _this = _possibleConstructorReturn(this, (HolderGlobalInteraction.__proto__ || Object.getPrototypeOf(HolderGlobalInteraction)).call(this));

            _this._instance = undefined;
            _this._actions = {
                'IMPORT': function IMPORT() {
                    if (window.electron) {
                        window.electron.trigger_file_input_click('file-upload-widget');
                    }
                },
                'EXPORT_FLUX_TASK': function EXPORT_FLUX_TASK() {
                    return _this._instance._handleExportClick('-f');
                },
                'CLEAR_SCENE': function CLEAR_SCENE() {
                    return _this._instance.state.laserEvents.clearScene();
                }
            };
            return _this;
        }

        _createClass(HolderGlobalInteraction, [{
            key: 'attach',
            value: function attach(instance) {
                this._instance = instance;
                this._hasImage = false;
                _get(HolderGlobalInteraction.prototype.__proto__ || Object.getPrototypeOf(HolderGlobalInteraction.prototype), 'attach', this).call(this, ['IMPORT']);
            }
        }, {
            key: 'onImageChanged',
            value: function onImageChanged(hasImage) {
                if (this._hasImage !== hasImage) {
                    this._hasImage = hasImage;
                    if (hasImage) {
                        this.enableMenuItems(['EXPORT_FLUX_TASK', 'CLEAR_SCENE']);
                    } else {
                        this.disableMenuItems(['EXPORT_FLUX_TASK', 'CLEAR_SCENE']);
                    }
                }
            }
        }, {
            key: 'onObjectFocus',
            value: function onObjectFocus() {
                this.enableMenuItems(['DUPLICATE']);
            }
        }, {
            key: 'onObjectBlur',
            value: function onObjectBlur() {
                this.disableMenuItems(['DUPLICATE']);
            }
        }]);

        return HolderGlobalInteraction;
    }(GlobalInteraction);

    var instance = new HolderGlobalInteraction();

    return instance;
});