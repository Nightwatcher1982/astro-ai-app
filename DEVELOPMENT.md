# 开发指南

本文档详细说明如何在本地环境中运行和测试星盘AI应用。

## 前置要求

- Node.js 16+ 
- npm 或 yarn
- Expo CLI (全局安装: `npm install -g @expo/eas-cli`)
- 手机上安装 Expo Go 应用

## 环境设置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置API密钥

你需要获取OpenAI API密钥：

1. 访问 https://platform.openai.com/api-keys
2. 创建新的API密钥
3. 创建 `.env` 文件（本地开发用）：

```bash
# .env 文件
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**注意**: 不要将 `.env` 文件提交到Git仓库中。

## 本地开发流程

### 方法1: 完整测试（推荐）

同时运行前端和后端：

```bash
# 终端1: 启动后端API服务器
npm run dev

# 终端2: 启动前端Expo开发服务器  
npm start
```

### 方法2: 仅测试前端UI

如果只想测试前端界面（不调用真实API）：

```bash
npm start
```

## 测试步骤

### 1. 测试后端API

```bash
# 确保后端服务器正在运行 (npm run dev)
npm run test-api
```

预期输出：
```
🧪 测试API...
测试数据: { date: '1990-01-01', time: '12:00', location: '北京' }
✅ API测试成功!
响应状态: 200
响应数据: {
  "success": true,
  "data": {
    "sunSign": "摩羯座",
    "moonSign": "...",
    "risingSign": "...",
    "analysis": "AI生成的分析报告..."
  }
}
```

### 2. 测试前端应用

1. 运行 `npm start`
2. 在手机上打开 Expo Go 应用
3. 扫描终端显示的二维码
4. 在应用中输入测试数据：
   - 日期: 任意日期
   - 时间: 任意时间  
   - 地点: 北京 (或其他城市)
5. 点击"生成我的星盘分析"
6. 查看分析结果页面

## 常见问题

### API调用失败

**问题**: 前端显示"网络请求失败"

**解决方案**:
1. 确保后端服务器正在运行 (`npm run dev`)
2. 检查 `config/api.js` 中的URL配置
3. 确保手机和电脑在同一网络
4. 尝试重启Expo开发服务器

### AI API错误

**问题**: 后端返回AI相关错误

**解决方案**:
1. 检查OpenAI API密钥是否正确
2. 确认API密钥有足够的额度
3. 查看后端控制台的详细错误信息

### 地理编码失败

**问题**: "Location not found" 错误

**解决方案**:
1. 尝试使用更具体的地点名称（如"北京市"而不是"北京"）
2. 使用英文地名（如"Beijing, China"）
3. 检查网络连接

## 构建和部署

### 本地构建测试

```bash
npm run build
```

### 部署到Vercel

```bash
# 首次部署
npx vercel

# 后续部署
npm run deploy
```

### 构建移动应用

```bash
# 安装EAS CLI (如果还没安装)
npm install -g @expo/eas-cli

# 登录Expo账户
eas login

# 构建应用
eas build --platform all
```

## 项目结构

```
├── api/                    # Vercel Serverless Functions
│   └── generate-report.ts  # 星盘分析API
├── config/                 # 配置文件
│   └── api.js             # API端点配置
├── screens/               # React Native页面
│   ├── InputScreen.js     # 输入页面
│   └── ResultScreen.js    # 结果页面
├── documents/             # 项目文档
├── App.js                 # 主应用组件
├── test-api.js           # API测试脚本
└── package.json          # 项目配置
``` 