import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

export interface DayStatus {
  date: string;
  checked: boolean;
}

export interface MedStatusData {
  last_7_days: DayStatus[];
  total_this_month: number;
}

export interface MedCheckResult {
  checked: boolean;
  message: string;
  points_added: number;
  total_points: number;
}

export function useMedStatus() {
  return useQuery({
    queryKey: ['med', 'status'],
    queryFn: async (): Promise<MedStatusData> => {
      const response = await apiClient.get<{
        ok: boolean;
        data?: MedStatusData;
        error?: any;
      }>('/v1/med/status');

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '복약 상태를 불러올 수 없어요.');
      }

      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2분
  });
}

export function useCreateMedCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<MedCheckResult> => {
      const response = await apiClient.post<{
        ok: boolean;
        data?: MedCheckResult;
        error?: any;
      }>('/v1/med/check');

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '복약 체크에 실패했어요.');
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['med', 'status'] });
    },
  });
}
