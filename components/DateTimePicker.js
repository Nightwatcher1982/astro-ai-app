import React, { useState, useEffect } from 'react';
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
  const [tempDate, setTempDate] = useState(initialDate); // 临时存储iOS picker的选择

  // 当initialDate变化时，更新selectedDate和tempDate
  useEffect(() => {
    setSelectedDate(initialDate);
    setTempDate(new Date(initialDate.getTime()));
  }, [initialDate]);

  // 如果不可见，直接返回null
  if (!visible) {
    return null;
  }

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        onClose();
        return;
      }
      if (date) {
        setSelectedDate(date);
        onConfirm(date);
        onClose();
      }
    } else {
      // iOS处理
      if (date) {
        setTempDate(new Date(date.getTime()));
      }
    }
  };

  const handleIOSPickerCancel = () => {
    setTempDate(new Date(selectedDate.getTime())); // 重置为原始值
    onClose();
  };

  const handleIOSPickerConfirm = () => {
    setSelectedDate(new Date(tempDate.getTime())); // 保存临时选择
    onConfirm(new Date(tempDate.getTime()));
    onClose();
  };

  const renderIOSPicker = () => (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={handleIOSPickerCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={handleIOSPickerCancel}>
              <Text style={styles.cancelButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleIOSPickerConfirm}>
              <Text style={styles.confirmButton}>完成</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.iosPickerWrapper}>
            <DateTimePicker
              value={tempDate}
              mode={mode}
              display="spinner"
              onChange={handleDateChange}
              style={styles.iosPicker}
              locale="zh-CN"
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAndroidPicker = () => (
    <DateTimePicker
      value={selectedDate}
      mode={mode}
      display="default"
      onChange={handleDateChange}
      locale="zh-CN"
    />
  );

  return Platform.OS === 'ios' ? renderIOSPicker() : renderAndroidPicker();
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#999',
  },
  confirmButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  iosPickerWrapper: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iosPicker: {
    width: '100%',
    height: 200,
  },
});

export default CustomDateTimePicker; 