import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CustomDateTimePicker = ({ 
  visible, 
  onClose, 
  onConfirm, 
  initialDate = new Date(),
  mode = 'date', // 'date', 'time', 'datetime'
  title = '选择日期时间'
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showPicker, setShowPicker] = useState(false);
  const [currentMode, setCurrentMode] = useState('date');

  // 设置日期范围：当前年份-100年 到 当前年份-20年
  const currentYear = new Date().getFullYear();
  const minDate = new Date(currentYear - 100, 0, 1); // 100年前
  const maxDate = new Date(currentYear - 20, 11, 31); // 20年前

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDateTime = (date) => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  const getDisplayText = () => {
    switch (mode) {
      case 'time':
        return formatTime(selectedDate);
      case 'datetime':
        return formatDateTime(selectedDate);
      default:
        return formatDate(selectedDate);
    }
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  const openPicker = (pickerMode) => {
    setCurrentMode(pickerMode);
    setShowPicker(true);
  };

  const renderIOSPicker = () => {
    if (!showPicker) return null;

    return (
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.iosModalOverlay}>
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity 
                onPress={() => setShowPicker(false)}
                style={styles.iosHeaderButton}
              >
                <Text style={styles.iosHeaderButtonText}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.iosPickerTitle}>
                {currentMode === 'date' ? '选择日期' : '选择时间'}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowPicker(false)}
                style={styles.iosHeaderButton}
              >
                <Text style={[styles.iosHeaderButtonText, styles.iosConfirmText]}>完成</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedDate}
              mode={currentMode}
              display="spinner"
              onChange={handleDateChange}
              minimumDate={minDate}
              maximumDate={maxDate}
              style={styles.iosPicker}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const renderAndroidPicker = () => {
    if (!showPicker) return null;

    return (
      <DateTimePicker
        value={selectedDate}
        mode={currentMode}
        display="default"
        onChange={handleDateChange}
        minimumDate={minDate}
        maximumDate={maxDate}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>确定</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.currentValue}>{getDisplayText()}</Text>
            
            {mode === 'date' && (
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => openPicker('date')}
              >
                <Text style={styles.pickerButtonText}>选择日期</Text>
              </TouchableOpacity>
            )}

            {mode === 'time' && (
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => openPicker('time')}
              >
                <Text style={styles.pickerButtonText}>选择时间</Text>
              </TouchableOpacity>
            )}

            {mode === 'datetime' && (
              <View style={styles.dateTimeButtons}>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.halfButton]}
                  onPress={() => openPicker('date')}
                >
                  <Text style={styles.pickerButtonText}>选择日期</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.halfButton]}
                  onPress={() => openPicker('time')}
                >
                  <Text style={styles.pickerButtonText}>选择时间</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.hint}>
              日期范围：{currentYear - 100}年 - {currentYear - 20}年
            </Text>
          </View>
        </View>
      </View>

      {Platform.OS === 'ios' ? renderIOSPicker() : renderAndroidPicker()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#8a8a8a',
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  confirmText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  currentValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 30,
    textAlign: 'center',
  },
  pickerButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 120,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  dateTimeButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  hint: {
    fontSize: 14,
    color: '#8a8a8a',
    marginTop: 20,
    textAlign: 'center',
  },
  // iOS特定样式
  iosModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  iosPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  iosHeaderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  iosHeaderButtonText: {
    fontSize: 16,
    color: '#3498db',
  },
  iosConfirmText: {
    fontWeight: '600',
  },
  iosPicker: {
    height: 216,
  },
});

export default CustomDateTimePicker; 