const sweph = require('sweph');

console.log('🧪 Testing sweph library...');

try {
  // 测试基本的儒略日计算
  const jd = sweph.julday(2023, 11, 1, 12.0, 1); // 1 = SE_GREG_CAL
  console.log('✅ Julian Day calculation:', jd);
  
  // 测试行星计算常量
  console.log('✅ Available constants:');
  console.log('  SUN:', sweph.SE_SUN);
  console.log('  MOON:', sweph.SE_MOON);
  console.log('  MERCURY:', sweph.SE_MERCURY);
  
  // 测试基本的行星位置计算
  const flags = sweph.SEFLG_MOSEPH | sweph.SEFLG_SPEED;
  const result = sweph.calc_ut(jd, sweph.SE_SUN, flags);
  
  console.log('✅ Sun position calculation result:', result);
  console.log('  Longitude:', result.longitude);
  console.log('  Latitude:', result.latitude);
  console.log('  Distance:', result.distance);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}

console.log('�� Test completed.'); 