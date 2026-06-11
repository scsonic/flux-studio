'use strict';

define(['jquery', 'react', 'reactPropTypes', 'plugins/classnames/index', 'jsx!widgets/Dialog-Menu', 'app/constants/global-constants', 'app/actions/alert-actions'], function ($, React, PropTypes, ClassNames, DialogMenu, GlobalConstants, AlertActions) {

    var DEFAULT_QUALITY = 'high',
        DEFAULT_MODEL = 'fd1';

    var lang = void 0;

    var constants = {
        MODEL: 'MODEL',
        QUALITY: 'QUALITY',
        RAFT_ON: 'RAFT_ON',
        SUPPORT_ON: 'SUPPORT_ON',
        ADVANCED: 'ADVANCED',
        PREVIEW: 'PREVIEW'
    };

    return React.createClass({

        propTypes: {
            lang: PropTypes.object,
            enable: PropTypes.bool,
            previewMode: PropTypes.bool,
            previewModeOnly: PropTypes.bool,
            disablePreview: PropTypes.bool,
            displayModelControl: PropTypes.bool,
            hasObject: PropTypes.bool,
            previewLayerCount: PropTypes.number,
            supportOn: PropTypes.bool,
            raftOn: PropTypes.bool,
            onRaftClick: PropTypes.func,
            onSupportClick: PropTypes.func,
            onPreviewClick: PropTypes.func,
            onPreviewLayerChange: PropTypes.func,
            onShowAdvancedSettingPanel: PropTypes.func
        },

        getInitialState: function getInitialState() {
            return {
                previewOn: false,
                previewCurrentLayer: 0,
                previewLayerCount: this.props.previewLayerCount,
                quality: DEFAULT_QUALITY,
                model: DEFAULT_MODEL
            };
        },

        componentWillMount: function componentWillMount() {
            lang = this.props.lang.print.left_panel;
            lang.quality = this.props.lang.print.quality;
            lang.model = this.props.lang.print.model;
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                previewLayerCount: nextProps.previewLayerCount || 0
            });

            if (nextProps.previewLayerCount !== this.state.previewLayerCount) {
                this.setState({
                    previewCurrentLayer: nextProps.previewLayerCount
                });
            }

            this.setState({ quality: nextProps.quality });
            this.setState({ model: nextProps.model });
            if (nextProps.previewMode !== this.state.previewOn) {
                this.setState({ previewOn: nextProps.previewMode });
            }
        },

        _handleActions: function _handleActions(source, arg, e) {
            var _this = this;

            if (this.props.previewModeOnly === true) {
                e.preventDefault();

                if (source === 'PREVIEW') {
                    $('#preview').parents('label').find('input').prop('checked', true);
                    AlertActions.showPopupYesNo(GlobalConstants.EXIT_PREVIEW, lang.confirmExitFcodeMode);
                }

                return;
            }

            var self = this,
                actions = {
                'MODEL': function MODEL() {
                    self.props.onQualityModelSelected(self.state.quality, arg);
                },

                'QUALITY': function QUALITY() {
                    self.props.onQualityModelSelected(arg, self.state.model);
                },

                'RAFT_ON': function RAFT_ON() {
                    self.props.onRaftClick();
                },

                'SUPPORT_ON': function SUPPORT_ON() {
                    self.props.onSupportClick();
                },

                'ADVANCED': function ADVANCED() {
                    self.props.onShowAdvancedSettingPanel();
                },

                'PREVIEW': function PREVIEW() {
                    if (e.target.type === 'range' || !self.props.hasObject || self.props.disablePreview) {
                        e.preventDefault();
                        return;
                    }

                    if (self.props.hasObject) {
                        self.setState({ previewOn: !self.state.previewOn }, function () {
                            self.props.onPreviewClick(self.state.previewOn);
                        });
                    }
                }
            };

            if (source !== constants.PREVIEW) {
                this.setState({ previewOn: false }, function () {
                    _this.props.onPreviewClick(false);
                });
            }

            actions[source]();
        },

        _handlePreviewLayerChange: function _handlePreviewLayerChange(e) {
            this.setState({
                previewCurrentLayer: e.target.value
            });
            this.props.onPreviewLayerChange(e.target.value);
        },

        _renderQuality: function _renderQuality() {
            var _this2 = this;

            var previewModeOnly = this.props.previewModeOnly;

            var _quality = ['high', 'med', 'low'];
            var _class = ClassNames('display-text quality-select', { 'disable': previewModeOnly });

            var qualitySelection = _quality.map(function (quality) {
                return React.createElement(
                    'li',
                    { key: quality, onClick: function onClick(e) {
                            return _this2._handleActions(constants.QUALITY, quality, e);
                        } },
                    lang.quality[quality]
                );
            });

            return {
                label: React.createElement(
                    'div',
                    { className: _class },
                    React.createElement(
                        'span',
                        null,
                        lang.quality[this.state.quality]
                    )
                ),
                content: React.createElement(
                    'ul',
                    null,
                    qualitySelection
                ),
                disable: previewModeOnly
            };
        },

        _renderModel: function _renderModel() {
            var _this3 = this;

            var previewModeOnly = this.props.previewModeOnly;

            var _class = ClassNames('display-text model-select', { 'disable': previewModeOnly });

            var modelSelection = ['fd1', 'fd1p'].map(function (model) {
                return React.createElement(
                    'li',
                    { key: model, onClick: function onClick(e) {
                            return _this3._handleActions(constants.MODEL, model, e);
                        } },
                    lang.model[model]
                );
            });

            return {
                label: React.createElement(
                    'div',
                    { className: _class },
                    React.createElement(
                        'span',
                        null,
                        lang.model[this.state.model]
                    )
                ),
                content: React.createElement(
                    'ul',
                    null,
                    modelSelection
                ),
                disable: previewModeOnly
            };
        },

        _renderRaft: function _renderRaft() {
            var _this4 = this;

            var _props = this.props,
                enable = _props.enable,
                previewModeOnly = _props.previewModeOnly,
                raftOn = _props.raftOn;

            var _class = ClassNames('raft', { 'disable': !enable });

            return {
                label: React.createElement(
                    'div',
                    { className: _class, title: lang.raftTitle, onClick: function onClick(e) {
                            return _this4._handleActions(constants.RAFT_ON, '', e);
                        } },
                    React.createElement(
                        'div',
                        null,
                        raftOn ? lang.raft_on : lang.raft_off
                    )
                ),
                disable: previewModeOnly
            };
        },

        _renderSupport: function _renderSupport() {
            var _this5 = this;

            var _props2 = this.props,
                enable = _props2.enable,
                previewModeOnly = _props2.previewModeOnly,
                supportOn = _props2.supportOn;

            var _class = ClassNames('support', { 'disable': !enable });

            return {
                label: React.createElement(
                    'div',
                    { className: _class, title: lang.supportTitle, onClick: function onClick(e) {
                            return _this5._handleActions(constants.SUPPORT_ON, '', e);
                        } },
                    React.createElement(
                        'div',
                        null,
                        supportOn ? lang.support_on : lang.support_off
                    )
                ),
                disable: previewModeOnly
            };
        },

        _renderAdvanced: function _renderAdvanced() {
            var _this6 = this;

            var _props3 = this.props,
                enable = _props3.enable,
                lang = _props3.lang,
                previewModeOnly = _props3.previewModeOnly;

            var _class = ClassNames('advanced', { 'disable': !enable || previewModeOnly });

            return {
                label: React.createElement(
                    'div',
                    { className: _class, title: lang.advancedTitle, onClick: function onClick(e) {
                            return _this6._handleActions(constants.ADVANCED, '', e);
                        } },
                    React.createElement(
                        'div',
                        null,
                        lang.print.left_panel.advanced
                    )
                ),
                disable: previewModeOnly
            };
        },

        _renderPreview: function _renderPreview() {
            var _this7 = this;

            var _props4 = this.props,
                enable = _props4.enable,
                previewModeOnly = _props4.previewModeOnly;
            var _state = this.state,
                previewCurrentLayer = _state.previewCurrentLayer,
                previewLayerCount = _state.previewLayerCount,
                previewOn = _state.previewOn;

            var _class = ClassNames('display-text preview', { 'disable': !enable && !previewModeOnly });

            return {
                label: React.createElement(
                    'div',
                    { id: 'preview', className: _class, onClick: function onClick(e) {
                            return _this7._handleActions(constants.PREVIEW, '', e);
                        } },
                    React.createElement(
                        'span',
                        null,
                        lang.preview
                    )
                ),
                content: React.createElement(
                    'div',
                    { className: 'preview-panel' },
                    React.createElement('input', { ref: 'preview', className: 'range', type: 'range', value: previewCurrentLayer, min: '0', max: previewLayerCount, onChange: this._handlePreviewLayerChange }),
                    React.createElement(
                        'div',
                        { className: 'layer-count' },
                        previewCurrentLayer
                    )
                ),
                disable: !previewOn,
                previewOn: previewOn,
                forceKeepOpen: previewModeOnly
            };
        },

        render: function render() {
            var _props5 = this.props,
                enable = _props5.enable,
                previewModeOnly = _props5.previewModeOnly,
                displayModelControl = _props5.displayModelControl;

            var items = [this._renderQuality(), this._renderRaft(), this._renderSupport(), this._renderAdvanced(), this._renderPreview()];
            var mask = enable || previewModeOnly ? '' : React.createElement('div', { className: 'mask' });

            if (displayModelControl) {
                items.unshift(this._renderModel());
            }

            return React.createElement(
                'div',
                { className: 'leftPanel' },
                mask,
                React.createElement(DialogMenu, { ref: 'dialogMenu', items: items })
            );
        }
    });
});