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
