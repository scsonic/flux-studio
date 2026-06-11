'use strict';

define(['jquery', 'react', 'reactPropTypes', 'helpers/shortcuts', 'app/constants/alert-constants', 'jsx!widgets/Modal', 'jsx!widgets/Alert'], function ($, React, PropTypes, shortcuts, AlertConstants, Modal, Alert) {
    'use strict';

    var lang,
        acceptableTypes = [AlertConstants.INFO, AlertConstants.WARNING, AlertConstants.ERROR, AlertConstants.YES_NO, AlertConstants.RETRY_CANCEL, AlertConstants.RETRY_ABORT_CANCEL, AlertConstants.CUSTOM_CANCEL],
        View = React.createClass({
        displayName: 'View',


        propTypes: {
            open: PropTypes.bool,
            lang: PropTypes.object,
            type: PropTypes.oneOf(acceptableTypes),
            customText: PropTypes.string,
            customTextGroup: PropTypes.array,
            escapable: PropTypes.bool,
            caption: PropTypes.string,
            message: PropTypes.string,
            onRetry: PropTypes.func,
            onAbort: PropTypes.func,
            onYes: PropTypes.func,
            onNo: PropTypes.func,
            onCustom: PropTypes.func,
            onClose: PropTypes.func,
            displayImages: PropTypes.bool,
            images: PropTypes.array
        },

        getDefaultProps: function getDefaultProps() {
            return {
                type: AlertConstants.INFO,
                escapable: false,
                open: true,
                caption: '',
                message: '',
                onRetry: function onRetry() {},
                onAbort: function onAbort() {},
                onYes: function onYes() {},
                onNo: function onNo() {},
                onCustom: function onCustom() {},
                onClose: function onClose() {},
                onCustomGroup: [],
                displayImages: false,
                images: []
            };
        },

        componentWillMount: function componentWillMount() {
            lang = this.props.lang.alert;
        },

        componentDidMount: function componentDidMount() {
            var self = this;
            shortcuts.on(['esc'], function (e) {
                self.props.onClose(e);
            });
        },

        componentWillUnmount: function componentWillUnmount() {
            shortcuts.off(['esc']);
        },

        // button actions
        _onClose: function _onClose(e, reactid, from) {
            this.props.onClose.apply(null, [e, reactid, from]);
        },

        _onYes: function _onYes(e, reactid) {
            this.props.onYes(e);
            this._onClose.apply(null, [e, reactid, 'yes']);
        },

        _onNo: function _onNo(e, reactid) {
            this.props.onNo(e);
            this._onClose.apply(null, [e, reactid, 'no']);
        },

        _onRetry: function _onRetry(e, reactid) {
            this.props.onRetry(e);
            this._onClose.apply(null, [e, reactid, 'retry']);
        },

        _onAbort: function _onAbort(e, reactid) {
            this.props.onAbort(e);
            this._onClose.apply(null, [e, reactid, 'abort']);
        },

        _onCustom: function _onCustom(e, reactid) {
            this.props.onCustom(e);
            this._onClose.apply(null, [e, reactid, 'custom']);
        },
        _onCustomGroup: function _onCustomGroup(idx) {
            this.props.onCustomGroup[idx]();
            this.props.onClose();
        },

        _getTypeTitle: function _getTypeTitle() {
            var types = {};
            types[AlertConstants.INFO] = lang.info;
            types[AlertConstants.WARNING] = lang.warning;
            types[AlertConstants.ERROR] = lang.error;
            types[AlertConstants.RETRY_CANCEL] = lang.error;
            types[AlertConstants.RETRY_ABORT_CANCEL] = lang.error;
            types[AlertConstants.CUSTOM_CANCEL] = lang.error;

            return this.props.caption || types[this.props.type] || '';
        },

        _getCloseButtonCaption: function _getCloseButtonCaption() {
            var caption = lang.cancel;

            switch (this.props.type) {
                case AlertConstants.YES_NO:
                    caption = lang.no;
                    break;
                case AlertConstants.INFO:
                case AlertConstants.WARNING:
                case AlertConstants.ERROR:
                    caption = lang.ok;
                    break;
                case AlertConstants.CUSTOM_CANCEL:
                    caption = lang.close;
                    break;
                case AlertConstants.FINISH:
                    caption = lang.finish;
                    break;
            }

            return caption;
        },

        _getButtons: function _getButtons() {
            var buttons = [];
            var onclose_bind_with_on_no = function onclose_bind_with_on_no() {
                if (this._onNo) {
                    this._onNo();
                }
                this.props.onClose();
            };
            if (this.props.type !== AlertConstants.CUSTOM_GROUP) {
                buttons.push({
                    label: this._getCloseButtonCaption(),
                    onClick: onclose_bind_with_on_no.bind(this)
                });
            }

            switch (this.props.type) {
                case AlertConstants.YES_NO:
                    buttons.push({
                        label: lang.yes,
                        dataAttrs: {
                            'ga-event': 'yes'
                        },
                        onClick: this._onYes
                    });
                    break;
                case AlertConstants.RETRY_CANCEL:
                    buttons.push({
                        label: lang.retry,
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this._onRetry
                    });
                    break;
                case AlertConstants.RETRY_ABORT_CANCEL:
                    buttons.push({
                        label: lang.abort,
                        dataAttrs: {
                            'ga-event': 'abort'
                        },
                        onClick: this._onAbort
                    });
                    buttons.push({
                        label: lang.retry,
                        dataAttrs: {
                            'ga-event': 'retry'
                        },
                        onClick: this._onRetry
                    });
                    break;
                case AlertConstants.CUSTOM:
                    buttons = [{
                        label: this.props.customText,
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this._onCustom
                    }];
                    break;

                case AlertConstants.CUSTOM_GROUP:
                    var self = this;
                    this.props.customTextGroup.forEach(function (customText, idx) {
                        buttons.push({
                            label: customText,
                            dataAttrs: {
                                'ga-enent': customText
                            },
                            onClick: function onClick() {
                                self._onCustomGroup(idx);
                            }
                        });
                    });
                    break;

                case AlertConstants.CUSTOM_CANCEL:
                    buttons.push({
                        label: this.props.customText,
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this._onCustom
                    });
                    break;
            }

            return buttons;
        },

        render: function render() {
            if (!this.props.open) {
                return React.createElement('div', null);
            }
            var typeTitle = this._getTypeTitle(),
                buttons = this._getButtons(),
                content = React.createElement(Alert, {
                lang: lang,
                caption: typeTitle,
                message: this.props.message,
                buttons: buttons,
                imgClass: this.props.imgClass,
                images: this.props.images,
                displayImages: this.props.displayImages,
                onCustom: this._onCustom,
                onClose: this.props.onClose
            }),
                className = {
                'shadow-modal': true
            };

            return React.createElement(Modal, { className: className, content: content, disabledEscapeOnBackground: this.props.escapable });
        }

    });

    return View;
});