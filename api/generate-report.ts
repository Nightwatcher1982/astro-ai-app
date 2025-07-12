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
  analysis?: string;
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

    const report: AstroReport = {
      sunSign,
      moonSign,
      risingSign
    };

    console.log(`Calculated signs: Sun=${sunSign}, Moon=${moonSign}, Rising=${risingSign}`);

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