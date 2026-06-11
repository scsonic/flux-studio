'use strict';

/**
 * drag and drop handler
 */
define(['jquery'], function ($) {
    'use strict';

    return {
        plug: function plug(rootElement, handler) {
            return this.unplug(rootElement).on('dragover dragend', function (e) {
                e.preventDefault();
            }).on('drop', function (e) {
                e.preventDefault();
                window.processDroppedFile = true;
                handler(e);
            });
        },
        unplug: function unplug(rootElement) {
            return $(rootElement).off('drop dragover dragend');
        }
    };
});