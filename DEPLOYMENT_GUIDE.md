# 🚀 星盘AI应用部署指南

## 📋 部署前检查清单

- ✅ 后端服务器 (server.js) 已完成开发
- ✅ 前端移动应用已完成开发
- ✅ 档案管理系统已完成
- ✅ 健康检查端点已添加
- ✅ 生产环境配置已准备

## 🎯 部署方案

### 方案 1: Railway (推荐) ⚡

**优点**: 简单易用，自动部署，免费额度充足

1. **注册 Railway 账号**
   - 访问 [railway.app](https://railway.app)
   - 使用 GitHub 账号登录

2. **部署后端**
   ```bash
   # 1. 安装 Railway CLI
   npm install -g @railway/cli
   
   # 2. 登录
   railway login
   
   # 3. 部署
   railway up
   ```

3. **设置环境变量**
   在 Railway 项目设置中添加：
   ```
   QWEN_API_KEY=your_actual_api_key
   NODE_ENV=production
   ```

4. **获取部署URL**
   - Railway 会自动生成一个 URL，类似: `https://your-app.railway.app`

### 方案 2: Render

**优点**: 免费，稳定，支持自动部署

1. **注册 Render 账号**
   - 访问 [render.com](https://render.com)
   - 连接 GitHub 仓库

2. **创建 Web Service**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - 添加环境变量: `QWEN_API_KEY`

### 方案 3: Heroku

**优点**: 成熟稳定，文档丰富

1. **创建 Procfile**
   ```
   web: node server.js
   ```

2. **部署命令**
   ```bash
   heroku create your-app-name
   git push heroku main
   heroku config:set QWEN_API_KEY=your_actual_api_key
   ```

## 📱 前端部署

### Expo 发布

1. **配置生产环境API地址**
   更新 `config/api.js` 中的 `production.baseUrl`

2. **发布到 Expo**
   ```bash
   npx expo publish
   ```

3. **构建独立应用**
   ```bash
   # Android
   npx expo build:android
   
   # iOS
   npx expo build:ios
   ```

## 🔧 配置文件更新

### 1. 更新前端API配置

更新 `config/api.js`：
```javascript
production: {
  baseUrl: 'https://your-actual-deployment-url.com', // 替换为实际部署URL
}
```

### 2. 环境变量

**后端环境变量**:
```
QWEN_API_KEY=your_actual_qwen_api_key
NODE_ENV=production
PORT=3000 (自动设置)
```

## 🚧 部署后验证

### 1. 检查后端健康状态
```bash
curl https://your-deployment-url.com/api/test
```

预期响应：
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-xx-xx...",
  "version": "2.0.0"
}
```

### 2. 测试 API 接口
```bash
curl -X POST https://your-deployment-url.com/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{"date": "1990-01-01", "time": "12:00", "location": "北京"}'
```

### 3. 前端测试
- 打开移动应用
- 创建测试档案
- 进行星盘分析
- 检查所有功能正常

## 📊 监控和维护

### 1. 日志监控
- Railway: 自带日志查看
- Render: Dashboard 中查看日志
- Heroku: `heroku logs --tail`

### 2. 性能监控
建议集成：
- Sentry (错误监控)
- LogRocket (用户行为)
- New Relic (性能监控)

## 🔒 安全注意事项

1. **API 密钥保护**
   - 永远不要在代码中硬编码 API 密钥
   - 使用环境变量管理敏感信息

2. **CORS 配置**
   - 生产环境中限制 CORS 到具体域名

3. **HTTPS**
   - 确保部署平台启用 HTTPS

## 🎉 部署完成

恭喜！你的星盘AI应用现在已经部署到生产环境了！

### 功能清单
- ✅ 完整的星盘分析
- ✅ 用户档案管理
- ✅ 宫位系统分析
- ✅ 分析历史记录
- ✅ 多AI服务商支持

## 📞 获取帮助

如果遇到部署问题，可以：
1. 检查部署平台的日志
2. 验证环境变量配置
3. 测试本地开发环境
4. 查看平台官方文档 

**或者，如果你已经知道仓库URL，我可以直接帮你执行。请告诉我你创建的GitHub仓库URL，格式类似：**
`https://github.com/你的用户名/astro-ai-app.git`

## 🚄 第三步：在Railway上部署

一旦代码推送到GitHub后，我们就可以在Railway上部署了：

1. **访问 [Railway](https://railway.app)**
2. **登录你的Railway账号**
3. **点击 "New Project"**
4. **选择 "Deploy from GitHub repo"**
5. **选择你刚创建的 `astro-ai-app` 仓库**
6. **Railway会自动检测到Node.js项目并开始部署**

## 🔧 第四步：配置环境变量

部署过程中，你需要在Railway中添加环境变量：

1. **在Railway项目面板中，点击 "Variables" 标签**
2. **添加以下环境变量：**
   - `QWEN_API_KEY`: 你的通义千问API密钥
   - `NODE_ENV`: `production`

**你现在可以先去创建GitHub仓库，然后告诉我仓库URL，我来帮你完成剩下的推送步骤！** 📚✨ 