import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Modal
} from 'react-native';
import ProfileStorage from '../services/ProfileStorage';

const ResultScreen = ({ route, navigation }) => {
  const { report, location, profileId } = route.params;
  const [activeTab, setActiveTab] = useState('overview');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [profiles, setProfiles] = useState([]);

  const handleShare = async () => {
    try {
      const shareContent = `我的星盘分析报告 ✨\n\n` +
        `🌟 七大星体：\n` +
        `太阳星座：${report.sunSign} (第${report.planetHouses?.sun || '?'}宫)\n` +
        `月亮星座：${report.moonSign} (第${report.planetHouses?.moon || '?'}宫)\n` +
        `上升星座：${report.risingSign} (第${report.planetHouses?.rising || '?'}宫)\n` +
        `水星星座：${report.mercurySign} (第${report.planetHouses?.mercury || '?'}宫)\n` +
        `金星星座：${report.venusSign} (第${report.planetHouses?.venus || '?'}宫)\n` +
        `火星星座：${report.marsSign} (第${report.planetHouses?.mars || '?'}宫)\n\n` +
        `💫 综合分析：\n${report.analysis}\n\n` +
        `来自星盘AI - 探索你的内在宇宙`;

      await Share.share({
        message: shareContent,
        title: '我的星盘分析报告'
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleNewAnalysis = () => {
    navigation.navigate('Input');
  };

  // 保存到档案
  const handleSaveToProfile = async () => {
    if (profileId) {
      // 已经关联档案，直接提示已保存
      Alert.alert('提示', '此分析已自动保存到关联档案中');
      return;
    }
    
    // 没有关联档案，显示保存选项
    try {
      const allProfiles = await ProfileStorage.getAllProfiles();
      setProfiles(allProfiles);
      setShowSaveModal(true);
    } catch (error) {
      console.error('获取档案列表失败:', error);
      Alert.alert('错误', '获取档案列表失败');
    }
  };

  // 保存到指定档案
  const saveToSpecificProfile = async (targetProfileId) => {
    try {
      const result = await ProfileStorage.saveAnalysisToProfile(
        targetProfileId,
        report,
        'full'
      );
      
      if (result.success) {
        setShowSaveModal(false);
        Alert.alert('成功', '分析已保存到档案');
      } else {
        Alert.alert('错误', result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存到档案失败:', error);
      Alert.alert('错误', '保存到档案失败');
    }
  };

  // 创建新档案并保存
  const handleCreateNewProfile = () => {
    setShowSaveModal(false);
    
    // 基于当前分析数据创建档案的预填充信息
    const birthInfo = extractBirthInfoFromReport(report, location);
    
    navigation.navigate('ProfilesTab', {
      screen: 'AddProfile',
      params: {
        prefilledData: birthInfo,
        analysisToSave: report
      }
    });
  };

  // 从分析报告中提取出生信息（这里需要根据实际API返回的数据结构调整）
  const extractBirthInfoFromReport = (report, location) => {
    // 由于我们没有从分析结果中返回原始的出生信息，
    // 这里只能提供地点信息，其他信息需要用户手动填写
    return {
      birthPlace: location.split(',')[0] || location, // 取地点的第一部分
      analysisToSave: report
    };
  };

  const renderPlanetCard = (planet, sign, description, emoji, house = null) => (
    <View style={styles.planetCard} key={planet}>
      <Text style={styles.planetEmoji}>{emoji}</Text>
      <Text style={styles.planetName}>{planet}</Text>
      <Text style={styles.planetSign}>{sign}</Text>
      {house && <Text style={styles.planetHouse}>第{house}宫</Text>}
      <Text style={styles.planetDescription}>{description}</Text>
    </View>
  );

  const renderHouseCard = (houseNumber, houseInfo) => (
    <View style={styles.houseCard} key={houseNumber}>
      <Text style={styles.houseNumber}>第{houseNumber}宫</Text>
      <Text style={styles.houseName}>{houseInfo.name}</Text>
      <Text style={styles.houseSign}>{houseInfo.sign}</Text>
      <Text style={styles.houseKeywords}>
        {houseInfo.keywords?.join(' • ') || ''}
      </Text>
      <Text style={styles.houseMeaning}>{houseInfo.meaning}</Text>
    </View>
  );

  const renderOverview = () => (
    <>
      <View style={styles.planetsGrid}>
        {renderPlanetCard('太阳', report.sunSign, '核心自我', '☀️', report.planetHouses?.sun)}
        {renderPlanetCard('月亮', report.moonSign, '内在情感', '🌙', report.planetHouses?.moon)}
        {renderPlanetCard('上升', report.risingSign, '外在表现', '⬆️', report.planetHouses?.rising)}
        {renderPlanetCard('水星', report.mercurySign, '思维沟通', '☿️', report.planetHouses?.mercury)}
        {renderPlanetCard('金星', report.venusSign, '爱情关系', '♀️', report.planetHouses?.venus)}
        {renderPlanetCard('火星', report.marsSign, '行动能量', '♂️', report.planetHouses?.mars)}
      </View>

      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>🔮 综合分析</Text>
        <Text style={styles.analysisText}>{report.analysis}</Text>
      </View>
    </>
  );

  const renderHouseSystem = () => (
    <View style={styles.houseSystemContainer}>
      <View style={styles.houseIntroContainer}>
        <Text style={styles.houseIntroTitle}>🏛️ 十二宫位系统</Text>
        <Text style={styles.houseIntroText}>
          宫位代表人生的不同领域，星体落在不同宫位会影响相应的生活层面
        </Text>
      </View>

      <View style={styles.housesGrid}>
        {report.houses && Object.keys(report.houses).map(houseNumber => 
          renderHouseCard(houseNumber, report.houses[houseNumber])
        )}
      </View>

      {report.houseAnalysis && (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>🏠 宫位分析</Text>
          <Text style={styles.analysisText}>{report.houseAnalysis}</Text>
        </View>
      )}
    </View>
  );

  const renderCategoryAnalysis = (categoryKey, title, emoji) => {
    const analysis = report.categorizedAnalysis && report.categorizedAnalysis[categoryKey];
    if (!analysis) return null;

    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{emoji} {title}</Text>
        <Text style={styles.categoryText}>{analysis}</Text>
      </View>
    );
  };

  const renderDetailedAnalysis = () => (
    <View style={styles.detailedContainer}>
      {renderCategoryAnalysis('personality', '性格特质深度分析', '🧠')}
      {renderCategoryAnalysis('communication', '沟通风格分析', '🗣️')}
      {renderCategoryAnalysis('love', '爱情观与关系分析', '💕')}
      {renderCategoryAnalysis('career', '事业倾向分析', '💼')}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'houses':
        return renderHouseSystem();
      case 'detailed':
        return renderDetailedAnalysis();
      default:
        return renderOverview();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✨ 您的星盘分析</Text>
        <Text style={styles.location}>📍 {location}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            概览
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'houses' && styles.activeTab]}
          onPress={() => setActiveTab('houses')}
        >
          <Text style={[styles.tabText, activeTab === 'houses' && styles.activeTabText]}>
            宫位
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'detailed' && styles.activeTab]}
          onPress={() => setActiveTab('detailed')}
        >
          <Text style={[styles.tabText, activeTab === 'detailed' && styles.activeTabText]}>
            详细分析
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 分享我的分析</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveToProfile}>
          <Text style={styles.saveButtonText}>
            {profileId ? '✅ 已保存到档案' : '💾 保存到档案'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newAnalysisButton} onPress={handleNewAnalysis}>
          <Text style={styles.newAnalysisButtonText}>🔄 重新分析</Text>
        </TouchableOpacity>
      </View>

      {/* 保存到档案的模态框 */}
      <Modal
        visible={showSaveModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.saveModalContent}>
            <View style={styles.saveModalHeader}>
              <Text style={styles.saveModalTitle}>保存分析到档案</Text>
              <TouchableOpacity onPress={() => setShowSaveModal(false)}>
                <Text style={styles.saveModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.saveModalBody}>
              {/* 创建新档案选项 */}
              <TouchableOpacity 
                style={styles.saveOption}
                onPress={handleCreateNewProfile}
              >
                <View style={styles.saveOptionIcon}>
                  <Text style={styles.saveOptionIconText}>➕</Text>
                </View>
                <View style={styles.saveOptionContent}>
                  <Text style={styles.saveOptionTitle}>创建新档案</Text>
                  <Text style={styles.saveOptionSubtitle}>
                    基于此分析创建一个新的档案
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 现有档案列表 */}
              {profiles.length > 0 && (
                <>
                  <View style={styles.saveModalDivider} />
                  <Text style={styles.existingProfilesTitle}>保存到现有档案</Text>
                  
                  {profiles.map((profile) => (
                    <TouchableOpacity
                      key={profile.id}
                      style={styles.saveOption}
                      onPress={() => saveToSpecificProfile(profile.id)}
                    >
                      <View style={styles.saveOptionIcon}>
                        <Text style={styles.saveOptionIconText}>
                          {profile.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.saveOptionContent}>
                        <Text style={styles.saveOptionTitle}>{profile.name}</Text>
                        <Text style={styles.saveOptionSubtitle}>
                          {profile.birthday} • {profile.birthPlace}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          星盘只是一个工具，真正的力量在于你如何运用这些天赋去创造属于自己的人生 ✨
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#8e44ad',
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  planetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  planetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planetEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  planetName: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  planetSign: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e44ad',
    marginBottom: 4,
  },
  planetHouse: {
    fontSize: 12,
    color: '#e67e22',
    fontWeight: '600',
    marginBottom: 4,
  },
  planetDescription: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
  },
  houseSystemContainer: {
    paddingHorizontal: 20,
  },
  houseIntroContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  houseIntroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  houseIntroText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  housesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  houseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  houseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e67e22',
    textAlign: 'center',
    marginBottom: 4,
  },
  houseName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  houseSign: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8e44ad',
    textAlign: 'center',
    marginBottom: 6,
  },
  houseKeywords: {
    fontSize: 10,
    color: '#3498db',
    textAlign: 'center',
    marginBottom: 6,
  },
  houseMeaning: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 14,
  },
  analysisContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    textAlign: 'justify',
  },
  detailedContainer: {
    paddingHorizontal: 20,
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#34495e',
    textAlign: 'justify',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    gap: 8,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  newAnalysisButton: {
    flex: 1,
    backgroundColor: '#8e44ad',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  newAnalysisButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // 保存模态框样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  saveModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  saveModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  saveModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  saveModalClose: {
    fontSize: 24,
    color: '#7f8c8d',
  },
  saveModalBody: {
    padding: 20,
  },
  saveModalDivider: {
    height: 1,
    backgroundColor: '#e1e8ed',
    marginVertical: 20,
  },
  existingProfilesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  saveOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  saveOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8e44ad',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  saveOptionIconText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveOptionContent: {
    flex: 1,
  },
  saveOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  saveOptionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default ResultScreen; 