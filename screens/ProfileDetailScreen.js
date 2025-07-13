import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  Share
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ProfileStorage from '../services/ProfileStorage';
import { formatProfileForDisplay, formatProfileForExport } from '../types/profile';

const ProfileDetailScreen = ({ route, navigation }) => {
  const { profileId } = route.params;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // 加载档案详情
  const loadProfile = async () => {
    try {
      const profileData = await ProfileStorage.getProfileById(profileId);
      if (profileData) {
        setProfile(profileData);
      } else {
        Alert.alert('错误', '档案不存在', [
          { text: '确定', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('加载档案详情失败:', error);
      Alert.alert('错误', '加载档案详情失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 页面聚焦时重新加载
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [profileId])
  );

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  // 编辑档案
  const handleEditProfile = () => {
    navigation.navigate('AddProfile', { profileId: profile.id });
  };

  // 删除档案
  const handleDeleteProfile = () => {
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
              Alert.alert('成功', '档案已删除', [
                { text: '确定', onPress: () => navigation.goBack() }
              ]);
            } else {
              Alert.alert('错误', result.error || '删除档案失败');
            }
          }
        }
      ]
    );
  };

  // 生成新分析
  const handleGenerateAnalysis = () => {
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

  // 查看分析记录
  const handleViewAnalysis = (analysisRecord) => {
    setSelectedAnalysis(analysisRecord);
    setShowAnalysisModal(true);
  };

  // 删除分析记录
  const handleDeleteAnalysis = (analysisRecord) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条分析记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            // 从档案的分析历史中移除这条记录
            const updatedHistory = profile.analysisHistory.filter(
              record => record.id !== analysisRecord.id
            );
            
            const updatedProfile = {
              ...profile,
              analysisHistory: updatedHistory,
              updatedAt: new Date().toISOString()
            };
            
            const result = await ProfileStorage.saveProfile(updatedProfile);
            if (result.success) {
              setProfile(result.profile);
              Alert.alert('成功', '分析记录已删除');
            } else {
              Alert.alert('错误', result.error || '删除分析记录失败');
            }
          }
        }
      ]
    );
  };

  // 分享档案
  const handleShareProfile = async () => {
    try {
      const exportData = formatProfileForExport(profile);
      const shareContent = `我的星盘档案 ✨\n\n` +
        Object.entries(exportData)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n') + 
        `\n\n来自星盘AI应用`;

      await Share.share({
        message: shareContent,
        title: `${profile.name}的星盘档案`
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  // 分享分析记录
  const handleShareAnalysis = async (analysisRecord) => {
    try {
      const analysis = analysisRecord.analysisData;
      const shareContent = `${profile.name}的星盘分析 ✨\n\n` +
        `🌟 七大星体：\n` +
        `太阳星座：${analysis.sunSign} (第${analysis.planetHouses?.sun || '?'}宫)\n` +
        `月亮星座：${analysis.moonSign} (第${analysis.planetHouses?.moon || '?'}宫)\n` +
        `上升星座：${analysis.risingSign} (第${analysis.planetHouses?.rising || '?'}宫)\n` +
        `水星星座：${analysis.mercurySign} (第${analysis.planetHouses?.mercury || '?'}宫)\n` +
        `金星星座：${analysis.venusSign} (第${analysis.planetHouses?.venus || '?'}宫)\n` +
        `火星星座：${analysis.marsSign} (第${analysis.planetHouses?.mars || '?'}宫)\n\n` +
        `💫 综合分析：\n${analysis.analysis}\n\n` +
        `📅 分析时间：${new Date(analysisRecord.createdAt).toLocaleString('zh-CN')}\n\n` +
        `来自星盘AI应用`;

      await Share.share({
        message: shareContent,
        title: `${profile.name}的星盘分析`
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>档案不存在</Text>
      </View>
    );
  }

  const displayProfile = formatProfileForDisplay(profile);
  const analysisHistory = profile.analysisHistory || [];

  // 渲染基本信息
  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📝 基本信息</Text>
      <View style={styles.infoContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.birthInfo}>
              🎂 {profile.birthday} {profile.birthTime}
            </Text>
            <Text style={styles.birthPlace}>📍 {profile.birthPlace}</Text>
          </View>
          
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {profile.tags && profile.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>标签：</Text>
            <View style={styles.tagsWrap}>
              {profile.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {profile.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>备注：</Text>
            <Text style={styles.notesText}>{profile.notes}</Text>
          </View>
        )}

        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>
            创建时间：{new Date(profile.createdAt).toLocaleString('zh-CN')}
          </Text>
          <Text style={styles.metaText}>
            更新时间：{new Date(profile.updatedAt).toLocaleString('zh-CN')}
          </Text>
        </View>
      </View>
    </View>
  );

  // 渲染分析历史
  const renderAnalysisHistory = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔮 分析历史 ({analysisHistory.length})</Text>
        <TouchableOpacity 
          style={styles.newAnalysisButton}
          onPress={handleGenerateAnalysis}
        >
          <Text style={styles.newAnalysisText}>新分析</Text>
        </TouchableOpacity>
      </View>

      {analysisHistory.length === 0 ? (
        <View style={styles.emptyAnalysisContainer}>
          <Text style={styles.emptyAnalysisText}>还没有分析记录</Text>
          <TouchableOpacity 
            style={styles.firstAnalysisButton}
            onPress={handleGenerateAnalysis}
          >
            <Text style={styles.firstAnalysisText}>生成第一个分析</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.analysisHistoryContainer}>
          {analysisHistory.map((record, index) => (
            <TouchableOpacity 
              key={record.id}
              style={styles.analysisCard}
              onPress={() => handleViewAnalysis(record)}
            >
              <View style={styles.analysisHeader}>
                <View style={styles.analysisInfo}>
                  <Text style={styles.analysisDate}>
                    {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                  </Text>
                  <Text style={styles.analysisType}>
                    {record.analysisType === 'full' ? '完整分析' : '快速分析'}
                  </Text>
                </View>
                <View style={styles.analysisActions}>
                  <TouchableOpacity 
                    style={styles.shareAnalysisButton}
                    onPress={() => handleShareAnalysis(record)}
                  >
                    <Text style={styles.shareAnalysisText}>分享</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteAnalysisButton}
                    onPress={() => handleDeleteAnalysis(record)}
                  >
                    <Text style={styles.deleteAnalysisText}>删除</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.analysisPreview} numberOfLines={2}>
                {record.analysisData.analysis}
              </Text>
              
              <View style={styles.analysisStats}>
                <Text style={styles.analysisStatsText}>
                  太阳: {record.analysisData.sunSign} • 
                  月亮: {record.analysisData.moonSign} • 
                  上升: {record.analysisData.risingSign}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // 渲染分析详情模态框
  const renderAnalysisModal = () => (
    <Modal
      visible={showAnalysisModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAnalysisModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>分析详情</Text>
          <TouchableOpacity onPress={() => setShowAnalysisModal(false)}>
            <Text style={styles.closeButton}>完成</Text>
          </TouchableOpacity>
        </View>
        
        {selectedAnalysis && (
          <ScrollView style={styles.modalContent}>
            <Text style={styles.analysisFullDate}>
              {new Date(selectedAnalysis.createdAt).toLocaleString('zh-CN')}
            </Text>
            
            <View style={styles.planetsGrid}>
              <View style={styles.planetItem}>
                <Text style={styles.planetLabel}>☀️ 太阳</Text>
                <Text style={styles.planetValue}>{selectedAnalysis.analysisData.sunSign}</Text>
              </View>
              <View style={styles.planetItem}>
                <Text style={styles.planetLabel}>🌙 月亮</Text>
                <Text style={styles.planetValue}>{selectedAnalysis.analysisData.moonSign}</Text>
              </View>
              <View style={styles.planetItem}>
                <Text style={styles.planetLabel}>⬆️ 上升</Text>
                <Text style={styles.planetValue}>{selectedAnalysis.analysisData.risingSign}</Text>
              </View>
              <View style={styles.planetItem}>
                <Text style={styles.planetLabel}>☿️ 水星</Text>
                <Text style={styles.planetValue}>{selectedAnalysis.analysisData.mercurySign}</Text>
              </View>
              <View style={styles.planetItem}>
                <Text style={styles.planetLabel}>♀️ 金星</Text>
                <Text style={styles.planetValue}>{selectedAnalysis.analysisData.venusSign}</Text>
              </View>
              <View style={styles.planetItem}>
                <Text style={styles.planetLabel}>♂️ 火星</Text>
                <Text style={styles.planetValue}>{selectedAnalysis.analysisData.marsSign}</Text>
              </View>
            </View>
            
            <View style={styles.analysisTextContainer}>
              <Text style={styles.analysisTextTitle}>🔮 综合分析</Text>
              <Text style={styles.analysisFullText}>
                {selectedAnalysis.analysisData.analysis}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.shareFullAnalysisButton}
              onPress={() => handleShareAnalysis(selectedAnalysis)}
            >
              <Text style={styles.shareFullAnalysisText}>分享这个分析</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderBasicInfo()}
      {renderAnalysisHistory()}
      
      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Text style={styles.editButtonText}>编辑档案</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShareProfile}
        >
          <Text style={styles.shareButtonText}>分享档案</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteProfile}
        >
          <Text style={styles.deleteButtonText}>删除档案</Text>
        </TouchableOpacity>
      </View>
      
      {renderAnalysisModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  newAnalysisButton: {
    backgroundColor: '#8e44ad',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newAnalysisText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  birthInfo: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  birthPlace: {
    fontSize: 16,
    color: '#95a5a6',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8e44ad',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  tagsLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    marginRight: 8,
    marginTop: 4,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tag: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  notesContainer: {
    gap: 8,
  },
  notesLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  metaInfo: {
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  emptyAnalysisContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyAnalysisText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  firstAnalysisButton: {
    backgroundColor: '#8e44ad',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  firstAnalysisText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisHistoryContainer: {
    gap: 12,
  },
  analysisCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisInfo: {
    flex: 1,
  },
  analysisDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  analysisType: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  analysisActions: {
    flexDirection: 'row',
    gap: 8,
  },
  shareAnalysisButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  shareAnalysisText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteAnalysisButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteAnalysisText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  analysisPreview: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 8,
  },
  analysisStats: {},
  analysisStatsText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // 模态框样式
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    fontSize: 16,
    color: '#8e44ad',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  analysisFullDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    textAlign: 'center',
  },
  planetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  planetItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '30%',
  },
  planetLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  planetValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8e44ad',
  },
  analysisTextContainer: {
    marginBottom: 24,
  },
  analysisTextTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  analysisFullText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 22,
  },
  shareFullAnalysisButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  shareFullAnalysisText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileDetailScreen; 