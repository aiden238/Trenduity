import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';

const BFF_URL = process.env.EXPO_PUBLIC_BFF_API_URL || 'https://trenduity-bff.onrender.com';

interface AdminStats {
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  total_ai_requests_today: number;
  total_ai_requests_week: number;
  subscription_stats: {
    FREE: number;
    BUDGET: number;
    SAFE: number;
    STRONG: number;
  };
  revenue_this_month: number;
  new_users_today: number;
  new_users_week: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'user' | 'admin' | 'super_admin';
  subscription_plan: string;
  created_at: string | null;
  last_login: string | null;
  total_ai_usage: number;
  is_active: boolean;
}

interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}

interface AIUsageStat {
  model_id: string;
  model_name: string;
  total_requests: number;
  unique_users: number;
  avg_requests_per_user: number;
}

interface Announcement {
  id: string;
  title: string;
  content_type: string;
  status: string;
  created_at: string;
  views: number;
}

/**
 * 관리자 대시보드 통계
 */
export const useAdminStats = () => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async (): Promise<AdminStats> => {
      const response = await fetch(`${BFF_URL}/v1/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error?.message || '통계를 불러오는데 실패했어요');
      }
      return data.data;
    },
    enabled: !!accessToken,
    staleTime: 60 * 1000, // 1분
  });
};

/**
 * 사용자 목록 조회
 */
export const useAdminUsers = (page: number = 1, pageSize: number = 20, search?: string, plan?: string) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['admin', 'users', page, pageSize, search, plan],
    queryFn: async (): Promise<AdminUserListResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.append('search', search);
      if (plan) params.append('plan', plan);

      const response = await fetch(`${BFF_URL}/v1/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error?.message || '사용자 목록을 불러오는데 실패했어요');
      }
      return data.data;
    },
    enabled: !!accessToken,
  });
};

/**
 * AI 사용량 통계
 */
export const useAdminAIUsage = (days: number = 7) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['admin', 'ai-usage', days],
    queryFn: async (): Promise<{ period_days: number; stats: AIUsageStat[] }> => {
      const response = await fetch(`${BFF_URL}/v1/admin/ai-usage?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error?.message || 'AI 사용량을 불러오는데 실패했어요');
      }
      return data.data;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 사용자 정보 수정
 */
export const useUpdateUser = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: { role?: string; subscription_plan?: string; is_active?: boolean } }) => {
      const response = await fetch(`${BFF_URL}/v1/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.error?.message || '사용자 정보 수정에 실패했어요');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

/**
 * 공지사항 목록
 */
export const useAdminAnnouncements = (page: number = 1, pageSize: number = 10) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['admin', 'announcements', page, pageSize],
    queryFn: async (): Promise<{ announcements: Announcement[]; total: number; page: number; page_size: number }> => {
      const response = await fetch(`${BFF_URL}/v1/admin/announcements?page=${page}&page_size=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error?.message || '공지사항을 불러오는데 실패했어요');
      }
      return data.data;
    },
    enabled: !!accessToken,
  });
};

/**
 * 공지사항 등록
 */
export const useCreateAnnouncement = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content, is_important }: { title: string; content: string; is_important?: boolean }) => {
      const response = await fetch(`${BFF_URL}/v1/admin/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, is_important }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error?.message || '공지사항 등록에 실패했어요');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    },
  });
};
