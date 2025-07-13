import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  PanResponder,
  Animated
} from 'react-native';

const { width, height } = Dimensions.get('window');

// 滚轮选择器组件
const WheelPicker = ({ data, selectedIndex, onValueChange, itemHeight = 44 }) => {
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (scrollViewRef.current && selectedIndex >= 0) {
      // 延迟滚动以确保组件已完全渲染
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ 
          y: selectedIndex * itemHeight, 
          animated: false 
        });
      }, 100);
    }
  }, [selectedIndex, itemHeight]);

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    if (index !== selectedIndex && index >= 0 && index < data.length) {
      onValueChange(index);
    }
  };

  const handleScrollEnd = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ 
        y: clampedIndex * itemHeight, 
        animated: true 
      });
    }
    
    if (clampedIndex !== selectedIndex) {
      onValueChange(clampedIndex);
    }
  };

  return (
    <View style={styles.wheelContainer}>
      <View style={styles.wheelMask} />
      <View style={styles.wheelSelection} />
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.wheelScrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={16}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: itemHeight * 2
        }}
      >
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.wheelItem,
              { height: itemHeight }
            ]}
            onPress={() => {
              onValueChange(index);
              setTimeout(() => {
                scrollViewRef.current?.scrollTo({ 
                  y: index * itemHeight, 
                  animated: true 
                });
              }, 50);
            }}
          >
            <Text style={[
              styles.wheelItemText,
              index === selectedIndex && styles.wheelItemTextSelected
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// 主要的日期时间选择器组件
const DateTimePicker = ({ 
  visible, 
  onClose, 
  onConfirm, 
  initialDate = new Date(),
  mode = 'date', // 'date', 'time', 'datetime'
  title = '选择日期时间'
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [selectedHour, setSelectedHour] = useState(initialDate.getHours());
  const [selectedMinute, setSelectedMinute] = useState(initialDate.getMinutes());

  // 生成年份数组（1900-2030）
  const years = Array.from({ length: 131 }, (_, i) => (1900 + i).toString());
  
  // 生成月份数组
  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  // 生成天数数组（根据选中的年月）
  const getDaysInMonth = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString() + '日');
  };

  // 生成小时数组
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  
  // 生成分钟数组
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const days = getDaysInMonth(selectedYear, selectedMonth);

  // 处理年份变化
  const handleYearChange = (index) => {
    const year = parseInt(years[index]);
    setSelectedYear(year);
    
    // 检查当前选中的日期是否在新年月中有效
    const maxDay = new Date(year, selectedMonth + 1, 0).getDate();
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  };

  // 处理月份变化
  const handleMonthChange = (index) => {
    setSelectedMonth(index);
    
    // 检查当前选中的日期是否在新月份中有效
    const maxDay = new Date(selectedYear, index + 1, 0).getDate();
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  };

  // 处理确认
  const handleConfirm = () => {
    let newDate;
    
    if (mode === 'date') {
      newDate = new Date(selectedYear, selectedMonth, selectedDay);
    } else if (mode === 'time') {
      newDate = new Date(selectedDate);
      newDate.setHours(selectedHour, selectedMinute, 0, 0);
    } else {
      newDate = new Date(selectedYear, selectedMonth, selectedDay, selectedHour, selectedMinute);
    }
    
    onConfirm(newDate);
    onClose();
  };

  // 渲染日期选择器
  const renderDatePicker = () => (
    <View style={styles.pickersContainer}>
      <WheelPicker
        data={years}
        selectedIndex={years.indexOf(selectedYear.toString())}
        onValueChange={handleYearChange}
      />
      <WheelPicker
        data={months}
        selectedIndex={selectedMonth}
        onValueChange={handleMonthChange}
      />
      <WheelPicker
        data={days}
        selectedIndex={selectedDay - 1}
        onValueChange={(index) => setSelectedDay(index + 1)}
      />
    </View>
  );

  // 渲染时间选择器
  const renderTimePicker = () => (
    <View style={styles.pickersContainer}>
      <WheelPicker
        data={hours}
        selectedIndex={selectedHour}
        onValueChange={setSelectedHour}
      />
      <Text style={styles.timeSeparator}>:</Text>
      <WheelPicker
        data={minutes}
        selectedIndex={selectedMinute}
        onValueChange={setSelectedMinute}
      />
    </View>
  );

  // 渲染日期时间选择器
  const renderDateTimePicker = () => (
    <View style={styles.dateTimeContainer}>
      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>日期</Text>
        {renderDatePicker()}
      </View>
      <View style={styles.timeSection}>
        <Text style={styles.sectionTitle}>时间</Text>
        {renderTimePicker()}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.confirmButton}>确定</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            {mode === 'date' && renderDatePicker()}
            {mode === 'time' && renderTimePicker()}
            {mode === 'datetime' && renderDateTimePicker()}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  cancelButton: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  confirmButton: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  pickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 200,
  },
  wheelContainer: {
    flex: 1,
    height: 200,
    position: 'relative',
  },
  wheelMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  wheelSelection: {
    position: 'absolute',
    top: 88,
    left: 0,
    right: 0,
    height: 44,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e8ed',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    zIndex: 2,
  },
  wheelScrollView: {
    flex: 1,
  },
  wheelItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  wheelItemText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  wheelItemSelected: {
    backgroundColor: 'transparent',
  },
  wheelItemTextSelected: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 10,
  },
  dateTimeContainer: {
    flexDirection: 'column',
  },
  dateSection: {
    marginBottom: 20,
  },
  timeSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default DateTimePicker; 