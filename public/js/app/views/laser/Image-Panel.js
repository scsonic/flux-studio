'use strict';

define(['jquery', 'react', 'reactDOM', 'jsx!widgets/Radio-Group', 'jsx!widgets/Unit-Input', 'helpers/round'], function ($, React, ReactDOM, RadioGroupView, UnitInput, round) {
    'use strict';

    return React.createClass({

        getInitialState: function getInitialState() {
            return {
                initialPosition: {
                    top: this.props.initialPosition.top,
                    left: this.props.initialPosition.left
                },
                size: this.props.size,
                sizeLock: this.props.sizeLock
            };
        },

        getDefaultProps: function getDefaultProps() {
            return {
                onThresholdChanged: function onThresholdChanged() {},
                onTransform: function onTransform() {},
                style: {},
                sizeLock: true,
                mode: '',
                angle: 0,
                position: {},
                size: {},
                threshold: 0,
                initialPosition: {}
            };
        },

        // UI events
        _onThresholdChanged: function _onThresholdChanged(e) {
            var self = this,
                trigger = function trigger() {
                self.props.onThresholdChanged(e.currentTarget.value);
            };

            self.setState({
                threshold: e.currentTarget.value
            });

            self._thresholdTimer = trigger();
        },

        _onTransform: function _onTransform(e) {
            var type = e.currentTarget.dataset.type,
                newParams = {
                angle: this.refs.objectAngle.value(),
                position: {
                    x: this.refs.objectPosX.value(),
                    y: this.refs.objectPosY.value()
                },
                size: {
                    width: this.refs.objectSizeW.value(),
                    height: this.refs.objectSizeH.value()
                },
                sizeLock: this.state.sizeLock
            },
                ratio;

            console.log('refs', this.refs);
            console.log('newParams', newParams);
            if ('undefined' !== typeof this.refs.threshold) {
                newParams['threshold'] = parseInt(ReactDOM.findDOMNode(this.refs.threshold).value, 10);
            }

            if (true === this.state.sizeLock) {
                switch (type) {
                    case 'width':
                        ratio = newParams.size.width / this.props.size.width;
                        newParams.size.height = round(newParams.size.height * ratio, -2);
                        break;
                    case 'height':
                        ratio = newParams.size.height / this.props.size.height;
                        newParams.size.width = round(newParams.size.width * ratio, -2);
                        break;
                }
            }

            console.log('imagePanel', this.props);
            this.props.onTransform(e, newParams);
        },

        _lockRatio: function _lockRatio(which, e) {
            e.preventDefault();

            var self = this,
                state = self.state;

            state[which] = !self.state[which];
            self.setState(state);

            self._onTransform(e);
        },

        _renderThreshold: function _renderThreshold(lang, props, state) {
            var thresholdValue = state.threshold || props.threshold || lang.laser.object_params.threshold.default,
                thresholdDisplay = round(thresholdValue / lang.laser.advanced.form.power.max * 100, 0);

            return 'laser' === props.mode ? React.createElement(
                'label',
                { className: 'controls accordion' },
                React.createElement(
                    'p',
                    { className: 'caption' },
                    lang.laser.object_params.threshold.text,
                    React.createElement(
                        'span',
                        { className: 'value' },
                        thresholdDisplay,
                        '%'
                    )
                ),
                React.createElement('input', { type: 'checkbox', className: 'accordion-switcher' }),
                React.createElement(
                    'label',
                    { className: 'accordion-body' },
                    React.createElement(
                        'div',
                        { className: 'control' },
                        React.createElement('input', { type: 'range', min: '0', max: '255', step: '1', ref: 'threshold',
                            defaultValue: thresholdValue, value: thresholdValue,
                            onChange: this._onThresholdChanged })
                    )
                )
            ) : '';
        },

        render: function render() {
            var props = this.props,
                state = this.state,
                lang = props.lang,
                thresholdRange = this._renderThreshold(lang, props, state),
                style = {
                top: state.initialPosition.top,
                left: state.initialPosition.left
            },
                lockerImage = {
                size: false === state.sizeLock ? 'img/unlock.svg' : 'img/lock.svg'
            };

            return React.createElement(
                'div',
                { ref: 'imagePanel', className: props.className, style: style },
                React.createElement('div', { className: 'arrow' }),
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'label',
                        { className: 'controls accordion' },
                        React.createElement('input', { type: 'checkbox', className: 'accordion-switcher' }),
                        React.createElement(
                            'p',
                            { className: 'caption' },
                            lang.laser.object_params.position.text,
                            React.createElement(
                                'span',
                                { className: 'value' },
                                props.position.x,
                                ' , ',
                                props.position.y,
                                'mm'
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
                                    'X'
                                ),
                                React.createElement(UnitInput, {
                                    min: -85,
                                    max: 85,
                                    dataAttrs: { type: 'x' },
                                    ref: 'objectPosX',
                                    defaultValue: props.position.x,
                                    getValue: this._onTransform
                                })
                            ),
                            React.createElement(
                                'div',
                                { className: 'control' },
                                React.createElement(
                                    'span',
                                    { className: 'text-center header' },
                                    'Y'
                                ),
                                React.createElement(UnitInput, {
                                    min: -85,
                                    max: 85,
                                    dataAttrs: { type: 'y' },
                                    ref: 'objectPosY',
                                    defaultValue: props.position.y,
                                    getValue: this._onTransform
                                })
                            )
                        )
                    ),
                    React.createElement(
                        'label',
                        { className: 'controls accordion' },
                        React.createElement('input', { type: 'checkbox', className: 'accordion-switcher' }),
                        React.createElement(
                            'p',
                            { className: 'caption' },
                            lang.laser.object_params.size.text,
                            React.createElement(
                                'span',
                                { className: 'value' },
                                state.size.width,
                                ' x ',
                                state.size.height,
                                'mm'
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
                                    lang.laser.object_params.size.unit.width
                                ),
                                React.createElement(UnitInput, {
                                    min: 1,
                                    max: 170,
                                    dataAttrs: { type: 'width' },
                                    ref: 'objectSizeW',
                                    defaultValue: state.size.width,
                                    getValue: this._onTransform
                                })
                            ),
                            React.createElement(
                                'div',
                                { className: 'control' },
                                React.createElement(
                                    'span',
                                    { className: 'text-center header' },
                                    lang.laser.object_params.size.unit.height
                                ),
                                React.createElement(UnitInput, {
                                    min: 1,
                                    max: 170,
                                    dataAttrs: { type: 'height' },
                                    ref: 'objectSizeH',
                                    defaultValue: state.size.height,
                                    getValue: this._onTransform
                                })
                            ),
                            React.createElement('img', { className: 'icon-locker', src: lockerImage.size, onClick: this._lockRatio.bind(this, 'sizeLock') })
                        )
                    ),
                    React.createElement(
                        'label',
                        { className: 'controls accordion' },
                        React.createElement('input', { type: 'checkbox', className: 'accordion-switcher' }),
                        React.createElement(
                            'p',
                            { className: 'caption' },
                            lang.laser.object_params.rotate.text,
                            React.createElement(
                                'span',
                                { className: 'value' },
                                props.angle,
                                '\xB0'
                            )
                        ),
                        React.createElement(
                            'label',
                            { className: 'accordion-body' },
                            React.createElement(
                                'div',
                                { className: 'control' },
                                React.createElement(UnitInput, {
                                    className: { 'input-fullsize': true },
                                    min: -180,
                                    max: 180,
                                    defaultUnitType: 'angle',
                                    defaultUnit: '\xB0',
                                    dataAttrs: { type: 'angle' },
                                    ref: 'objectAngle',
                                    defaultValue: props.angle,
                                    getValue: this._onTransform
                                })
                            )
                        )
                    ),
                    thresholdRange
                )
            );
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            this.setState({
                initialPosition: nextProps.initialPosition,
                size: nextProps.size,
                position: nextProps.position
            });
        }
    });
});