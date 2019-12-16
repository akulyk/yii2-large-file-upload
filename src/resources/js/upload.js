class Alert {
    _alertSuccess;
    _alertError;

    constructor(closeable = true, CloseTimeout = 0) {
        this._closeable = closeable;
        this._CloseTimeout = CloseTimeout;
        this._init();
    }

    _init() {
        this._alertSuccess = document.querySelector('.alert-success');
        this._alertError = document.querySelector('.alert-danger');
        if (this._closeable) {
            this._alertSuccess.classList.add('alert-dismissible');
            this._alertError.classList.add('alert-dismissible');
        }

    }

    success(content) {
        this._alertSuccess.querySelector('.alert-content').innerHTML = content;
        this._alertSuccess.classList.add("show");
        if (this._CloseTimeout) {
            setTimeout(() => {
                this._alertSuccess.classList.remove('show');
            }, this._CloseTimeout)
        }
    }

    error(content) {
        this._alertError.querySelector('.alert-content').innerHTML = content;
        this._alertError.classList.add("show");
        if (this._CloseTimeout) {
            setTimeout(() => {
                this._alertError.classList.remove('show');
            }, this._CloseTimeout)
        }
    }
}

class ProgressBar {
    _bar;

    constructor(width = 0) {
        this._width = width;
        this._init();
    }

    _init() {
        this._bar = document.querySelector('.progress-bar');
        this._bar.style.width = this._width + '%';
    }

    update(width) {
        this._width = width;
        this._bar.style.width = this._width + '%';
    }

}

class Uploader {
    constructor({file, chunkSize, uploadTimeout, urls}) {
        this._file = file;
        this._chunkSize = chunkSize;
        this._uploadTimeout = uploadTimeout;
        this._urls = urls;
        this._progressBar = new ProgressBar(0);
        this._alert = new Alert(false, 3000);
    }

    upload() {
        this._getFileInfo(this._file.name, this._file.size).then((response) => {
            if (undefined === response.pos) {
                this._alert.error(response.message);
                console.error(response.message);
                return;
            }
            if (response.success === true) {
                this._progressBar.update(Math.floor((response.pos / this._file.size) * 100));
                this._uploadFile(response.pos, this._file, this._chunkSize);
            } else {
                this._alert.error(response.message);
            }
        }).catch((e) => {
            console.log(e);
            this._alert.error(e);
        });
    }

    _uploadFile(pos, file, chunkSize) {
        let nextSlice = pos + chunkSize + 1;
        let blob = file.slice(pos, nextSlice);
        let fileReader = new FileReader();
        let _self = this;
        fileReader.onloadend = function (event) {
            if (event.target.readyState !== FileReader.DONE) {
                return;
            }
            _self._uploadChunk(file.name, file.size, blob).then((response) => {
                const size_done = pos + chunkSize;
                let percent_done = Math.floor((size_done / _self._file.size) * 100);
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
                    _self._uploadFinish(_self._file.name, _self._file.size).then((response) => {
                        if (response.success === true) {
                            console.log('Upload Complete!');
                            _self._alert.success('File uploaded successfully!');
                        } else {
                            console.error(response.message);
                            _self._alert.error(response.message);
                        }
                    });

                }
            }).catch((e) => {
                console.error(e);
                if (e) {
                    _self._alert.error(e);
                }
                _self._uploadFile(nextSlice - chunkSize - 1, _self._file, chunkSize);
            })
        };
        fileReader.readAsDataURL(blob);
    }

    _uploadChunk(name, size, chunk) {
        let formData = this._prepareFormData({name, size, chunk});
        return this._fetchWithTimeout(this._urls.upload, {
            method: 'POST',
            body: formData
        }, this._uploadTimeout);
    }

    _uploadFinish(name, size) {
        let formData = this._prepareFormData({name, size});
        return this._fetchWithTimeout(this._urls.end, {
            method: 'POST',
            body: formData
        }, this._uploadTimeout);
    }

    _getFileInfo(name, size) {
        let formData = this._prepareFormData({name, size});
        return this._fetchWithTimeout(this._urls.begin, {
            method: 'POST',
            body: formData
        }, this._uploadTimeout);
    }

    _fetchWithTimeout(url, options, timeout = 3000) {
        return new Promise((resolve, reject) => {
            fetch(url, options)
                .then((response) => {
                    if (response.status === 200) {
                        return resolve(response.json());
                    }
                    response.text().then((text) => {
                        reject(text);
                    });

                }).catch((e) => {
                console.error(e);
                reject(e);
            });
            setTimeout(reject, timeout);
        });
    }

    _prepareFormData(object) {
        let csrfName = document.querySelector('meta[name=csrf-param]').getAttribute("content"),
            csrfToken = document.querySelector('meta[name=csrf-token]').getAttribute("content");
        let formData = new FormData();

        formData.append(csrfName, csrfToken);
        for (let name in object) {
            if (object.hasOwnProperty(name)) {
                formData.append(name, object[name]);
            }
        }
        return formData;
    }
}

window.onload = function () {
    let progressBar = new ProgressBar(0),
        alert = new Alert(false, 3000),
        sendButton = document.querySelector('[data-send]'),
        fileInput = document.querySelector('input[data-large_file]'),
        chunkSize = +fileInput.dataset.chunk_size,
        uploadTimeout = +fileInput.dataset.upload_timeout;
    const urls = {
        begin: fileInput.dataset.begin_url,
        upload: fileInput.dataset.upload_url,
        end: fileInput.dataset.end_url
    };

    sendButton.addEventListener('click', function () {
        progressBar.update(0);
        let file = fileInput.files[0];
        if (undefined === file) {
            alert.error('File not selected!');
            return;
        }
        let uploader = new Uploader({file, chunkSize, uploadTimeout, urls});
        uploader.upload();
    });
}
