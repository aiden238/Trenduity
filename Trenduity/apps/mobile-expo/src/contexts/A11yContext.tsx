import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { A11yMode, getA11yTokens } from '../tokens/a11y';

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
  scaleAnim: Animated.Value; // 애니메이션 값
}

const A11yContext = createContext<A11yContextValue | undefined>(undefined);

const A11Y_MODE_KEY = '@a11y_mode';

export const A11yProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<A11yMode>('normal');
  const tokens = getA11yTokens(mode);
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      // 애니메이션: 축소 → 확대
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

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
        scaleAnim,
      }}
    >
      {children}
    </A11yContext.Provider>
  );
};

export const useA11y = (): A11yContextValue => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within A11yProvider');
  }
  return context;
};
