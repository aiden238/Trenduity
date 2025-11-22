import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

/**
 * 가족 멤버 정보 타입
 */
export interface FamilyMember {
  user_id: string;
  name: string;
  last_activity: string | null;
  perms: {
    read: boolean;
    alerts: boolean;
  };
}

/**
 * 가족 초대 요청 타입
 */
export interface InviteRequest {
  user_id: string;
  perms?: {
    read: boolean;
    alerts: boolean;
  };
}

/**
 * 가족 초대 응답 타입
 */
export interface InviteResponse {
  invite_token: string;
  message: string;
}

/**
 * Family Link 관련 API 훅
 * 
 * BFF API 연동:
 * - GET /v1/family/members: 연결된 가족 목록 조회
 * - POST /v1/family/invite: 가족 초대 링크 생성
 */
export function useFamilyLink() {
  const queryClient = useQueryClient();

  // 가족 멤버 목록 조회
  const {
    data: membersData,
    isLoading: isMembersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ['family', 'members'],
    queryFn: async () => {
      const response = await apiClient.get<{
        ok: boolean;
        data: { members: FamilyMember[] };
        error?: { code: string; message: string };
      }>('/v1/family/members');

      if (!response.data.ok) {
        throw new Error(response.data.error?.message || '가족 목록을 가져올 수 없어요.');
      }

      return response.data.data.members;
    },
    retry: 1,
  });

  // 가족 초대 링크 생성
  const inviteMutation = useMutation({
    mutationFn: async (request: InviteRequest) => {
      const response = await apiClient.post<{
        ok: boolean;
        data: InviteResponse;
        error?: { code: string; message: string };
      }>('/v1/family/invite', request);

      if (!response.data.ok) {
        throw new Error(response.data.error?.message || '초대 링크를 만들 수 없어요.');
      }

      return response.data.data;
    },
    onSuccess: () => {
      // 성공 시 가족 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
    },
  });

  return {
    // 가족 멤버 목록
    members: membersData || [],
    isMembersLoading,
    membersError: membersError as Error | null,
    refetchMembers,

    // 가족 초대
    inviteFamily: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
    inviteError: inviteMutation.error as Error | null,
  };
}
