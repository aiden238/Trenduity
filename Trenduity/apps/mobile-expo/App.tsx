import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { A11yProvider } from './src/contexts/A11yContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { RootNavigator } from './src/navigation/RootNavigator';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5분
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Trenduity - 50-70대 시니어 학습 앱
 * 
 * Provider 구조:
 * SafeAreaProvider → QueryClient → A11yProvider → ThemeProvider → ToastProvider → Navigation
 * 
 * 핵심 기능:
 * - 3단계 접근성 모드 (Normal/Easy/Ultra)
 * - 다크 모드 지원
 * - 음성 명령 및 TTS
 * - 게임화 시스템 (포인트, 배지, 스트릭)
 * - 가족 연동 대시보드
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <A11yProvider>
          <ThemeProvider>
            <ToastProvider>
              <RootNavigator />
            </ToastProvider>
          </ThemeProvider>
        </A11yProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
