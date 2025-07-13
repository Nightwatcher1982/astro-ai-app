import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import ProfileStorage from '../services/ProfileStorage';

const InputScreen = ({ route, navigation }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState(null);

  // 处理从档案预填充的数据
  useEffect(() => {
    if (route.params?.prefilledProfile) {
      const prefilled = route.params.prefilledProfile;
      setDate(new Date(prefilled.date));
      setTime(new Date(`2000-01-01T${prefilled.time}:00`));
      setLocation(prefilled.location);
      setCurrentProfileId(prefilled.profileId || null);
    }
  }, [route.params]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (time) => {
    return time.toTimeString().split(' ')[0].substring(0, 5);
  };

  const handleSubmit = async () => {
    if (!location.trim()) {
      Alert.alert('错误', '请输入出生地点');
      return;
    }

    setLoading(true);

    try {
      // 创建 AbortController 用于设置超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const requestUrl = getApiUrl(API_ENDPOINTS.generateReport);
      const requestData = {
        date: formatDate(date),
        time: formatTime(time),
        location: location.trim()
      };

      console.log('🚀 发送请求到:', requestUrl);
      console.log('📝 请求数据:', requestData);

      // 简化调试信息
      console.log('🚀 [v2.0] 开始网络请求...');
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('✅ 响应状态:', response.status, response.statusText);

      const result = await response.json();
      console.log('📥 响应数据:', result);

      if (result.success) {
        // 如果是从档案生成的分析，保存到档案历史中
        if (currentProfileId) {
          try {
            await ProfileStorage.saveAnalysisToProfile(
              currentProfileId, 
              result.data, 
              'full'
            );
          } catch (error) {
            console.warn('保存分析到档案失败:', error);
            // 不阻断用户流程，只是警告
          }
        }

        navigation.navigate('Result', { 
          report: result.data,
          location: result.location,
          profileId: currentProfileId // 传递profileId以便在结果页面使用
        });
      } else {
        Alert.alert('错误', result.error || '生成报告失败');
      }
    } catch (error) {
      console.error('Request error:', error);
      
      console.log('❌ [v2.0] 网络请求失败:', error);
      Alert.alert('🔧 [v2.0] 网络调试', `错误类型: ${error.name}\n错误信息: ${error.message}\n\n浏览器测试已通过，这可能是React Native特有问题。`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>✨ 星盘AI分析</Text>
          <Text style={styles.subtitle}>输入您的出生信息，获取专属星盘分析</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>出生日期</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>出生时间</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateText}>{formatTime(time)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>出生地点</Text>
            <TextInput
              style={styles.textInput}
              placeholder="请输入城市名称，如：北京、上海、纽约"
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />
          </View>

          {/* 从档案选择按钮 */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('ProfilesTab')}
          >
            <Text style={styles.profileButtonText}>
              📁 从我的档案中选择
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? '正在为您连接宇宙的智慧...' : '🔮 生成我的星盘分析'}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#ffffff',
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  textInput: {
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    color: '#2c3e50',
  },
  profileButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  profileButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#8e44ad',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InputScreen; 