import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';

const BFF_URL = process.env.EXPO_PUBLIC_BFF_API_URL || 'https://trenduity-bff.onrender.com';

export interface UsageSummary {
  model_id: string;
  used_count: number;
  limit: number;
  remaining: number;
}

export interface SubscriptionInfo {
  plan_type: 'free' | 'economy' | 'standard' | 'premium';
  plan_name: string;
  plan_price: number;
  plan_features: string[];
  is_active: boolean;
  expires_at: string | null;
  usage: Record<string, UsageSummary>;
  can_use_fintech: boolean;
  can_use_coaching: boolean;
}

export interface PlanInfo {
  plan_type: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  limits: Record<string, number>;
}

export interface PlansResponse {
  plans: PlanInfo[];
  addon: PlanInfo;
}

// 내 구독 정보 조회
export const useMySubscription = () => {
  const { accessToken } = useAuth();
  
  return useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: async (): Promise<SubscriptionInfo> => {
      const response = await fetch(`${BFF_URL}/v1/subscriptions/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || '구독 정보를 불러오지 못했어요');
      return data.data;
    },
    enabled: !!accessToken,
    staleTime: 60 * 1000, // 1분
  });
};

// 사용 가능한 플랜 목록 조회
export const usePlans = () => {
  const { accessToken } = useAuth();
  
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: async (): Promise<PlansResponse> => {
      const response = await fetch(`${BFF_URL}/v1/subscriptions/plans`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || '플랜 정보를 불러오지 못했어요');
      return data.data;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// AI 사용 가능 여부 확인
export const useCheckUsage = () => {
  const { accessToken } = useAuth();
  
  return useMutation({
    mutationFn: async (modelId: string) => {
      const response = await fetch(`${BFF_URL}/v1/subscriptions/check-usage?model_id=${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || '사용량 확인에 실패했어요');
      return data.data;
    },
  });
};

// AI 사용량 기록
export const useRecordUsage = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (modelId: string) => {
      const response = await fetch(`${BFF_URL}/v1/subscriptions/record-usage?model_id=${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || '사용량 기록에 실패했어요');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'me'] });
    },
  });
};

// 플랜 업그레이드
export const useUpgradePlan = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planType: string) => {
      const response = await fetch(`${BFF_URL}/v1/subscriptions/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_type: planType }),
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || '업그레이드에 실패했어요');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

// 추가 도우미 구매
export const usePurchaseAddon = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${BFF_URL}/v1/subscriptions/purchase-addon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || '추가 도우미 구매에 실패했어요');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};
