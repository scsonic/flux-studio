'use strict';

define(['react', 'reactPropTypes', 'app/constants/global-constants', 'app/constants/device-constants', 'helpers/device-master', 'plugins/classnames/index', 'helpers/duration-formatter'], function (React, PropTypes, GlobalConstants, DeviceConstants, DeviceMaster, ClassNames, FormatDuration) {

    'use strict';

    var defaultImage = 'img/ph_l.png';
    var maxFileNameLength = 12;

    var selectedItem = '',
        previewUrl = defaultImage,
        previewBlob = null,
        hdChecked = {};

    var findObjectContainsProperty = function findObjectContainsProperty() {
        var infoArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var propertyName = arguments[1];

        return infoArray.filter(function (o) {
            return Object.keys(o).some(function (n) {
                return n === propertyName;
            });
        });
    };

    var getImageSize = function getImageSize(url, onSize) {
        var img = new Image();
        img.onload = function () {
            onSize([img.naturalWidth, img.naturalHeight]);
        };
        img.src = url;
    };

    return React.createClass({
        PropTypes: {},

        contextTypes: {
            store: PropTypes.object,
            slicingResult: PropTypes.object,
            lang: PropTypes.object
        },

        getInitialState: function getInitialState() {
            return {
                isHd: false
            };
        },

        componentWillMount: function componentWillMount() {
            var _this = this;

            var store = this.context.store;


            this.unsubscribe = store.subscribe(function () {
                _this.forceUpdate();
            });
        },

        componentWillUpdate: function componentWillUpdate() {
            return false;
        },

        componentWillUnmount: function componentWillUnmount() {
            previewUrl = '';
            this.unsubscribe();
        },

        _getPreviewUrl: function _getPreviewUrl() {
            var _context$store$getSta = this.context.store.getState(),
                Monitor = _context$store$getSta.Monitor,
                Device = _context$store$getSta.Device;

            var setUrl = function setUrl(info) {
                var blobIndex = info.findIndex(function (o) {
                    return o instanceof Blob;
                });
                previewUrl = blobIndex > 0 ? window.URL.createObjectURL(info[blobIndex]) : defaultImage;
            };

            if (previewUrl === defaultImage || !previewUrl) {
                if (Monitor.mode === GlobalConstants.FILE_PREVIEW) {
                    setUrl(Monitor.selectedFileInfo);
                } else if (Device.jobInfo.length > 0) {
                    setUrl(Device.jobInfo);
                } else {
                    previewUrl = this.props.previewUrl;
                }
            }

            if (!previewUrl) {
                return '';
            }
            return 'url(' + previewUrl + ')';
        },

        _showPreview: function _showPreview() {
            var divStyle = {
                borderRadius: '2px',
                backgroundColor: '#E2E1E0',
                backgroundImage: this._getPreviewUrl(),
                backgroundSize: '100% auto',
                backgroundPosition: '50% 50%',
                backgroundRepeatY: 'no-repeat',
                width: '100%',
                height: '100%'
            };

            return React.createElement('div', { style: divStyle });
        },

        _imageError: function _imageError(src) {
            src.target.src = 'img/ph_s.png';
        },

        _listFolderContent: function _listFolderContent() {
            var _this2 = this;

            var _context$store$getSta2 = this.context.store.getState(),
                Monitor = _context$store$getSta2.Monitor,
                Device = _context$store$getSta2.Device;

            var _Monitor$currentFolde = Monitor.currentFolderContent,
                files = _Monitor$currentFolde.files,
                directories = _Monitor$currentFolde.directories;

            previewUrl = defaultImage; // reset preview image

            if (!directories || !files) {
                return;
            }

            // console.log(directories);

            var _folders = directories.map(function (folder) {
                var folderNameClass = ClassNames('name', { 'selected': Monitor.selectedItem.name === folder });
                return React.createElement(
                    'div',
                    {
                        className: 'folder',
                        'data-foldername': folder,
                        onClick: _this2.props.onFolderClick,
                        onDoubleClick: _this2.props.onFolderDoubleClick
                    },
                    React.createElement(
                        'div',
                        { className: folderNameClass },
                        folder
                    )
                );
            });

            var _files = files.map(function (item, i) {
                if (!item[0]) {
                    item = [result.files[i]];
                }
                var imgSrc = item[2] instanceof Blob ? URL.createObjectURL(item[2]) : 'img/ph_s.png';
                var selected = Monitor.selectedItem.name === item[0],
                    fileNameClass = ClassNames('name', { 'selected': selected }),
                    iNameClass = ClassNames('fa', 'fa-times-circle-o', { 'selected': selected });

                return React.createElement(
                    'div',
                    {
                        title: item[0],
                        className: 'file',
                        'data-test-key': item[0],
                        'data-filename': item[0],
                        onClick: _this2.props.onFileClick,
                        onDoubleClick: _this2.props.onFileDoubleClick },
                    React.createElement(
                        'div',
                        { className: 'image-wrapper' },
                        React.createElement('img', { src: imgSrc, onError: _this2._imageError }),
                        React.createElement('i', { className: iNameClass,
                            onClick: _this2.props.onFileCrossIconClick })
                    ),
                    React.createElement(
                        'div',
                        { className: fileNameClass },
                        item[0].length > maxFileNameLength ? item[0].substring(0, maxFileNameLength) + '...' : item[0]
                    )
                );
            });

            return React.createElement(
                'div',
                { className: 'wrapper' },
                _folders,
                _files
            );
        },

        _retrieveFileInfo: function _retrieveFileInfo() {},

        _streamCamera: function _streamCamera() {
            var _this3 = this;

            if (!this.cameraStream) {
                var selectedDevice = this.props.selectedDevice;

                DeviceMaster.streamCamera(selectedDevice).then(function (stream) {
                    _this3.cameraStream = stream;
                    _this3.cameraStream.subscribe(_this3._processImage);
                });
            }

            var cameraClass = ClassNames('camera-image', { 'hd': this.state.isHd }, { 'beambox-camera': ['mozu1', 'fbm1', 'fbb1b', 'fbb1p', 'laser-b1', 'darwin-dev'].includes(this.props.selectedDevice.model) });
            return React.createElement('img', { className: cameraClass });
        },

        _processImage: function _processImage(imageBlob) {
            var targetDevice = this.props.selectedDevice;
            if (targetDevice) {
                if (!hdChecked[targetDevice.serial]) {
                    getImageSize(URL.createObjectURL(imageBlob), function (size) {
                        console.log('image size', size);
                        if (size[0] > 720) {
                            hdChecked[targetDevice.serial] = 2;
                        } else if (size[0] > 0) {
                            hdChecked[targetDevice.serial] = 1;
                        }
                    });
                }

                this.setState({ isHd: hdChecked[targetDevice.serial] !== 1 });
            }
            previewBlob = imageBlob;
            $('.camera-image').attr('src', URL.createObjectURL(imageBlob));
        },

        _getJobType: function _getJobType() {
            var _context$store$getSta3 = this.context.store.getState(),
                Monitor = _context$store$getSta3.Monitor,
                Device = _context$store$getSta3.Device;

            var lang = this.context.lang,
                jobInfo = void 0,
                headProp = void 0,
                taskProp = void 0;

            jobInfo = Monitor.mode === GlobalConstants.FILE_PREVIEW ? Monitor.selectedFileInfo : Device.jobInfo;

            headProp = findObjectContainsProperty(jobInfo, 'HEAD_TYPE');
            taskProp = findObjectContainsProperty(jobInfo, 'TASK_TYPE');

            if (headProp.length === 0) {
                // From Bottom Right Start Button
                var operatingFunction = location.hash.split('/')[1];
                return lang.monitor.task[operatingFunction.toUpperCase()];
            } else if (taskProp.length > 0) {
                // Selected Task in File Browser
                return lang.monitor.task[taskProp[0].TASK_TYPE.toUpperCase()];
            }
            return lang.monitor.task[headProp[0].HEAD_TYPE.toUpperCase()];
        },

        _getJobTime: function _getJobTime() {
            var _context$store$getSta4 = this.context.store.getState(),
                Monitor = _context$store$getSta4.Monitor,
                Device = _context$store$getSta4.Device;

            var jobInfo = void 0,
                o = void 0;

            jobInfo = Monitor.mode === GlobalConstants.FILE_PREVIEW ? Monitor.selectedFileInfo : Device.jobInfo;
            o = findObjectContainsProperty(jobInfo, 'TIME_COST');
            return o.length > 0 ? o[0].TIME_COST : '';
        },

        _getJobProgress: function _getJobProgress() {
            var _context$store$getSta5 = this.context.store.getState(),
                Monitor = _context$store$getSta5.Monitor,
                Device = _context$store$getSta5.Device;

            if (Monitor.mode === GlobalConstants.FILE_PREVIEW || this._isAbortedOrCompleted()) {
                return '';
            }
            return Device.status.prog ? parseInt(Device.status.prog * 100) + '%' : '';
        },

        _isAbortedOrCompleted: function _isAbortedOrCompleted() {
            var _context$store$getSta6 = this.context.store.getState(),
                Device = _context$store$getSta6.Device;

            return Device.status.st_id === DeviceConstants.status.ABORTED || Device.status.st_id === DeviceConstants.status.COMPLETED;
        },

        _renderDisplay: function _renderDisplay(mode) {
            if (mode !== GlobalConstants.CAMERA) {
                this.cameraStream = null;
            }
            var doMode = {};

            doMode[GlobalConstants.PREVIEW] = this._showPreview;
            doMode[GlobalConstants.PRINT] = this._showPreview;
            doMode[GlobalConstants.FILE] = this._listFolderContent;
            doMode[GlobalConstants.CAMERA] = this._streamCamera;
            doMode[GlobalConstants.FILE_PREVIEW] = this._showPreview;

            if (typeof doMode[mode] !== 'function') {
                return React.createElement('div', null);
            }

            return doMode[mode]();
        },

        _renderJobInfo: function _renderJobInfo() {
            var _context$store$getSta7 = this.context.store.getState(),
                Monitor = _context$store$getSta7.Monitor,
                Device = _context$store$getSta7.Device;

            if (Monitor.mode === GlobalConstants.FILE || Monitor.mode === GlobalConstants.CAMERA) {
                return '';
            }

            var slicingResult = this.context.slicingResult,
                jobTime = FormatDuration(this._getJobTime()) || '',
                jobProgress = this._getJobProgress(),
                jobType = this._getJobType(),
                infoClass = void 0;


            infoClass = ClassNames('status-info', {
                'running': Monitor.mode === GlobalConstants.PRINT || (Monitor.mode === GlobalConstants.PREVIEW || jobTime !== '') && jobType !== ''
            }, {
                'hide': (Monitor.mode === GlobalConstants.CAMERA || this._isAbortedOrCompleted()) && Monitor.selectedItem.name === ''
            });

            // if job is not active, render from slicing result
            if (jobTime === '' && slicingResult) {
                var time = slicingResult.time || slicingResult.metadata.TIME_COST;
                jobTime = FormatDuration(time);
            }

            return React.createElement(
                'div',
                { className: infoClass },
                React.createElement(
                    'div',
                    { className: 'verticle-align' },
                    React.createElement(
                        'div',
                        null,
                        jobType
                    ),
                    React.createElement(
                        'div',
                        { className: 'status-info-duration' },
                        jobTime
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'status-info-progress' },
                    jobProgress
                )
            );
        },

        _handleSnapshot: function _handleSnapshot() {
            if (previewBlob == null) return;
            var targetDevice = DeviceMaster.getSelectedDevice(),
                fileName = (targetDevice ? targetDevice.name + ' ' : '') + new Date().toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/(\d+)\/(\d+)\/(\d+)\, (\d+):(\d+):(\d+)/, '$3-$1-$2 $4-$5-$6') + ".jpg";

            saveAs(previewBlob, fileName);
        },

        _renderSpinner: function _renderSpinner() {
            return React.createElement(
                'div',
                { className: 'spinner-wrapper' },
                React.createElement('div', { className: 'spinner-flip' })
            );
        },

        render: function render() {
            var _context$store$getSta8 = this.context.store.getState(),
                Monitor = _context$store$getSta8.Monitor;

            var content = this._renderDisplay(Monitor.mode),
                jobInfo = this._renderJobInfo(),
                specialBtn = Monitor.mode == GlobalConstants.CAMERA ? React.createElement(
                'div',
                { className: 'btn-snap', onClick: this._handleSnapshot },
                React.createElement('i', { className: 'fa fa-camera' })
            ) : "";

            if (Monitor.isWaiting) {
                content = this._renderSpinner();
                jobInfo = '';
            }

            return React.createElement(
                'div',
                { className: 'body' },
                React.createElement(
                    'div',
                    { className: 'device-content' },
                    specialBtn,
                    content,
                    jobInfo
                )
            );
        }

    });
});