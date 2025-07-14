# 🚀 阿牧星盘 v1.0.11 生产部署指南

## 📋 部署概览
- **应用名称**: 阿牧星盘 (Amu Astrology)
- **版本**: v1.0.11
- **技术栈**: React Native + Node.js + Swiss Ephemeris
- **新特性**: 专业星盘计算系统 (精度提升>1000x)

## 🏗️ 架构说明
```
┌─────────────────────────────────────────────────────────────┐
│                    阿牧星盘系统架构                           │
├─────────────────────────────────────────────────────────────┤
│  📱 移动应用 (React Native + Expo)                         │
│  ├─ iOS App                                                │
│  └─ Android App                                            │
│                          ↓                                 │
│  🌐 后端API服务器 (Node.js)                                │
│  ├─ 专业星盘计算器 (Swiss Ephemeris)                       │
│  ├─ 地理编码服务                                           │
│  ├─ AI分析服务 (通义千问)                                   │
│  └─ 十二宫位系统                                           │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 部署选项

### 选项1: Railway 部署 (推荐)
**优势**: 
- 适合长期运行的API服务器
- 优秀的性能监控
- 自动SSL证书
- 简单的环境变量管理

**步骤**:
1. 安装Railway CLI
```bash
# 方式1: 使用brew (macOS)
brew install railway

# 方式2: 使用npm
npm install -g @railway/cli

# 方式3: 使用curl
curl -fsSL https://railway.app/install.sh | sh
```

2. 登录Railway
```bash
railway login
```

3. 初始化项目
```bash
railway init
```

4. 设置环境变量
```bash
railway variables set QWEN_API_KEY=your_api_key_here
railway variables set NODE_ENV=production
railway variables set PORT=3000
```

5. 部署
```bash
railway up
```

### 选项2: Vercel 部署
**优势**:
- 零配置部署
- 全球CDN
- 自动HTTPS
- 优秀的开发者体验

**步骤**:
1. 安装Vercel CLI
```bash
npm install -g vercel
```

2. 登录Vercel
```bash
vercel login
```

3. 部署
```bash
vercel --prod
```

4. 设置环境变量
```bash
vercel env add QWEN_API_KEY
vercel env add NODE_ENV production
```

### 选项3: Heroku 部署
**步骤**:
1. 创建Heroku应用
```bash
heroku create your-app-name
```

2. 设置环境变量
```bash
heroku config:set QWEN_API_KEY=your_api_key_here
heroku config:set NODE_ENV=production
```

3. 部署
```bash
git push heroku main
```

## 📱 移动应用部署

### 使用EAS Build构建应用

1. 安装EAS CLI
```bash
npm install -g @expo/cli
npm install -g eas-cli
```

2. 登录Expo账户
```bash
eas login
```

3. 配置构建
```bash
eas build:configure
```

4. 构建应用
```bash
# 构建Android APK
eas build --platform android --profile production

# 构建iOS应用
eas build --platform ios --profile production

# 同时构建两个平台
eas build --platform all --profile production
```

5. 提交到应用商店
```bash
# 提交到App Store
eas submit --platform ios

# 提交到Google Play
eas submit --platform android
```

## 🔧 配置说明

### 环境变量配置
```bash
# 必需的环境变量
QWEN_API_KEY=your_qwen_api_key_here
NODE_ENV=production
PORT=3000

# 可选的环境变量
ALLOWED_ORIGINS=https://your-domain.com
MAX_REQUESTS_PER_MINUTE=100
```

### API端点配置
部署后，您的API将在以下端点可用：
- `https://your-domain.com/api/generate-report` - 生成星盘报告
- `https://your-domain.com/api/test` - 健康检查
- `https://your-domain.com/api/ping` - 基本ping测试

### 更新移动应用API地址
部署后端后，需要更新移动应用中的API地址：

1. 打开 `config/api.js`
2. 更新API基础URL：
```javascript
const API_BASE_URL = 'https://your-deployed-api.com';
```

## 🚀 快速部署脚本

### 一键部署脚本 (deploy.sh)
```bash
#!/bin/bash
echo "🚀 开始部署阿牧星盘 v1.0.11..."

# 1. 提交代码
git add .
git commit -m "🚀 部署v1.0.11"
git push origin main

# 2. 部署后端API
echo "📡 部署后端API..."
if command -v railway &> /dev/null; then
    railway up
elif command -v vercel &> /dev/null; then
    vercel --prod
else
    echo "请安装Railway或Vercel CLI"
    exit 1
fi

# 3. 构建移动应用
echo "📱 构建移动应用..."
if command -v eas &> /dev/null; then
    eas build --platform all --profile production
else
    echo "请安装EAS CLI: npm install -g eas-cli"
    exit 1
fi

echo "✅ 部署完成！"
```

## 📊 监控和维护

### 日志监控
```bash
# Railway日志
railway logs

# Vercel日志
vercel logs

# Heroku日志
heroku logs --tail
```

### 性能监控
- 设置应用监控 (如Sentry、DataDog)
- 监控API响应时间
- 监控错误率
- 监控内存使用情况

## 🔍 故障排除

### 常见问题
1. **Swiss Ephemeris库问题**
   - 确保在部署平台上支持二进制依赖
   - 检查平台兼容性

2. **API超时**
   - 增加请求超时时间
   - 优化星盘计算性能

3. **环境变量问题**
   - 确保QWEN_API_KEY正确设置
   - 检查API密钥权限

### 调试命令
```bash
# 本地测试
npm run server
curl http://localhost:3000/api/test

# 测试API端点
curl -X POST https://your-api.com/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{"date":"1990-01-01","time":"12:00","location":"北京"}'
```

## 📈 性能优化建议

1. **启用缓存**
   - 缓存地理编码结果
   - 缓存常见的星盘计算

2. **优化数据库查询**
   - 使用索引
   - 优化查询语句

3. **压缩响应**
   - 启用gzip压缩
   - 优化JSON响应大小

## 🎉 部署完成清单

- [ ] 后端API成功部署
- [ ] 环境变量正确配置
- [ ] 健康检查通过
- [ ] 移动应用构建成功
- [ ] API地址更新完成
- [ ] 功能测试通过
- [ ] 性能监控设置完成
- [ ] 应用商店提交准备就绪

---

## 📞 支持联系

如果遇到部署问题，请参考：
- 技术文档: `TECHNICAL_ARCHITECTURE.md`
- 开发指南: `DEVELOPMENT.md`
- 问题反馈: GitHub Issues

**祝您部署顺利！** 🎉 