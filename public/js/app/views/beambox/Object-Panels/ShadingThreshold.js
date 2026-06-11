'use strict';

define(['jquery', 'react', 'reactPropTypes', 'app/actions/beambox/svgeditor-function-wrapper', 'helpers/image-data', 'helpers/i18n'], function ($, React, PropTypes, FnWrapper, ImageData, i18n) {
    'use strict';

    var LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            shading: PropTypes.bool.isRequired,
            threshold: PropTypes.number.isRequired,
            $me: PropTypes.object.isRequired
        },

        getInitialState: function getInitialState() {
            return {
                shading: this.props.shading,
                threshold: this.props.threshold
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                shading: nextProps.shading,
                threshold: nextProps.threshold
            });
        },

        _writeShading: function _writeShading(val) {
            FnWrapper.write_image_data_shading(this.props.$me, val);
        },

        _writeThreshold: function _writeThreshold(val) {
            FnWrapper.write_image_data_threshold(this.props.$me, val);
        },

        _refreshImage: function _refreshImage() {
            var $me = this.props.$me;

            ImageData($me.attr("origImage"), {
                height: $me.height(),
                width: $me.width(),
                grayscale: {
                    is_rgba: true,
                    is_shading: Boolean(this.state.shading),
                    threshold: parseInt(this.state.threshold),
                    is_svg: false
                },
                onComplete: function onComplete(result) {
                    $me.attr('xlink:href', result.canvas.toDataURL('image/png'));
                }
            });
        },

        handleShadingClick: function handleShadingClick(event) {
            var _this = this;

            var shading = this.state.shading;

            var threshold = shading ? 128 : 255;

            this.setState({
                shading: !shading,
                threshold: threshold
            }, function () {
                _this._writeShading(!shading);
                _this._writeThreshold(threshold);
                _this._refreshImage();
            });
        },

        handleThresholdChange: function handleThresholdChange(event) {
            var val = event.target.value;

            this.setState({ threshold: val }, function () {
                this._writeThreshold(val);
                this._refreshImage();
            });
        },

        render: function render() {
            var _this2 = this;

            var _state = this.state,
                shading = _state.shading,
                threshold = _state.threshold;


            return React.createElement(
                'div',
                { className: 'object-panel' },
                React.createElement(
                    'label',
                    { className: 'controls accordion' },
                    React.createElement('input', { type: 'checkbox', className: 'accordion-switcher' }),
                    React.createElement(
                        'p',
                        { className: 'caption' },
                        LANG.laser_config,
                        React.createElement(
                            'span',
                            { className: 'value' },
                            shading ? LANG.shading + ', ' : '',
                            threshold
                        )
                    ),
                    React.createElement(
                        'label',
                        { className: 'accordion-body' },
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'span',
                                { className: 'text-center header' },
                                LANG.shading
                            ),
                            React.createElement(
                                'label',
                                { className: 'shading-checkbox', onClick: function onClick(e) {
                                        return _this2.handleShadingClick(e);
                                    } },
                                React.createElement('i', { className: shading ? "fa fa-toggle-on" : "fa fa-toggle-off" })
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'span',
                                { className: 'text-center header' },
                                LANG.threshold
                            ),
                            React.createElement('input', { type: 'range', min: 0, max: 255, value: threshold, onChange: function onChange(e) {
                                    return _this2.handleThresholdChange(e);
                                } })
                        )
                    )
                )
            );
        }

    });
});