import AsyncStorage from '@react-native-async-storage/async-storage';
import { createProfile, createAnalysisRecord, validateProfile } from '../types/profile';

const STORAGE_KEYS = {
  PROFILES: '@astro_ai_profiles',
  ANALYSIS_HISTORY: '@astro_ai_analysis_history'
};

/**
 * 档案存储服务
 */
class ProfileStorage {
  
  /**
   * 获取所有档案
   */
  async getAllProfiles() {
    try {
      const profilesJson = await AsyncStorage.getItem(STORAGE_KEYS.PROFILES);
      return profilesJson ? JSON.parse(profilesJson) : [];
    } catch (error) {
      console.error('获取档案列表失败:', error);
      return [];
    }
  }

  /**
   * 根据ID获取档案
   */
  async getProfileById(profileId) {
    try {
      const profiles = await this.getAllProfiles();
      return profiles.find(profile => profile.id === profileId) || null;
    } catch (error) {
      console.error('获取档案失败:', error);
      return null;
    }
  }

  /**
   * 保存档案
   */
  async saveProfile(profileData) {
    try {
      const validation = validateProfile(profileData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const profiles = await this.getAllProfiles();
      
      if (profileData.id) {
        // 更新现有档案
        const index = profiles.findIndex(p => p.id === profileData.id);
        if (index !== -1) {
          profiles[index] = {
            ...profiles[index],
            ...profileData,
            updatedAt: new Date().toISOString()
          };
        } else {
          throw new Error('档案不存在');
        }
      } else {
        // 创建新档案
        const newProfile = createProfile(profileData);
        profiles.push(newProfile);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      
      const savedProfile = profileData.id 
        ? profiles.find(p => p.id === profileData.id)
        : profiles[profiles.length - 1];
        
      return { success: true, profile: savedProfile };
    } catch (error) {
      console.error('保存档案失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 删除档案
   */
  async deleteProfile(profileId) {
    try {
      const profiles = await this.getAllProfiles();
      const updatedProfiles = profiles.filter(profile => profile.id !== profileId);
      
      if (profiles.length === updatedProfiles.length) {
        throw new Error('档案不存在');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(updatedProfiles));
      
      // 同时删除该档案的分析历史
      await this.deleteAnalysisHistoryByProfileId(profileId);
      
      return { success: true };
    } catch (error) {
      console.error('删除档案失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 搜索和过滤档案
   */
  async searchProfiles({ query = '', tags = [], sortBy = 'updatedAt', sortOrder = 'desc' } = {}) {
    try {
      let profiles = await this.getAllProfiles();

      // 文本搜索
      if (query.trim()) {
        const lowercaseQuery = query.toLowerCase();
        profiles = profiles.filter(profile => 
          profile.name.toLowerCase().includes(lowercaseQuery) ||
          profile.birthPlace.toLowerCase().includes(lowercaseQuery) ||
          profile.notes.toLowerCase().includes(lowercaseQuery)
        );
      }

      // 标签过滤
      if (tags.length > 0) {
        profiles = profiles.filter(profile => 
          tags.some(tag => profile.tags.includes(tag))
        );
      }

      // 排序
      profiles.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortBy) {
          case 'name':
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
          case 'createdAt':
            valueA = new Date(a.createdAt);
            valueB = new Date(b.createdAt);
            break;
          case 'updatedAt':
          default:
            valueA = new Date(a.updatedAt);
            valueB = new Date(b.updatedAt);
            break;
        }

        if (sortOrder === 'asc') {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });

      return profiles;
    } catch (error) {
      console.error('搜索档案失败:', error);
      return [];
    }
  }

  /**
   * 保存分析记录到档案
   */
  async saveAnalysisToProfile(profileId, analysisData, analysisType = 'full') {
    try {
      const profiles = await this.getAllProfiles();
      const profileIndex = profiles.findIndex(p => p.id === profileId);
      
      if (profileIndex === -1) {
        throw new Error('档案不存在');
      }

      const analysisRecord = createAnalysisRecord({
        profileId,
        analysisData,
        analysisType
      });

      // 添加到档案的分析历史中
      if (!profiles[profileIndex].analysisHistory) {
        profiles[profileIndex].analysisHistory = [];
      }
      profiles[profileIndex].analysisHistory.push(analysisRecord);
      
      // 更新档案时间
      profiles[profileIndex].updatedAt = new Date().toISOString();

      await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      
      return { success: true, analysisRecord };
    } catch (error) {
      console.error('保存分析记录失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取档案的分析历史
   */
  async getProfileAnalysisHistory(profileId) {
    try {
      const profile = await this.getProfileById(profileId);
      return profile ? profile.analysisHistory || [] : [];
    } catch (error) {
      console.error('获取分析历史失败:', error);
      return [];
    }
  }

  /**
   * 删除档案的分析历史
   */
  async deleteAnalysisHistoryByProfileId(profileId) {
    try {
      const profiles = await this.getAllProfiles();
      const profileIndex = profiles.findIndex(p => p.id === profileId);
      
      if (profileIndex !== -1) {
        profiles[profileIndex].analysisHistory = [];
        profiles[profileIndex].updatedAt = new Date().toISOString();
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      }
      
      return { success: true };
    } catch (error) {
      console.error('删除分析历史失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取档案统计信息
   */
  async getProfileStats() {
    try {
      const profiles = await this.getAllProfiles();
      
      const totalProfiles = profiles.length;
      const totalAnalyses = profiles.reduce((sum, profile) => 
        sum + (profile.analysisHistory ? profile.analysisHistory.length : 0), 0
      );
      
      const tagsCount = {};
      profiles.forEach(profile => {
        if (profile.tags) {
          profile.tags.forEach(tag => {
            tagsCount[tag] = (tagsCount[tag] || 0) + 1;
          });
        }
      });

      const mostUsedTags = Object.entries(tagsCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));

      return {
        totalProfiles,
        totalAnalyses,
        mostUsedTags,
        averageAnalysesPerProfile: totalProfiles > 0 ? (totalAnalyses / totalProfiles).toFixed(1) : 0
      };
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return {
        totalProfiles: 0,
        totalAnalyses: 0,
        mostUsedTags: [],
        averageAnalysesPerProfile: 0
      };
    }
  }

  /**
   * 导出所有档案数据
   */
  async exportAllData() {
    try {
      const profiles = await this.getAllProfiles();
      return {
        exportDate: new Date().toISOString(),
        profilesCount: profiles.length,
        profiles: profiles
      };
    } catch (error) {
      console.error('导出数据失败:', error);
      return null;
    }
  }

  /**
   * 导入档案数据
   */
  async importData(importData) {
    try {
      if (!importData || !Array.isArray(importData.profiles)) {
        throw new Error('导入数据格式不正确');
      }

      // 验证每个档案
      for (const profile of importData.profiles) {
        const validation = validateProfile(profile);
        if (!validation.isValid) {
          throw new Error(`档案"${profile.name}"验证失败: ${validation.errors.join(', ')}`);
        }
      }

      const existingProfiles = await this.getAllProfiles();
      const mergedProfiles = [...existingProfiles];

      let importCount = 0;
      let skipCount = 0;

      for (const importProfile of importData.profiles) {
        // 检查是否已存在相同档案（根据姓名和出生信息判断）
        const existing = existingProfiles.find(p => 
          p.name === importProfile.name &&
          p.birthday === importProfile.birthday &&
          p.birthTime === importProfile.birthTime &&
          p.birthPlace === importProfile.birthPlace
        );

        if (!existing) {
          // 生成新的ID确保唯一性
          const newProfile = {
            ...importProfile,
            id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          mergedProfiles.push(newProfile);
          importCount++;
        } else {
          skipCount++;
        }
      }

      await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(mergedProfiles));

      return {
        success: true,
        importCount,
        skipCount,
        totalProfiles: mergedProfiles.length
      };
    } catch (error) {
      console.error('导入数据失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 清空所有数据
   */
  async clearAllData() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PROFILES);
      await AsyncStorage.removeItem(STORAGE_KEYS.ANALYSIS_HISTORY);
      return { success: true };
    } catch (error) {
      console.error('清空数据失败:', error);
      return { success: false, error: error.message };
    }
  }
}

// 导出单例实例
export default new ProfileStorage(); 