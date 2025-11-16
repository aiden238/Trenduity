import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeAScreen } from '../screens/Home/HomeAScreen';
import { InsightListScreen } from '../screens/Insights/InsightListScreen';
import { CourseListScreen } from '../screens/Courses/CourseListScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarLabelStyle: { fontSize: 14 },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeAScreen}
          options={{ title: '홈' }}
        />
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
          name="Settings"
          component={SettingsScreen}
          options={{ title: '설정' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
