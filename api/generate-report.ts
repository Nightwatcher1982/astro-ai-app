import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// 定义请求体类型
interface BirthData {
  date: string;      // 格式: YYYY-MM-DD
  time: string;      // 格式: HH:MM
  location: string;  // 城市名称
}

// 定义响应类型
interface AstroReport {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  analysis: string;
}

// 地理编码结果类型
interface GeocodingResult {
  lat: number;
  lng: number;
  name: string;
}

// 星座名称映射
const ZODIAC_SIGNS = [
  '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
  '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
];

// AI分析Prompt模板
function createAnalysisPrompt(sunSign: string, moonSign: string, risingSign: string): string {
  return `你是一位温暖、智慧、充满洞察力的AI占星师。请根据以下星盘信息，为用户生成一份积极、深刻、个性化的性格分析报告。

**星盘信息：**
- 太阳星座：${sunSign}（代表核心自我、生命力和主要性格特质）
- 月亮星座：${moonSign}（代表内在情感、潜意识和情绪需求）
- 上升星座：${risingSign}（代表外在表现、第一印象和人生态度）

**请按照以下要求生成分析报告：**

1. **语调风格**：温暖、积极、有同理心，避免消极或宿命论的表达
2. **内容深度**：深入但不晦涩，专业但不冷漠
3. **字数要求**：250-300字
4. **结构建议**：
   - 开头：温暖的问候和整体性格概述
   - 中间：分别从太阳、月亮、上升星座的角度分析性格特质
   - 结尾：积极的鼓励和潜能发掘

**重要提示：**
- 强调用户的优势和潜能
- 提供建设性的自我认知建议
- 避免预测具体事件，专注于性格分析
- 语言要亲切自然，就像和朋友聊天一样

请直接输出分析报告，不要包含任何前缀或解释。`;
}

// 调用AI API生成分析报告
async function generateAIAnalysis(sunSign: string, moonSign: string, risingSign: string): Promise<string> {
  try {
    const prompt = createAnalysisPrompt(sunSign, moonSign, risingSign);
    
    // 使用智能重试机制，优先使用国内AI服务
    const { callAIWithFallback } = await import('./ai-services');
    return await callAIWithFallback(prompt);
    
  } catch (error) {
    console.error('All AI services failed:', error);
    
    // 如果所有AI服务都失败，返回基础分析作为备选
    return generateFallbackAnalysis(sunSign, moonSign, risingSign);
  }
}

// 备选分析生成函数（当AI API不可用时使用）
function generateFallbackAnalysis(sunSign: string, moonSign: string, risingSign: string): string {
  return `你好！根据你的星盘信息，我看到了一个独特而美好的你。

你的太阳星座是${sunSign}，这意味着你的核心性格充满了${sunSign}的特质。你拥有独特的生命力和个人魅力，这是你最闪亮的地方。

你的月亮星座是${moonSign}，这揭示了你内心深处的情感世界。${moonSign}的月亮让你在情感上有着特别的敏感度和直觉力，这是你的情感智慧所在。

你的上升星座是${risingSign}，这影响着你给别人的第一印象。${risingSign}的上升让你在与人交往时展现出独特的魅力和风格。

这三个星座的组合让你成为了一个立体而丰富的人。建议你多关注自己的内在需求，同时也要勇敢地展现真实的自己。相信你的直觉，它会指引你走向属于你的美好未来。

记住，星盘只是一个工具，真正的力量在于你如何运用这些天赋去创造属于自己的人生。`;
}

// 地理编码函数 - 将城市名转换为经纬度
async function geocodeLocation(location: string): Promise<GeocodingResult> {
  try {
    // 使用OpenStreetMap的Nominatim API进行地理编码（免费）
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: location,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'AstroAI/1.0'
      }
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
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(`Failed to geocode location: ${location}`);
  }
}

// 简化的星座计算函数
function calculateZodiacSign(month: number, day: number): string {
  const dates = [
    [3, 21], [4, 20], [5, 21], [6, 21], [7, 23], [8, 23],
    [9, 23], [10, 23], [11, 22], [12, 22], [1, 20], [2, 19]
  ];
  
  for (let i = 0; i < dates.length; i++) {
    const [signMonth, signDay] = dates[i];
    if (month === signMonth && day >= signDay) {
      return ZODIAC_SIGNS[i];
    }
    if (month === signMonth - 1 && day >= dates[i === 0 ? 11 : i - 1][1]) {
      return ZODIAC_SIGNS[i === 0 ? 11 : i - 1];
    }
  }
  
  // 默认返回摩羯座
  return ZODIAC_SIGNS[9];
}

// 模拟月亮星座计算（实际需要更复杂的天文计算）
function calculateMoonSign(date: Date): string {
  // 这里使用一个简化的算法，实际应该使用天文历书
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const moonCycle = Math.floor(dayOfYear / 2.5) % 12;
  return ZODIAC_SIGNS[moonCycle];
}

// 模拟上升星座计算（实际需要根据出生时间和地点计算）
function calculateRisingSign(date: Date, hour: number, lat: number): string {
  // 这里使用一个简化的算法，实际应该使用复杂的天文计算
  const timeOffset = Math.floor((hour + lat / 15) / 2) % 12;
  const baseSign = Math.floor(date.getMonth()) % 12;
  const risingIndex = (baseSign + timeOffset) % 12;
  return ZODIAC_SIGNS[risingIndex];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, time, location }: BirthData = req.body;

    // 验证输入数据
    if (!date || !time || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields: date, time, location' 
      });
    }

    console.log(`Processing birth data: ${date} ${time} at ${location}`);

    // 解析日期和时间
    const birthDate = new Date(`${date}T${time}:00`);
    const [hour, minute] = time.split(':').map(Number);

    // 地理编码
    const geoResult = await geocodeLocation(location);
    console.log(`Geocoded location: ${geoResult.name} (${geoResult.lat}, ${geoResult.lng})`);

    // 计算星座
    const sunSign = calculateZodiacSign(birthDate.getMonth() + 1, birthDate.getDate());
    const moonSign = calculateMoonSign(birthDate);
    const risingSign = calculateRisingSign(birthDate, hour, geoResult.lat);

    console.log(`Calculated signs: Sun=${sunSign}, Moon=${moonSign}, Rising=${risingSign}`);

    // 生成AI分析报告
    const analysis = await generateAIAnalysis(sunSign, moonSign, risingSign);

    const report: AstroReport = {
      sunSign,
      moonSign,
      risingSign,
      analysis
    };

    console.log(`Generated analysis: ${analysis.substring(0, 100)}...`);

    return res.status(200).json({
      success: true,
      data: report,
      location: geoResult.name
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
} 