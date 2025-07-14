const ProfessionalAstroCalculator = require('./professional-astro-calculator');

function testProfessionalCalculator() {
  console.log('🚀 开始测试专业星盘计算器...\n');
  
  const calculator = new ProfessionalAstroCalculator();
  
  // 测试用例
  const testCases = [
    {
      name: '测试案例1: 1990-01-01 12:00 北京',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      latitude: 39.9042,
      longitude: 116.4074,
      location: '北京'
    },
    {
      name: '测试案例2: 1982-02-23 17:00 桂林',
      birthDate: '1982-02-23',
      birthTime: '17:00',
      latitude: 25.2342,
      longitude: 110.1767,
      location: '桂林'
    },
    {
      name: '测试案例3: 1983-10-21 11:00 益阳',
      birthDate: '1983-10-21',
      birthTime: '11:00',
      latitude: 28.6000,
      longitude: 112.3300,
      location: '益阳'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`📍 位置: ${testCase.location} (${testCase.latitude}°N, ${testCase.longitude}°E)`);
    console.log(`📅 出生: ${testCase.birthDate} ${testCase.birthTime}`);
    console.log('─'.repeat(60));
    
    try {
      const startTime = Date.now();
      
      // 使用专业计算器
      const professionalResult = calculator.generateProfessionalReport(
        testCase.birthDate, 
        testCase.birthTime, 
        testCase.latitude, 
        testCase.longitude
      );
      
      const endTime = Date.now();
      const calculationTime = endTime - startTime;
      
      console.log('🌟 专业计算结果:');
      console.log(`   太阳: ${professionalResult.sunSign} (${professionalResult.planetDegrees.sun.toFixed(2)}°, 第${professionalResult.planetHouses.sun}宫)`);
      console.log(`   月亮: ${professionalResult.moonSign} (${professionalResult.planetDegrees.moon.toFixed(2)}°, 第${professionalResult.planetHouses.moon}宫)`);
      console.log(`   上升: ${professionalResult.risingSign} (${professionalResult.planetDegrees.rising.toFixed(2)}°, 第${professionalResult.planetHouses.rising}宫)`);
      console.log(`   水星: ${professionalResult.mercurySign} (${professionalResult.planetDegrees.mercury.toFixed(2)}°, 第${professionalResult.planetHouses.mercury}宫)`);
      console.log(`   金星: ${professionalResult.venusSign} (${professionalResult.planetDegrees.venus.toFixed(2)}°, 第${professionalResult.planetHouses.venus}宫)`);
      console.log(`   火星: ${professionalResult.marsSign} (${professionalResult.planetDegrees.mars.toFixed(2)}°, 第${professionalResult.planetHouses.mars}宫)`);
      
      console.log(`\n⚡ 计算性能: ${calculationTime}ms`);
      console.log(`🎯 计算方法: ${professionalResult.calculationMethod}`);
      console.log(`🔍 精确度: ${professionalResult.precision}`);
      console.log(`📊 儒略日: ${professionalResult.julianDay.toFixed(6)}`);
      
      // 显示详细度数信息
      console.log(`\n📐 详细度数信息:`);
      Object.entries(professionalResult.planetDegrees).forEach(([planet, degree]) => {
        const sign = professionalResult[planet + 'Sign'];
        const degreesInSign = Math.floor(degree);
        const minutes = Math.floor((degree - degreesInSign) * 60);
        console.log(`   ${planet}: ${sign} ${degreesInSign}°${minutes}'`);
      });
      
    } catch (error) {
      console.error(`❌ 计算失败: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// 运行测试
if (require.main === module) {
  testProfessionalCalculator();
}

module.exports = testProfessionalCalculator; 