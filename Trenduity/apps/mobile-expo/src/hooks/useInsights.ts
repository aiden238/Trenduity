import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

/**
 * 인사이트 목록 아이템 타입
 */
export interface InsightListItem {
  id: string;
  date: string;
  topic: string;
  title: string;
  summary: string;
  source?: string;
}

/**
 * 참고 자료 타입
 */
export interface Reference {
  title: string;
  url: string;
}

/**
 * 인사이트 상세 타입
 */
export interface InsightDetail extends InsightListItem {
  body: string;
  impact: string;
  references: Reference[];
}

/**
 * 인사이트 목록 조회 훅
 * 
 * GET /v1/insights
 */
export function useInsightList(
  topic?: string,
  range: 'weekly' | 'monthly' = 'weekly'
) {
  return useQuery<InsightListItem[]>({
    queryKey: ['insights', topic, range],
    queryFn: async () => {
      const params = new URLSearchParams({ range });
      if (topic) params.append('topic', topic);
      
      const response = await apiClient.get<{
        ok: boolean;
        data: { insights: InsightListItem[]; total: number };
      }>(`/v1/insights?${params}`);
      
      if (!response.data.ok) {
        throw new Error('인사이트를 불러올 수 없어요.');
      }
      
      return response.data.data.insights;
    },
    staleTime: 1000 * 60 * 15, // 15분 (인사이트는 주간/월간 데이터, 덜 자주 변경)
    gcTime: 1000 * 60 * 60, // 1시간
  });
}

/**
 * 인사이트 상세 조회 훅
 * 
 * GET /v1/insights/:id
 */
export function useInsightDetail(insightId: string) {
  return useQuery<InsightDetail>({
    queryKey: ['insight', insightId],
    queryFn: async () => {
      const response = await apiClient.get<{
        ok: boolean;
        data: { insight: InsightDetail };
      }>(`/v1/insights/${insightId}`);
      
      if (!response.data.ok) {
        throw new Error('상세 정보를 불러올 수 없어요.');
      }
      
      return response.data.data.insight;
    },
    enabled: !!insightId,
    staleTime: 1000 * 60 * 15, // 15분
  });
}

/**
 * 주제 팔로우 훅
 * 
 * POST /v1/insights/follow
 */
export function useFollowTopic() {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, Error, string>({
    mutationFn: async (topic: string) => {
      const response = await apiClient.post<{
        ok: boolean;
        data: { is_following: boolean };
      }>('/v1/insights/follow', { topic });
      
      if (!response.data.ok) {
        throw new Error('팔로우 처리에 실패했어요.');
      }
      
      return response.data.data.is_following;
    },
    onSuccess: () => {
      // 팔로우 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

/**
 * 팔로우 중인 주제 목록 훅
 * 
 * GET /v1/insights/following
 */
export function useFollowingTopics() {
  return useQuery<string[]>({
    queryKey: ['following'],
    queryFn: async () => {
      const response = await apiClient.get<{
        ok: boolean;
        data: { topics: string[] };
      }>('/v1/insights/following');
      
      if (!response.data.ok) {
        throw new Error('팔로우 목록을 불러올 수 없어요.');
      }
      
      return response.data.data.topics;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}
