/**
 * 用户档案数据模型
 */

// 档案基本信息
export const createProfile = ({
  name,
  birthday,
  birthTime,
  birthPlace,
  avatar = null,
  notes = '',
  tags = []
}) => ({
  id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  birthday, // YYYY-MM-DD
  birthTime, // HH:MM
  birthPlace,
  avatar, // 头像URI或base64
  notes, // 个人备注
  tags, // 标签数组，如['家人', '朋友', '工作']
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  analysisHistory: [] // 分析历史记录
});

// 分析历史记录
export const createAnalysisRecord = ({
  profileId,
  analysisData,
  analysisType = 'full' // 'full' | 'quick'
}) => ({
  id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  profileId,
  analysisData, // 完整的分析结果
  analysisType,
  createdAt: new Date().toISOString()
});

// 档案搜索和过滤选项
export const createSearchOptions = ({
  query = '',
  tags = [],
  sortBy = 'updatedAt', // 'updatedAt' | 'createdAt' | 'name'
  sortOrder = 'desc' // 'asc' | 'desc'
}) => ({
  query,
  tags,
  sortBy,
  sortOrder
});

// 常用标签列表
export const DEFAULT_TAGS = [
  '家人',
  '朋友',
  '同事',
  '恋人',
  '孩子',
  '父母',
  '兄弟姐妹',
  '重要',
  '特别关注'
];

// 档案验证规则
export const validateProfile = (profile) => {
  const errors = [];
  
  if (!profile.name || profile.name.trim().length === 0) {
    errors.push('姓名不能为空');
  }
  
  if (!profile.birthday) {
    errors.push('出生日期不能为空');
  }
  
  if (!profile.birthTime) {
    errors.push('出生时间不能为空');
  }
  
  if (!profile.birthPlace || profile.birthPlace.trim().length === 0) {
    errors.push('出生地点不能为空');
  }
  
  // 验证日期格式
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (profile.birthday && !dateRegex.test(profile.birthday)) {
    errors.push('出生日期格式不正确（应为YYYY-MM-DD）');
  }
  
  // 验证时间格式
  const timeRegex = /^\d{2}:\d{2}$/;
  if (profile.birthTime && !timeRegex.test(profile.birthTime)) {
    errors.push('出生时间格式不正确（应为HH:MM）');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 档案格式化工具
export const formatProfileForDisplay = (profile) => ({
  ...profile,
  displayName: profile.name,
  birthInfo: `${profile.birthday} ${profile.birthTime}`,
  tagsDisplay: profile.tags.join(', '),
  lastAnalysis: profile.analysisHistory.length > 0 
    ? profile.analysisHistory[profile.analysisHistory.length - 1]
    : null
});

// 档案导出格式
export const formatProfileForExport = (profile) => ({
  姓名: profile.name,
  出生日期: profile.birthday,
  出生时间: profile.birthTime,
  出生地点: profile.birthPlace,
  备注: profile.notes,
  标签: profile.tags.join(', '),
  创建时间: new Date(profile.createdAt).toLocaleString('zh-CN'),
  更新时间: new Date(profile.updatedAt).toLocaleString('zh-CN'),
  分析次数: profile.analysisHistory.length
}); 