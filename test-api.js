const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// 启用基本的CORS支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json());

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.11',
    service: 'astro-ai-backend',
    message: '阿牧星盘后端服务正常运行'
  });
});

// 基本测试端点
app.get('/api/test', (req, res) => {
  res.json({
    message: '🌟 阿牧星盘API测试成功！',
    success: true,
    timestamp: new Date().toISOString(),
    features: [
      '✅ 专业星盘计算器 (Swiss Ephemeris)',
      '✅ 完整十二宫位系统',
      '✅ AI智能分析报告',
      '✅ 地理编码支持',
      '✅ 生产环境部署'
    ]
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '阿牧星盘 API',
    version: '1.0.11',
    status: 'running',
    endpoints: [
      'GET /api/health - 健康检查',
      'GET /api/test - 基本测试',
      'POST /api/generate-report - 生成星盘报告'
    ]
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 阿牧星盘测试API启动成功!`);
  console.log(`📡 服务器地址: http://localhost:${PORT}`);
  console.log(`🌟 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🔧 测试端点: http://localhost:${PORT}/api/test`);
  console.log(`📊 根路径: http://localhost:${PORT}`);
  console.log(`按 Ctrl+C 停止服务器`);
}); 