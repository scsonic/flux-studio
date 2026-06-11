'use strict';

define(['jquery', 'react', 'reactClassset', 'reactPropTypes', 'app/actions/perspective-camera', 'jsx!widgets/Button-Group', 'app/actions/alert-actions', 'app/stores/alert-store', 'helpers/duration-formatter'], function ($, React, ReactCx, PropTypes, PerspectiveCamera, ButtonGroup, AlertActions, AlertStore, DurationFormatter) {

    return React.createClass({
        propTypes: {
            lang: PropTypes.object,
            hasObject: PropTypes.bool,
            hasOutOfBoundsObject: PropTypes.bool,
            onDownloadGCode: PropTypes.func,
            onDownloadFCode: PropTypes.func,
            onGoClick: PropTypes.func,
            onCameraPositionChange: PropTypes.func
        },

        componentDidMount: function componentDidMount() {
            PerspectiveCamera.init(this);
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            if (nextProps.updateCamera === true) {
                PerspectiveCamera.setCameraPosition(nextProps.camera);
            }
        },

        _handleTest: function _handleTest() {
            AlertActions.showInfo('hello');
            AlertActions.showWarning('warning');
            AlertActions.showError('error');
        },

        _handleRetry: function _handleRetry(id) {
            console.log('sending retry with ID:' + id);
        },

        _handleAnswer: function _handleAnswer(id, isYes) {
            console.log(id, isYes);
        },

        _handleGeneric: function _handleGeneric(id, message) {
            console.log(id, message);
        },

        _handleGetFCode: function _handleGetFCode() {
            this.props.onDownloadFCode();
        },

        _handleGo: function _handleGo(e) {
            e.preventDefault();
            this.props.onGoClick();
        },

        _handleGetGCode: function _handleGetGCode() {
            this.props.onDownloadGCode();
        },

        _updateCamera: function _updateCamera(position, rotation) {
            this.props.onCameraPositionChange(position, rotation);
        },

        _renderActionButtons: function _renderActionButtons(lang) {
            var _props = this.props,
                hasObject = _props.hasObject,
                hasOutOfBoundsObject = _props.hasOutOfBoundsObject,
                disableGoButtons = _props.disableGoButtons,
                buttons = [{
                label: lang.monitor.start,
                className: ReactCx.cx({
                    'btn-disabled': !hasObject || hasOutOfBoundsObject || disableGoButtons,
                    'btn-default': true,
                    'btn-hexagon': true,
                    'btn-go': true
                }),
                title: lang.print.goTitle,
                dataAttrs: {
                    'ga-event': 'print-goto-monitor'
                },
                onClick: this._handleGo
            }];


            return React.createElement(ButtonGroup, { buttons: buttons, className: 'beehive-buttons action-buttons' });
        },

        _renderTimeAndCost: function _renderTimeAndCost(lang) {
            var _props2 = this.props,
                slicingStatus = _props2.slicingStatus,
                slicingPercentage = _props2.slicingPercentage,
                hasObject = _props2.hasObject,
                hasOutOfBoundsObject = _props2.hasOutOfBoundsObject;

            if (slicingStatus && hasObject && !hasOutOfBoundsObject && slicingPercentage === 1) {
                if (!slicingStatus.filament_length) {
                    return '';
                } else {
                    return React.createElement(
                        'div',
                        { className: 'preview-time-cost' },
                        Math.round(slicingStatus.filament_length * 0.03) / 10,
                        lang.print.gram,
                        ' / ',
                        DurationFormatter(slicingStatus.time).split(' ').join('')
                    );
                }
            } else {
                return '';
            }
        },

        render: function render() {
            var lang = this.props.lang,
                actionButtons = this._renderActionButtons(lang),
                previewTimeAndCost = this._renderTimeAndCost(lang);

            return React.createElement(
                'div',
                { className: 'rightPanel' },
                React.createElement('div', { id: 'cameraViewController', className: 'cameraViewController' }),
                previewTimeAndCost,
                actionButtons
            );
        }
    });
});