function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Alert =
    /*#__PURE__*/
    function () {
        "use strict";

        function Alert() {
            var closeable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            var CloseTimeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            _classCallCheck(this, Alert);

            _defineProperty(this, "_alertSuccess", void 0);

            _defineProperty(this, "_alertError", void 0);

            this._closeable = closeable;
            this._CloseTimeout = CloseTimeout;

            this._init();
        }

        _createClass(Alert, [{
            key: "_init",
            value: function _init() {
                this._alertSuccess = document.querySelector('.alert-success');
                this._alertError = document.querySelector('.alert-danger');

                if (this._closeable) {
                    this._alertSuccess.classList.add('alert-dismissible');

                    this._alertError.classList.add('alert-dismissible');
                }
            }
        }, {
            key: "success",
            value: function success(content) {
                var _this = this;

                this._alertSuccess.querySelector('.alert-content').innerHTML = content;

                this._alertSuccess.classList.add("show");

                if (this._CloseTimeout) {
                    setTimeout(function () {
                        _this._alertSuccess.classList.remove('show');
                    }, this._CloseTimeout);
                }
            }
        }, {
            key: "error",
            value: function error(content) {
                var _this2 = this;

                this._alertError.querySelector('.alert-content').innerHTML = content;

                this._alertError.classList.add("show");

                if (this._CloseTimeout) {
                    setTimeout(function () {
                        _this2._alertError.classList.remove('show');
                    }, this._CloseTimeout);
                }
            }
        }]);

        return Alert;
    }();

var ProgressBar =
    /*#__PURE__*/
    function () {
        "use strict";

        function ProgressBar() {
            var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            _classCallCheck(this, ProgressBar);

            _defineProperty(this, "_bar", void 0);

            this._width = width;

            this._init();
        }

        _createClass(ProgressBar, [{
            key: "_init",
            value: function _init() {
                this._bar = document.querySelector('.progress-bar');
                this._bar.style.width = this._width + '%';
            }
        }, {
            key: "update",
            value: function update(width) {
                this._width = width;
                this._bar.style.width = this._width + '%';
            }
        }]);

        return ProgressBar;
    }();

var Uploader =
    /*#__PURE__*/
    function () {
        "use strict";

        function Uploader(_ref) {
            var file = _ref.file,
                chunkSize = _ref.chunkSize,
                uploadTimeout = _ref.uploadTimeout,
                urls = _ref.urls;

            _classCallCheck(this, Uploader);

            this._file = file;
            this._chunkSize = chunkSize;
            this._uploadTimeout = uploadTimeout;
            this._urls = urls;
            this._progressBar = new ProgressBar(0);
            this._alert = new Alert(false, 3000);
        }

        _createClass(Uploader, [{
            key: "upload",
            value: function upload() {
                var _this3 = this;

                this._getFileInfo(this._file.name, this._file.size).then(function (response) {
                    if (undefined === response.pos) {
                        _this3._alert.error(response.message);

                        console.error(response.message);
                        return;
                    }

                    if (response.success === true) {
                        _this3._progressBar.update(Math.floor(response.pos / _this3._file.size * 100));

                        _this3._uploadFile(response.pos, _this3._file, _this3._chunkSize);
                    } else {
                        _this3._alert.error(response.message);
                    }
                }).catch(function (e) {
                    console.log(e);

                    _this3._alert.error(e);
                });
            }
        }, {
            key: "_uploadFile",
            value: function _uploadFile(pos, file, chunkSize) {
                var nextSlice = pos + chunkSize + 1;
                var blob = file.slice(pos, nextSlice);
                var fileReader = new FileReader();

                var _self = this;

                fileReader.onloadend = function (event) {
                    if (event.target.readyState !== FileReader.DONE) {
                        return;
                    }

                    _self._uploadChunk(file.name, file.size, blob).then(function (response) {
                        var size_done = pos + chunkSize;
                        var percent_done = Math.floor(size_done / _self._file.size * 100);

                        if (percent_done > 100) {
                            percent_done = 100;
                        }

                        _self._progressBar.update(percent_done);

                        console.log('Chunk uploaded! Progress: ' + percent_done + '%');

                        if (nextSlice < _self._file.size) {
                            // Update upload progress
                            // More to upload, call function recursively
                            _self._uploadFile(nextSlice, _self._file, chunkSize);
                        } else {
                            // Update upload progress
                            _self._uploadFinish(_self._file.name, _self._file.size).then(function (response) {
                                if (response.success === true) {
                                    console.log('Upload Complete!');

                                    _self._alert.success('File uploaded successfully!');
                                } else {
                                    console.error(response.message);

                                    _self._alert.error(response.message);
                                }
                            });
                        }
                    }).catch(function (e) {
                        console.error(e);

                        if (e) {
                            _self._alert.error(e);
                        }

                        _self._uploadFile(nextSlice - chunkSize - 1, _self._file, chunkSize);
                    });
                };

                fileReader.readAsDataURL(blob);
            }
        }, {
            key: "_uploadChunk",
            value: function _uploadChunk(name, size, chunk) {
                var formData = this._prepareFormData({
                    name: name,
                    size: size,
                    chunk: chunk
                });

                return this._fetchWithTimeout(this._urls.upload, {
                    method: 'POST',
                    body: formData
                }, this._uploadTimeout);
            }
        }, {
            key: "_uploadFinish",
            value: function _uploadFinish(name, size) {
                var formData = this._prepareFormData({
                    name: name,
                    size: size
                });

                return this._fetchWithTimeout(this._urls.end, {
                    method: 'POST',
                    body: formData
                }, this._uploadTimeout);
            }
        }, {
            key: "_getFileInfo",
            value: function _getFileInfo(name, size) {
                var formData = this._prepareFormData({
                    name: name,
                    size: size
                });

                return this._fetchWithTimeout(this._urls.begin, {
                    method: 'POST',
                    body: formData
                }, this._uploadTimeout);
            }
        }, {
            key: "_fetchWithTimeout",
            value: function _fetchWithTimeout(url, options) {
                var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;
                return new Promise(function (resolve, reject) {
                    fetch(url, options).then(function (response) {
                        if (response.status === 200) {
                            return resolve(response.json());
                        }

                        response.text().then(function (text) {
                            reject(text);
                        });
                    }).catch(function (e) {
                        console.error(e);
                        reject(e);
                    });
                    setTimeout(reject, timeout);
                });
            }
        }, {
            key: "_prepareFormData",
            value: function _prepareFormData(object) {
                var csrfName = document.querySelector('meta[name=csrf-param]').getAttribute("content"),
                    csrfToken = document.querySelector('meta[name=csrf-token]').getAttribute("content");
                var formData = new FormData();
                formData.append(csrfName, csrfToken);

                for (var name in object) {
                    if (object.hasOwnProperty(name)) {
                        formData.append(name, object[name]);
                    }
                }

                return formData;
            }
        }]);

        return Uploader;
    }();

window.onload = function () {
    var progressBar = new ProgressBar(0),
        alert = new Alert(false, 3000),
        sendButton = document.querySelector('[data-send]'),
        fileInput = document.querySelector('input[data-large_file]'),
        chunkSize = +fileInput.dataset.chunk_size,
        uploadTimeout = +fileInput.dataset.upload_timeout;
    var urls = {
        begin: fileInput.dataset.begin_url,
        upload: fileInput.dataset.upload_url,
        end: fileInput.dataset.end_url
    };
    sendButton.addEventListener('click', function () {
        progressBar.update(0);
        var file = fileInput.files[0];

        if (undefined === file) {
            alert.error('File not selected!');
            return;
        }

        var uploader = new Uploader({
            file: file,
            chunkSize: chunkSize,
            uploadTimeout: uploadTimeout,
            urls: urls
        });
        uploader.upload();
    });
};
