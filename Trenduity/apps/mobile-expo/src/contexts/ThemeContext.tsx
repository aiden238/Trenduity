import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../tokens/colors';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ActiveTheme = 'light' | 'dark';

interface ThemeContextValue {
  themeMode: ThemeMode;
  activeTheme: ActiveTheme;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof COLORS & { dark: typeof COLORS.dark };
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_MODE_KEY = '@theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme(); // 시스템 설정 감지 (light/dark/null)
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  // 실제 적용되는 테마 계산
  const activeTheme: ActiveTheme =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themeMode === 'dark'
      ? 'dark'
      : 'light';

  // 앱 시작 시 저장된 테마 모드 불러오기
  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_MODE_KEY);
      if (saved && ['system', 'light', 'dark'].includes(saved)) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme mode:', error);
    }
  };

  const setThemeMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, newMode);
      setThemeModeState(newMode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        activeTheme,
        isDark: activeTheme === 'dark',
        setThemeMode,
        colors: COLORS,
      }}
    >
      {/* StatusBar 스타일 자동 변경 */}
      <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
