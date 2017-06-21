/**
 * Created by lin on 6/20/17.
 */
cordo.initialize(function () {
    var domcontent = document.getElementById("content");
    // document.getElementById("gootherpage").onclick = function () {
    //     location.href = "login.html";
    // };
    // 设备信息
    document.getElementById("showdevice").onclick = function () {
        // This plugin defines a global device object, which describes the device's hardware and software.
        // Although the object is in the global scope, it is not available until after the deviceready event.
        var html = "";
        // Get the version of Cordova running on the device.
        html += "型号：" + cordo.getDeviceModel() + "<br/>";
        html += "系统：" + cordo.getDevicePlatform() + "<br/>";
        html += "系统版本：" + cordo.getDevicePlatformVersion() + "<br/>";
        html += "UUID：" + cordo.getUUID() + "<br/>";
        html += "制造商：" + cordo.getManufacturer() + "<br/>";
        html += "模拟器：" + (cordo.isVirtual() ? "是" : "否") + "<br/>";
        html += "序列号：" + (device.serial ? device.serial : "no serial") + "<br/>";
        domcontent.innerHTML = html;
    };
    //联系人信息
    document.getElementById("showcontacts").onclick = function () {
        var contacts_content = "";
        layer.open({type: 2});
        // print all contacts
        cordo.iterateContacts(function (contact) {
            contacts_content += "称呼：" + contact["displayName"] + "<br>";
            contacts_content += "email：" + (contact["email"] ? contact["email"] : "") + "<br>";
            for (var y in contact["phoneNumbers"]) {
                contacts_content +=
                    contact["phoneNumbers"][y]["type"] + "：" +
                    contact["phoneNumbers"][y]["value"] + "<br>";
            }
            contacts_content += "<hr>";
        }, function (error) {
            if (error) {
                cordo.alert("error code:" + error.code + " message:" + error.message);
            } else {
                domcontent.innerHTML = contacts_content;
            }
            layer.closeAll();
        }, [
            "displayName",
            "phoneNumbers",
            "birthday"
        ]);
    };
    //拍照获取base64码
    document.getElementById("gocamera").onclick = function () {
        // take photos
        cordo.getPicture(function (isSuccess, data) {
            if (isSuccess) {
                domcontent.innerHTML = '<img src="' + data + '" style="width: 600px;height: 800px">';
            } else {
                cordo.alert("Error code:" + data.code + " message:" + data.message);
            }
        }, {}, true);
    };
    //地理位置
    document.getElementById("getgeolocation").onclick = function () {
        layer.open({type: 2});
        cordo.getGeolocation(function (isSuccess, data) {
            if (isSuccess) {
                domcontent.innerHTML =
                    '纬度: ' + data.latitude + '\n' +
                    '经度: ' + data.longitude + '\n' +
                    '海拔: ' + data.altitude + '\n' +
                    '精度: ' + data.accuracy + '\n' +
                    '精确高度: ' + data.altitudeAccuracy + '\n' +
                    '方向: ' + data.heading + '\n' +
                    '数据: ' + data.speed + '\n';
            } else {
                cordo.alert("Error code：" + data.code + " message:" + data.message);
            }
            layer.closeAll();
        });
    };
    /**
     * 可以查看Android文件系统布局（Android File System Layout）
     * @see http://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html
     */
    var displayStorageInfo = function () {
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

        domcontent.innerHTML = html;
    };

    document.getElementById("testwritenotexistfile").onclick = function () {
        displayStorageInfo();
        cordo.storage.read("testwritenotexistfile.txt", function (success, content) {
            if (success) {
                cordo.alert("content ：" + content);
            } else {
                if (content.code === 1) {
                    cordo.alert("文件不存在");
                } else {
                    cordo.alert('错误 code:' + content.code + " message:" + content.message);
                }
            }
        });
    };
    document.getElementById("testwrite").onclick = function () {
        displayStorageInfo();
        navigator.notification.prompt("请输入一段文本", function (txt) {
            cordo.storage.write("prompt_input.txt", txt.input1);
        }, "提示", "确定", (new Date()).toDateString());
    };
    document.getElementById("testread").onclick = function () {
        displayStorageInfo();
        cordo.storage.read("prompt_input.txt", function (success, content) {
            cordo.alert("你刚才输入的是：" + content);
        });
    };

    document.getElementById("godownload").onclick = function () {
        cordo.download(
            "http://feat.pgyxwd.com/upload/res.txt",
            "download.txt",
            function (res, data) {
                if (!res) {
                    cordo.alert("error code:" + data.code +
                        " message:" + data.message);
                } else {
                    cordo.alert("file saved in " + data.fullPath + " url:" + data.toURL());
                    cordo.beep();
                }
            });
    };
    document.getElementById("scan").onclick = function () {
        cordo.scan(function (res, data) {
            if (res) {
                cordo.alert("content:" + data.text +
                    " canceled:" + data.cancel.toString() +
                    " format:" + data.format);
            } else {
                cordo.alert(data);
            }
        });
    };


    document.getElementById("readdownload").onclick = function () {
        cordo.storage.read("download.txt", function (res, content) {
            res ? cordo.alert("下载的文件内容：" + content) :
                cordo.alert("读取失败：" + content);
        });
    };

    document.getElementById("goupload").onclick = function () {
        cordo.storage.write("download.txt", (new Date()).toLocaleString(), function (res, error) {
            if (res) {
                cordo.upload("download.txt",
                    "http://feat.pgyxwd.com/index/testupload",
                    function (res, data) {
                        domcontent.innerHTML = '<a href="' + data.message + '">浏览器中查看上传文件</a>';
                    });
            } else {
                cordo.alert(error.message);
            }
        });
    };

});