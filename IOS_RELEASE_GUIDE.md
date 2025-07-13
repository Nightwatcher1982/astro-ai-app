# 📱 iOS版本发布指南

## 🎯 发布前准备

### 1. Apple Developer账户
- **必须条件**：需要有效的Apple Developer账户 ($99/年)
- **注册地址**：https://developer.apple.com/programs/
- **验证方式**：企业认证或个人认证

### 2. 应用配置检查
- ✅ 应用名称：阿牧星盘
- ✅ Bundle ID：com.astroai.app
- ✅ 版本号：1.0.2
- ✅ 图标和启动页：已配置

## 🚀 发布流程

### 第一步：Apple Developer配置

1. **创建App ID**
   - 登录 [Apple Developer Portal](https://developer.apple.com/account)
   - 进入 "Certificates, Identifiers & Profiles"
   - 点击 "Identifiers" > "+" 创建新的App ID
   - Bundle ID：`com.astroai.app`
   - 应用名称：`阿牧星盘`

2. **配置应用权限**
   - Network: YES (需要网络访问)
   - 其他权限按需求添加

### 第二步：App Store Connect配置

1. **创建应用记录**
   - 访问 [App Store Connect](https://appstoreconnect.apple.com)
   - 点击 "我的App" > "+" > "新建App"
   - 填写应用信息：
     ```
     名称: 阿牧星盘
     Bundle ID: com.astroai.app
     SKU: astro-ai-app-001
     用户访问权限: 完全访问权限
     ```

2. **应用商店信息**
   ```
   应用名称: 阿牧星盘
   副标题: 专业的星盘分析应用
   类别: 生活方式
   关键词: 星盘,占星,星座,性格分析,AI
   描述: 专业的星盘分析应用，提供详细的占星图解读和个性化分析报告
   ```

### 第三步：使用EAS构建iOS应用

1. **构建预览版本** (用于测试)
   ```bash
   # 构建iOS模拟器版本
   npx eas build --platform ios --profile preview
   ```

2. **构建生产版本**
   ```bash
   # 构建iOS App Store版本
   npx eas build --platform ios --profile production
   ```

3. **构建过程**
   - EAS会自动处理证书和配置文件
   - 首次构建时会提示配置Apple Developer凭证
   - 按照提示完成Apple ID验证

### 第四步：准备应用商店素材

1. **应用图标** (已完成)
   - 1024x1024px PNG格式
   - 已通过process-logo.js生成

2. **应用截图** (需要准备)
   - iPhone 6.5寸屏幕截图 (1284x2778px)
   - iPhone 5.5寸屏幕截图 (1242x2208px)
   - iPad Pro 12.9寸截图 (2048x2732px)

3. **应用描述**
   ```
   阿牧星盘是一款专业的星盘分析应用，结合传统占星学和AI技术，为用户提供：

   ✨ 核心功能：
   • 精准的星盘计算与分析
   • AI驱动的个性化性格解读
   • 详细的十二宫位分析
   • 爱情、事业、沟通等专项分析

   🌟 特色亮点：
   • 支持全球城市地理位置查询
   • 多档案管理，家人朋友都可分析
   • 专业的占星术语和深度解读
   • 简洁优雅的用户界面

   无论您是占星初学者还是资深爱好者，阿牧星盘都能为您提供专业、准确的星盘分析服务。
   ```

### 第五步：TestFlight测试

1. **内部测试**
   ```bash
   # 构建TestFlight版本
   npx eas build --platform ios --profile production
   ```

2. **上传到TestFlight**
   - 构建完成后会自动上传
   - 在App Store Connect中配置测试用户
   - 邀请测试用户进行内测

3. **测试验证**
   - 安装和启动测试
   - 功能完整性测试
   - 性能和稳定性测试

### 第六步：提交审核

1. **更新eas.json配置**
   ```json
   {
     "submit": {
       "production": {
         "ios": {
           "appleId": "your-apple-id@example.com",
           "ascAppId": "your-app-store-connect-app-id"
         }
       }
     }
   }
   ```

2. **提交到App Store**
   ```bash
   # 提交应用到App Store审核
   npx eas submit --platform ios
   ```

3. **App Store审核**
   - 审核时间：通常1-7天
   - 可能需要回应审核团队的问题
   - 审核通过后即可发布

## 📋 详细配置示例

### app.json iOS配置优化
```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.astroai.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "我们需要您的位置信息来提供更准确的星盘分析",
        "NSCameraUsageDescription": "我们需要相机权限来扫描二维码",
        "NSPhotoLibraryUsageDescription": "我们需要相册权限来保存星盘图片"
      }
    }
  }
}
```

## 🔍 故障排查

### 常见问题解决

1. **Apple Developer凭证问题**
   ```bash
   # 重新登录Apple账户
   npx eas credentials:configure
   ```

2. **证书和配置文件问题**
   - 在Apple Developer Portal中检查证书状态
   - 确保Bundle ID匹配
   - 重新生成配置文件

3. **构建失败**
   - 检查app.json中的iOS配置
   - 确认依赖包兼容性
   - 查看EAS构建日志

### 监控构建状态
```bash
# 查看构建历史
npx eas build:list

# 查看特定构建详情
npx eas build:view [BUILD_ID]
```

## 💰 费用说明

- **Apple Developer账户**: $99/年
- **EAS构建**: 免费额度足够个人使用
- **App Store发布**: 免费

## 📞 获取帮助

如果遇到问题，可以：
1. 查看[EAS官方文档](https://docs.expo.dev/build/introduction/)
2. 查看[Apple Developer文档](https://developer.apple.com/documentation/)
3. 在[Expo论坛](https://forums.expo.dev/)寻求帮助

## 🎉 发布成功

iOS应用发布成功后，用户可以：
- 在App Store搜索"阿牧星盘"
- 通过App Store链接直接下载
- 享受完整的星盘分析功能

---

## 🚀 快速开始

如果您已经有Apple Developer账户，可以直接执行：

```bash
# 1. 构建iOS应用
npx eas build --platform ios --profile production

# 2. 提交到App Store
npx eas submit --platform ios
```

**注意**：首次构建时需要配置Apple Developer凭证和证书。 