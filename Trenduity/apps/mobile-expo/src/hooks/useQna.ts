import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

export interface QnaPostListItem {
  id: string;
  title: string;
  ai_summary: string;
  author_name: string;
  created_at: string;
  vote_count: number;
}

export interface QnaPostDetail {
  id: string;
  title: string;
  body: string;
  topic: string;
  author_name: string;
  created_at: string;
  vote_count: number;
}

export interface CreateQnaRequest {
  topic: 'ai_tools' | 'digital_safety' | 'health' | 'general';
  title: string;
  body: string;
  is_anon: boolean;
}

export function useQnaPosts(topic?: string) {
  return useQuery({
    queryKey: ['qna', 'list', topic],
    queryFn: async (): Promise<{ posts: QnaPostListItem[]; total: number }> => {
      const params = topic ? `?topic=${topic}` : '';
      const response = await apiClient.get<{
        ok: boolean;
        data?: { posts: QnaPostListItem[]; total: number };
        error?: any;
      }>(`/v1/qna${params}`);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || 'Q&A 목록을 불러올 수 없어요.');
      }

      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useQnaPostDetail(postId: string) {
  return useQuery({
    queryKey: ['qna', 'detail', postId],
    queryFn: async (): Promise<QnaPostDetail> => {
      const response = await apiClient.get<{
        ok: boolean;
        data?: { post: QnaPostDetail };
        error?: any;
      }>(`/v1/qna/${postId}`);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '질문을 불러올 수 없어요.');
      }

      return response.data.data.post;
    },
    enabled: !!postId,
    staleTime: 10 * 60 * 1000, // 10분
  });
}

export function useCreateQna() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateQnaRequest): Promise<{ post_id: string }> => {
      const response = await apiClient.post<{
        ok: boolean;
        data?: { post_id: string };
        error?: any;
      }>('/v1/qna', request);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '질문을 작성할 수 없어요.');
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qna', 'list'] });
    },
  });
}
