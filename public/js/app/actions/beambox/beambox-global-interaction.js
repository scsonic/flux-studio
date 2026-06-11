'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['app/actions/global-interaction', 'app/actions/beambox/bottom-right-funcs', 'app/actions/beambox/svgeditor-function-wrapper'], function (GlobalInteraction, BottomRightFuncs, FnWrapper) {
    var BeamboxGlobalInteraction = function (_GlobalInteraction) {
        _inherits(BeamboxGlobalInteraction, _GlobalInteraction);

        function BeamboxGlobalInteraction() {
            _classCallCheck(this, BeamboxGlobalInteraction);

            var _this = _possibleConstructorReturn(this, (BeamboxGlobalInteraction.__proto__ || Object.getPrototypeOf(BeamboxGlobalInteraction)).call(this));

            _this._actions = {
                'IMPORT': function IMPORT() {
                    if (window.electron) {
                        window.electron.trigger_file_input_click('import_image');
                    }
                },
                'SAVE_SCENE': function SAVE_SCENE() {
                    return FnWrapper.saveFile();
                },
                'EXPORT_FLUX_TASK': function EXPORT_FLUX_TASK() {
                    return BottomRightFuncs.exportFcode();
                },
                'UNDO': function UNDO() {
                    return FnWrapper.undo();
                },
                'DUPLICATE': function DUPLICATE() {
                    return FnWrapper.cloneSelectedElement();
                },
                'ROTATE': function ROTATE() {},
                'SCALE': function SCALE() {},
                'RESET': function RESET() {},
                'ALIGN_CENTER': function ALIGN_CENTER() {},
                'CLEAR_SCENE': function CLEAR_SCENE() {
                    window.svgEditorClearScene();
                },
                'TUTORIAL': function TUTORIAL() {}
            };
            return _this;
        }

        _createClass(BeamboxGlobalInteraction, [{
            key: 'attach',
            value: function attach() {
                _get(BeamboxGlobalInteraction.prototype.__proto__ || Object.getPrototypeOf(BeamboxGlobalInteraction.prototype), 'attach', this).call(this, ['IMPORT', 'SAVE_SCENE', 'UNDO', 'EXPORT_FLUX_TASK', 'CLEAR_SCENE']);
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

        return BeamboxGlobalInteraction;
    }(GlobalInteraction);

    var instance = new BeamboxGlobalInteraction();

    return instance;
});