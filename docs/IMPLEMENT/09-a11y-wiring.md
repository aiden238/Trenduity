# 09. A11y Wiring (접근성 통합)

> **기능**: 접근성 모드 (normal/easy/ultra) 전체 앱 적용  
> **우선순위**: 🔴 MUST (Week 2-6, 지속적)  
> **의존성**: [01-implementation-rules.md](./01-implementation-rules.md)

---

## 📋 목표

50-70대 사용자의 **다양한 시력/인지 수준**에 맞춰 앱 전체를 조정합니다.

**핵심 가치**:
- 👀 **3단계 모드**: normal(기본), easy(쉬움), ultra(초대형)
- 🔤 **폰트 크기 조정**: 18dp ~ 32dp
- 📏 **간격/버튼 조정**: 16dp ~ 64dp
- 🎨 **고대비**: WCAG 2.1 AA 준수

---

## 🗂️ 접근성 토큰 정의

### `packages/ui/src/tokens/a11y.ts`

```typescript
// packages/ui/src/tokens/a11y.ts
export const A11Y_TOKENS = {
  normal: {
    // 폰트 크기
    fontSizes: {
      caption: 14,
      body: 16,
      heading2: 20,
      heading1: 24,
    },
    // 간격
    spacing: 16,
    // 버튼 높이
    buttonHeight: 48,
    // 아이콘 크기
    iconSize: 24,
  },
  easy: {
    fontSizes: {
      caption: 16,
      body: 20,
      heading2: 24,
      heading1: 28,
    },
    spacing: 20,
    buttonHeight: 56,
    iconSize: 28,
  },
  ultra: {
    fontSizes: {
      caption: 18,
      body: 24,
      heading2: 28,
      heading1: 32,
    },
    spacing: 24,
    buttonHeight: 64,
    iconSize: 32,
  },
};

export type A11yMode = 'normal' | 'easy' | 'ultra';

export function getA11yTokens(mode: A11yMode) {
  return A11Y_TOKENS[mode];
}
```

---

## 📱 Mobile 구현

### 1) Context: `A11yContext`

```typescript
// apps/mobile-rn/src/contexts/A11yContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { A11yMode, getA11yTokens } from '@repo/ui/tokens/a11y';

interface A11yContextValue {
  mode: A11yMode;
  setMode: (mode: A11yMode) => void;
  fontSizes: {
    caption: number;
    body: number;
    heading2: number;
    heading1: number;
  };
  spacing: number;
  buttonHeight: number;
  iconSize: number;
}

const A11yContext = createContext<A11yContextValue | undefined>(undefined);

const A11Y_MODE_KEY = '@a11y_mode';

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<A11yMode>('normal');
  const tokens = getA11yTokens(mode);
  
  // 앱 시작 시 저장된 모드 불러오기
  useEffect(() => {
    loadMode();
  }, []);
  
  const loadMode = async () => {
    try {
      const saved = await AsyncStorage.getItem(A11Y_MODE_KEY);
      if (saved && ['normal', 'easy', 'ultra'].includes(saved)) {
        setModeState(saved as A11yMode);
      }
    } catch (error) {
      console.error('Failed to load a11y mode:', error);
    }
  };
  
  const setMode = async (newMode: A11yMode) => {
    try {
      await AsyncStorage.setItem(A11Y_MODE_KEY, newMode);
      setModeState(newMode);
    } catch (error) {
      console.error('Failed to save a11y mode:', error);
    }
  };
  
  return (
    <A11yContext.Provider
      value={{
        mode,
        setMode,
        fontSizes: tokens.fontSizes,
        spacing: tokens.spacing,
        buttonHeight: tokens.buttonHeight,
        iconSize: tokens.iconSize,
      }}
    >
      {children}
    </A11yContext.Provider>
  );
}

export function useA11y() {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within A11yProvider');
  }
  return context;
}
```

### 2) App.tsx에 Provider 추가

```typescript
// apps/mobile-rn/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { A11yProvider } from './src/contexts/A11yContext';
import RootNavigator from './src/navigation/RootNavigator';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <A11yProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </A11yProvider>
    </QueryClientProvider>
  );
}
```

### 3) Settings Screen에서 모드 변경

```typescript
// apps/mobile-rn/src/screens/SettingsScreen.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Typography, Button, Card } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';

const A11Y_MODES = [
  {
    key: 'normal',
    label: '기본',
    description: '일반적인 크기로 표시해요.',
  },
  {
    key: 'easy',
    label: '쉬움',
    description: '글자와 버튼을 조금 크게 표시해요.',
  },
  {
    key: 'ultra',
    label: '초대형',
    description: '글자와 버튼을 아주 크게 표시해요.',
  },
];

export default function SettingsScreen() {
  const { mode, setMode, spacing, buttonHeight, fontSizes } = useA11y();
  
  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing }}>
        <Typography variant="heading1" fontSize={fontSizes.heading1}>
          ⚙️ 설정
        </Typography>
        
        {/* 접근성 모드 선택 */}
        <View style={{ marginTop: spacing * 2 }}>
          <Typography variant="heading2" fontSize={fontSizes.heading2}>
            화면 크기 조정
          </Typography>
          
          <Typography
            variant="body"
            fontSize={fontSizes.body}
            color="#666666"
            style={{ marginTop: spacing }}
          >
            글자와 버튼 크기를 조정할 수 있어요.
          </Typography>
          
          {A11Y_MODES.map((modeOption) => (
            <Card
              key={modeOption.key}
              style={[
                { marginTop: spacing, padding: spacing },
                mode === modeOption.key && styles.selectedCard,
              ]}
            >
              <Button
                onPress={() => setMode(modeOption.key as any)}
                variant={mode === modeOption.key ? 'primary' : 'outline'}
                height={buttonHeight}
                accessibilityLabel={`${modeOption.label} 모드`}
              >
                <View>
                  <Typography
                    variant="heading2"
                    fontSize={fontSizes.heading2}
                    color={mode === modeOption.key ? '#FFFFFF' : '#000000'}
                  >
                    {modeOption.label}
                  </Typography>
                  <Typography
                    variant="body"
                    fontSize={fontSizes.body}
                    color={mode === modeOption.key ? '#FFFFFF' : '#666666'}
                    style={{ marginTop: 4 }}
                  >
                    {modeOption.description}
                  </Typography>
                </View>
              </Button>
            </Card>
          ))}
        </View>
        
        {/* 미리보기 */}
        <Card style={{ marginTop: spacing * 2, padding: spacing, backgroundColor: '#F0F8FF' }}>
          <Typography variant="body" fontSize={fontSizes.body}>
            ✨ 미리보기: 이 화면이 바로 선택한 크기로 보여요!
          </Typography>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
});
```

---

## 🎨 UI 컴포넌트 업데이트

### Typography 컴포넌트

```typescript
// packages/ui/src/components/Typography.tsx
import React from 'react';
import { Text, TextStyle } from 'react-native';

interface TypographyProps {
  variant: 'caption' | 'body' | 'heading2' | 'heading1';
  fontSize?: number; // A11y Context에서 주입
  color?: string;
  style?: TextStyle;
  children: React.ReactNode;
  numberOfLines?: number;
}

export function Typography({
  variant,
  fontSize,
  color = '#000000',
  style,
  children,
  numberOfLines,
}: TypographyProps) {
  const baseStyles: Record<string, TextStyle> = {
    caption: { fontWeight: '400' },
    body: { fontWeight: '400', lineHeight: fontSize ? fontSize * 1.5 : 24 },
    heading2: { fontWeight: '600' },
    heading1: { fontWeight: '700' },
  };
  
  return (
    <Text
      style={[
        baseStyles[variant],
        {
          fontSize: fontSize || 16,
          color,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
```

### Button 컴포넌트

```typescript
// packages/ui/src/components/Button.tsx
import React from 'react';
import { TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Typography } from './Typography';

interface ButtonProps {
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  height?: number; // A11y Context에서 주입
  style?: ViewStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
  children: React.ReactNode;
}

export function Button({
  onPress,
  variant = 'primary',
  height = 48,
  style,
  disabled = false,
  accessibilityLabel,
  children,
}: ButtonProps) {
  const variants: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: disabled ? '#CCCCCC' : '#2196F3',
    },
    secondary: {
      backgroundColor: disabled ? '#EEEEEE' : '#F5F5F5',
    },
    outline: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: disabled ? '#CCCCCC' : '#2196F3',
    },
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          height,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
          paddingHorizontal: 16,
        },
        variants[variant],
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      {typeof children === 'string' ? (
        <Typography variant="body" color={variant === 'primary' ? '#FFFFFF' : '#000000'}>
          {children}
        </Typography>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
```

---

## ✅ 전체 화면 적용 체크리스트

모든 화면에서 다음을 확인:

### 필수 적용 사항
- [ ] `useA11y()` hook 사용
- [ ] `Typography`에 `fontSize={fontSizes.xxx}` 전달
- [ ] `Button`에 `height={buttonHeight}` 전달
- [ ] `View`의 `padding/margin`에 `spacing` 사용
- [ ] 아이콘에 `size={iconSize}` 사용

### 화면별 체크
- [ ] HomeAScreen
- [ ] TodayCardScreen
- [ ] InsightListScreen
- [ ] InsightDetailScreen
- [ ] VoiceOverlay
- [ ] ScamCheckSheet
- [ ] ToolTrackScreen
- [ ] QnAListScreen
- [ ] MedCheckScreen
- [ ] SettingsScreen

---

## 🧪 테스트 방법

### 1. 수동 테스트

```typescript
// 각 모드로 전환하며 확인
1. 설정 화면에서 "기본" 선택
   → 모든 화면 둘러보기
   → 글자가 읽기 편한지 확인

2. "쉬움" 선택
   → 모든 화면 다시 확인
   → 글자/버튼이 커졌는지 확인

3. "초대형" 선택
   → 가장 큰 크기로 모든 화면 확인
   → 레이아웃이 깨지지 않는지 확인
```

### 2. 자동 테스트 (선택사항)

```typescript
// __tests__/A11yContext.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { A11yProvider, useA11y } from '@/contexts/A11yContext';

describe('A11yContext', () => {
  it('should default to normal mode', () => {
    const { result } = renderHook(() => useA11y(), {
      wrapper: A11yProvider,
    });
    
    expect(result.current.mode).toBe('normal');
    expect(result.current.fontSizes.body).toBe(16);
  });
  
  it('should update tokens when mode changes', () => {
    const { result } = renderHook(() => useA11y(), {
      wrapper: A11yProvider,
    });
    
    act(() => {
      result.current.setMode('ultra');
    });
    
    expect(result.current.mode).toBe('ultra');
    expect(result.current.fontSizes.body).toBe(24);
    expect(result.current.buttonHeight).toBe(64);
  });
});
```

---

## 🎯 Color Contrast 체크

### WCAG 2.1 AA 기준 (4.5:1)

```typescript
// packages/ui/src/tokens/colors.ts
export const COLORS = {
  text: {
    primary: '#000000',   // 21:1 (배경 #FFFFFF)
    secondary: '#666666', // 5.74:1
    tertiary: '#999999',  // 2.85:1 (caption만, body는 사용 금지)
  },
  background: {
    primary: '#FFFFFF',
    card: '#F5F5F5',
    info: '#E3F2FD',
    warning: '#FFF3E0',
    error: '#FFEBEE',
    success: '#E8F5E9',
  },
  button: {
    primary: '#2196F3',     // 3.15:1 (흰 글자와)
    primaryText: '#FFFFFF',
    secondary: '#F5F5F5',
    secondaryText: '#000000',
  },
};
```

### 온라인 체크 도구
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools → Lighthouse → Accessibility

---

## 📝 Migration 가이드

기존 컴포넌트를 A11y 대응으로 변환:

### Before (X)
```typescript
<Text style={{ fontSize: 16 }}>안녕하세요</Text>
<TouchableOpacity style={{ height: 48 }}>
  <Text>버튼</Text>
</TouchableOpacity>
```

### After (O)
```typescript
const { fontSizes, buttonHeight } = useA11y();

<Typography variant="body" fontSize={fontSizes.body}>
  안녕하세요
</Typography>
<Button height={buttonHeight} onPress={handlePress}>
  버튼
</Button>
```

---

## ✅ 최종 체크리스트

완료 기준:

### 코드
- [ ] `A11yContext` 구현 완료
- [ ] `App.tsx`에 Provider 추가
- [ ] 설정 화면에서 모드 변경 가능
- [ ] 모든 화면이 `useA11y()` 사용
- [ ] Typography/Button 컴포넌트 업데이트

### 테스트
- [ ] 3가지 모드 모두 수동 테스트 완료
- [ ] 모든 화면에서 레이아웃 깨짐 없음
- [ ] 버튼 터치 영역 충분 (≥48dp)
- [ ] Color contrast 4.5:1 이상

### 문서
- [ ] README에 A11y 사용법 추가
- [ ] 디자이너에게 토큰 값 공유
- [ ] QA 팀에 테스트 가이드 전달

---

## 🔗 관련 문서

- **이전 단계**: [08. Family & Med Check](./08-family-med-check.md)
- **전체 목차**: [IMPLEMENT Index](./index.md)
- **기획 문서**: [PLAN - Accessibility](../PLAN/02-3-domain-&-feature-decomposition.md#9-accessibility-a11y)

---

**문서 작성**: AI Implementation Guide  
**최종 업데이트**: 2025년 11월 13일
