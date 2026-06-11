'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define(['react', 'reactPropTypes', 'plugins/classnames/index', 'jsx!views/beambox/Object-Panels/Position', 'jsx!views/beambox/Object-Panels/Rotation', 'jsx!views/beambox/Object-Panels/Size', 'jsx!views/beambox/Object-Panels/EllipsePosition', 'jsx!views/beambox/Object-Panels/EllipseRadius', 'jsx!views/beambox/Object-Panels/RectRoundedCorner', 'jsx!views/beambox/Object-Panels/Line', 'jsx!views/beambox/Object-Panels/Text', 'jsx!views/beambox/Object-Panels/ShadingThreshold'], function (React, PropTypes, ClassNames, PositionPanel, RotationPanel, SizePanel, EllipsePositionPanel, EllipseRadiusPanel, RectRoundedCorner, LinePanel, TextPanel, ShadingThresholdPanel) {

    var validPanelsMap = {
        'unknown': [],
        'path': ['position', 'size', 'rotation'],
        'polygon': ['position', 'size', 'rotation'],
        'rect': ['position', 'size', 'rotation', 'rectRoundedCorner'],
        'ellipse': ['ellipsePosition', 'ellipseRadius', 'rotation'],
        'line': ['line', 'rotation'],
        'image': ['position', 'size', 'rotation', 'shadingThreshold'],
        'text': ['rotation', 'text'],
        'use': ['position', 'size', 'rotation']
    };

    var ObjectPanel = React.createClass({
        displayName: 'ObjectPanel',

        propTypes: {
            type: PropTypes.oneOf(Object.keys(validPanelsMap)).isRequired,
            data: PropTypes.object.isRequired,
            $me: PropTypes.object.isRequired,
            isEditable: PropTypes.bool.isRequired
        },

        _renderPanels: function _renderPanels() {
            var data = this.props.data;
            var type = this.props.type;
            var $me = this.props.$me;

            var validPanels = validPanelsMap[this.props.type] || validPanelsMap['unknown'];
            var panelsToBeRender = [];
            validPanels.forEach(function (panelName) {
                var panel = void 0;
                switch (panelName) {
                    case 'position':
                        panel = React.createElement(PositionPanel, _extends({ key: panelName }, data.position, { type: type }));break;
                    case 'rotation':
                        panel = React.createElement(RotationPanel, _extends({ key: panelName }, data.rotation));break;
                    case 'size':
                        panel = React.createElement(SizePanel, _extends({ key: panelName }, data.size, { type: type }));break;
                    case 'ellipsePosition':
                        panel = React.createElement(EllipsePositionPanel, _extends({ key: panelName }, data.ellipsePosition));break;
                    case 'ellipseRadius':
                        panel = React.createElement(EllipseRadiusPanel, _extends({ key: panelName }, data.ellipseRadius));break;
                    case 'rectRoundedCorner':
                        panel = React.createElement(RectRoundedCorner, _extends({ key: panelName }, data.rectRoundedCorner));break;
                    case 'line':
                        panel = React.createElement(LinePanel, _extends({ key: panelName }, data.line));break;
                    case 'shadingThreshold':
                        panel = React.createElement(ShadingThresholdPanel, _extends({ key: panelName }, data.image, { $me: $me }));break;
                    case 'text':
                        panel = React.createElement(TextPanel, _extends({ key: panelName }, data.font, { $me: $me }));break;
                }
                panelsToBeRender.push(panel);
            });
            return panelsToBeRender;
        },

        _findPositionStyle: function _findPositionStyle() {
            var angle = function () {
                var A = $('#selectorGrip_resize_w').offset();
                var B = $('#selectorGrip_resize_e').offset();
                var dX = B.left - A.left;
                var dY = B.top - A.top;
                var radius = Math.atan2(-dY, dX);
                var degree = radius * (180 / Math.PI);
                if (degree < 0) degree += 360;
                return degree;
            }();

            var thePoint = function () {
                var E = $('#selectorGrip_resize_e').offset();
                var S = $('#selectorGrip_resize_s').offset();
                var W = $('#selectorGrip_resize_w').offset();
                var N = $('#selectorGrip_resize_n').offset();
                function isAngleIn(a, b) {
                    return a <= angle && angle < b;
                }
                if (isAngleIn(45 + 3, 135 + 3)) return S;
                if (isAngleIn(135 + 3, 225 + 3)) return W;
                if (isAngleIn(225 + 3, 315 + 3)) return N;
                return E;
            }();

            thePoint.top -= 40;
            thePoint.left += 35;

            // constrain position not exceed window
            var constrainedPosition = function () {
                function _between(input, min, max) {
                    input = Math.min(input, max);
                    input = Math.max(input, min);
                    return input;
                }
                var left = _between(thePoint.left, 0, $(window).width() - 240);
                var top = _between(thePoint.top, 100, $(window).height() - $('#beamboxObjPanel').height());
                return {
                    left: left,
                    top: top
                };
            }();

            var positionStyle = {
                position: 'absolute',
                zIndex: 10,
                top: constrainedPosition.top,
                left: constrainedPosition.left
            };
            return positionStyle;
        },

        render: function render() {
            var positionStyle = this._findPositionStyle();
            var classes = ClassNames('object-panels', { 'unselectable': !this.props.isEditable });
            return React.createElement(
                'div',
                { id: 'beamboxObjPanel', className: classes, style: positionStyle },
                this._renderPanels()
            );
        }

    });

    return ObjectPanel;
});