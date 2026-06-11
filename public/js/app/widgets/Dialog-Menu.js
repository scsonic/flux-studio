'use strict';

define(['jquery', 'react', 'reactDOM', 'reactPropTypes', 'reactClassset', 'app/stores/global-store', 'jsx!widgets/List',
// non-return
'helpers/object-assign'], function ($, React, ReactDOM, PropTypes, ReactCx, GlobalStore, List) {
    return React.createClass({
        propTypes: {
            arrowDirection: PropTypes.oneOf(['LEFT', 'RIGHT', 'UP', 'BOTTOM']),
            className: PropTypes.object,
            items: PropTypes.array
        },

        componentDidMount: function componentDidMount() {
            var _this = this;

            GlobalStore.onResetDialogMenuIndex(function () {
                return _this.resetCheckedItem();
            });
        },

        componentWillUnmount: function componentWillUnmount() {
            var _this2 = this;

            GlobalStore.removeResetDialogMenuIndexListener(function () {
                return _this2.resetCheckedItem();
            });
        },

        getDefaultProps: function getDefaultProps() {
            return {
                arrowDirection: 'LEFT',
                className: {},
                items: []
            };
        },

        getInitialState: function getInitialState() {
            return {
                checkedItem: -1
            };
        },

        resetCheckedItem: function resetCheckedItem() {
            this.setState({ checkedItem: -1 });
        },

        toggleSubPopup: function toggleSubPopup(itemIndex, isChecked) {
            this.setState({
                checkedItem: isChecked ? itemIndex : -1
            });
        },

        _renderItem: function _renderItem() {
            var _this3 = this;

            var arrowClassName = ReactCx.cx({
                'arrow': true,
                'arrow-left': 'LEFT' === this.props.arrowDirection,
                'arrow-right': 'RIGHT' === this.props.arrowDirection,
                'arrow-up': 'UP' === this.props.arrowDirection,
                'arrow-bottom': 'BOTTOM' === this.props.arrowDirection
            });

            return this.props.items.filter(function (item) {
                return !!item.label;
            }).map(function (item, index) {
                var content = item.content,
                    disable = item.disable,
                    forceKeepOpen = item.forceKeepOpen,
                    label = item.label,
                    labelClass = item.labelClass,
                    previewOn = item.previewOn;
                var checkedItem = _this3.state.checkedItem;

                var disablePopup = disable || !content;
                var checked = forceKeepOpen || previewOn || checkedItem === index && !disablePopup;

                var itemLabelClassName = {
                    'dialog-label': true,
                    'disable': disable === true
                };

                itemLabelClassName = Object.assign(itemLabelClassName, labelClass || {});

                return {
                    label: React.createElement(
                        'label',
                        { className: 'ui-dialog-menu-item' },
                        React.createElement('input', {
                            name: 'dialog-opener',
                            className: 'dialog-opener',
                            type: 'checkbox',
                            disabled: disablePopup,
                            checked: checked,
                            onClick: function onClick(e) {
                                if (!forceKeepOpen) {
                                    _this3.toggleSubPopup(index, e.target.checked);
                                }
                            }
                        }),
                        React.createElement(
                            'div',
                            { className: ReactCx.cx(itemLabelClassName) },
                            label
                        ),
                        React.createElement(
                            'label',
                            { className: 'dialog-window' },
                            React.createElement('div', { className: arrowClassName }),
                            React.createElement(
                                'div',
                                { className: 'dialog-window-content' },
                                content
                            )
                        )
                    )
                };
            });
        },

        // Lifecycle
        render: function render() {
            var className = this.props.className;
            className['ui ui-dialog-menu'] = true;

            return React.createElement(List, {
                ref: 'uiDialogMenu',
                items: this._renderItem(),
                className: ReactCx.cx(className)
            });
        }
    });
});