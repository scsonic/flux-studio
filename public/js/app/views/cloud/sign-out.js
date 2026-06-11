'use strict';

define(['jquery', 'react', 'helpers/api/cloud'], function ($, React, CloudApi) {
    'use strict';

    return React.createClass({

        componentDidMount: function componentDidMount() {
            CloudApi.signOut().then(function (r) {
                location.hash = '#/studio/cloud';
            });
        },

        render: function render() {
            return React.createElement('div', null);
        }
    });
});