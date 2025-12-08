import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { SplashScreen } from '../screens/Auth/SplashScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { SignupScreen } from '../screens/Auth/SignupScreen';
import { HomeAScreen } from '../screens/Home/HomeAScreen';
import { AIChatScreen } from '../screens/Chat/AIChatScreen';
import { EmergencySupportScreen } from '../screens/Support/EmergencySupportScreen';
import { InsightListScreen } from '../screens/Insights/InsightListScreen';
import { InsightDetailScreen } from '../screens/Insights/InsightDetailScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { QnaListScreen } from '../screens/Community/QnaListScreen';
import { QnaDetailScreen } from '../screens/Community/QnaDetailScreen';
import { QnaCreateScreen } from '../screens/Community/QnaCreateScreen';
import { ScamCheckScreen } from '../screens/Tools/ScamCheckScreen';
import { MedCheckScreen } from '../screens/MedCheck/MedCheckScreen';
import { TermsScreen } from '../screens/Legal/TermsScreen';
import { PrivacyScreen } from '../screens/Legal/PrivacyScreen';
// 새 화면들
import { ExpenseTrackerScreen } from '../screens/Tools/ExpenseTrackerScreen';
import { MapNavigatorScreen } from '../screens/Tools/MapNavigatorScreen';
import { GovSupportScreen } from '../screens/Tools/GovSupportScreen';
import { TodoMemoScreen } from '../screens/Tools/TodoMemoScreen';
import { SubscriptionScreen } from '../screens/Settings/SubscriptionScreen';
import { SideIncomeScreen } from '../screens/Finance/SideIncomeScreen';
import { AdminScreen } from '../screens/Admin/AdminScreen';
import { COLORS } from '../tokens/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 탭 아이콘 컴포넌트
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
  </View>
);

// 메인 탭 네비게이터
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarLabelStyle: { 
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarActiveTintColor: COLORS.primary.main,
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeAScreen}
        options={{ 
          title: '홈',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightListScreen}
        options={{ 
          title: '오늘의 배움',
          tabBarIcon: ({ focused }) => <TabIcon icon="📚" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Community"
        component={QnaListScreen}
        options={{ 
          title: '배움의 나눔터',
          tabBarIcon: ({ focused }) => <TabIcon icon="🤝" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Finance"
        component={SideIncomeScreen}
        options={{ 
          title: '재테크',
          tabBarIcon: ({ focused }) => <TabIcon icon="💰" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ 
          title: '마이페이지',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
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
          name="Signup" 
          component={SignupScreen} 
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
            title: 'AI 도우미',
            headerBackTitle: '뒤로'
          }}
        />
        <Stack.Screen 
          name="EmergencySupport" 
          component={EmergencySupportScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="QnaDetail" 
          component={QnaDetailScreen}
          options={{ 
            headerShown: true,
            title: 'Q&A 상세',
            headerBackTitle: '뒤로'
          }}
        />
        <Stack.Screen 
          name="InsightDetail" 
          component={InsightDetailScreen}
          options={{ 
            headerShown: true,
            title: '오늘의 배움 상세',
            headerBackTitle: '뒤로'
          }}
        />
        <Stack.Screen 
          name="ScamCheck" 
          component={ScamCheckScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="MedCheck" 
          component={MedCheckScreen}
          options={{ 
            headerShown: true,
            title: '복약 체크',
            headerBackTitle: '뒤로'
          }}
        />
        <Stack.Screen 
          name="QnaCreate" 
          component={QnaCreateScreen}
          options={{ 
            headerShown: true,
            title: '질문 작성',
            headerBackTitle: '뒤로'
          }}
        />
        <Stack.Screen 
          name="Terms" 
          component={TermsScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Privacy" 
          component={PrivacyScreen}
          options={{ 
            headerShown: false,
          }}
        />
        {/* 새 화면들 */}
        <Stack.Screen 
          name="ExpenseTracker" 
          component={ExpenseTrackerScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="MapNavigator" 
          component={MapNavigatorScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="GovSupport" 
          component={GovSupportScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="TodoMemo" 
          component={TodoMemoScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Subscription" 
          component={SubscriptionScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{ 
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
