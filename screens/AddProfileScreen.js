import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import ProfileStorage from '../services/ProfileStorage';
import { validateProfile, DEFAULT_TAGS } from '../types/profile';
import DateTimePicker from '../components/DateTimePicker';
import CitySelector from '../components/CitySelector';

const AddProfileScreen = ({ route, navigation }) => {
  const { profileId } = route.params || {};
  const isEditing = !!profileId;

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    birthday: new Date(),
    birthTime: new Date(),
    birthPlace: '',
    notes: '',
    tags: []
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 加载现有档案数据（编辑模式）
  useEffect(() => {
    if (isEditing) {
      loadProfile();
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const profile = await ProfileStorage.getProfileById(profileId);
      if (profile) {
        setFormData({
          name: profile.name,
          birthday: new Date(profile.birthday),
          birthTime: new Date(`2000-01-01T${profile.birthTime}:00`),
          birthPlace: profile.birthPlace,
          notes: profile.notes || '',
          tags: profile.tags || []
        });
      } else {
        Alert.alert('错误', '档案不存在', [
          { text: '确定', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('加载档案失败:', error);
      Alert.alert('错误', '加载档案失败');
    }
  };

  // 更新表单字段
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // 日期选择处理
  const handleDateChange = (selectedDate) => {
    updateField('birthday', selectedDate);
    setShowDatePicker(false);
  };

  // 时间选择处理
  const handleTimeChange = (selectedTime) => {
    updateField('birthTime', selectedTime);
    setShowTimePicker(false);
  };

  // 城市选择处理
  const handleCitySelect = (city) => {
    updateField('birthPlace', city);
    setShowCitySelector(false);
  };

  // 标签切换
  const toggleTag = (tag) => {
    const currentTags = formData.tags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    updateField('tags', newTags);
  };

  // 添加自定义标签
  const addCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      updateField('tags', [...formData.tags, trimmedTag]);
      setCustomTag('');
    }
  };

  // 移除标签
  const removeTag = (tagToRemove) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // 表单验证
  const validateForm = () => {
    const profileData = {
      name: formData.name,
      birthday: formatDate(formData.birthday),
      birthTime: formatTime(formData.birthTime),
      birthPlace: formData.birthPlace,
      notes: formData.notes,
      tags: formData.tags
    };

    const validation = validateProfile(profileData);
    
    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach(error => {
        if (error.includes('姓名')) newErrors.name = error;
        if (error.includes('出生日期')) newErrors.birthday = error;
        if (error.includes('出生时间')) newErrors.birthTime = error;
        if (error.includes('出生地点')) newErrors.birthPlace = error;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  // 保存档案
  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('验证失败', '请检查表单中的错误信息');
      return;
    }

    setLoading(true);
    
    try {
      const profileData = {
        name: formData.name,
        birthday: formatDate(formData.birthday),
        birthTime: formatTime(formData.birthTime),
        birthPlace: formData.birthPlace,
        notes: formData.notes,
        tags: formData.tags
      };

      if (isEditing) {
        profileData.id = profileId;
      }

      const result = await ProfileStorage.saveProfile(profileData);
      
      if (result.success) {
        Alert.alert(
          '成功',
          isEditing ? '档案已更新' : '档案已创建',
          [{ text: '确定', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('错误', result.error || '保存档案失败');
      }
    } catch (error) {
      console.error('保存档案失败:', error);
      Alert.alert('错误', '保存档案失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // 格式化时间
  const formatTime = (time) => {
    return time.toTimeString().split(' ')[0].substring(0, 5);
  };

  // 渲染标签选择模态框
  const renderTagsModal = () => (
    <Modal
      visible={showTagsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTagsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>选择标签</Text>
            <TouchableOpacity onPress={() => setShowTagsModal(false)}>
              <Text style={styles.closeButton}>完成</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 预设标签 */}
            <View style={styles.tagsSection}>
              <Text style={styles.tagsSectionTitle}>常用标签</Text>
              <View style={styles.tagsGrid}>
                {DEFAULT_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagOption,
                      formData.tags.includes(tag) && styles.tagOptionSelected
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[
                      styles.tagOptionText,
                      formData.tags.includes(tag) && styles.tagOptionTextSelected
                    ]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 自定义标签 */}
            <View style={styles.tagsSection}>
              <Text style={styles.tagsSectionTitle}>添加自定义标签</Text>
              <View style={styles.customTagContainer}>
                <TextInput
                  style={styles.customTagInput}
                  placeholder="输入标签名称"
                  value={customTag}
                  onChangeText={setCustomTag}
                  returnKeyType="done"
                  onSubmitEditing={addCustomTag}
                />
                <TouchableOpacity 
                  style={styles.addTagButton}
                  onPress={addCustomTag}
                  disabled={!customTag.trim()}
                >
                  <Text style={styles.addTagButtonText}>添加</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 已选标签 */}
            {formData.tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.tagsSectionTitle}>已选标签</Text>
                <View style={styles.selectedTagsContainer}>
                  {formData.tags.map((tag, index) => (
                    <View key={index} style={styles.selectedTag}>
                      <Text style={styles.selectedTagText}>{tag}</Text>
                      <TouchableOpacity onPress={() => removeTag(tag)}>
                        <Text style={styles.removeTagButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // 渲染错误信息
  const renderError = (field) => {
    if (errors[field]) {
      return <Text style={styles.errorText}>{errors[field]}</Text>;
    }
    return null;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* 姓名 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>姓名 *</Text>
            <TextInput
              style={[styles.textInput, errors.name && styles.inputError]}
              placeholder="请输入姓名"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              autoCapitalize="words"
            />
            {renderError('name')}
          </View>

          {/* 出生日期 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>出生日期 *</Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.birthday && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(formData.birthday)}</Text>
            </TouchableOpacity>
            {renderError('birthday')}
          </View>

          {/* 出生时间 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>出生时间 *</Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.birthTime && styles.inputError]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateText}>{formatTime(formData.birthTime)}</Text>
            </TouchableOpacity>
            {renderError('birthTime')}
          </View>

          {/* 出生地点 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>出生地点 *</Text>
            <TouchableOpacity
              style={[styles.cityButton, errors.birthPlace && styles.inputError]}
              onPress={() => setShowCitySelector(true)}
            >
              <Text style={[styles.cityText, !formData.birthPlace && styles.placeholderText]}>
                {formData.birthPlace || '请选择出生城市'}
              </Text>
              <Text style={styles.cityArrow}>›</Text>
            </TouchableOpacity>
            {renderError('birthPlace')}
          </View>

          {/* 标签 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>标签</Text>
            <TouchableOpacity
              style={styles.tagsButton}
              onPress={() => setShowTagsModal(true)}
            >
              <Text style={styles.tagsButtonText}>
                {formData.tags.length > 0 
                  ? `已选择 ${formData.tags.length} 个标签` 
                  : '选择标签'
                }
              </Text>
              <Text style={styles.tagsButtonIcon}>›</Text>
            </TouchableOpacity>
            
            {formData.tags.length > 0 && (
              <View style={styles.previewTagsContainer}>
                {formData.tags.slice(0, 5).map((tag, index) => (
                  <View key={index} style={styles.previewTag}>
                    <Text style={styles.previewTagText}>{tag}</Text>
                  </View>
                ))}
                {formData.tags.length > 5 && (
                  <Text style={styles.moreTagsText}>+{formData.tags.length - 5}</Text>
                )}
              </View>
            )}
          </View>

          {/* 备注 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>备注</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="添加一些个人备注..."
              value={formData.notes}
              onChangeText={(value) => updateField('notes', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* 保存按钮 */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading 
                ? '保存中...' 
                : isEditing 
                  ? '更新档案' 
                  : '创建档案'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 日期选择器 */}
      <DateTimePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateChange}
        initialDate={formData.birthday}
        mode="date"
        title="选择出生日期"
      />

      {/* 时间选择器 */}
      <DateTimePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onConfirm={handleTimeChange}
        initialDate={formData.birthTime}
        mode="time"
        title="选择出生时间"
      />

      {/* 城市选择器 */}
      <CitySelector
        visible={showCitySelector}
        onClose={() => setShowCitySelector(false)}
        onSelect={handleCitySelect}
        title="选择出生城市"
      />

      {/* 标签选择模态框 */}
      {renderTagsModal()}
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
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    color: '#2c3e50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  cityButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  placeholderText: {
    color: '#7f8c8d',
  },
  cityArrow: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  tagsButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  tagsButtonIcon: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  previewTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  previewTag: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  previewTagText: {
    fontSize: 12,
    color: '#2c3e50',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 16,
    color: '#8e44ad',
    fontWeight: '600',
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsSectionTitle: {
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
  tagOption: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  tagOptionSelected: {
    backgroundColor: '#8e44ad',
    borderColor: '#8e44ad',
  },
  tagOptionText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  tagOptionTextSelected: {
    color: '#ffffff',
  },
  customTagContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  customTagInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  addTagButton: {
    backgroundColor: '#8e44ad',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addTagButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    backgroundColor: '#8e44ad',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedTagText: {
    color: '#ffffff',
    fontSize: 14,
    marginRight: 6,
  },
  removeTagButton: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProfileScreen; 