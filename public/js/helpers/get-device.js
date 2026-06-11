'use strict';

define(['app/actions/initialize-machine', 'helpers/device-master', 'helpers/api/config'], function (InitializeMachine, DeviceMaster, Config) {
  'use strict';

  return function () {
    var selectedDevice = void 0,
        defaultDevice = InitializeMachine.defaultPrinter.get(),
        configuredDevice = {},
        firstDevice = DeviceMaster.getFirstDevice();

    var isNotEmptyObject = function isNotEmptyObject(o) {
      return Object.keys(o).length > 0;
    };

    if (Config().read('configured-printer') !== '') {
      configuredDevice = Config().read('configured-printer');
    }

    // determin selected Device
    if (isNotEmptyObject(defaultDevice)) {
      selectedDevice = defaultDevice;
    } else if (isNotEmptyObject(configuredDevice)) {
      selectedDevice = configuredDevice;
    } else {
      selectedDevice = firstDevice;
    }
    if (selectedDevice) {
      var model = selectedDevice.model === 'delta-1' ? 'fd1' : 'fd1p';
      Config().write('configured-model', model);
    }

    return selectedDevice;
  };
});