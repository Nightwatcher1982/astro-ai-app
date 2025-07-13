// 测试Railway API连接
const RAILWAY_API_URL = 'https://web-production-f107a.up.railway.app';

console.log('🧪 测试Railway API连接...');

// 测试健康检查
async function testHealthCheck() {
  try {
    console.log('📊 测试健康检查端点...');
    const response = await fetch(`${RAILWAY_API_URL}/api/test`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ 健康检查成功:', data);
      return true;
    } else {
      console.log('❌ 健康检查失败:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ 健康检查错误:', error.message);
    return false;
  }
}

// 测试星盘分析API
async function testAstroAPI() {
  try {
    console.log('🔮 测试星盘分析API...');
    const response = await fetch(`${RAILWAY_API_URL}/api/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: '1990-01-01',
        time: '12:00',
        location: '北京'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ 星盘分析API成功!');
      console.log('🌟 结果预览:', {
        太阳星座: data.data.sunSign,
        月亮星座: data.data.moonSign,
        上升星座: data.data.risingSign,
        地点: data.data.location
      });
      return true;
    } else {
      console.log('❌ 星盘分析API失败:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ 星盘分析API错误:', error.message);
    return false;
  }
}

// 运行所有测试
async function runTests() {
  console.log(`\n🌐 Railway部署地址: ${RAILWAY_API_URL}\n`);
  
  const healthOK = await testHealthCheck();
  console.log('');
  
  const astroOK = await testAstroAPI();
  console.log('');
  
  if (healthOK && astroOK) {
    console.log('🎉 所有测试通过！Railway API工作正常！');
    console.log('📱 移动应用可以安全使用Railway API');
  } else {
    console.log('⚠️  部分测试失败，请检查Railway部署状态');
  }
}

// 在Node.js环境中运行
if (typeof require !== 'undefined') {
  // Node.js环境
  const fetch = require('node-fetch').default || require('node-fetch');
  runTests();
}

// 导出供移动应用使用
module.exports = {
  testHealthCheck,
  testAstroAPI,
  runTests,
  RAILWAY_API_URL
}; 