import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

export interface FamilyMember {
  user_id: string;
  name: string;
  last_activity: string | null;
  perms: {
    read: boolean;
    alerts: boolean;
  };
}

export interface InviteRequest {
  user_id: string;
  perms?: {
    read: boolean;
    alerts: boolean;
  };
}

export function useFamilyMembers() {
  return useQuery({
    queryKey: ['family', 'members'],
    queryFn: async (): Promise<{ members: FamilyMember[] }> => {
      const response = await apiClient.get<{
        ok: boolean;
        data?: { members: FamilyMember[] };
        error?: any;
      }>('/v1/family/members');

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '가족 목록을 불러올 수 없어요.');
      }

      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10분
  });
}

export function useInviteFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: InviteRequest): Promise<{ invite_token: string; message: string }> => {
      const response = await apiClient.post<{
        ok: boolean;
        data?: { invite_token: string; message: string };
        error?: any;
      }>('/v1/family/invite', request);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '가족 초대에 실패했어요.');
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
    },
  });
}
