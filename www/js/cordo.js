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
        getDevice: function () {
            return device;
        },
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
                     * @_param errorCallback {function} 接收三个参数：errorinfo,filename,content
                     */
                    var write = function (filename, content, errorCallback) {
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
                                    }, function (error) {
                                        errorCallback && errorCallback(error, filename, content);
                                    })
                                });
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
                                    fileEntry.file(function (file) {
                                        var reader = new FileReader();
                                        //When the read operation is complete, this.result stores the result of the read operation.
                                        reader.onloadend = function () {
                                            callback(true, this.result, fileEntry);
                                        };
                                        //You can use methods like readAsText to start the read operation.
                                        reader.readAsText(file);
                                    });
                                }, function (error) {
                                    callback(false, error);
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
