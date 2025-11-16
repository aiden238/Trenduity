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
