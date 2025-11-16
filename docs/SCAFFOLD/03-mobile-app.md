# 03. Mobile App - Expo React Native 스켈레톤

> 모바일 앱의 기본 구조 및 더미 화면 생성

---

## 📋 목표

- Expo React Native 앱 초기화
- React Navigation 설정 (Bottom Tabs)
- 주요 화면 더미 구현 (8개)
- A11y Context 및 TTS 훅 스텁
- Supabase 클라이언트 설정 스텁

---

## 🗂️ 폴더 구조

```
apps/mobile-expo/
├── src/
│   ├── screens/
│   │   ├── Home/
│   │   │   ├── HomeAScreen.tsx      # 일반 홈
│   │   │   └── HomeCScreen.tsx      # 초간단 홈
│   │   ├── Insights/
│   │   │   ├── InsightListScreen.tsx
│   │   │   └── InsightDetailScreen.tsx
│   │   ├── Courses/
│   │   │   ├── CourseListScreen.tsx
│   │   │   └── CourseTaskScreen.tsx
│   │   ├── MedCheck/
│   │   │   └── MedCheckScreen.tsx
│   │   ├── Community/
│   │   │   ├── QnaListScreen.tsx
│   │   │   └── QnaCreateScreen.tsx
│   │   └── Settings/
│   │       └── SettingsScreen.tsx
│   ├── contexts/
│   │   └── A11yContext.tsx          # 접근성 컨텍스트
│   ├── hooks/
│   │   ├── useTTS.ts                # TTS 훅
│   │   └── useSupabase.ts           # Supabase 훅
│   ├── navigation/
│   │   └── RootNavigator.tsx        # 메인 네비게이션
│   ├── config/
│   │   └── supabase.ts              # Supabase 클라이언트
│   └── types/
│       └── navigation.ts            # 네비게이션 타입
├── App.tsx                          # 엔트리 포인트
├── app.json                         # Expo 설정
├── package.json
├── tsconfig.json
└── metro.config.js                  # Metro 번들러 설정
```

---

## 📄 파일별 상세 내용

### package.json

```json
{
  "name": "mobile-expo",
  "version": "0.1.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "expo": "~49.0.0",
    "expo-speech": "~11.3.0",
    "expo-status-bar": "~1.6.0",
    "react": "18.2.0",
    "react-native": "0.72.6",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/bottom-tabs": "^6.5.8",
    "@supabase/supabase-js": "^2.38.0",
    "react-native-url-polyfill": "^2.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "@repo/ui": "*",
    "@repo/types": "*"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.14",
    "typescript": "^5.1.3"
  }
}
```

---

### app.json

```json
{
  "expo": {
    "name": "시니어학습앱",
    "slug": "senior-learning-app",
    "version": "0.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.seniorlearning.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.seniorlearning.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

---

### tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-native",
    "lib": ["ES2020"],
    "strict": true
  },
  "include": ["src/**/*", "App.tsx"],
  "exclude": ["node_modules"]
}
```

---

### metro.config.js

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo: packages 폴더 인식
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
```

---

### App.tsx

```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { A11yProvider } from './src/contexts/A11yContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <A11yProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </A11yProvider>
  );
}
```

---

### src/contexts/A11yContext.tsx

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { A11yMode } from '@repo/ui';

interface A11yContextType {
  mode: A11yMode;
  setMode: (mode: A11yMode) => void;
}

const A11yContext = createContext<A11yContextType | undefined>(undefined);

export const A11yProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<A11yMode>('normal');

  // TODO(IMPLEMENT): AsyncStorage에서 초기값 로드
  // TODO(IMPLEMENT): 모드 변경 시 AsyncStorage에 저장

  return (
    <A11yContext.Provider value={{ mode, setMode }}>
      {children}
    </A11yContext.Provider>
  );
};

export const useA11y = (): A11yContextType => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within A11yProvider');
  }
  return context;
};
```

---

### src/hooks/useTTS.ts

```typescript
import { useCallback } from 'react';
import * as Speech from 'expo-speech';

export interface TTSOptions {
  language?: string;
  pitch?: number;
  rate?: number;
}

export const useTTS = () => {
  const speak = useCallback((text: string, options?: TTSOptions) => {
    // TODO(IMPLEMENT): 사용자 설정(속도, 피치)에서 옵션 로드
    Speech.speak(text, {
      language: options?.language || 'ko-KR',
      pitch: options?.pitch || 1.0,
      rate: options?.rate || 1.0,
    });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  return { speak, stop };
};
```

---

### src/hooks/useSupabase.ts

```typescript
import { useCallback } from 'react';
import { supabase } from '../config/supabase';

/**
 * Supabase 훅 (스텁)
 * 
 * TODO(IMPLEMENT): 실제 쿼리 로직 구현
 */
export const useSupabase = () => {
  const fetchCards = useCallback(async () => {
    // TODO: 실제 Supabase 쿼리
    console.log('[TODO] fetchCards: Supabase query not implemented');
    return [];
  }, []);

  const fetchInsights = useCallback(async (topic: string) => {
    // TODO: 실제 Supabase 쿼리
    console.log(`[TODO] fetchInsights(${topic}): Supabase query not implemented`);
    return [];
  }, []);

  return { fetchCards, fetchInsights };
};
```

---

### src/config/supabase.ts

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO(IMPLEMENT): 환경변수에서 로드
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

### src/navigation/RootNavigator.tsx

```typescript
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
```

---

### src/screens/Home/HomeAScreen.tsx

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Button, Card } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';
import { useTTS } from '../../hooks/useTTS';

/**
 * 일반 홈 화면 (normal/easy 모드)
 * 
 * TODO(IMPLEMENT): 실제 카드 데이터 로드
 * TODO(IMPLEMENT): 복약 체크 버튼
 * TODO(IMPLEMENT): 음성 인텐트 버튼
 */
export const HomeAScreen = () => {
  const { mode } = useA11y();
  const { speak } = useTTS();

  const handleCardPress = () => {
    console.log('[TODO] Navigate to card detail');
  };

  const handleTTS = () => {
    speak('오늘의 한 가지 카드입니다');
  };

  return (
    <View style={styles.container}>
      <Typography variant="heading" mode={mode}>
        오늘의 한 가지
      </Typography>

      <Card mode={mode} style={styles.card}>
        <Typography variant="title" mode={mode}>
          AI 트렌드: 챗GPT 활용법
        </Typography>
        <Typography variant="body" mode={mode} style={styles.tldr}>
          TL;DR: 챗GPT로 이메일 작성하는 방법을 배워봅시다.
        </Typography>
      </Card>

      <Button mode={mode} onPress={handleCardPress} style={styles.button}>
        카드 읽기
      </Button>

      <Button
        mode={mode}
        variant="secondary"
        onPress={handleTTS}
        style={styles.button}
      >
        음성으로 듣기
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  card: {
    marginVertical: 16,
  },
  tldr: {
    marginTop: 8,
  },
  button: {
    marginTop: 8,
  },
});
```

---

### src/screens/Home/HomeCScreen.tsx

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Button } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';

/**
 * 초간단 홈 화면 (ultra 모드)
 * 버튼 3개만: 카드, 복약, 음성
 * 
 * TODO(IMPLEMENT): 버튼 액션 구현
 */
export const HomeCScreen = () => {
  const { mode } = useA11y();

  return (
    <View style={styles.container}>
      <Typography variant="heading" mode={mode} style={styles.title}>
        오늘 할 일
      </Typography>

      <Button mode={mode} onPress={() => console.log('[TODO] 카드 읽기')}>
        오늘의 카드
      </Button>

      <Button
        mode={mode}
        onPress={() => console.log('[TODO] 복약 체크')}
        style={styles.button}
      >
        약 먹기 체크
      </Button>

      <Button
        mode={mode}
        variant="secondary"
        onPress={() => console.log('[TODO] 음성 기능')}
        style={styles.button}
      >
        말하기
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    marginTop: 16,
  },
});
```

---

### src/screens/Insights/InsightListScreen.tsx

```typescript
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Typography, Card } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';

/**
 * 인사이트 목록 화면
 * 
 * TODO(IMPLEMENT): 실제 데이터 로드
 * TODO(IMPLEMENT): 토픽 필터
 */
export const InsightListScreen = () => {
  const { mode } = useA11y();

  // Dummy data
  const insights = [
    { id: '1', title: 'AI 기초 이해하기', topic: 'ai' },
    { id: '2', title: '애플의 최신 발표', topic: 'bigtech' },
  ];

  return (
    <View style={styles.container}>
      <Typography variant="heading" mode={mode}>
        인사이트 허브
      </Typography>

      <FlatList
        data={insights}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card mode={mode} style={styles.card}>
            <Typography variant="body" mode={mode}>
              {item.title}
            </Typography>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  card: {
    marginTop: 12,
  },
});
```

---

### src/screens/Insights/InsightDetailScreen.tsx

```typescript
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography, Button } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';
import { useTTS } from '../../hooks/useTTS';

/**
 * 인사이트 상세 화면
 * 
 * TODO(IMPLEMENT): 실제 데이터 로드
 * TODO(IMPLEMENT): 반응 버튼
 */
export const InsightDetailScreen = () => {
  const { mode } = useA11y();
  const { speak } = useTTS();

  const handleTTS = () => {
    speak('인사이트 본문입니다');
  };

  return (
    <ScrollView style={styles.container}>
      <Typography variant="heading" mode={mode}>
        AI 기초 이해하기
      </Typography>

      <Typography variant="body" mode={mode} style={styles.body}>
        인공지능(AI)은 컴퓨터가 사람처럼 학습하고 판단하는 기술입니다...
      </Typography>

      <Button mode={mode} onPress={handleTTS} style={styles.button}>
        음성으로 듣기
      </Button>

      <Button
        mode={mode}
        variant="secondary"
        onPress={() => console.log('[TODO] 도움됐어요 반응')}
        style={styles.button}
      >
        도움됐어요
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  body: {
    marginVertical: 16,
  },
  button: {
    marginTop: 8,
  },
});
```

---

### 나머지 더미 화면 (간략)

**src/screens/Courses/CourseListScreen.tsx**
```typescript
// TODO: 도구 트랙 목록 (미리캔버스, 캔바, 소라)
```

**src/screens/Courses/CourseTaskScreen.tsx**
```typescript
// TODO: 트랙 단계별 작업 화면
```

**src/screens/MedCheck/MedCheckScreen.tsx**
```typescript
// TODO: 복약 체크 화면 (큰 버튼 하나)
```

**src/screens/Community/QnaListScreen.tsx**
```typescript
// TODO: Q&A 목록
```

**src/screens/Community/QnaCreateScreen.tsx**
```typescript
// TODO: Q&A 작성 화면
```

**src/screens/Settings/SettingsScreen.tsx**
```typescript
// TODO: 접근성 모드 선택, 프로필 정보
```

---

## ✅ 작업 체크리스트

### 초기 설정
- [ ] Expo 앱 초기화
- [ ] package.json 설정
- [ ] app.json 설정
- [ ] tsconfig.json 설정
- [ ] metro.config.js 설정

### 컨텍스트 & 훅
- [ ] A11yContext 생성
- [ ] useTTS 훅 생성
- [ ] useSupabase 훅 스텁 생성

### 네비게이션
- [ ] RootNavigator 설정 (Bottom Tabs)

### 화면 (8개)
- [ ] HomeAScreen (일반 홈)
- [ ] HomeCScreen (초간단 홈)
- [ ] InsightListScreen
- [ ] InsightDetailScreen
- [ ] CourseListScreen
- [ ] CourseTaskScreen
- [ ] MedCheckScreen
- [ ] QnaListScreen
- [ ] QnaCreateScreen
- [ ] SettingsScreen

### 통합 테스트
- [ ] `npm start` 실행 성공
- [ ] iOS/Android 시뮬레이터에서 앱 실행
- [ ] 모든 탭 이동 가능
- [ ] 버튼 클릭 시 콘솔 로그 확인

---

## 🔗 다음 단계

모바일 앱 스켈레톤이 완료되면 **[04-web-console.md](./04-web-console.md)**로 이동하여 웹 콘솔을 구성합니다.

---

**작성일**: 2025년 11월 13일  
**작성자**: AI Scaffolding Assistant
