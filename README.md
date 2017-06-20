# cordova demo app

### 安装+打包
```bash
wget https://github.com/lichtung/cordo/archive/master.zip
unzip master.zip
cd cordo-master
npm install
./build.sh

# 在Android模拟器中运行
cordova run android
# 生成发行版
cordova build android --release
```
生成android发行版时apk存放的目录是**.../cordo-master/platforms/android/build/outputs/apk/**
之后就看到了该目录下躺着**android-release.apk**

该示例使用了以下插件：
- cordova-plugin-camera^2.4.1
- cordova-plugin-contacts^2.3.1
- cordova-plugin-device^1.1.6
- cordova-plugin-dialogs^1.3.3

实现的功能：
- 读取设备信息（系统，版本...）

![screenshot](https://raw.githubusercontent.com/lichtung/cordo/master/screenshots/1.png)

- 读取联系人信息

![screenshot](https://raw.githubusercontent.com/lichtung/cordo/master/screenshots/2.png)

- 拍照并获取照片base64码

![screenshot](https://raw.githubusercontent.com/lichtung/cordo/master/screenshots/3.png)


- 获取地理位置

![screenshot](https://raw.githubusercontent.com/lichtung/cordo/master/screenshots/4.png)
