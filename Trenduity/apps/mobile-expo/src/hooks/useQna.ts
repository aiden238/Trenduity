import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

export interface QnaPostListItem {
  id: string;
  title: string;
  body: string;
  topic: string;
  ai_summary?: string;
  author_name?: string;
  is_anon: boolean;
  created_at: string;
  reaction_count: number;
}

export interface QnaPostDetail {
  id: string;
  title: string;
  body: string;
  topic: string;
  author_name?: string;
  is_anon: boolean;
  created_at: string;
  reaction_count: number;
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
      }>(`/v1/community/qna${params}`);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || 'Q&A 목록을 불러올 수 없어요.');
      }

      return response.data.data;
    },
    staleTime: 3 * 60 * 1000, // 3분 (Q&A는 자주 변경)
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
      }>(`/v1/community/qna/${postId}`);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '질문을 불러올 수 없어요.');
      }

      return response.data.data.post;
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5분 (답변 추가 등으로 변경 가능)
  });
}

export function useCreateQna() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateQnaRequest): Promise<{ post_id: string; message: string }> => {
      const response = await apiClient.post<{
        ok: boolean;
        data?: { post_id: string; message: string };
        error?: any;
      }>('/v1/community/qna', request);

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

export interface Answer {
  id: string;
  post_id: string;
  author_id?: string;
  author_name?: string;
  body: string;
  is_anon: boolean;
  created_at: string;
}

export interface CreateAnswerRequest {
  postId: string;
  body: string;
  is_anon: boolean;
}

export function useAnswers(postId: string) {
  return useQuery({
    queryKey: ['qna', 'answers', postId],
    queryFn: async (): Promise<{ answers: Answer[]; total: number }> => {
      const response = await apiClient.get<{
        ok: boolean;
        data?: { answers: Answer[]; total: number };
        error?: any;
      }>(`/v1/community/qna/${postId}/answers`);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '답변을 불러올 수 없어요.');
      }

      return response.data.data;
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useCreateAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateAnswerRequest): Promise<{ answer_id: string; message: string }> => {
      const { postId, ...body } = request;
      const response = await apiClient.post<{
        ok: boolean;
        data?: { answer_id: string; message: string };
        error?: any;
      }>(`/v1/community/qna/${postId}/answers`, body);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '답변을 작성할 수 없어요.');
      }

      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['qna', 'answers', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['qna', 'detail', variables.postId] });
    },
  });
}

export interface AddReactionRequest {
  target_type: 'qna_post' | 'card' | 'insight';
  target_id: string;
  kind?: 'cheer' | 'useful' | 'like';
}

export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AddReactionRequest): Promise<{ added: boolean; total_reactions: number }> => {
      const response = await apiClient.post<{
        ok: boolean;
        data?: { added: boolean; total_reactions: number };
        error?: any;
      }>('/v1/community/reactions', request);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '리액션을 추가할 수 없어요.');
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qna'] });
    },
  });
}
