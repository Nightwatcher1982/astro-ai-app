# 星盘AI (AstroAI) 

一款小而美的AI星盘分析应用，使用React Native + Expo开发。

## 功能特点

- 🌟 输入出生信息，获取个性化星盘分析
- 🤖 AI驱动的性格分析报告
- 📱 跨平台移动应用（iOS + Android）
- ☁️ 无服务器架构，低成本运行

## 技术栈

- **前端**: React Native + Expo
- **后端**: Vercel Serverless Functions
- **AI服务**: OpenAI GPT-3.5/4
- **地理编码**: OpenStreetMap Nominatim API

## 开发环境设置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置AI服务

项目支持多个AI服务提供商，推荐使用国内服务：

#### 方案1: 月之暗面 Kimi (推荐) 🌟
```
KIMI_API_KEY=sk-your-kimi-api-key-here
```
获取方式：访问 https://platform.moonshot.cn/

#### 方案2: 百度文心一言
```
BAIDU_API_KEY=your-baidu-api-key
BAIDU_SECRET_KEY=your-baidu-secret-key
```
获取方式：访问 https://cloud.baidu.com/product/wenxinworkshop

#### 方案3: 阿里通义千问
```
QWEN_API_KEY=your-qwen-api-key
```
获取方式：访问 https://dashscope.aliyun.com/

#### 方案4: OpenAI (备选)
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```
获取方式：访问 https://platform.openai.com/api-keys

**智能重试**: 系统会按优先级自动尝试不同的AI服务，确保高可用性。

### 3. 本地开发

启动Expo开发服务器：

```bash
npm start
```

在手机上安装Expo Go应用，扫描二维码即可预览。

### 4. 部署

#### 后端部署（Vercel）

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 自动部署完成

#### 前端构建（EAS）

```bash
# 安装EAS CLI
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
├── documents/              # 项目文档
├── App.js                  # 主应用组件
├── package.json           # 项目依赖
└── vercel.json            # Vercel配置
```

## API接口

### POST /api/generate-report

生成星盘分析报告

**请求体：**
```json
{
  "date": "1990-01-01",
  "time": "12:00",
  "location": "北京"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "sunSign": "摩羯座",
    "moonSign": "双鱼座",
    "risingSign": "天秤座",
    "analysis": "AI生成的性格分析报告..."
  },
  "location": "北京市, 中国"
}
```

## 许可证

MIT License 