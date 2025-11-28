import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';

/**
 * 게임화 통계 타입
 */
export interface GamificationStats {
  points: number;
  streak: number;
  level: number;
  badges: string[];
  nextLevelPoints: number;
}

/**
 * 사용자 게임화 통계 조회 훅
 * BFF API: GET /v1/gamification/stats
 */
export function useGamification() {
  return useQuery({
    queryKey: ['gamification', 'stats'],
    queryFn: async (): Promise<GamificationStats> => {
      const response = await apiClient.get<{
        ok: boolean;
        data?: GamificationStats;
        error?: any;
      }>('/v1/gamification/stats');

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '게임화 통계를 가져올 수 없어요.');
      }

      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5분
    retry: 2,
  });
}
