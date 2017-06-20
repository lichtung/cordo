/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var cordo = (function () {
    /**
     * plugins:
     * |----- plugin name --------|--------- global variable -----------|
     * |cordova-plugin-device     |device                               |
     * |cordova-plugin-dialogs    |navigator.notification               |
     * |cordova-plugin-contacts   |navigator.contacts                   |
     * |cordova-plugin-geolocation|navigator.geolocation                |
     *
     */
    /**
     *
     */
    var getFileEntryFailedMessage = function (error) {
        var message = "";
        switch (error.code) {
            case NOT_FOUND_ERR:
                message = 'not found';
                break;
            case SECURITY_ERR:
                message = 'security';
                break;
            case ABORT_ERR:
                message = 'abort';
                break;
            case ENCODING_ERR:
                message = 'bad encoding';
                break;
            case NO_MODIFICATION_ALLOWED_ERR:
                message = "no modification allowed";
                break;
            case INVALID_STATE_ERR:
                message = "invalid state";
                break;
            case SYNTAX_ERR:
                message = "SYNTAX error";
                break;
            case INVALID_MODIFICATION_ERR:
                message = "invalid modification";
                break;
            case QUOTA_EXCEEDED_ERR:
                message = "quota exceeded";
                break;
            case TYPE_MISMATCH_ERR:
                message = "type mismatch";
                break;
            case PATH_EXISTS_ERR:
                message = "path exists";
                break;
            default:
                message = "unknown error";
        }
        return message;
    };

    return {
        /**
         * 获取地理位置
         '纬度: ' + position.coords.latitude + '\n' +
         '经度: ' + position.coords.longitude + '\n' +
         '海拔: ' + position.coords.altitude + '\n' +
         '精度: ' + position.coords.accuracy + '\n' +
         '精确高度: ' + position.coords.altitudeAccuracy + '\n' +
         '方向: ' + position.coords.heading + '\n' +
         '数据: ' + position.coords.speed + '\n' +
         '时间: ' + position.timestamp + '\n';
         * @param callback {function} 成功时接受的参数是：true,{position.coords}
         *                            失败是接受的参数是：false,errorMessage
         */
        getGeolocation: function (callback) {
            navigator.geolocation.getCurrentPosition(function (position) {
                callback(true, position.coords);
            }, function (message) {
                callback(false, message);
            }, {maximumAge: 3000, timeout: 5000, enableHighAccuracy: true});
        },
        /**
         *
         * @param callback {function} 成功时接受的参数是：true,imgbase64(前面不带"data:image/jpeg;base64,")
         *                            失败是接受的参数是：false,errorMessage
         */
        takePhoto: function (callback) {
            navigator.camera.getPicture(function (imgbase64) {
                callback(true, imgbase64);
            }, function (message) {
                callback(false, message);
            }, {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL
            });
        },
        /**
         *
         * @param iterator {function} 遍历器
         * @param errorHandler {function} 错误回调，遍历结束，未发生错误时参数为undefined
         */
        iterateContacts: function (iterator, errorHandler) {
            navigator.contacts.find([
                    "displayName",
                    "phoneNumbers",
                    "addresses",
                    "birthday"
                ],
                function (contacts) {
                    for (var x in contacts) {
                        var contact = contacts[x];
                        iterator(contact);
                    }
                    errorHandler(undefined);
                }, function (error) {
                    errorHandler(error);
                }
            );
        },
        /**
         * alert弹窗
         * @param message
         * @param buttonPressCallback
         * @param title
         */
        alert: function (message, buttonPressCallback, title) {
            navigator.notification.alert(message, buttonPressCallback, title || "提示", "确定")
        },
        /**
         * 响铃
         */
        beep: function () {
            navigator.notification.beep(1);
        },
        /**
         * 获取设备型号
         //The device.model returns the name of the device's model or product.
         // The value is set by the device manufacturer and may be different across versions of the same product.
         // Android:    Nexus One       returns "Passion" (Nexus One code name)
         //             Motorola Droid  returns "voles"
         // BlackBerry: Torch 9800      returns "9800"
         // Browser:    Google Chrome   returns "Chrome"
         //             Safari          returns "Safari"
         // iOS:     for the iPad Mini, returns iPad2,5; iPhone 5 is iPhone 5,1. See http://theiphonewiki.com/wiki/index.php?title=Models
         // OSX:                        returns "x86_64"
         // HM1：     2013023
         * @returns {string}
         */
        getDeviceModel: function () {
            return device.model;
        },
        /**
         // Depending on the device, a few examples are:
         //   - "Android"
         //   - "BlackBerry 10"
         //   - "browser"
         //   - "iOS"
         //   - "WinCE"
         //   - "Tizen"
         //   - "Mac OS X"
         * @returns {string}
         */
        getDevicePlatform: function () {
            return device.platform;
        },
        /**
         *
         //Get the operating system version.
         // Android:    Froyo OS would return "2.2"
         //             Eclair OS would return "2.1", "2.0.1", or "2.0"
         //             Version can also return update level "2.1-update1"
         // BlackBerry: Torch 9800 using OS 6.0 would return "6.0.0.600"
         // Browser:    Returns version number for the browser
         // iPhone:     iOS 3.2 returns "3.2"
         // Windows Phone 7: returns current OS version number, ex. on Mango returns 7.10.7720
         // Windows 8: return the current OS version, ex on Windows 8.1 returns 6.3.9600.16384
         // Tizen: returns "TIZEN_20120425_2"
         // OSX:        El Capitan would return "10.11.2"
         */
        getDevicePlatformVersion: function () {
            return device.version;
        },
        isAndroid: function () {
            return "Android" === device.platform;
        },
        isIOS: function () {
            return "iOS" === device.platform;
        },
        /**
         * 获取设备UUID
         //Get the device's Universally Unique Identifier (UUID).
         // The details of how a UUID is generated are determined by the device manufacturer and are specific to the device's platform or model.
         * @returns {string}
         */
        getUUID: function () {
            return device.uuid;
        },
        scan: function (callback) {
            cordova.plugins.barcodeScanner.scan(
                function (res) {
                    //res.format: QR_CODE
                    //res.cancelled:false
                    callback(true, res.text, res.cancelled, res.format);
                },
                function (error) {
                    callback(false, error);
                },
                {
                    preferFrontCamera: false, // iOS and Android
                    showFlipCameraButton: false, // iOS and Android
                    showTorchButton: false, // iOS and Android
                    torchOn: false, // Android, launch with the torch switched on (if available)
                    prompt: "Place a barcode inside the scan area", // Android
                    resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                    formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                    orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                    disableAnimations: true, // iOS
                    disableSuccessBeep: true // iOS,禁止声音，Android无法禁止
                }
            );
        },
        /**
         * 上传一个文件
         * The FileTransfer object provides a way to upload files using an HTTP multi-part POST or PUT request,
         * and to download files.
         */
        upload: function (filename, uri, callback, params) {

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                //fs.root to return a DirectoryEntry object which you can use to create or get a file (by calling getFile).
                //file will be writen in /data/data/com.seapon.cordo/files/files/
                fs.root.getFile(filename, {create: true, exclusive: false},
                    function (fileEntry) {

                        // !! Assumes variable fileURL contains a valid URL to a text file on the device,
                        var fileURL = fileEntry.toURL();

                        var options = new FileUploadOptions();
                        options.fileKey = "file";
                        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                        options.mimeType = "text/plain";
                        options.params = params;

                        var ft = new FileTransfer();
                        // SERVER must be a URL that can handle the request, like
                        // http://some.server.com/upload.php
                        ft.upload(fileURL, encodeURI(uri), function (res) {
                            callback(true, res);
                            //res.responseCode 响应码
                        }, function (error) {
                            callback(true, error.code);
                        }, options);
                    }, function (error) {
                        var message = getFileEntryFailedMessage(error);
                        callback(false, error.code, message);
                    });
            });
        },
        _current_download: null,
        /**
         * 下载一个文件
         * 文件保存位置：/data/data/com.seapon.cordo/files/files/[saveName]
         * URI:file::///data/data/com.seapon.cordo/files/files/[saveName]
         * 下载的文件可以被storage读取
         *
         * @param sourceUri {string} 下载的地址链接
         * @param saveName {string} 保存的文件名称
         * @param callback {function} 下载完成后的回调，成功时回调参数： true, entry, ""
         *                                 失败时回调参数： false, errorCode, errorInfo
         * @param headers 请求头部
         */
        download: function (sourceUri, saveName, callback, headers) {
            window.requestFileSystem(window.PERSISTENT, 0, function (fs) {
                // Make sure you add the domain name to the Content-Security-Policy <meta> element.
                // Parameters passed to getFile create a new file or return the file if it already exists.
                fs.root.getFile(saveName, {create: true, exclusive: false}, function (fileEntry) {
                    var fileTransfer = new FileTransfer();
                    cordo._current_download = fileTransfer.download(
                        encodeURI(sourceUri),
                        fileEntry.toURL(),
                        /**
                         * complete callback
                         * @param entry
                         */
                        function (entry) {
                            callback(true, entry, "");
                            cordo._current_download = null;
                        },
                        /**
                         * error callback
                         * 1 = FileTransferError.FILE_NOT_FOUND_ERR
                         2 = FileTransferError.INVALID_URL_ERR
                         3 = FileTransferError.CONNECTION_ERR
                         4 = FileTransferError.ABORT_ERR
                         5 = FileTransferError.NOT_MODIFIED_ERR
                         * @param error
                         */
                        function (error) {
                            var message = getFileEntryFailedMessage(error);
                            callback(false, error.code, message);
                            cordo._current_download = null;
                        },
                        // trustAllHosts: Optional parameter, defaults to false. If set to true, it accepts all security certificates.
                        //  This is useful because Android rejects self-signed security certificates.
                        false,
                        {
                            headers: headers || {}
                        }
                    );
                });
            });
        },
        /**
         //Get the device's manufacturer.
         // Android:    Motorola XT1032 would return "motorola"
         // BlackBerry: returns "BlackBerry"
         // iPhone:     returns "Apple"
         // Xiaomi:     returns "Xiaomi"
         * @returns {string}
         */
        getManufacturer: function () {
            return device.manufacturer;
        },
        /**
         //whether the device is running on a simulator.
         * @returns {boolean}
         */
        isVirtual: function () {
            return device.isVirtual;
        }
        ,
        /**
         * @param deviceready {function}
         * @returns {{initialize}}
         */
        initialize: function (deviceready) {
            document.addEventListener('deviceready', function () {
                // 文件系统访问
                cordo.storage = (function () {
                    /**
                     * 写文件
                     * Once you have a FileEntry object
                     * you can write to the file by calling createWriter,
                     * which returns a FileWriter object in the success callback
                     * Call the write method of FileWriter to write to the file.
                     *
                     * @param filename {string}
                     * @param content {string}|{Blob}
                     * @param callback {function} 成功时接收参数：true,fileEntry
                     *                            失败时接受参数：false,error
                     */
                    var write = function (filename, content, callback) {
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                            //fs.root to return a DirectoryEntry object which you can use to create or get a file (by calling getFile).
                            //file will be writen in /data/data/com.seapon.cordo/files/files/
                            fs.root.getFile(filename, {create: true, exclusive: false},
                                function (fileEntry) {
                                    //The success callback for getFile receives a FileEntry object
                                    fileEntry.createWriter(function (fileWriter) {
                                        if (!(content instanceof Blob)) {
                                            content = new Blob([content], {type: 'text/plain'});
                                        }
                                        fileWriter.write(content);
                                        callback(true, fileEntry);
                                    }, function (error) {
                                        callback(false, error);
                                    })
                                });
                        });
                    };
                    var readFileEntry = function (fileEntry, callback) {
                        fileEntry.file(function (file) {
                            var reader = new FileReader();
                            //When the read operation is complete, this.result stores the result of the read operation.
                            reader.onloadend = function () {
                                callback(true, this.result, fileEntry);
                            };
                            //You can use methods like readAsText to start the read operation.
                            reader.readAsText(file);
                        });
                    };
                    /**
                     * 读取文件
                     *
                     * You also need a FileEntry object to read an existing file.
                     *
                     * @param filename {string}
                     * @param callback {function} 文件回调，成功时接受参数：true,content,fileEntry
                     *                                     成功时接受参数：false,errorMsg
                     */
                    var read = function (filename, callback) {
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                            //fs.root to return a DirectoryEntry object which you can use to create or get a file (by calling getFile).
                            //file will be writen in /data/data/com.seapon.cordo/files/files/
                            fs.root.getFile(filename, {create: true, exclusive: false},
                                function (fileEntry) {
                                    readFileEntry(fileEntry, callback);
                                }, function (error) {
                                    var message = "";
                                    switch (error.code) {
                                        case NOT_FOUND_ERR:
                                            message = 'not found';
                                            break;
                                        case SECURITY_ERR:
                                            message = 'security';
                                            break;
                                        case ABORT_ERR:
                                            message = 'abort';
                                            break;
                                        case ENCODING_ERR:
                                            message = 'bad encoding';
                                            break;
                                        case NO_MODIFICATION_ALLOWED_ERR:
                                            message = "no modification allowed";
                                            break;
                                        case INVALID_STATE_ERR:
                                            message = "invalid state";
                                            break;
                                        case SYNTAX_ERR:
                                            message = "SYNTAX error";
                                            break;
                                        case INVALID_MODIFICATION_ERR:
                                            message = "invalid modification";
                                            break;
                                        case QUOTA_EXCEEDED_ERR:
                                            message = "quota exceeded";
                                            break;
                                        case TYPE_MISMATCH_ERR:
                                            message = "type mismatch";
                                            break;
                                        case PATH_EXISTS_ERR:
                                            message = "path exists";
                                            break;
                                        default:
                                            message = "unknown error";
                                    }
                                    callback(false, error.code);
                                });
                        });
                    };

                    return {
                        write: write,
                        read: read
                    };
                })();
                deviceready();
            }, false);
            return cordo;
        }
    };
})();
