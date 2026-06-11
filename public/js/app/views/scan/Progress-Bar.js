'use strict';

define(['react', 'reactPropTypes', 'reactClassset'], function (React, PropTypes, ReactCx) {
    'use strict';

    return React.createClass({
        ESTIMATED_STEP: 10,

        propTypes: {
            lang: PropTypes.object,
            percentage: PropTypes.number,
            remainingTime: PropTypes.number,
            currentSteps: PropTypes.number,
            onStop: PropTypes.func
        },

        getDefaultProps: function getDefaultProps() {
            return {
                lang: {},
                percentage: 0,
                remainingTime: 0,
                currentSteps: 0,
                onStop: function onStop() {}
            };
        },

        getInitialState: function getInitialState() {
            return {
                stop: false
            };
        },

        _paddingZero: function _paddingZero(str, len) {
            var zero = new Array(len + 1),
                afterPadding = zero.join(0) + str;

            return afterPadding.substr(-1 * len);
        },

        _formatSecondToTime: function _formatSecondToTime(seconds) {
            var minutes = parseInt(seconds / 60, 10),
                seconds = seconds % 60;

            return this._paddingZero(minutes, 2) + 'm' + this._paddingZero(seconds, 2) + 's';
        },

        _onStop: function _onStop() {
            var self = this;

            self.props.onStop();

            self.setState({
                stop: true
            }, function () {
                self.setState(self.getInitialState());
            });
        },

        _renderProgress: function _renderProgress() {
            var self = this,
                lang = self.props.lang,
                estimatedTime = self.props.remainingTime,
                textRemainingTime = self.ESTIMATED_STEP < self.props.currentSteps ? lang.scan.remaining_time : '',
                stopButtonClasses = ReactCx.cx({
                'btn': true,
                'btn-hexagon': true,
                'btn-stop-scan': true,
                'btn-disabled': 0 === self.props.percentage
            });

            return React.createElement(
                'div',
                { className: 'progress-status' },
                React.createElement(
                    'span',
                    { className: 'progress-text' },
                    self.props.percentage,
                    '%,'
                ),
                React.createElement(
                    'span',
                    { className: 'progress-text' },
                    estimatedTime
                ),
                React.createElement(
                    'span',
                    { className: 'progress-text' },
                    textRemainingTime
                ),
                React.createElement(
                    'button',
                    { className: stopButtonClasses, 'data-ga-event': 'stop-scan', onClick: this._onStop },
                    lang.scan.stop_scan
                )
            );
        },

        _renderFinish: function _renderFinish() {
            var lang = this.props.lang;

            return React.createElement(
                'p',
                null,
                React.createElement(
                    'span',
                    { className: 'amination-breath' },
                    lang.scan.processing
                )
            );
        },

        render: function render() {
            var lang = this.props.lang,
                isFinish = 100 <= this.props.percentage,
                className = {
                'scan-progress': true,
                'hide': true === this.state.stop
            },
                content = true === isFinish ? this._renderFinish() : this._renderProgress();

            return React.createElement(
                'div',
                { className: ReactCx.cx(className) },
                content
            );
        }

    });
});