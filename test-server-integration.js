// 测试服务器集成专业计算器后的功能
const http = require('http');

async function testServerIntegration() {
  console.log('🧪 测试服务器集成专业计算器功能...');
  
  // 启动测试服务器
  const server = require('./server');
  
  // 测试数据
  const testData = {
    date: '1990-01-01',
    time: '12:00',
    location: '北京'
  };
  
  // 创建POST请求
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-report',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ 服务器响应成功:');
        console.log(`  太阳星座: ${result.data.sunSign}`);
        console.log(`  月亮星座: ${result.data.moonSign}`);
        console.log(`  上升星座: ${result.data.risingSign}`);
        console.log(`  水星星座: ${result.data.mercurySign}`);
        console.log(`  金星星座: ${result.data.venusSign}`);
        console.log(`  火星星座: ${result.data.marsSign}`);
        console.log(`  位置: ${result.location}`);
        console.log(`  分析报告: ${result.data.analysis.substring(0, 100)}...`);
        
        process.exit(0);
      } catch (error) {
        console.error('❌ 解析响应失败:', error);
        console.error('原始响应:', data);
        process.exit(1);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ 请求失败:', error);
    process.exit(1);
  });
  
  // 发送请求
  req.write(postData);
  req.end();
}

// 等待服务器启动后运行测试
setTimeout(testServerIntegration, 2000); 