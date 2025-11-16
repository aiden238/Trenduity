import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

/**
 * 액션 타입
 */
export type ActionKind = 
  | 'contact_lookup' 
  | 'sms' 
  | 'url' 
  | 'route' 
  | 'reminder' 
  | 'unknown';

/**
 * 액션 인터페이스
 */
export interface VoiceAction {
  kind: ActionKind;
  name?: string;
  url?: string;
  route?: string;
  text?: string;
  hint?: string;
}

/**
 * 파싱된 인텐트 결과
 */
export interface ParsedIntent {
  intent: 'call' | 'sms' | 'search' | 'remind' | 'navigate' | 'open';
  slots: Record<string, any>;
  action: VoiceAction;
  summary: string;
}

/**
 * 음성 인텐트 파싱 훅
 * 
 * POST /v1/voice/intent
 */
export function useVoiceIntent() {
  return useMutation<ParsedIntent, Error, string>({
    mutationFn: async (text: string) => {
      const response = await apiClient.post<{
        ok: boolean;
        data?: ParsedIntent;
        error?: { code: string; message: string };
      }>('/v1/voice/intent', { text });
      
      if (!response.data.ok || !response.data.data) {
        throw new Error(
          response.data.error?.message || '음성 명령을 이해하지 못했어요.'
        );
      }
      
      return response.data.data;
    },
  });
}
