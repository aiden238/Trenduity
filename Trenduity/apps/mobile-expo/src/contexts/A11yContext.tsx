import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { A11yMode, getA11yTokens } from '@repo/ui';

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

export const A11yProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
};

export const useA11y = (): A11yContextValue => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within A11yProvider');
  }
  return context;
};
