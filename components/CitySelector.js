import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

// 中国城市数据
const CHINA_CITIES = {
  '北京': ['北京'],
  '上海': ['上海'],
  '天津': ['天津'],
  '重庆': ['重庆'],
  '广东': ['广州', '深圳', '珠海', '汕头', '韶关', '佛山', '江门', '湛江', '茂名', '肇庆', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮'],
  '江苏': ['南京', '无锡', '徐州', '常州', '苏州', '南通', '连云港', '淮安', '盐城', '扬州', '镇江', '泰州', '宿迁'],
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
  '山东': ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '滨州', '德州', '聊城', '临沂', '菏泽'],
  '河南': ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店'],
  '河北': ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'],
  '四川': ['成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳'],
  '湖北': ['武汉', '黄石', '十堰', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州'],
  '湖南': ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底'],
  '安徽': ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '阜阳', '宿州', '六安', '亳州', '池州', '宣城'],
  '陕西': ['西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛'],
  '江西': ['南昌', '景德镇', '萍乡', '九江', '新余', '鹰潭', '赣州', '吉安', '宜春', '抚州', '上饶'],
  '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
  '福建': ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'],
  '黑龙江': ['哈尔滨', '齐齐哈尔', '鸡西', '鹤岗', '双鸭山', '大庆', '伊春', '佳木斯', '七台河', '牡丹江', '黑河', '绥化'],
  '吉林': ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城'],
  '山西': ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁'],
  '云南': ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧'],
  '贵州': ['贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁'],
  '广西': ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'],
  '内蒙古': ['呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布'],
  '西藏': ['拉萨', '昌都', '山南', '日喀则', '那曲', '阿里', '林芝'],
  '新疆': ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博尔塔拉', '巴音郭楞', '阿克苏', '克孜勒苏', '喀什', '和田', '伊犁', '塔城', '阿勒泰'],
  '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫'],
  '青海': ['西宁', '海东', '海北', '黄南', '海南', '果洛', '玉树', '海西'],
  '甘肃': ['兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南', '临夏', '甘南'],
  '海南': ['海口', '三亚', '三沙', '儋州'],
  '台湾': ['台北', '新北', '桃园', '台中', '台南', '高雄', '基隆', '新竹', '嘉义', '苗栗', '彰化', '南投', '云林', '屏东', '宜兰', '花莲', '台东'],
  '香港': ['香港'],
  '澳门': ['澳门']
};

// 热门城市
const HOT_CITIES = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '苏州', '成都', '武汉', '重庆',
  '西安', '天津', '青岛', '长沙', '沈阳', '大连', '厦门', '宁波', '无锡', '济南'
];

const CitySelector = ({ 
  visible, 
  onClose, 
  onSelect, 
  title = '选择城市' 
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [activeTab, setActiveTab] = useState('hot'); // 'hot', 'province', 'search'

  // 获取所有城市的扁平列表
  const getAllCities = () => {
    const cities = [];
    Object.keys(CHINA_CITIES).forEach(province => {
      CHINA_CITIES[province].forEach(city => {
        cities.push({ province, city });
      });
    });
    return cities;
  };

  // 搜索城市
  const getSearchResults = () => {
    if (!searchText.trim()) return [];
    
    const allCities = getAllCities();
    return allCities.filter(({ city, province }) =>
      city.toLowerCase().includes(searchText.toLowerCase()) ||
      province.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  // 处理城市选择
  const handleCitySelect = (city) => {
    onSelect(city);
    onClose();
  };

  // 渲染热门城市
  const renderHotCities = () => (
    <View style={styles.hotCitiesContainer}>
      <Text style={styles.sectionTitle}>热门城市</Text>
      <View style={styles.hotCitiesGrid}>
        {HOT_CITIES.map((city, index) => (
          <TouchableOpacity
            key={index}
            style={styles.hotCityItem}
            onPress={() => handleCitySelect(city)}
          >
            <Text style={styles.hotCityText}>{city}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // 渲染省份列表
  const renderProvinceList = () => (
    <View style={styles.provinceContainer}>
      <ScrollView style={styles.provinceList} showsVerticalScrollIndicator={false}>
        {Object.keys(CHINA_CITIES).map((province, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.provinceItem,
              selectedProvince === province && styles.provinceItemSelected
            ]}
            onPress={() => setSelectedProvince(province)}
          >
            <Text style={[
              styles.provinceText,
              selectedProvince === province && styles.provinceTextSelected
            ]}>
              {province}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // 渲染城市列表
  const renderCityList = () => (
    <View style={styles.cityContainer}>
      <ScrollView style={styles.cityList} showsVerticalScrollIndicator={false}>
        {selectedProvince && CHINA_CITIES[selectedProvince].map((city, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cityItem}
            onPress={() => handleCitySelect(city)}
          >
            <Text style={styles.cityText}>{city}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // 渲染搜索结果
  const renderSearchResults = () => {
    const results = getSearchResults();
    
    if (results.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchText ? '未找到相关城市' : '输入城市名称进行搜索'}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
        {results.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.searchResultItem}
            onPress={() => handleCitySelect(item.city)}
          >
            <Text style={styles.searchResultCity}>{item.city}</Text>
            <Text style={styles.searchResultProvince}>{item.province}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

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
            <View style={styles.placeholder} />
          </View>

          {/* 搜索框 */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索城市"
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                if (text.trim()) {
                  setActiveTab('search');
                } else {
                  setActiveTab('hot');
                }
              }}
              returnKeyType="search"
            />
          </View>

          {/* 标签页 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'hot' && styles.activeTab]}
              onPress={() => {
                setActiveTab('hot');
                setSearchText('');
              }}
            >
              <Text style={[styles.tabText, activeTab === 'hot' && styles.activeTabText]}>
                热门
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'province' && styles.activeTab]}
              onPress={() => {
                setActiveTab('province');
                setSearchText('');
              }}
            >
              <Text style={[styles.tabText, activeTab === 'province' && styles.activeTabText]}>
                省份
              </Text>
            </TouchableOpacity>
          </View>

          {/* 内容区域 */}
          <View style={styles.content}>
            {activeTab === 'hot' && renderHotCities()}
            {activeTab === 'search' && renderSearchResults()}
            {activeTab === 'province' && (
              <View style={styles.provinceContent}>
                {renderProvinceList()}
                {renderCityList()}
              </View>
            )}
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
    maxHeight: height * 0.8,
    flex: 1,
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
  placeholder: {
    width: 50,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  hotCitiesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  hotCitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hotCityItem: {
    width: '30%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  hotCityText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  provinceContent: {
    flex: 1,
    flexDirection: 'row',
  },
  provinceContainer: {
    flex: 1,
    marginRight: 10,
  },
  provinceList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  provinceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  provinceItemSelected: {
    backgroundColor: '#3498db',
  },
  provinceText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  provinceTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cityContainer: {
    flex: 1,
    marginLeft: 10,
  },
  cityList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  cityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  cityText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  searchResultCity: {
    fontSize: 16,
    color: '#2c3e50',
  },
  searchResultProvince: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default CitySelector; 