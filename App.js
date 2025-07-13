import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native'; // Added missing import for Text

// 导入所有界面组件
import InputScreen from './screens/InputScreen';
import ResultScreen from './screens/ResultScreen';
import ProfilesScreen from './screens/ProfilesScreen';
import ProfileDetailScreen from './screens/ProfileDetailScreen';
import AddProfileScreen from './screens/AddProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 星盘分析模块的导航栈
const AnalysisStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#8e44ad',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="Input"
      component={InputScreen}
      options={{
        title: '星盘AI分析',
        headerTitleAlign: 'center',
      }}
    />
    <Stack.Screen
      name="Result"
      component={ResultScreen}
      options={{
        title: '分析结果',
        headerTitleAlign: 'center',
        headerLeft: null, // 禁用返回按钮，用户需要通过"重新分析"按钮返回
      }}
    />
  </Stack.Navigator>
);

// 档案管理模块的导航栈
const ProfilesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#8e44ad',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="ProfilesList"
      component={ProfilesScreen}
      options={{
        title: '我的档案',
        headerTitleAlign: 'center',
      }}
    />
    <Stack.Screen
      name="ProfileDetail"
      component={ProfileDetailScreen}
      options={{
        title: '档案详情',
        headerTitleAlign: 'center',
      }}
    />
    <Stack.Screen
      name="AddProfile"
      component={AddProfileScreen}
      options={({ route }) => ({
        title: route.params?.profileId ? '编辑档案' : '添加档案',
        headerTitleAlign: 'center',
      })}
    />
  </Stack.Navigator>
);

// 底部标签栏导航
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false, // 隐藏Tab的header，使用Stack的header
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e1e8ed',
        paddingTop: 8,
        paddingBottom: 8,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
      },
      tabBarActiveTintColor: '#8e44ad',
      tabBarInactiveTintColor: '#7f8c8d',
    }}
  >
    <Tab.Screen
      name="AnalysisTab"
      component={AnalysisStack}
      options={{
        title: '分析',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ fontSize: 20, color }}>🔮</Text>
        ),
      }}
    />
    <Tab.Screen
      name="ProfilesTab"
      component={ProfilesStack}
      options={{
        title: '档案',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ fontSize: 20, color }}>👥</Text>
        ),
      }}
    />
  </Tab.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#8e44ad" />
      <MainTabs />
    </NavigationContainer>
  );
}
