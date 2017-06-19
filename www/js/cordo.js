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
         * @param deviceready {function}
         * @returns {{initialize}}
         */
        initialize: function (deviceready) {
            document.addEventListener('deviceready', function () {
                deviceready();
            }, false);
            return cordo;
        }
    };
})();

cordo.initialize(function () {
    document.getElementById("gootherpage").onclick = function () {
        location.href = "login.html";
    };
    // 设备信息
    document.getElementById("showdevice").onclick = function () {
        // This plugin defines a global device object, which describes the device's hardware and software.
        // Although the object is in the global scope, it is not available until after the deviceready event.
        var html = "";
        // Get the version of Cordova running on the device.
        html += "cordova版本：" + device.cordova + "<br/>";
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
        html += "型号：" + device.model + "<br/>";
        // Depending on the device, a few examples are:
        //   - "Android"
        //   - "BlackBerry 10"
        //   - "browser"
        //   - "iOS"
        //   - "WinCE"
        //   - "Tizen"
        //   - "Mac OS X"
        html += "系统：" + device.platform + "<br/>";
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
        html += "系统版本：" + device.version + "<br/>";
        //Get the device's Universally Unique Identifier (UUID).
        // The details of how a UUID is generated are determined by the device manufacturer and are specific to the device's platform or model.
        html += "UUID：" + device.uuid + "<br/>";
        //Get the device's manufacturer.
        // Android:    Motorola XT1032 would return "motorola"
        // BlackBerry: returns "BlackBerry"
        // iPhone:     returns "Apple"
        // Xiaomi:     returns "Xiaomi"
        html += "制造商：" + device.manufacturer + "<br/>";
        //whether the device is running on a simulator.
        html += "模拟器：" + (device.isVirtual ? "是" : "否") + "<br/>";
        //Get the device hardware serial number (SERIAL). Android OSX is available
        html += "硬件序列号：" + device.serial + "<br/>";
        document.getElementById("content").innerHTML = html;
    };
    //联系人信息
    document.getElementById("showcontacts").onclick = function () {
        layer.open({type: 2});
        // print all contacts
        navigator.contacts.find([
                "displayName",
                "name",
                "nickname",
                "phoneNumbers",
                "emails",
                "addresses",
                "birthday"
            ],
            function (contacts) {
                var content = "";
                for (var x in contacts) {
                    var contact = contacts[x];
                    content += "称呼：" + contact["displayName"] + "<br>";
                    content += "email：" + (contact["email"] ? contact["email"] : "") + "<br>";
                    for (var y in contact["phoneNumbers"]) {
                        content +=
                            contact["phoneNumbers"][y]["type"] + "：" +
                            contact["phoneNumbers"][y]["value"] + "<br>";
                    }
                    content += "<hr>";
                }
                document.getElementById("content").innerHTML = content;
                layer.closeAll();
            }, function (error) {
                // get contacts failed
            }
        );
    };
    //拍照获取base64码
    document.getElementById("gocamera").onclick = function () {
        // take photos
        navigator.camera.getPicture(function (imgbase64) {
            navigator.notification.alert("success");
            document.getElementById("content").innerHTML = '<img src="data:image/jpeg;base64,' +
                imgbase64 + '" style="width: 600px;height: 800px">';
        }, function (message) {
            navigator.notification.alert("failure:" + message);
        }, {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL
        });
    };
    //地理位置
    document.getElementById("getgeolocation").onclick = function () {
        layer.open({type: 2});
        navigator.geolocation.getCurrentPosition(function (position) {
            document.getElementById("content").innerHTML =
                '纬度: ' + position.coords.latitude + '\n' +
                '经度: ' + position.coords.longitude + '\n' +
                '海拔: ' + position.coords.altitude + '\n' +
                '精度: ' + position.coords.accuracy + '\n' +
                '精确高度: ' + position.coords.altitudeAccuracy + '\n' +
                '方向: ' + position.coords.heading + '\n' +
                '数据: ' + position.coords.speed + '\n' +
                '时间: ' + position.timestamp + '\n';
            layer.closeAll();
        }, function (message) {
            navigator.notification.alert("获取超时，请打开GPS和网络位置权限：" + message);
        }, {maximumAge: 3000, timeout: 5000, enableHighAccuracy: true});
    };
    // 文件系统访问
    var storage = (function () {
        var writePersistentFile = function () {
            //Before you use the File plugin APIs, you can get access to the file system using requestFileSystem,
            //then you can request either persistent or temporary storage
            //Persistent storage will not be removed unless permission is granted by the user.(用户授权后持久化的数据才会被删除)
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                //fs.root to return a DirectoryEntry object
                // which you can use to create or get a file (by calling getFile).
                fs.root.getFile("newPersistentFile.txt", {create: true, exclusive: false},
                    function (fileEntry) {
                        //The success callback for getFile receives a FileEntry object
                        console.log("fileEntry is file?" + fileEntry.isFile.toString());
                        writePersistentFile(fileEntry, null);
                    });
            });
        };
        var readFile = function (fileEntry) {

            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function () {
                    console.log("Successful file read: " + this.result);
                    displayFileData(fileEntry.fullPath + ": " + this.result);
                };

                reader.readAsText(file);

            });
        };
        var saveFile = function (dirEntry, fileData, fileName) {
            dirEntry.getFile(fileName, {create: true, exclusive: false}, function (fileEntry) {
                writeFile(fileEntry, fileData);
            });
        };
        var readBinaryFile = function (fileEntry) {

            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function () {
                    console.log("Successful file write: " + this.result);
                    displayFileData(fileEntry.fullPath + ": " + this.result);

                    var blob = new Blob([new Uint8Array(this.result)], {type: "image/png"});
                    displayImage(blob);
                };

                reader.readAsArrayBuffer(file);

            }, onErrorReadFile);
        };
        var displayImage = function displayImage(blob) {

            // Displays image if result is a valid DOM string for an image.
            var elem = document.getElementById('imageFile');
            // Note: Use window.URL.revokeObjectURL when finished with image.
            elem.src = window.URL.createObjectURL(blob);
        };
        var writeFile = function (fileEntry, dataObj, isAppend) {
            // Create a FileWriter object for our FileEntry (log.txt).
            fileEntry.createWriter(function (fileWriter) {

                fileWriter.onwriteend = function () {
                    if (dataObj.type == "image/png") {
                        readBinaryFile(fileEntry);
                    }
                    else {
                        readFile(fileEntry);
                    }
                };

                fileWriter.onerror = function (e) {
                    console.log("Failed file read: " + e.toString());
                };

                // If we are appending data to file, go to the end of the file.
                if (isAppend) {
                    try {
                        fileWriter.seek(fileWriter.length);
                    }
                    catch (e) {
                        console.log("file doesn't exist!");
                    }
                }
                fileWriter.write(dataObj);
            });
        };
        var createFile = function (dirEntry, fileName, isAppend) {
            // Creates a new file or returns the file if it already exists.
            dirEntry.getFile(fileName, {create: true, exclusive: false}, function (fileEntry) {
                writeFile(fileEntry, null, isAppend);
            });
        };
        var writeTemporaryFile = function () {
            window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
                console.log('file system open: ' + fs.name);
                createFile(fs.root, "newTempFile.txt", false);
            });
        };
        var isFile = function () {

        };
        return {};
    })();
    /**
     * 可以查看Android文件系统布局（Android File System Layout）
     * @see http://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html
     */
    document.getElementById("gofile").onclick = function () {
        var html = "";
        //Read-only directory where the application is installed. (iOS, Android, BlackBerry 10, OSX, windows)
        html += "应用安装目录:" + cordova.file.applicationDirectory + "<br/>";
        //Root directory of the application's sandbox; on iOS & windows this location is read-only
        //All data contained within is private to the app.
        html += "应用存储目录(只读):" + cordova.file.applicationStorageDirectory + "<br/>";
        // 可写目录
        // Persistent and private data storage within the application's sandbox using internal memory
        // (on Android, if you need to use external memory, use .externalDataDirectory.
        // On iOS, this directory is not synced with iCloud (use .syncedDataDirectory)
        html += "数据目录(可写):" + cordova.file.dataDirectory + "<br/>";
        //Directory for cached data files or any files that your app can re-create easily.
        //The OS may delete these files when the device runs low on storage, nevertheless, apps should not rely on the OS to delete files in here
        html += "缓存目录（可清理）:" + cordova.file.cacheDirectory + "<br/>";

        // //Android 专用
        // html += "externalApplicationStorageDirectory:" + cordova.file.externalApplicationStorageDirectory + "<br/>";
        // html += "externalDataDirectory:" + cordova.file.externalDataDirectory + "<br/>";
        // html += "externalCacheDirectory:" + cordova.file.externalCacheDirectory + "<br/>";
        // html += "externalRootDirectory:" + cordova.file.externalRootDirectory + "<br/>";
        document.getElementById("content").innerHTML = html;
    };
});