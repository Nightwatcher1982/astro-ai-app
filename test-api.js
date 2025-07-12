// 简单的API测试脚本
// 运行方式: node test-api.js

const axios = require('axios');

const testData = {
  date: '1990-01-01',
  time: '12:00',
  location: '北京'
};

async function testAPI() {
  try {
    console.log('🧪 测试API...');
    console.log('测试数据:', testData);
    
    const response = await axios.post('http://localhost:3000/api/generate-report', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API测试成功!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else {
      console.error('网络错误:', error.message);
    }
  }
}

// 检查是否直接运行此脚本
if (require.main === module) {
  testAPI();
} 