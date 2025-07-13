import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ProfileStorage from '../services/ProfileStorage';
import { DEFAULT_TAGS, formatProfileForDisplay } from '../types/profile';

const ProfilesScreen = ({ navigation }) => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);

  // 获取档案列表
  const loadProfiles = async () => {
    try {
      const profilesData = await ProfileStorage.searchProfiles({
        query: searchQuery,
        tags: selectedTags,
        sortBy,
        sortOrder
      });
      setProfiles(profilesData);
      setFilteredProfiles(profilesData);
      
      // 获取统计信息
      const statsData = await ProfileStorage.getProfileStats();
      setStats(statsData);
    } catch (error) {
      console.error('加载档案失败:', error);
      Alert.alert('错误', '加载档案失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 页面聚焦时重新加载数据
  useFocusEffect(
    useCallback(() => {
      loadProfiles();
    }, [searchQuery, selectedTags, sortBy, sortOrder])
  );

  // 搜索和过滤处理
  useEffect(() => {
    loadProfiles();
  }, [searchQuery, selectedTags, sortBy, sortOrder]);

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    loadProfiles();
  };

  // 删除档案
  const handleDeleteProfile = (profile) => {
    Alert.alert(
      '确认删除',
      `确定要删除"${profile.name}"的档案吗？此操作无法撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const result = await ProfileStorage.deleteProfile(profile.id);
            if (result.success) {
              loadProfiles();
              Alert.alert('成功', '档案已删除');
            } else {
              Alert.alert('错误', result.error || '删除档案失败');
            }
          }
        }
      ]
    );
  };

  // 生成分析
  const handleGenerateAnalysis = (profile) => {
    // 导航到分析标签页，并预填充档案信息
    navigation.navigate('AnalysisTab', { 
      screen: 'Input',
      params: {
        prefilledProfile: {
          date: profile.birthday,
          time: profile.birthTime,
          location: profile.birthPlace,
          profileId: profile.id
        }
      }
    });
  };

  // 查看档案详情
  const handleViewProfile = (profile) => {
    navigation.navigate('ProfileDetail', { profileId: profile.id });
  };

  // 添加新档案
  const handleAddProfile = () => {
    navigation.navigate('AddProfile');
  };

  // 编辑档案
  const handleEditProfile = (profile) => {
    navigation.navigate('AddProfile', { profileId: profile.id });
  };

  // 标签选择切换
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 排序选项切换
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  // 渲染档案卡片
  const renderProfileCard = ({ item }) => {
    const displayProfile = formatProfileForDisplay(item);
    const hasAnalysisHistory = item.analysisHistory && item.analysisHistory.length > 0;
    
    return (
      <TouchableOpacity 
        style={styles.profileCard}
        onPress={() => handleViewProfile(item)}
        activeOpacity={0.7}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayProfile.displayName}</Text>
            <Text style={styles.birthInfo}>{displayProfile.birthInfo}</Text>
            <Text style={styles.birthPlace}>📍 {item.birthPlace}</Text>
          </View>
          
          {item.avatar && (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}

        <View style={styles.profileStats}>
          <Text style={styles.statsText}>
            🔮 分析次数: {item.analysisHistory ? item.analysisHistory.length : 0}
          </Text>
          <Text style={styles.updateTime}>
            {new Date(item.updatedAt).toLocaleDateString('zh-CN')}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.analyzeButton}
            onPress={() => handleGenerateAnalysis(item)}
          >
            <Text style={styles.analyzeButtonText}>
              {hasAnalysisHistory ? '重新分析' : '开始分析'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditProfile(item)}
          >
            <Text style={styles.editButtonText}>编辑</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteProfile(item)}
          >
            <Text style={styles.deleteButtonText}>删除</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // 渲染过滤器模态框
  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>筛选和排序</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 标签过滤 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>按标签筛选</Text>
              <View style={styles.tagsGrid}>
                {DEFAULT_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.filterTag,
                      selectedTags.includes(tag) && styles.filterTagSelected
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[
                      styles.filterTagText,
                      selectedTags.includes(tag) && styles.filterTagTextSelected
                    ]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 排序选项 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>排序方式</Text>
              
              <TouchableOpacity 
                style={styles.sortOption}
                onPress={() => handleSortChange('updatedAt')}
              >
                <Text style={styles.sortOptionText}>
                  更新时间 {sortBy === 'updatedAt' && (sortOrder === 'desc' ? '↓' : '↑')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sortOption}
                onPress={() => handleSortChange('createdAt')}
              >
                <Text style={styles.sortOptionText}>
                  创建时间 {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sortOption}
                onPress={() => handleSortChange('name')}
              >
                <Text style={styles.sortOptionText}>
                  姓名 {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 重置按钮 */}
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedTags([]);
                setSortBy('updatedAt');
                setSortOrder('desc');
              }}
            >
              <Text style={styles.resetButtonText}>重置所有筛选</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // 渲染空状态
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>还没有保存档案</Text>
      <Text style={styles.emptySubtitle}>
        点击下方的"添加档案"按钮创建第一个档案吧
      </Text>
      <TouchableOpacity style={styles.emptyActionButton} onPress={handleAddProfile}>
        <Text style={styles.emptyActionText}>添加第一个档案</Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染统计信息
  const renderStats = () => {
    if (!stats) return null;
    
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>📊 统计信息</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalProfiles}</Text>
            <Text style={styles.statLabel}>档案总数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalAnalyses}</Text>
            <Text style={styles.statLabel}>分析总数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.averageAnalysesPerProfile}</Text>
            <Text style={styles.statLabel}>平均分析次数</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索档案..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>
            🔍 {selectedTags.length > 0 ? `(${selectedTags.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 统计信息 */}
      {stats && stats.totalProfiles > 0 && renderStats()}

      {/* 档案列表 */}
      <FlatList
        data={filteredProfiles}
        keyExtractor={(item) => item.id}
        renderItem={renderProfileCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={
          filteredProfiles.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* 添加档案按钮 */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddProfile}
      >
        <Text style={styles.addButtonText}>+ 添加档案</Text>
      </TouchableOpacity>

      {/* 过滤器模态框 */}
      {renderFiltersModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  filterButton: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: '#8e44ad',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8e44ad',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  birthInfo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  birthPlace: {
    fontSize: 14,
    color: '#95a5a6',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8e44ad',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#2c3e50',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  updateTime: {
    fontSize: 12,
    color: '#95a5a6',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#8e44ad',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyActionButton: {
    backgroundColor: '#8e44ad',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 模态框样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    fontSize: 24,
    color: '#7f8c8d',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTag: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  filterTagSelected: {
    backgroundColor: '#8e44ad',
    borderColor: '#8e44ad',
  },
  filterTagText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  filterTagTextSelected: {
    color: '#ffffff',
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfilesScreen; 