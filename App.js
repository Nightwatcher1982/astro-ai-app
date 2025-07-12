import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import InputScreen from './screens/InputScreen';
import ResultScreen from './screens/ResultScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#f8f9fa" />
      <Stack.Navigator
        initialRouteName="Input"
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
    </NavigationContainer>
  );
}
