import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';

export type ScamLabel = 'safe' | 'warn' | 'danger';

export interface ScamCheckRequest {
  input: string;
}

export interface ScamCheckResult {
  label: ScamLabel;
  tips: string[];
}

export function useScamCheck() {
  return useMutation({
    mutationFn: async (request: ScamCheckRequest): Promise<ScamCheckResult> => {
      const response = await apiClient.post<{ ok: boolean; data?: ScamCheckResult; error?: any }>(
        '/v1/scam/check',
        request
      );

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '사기 검사에 실패했습니다.');
      }

      return response.data.data;
    },
  });
}
