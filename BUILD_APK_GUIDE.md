# 📱 星盘AI应用 - APK构建指南

## 🎯 构建目标
将星盘AI应用构建为Android APK文件，用于分发和安装。

## ✅ 准备工作检查清单

### 1. 项目配置完成 ✅
- [x] Railway后端部署成功
- [x] API配置正确 (生产环境: Railway URL)
- [x] 应用配置更新 (app.json)
- [x] EAS配置创建 (eas.json)

### 2. 账户准备
- [ ] Expo开发者账户
- [ ] (可选) Google Play Console账户

## 🚀 构建方法

### 方法一：使用EAS Build (推荐)

#### 第一步：注册Expo账户
1. **访问 [https://expo.dev](https://expo.dev)**
2. **点击 "Sign up" 创建账户**
3. **使用邮箱验证账户**

#### 第二步：登录并构建
```bash
# 登录Expo账户
npx eas-cli login

# 配置项目 (首次运行)
npx eas-cli build:configure

# 构建Android APK (预览版)
npx eas-cli build --platform android --profile preview

# 构建Android APK (生产版)
npx eas-cli build --platform android --profile production
```

### 方法二：本地构建 (React Native CLI)

#### 环境要求
```bash
# 安装Android Studio和SDK
# 配置环境变量
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### 构建步骤
```bash
# 1. 创建Android项目
npx expo run:android

# 2. 生成签名APK
cd android
./gradlew assembleRelease

# APK位置: android/app/build/outputs/apk/release/app-release.apk
```

## 📋 构建配置详情

### app.json 配置
```json
{
  "expo": {
    "name": "星盘AI分析",
    "slug": "astro-ai-app",
    "version": "1.0.0",
    "android": {
      "package": "com.astroai.app",
      "versionCode": 1,
      "buildType": "apk"
    }
  }
}
```

### eas.json 配置
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## 🔧 环境变量配置

构建时需要确保：
```javascript
// config/api.js - 生产环境配置
export const API_CONFIG = {
  production: {
    baseUrl: 'https://web-production-f107a.up.railway.app'
  }
};
```

## 📦 构建输出

### EAS Build
- **构建完成后**：会在Expo账户中显示下载链接
- **文件格式**：.apk文件
- **安装方式**：直接安装到Android设备

### 本地构建
- **文件位置**：`android/app/build/outputs/apk/release/app-release.apk`
- **文件大小**：约15-25MB
- **签名状态**：需要配置签名证书

## 🎉 成功验证

构建完成后验证：
1. **APK文件大小**：15-25MB
2. **安装测试**：在Android设备上安装
3. **功能测试**：
   - 创建档案 ✅
   - 星盘分析 ✅  
   - 连接Railway API ✅
   - 界面正常显示 ✅

## 🛠️ 故障排查

### 常见问题
1. **登录失败**：检查Expo账户邮箱/密码
2. **构建失败**：检查app.json配置
3. **API连接问题**：确认Railway服务器状态
4. **签名问题**：配置Android签名证书

### 调试命令
```bash
# 检查EAS状态
npx eas-cli build:list

# 查看构建日志
npx eas-cli build:view [BUILD_ID]

# 测试API连接
curl https://web-production-f107a.up.railway.app/api/test
```

## 📈 后续步骤

APK构建完成后：
1. **内部测试**：分发给测试用户
2. **应用商店发布**：上传到Google Play Store
3. **版本管理**：记录版本号和更新日志
4. **用户反馈**：收集使用体验和改进建议

---

## 🎯 当前状态

✅ **后端部署**：Railway生产环境运行正常
✅ **API测试**：所有功能验证通过  
✅ **移动应用**：Expo测试完成
🟡 **APK构建**：等待执行
🟡 **应用发布**：准备就绪 