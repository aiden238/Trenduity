import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SplashScreen } from '../screens/Auth/SplashScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { HomeAScreen } from '../screens/Home/HomeAScreen';
import { AIChatScreen } from '../screens/Chat/AIChatScreen';
// import { InsightListScreen } from '../screens/Insights/InsightListScreen';
// import { CourseListScreen } from '../screens/Courses/CourseListScreen';
// import { MedCheckScreen } from '../screens/MedCheck/MedCheckScreen';
// import { SettingsScreen } from '../screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 메인 탭 네비게이터
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontSize: 14 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeAScreen}
        options={{ title: '홈' }}
      />
      {/* 다른 스크린들은 @repo/ui 수정 후 활성화 예정 */}
      {/*
      <Tab.Screen
        name="Insights"
        component={InsightListScreen}
        options={{ title: '인사이트' }}
      />
      <Tab.Screen
        name="Courses"
        component={CourseListScreen}
        options={{ title: '코스' }}
      />
      <Tab.Screen
        name="MedCheck"
        component={MedCheckScreen}
        options={{ title: '복약체크' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: '설정' }}
      />
      */}
    </Tab.Navigator>
  );
};

// 루트 스택 네비게이터 (Splash → Login → Main)
export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
        />
        <Stack.Screen 
          name="AIChat" 
          component={AIChatScreen}
          options={{ 
            headerShown: true,
            title: 'AI 채팅',
            headerBackTitle: '뒤로'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
