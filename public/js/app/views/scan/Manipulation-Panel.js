'use strict';

define(['react', 'reactDOM', 'reactClassset', 'jquery', 'jsx!widgets/Unit-Input', 'helpers/round'], function (React, ReactDOM, ReactCx, $, UnitInput, round) {
    'use strict';

    return React.createClass({
        getDefaultProps: function getDefaultProps() {
            return {
                position: {
                    top: 0,
                    left: 0
                },
                object: {
                    position: {},
                    size: {},
                    rotation: {}
                },
                selectedMeshes: [],
                onCropOn: function onCropOn() {},
                onCropOff: function onCropOff() {},
                onSavePCD: function onSavePCD() {},
                onSaveASC: function onSaveASC() {},
                onClearNoise: function onClearNoise() {},
                onManualMerge: function onManualMerge() {},
                onReset: function onReset() {},
                switchTransformMode: function switchTransformMode() {},
                onChange: function onChange(objectMatrix) {}
            };
        },

        getInitialState: function getInitialState() {
            return {
                onCropping: false,
                handleMesh: this.props.selectedMeshes[0],
                visible: false,
                position: this.props.position,
                object: this.props.object
            };
        },

        _onClearNoise: function _onClearNoise(e) {
            this.props.onClearNoise(this.state.handleMesh);
        },

        _onSavePCD: function _onSavePCD(e) {
            this.props.onSavePCD();
        },

        _onSaveASC: function _onSaveASC(e) {
            this.props.onSaveASC();
        },

        _onCrop: function _onCrop(e) {
            var me = e.currentTarget,
                onCropping = this.state.onCropping,
                handleMesh = this.state.handleMesh;

            if (true === onCropping) {
                this.props.onCropOff(handleMesh);
            } else {
                this.props.onCropOn(handleMesh);
            }

            this.setState({
                onCropping: !onCropping
            });
        },

        _onManualMerge: function _onManualMerge(e) {
            this.props.onManualMerge(e);
        },

        _onTransform: function _onTransform(e) {
            var self = this,
                me = e.currentTarget,
                type = me.dataset.type.split('.'),
                parent = type[0],
                child = type[1],
                object = self.state.object;

            object[parent][child] = parseFloat(me.value, 10);

            if ('rotation' === parent) {
                object[parent][child] = Math.PI * object[parent][child] / 180;
            }

            self.setState({
                object: object
            }, function () {
                self.props.onChange(self.state.handleMesh, object);
            });
        },

        _renderForMultipleMesh: function _renderForMultipleMesh(lang) {
            return React.createElement(
                'div',
                { className: 'wrapper' },
                React.createElement(
                    'label',
                    { className: 'controls accordion' },
                    React.createElement('input', { type: 'radio', className: 'accordion-switcher', disabled: true, checked: true }),
                    React.createElement(
                        'p',
                        { className: 'caption' },
                        lang.scan.manipulation.filter
                    ),
                    React.createElement(
                        'div',
                        { className: 'accordion-body' },
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'button',
                                { className: 'btn btn-action btn-merge', 'data-ga-event': 'manual-merge', onClick: this._onManualMerge },
                                React.createElement('img', { src: 'img/icon-merge.png' }),
                                lang.scan.manipulation.manual_merge
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'button',
                                { className: 'btn btn-action btn-save-pcd', 'data-ga-event': 'save-point-cloud', onClick: this._onSavePCD },
                                React.createElement('img', { src: 'img/icon-export.png' }),
                                lang.scan.manipulation.save_pointcloud
                            )
                        )
                    )
                )
            );
        },

        _renderForSingleMesh: function _renderForSingleMesh(lang) {
            var props = this.props,
                state = this.state,
                position = {
                x: round(state.object.position.x || 0, -2),
                y: round(state.object.position.y || 0, -2),
                z: round(state.object.position.z || 0, -2)
            },
                size = {
                x: round(state.object.size.x || 0, -2),
                y: round(state.object.size.y || 0, -2),
                z: round(state.object.size.z || 0, -2)
            },
                rotation = {
                x: round(state.object.rotation.x * 180 / Math.PI || 0, 0),
                y: round(state.object.rotation.y * 180 / Math.PI || 0, 0),
                z: round(state.object.rotation.z * 180 / Math.PI || 0, 0)
            },
                cropClass = {
                'btn': true,
                'btn-action': true,
                'btn-crop': true,
                'btn-pressed': this.state.onCropping
            };

            return React.createElement(
                'div',
                { className: 'wrapper' },
                React.createElement(
                    'label',
                    { className: 'controls accordion' },
                    React.createElement('input', { name: 'maniplulation', type: 'radio', className: 'accordion-switcher', defaultChecked: true }),
                    React.createElement(
                        'p',
                        { className: 'caption' },
                        lang.scan.manipulation.filter
                    ),
                    React.createElement(
                        'div',
                        { className: 'accordion-body' },
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'button',
                                { className: ReactCx.cx(cropClass), 'data-ga-event': 'crop', onClick: this._onCrop },
                                React.createElement('img', { src: 'img/icon-crop.png' }),
                                lang.scan.manipulation.crop
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'button',
                                { className: 'btn btn-action btn-denoise', 'data-ga-event': 'denoise', onClick: this._onClearNoise },
                                React.createElement('img', { src: 'img/icon-denoise.png' }),
                                lang.scan.manipulation.clear_noise
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'button',
                                { className: 'btn btn-action btn-save-pcd', 'data-ga-event': 'save-point-cloud', onClick: this._onSavePCD },
                                React.createElement('img', { src: 'img/icon-export.png' }),
                                lang.scan.manipulation.save_pointcloud,
                                ' PCD'
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'button',
                                { className: 'btn btn-action btn-save-pcd', 'data-ga-event': 'save-point-cloud', onClick: this._onSaveASC },
                                React.createElement('img', { src: 'img/icon-export.png' }),
                                lang.scan.manipulation.save_pointcloud,
                                ' ASC'
                            )
                        )
                    )
                ),
                React.createElement(
                    'label',
                    { className: 'controls accordion', onClick: this.props.switchTransformMode.bind(this, 'translate') },
                    React.createElement('input', { name: 'maniplulation', type: 'radio', className: 'accordion-switcher' }),
                    React.createElement(
                        'p',
                        { className: 'caption' },
                        lang.scan.manipulation.position,
                        React.createElement(
                            'span',
                            { className: 'value' },
                            position.x,
                            ' ,',
                            position.y,
                            ' ,',
                            position.z
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
                                dataAttrs: { type: 'position.x' },
                                defaultValue: position.x,
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
                                dataAttrs: { type: 'position.y' },
                                defaultValue: position.y,
                                getValue: this._onTransform
                            })
                        ),
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'span',
                                { className: 'text-center header' },
                                'Z'
                            ),
                            React.createElement(UnitInput, {
                                dataAttrs: { type: 'position.z' },
                                defaultValue: position.z,
                                getValue: this._onTransform
                            })
                        )
                    )
                ),
                React.createElement(
                    'label',
                    { className: 'controls accordion', onClick: this.props.switchTransformMode.bind(this, 'rotate') },
                    React.createElement('input', { name: 'maniplulation', type: 'radio', className: 'accordion-switcher' }),
                    React.createElement(
                        'p',
                        { className: 'caption' },
                        lang.scan.manipulation.rotate,
                        React.createElement(
                            'span',
                            { className: 'value' },
                            rotation.x,
                            ' ,',
                            rotation.y,
                            ' ,',
                            rotation.z
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
                                dataAttrs: { type: 'rotation.x' },
                                defaultValue: rotation.x,
                                min: -180,
                                max: 180,
                                defaultUnitType: 'angle',
                                defaultUnit: '\xB0',
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
                                dataAttrs: { type: 'rotation.y' },
                                defaultValue: rotation.y,
                                min: -180,
                                max: 180,
                                defaultUnitType: 'angle',
                                defaultUnit: '\xB0',
                                getValue: this._onTransform
                            })
                        ),
                        React.createElement(
                            'div',
                            { className: 'control' },
                            React.createElement(
                                'span',
                                { className: 'text-center header' },
                                'Z'
                            ),
                            React.createElement(UnitInput, {
                                dataAttrs: { type: 'rotation.z' },
                                defaultValue: rotation.z,
                                min: -180,
                                max: 180,
                                defaultUnitType: 'angle',
                                defaultUnit: '\xB0',
                                getValue: this._onTransform
                            })
                        )
                    )
                )
            );
        },

        render: function render() {
            var self = this,
                props = self.props,
                lang = props.lang,
                wrapperClassName,
                position,
                content;

            wrapperClassName = ReactCx.cx({
                'manipulation-panel': true,
                'operating-panel': true
            });

            position = {
                top: 0,
                left: 0,
                transform: 'translate(' + this.state.position.left + 'px, ' + this.state.position.top + 'px)',
                visible: true === this.state.visible ? 'visible' : 'hidden'
            };

            content = 1 < this.props.selectedMeshes.length ? this._renderForMultipleMesh(lang) : this._renderForSingleMesh(lang);

            return React.createElement(
                'div',
                { className: wrapperClassName, ref: 'manipulationPanel', style: position },
                React.createElement(
                    'svg',
                    { className: 'arrow', version: '1.1', xmlns: 'http://www.w3.org/2000/svg',
                        width: '36.8', height: '20' },
                    React.createElement('polygon', { points: '0,10 36.8,0 36.8,20' })
                ),
                content
            );
        },

        _computePosition: function _computePosition(position) {
            var manipulationPanel = ReactDOM.findDOMNode(this.refs.manipulationPanel),
                windowSize = {
                height: window.innerHeight,
                width: window.innerWidth
            },
                panelSize = {
                height: manipulationPanel.offsetHeight,
                width: manipulationPanel.offsetWidth
            };
            position = {
                top: position.top - panelSize.height / 2,
                left: position.left + panelSize.width / 2
            };

            // check top/bottom
            if (position.top + panelSize.height > windowSize.height) {
                position.top = windowSize.height - panelSize.height;
            }

            if (0 > position.top) {
                position.top = 0;
            }

            // check left/right
            if (0 > position.left) {
                position.left = 0;
            }

            if (position.left - panelSize.width > windowSize.width) {
                position.left = windowSize.width - panelSize.width * 1.5;
            }

            return position;
        },

        componentDidMount: function componentDidMount() {
            this.setState({
                visible: true,
                position: this._computePosition(this.props.position)
            });
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            var manipulationPanel = ReactDOM.findDOMNode(this.refs.manipulationPanel);
            this.setState({
                visible: true,
                handleMesh: nextProps.selectedMeshes[0],
                position: this._computePosition(nextProps.position),
                object: nextProps.object
            });
        }

    });
});