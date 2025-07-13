// API配置文件
export const API_CONFIG = {
  // 开发环境使用本地服务器（需要运行自定义server.js）
  development: {
    baseUrl: 'http://192.168.3.115:3000',
  },
  // 生产环境使用Vercel部署的URL
  production: {
    baseUrl: 'https://your-vercel-app.vercel.app', // 用户需要替换为实际的Vercel URL
  }
};

// 获取当前环境的API基础URL
export const getApiBaseUrl = () => {
  return __DEV__ ? API_CONFIG.development.baseUrl : API_CONFIG.production.baseUrl;
};

// API端点
export const API_ENDPOINTS = {
  generateReport: '/api/generate-report',
};

// 完整的API URL生成函数
export const getApiUrl = (endpoint) => {
  return `${getApiBaseUrl()}${endpoint}`;
}; 