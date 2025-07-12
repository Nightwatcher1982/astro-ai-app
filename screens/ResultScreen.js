import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share
} from 'react-native';

const ResultScreen = ({ route, navigation }) => {
  const { report, location } = route.params;

  const handleShare = async () => {
    try {
      const shareContent = `我的星盘分析报告 ✨\n\n` +
        `太阳星座：${report.sunSign}\n` +
        `月亮星座：${report.moonSign}\n` +
        `上升星座：${report.risingSign}\n\n` +
        `${report.analysis}\n\n` +
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✨ 您的星盘分析</Text>
        <Text style={styles.location}>📍 {location}</Text>
      </View>

      <View style={styles.signsContainer}>
        <View style={styles.signCard}>
          <Text style={styles.signLabel}>太阳星座</Text>
          <Text style={styles.signValue}>{report.sunSign}</Text>
          <Text style={styles.signDescription}>核心自我</Text>
        </View>

        <View style={styles.signCard}>
          <Text style={styles.signLabel}>月亮星座</Text>
          <Text style={styles.signValue}>{report.moonSign}</Text>
          <Text style={styles.signDescription}>内在情感</Text>
        </View>

        <View style={styles.signCard}>
          <Text style={styles.signLabel}>上升星座</Text>
          <Text style={styles.signValue}>{report.risingSign}</Text>
          <Text style={styles.signDescription}>外在表现</Text>
        </View>
      </View>

      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>🔮 AI性格分析</Text>
        <Text style={styles.analysisText}>{report.analysis}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 分享我的分析</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newAnalysisButton} onPress={handleNewAnalysis}>
          <Text style={styles.newAnalysisButtonText}>🔄 重新分析</Text>
        </TouchableOpacity>
      </View>

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
  signsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  signCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  signLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  signValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e44ad',
    marginBottom: 4,
  },
  signDescription: {
    fontSize: 10,
    color: '#95a5a6',
    textAlign: 'center',
  },
  analysisContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  shareButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  newAnalysisButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  newAnalysisButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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