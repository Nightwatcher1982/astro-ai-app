# 技术架构文档 - AI星盘分析App

## 1. 概述

本项目的技术架构遵循以下核心原则：
*   **轻量化**: 适合独立开发者，避免不必要的复杂性。
*   **低成本/无成本启动**: 优先选用提供慷慨免费额度的Serverless和云服务。
*   **高效率开发**: 采用全栈JavaScript/TypeScript，最大化代码复用和开发流畅度。
*   **易于维护和扩展**: 借助托管服务，将运维成本降至最低。

## 2. 系统架构图

```mermaid
graph TD
    subgraph "用户设备"
        A[React Native App (Expo)]
    end

    subgraph "云平台 (Vercel)"
        B["Serverless Function<br/>(Node.js/TypeScript)"]
        C["开源星盘计算库<br/>(e.g., astrolabe-js)"]
    end

    subgraph "第三方服务"
        E[大语言模型 API<br/>(Kimi / OpenAI)]
    end

    A -- "1. 发送出生信息 (HTTPS)" --> B
    B -- "2. 内部调用计算库" --> C
    B -- "3. 构造Prompt并请求" --> E
    E -- "4. 返回AI分析结果" --> B
    B -- "5. 将结果响应给App" --> A
```

## 3. 技术栈详情

### 前端 (Client)
*   **框架**: `React Native`
*   **环境**: `Expo` (用于快速启动、开发和构建)
*   **导航**: `React Navigation`
*   **UI库**: `React Native Paper` (推荐) 或 React Native内置组件
*   **状态管理**:
    *   MVP阶段: `React Context API`
    *   后续扩展: `Zustand`
*   **打包与部署**: `Expo Application Services (EAS) CLI`

### 后端 (Backend)
*   **平台**: `Vercel Serverless Functions`
*   **语言**: `Node.js` (推荐使用`TypeScript`以增强代码健壮性)
*   **核心依赖**:
    *   `astrolabe-js` 或其他成熟的占星计算NPM包。
    *   `axios` 或 `node-fetch` 用于调用外部API。
    *   `vercel` CLI用于本地开发和部署。
*   **API接口**: 所有的后端逻辑将被部署为一个或多个无服务器函数，通过HTTP端点暴露给前端App。例如: `POST /api/generate-report`。

### AI 服务 (Artificial Intelligence)
*   **多服务支持**: 支持多个AI服务提供商，包括：
    *   `月之暗面 (Kimi)` - 首选，中文能力强
    *   `百度文心一言` - 国内大厂，稳定可靠
    *   `阿里通义千问` - 阿里云生态
    *   `OpenAI (GPT-3.5/4)` - 国际备选
*   **智能重试**: 按优先级自动尝试不同服务，确保高可用性
*   **集成方式**: 统一的AI服务抽象层，支持动态切换
*   **安全**: 所有API Key作为环境变量存储，**严禁硬编码或暴露在前端代码中**。

## 4. 部署与运维

*   **后端部署**:
    1.  代码托管在GitHub/GitLab仓库中。
    2.  Vercel平台关联该仓库。
    3.  `git push`到主分支即可触发自动构建和部署。
*   **前端部署**:
    1.  使用`eas build`命令在云端为iOS和Android构建生产版本的`.ipa`和`.apk`文件。
    2.  将构建好的文件手动上传至Apple App Store和Google Play Store。
*   **运维**: **零服务器运维**。所有计算资源由Expo、Vercel和AI提供商托管。开发者只需关注代码逻辑。

## 5. 数据存储 (未来)

当需要实现用户注册、保存星盘档案等功能时，推荐以下Serverless数据库方案：
*   `Supabase`: 提供基于Postgres的数据库、认证和存储，有免费套餐。
*   `Vercel KV` 或 `Vercel Postgres`: 与Vercel生态无缝集成。
*   `Firebase Firestore`: 成熟的NoSQL数据库解决方案。 