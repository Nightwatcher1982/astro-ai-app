# AI服务对比指南

本文档帮助你选择最适合的AI服务提供商。

## 🏆 推荐排序

### 1. 月之暗面 Kimi ⭐⭐⭐⭐⭐ (强烈推荐)

**优势:**
- 🇨🇳 **中文理解能力顶级** - 专为中文优化，生成的星盘分析更贴近中文表达习惯
- 🚀 **响应速度快** - 国内服务器，延迟低
- 💰 **价格便宜** - 相比OpenAI更经济
- 📱 **免费额度** - 新用户有免费试用额度
- 🔧 **API简单** - 兼容OpenAI格式，易于集成

**获取方式:**
1. 访问 https://platform.moonshot.cn/
2. 注册账户并实名认证
3. 创建API Key
4. 在Vercel中配置环境变量: `KIMI_API_KEY`

**价格:** 约 ¥0.012/1K tokens (比OpenAI便宜约70%)

---

### 2. 百度文心一言 ⭐⭐⭐⭐

**优势:**
- 🏢 **大厂品质** - 百度AI技术积累深厚
- 🛡️ **服务稳定** - 企业级SLA保障
- 🇨🇳 **中文优化** - 对中文语境理解深入
- 💳 **支付便捷** - 支持支付宝、微信等国内支付方式

**获取方式:**
1. 访问 https://cloud.baidu.com/product/wenxinworkshop
2. 注册百度智能云账户
3. 开通文心一言服务
4. 获取API Key和Secret Key
5. 配置环境变量: `BAIDU_API_KEY`, `BAIDU_SECRET_KEY`

**价格:** 约 ¥0.008/1K tokens

---

### 3. 阿里通义千问 ⭐⭐⭐⭐

**优势:**
- ☁️ **阿里云生态** - 与其他阿里云服务集成方便
- 🔒 **企业级安全** - 数据安全保障
- 📊 **丰富的模型** - 多种规模的模型可选择

**获取方式:**
1. 访问 https://dashscope.aliyun.com/
2. 注册阿里云账户
3. 开通DashScope服务
4. 创建API Key
5. 配置环境变量: `QWEN_API_KEY`

**价格:** 约 ¥0.006/1K tokens

---

### 4. OpenAI ⭐⭐⭐

**优势:**
- 🌍 **国际标准** - 业界标杆，技术先进
- 📚 **文档完善** - 开发资源丰富

**劣势:**
- 🚫 **访问限制** - 国内访问可能不稳定
- 💸 **价格较高** - 相对国内服务更贵
- 🌐 **中文能力** - 不如专门优化的中文模型

**获取方式:**
1. 访问 https://platform.openai.com/api-keys
2. 注册账户（需要国外手机号）
3. 充值美元
4. 创建API Key
5. 配置环境变量: `OPENAI_API_KEY`

**价格:** 约 $0.002/1K tokens (约 ¥0.014/1K tokens)

## 🛠️ 配置指南

### 快速开始 (推荐Kimi)

1. **注册Kimi账户**
   ```bash
   # 访问 https://platform.moonshot.cn/
   # 注册 → 实名认证 → 创建API Key
   ```

2. **配置环境变量**
   ```bash
   # 在Vercel项目设置中添加
   KIMI_API_KEY=sk-your-kimi-api-key-here
   ```

3. **测试API**
   ```bash
   npm run test-api
   ```

### 多服务配置 (高可用)

为了确保服务的高可用性，建议配置多个AI服务：

```bash
# 主服务 (Kimi)
KIMI_API_KEY=sk-your-kimi-api-key

# 备用服务 (百度)
BAIDU_API_KEY=your-baidu-api-key
BAIDU_SECRET_KEY=your-baidu-secret-key

# 备用服务 (阿里)
QWEN_API_KEY=your-qwen-api-key

# 最后备选 (OpenAI)
OPENAI_API_KEY=sk-your-openai-api-key
```

## 📊 性能对比

| 服务 | 中文能力 | 响应速度 | 价格 | 稳定性 | 推荐度 |
|------|----------|----------|------|--------|--------|
| Kimi | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 百度 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 阿里 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| OpenAI | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## 🔧 切换AI服务

如果需要指定使用某个AI服务，可以修改 `api/generate-report.ts`:

```typescript
// 使用特定的AI服务
import { callAI, AIProvider } from './ai-services';

// 只使用Kimi
const analysis = await callAI(prompt, AIProvider.KIMI);

// 只使用百度
const analysis = await callAI(prompt, AIProvider.BAIDU);
```

## 💡 成本优化建议

1. **优先使用国内服务** - 价格更便宜，速度更快
2. **监控使用量** - 在各平台设置用量警报
3. **缓存结果** - 相同输入可以缓存结果，减少API调用
4. **合理设置token限制** - 避免生成过长的文本

## 🆘 常见问题

**Q: 如何知道当前使用的是哪个AI服务？**
A: 查看Vercel的函数日志，会显示"Calling xxx AI service..."

**Q: 某个AI服务经常失败怎么办？**
A: 系统会自动重试其他服务。也可以移除该服务的API Key，跳过该服务。

**Q: 可以同时配置多个服务吗？**
A: 可以！推荐配置多个服务作为备选，提高系统可用性。

**Q: 哪个服务生成的星盘分析质量最好？**
A: 对于中文星盘分析，Kimi和百度的效果通常最好，因为它们对中文语境的理解更深入。 