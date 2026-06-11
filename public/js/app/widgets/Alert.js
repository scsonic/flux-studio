'use strict';

define(['react', 'jsx!widgets/Button-Group', 'helpers/i18n'], function (React, ButtonGroup, i18n) {
    'use strict';

    var lang = i18n.lang.buttons;

    return React.createClass({

        getDefaultProps: function getDefaultProps() {
            return {
                lang: {},
                caption: '',
                message: '',
                buttons: [],
                images: [],
                imgClass: '',
                displayImages: false,
                onCustom: function onCustom() {},
                onClose: function onClose() {}
            };
        },

        getInitialState: function getInitialState() {
            return {
                imgIndex: 0
            };
        },

        _renderMessage: function _renderMessage() {
            if (this.props.displayImages) {
                return React.createElement('img', { className: this.props.imgClass, src: this.props.images[this.state.imgIndex] });
            } else {
                return typeof this.props.message === 'string' ? React.createElement('pre', { className: 'message', dangerouslySetInnerHTML: { __html: this.props.message } }) : React.createElement(
                    'pre',
                    { className: 'message' },
                    this.props.message
                );
            }
        },

        _renderButtons: function _renderButtons() {
            var _this = this;

            var self = this;
            if (this.props.displayImages) {
                if (this.state.imgIndex < this.props.images.length - 1) {
                    return React.createElement(ButtonGroup, { buttons: [{
                            label: lang.next,
                            right: true,
                            onClick: function onClick() {
                                self.setState({ imgIndex: _this.state.imgIndex + 1 });
                            }
                        }] });
                } else {
                    return React.createElement(ButtonGroup, { buttons: [{
                            label: lang.next,
                            right: true,
                            onClick: function onClick() {
                                self.setState({ imgIndex: 0 });
                                _this.props.onCustom();
                                self.props.onClose();
                            }
                        }] });
                }
            } else {
                return React.createElement(ButtonGroup, { buttons: this.props.buttons });
            }
        },

        render: function render() {
            var caption = '' !== this.props.caption ? React.createElement(
                'h2',
                { className: 'caption' },
                this.props.caption
            ) : '',
                html = this._renderMessage(),
                buttons = this._renderButtons(),
                className = 'modal-alert';

            if (this.props.displayImages) {
                className += ' ' + this.props.imgClass;
            }

            return React.createElement(
                'div',
                { className: className },
                caption,
                html,
                buttons
            );
        }
    });
});