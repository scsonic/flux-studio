'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'reactClassset', 'app/actions/beambox/bottom-right-funcs', 'app/actions/beambox/preview-mode-controller', 'app/actions/beambox/beambox-preference', 'jsx!widgets/Button-Group', 'helpers/i18n', 'jsx!widgets/Modal', 'jsx!views/Printer-Selector', 'app/actions/alert-actions', 'app/actions/beambox/beambox-version-master'], function (React, ReactCx, BottomRightFuncs, PreviewModeController, BeamboxPreference, ButtonGroup, i18n, Modal, PrinterSelector, AlertActions, BeamboxVersionMaster) {
    var lang = i18n.lang;

    var BottomRightPanel = function (_React$Component) {
        _inherits(BottomRightPanel, _React$Component);

        function BottomRightPanel() {
            _classCallCheck(this, BottomRightPanel);

            var _this = _possibleConstructorReturn(this, (BottomRightPanel.__proto__ || Object.getPrototypeOf(BottomRightPanel)).call(this));

            _this.state = {
                isPrinterSelectorOpen: false
            };

            _this._handleStartClick = _this._handleStartClick.bind(_this);
            _this._renderPrinterSelectorWindow = _this._renderPrinterSelectorWindow.bind(_this);
            return _this;
        }

        _createClass(BottomRightPanel, [{
            key: '_handleStartClick',
            value: async function _handleStartClick() {
                if (PreviewModeController.isPreviewMode()) {
                    await PreviewModeController.end();
                }

                var layers = $('#svgcontent > g.layer').toArray();
                var dpi = BeamboxPreference.read('engrave_dpi');

                var isPowerTooHigh = layers.map(function (layer) {
                    return layer.getAttribute('data-strength');
                }).some(function (strength) {
                    return Number(strength) > 80;
                });
                var imageElems = document.querySelectorAll('image');

                var isSpeedTooHigh = false;

                for (var i = 1; i < imageElems.length; i++) {
                    if (imageElems[i].getAttribute('data-shading') && (dpi === 'medium' && imageElems[i].parentNode.getAttribute('data-speed') > 135 || dpi === 'high' && imageElems[i].parentNode.getAttribute('data-speed') > 90)) {
                        isSpeedTooHigh = true;
                        break;
                    }
                }

                if (isPowerTooHigh && isSpeedTooHigh) {
                    AlertActions.showPopupWarning('', lang.beambox.popup.both_power_and_speed_too_high);
                } else if (isPowerTooHigh) {
                    AlertActions.showPopupWarning('', lang.beambox.popup.power_too_high_damage_laser_tube);
                } else if (isSpeedTooHigh) {
                    AlertActions.showPopupWarning('', lang.beambox.popup.speed_too_high_lower_the_quality);
                }

                this.setState({
                    isPrinterSelectorOpen: true
                });
            }
        }, {
            key: '_renderPrinterSelectorWindow',
            value: function _renderPrinterSelectorWindow() {
                var _this2 = this;

                var onGettingPrinter = async function onGettingPrinter(selected_item) {
                    //export fcode
                    if (selected_item === 'export_fcode') {
                        BottomRightFuncs.exportFcode();
                        _this2.setState({
                            isPrinterSelectorOpen: false
                        });

                        return;
                    }

                    //check firmware
                    if (await BeamboxVersionMaster.isUnusableVersion(selected_item)) {
                        console.error('Not a valid firmware version');
                        AlertActions.showPopupError('', lang.beambox.popup.should_update_firmware_to_continue);
                        _this2.setState({
                            isPrinterSelectorOpen: false
                        });

                        return;
                    }

                    // start task
                    _this2.setState({
                        isPrinterSelectorOpen: false
                    });
                    BottomRightFuncs.uploadFcode(selected_item);
                };

                var onClose = function onClose() {
                    _this2.setState({
                        isPrinterSelectorOpen: false
                    });
                };

                var content = React.createElement(PrinterSelector, {
                    uniqleId: 'laser',
                    className: 'laser-device-selection-popup',
                    modelFilter: PrinterSelector.BEAMBOX_FILTER,
                    showExport: true,
                    onClose: onClose,
                    onGettingPrinter: onGettingPrinter
                });

                return React.createElement(Modal, { content: content, onClose: onClose });
            }
        }, {
            key: '_renderActionButtons',
            value: function _renderActionButtons() {
                var buttons = [{
                    label: lang.monitor.start,
                    className: ReactCx.cx({
                        'btn-disabled': false,
                        'btn-default': true,
                        'btn-hexagon': true,
                        'btn-go': true
                    }),
                    dataAttrs: {
                        'ga-event': 'laser-goto-monitor'
                    },
                    onClick: this._handleStartClick
                }];

                return React.createElement(ButtonGroup, {
                    buttons: buttons,
                    className: 'beehive-buttons action-buttons'
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var actionButtons = this._renderActionButtons();
                var printerSelector = this._renderPrinterSelectorWindow();

                return React.createElement(
                    'div',
                    null,
                    actionButtons,
                    this.state.isPrinterSelectorOpen ? printerSelector : ''
                );
            }
        }]);

        return BottomRightPanel;
    }(React.Component);

    return BottomRightPanel;
});