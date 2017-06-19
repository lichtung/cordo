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
});