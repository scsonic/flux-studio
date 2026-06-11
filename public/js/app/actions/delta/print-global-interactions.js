'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['app/actions/global-interaction'], function (GlobalInteraction) {
    var PrintGlobalInteraction = function (_GlobalInteraction) {
        _inherits(PrintGlobalInteraction, _GlobalInteraction);

        function PrintGlobalInteraction() {
            _classCallCheck(this, PrintGlobalInteraction);

            var _this = _possibleConstructorReturn(this, (PrintGlobalInteraction.__proto__ || Object.getPrototypeOf(PrintGlobalInteraction)).call(this));

            _this._actions = {
                'IMPORT': function IMPORT() {
                    if (window.electron) {
                        window.electron.trigger_file_input_click('stl_import');
                    }
                },
                'SAVE_SCENE': function SAVE_SCENE() {
                    return _this._instance.reactSrc._handleDownloadScene();
                },
                'EXPORT_FLUX_TASK': function EXPORT_FLUX_TASK() {
                    return _this._instance.downloadFCode();
                },
                'UNDO': function UNDO() {
                    return _this._instance.undo();
                },
                'DUPLICATE': function DUPLICATE() {
                    return _this._instance.duplicateSelected();
                },
                'ROTATE': function ROTATE() {
                    return _this._instance.reactSrc._handleModeChange('rotate');
                },
                'SCALE': function SCALE() {
                    return _this._instance.reactSrc._handleModeChange('scale');
                },
                'RESET': function RESET() {
                    return _this._instance.resetObject();
                },
                'ALIGN_CENTER': function ALIGN_CENTER() {
                    return _this._instance.alignCenterPosition();
                },
                'CLEAR_SCENE': function CLEAR_SCENE() {
                    return _this._instance.clearScene();
                },
                'TUTORIAL': function TUTORIAL() {
                    return _this._instance.reactSrc._startTutorial();
                }
            };
            return _this;
        }

        _createClass(PrintGlobalInteraction, [{
            key: 'attach',
            value: function attach(instance) {
                this._instance = instance;
                _get(PrintGlobalInteraction.prototype.__proto__ || Object.getPrototypeOf(PrintGlobalInteraction.prototype), 'attach', this).call(this, ['IMPORT', 'TUTORIAL']);
            }
        }, {
            key: 'onObjectFocus',
            value: function onObjectFocus() {
                this.enableMenuItems(['DUPLICATE', 'SCALE', 'ROTATE', 'RESET', 'ALIGN_CENTER']);
            }
        }, {
            key: 'onObjectBlur',
            value: function onObjectBlur() {
                this.disableMenuItems(['DUPLICATE', 'SCALE', 'ROTATE', 'RESET', 'ALIGN_CENTER']);
            }
        }, {
            key: 'onObjectChanged',
            value: function onObjectChanged(canUndo) {
                if (canUndo) {
                    this.enableMenuItems(['UNDO']);
                } else {
                    this.disableMenuItems(['UNDO']);
                }
            }
        }, {
            key: 'onSceneImport',
            value: function onSceneImport() {
                this.enableMenuItems(['CLEAR_SCENE', 'SAVE_SCENE', 'EXPORT_FLUX_TASK']);
            }
        }, {
            key: 'onSceneClear',
            value: function onSceneClear() {
                this.disableMenuItems(['CLEAR_SCENE', 'SAVE_SCENE', 'EXPORT_FLUX_TASK']);
            }
        }]);

        return PrintGlobalInteraction;
    }(GlobalInteraction);

    var instance = new PrintGlobalInteraction();

    return instance;
});