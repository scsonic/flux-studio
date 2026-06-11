'use strict';

define(['react', 'jsx!widgets/Modal', 'jsx!widgets/Button-Group', 'helpers/api/config', 'helpers/sprintf', 'helpers/i18n', 'helpers/device-master'], function (React, Modal, ButtonGroup, config, sprintf, i18n, DeviceMaster) {
    var View = React.createClass({
        displayName: 'View',


        getDefaultProps: function getDefaultProps() {
            return {
                open: false,
                type: 'software', // software|firmware|toolhead
                device: {},
                currentVersion: '',
                latestVersion: '',
                releaseNote: '',
                updateFile: undefined,
                onDownload: function onDownload() {},
                onClose: function onClose() {},
                onInstall: function onInstall() {}
            };
        },

        _onSkip: function _onSkip() {
            var key = this.props.type + '-update-ignore-list',
                ignoreList = config().read(key) || [];

            ignoreList.push(this.props.latestVersion);

            // save skip version and close
            config().write(key, ignoreList);
            this._onClose();
        },
        _onDownload: function _onDownload() {
            console.log('onDownload this.props', this.props);
            this.props.onDownload();
            this._onClose();
        },

        _onClose: function _onClose(quit) {
            if ('toolhead' === this.props.type && true === quit) {
                DeviceMaster.quitTask();
            }

            this.props.onClose();
        },

        _onInstall: function _onInstall() {
            this.props.onInstall();
            this._onClose();
        },

        _getButtons: function _getButtons(lang) {
            var buttons,
                laterButton = {
                label: lang.update.later,
                dataAttrs: {
                    'ga-event': 'update-' + this.props.type.toLowerCase() + '-later'
                },
                onClick: this._onClose.bind(this, true)
            },
                downloadButton = {
                label: lang.update.download,
                dataAttrs: {
                    'ga-event': 'download-' + this.props.type.toLowerCase() + '-later'
                },
                onClick: this._onDownload
            },
                installButton = {
                label: 'software' === this.props.type ? lang.update.install : lang.update.upload,
                dataAttrs: {
                    'ga-event': 'install-new-' + this.props.type.toLowerCase()
                },
                onClick: this._onInstall
            };

            buttons = this.props.type === 'software' ? [laterButton, installButton] : [laterButton, downloadButton, installButton];

            return buttons;
        },

        _getReleaseNote: function _getReleaseNote() {
            return {
                __html: this.props.releaseNote
            };
        },

        render: function render() {
            if (false === this.props.open) {
                return React.createElement('div', null);
            }

            var lang = i18n.get(),
                caption = lang.update[this.props.type].caption,
                deviceModel = this.props.device.model,
                message1 = sprintf(lang.update[this.props.type].message_pattern_1, this.props.device.name),
                message2 = sprintf(lang.update[this.props.type].message_pattern_2, deviceModel, this.props.latestVersion, this.props.currentVersion),
                buttons = this._getButtons(lang),
                skipButton = 'software' === this.props.type ? React.createElement(
                'button',
                { className: 'btn btn-link', 'data-ga-event': 'skip-' + this.props.type.toLowerCase() + '-update', onClick: this._onSkip },
                lang.update.skip
            ) : '',
                content = React.createElement(
                'div',
                { className: 'update-wrapper' },
                React.createElement(
                    'h2',
                    { className: 'caption' },
                    caption
                ),
                React.createElement(
                    'article',
                    { className: 'update-brief' },
                    React.createElement(
                        'p',
                        null,
                        message1
                    ),
                    React.createElement(
                        'p',
                        null,
                        message2
                    )
                ),
                React.createElement(
                    'h4',
                    { className: 'release-note-caption' },
                    lang.update.release_note
                ),
                React.createElement('div', { className: 'release-note-content', dangerouslySetInnerHTML: this._getReleaseNote() }),
                React.createElement(
                    'div',
                    { className: 'action-button' },
                    skipButton,
                    React.createElement(ButtonGroup, { buttons: buttons })
                )
            ),
                className = {
                'modal-update': true,
                'shadow-modal': true
            };

            return React.createElement(Modal, { ref: 'modal', className: className, content: content });
        }

    });

    return View;
});