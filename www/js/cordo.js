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
"use strict";

var cordo = (function () {
    /**
     * 当前下载
     * @type {FileTransfer}
     * @private
     */
    var currentDownload = null;
    /**
     * 当前上传
     * @type {FileTransfer}
     * @private
     */
    var currentUpload = null;
    /**
     * plugins:
     * |----- plugin name --------|--------- global variable -----------|
     * |cordova-plugin-device     |device                               |
     * |cordova-plugin-dialogs    |navigator.notification               |
     * |cordova-plugin-contacts   |navigator.contacts                   |
     * |cordova-plugin-geolocation|navigator.geolocation                |
     *
     */

    var fetchFileTransferError = function (error) {
        var message = "unknown error";
        switch (error.code) {
            case FileTransferError.FILE_NOT_FOUND_ERR:
                message = "file not found";
                break;
            case FileTransferError.INVALID_URL_ERR:
                message = "invalid url";
                break;
            case FileTransferError.CONNECTION_ERR:
                message = "connect failed";
                break;
            case FileTransferError.ABORT_ERR:
                message = "abort";
                break;
            case FileTransferError.NOT_MODIFIED_ERR:
                message = "not modified";
                break;
        }
        return message;
    };

    /**
     * fetch 文件访问错误信息
     */
    var getFileEntryFailedMessage = function (error) {
        var message = "unknown error";
        switch (error.code) {
            case FileError.NOT_FOUND_ERR:
                message = 'not found';
                break;
            case FileError.SECURITY_ERR:
                message = 'security';
                break;
            case FileError.ABORT_ERR:
                message = 'abort';
                break;
            case FileError.ENCODING_ERR:
                message = 'bad encoding';
                break;
            case FileError.NO_MODIFICATION_ALLOWED_ERR:
                message = "no modification allowed";
                break;
            case FileError.INVALID_STATE_ERR:
                message = "invalid state";
                break;
            case FileError.SYNTAX_ERR:
                message = "SYNTAX error";
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                message = "invalid modification";
                break;
            case FileError.QUOTA_EXCEEDED_ERR:
                message = "quota exceeded";
                break;
            case FileError.TYPE_MISMATCH_ERR:
                message = "type mismatch";
                break;
            case FileError.PATH_EXISTS_ERR:
                message = "path exists";
                break;
        }
        return message;
    };

    var iterate = function (obj, call) {
        var result;
        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            result = call(obj[key], key, meta);
            if (result === 'break') break;
            if (result === 'continue') continue;
            if (result !== undefined) return result;
        }
    };

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
     * @param type {string} 文件mime类型，默认'text/plain'
     */
    var writeFile = function (filename, content, callback, type) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            //fs.root to return a DirectoryEntry object which you can use to create or get a file (by calling getFile).
            //file will be writen in /data/data/com.seapon.cordo/files/files/
            fs.root.getFile(filename, {create: true, exclusive: false},
                function (fileEntry) {
                    //The success callback for getFile receives a FileEntry object
                    fileEntry.createWriter(function (fileWriter) {
                        if (!(content instanceof Blob)) {
                            content = new Blob([content], {type: type || 'text/plain'});
                        }
                        fileWriter.write(content);
                        callback(true, fileEntry);
                    }, function (error) {
                        callback(false, {
                            code: error.code,
                            message: getFileEntryFailedMessage(error)
                        });
                    });
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
    var readFile = function (filename, callback) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            //fs.root to return a DirectoryEntry object which you can use to create or get a file (by calling getFile).
            //file will be writen in /data/data/com.seapon.cordo/files/files/
            fs.root.getFile(filename, {false: true, exclusive: false},
                function (fileEntry) {
                    readFileEntry(fileEntry, callback);
                }, function (error) {
                    callback(false, {
                        code: error.code,
                        message: getFileEntryFailedMessage(error)
                    });
                });
        });
    };

    //联系人字段列表
    var contact_fields = [
        "id",//: A globally unique identifier. (DOMString)
        "displayName",//: The name of this Contact, suitable for display to end users. (DOMString)
        "name",//: An object containing all components of a persons name. (ContactName)
        "nickname",//: A casual name by which to address the contact. (DOMString)
        "phoneNumbers",//: An array of all the contact's phone numbers. (ContactField[])
        "emails",//: An array of all the contact's email addresses. (ContactField[])
        "addresses",//: An array of all the contact's addresses. (ContactAddress[])
        "ims",//: An array of all the contact's IM addresses. (ContactField[])
        "organizations",//: An array of all the contact's organizations. (ContactOrganization[])
        "birthday",//: The birthday of the contact. (Date)
        "note",//: A note about the contact. (DOMString)
        "photos",//: An array of the contact's photos. (ContactField[])
        "categories",//: An array of all the user-defined categories associated with the contact. (ContactField[])
        "urls"//: An array of web pages associated with the contact. (ContactField[])
    ];
    return {
        // 文件系统
        storage: {
            write: writeFile,
            read: readFile
        },
        /**
         * 获取地理位置
         '纬度: ' + position.coords.latitude + '\n' +
         '经度: ' + position.coords.longitude + '\n' +
         '海拔: ' + position.coords.altitude + '\n' +
         '精度: ' + position.coords.accuracy + '\n' +
         '精确高度: ' + position.coords.altitudeAccuracy + '\n' +
         '方向: ' + position.coords.heading + '\n' +
         '数据: ' + position.coords.speed + '\n' +
         * @param callback {function} 成功时接受的参数是：true,{position.coords}
         *                            失败是接受的参数是：false,errorMessage
         */
        getGeolocation: function (callback) {
            navigator.geolocation.getCurrentPosition(function (position) {
                callback(true, position.coords);
            }, function (error) {
                var message = "unknown error";
                switch (error.code) {
                    case PositionError.PERMISSION_DENIED:
                        message = 'permission denied';
                        break;
                    case PositionError.POSITION_UNAVAILABLE:
                        message = 'failed to get position(no signal)';
                        break;
                    case PositionError.TIMEOUT:
                        message = 'get position timeout';
                        break;
                }
                callback(false, {
                    code: error.code,
                    message: message
                });
            }, {
                // Accept a cached position whose age is no greater than the specified time in milliseconds.
                // 该时间内直接使用缓存而不是直接获取
                maximumAge: 3000,
                //The maximum length of time (milliseconds) that is allowed to pass from the call
                // to navigator.geolocation.getCurrentPosition or geolocation.watchPosition until
                // the corresponding geolocationSuccess callback executes
                // If the geolocationSuccess callback is not invoked within this time,
                // the geolocationError callback is passed a **PositionError.TIMEOUT** error code.
                timeout: 5000,
                // Provides a hint that the application needs the best possible results.
                // By default of false, the device attempts to retrieve a Position using network-based methods.
                // Setting this property to true tells the framework to use more accurate methods, such as satellite positioning. (Boolean)
                enableHighAccuracy: true
            });
        },
        /**
         * 获取图片
         * @param callback {function} 成功时接受的参数是：true,imgbase64(前面不带"data:image/jpeg;base64,")
         *                            失败是接受的参数是：false,errorMessage
         * @param opts {{}} 配置参数
         * @param full
         */
        getPicture: function (callback, opts, full) {
            var options = {
                // Quality of the saved image, expressed as a range of 0-100,
                // where 100 is typically full resolution with no loss from file compression.
                // (Note that information about the camera's resolution is unavailable.)
                quality: 50,
                //  Choose the format of the return value.
                //  Camera.DestinationType.FILE_URI
                //  Camera.DestinationType.NATIVE_URI
                destinationType: Camera.DestinationType.DATA_URL,
                // Set the source of the picture.
                // PictureSourceType.PHOTOLIBRARY
                // PictureSourceType.SAVEDPHOTOALBUM
                sourceType: Camera.PictureSourceType.CAMERA,
                // Allow simple editing of image before selection.
                allowEdit: true,
                //Choose the returned image file's encoding.
                // Camera.EncodingType.PNG
                encodingType: Camera.EncodingType.JPEG,
                //Width in pixels to scale image. Must be used with targetHeight. Aspect ratio remains constant.
                targetWidth: 500,
                //Height in pixels to scale image. Must be used with targetWidth. Aspect ratio remains constant.
                targetHeight: 500,
                //Set the type of media to select from.
                // Only works when PictureSourceType is PHOTOLIBRARY or SAVEDPHOTOALBUM.
                //  Camera.MediaType.VIDEO
                //  Camera.MediaType.ALLMEDIA
                mediaType: Camera.MediaType.PICTURE,
                //Rotate the image to correct for the orientation of the device during capture.
                correctOrientation: true,
                //Save the image to the photo album on the device after capture.
                // 如果设置为true，则保存到相册不再返回
                saveToPhotoAlbum: false,
                // Choose the camera to use (front- or back-facing).
                //  Camera.Direction.FRONT
                cameraDirection: Camera.Direction.BACK
            };
            opts && iterate(opts, function (val, key) {
                options[key] = val;
            });
            navigator.camera.getPicture(
                /**
                 * Callback function that provides the image data.
                 * @param imageData {string} Base64 encoding of the image data, or the image file URI, depending on cameraOptions in effect.
                 */
                function (imageData) {
                    if (full) {
                        if (options.encodingType === Camera.EncodingType.JPEG) {
                            imageData = "data:image/jpeg;base64," + imageData;
                        } else if (options.encodingType === Camera.EncodingType.PNG) {
                            imageData = "data:image/png;base64," + imageData;
                        } else {
                            //undefined etc.
                        }
                    }
                    callback(true, imageData);
                },
                /**
                 * Callback function that provides an error message.
                 * @param message {string} The message is provided by the device's native code.
                 */
                function (message) {
                    callback(false, {
                        code: 0,
                        message: message
                    });
                }, options);
        },
        /**
         *
         * @param iterator {function} 遍历器
         * @param endcall {function} 结束回调，未发生错误时参数为null
         * @param fils {[]}
         */
        iterateContacts: function (iterator, endcall, fils) {
            navigator.contacts.find(fils || contact_fields,
                function (contacts) {
                    for (var x in contacts) {
                        iterator(contacts[x]);
                    }
                    endcall(null);
                },
                function (error) {
                    var message = "unknown";
                    switch (error.code) {
                        case ContactError.INVALID_ARGUMENT_ERROR:
                            message = "invalid argument";
                            break;
                        case ContactError.TIMEOUT_ERROR:
                            message = "timeout";
                            break;
                        case ContactError.PENDING_OPERATION_ERROR:
                            message = "pending operation failed";
                            break;
                        case ContactError.IO_ERROR:
                            message = "IO error";
                            break;
                        case ContactError.NOT_SUPPORTED_ERROR:
                            message = "not supported";
                            break;
                        // case ContactError.OPERATION_CANCELLED_ERROR:
                        //     break;
                        case ContactError.PERMISSION_DENIED_ERROR:
                            message = "permission denied";
                            break;
                        case ContactError.UNKNOWN_ERROR:
                        default:
                    }
                    endcall({
                        code: error.code,
                        message: message
                    });
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
            navigator.notification.alert(message, buttonPressCallback || function () {
                }, title || "提示", "确定")
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
        /**
         * scan barcode
         * @param callback {function}
         * @param opts {{}} 配置项
         */
        scan: function (callback, opts) {
            var options = {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: false, // iOS and Android
                showTorchButton: false, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                prompt: "Place a barcode inside the scan area", // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                // formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: true // iOS,禁止声音，Android无法禁止
            };
            opts && iterate(opts, function (val, key) {
                options[key] = val;
            });
            if ("barcodeScanner" in cordova.plugins) {
                cordova.plugins.barcodeScanner.scan(
                    function (res) {
                        // 取消了扫描也会进入这个回调
                        //res.format: QR_CODE
                        //res.cancelled:false
                        callback(true, {
                            "text": res.text,
                            "cancel": res.cancelled,
                            "format": res.format
                        });
                    },
                    function (error) {
                        callback(false, error);
                    },
                    options
                );
            }
        },
        /**
         * 中断当前文件上传
         */
        abortUpload: function () {
            currentUpload && currentUpload.abort();
        },
        /**
         * 中断当前下载
         */
        abortDownload: function () {
            currentDownload && currentDownload.abort();
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
                        var fileURL = fileEntry.toURL();// return file:///data/data/com.seapon.cordo/files/files/[filename]
                        var options = new FileUploadOptions();
                        options.fileKey = "file";
                        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                        options.mimeType = "text/plain";
                        options.params = params;

                        currentUpload = new FileTransfer();
                        // SERVER must be a URL that can handle the request, like
                        // http://some.server.com/upload.php
                        currentUpload.upload(
                            fileURL,
                            encodeURI(uri),
                            function (res) {
                                if (typeof res.response === "string") {
                                    res.response = JSON.parse(res.response);
                                }

                                callback(true, res.response);
                                currentUpload = null;
                                //res.responseCode 响应码
                            }, function (error) {
                                callback(true, error.code);
                                currentUpload = null;
                            }, options);
                    }, function (error) {
                        callback(false, {
                            code: error.code,
                            message: fetchFileTransferError(error)
                        });
                    });
            });
        },
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
                    currentDownload = new FileTransfer();
                    currentDownload.download(
                        encodeURI(sourceUri),
                        fileEntry.toURL(),
                        /**
                         * complete callback
                         * @param entry
                         */
                        function (entry) {
                            callback(true, entry);
                            currentDownload = null;
                        },
                        /**
                         * error callback
                         * @param error
                         */
                        function (error) {
                            callback(false, {
                                code: error.code,
                                message: fetchFileTransferError(error)
                            });
                            currentDownload = null;
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
        },
        /**
         * @param deviceready {function}
         * @returns {{initialize}}
         */
        initialize: function (deviceready) {
            document.addEventListener('deviceready', deviceready, false);
            return cordo;
        },
        log: function (message) {
            readFile("log.txt", function (res, content) {
                if (res) {
                    writeFile("log.txt", content + "\n" + message, function (res) {
                        if (!res) cordo.alert("log failed")
                    }, "")
                } else {
                    cordo.alert("log failed");
                }
            });
        }
    };
})();
