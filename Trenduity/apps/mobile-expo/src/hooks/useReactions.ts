import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';

export type ReactionKind = 'cheer' | 'useful' | 'like';
export type TargetType = 'card' | 'insight' | 'course' | 'qna_post';

export interface ReactionStats {
  count: number;
  user_reacted: boolean;
}

export interface ToggleReactionRequest {
  target_type: TargetType;
  target_id: string;
  kind: ReactionKind;
}

export interface ToggleReactionResult {
  action: 'added' | 'removed';
  total_count: number;
}

export function useReactions(targetType: TargetType, targetId: string) {
  return useQuery({
    queryKey: ['reactions', targetType, targetId],
    queryFn: async (): Promise<Record<string, ReactionStats>> => {
      const response = await apiClient.get<{
        ok: boolean;
        data?: { reactions: Record<string, ReactionStats> };
        error?: any;
      }>(`/v1/reactions?target_type=${targetType}&target_id=${targetId}`);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '리액션을 불러올 수 없어요.');
      }

      return response.data.data.reactions;
    },
    enabled: !!targetType && !!targetId,
    staleTime: 2 * 60 * 1000, // 2분
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ToggleReactionRequest): Promise<ToggleReactionResult> => {
      const response = await apiClient.post<{
        ok: boolean;
        data?: ToggleReactionResult;
        error?: any;
      }>('/v1/reactions', request);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '리액션을 처리할 수 없어요.');
      }

      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['reactions', variables.target_type, variables.target_id],
      });
    },
  });
}
