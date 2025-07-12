# 部署检查清单

在将应用部署到生产环境之前，请确保完成以下所有步骤：

## ✅ 部署前检查

### 1. 代码准备
- [ ] 所有功能已在本地测试通过
- [ ] 代码已提交到Git仓库
- [ ] 删除了所有调试代码和console.log
- [ ] 更新了版本号 (package.json)

### 2. API配置
- [ ] 已获取OpenAI API密钥
- [ ] API密钥有足够的使用额度
- [ ] 在本地测试了API功能 (`npm run test-api`)

### 3. 环境变量
- [ ] 准备好在Vercel中配置以下环境变量：
  - `OPENAI_API_KEY`: OpenAI API密钥

### 4. 前端配置
- [ ] 更新 `config/api.js` 中的生产环境URL
- [ ] 确认所有依赖项已正确安装

## 🚀 Vercel部署步骤

### 1. 创建Vercel项目

```bash
# 在项目根目录运行
npx vercel
```

按照提示操作：
- 选择账户
- 确认项目名称
- 确认项目设置

### 2. 配置环境变量

在Vercel Dashboard中：
1. 进入项目设置 (Settings)
2. 点击 "Environment Variables"
3. 添加环境变量：
   - Name: `OPENAI_API_KEY`
   - Value: 你的OpenAI API密钥
   - Environment: Production

### 3. 更新前端配置

获取Vercel部署URL后，更新 `config/api.js`：

```javascript
production: {
  baseUrl: 'https://your-actual-vercel-url.vercel.app', // 替换为实际URL
}
```

### 4. 重新部署

```bash
npm run deploy
```

## 📱 移动应用构建

### 1. 准备Expo账户

```bash
# 安装EAS CLI
npm install -g @expo/eas-cli

# 登录
eas login
```

### 2. 配置EAS

```bash
# 初始化EAS配置
eas build:configure
```

### 3. 构建应用

```bash
# 构建所有平台
eas build --platform all

# 或分别构建
eas build --platform ios
eas build --platform android
```

### 4. 应用商店准备
- [ ] 准备应用图标 (1024x1024px)
- [ ] 准备应用截图
- [ ] 编写应用描述
- [ ] 准备隐私政策页面

## 🧪 部署后测试

### 1. API测试
- [ ] 访问 `https://your-vercel-url.vercel.app/api/generate-report`
- [ ] 使用Postman或curl测试API端点
- [ ] 确认返回正确的JSON响应

### 2. 前端测试
- [ ] 在Expo Go中测试完整流程
- [ ] 测试不同的输入数据
- [ ] 确认错误处理正常工作
- [ ] 测试分享功能

### 3. 性能检查
- [ ] API响应时间 < 5秒
- [ ] 应用启动速度正常
- [ ] 界面渲染流畅

## 📊 监控和维护

### 1. 设置监控
- [ ] 在Vercel Dashboard查看函数日志
- [ ] 监控API使用量和费用
- [ ] 设置错误警报

### 2. 用户反馈
- [ ] 准备收集用户反馈的渠道
- [ ] 监控应用商店评价
- [ ] 准备快速修复流程

## 🔄 更新流程

### 代码更新
```bash
# 提交代码
git add .
git commit -m "描述更改"
git push

# 自动部署到Vercel
# 或手动部署: npm run deploy
```

### 应用更新
```bash
# 重新构建应用
eas build --platform all

# 提交到应用商店
```

## 🆘 紧急回滚

如果部署出现问题：

1. **Vercel回滚**:
   - 在Vercel Dashboard中选择之前的部署版本
   - 点击"Promote to Production"

2. **代码回滚**:
   ```bash
   git revert <commit-hash>
   git push
   ```

## 📞 支持联系

部署过程中遇到问题？
- Vercel文档: https://vercel.com/docs
- Expo文档: https://docs.expo.dev/
- OpenAI API文档: https://platform.openai.com/docs 