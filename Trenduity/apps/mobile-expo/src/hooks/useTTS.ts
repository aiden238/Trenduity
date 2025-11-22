import { useCallback, useState, useEffect } from 'react';
import * as Speech from 'expo-speech';

export interface TTSOptions {
  language?: string;
  pitch?: number;
  rate?: number;
}

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const speak = useCallback((text: string, options?: TTSOptions) => {
    // 이미 재생 중이면 중지 후 새로 시작
    if (isSpeaking) {
      Speech.stop();
    }

    setIsSpeaking(true);
    setIsPaused(false);

    Speech.speak(text, {
      language: options?.language || 'ko-KR',
      pitch: options?.pitch || 1.0,
      rate: options?.rate || 0.9, // 시니어 고려 약간 느리게
      onDone: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onStopped: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onError: (error) => {
        console.error('TTS 에러:', error);
        setIsSpeaking(false);
        setIsPaused(false);
      },
    });
  }, [isSpeaking]);

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    Speech.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    Speech.resume();
    setIsPaused(false);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return { 
    speak, 
    stop, 
    pause, 
    resume, 
    isSpeaking, 
    isPaused 
  };
};
