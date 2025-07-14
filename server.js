// 简单的HTTP服务器，桥接前端和API
require('dotenv').config();
const http = require('http');
const url = require('url');

// 导入专业星盘计算器
const ProfessionalAstroCalculator = require('./professional-astro-calculator');

const server = http.createServer(async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/api/ping' && req.method === 'GET') {
    // 简单的ping测试端点
    const pingResponse = JSON.stringify({ success: true, message: 'Server is running!' });
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(pingResponse, 'utf8')
    });
    res.end(pingResponse);
  } else if (parsedUrl.pathname === '/api/test' && req.method === 'GET') {
    // 健康检查端点
    const healthResponse = JSON.stringify({ 
      success: true, 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(healthResponse, 'utf8')
    });
    res.end(healthResponse);
  } else if (parsedUrl.pathname === '/api/generate-report' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const requestData = JSON.parse(body);
        console.log('📝 收到请求:', requestData);
        
        // 调用完整的API逻辑
        const result = await generateReport(requestData);
        
        console.log('✅ 分析完成');
        const responseBody = JSON.stringify(result);
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(responseBody, 'utf8')
        });
        res.end(responseBody);
        
      } catch (error) {
        console.error('❌ 服务器错误:', error);
        const errorBody = JSON.stringify({
          success: false,
          error: error.message
        });
        res.writeHead(500, { 
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(errorBody, 'utf8')
        });
        res.end(errorBody);
      }
    });
  } else {
    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// 星盘分析主函数（扩展版 + 宫位系统）
async function generateReport({ date, time, location }) {
  const axios = require('axios');
  
  // 星座名称映射
  const ZODIAC_SIGNS = [
    '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
    '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
  ];

  // 星体含义说明
  const PLANET_MEANINGS = {
    sun: '太阳星座代表你的核心自我、生命力和主要性格特质',
    moon: '月亮星座代表你的内在情感、潜意识和情绪需求',
    rising: '上升星座代表你的外在表现、第一印象和人生态度',
    mercury: '水星星座代表你的思维方式、沟通风格和学习能力',
    venus: '金星星座代表你的爱情观、审美品味和人际关系',
    mars: '火星星座代表你的行动力、冲动性和能量表达'
  };

  // 十二宫位含义定义
  const HOUSE_MEANINGS = {
    1: { name: '第一宫 (上升宫)', meaning: '自我意识、外在形象、第一印象、个性表达', keywords: ['个性', '外表', '活力', '自我'] },
    2: { name: '第二宫 (财帛宫)', meaning: '金钱观念、物质价值、自我价值、才能资源', keywords: ['财富', '价值观', '才能', '资源'] },
    3: { name: '第三宫 (兄弟宫)', meaning: '沟通交流、学习能力、兄弟姐妹、短程旅行', keywords: ['沟通', '学习', '兄弟', '思维'] },
    4: { name: '第四宫 (田宅宫)', meaning: '家庭根基、情感安全、内在需求、房产家庭', keywords: ['家庭', '根基', '安全感', '内心'] },
    5: { name: '第五宫 (子女宫)', meaning: '创造力、恋爱关系、子女、娱乐休闲', keywords: ['创造', '恋爱', '子女', '娱乐'] },
    6: { name: '第六宫 (工作宫)', meaning: '日常工作、健康状况、服务精神、生活规律', keywords: ['工作', '健康', '服务', '日常'] },
    7: { name: '第七宫 (夫妻宫)', meaning: '伴侣关系、合作伙伴、公开敌人、婚姻', keywords: ['伴侣', '合作', '婚姻', '关系'] },
    8: { name: '第八宫 (疾厄宫)', meaning: '深层转化、他人资源、神秘学、生死议题', keywords: ['转化', '神秘', '深层', '重生'] },
    9: { name: '第九宫 (迁移宫)', meaning: '高等教育、哲学思想、长途旅行、精神追求', keywords: ['哲学', '高教', '旅行', '信仰'] },
    10: { name: '第十宫 (事业宫)', meaning: '事业成就、社会地位、权威形象、人生目标', keywords: ['事业', '地位', '成就', '目标'] },
    11: { name: '第十一宫 (福德宫)', meaning: '朋友群体、社团活动、理想愿景、社会改革', keywords: ['朋友', '理想', '群体', '未来'] },
    12: { name: '第十二宫 (玄秘宫)', meaning: '潜意识、隐藏能力、灵性成长、业力清理', keywords: ['潜意识', '灵性', '隐藏', '业力'] }
  };

  // 地理编码函数
  async function geocodeLocation(location) {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: location, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'AstroAI/1.0' }
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        name: result.display_name
      };
    } else {
      throw new Error(`Location not found: ${location}`);
    }
  }

  // 改进的星座计算函数
  function calculateZodiacSign(month, day) {
    // 星座日期范围（修正版本）
    const zodiacRanges = [
      { start: [3, 21], end: [4, 19], sign: '白羊座' },   // 白羊座 3/21-4/19
      { start: [4, 20], end: [5, 20], sign: '金牛座' },   // 金牛座 4/20-5/20
      { start: [5, 21], end: [6, 21], sign: '双子座' },   // 双子座 5/21-6/21
      { start: [6, 22], end: [7, 22], sign: '巨蟹座' },   // 巨蟹座 6/22-7/22
      { start: [7, 23], end: [8, 22], sign: '狮子座' },   // 狮子座 7/23-8/22
      { start: [8, 23], end: [9, 22], sign: '处女座' },   // 处女座 8/23-9/22
      { start: [9, 23], end: [10, 23], sign: '天秤座' },  // 天秤座 9/23-10/23
      { start: [10, 24], end: [11, 22], sign: '天蝎座' }, // 天蝎座 10/24-11/22
      { start: [11, 23], end: [12, 21], sign: '射手座' }, // 射手座 11/23-12/21
      { start: [12, 22], end: [12, 31], sign: '摩羯座' }, // 摩羯座 12/22-12/31
      { start: [1, 1], end: [1, 19], sign: '摩羯座' },    // 摩羯座 1/1-1/19
      { start: [1, 20], end: [2, 18], sign: '水瓶座' },   // 水瓶座 1/20-2/18
      { start: [2, 19], end: [3, 20], sign: '双鱼座' }    // 双鱼座 2/19-3/20
    ];

    for (const range of zodiacRanges) {
      const [startMonth, startDay] = range.start;
      const [endMonth, endDay] = range.end;
      
      if (startMonth === endMonth) {
        // 同月内的星座
        if (month === startMonth && day >= startDay && day <= endDay) {
          return range.sign;
        }
      } else {
        // 跨月的星座
        if ((month === startMonth && day >= startDay) || 
            (month === endMonth && day <= endDay)) {
          return range.sign;
        }
      }
    }
    
    // 如果没有匹配到，返回默认值
    return '摩羯座';
  }

  // 月亮星座计算（改进版）
  function calculateMoonSign(date) {
    const baseDate = new Date(2000, 0, 1); // 参考日期
    const daysDiff = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // 月亮约27.3天绕黄道一周，每个星座约2.3天
    const moonCycle = Math.floor(Math.abs(daysDiff) / 2.3) % 12;
    return ZODIAC_SIGNS[moonCycle];
  }

  // 上升星座计算（改进版）
  function calculateRisingSign(date, hour, lat) {
    const seasonOffset = Math.floor(date.getMonth() / 3) % 4;
    const timeOffset = Math.floor(hour / 2);
    const latOffset = Math.floor(lat / 30);
    
    const risingIndex = (seasonOffset + timeOffset + latOffset) % 12;
    return ZODIAC_SIGNS[risingIndex];
  }

  // 宫位计算函数
  function calculateHouses(date, hour, lat) {
    // 基于上升星座计算第一宫起始点
    const sunSignIndex = ZODIAC_SIGNS.indexOf(calculateZodiacSign(date.getMonth() + 1, date.getDate()));
    const risingSignIndex = ZODIAC_SIGNS.indexOf(calculateRisingSign(date, hour, lat));
    
    // 计算宫位起始度数 (简化算法)
    const baseOffset = (risingSignIndex * 30) % 360; // 每个星座30度
    const timeOffset = (hour / 24) * 360; // 一天360度
    const seasonOffset = (date.getMonth() / 12) * 360; // 一年360度
    
    const houses = {};
    for (let i = 1; i <= 12; i++) {
      const houseStart = (baseOffset + ((i - 1) * 30) + timeOffset * 0.1 + seasonOffset * 0.1) % 360;
      const signIndex = Math.floor(houseStart / 30) % 12;
      houses[i] = {
        sign: ZODIAC_SIGNS[signIndex],
        degree: Math.round(houseStart % 30),
        ...HOUSE_MEANINGS[i]
      };
    }
    
    return houses;
  }

  // 计算星体所在宫位
  function calculatePlanetHouses(date, hour, lat) {
    const houses = calculateHouses(date, hour, lat);
    
    // 简化的星体宫位计算
    const sunSignIndex = ZODIAC_SIGNS.indexOf(calculateZodiacSign(date.getMonth() + 1, date.getDate()));
    const moonSignIndex = ZODIAC_SIGNS.indexOf(calculateMoonSign(date));
    const risingSignIndex = ZODIAC_SIGNS.indexOf(calculateRisingSign(date, hour, lat));
    const mercurySignIndex = ZODIAC_SIGNS.indexOf(calculateMercurySign(date));
    const venusSignIndex = ZODIAC_SIGNS.indexOf(calculateVenusSign(date));
    const marsSignIndex = ZODIAC_SIGNS.indexOf(calculateMarsSign(date));
    
    // 基于星座位置和时间计算星体在哪个宫位
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      sun: ((sunSignIndex + Math.floor(hour / 6) + Math.floor(dayOfYear / 30)) % 12) + 1,
      moon: ((moonSignIndex + Math.floor(hour / 3) + Math.floor(dayOfYear / 15)) % 12) + 1,
      rising: 1, // 上升星座永远在第一宫
      mercury: ((mercurySignIndex + Math.floor(hour / 4) + Math.floor(dayOfYear / 25)) % 12) + 1,
      venus: ((venusSignIndex + Math.floor(hour / 5) + Math.floor(dayOfYear / 20)) % 12) + 1,
      mars: ((marsSignIndex + Math.floor(hour / 8) + Math.floor(dayOfYear / 35)) % 12) + 1
    };
  }

  // 水星星座计算
  function calculateMercurySign(date) {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // 水星约88天绕太阳一周，相对于太阳的位置变化
    const mercuryCycle = Math.floor(dayOfYear / 7.3) % 12;
    const sunSignIndex = ZODIAC_SIGNS.indexOf(calculateZodiacSign(date.getMonth() + 1, date.getDate()));
    
    // 水星通常在太阳星座的前后1-2个星座内
    const mercuryIndex = (sunSignIndex + mercuryCycle - 1) % 12;
    return ZODIAC_SIGNS[mercuryIndex];
  }

  // 金星星座计算
  function calculateVenusSign(date) {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // 金星约225天绕太阳一周
    const venusCycle = Math.floor(dayOfYear / 18.8) % 12;
    const sunSignIndex = ZODIAC_SIGNS.indexOf(calculateZodiacSign(date.getMonth() + 1, date.getDate()));
    
    // 金星的位置相对于太阳有一定偏移
    const venusIndex = (sunSignIndex + venusCycle) % 12;
    return ZODIAC_SIGNS[venusIndex];
  }

  // 火星星座计算
  function calculateMarsSign(date) {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // 火星约687天绕太阳一周
    const marsCycle = Math.floor(dayOfYear / 57.3) % 12;
    const baseOffset = Math.floor(date.getFullYear() / 2) % 12;
    
    const marsIndex = (baseOffset + marsCycle) % 12;
    return ZODIAC_SIGNS[marsIndex];
  }

  // AI分析函数
  async function callQwenAPI(prompt) {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        input: { messages: [{ role: 'user', content: prompt }] },
        parameters: { temperature: 0.7, max_tokens: 1200 }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.output.text;
  }

  // 综合分析提示词（增强版 - 包含宫位）
  function createAnalysisPrompt(planets, planetHouses, houses) {
    return `你是一位温暖、智慧、充满洞察力的AI占星师。请根据以下完整的星盘信息，为用户生成一份深入、积极、个性化的综合分析报告。

**完整星盘信息：**
- 太阳星座：${planets.sun} (位于第${planetHouses.sun}宫)
- 月亮星座：${planets.moon} (位于第${planetHouses.moon}宫)
- 上升星座：${planets.rising} (位于第${planetHouses.rising}宫)
- 水星星座：${planets.mercury} (位于第${planetHouses.mercury}宫)
- 金星星座：${planets.venus} (位于第${planetHouses.venus}宫)
- 火星星座：${planets.mars} (位于第${planetHouses.mars}宫)

**宫位背景信息：**
- 第${planetHouses.sun}宫：${houses[planetHouses.sun].meaning}
- 第${planetHouses.moon}宫：${houses[planetHouses.moon].meaning}
- 第${planetHouses.mercury}宫：${houses[planetHouses.mercury].meaning}

**请按照以下结构生成分析报告：**

1. **整体性格概述**（80字）：综合星座和宫位的整体印象
2. **核心特质分析**（120字）：太阳、月亮、上升的星座和宫位组合特点
3. **思维与沟通**（70字）：水星的星座和宫位影响
4. **爱情与关系**（70字）：金星的星座和宫位影响
5. **行动与能量**（70字）：火星的星座和宫位影响
6. **成长建议**（80字）：基于宫位位置的具体建议

**要求：**
- 语调温暖、积极、有同理心
- 结合星座和宫位的双重影响
- 总字数约490字
- 强调优势和潜能，避免消极表达
- 提供具体的建设性建议

请直接输出分析报告，不要包含任何前缀或解释。`;
  }

  // 宫位专门分析提示词
  function createHouseAnalysisPrompt(planetHouses, houses) {
    return `你是一位专业的占星师，请基于星体在宫位的位置，生成详细的宫位分析报告。

**星体宫位分布：**
- 太阳在第${planetHouses.sun}宫：${houses[planetHouses.sun].meaning}
- 月亮在第${planetHouses.moon}宫：${houses[planetHouses.moon].meaning}
- 水星在第${planetHouses.mercury}宫：${houses[planetHouses.mercury].meaning}
- 金星在第${planetHouses.venus}宫：${houses[planetHouses.venus].meaning}
- 火星在第${planetHouses.mars}宫：${houses[planetHouses.mars].meaning}

**分析结构：**
1. **人生重点领域**（120字）：基于星体分布识别人生重点关注的领域
2. **天赋与优势**（100字）：分析星体宫位组合带来的天赋和优势
3. **挑战与成长点**（80字）：指出需要关注和发展的生活领域
4. **生活建议**（100字）：基于宫位分布提供具体的生活指导

**要求：**
- 专业而易懂，避免过于深奥的术语
- 积极正面，强调发展潜能
- 总字数约400字
- 结合具体宫位含义进行分析

请直接输出宫位分析报告，不要包含标题或前缀。`;
  }

  // 分类分析提示词生成器（更新版）
  function createCategorizedAnalysisPrompt(planets, category, planetHouses = null) {
    const categoryInfo = {
      personality: {
        title: '性格特质深度分析',
        focus: '太阳、月亮、上升星座的综合性格特质',
        planets: ['sun', 'moon', 'rising'],
        description: '深入分析核心性格、情感模式和外在表现的组合特点'
      },
      communication: {
        title: '沟通风格分析',
        focus: '水星星座的思维和沟通特点',
        planets: ['mercury', 'sun', 'moon'],
        description: '分析思维方式、表达风格和学习偏好'
      },
      love: {
        title: '爱情观与关系分析',
        focus: '金星星座的情感和人际关系特点',
        planets: ['venus', 'mars', 'moon'],
        description: '分析爱情观念、情感表达和人际关系模式'
      },
      career: {
        title: '事业倾向分析',
        focus: '火星、太阳星座的行动力和事业潜能',
        planets: ['mars', 'sun', 'mercury'],
        description: '分析工作风格、行动力和职业发展方向'
      }
    };

    const info = categoryInfo[category];
    let houseInfo = '';
    if (planetHouses) {
      houseInfo = info.planets.map(p => {
        const house = planetHouses[p];
        return `- ${p === 'sun' ? '太阳' : p === 'moon' ? '月亮' : p === 'rising' ? '上升' : p === 'mercury' ? '水星' : p === 'venus' ? '金星' : '火星'}在第${house}宫`;
      }).join('\n');
    }

    return `你是一位专业的AI占星师，请基于以下星盘信息，专门针对"${info.title}"生成深度分析报告。

**相关星体信息：**
${info.planets.map(p => `- ${p === 'sun' ? '太阳' : p === 'moon' ? '月亮' : p === 'rising' ? '上升' : p === 'mercury' ? '水星' : p === 'venus' ? '金星' : '火星'}星座：${planets[p]}`).join('\n')}

${planetHouses ? `**宫位位置：**\n${houseInfo}\n` : ''}

**分析重点：**
${info.description}

**分析结构：**
1. **核心特点**（120字）：${info.focus}的主要特征
2. **具体表现**（100字）：在日常生活中的具体表现和行为模式
3. **优势潜能**（80字）：这个方面的天赋和优势
4. **成长建议**（80字）：如何发挥优势和改进不足

**要求：**
- 专注于${category}主题，深入而专业
- 语调温暖积极，提供建设性建议
${planetHouses ? '- 结合宫位影响进行分析' : ''}
- 总字数约380字
- 结合具体星座特点，避免泛泛而谈

请直接输出分析报告，不要包含标题或前缀。`;
  }

  // 生成分类分析报告（更新版）
  async function generateCategorizedAnalysis(planets, planetHouses = null) {
    const categories = ['personality', 'communication', 'love', 'career'];
    const categorizedReports = {};

    for (const category of categories) {
      console.log(`🎯 正在生成${category}分析...`);
      const prompt = createCategorizedAnalysisPrompt(planets, category, planetHouses);
      const analysis = await callQwenAPI(prompt);
      categorizedReports[category] = analysis.trim();
      
      // 添加短暂延迟，避免API请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return categorizedReports;
  }

  // 主要处理逻辑
  console.log(`🌍 正在获取 ${location} 的地理位置...`);
  const geoResult = await geocodeLocation(location);
  console.log(`✅ 地理编码成功: ${geoResult.name}`);

  console.log(`🔬 正在使用专业 Swiss Ephemeris 计算星盘...`);
  
  // 使用专业计算器
  const professionalCalculator = new ProfessionalAstroCalculator();
  const professionalResult = professionalCalculator.generateProfessionalReport(
    date, time, geoResult.lat, geoResult.lng
  );
  
  // 转换为兼容的格式
  const planets = {
    sun: professionalResult.sunSign,
    moon: professionalResult.moonSign,
    rising: professionalResult.risingSign,
    mercury: professionalResult.mercurySign,
    venus: professionalResult.venusSign,
    mars: professionalResult.marsSign
  };

  const planetHouses = professionalResult.planetHouses;
  
  // 构建宫位系统（为了兼容现有代码）
  const houses = {};
  for (let i = 1; i <= 12; i++) {
    houses[i] = {
      sign: '待实现', // 这里可以后续添加具体的宫位星座
      degree: 0,
      ...HOUSE_MEANINGS[i]
    };
  }

  console.log(`⭐ 星体星座: 太阳=${planets.sun}, 月亮=${planets.moon}, 上升=${planets.rising}`);
  console.log(`🌟 扩展星体: 水星=${planets.mercury}, 金星=${planets.venus}, 火星=${planets.mars}`);
  console.log(`🏠 星体宫位: 太阳=${planetHouses.sun}宫, 月亮=${planetHouses.moon}宫, 上升=${planetHouses.rising}宫`);
  console.log(`🏰 扩展宫位: 水星=${planetHouses.mercury}宫, 金星=${planetHouses.venus}宫, 火星=${planetHouses.mars}宫`);
  console.log(`🎯 计算精度: ${professionalResult.precision}`);

  console.log('🤖 正在生成AI分析报告...');
  const prompt = createAnalysisPrompt(planets, planetHouses, houses);
  const analysis = await callQwenAPI(prompt);
  console.log('✅ AI分析报告生成成功!');

  console.log('🎨 正在生成分类分析报告...');
  const categorizedAnalysis = await generateCategorizedAnalysis(planets, planetHouses);
  console.log('✅ 分类分析报告生成成功!');

  console.log('🏛️ 正在生成宫位专门分析...');
  const houseAnalysisPrompt = createHouseAnalysisPrompt(planetHouses, houses);
  const houseAnalysis = await callQwenAPI(houseAnalysisPrompt);
  console.log('✅ 宫位分析报告生成成功!');

  return {
    success: true,
    data: {
      // 基础三大星座
      sunSign: planets.sun,
      moonSign: planets.moon,
      risingSign: planets.rising,
      
      // 扩展星体
      mercurySign: planets.mercury,
      venusSign: planets.venus,
      marsSign: planets.mars,
      
      // 宫位系统
      houses: houses,
      planetHouses: planetHouses,
      
      // 星体含义
      planetMeanings: PLANET_MEANINGS,
      
      // AI分析
      analysis: analysis.trim(),
      
      // 分类分析
      categorizedAnalysis: {
        personality: categorizedAnalysis.personality,
        communication: categorizedAnalysis.communication,
        love: categorizedAnalysis.love,
        career: categorizedAnalysis.career
      },

      // 宫位分析
      houseAnalysis: houseAnalysis.trim()
    },
    location: geoResult.name
  };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('🚀 星盘AI服务器启动成功! (含宫位系统)');
  console.log(`📡 服务器地址: http://localhost:${PORT}`);
  console.log(`🌟 API端点: http://localhost:${PORT}/api/generate-report`);
  console.log(`🩺 健康检查端点: http://localhost:${PORT}/api/test`);
  console.log('');
  console.log('💡 现在可以在Expo应用中测试完整的星盘分析了！');
  console.log('🏠 新增功能：十二宫位系统和宫位分析');
  console.log('');
  console.log('按 Ctrl+C 停止服务器');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 服务器已关闭');
  process.exit(0);
}); 