const sweph = require('sweph');

// 初始化Swiss Ephemeris
class ProfessionalAstroCalculator {
  constructor() {
    // 设置为使用Moshier算法（无需外部数据文件）
    this.ephemerisFlag = sweph.constants.SEFLG_MOSEPH | sweph.constants.SEFLG_SPEED;
    
    // 星座名称映射
    this.ZODIAC_SIGNS = [
      '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
      '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
    ];
    
    // 行星常量
    this.PLANETS = {
      SUN: sweph.constants.SE_SUN,
      MOON: sweph.constants.SE_MOON,
      MERCURY: sweph.constants.SE_MERCURY,
      VENUS: sweph.constants.SE_VENUS,
      MARS: sweph.constants.SE_MARS,
      JUPITER: sweph.constants.SE_JUPITER,
      SATURN: sweph.constants.SE_SATURN,
      URANUS: sweph.constants.SE_URANUS,
      NEPTUNE: sweph.constants.SE_NEPTUNE,
      PLUTO: sweph.constants.SE_PLUTO,
      MEAN_NODE: sweph.constants.SE_MEAN_NODE,
      MEAN_APOG: sweph.constants.SE_MEAN_APOG
    };
  }

  // 计算儒略日
  calculateJulianDay(year, month, day, hour, minute = 0) {
    const hourDecimal = hour + minute / 60;
    return sweph.julday(year, month, day, hourDecimal, sweph.constants.SE_GREG_CAL);
  }

  // 将黄经转换为星座
  longitudeToZodiacSign(longitude) {
    const zodiacIndex = Math.floor(longitude / 30);
    return this.ZODIAC_SIGNS[zodiacIndex % 12];
  }

  // 计算星体位置
  calculatePlanetPosition(julianDay, planetId) {
    try {
      const result = sweph.calc_ut(julianDay, planetId, this.ephemerisFlag);
      
      if (result.error) {
        throw new Error(`计算失败: ${result.error}`);
      }
      
      const longitude = result.data[0];
      const latitude = result.data[1];
      const distance = result.data[2];
      const longitudeSpeed = result.data[3];
      
      return {
        longitude: longitude,
        latitude: latitude,
        distance: distance,
        longitudeSpeed: longitudeSpeed,
        latitudeSpeed: result.data[4],
        distanceSpeed: result.data[5],
        zodiacSign: this.longitudeToZodiacSign(longitude),
        degree: longitude % 30,
        raw: result
      };
    } catch (error) {
      throw new Error(`星体位置计算失败: ${error.message}`);
    }
  }

  // 计算上升星座
  calculateAscendant(julianDay, latitude, longitude) {
    try {
      const result = sweph.houses(julianDay, latitude, longitude, 'P');
      
      if (result.error) {
        throw new Error(`上升星座计算失败: ${result.error}`);
      }
      
      const ascendantLongitude = result.data.points[0]; // 上升点是第一个点
      return {
        longitude: ascendantLongitude,
        zodiacSign: this.longitudeToZodiacSign(ascendantLongitude),
        degree: ascendantLongitude % 30,
        raw: result
      };
    } catch (error) {
      throw new Error(`上升星座计算失败: ${error.message}`);
    }
  }

  // 计算宫位系统
  calculateHouses(julianDay, latitude, longitude, houseSystem = 'P') {
    try {
      const result = sweph.houses(julianDay, latitude, longitude, houseSystem);
      
      if (result.error) {
        throw new Error(`宫位计算失败: ${result.error}`);
      }
      
      const houses = {};
      for (let i = 0; i < 12; i++) {
        const houseStart = result.data.houses[i];
        houses[i + 1] = {
          startLongitude: houseStart,
          zodiacSign: this.longitudeToZodiacSign(houseStart),
          degree: houseStart % 30
        };
      }
      
      return {
        houses,
        ascendant: result.data.points[0], // 上升
        mc: result.data.points[1],        // 中天
        raw: result
      };
    } catch (error) {
      throw new Error(`宫位计算失败: ${error.message}`);
    }
  }

  // 计算星体在哪个宫位
  calculatePlanetHouse(planetLongitude, houses) {
    for (let i = 1; i <= 12; i++) {
      const currentHouse = houses[i];
      const nextHouse = houses[i === 12 ? 1 : i + 1];
      
      let houseStart = currentHouse.startLongitude;
      let houseEnd = nextHouse.startLongitude;
      
      // 处理跨越0度的情况
      if (houseEnd < houseStart) {
        houseEnd += 360;
      }
      
      let planetLon = planetLongitude;
      if (planetLon < houseStart && houseEnd > houseStart) {
        planetLon += 360;
      }
      
      if (planetLon >= houseStart && planetLon < houseEnd) {
        return i;
      }
    }
    
    return 1; // 默认返回第一宫
  }

  // 完整的星盘计算
  calculateCompleteChart(birthDate, birthTime, latitude, longitude) {
    try {
      // 解析日期时间
      const [year, month, day] = birthDate.split('-').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);
      
      // 计算儒略日
      const julianDay = this.calculateJulianDay(year, month, day, hour, minute);
      
      // 计算宫位系统
      const houseSystem = this.calculateHouses(julianDay, latitude, longitude);
      
      // 计算主要星体
      const planets = {};
      const planetHouses = {};
      
      // 计算太阳
      const sun = this.calculatePlanetPosition(julianDay, this.PLANETS.SUN);
      planets.sun = sun;
      planetHouses.sun = this.calculatePlanetHouse(sun.longitude, houseSystem.houses);
      
      // 计算月亮
      const moon = this.calculatePlanetPosition(julianDay, this.PLANETS.MOON);
      planets.moon = moon;
      planetHouses.moon = this.calculatePlanetHouse(moon.longitude, houseSystem.houses);
      
      // 计算上升星座
      const ascendant = this.calculateAscendant(julianDay, latitude, longitude);
      planets.rising = ascendant;
      planetHouses.rising = 1; // 上升星座总是在第一宫
      
      // 计算水星
      const mercury = this.calculatePlanetPosition(julianDay, this.PLANETS.MERCURY);
      planets.mercury = mercury;
      planetHouses.mercury = this.calculatePlanetHouse(mercury.longitude, houseSystem.houses);
      
      // 计算金星
      const venus = this.calculatePlanetPosition(julianDay, this.PLANETS.VENUS);
      planets.venus = venus;
      planetHouses.venus = this.calculatePlanetHouse(venus.longitude, houseSystem.houses);
      
      // 计算火星
      const mars = this.calculatePlanetPosition(julianDay, this.PLANETS.MARS);
      planets.mars = mars;
      planetHouses.mars = this.calculatePlanetHouse(mars.longitude, houseSystem.houses);
      
      return {
        julianDay,
        planets,
        planetHouses,
        houseSystem,
        timestamp: new Date().toISOString(),
        precision: 'Swiss Ephemeris (Moshier) - 0.1 arcsec'
      };
    } catch (error) {
      throw new Error(`星盘计算失败: ${error.message}`);
    }
  }

  // 简化的接口，兼容现有系统
  generateProfessionalReport(birthDate, birthTime, latitude, longitude) {
    try {
      const chart = this.calculateCompleteChart(birthDate, birthTime, latitude, longitude);
      
      // 转换为兼容格式
      const result = {
        // 基础星座信息
        sunSign: chart.planets.sun.zodiacSign,
        moonSign: chart.planets.moon.zodiacSign,
        risingSign: chart.planets.rising.zodiacSign,
        mercurySign: chart.planets.mercury.zodiacSign,
        venusSign: chart.planets.venus.zodiacSign,
        marsSign: chart.planets.mars.zodiacSign,
        
        // 宫位信息
        planetHouses: chart.planetHouses,
        
        // 精确度数信息
        planetDegrees: {
          sun: chart.planets.sun.degree,
          moon: chart.planets.moon.degree,
          rising: chart.planets.rising.degree,
          mercury: chart.planets.mercury.degree,
          venus: chart.planets.venus.degree,
          mars: chart.planets.mars.degree
        },
        
        // 技术信息
        julianDay: chart.julianDay,
        precision: chart.precision,
        calculationMethod: 'Swiss Ephemeris Professional',
        
        // 完整的原始数据
        raw: chart
      };
      
      return result;
    } catch (error) {
      throw new Error(`专业星盘计算失败: ${error.message}`);
    }
  }
}

module.exports = ProfessionalAstroCalculator; 