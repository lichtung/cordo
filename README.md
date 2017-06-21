# cordova demo app

目前该APP只适用于Android，条件允许的情况下会考虑ISO的开发

实现的功能：
- 查看设备信息(系统和版本，Android设备UUID等)
- 获取联系人列表
- 获取所在的地理位置
- 拍照获取图片/相册选择图片
- 扫描二维码
- 将一段内容写入文件（目前限于文本）
- 读取一个文件中的文本
- 判断文件是否存在
- 下载文件保存到应用的数据目录
- 上传应用数据目录下的文件

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

实现的功能：
- 读取设备信息（系统，版本...）
![screenshot](https://raw.githubusercontent.com/lichtung/cordo/master/screenshots/1.png)


### keystore生成
```bash
keytool -genkey -v -keystore releasekey.keystore -alias cordova -keyalg RSA -keysize 2048 -validity 10000
```

### 签字 + 压缩
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore releasekey.keystore [path]/android-release-unsigned.apk cordova
zipalign -v 4 [path]/android-release-unsigned.apk [path]/android-release-signed.apk
```

### 一键打包 与 build.json
```bash
cordova build android --release --keystore="releasekey.keystore" --alias=cordova --storePassword=123456 --password=123456
```
使用build.json可以简化打包工作
```json
{
  "android": {
    "release": {
      "keystore": "releasekey.keystore",
      "alias": "cordova",
      "storePassword": "123456",
      "password": "123456"
    }
  }
}
```



### Android 调试
使用adb进行调试：
```bash
# 获取连接的设备列表（显示的是设备的序列号）
adb devices
# 获取信息如下：
# List of devices attached
# 6HSWPN89H6YLGEB6	device

# 连接设备
adb -s 6HSWPN89H6YLGEB6 shell
# 之后就进入了shell界面
# shell@android:/ $

# 查看/data/data目录
# 需要获取手机root权限才能浏览
su
# 登录root账户后：
# root@android:/ #
```