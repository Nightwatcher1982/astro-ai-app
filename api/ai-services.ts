// AI服务管理模块
import axios from 'axios';

// AI服务提供商枚举
export enum AIProvider {
  KIMI = 'kimi',
  BAIDU = 'baidu', 
  OPENAI = 'openai',
  QWEN = 'qwen'
}

// AI服务配置
interface AIServiceConfig {
  baseUrl: string;
  headers: (apiKey: string) => Record<string, string>;
  requestBody: (prompt: string) => any;
  parseResponse: (response: any) => string;
}

// 各AI服务的配置
const AI_CONFIGS: Record<AIProvider, AIServiceConfig> = {
  [AIProvider.KIMI]: {
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    requestBody: (prompt: string) => ({
      model: 'moonshot-v1-8k',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    }),
    parseResponse: (response: any) => response.data.choices[0].message.content.trim()
  },

  [AIProvider.BAIDU]: {
    baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
    headers: (accessToken: string) => ({
      'Content-Type': 'application/json'
    }),
    requestBody: (prompt: string) => ({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_output_tokens: 800
    }),
    parseResponse: (response: any) => response.data.result
  },

  [AIProvider.OPENAI]: {
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    requestBody: (prompt: string) => ({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    }),
    parseResponse: (response: any) => response.data.choices[0].message.content.trim()
  },

  [AIProvider.QWEN]: {
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    requestBody: (prompt: string) => ({
      model: 'qwen-turbo',
      input: { messages: [{ role: 'user', content: prompt }] },
      parameters: { temperature: 0.7, max_tokens: 800 }
    }),
    parseResponse: (response: any) => response.data.output.text
  }
};

// 百度文心一言需要先获取access_token
async function getBaiduAccessToken(): Promise<string> {
  const apiKey = process.env.BAIDU_API_KEY;
  const secretKey = process.env.BAIDU_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
    throw new Error('Baidu API credentials not configured');
  }

  const response = await axios.post(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`
  );
  
  return response.data.access_token;
}

// 通用AI调用函数
export async function callAI(prompt: string, provider: AIProvider = AIProvider.KIMI): Promise<string> {
  try {
    const config = AI_CONFIGS[provider];
    
    // 获取API密钥
    let apiKey: string;
    switch (provider) {
      case AIProvider.KIMI:
        apiKey = process.env.KIMI_API_KEY || '';
        break;
      case AIProvider.BAIDU:
        apiKey = await getBaiduAccessToken();
        break;
      case AIProvider.OPENAI:
        apiKey = process.env.OPENAI_API_KEY || '';
        break;
      case AIProvider.QWEN:
        apiKey = process.env.QWEN_API_KEY || '';
        break;
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }

    if (!apiKey) {
      throw new Error(`API key not configured for provider: ${provider}`);
    }

    // 构建请求
    const requestConfig = {
      method: 'POST',
      url: provider === AIProvider.BAIDU ? `${config.baseUrl}?access_token=${apiKey}` : config.baseUrl,
      headers: config.headers(apiKey),
      data: config.requestBody(prompt)
    };

    console.log(`Calling ${provider} AI service...`);
    const response = await axios(requestConfig);
    
    return config.parseResponse(response);
    
  } catch (error) {
    console.error(`AI service error (${provider}):`, error);
    throw error;
  }
}

// 智能重试机制 - 按优先级尝试不同的AI服务
export async function callAIWithFallback(prompt: string): Promise<string> {
  // 按优先级排序的AI服务列表
  const providers = [
    AIProvider.KIMI,    // 首选：中文能力强
    AIProvider.BAIDU,   // 备选：稳定可靠
    AIProvider.QWEN,    // 备选：阿里云
    AIProvider.OPENAI   // 最后选择：国际服务
  ];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      console.log(`Trying AI provider: ${provider}`);
      const result = await callAI(prompt, provider);
      console.log(`Success with provider: ${provider}`);
      return result;
    } catch (error) {
      console.warn(`Provider ${provider} failed:`, error instanceof Error ? error.message : error);
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  // 如果所有服务都失败，抛出最后一个错误
  throw lastError || new Error('All AI services failed');
} 