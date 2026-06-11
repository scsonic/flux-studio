'use strict';

define(['react', 'helpers/i18n'], function (React, i18n) {

    var lang = i18n.get();

    return React.createClass({

        getInitialState: function getInitialState() {
            var str = this.props.animationString || '';

            return {
                str: str,
                counter: 0
            };
        },

        componentDidMount: function componentDidMount() {
            var _this = this;

            var interval = this.props.interval;


            setInterval(function () {
                _this.setState(_this.next());
            }, interval || 1000);
        },

        next: function next() {
            var _props = this.props,
                animationString = _props.animationString,
                interval = _props.interval,
                counter = this.state.counter,
                arr = void 0,
                str = void 0;


            animationString = animationString || '...';
            interval = interval || 1000;
            str = animationString.split('').slice(0, this.state.counter).join('');
            counter = (counter + 1) % (animationString.length + 1) === 0 ? 0 : counter + 1;
            return {
                str: str, counter: counter
            };
        },

        render: function render() {
            return React.createElement(
                'div',
                { className: 'processing' },
                React.createElement(
                    'label',
                    null,
                    lang.general.wait + this.state.str
                )
            );
        }
    });
});