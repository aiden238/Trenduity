import React from 'react';
import { A11yProvider } from './src/contexts/A11yContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <A11yProvider>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </A11yProvider>
    </ThemeProvider>
  );
}
