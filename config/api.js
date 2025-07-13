// API配置文件
export const API_CONFIG = {
  // 开发环境使用本地服务器
  development: {
    baseUrl: 'http://192.168.3.115:3000', // 本地开发服务器
  },
  // 生产环境使用Railway部署的URL
  production: {
    baseUrl: 'https://web-production-f107a.up.railway.app', // Railway生产环境地址
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