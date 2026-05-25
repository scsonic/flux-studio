
(function(G) {
    const path = require('path');

    const {ipcRenderer, webFrame} = require('electron');
    const remote = require('@electron/remote');
    const events = require(path.join(__dirname, 'ipc-events'));

    // Expose Node's require as requireNode before RequireJS overwrites window.require
    G.requireNode = require;

    G.electron = {
        ipc: ipcRenderer,
        events: events,
        version: remote.app.getVersion(),
        trigger_file_input_click: (inputId) => {
            if(inputId.match(/^[a-zA-Z0-9\-\_]+$/)) {
                webFrame.executeJavaScript(
                    `document.querySelector("[data-file-input=${inputId}]").click()`, true);
            }
        }
    }
})(global)
