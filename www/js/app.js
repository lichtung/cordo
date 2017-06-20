/**
 * Created by lin on 6/20/17.
 */
cordo.initialize(function () {
    // document.getElementById("gootherpage").onclick = function () {
    //     location.href = "login.html";
    // };
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
    var contacts_content = "";
    document.getElementById("showcontacts").onclick = function () {
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
                cordo.alert(error);
            } else {
                document.getElementById("content").innerHTML = contacts_content;
            }
            layer.closeAll();
        });
    };
    //拍照获取base64码
    document.getElementById("gocamera").onclick = function () {
        // take photos
        cordo.takePhoto(function (isSuccess, data) {
            if (isSuccess) {
                cordo.alert("success");
                document.getElementById("content").innerHTML = '<img src="data:image/jpeg;base64,' +
                    data + '" style="width: 600px;height: 800px">';
            } else {
                cordo.alert("failure:" + data);
            }
        });
    };
    //地理位置
    document.getElementById("getgeolocation").onclick = function () {
        layer.open({type: 2});
        cordo.getGeolocation(function (isSuccess, data) {
            if (isSuccess) {
                document.getElementById("content").innerHTML =
                    '纬度: ' + data.latitude + '\n' +
                    '经度: ' + data.longitude + '\n' +
                    '海拔: ' + data.altitude + '\n' +
                    '精度: ' + data.accuracy + '\n' +
                    '精确高度: ' + data.altitudeAccuracy + '\n' +
                    '方向: ' + data.heading + '\n' +
                    '数据: ' + data.speed + '\n';
            } else {
                cordo.alert("获取超时，请打开GPS和网络位置权限：" + data);
            }
            layer.closeAll();
        });
    };
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

        document.getElementById("content").innerHTML = html;
    };

    document.getElementById("testwrite").onclick = function () {
        navigator.notification.prompt("请输入一段文本", function (txt) {
            cordo.storage.write("prompt_input.txt", txt.input1);
        }, "提示", "确定", (new Date()).toDateString());
    };
    document.getElementById("testread").onclick = function () {
        cordo.storage.read("prompt_input.txt", function (success, content) {
            cordo.alert("你刚才输入的是：" + content);
        });
    };
});