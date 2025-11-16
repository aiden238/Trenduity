import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

export type ToolStepStatus = 'not_started' | 'in_progress' | 'done';

export interface ToolStep {
  step: number;
  title: string;
  description: string;
  status: ToolStepStatus;
}

export interface ToolProgress {
  tool: string;
  steps: ToolStep[];
}

export interface UpdateProgressRequest {
  tool: string;
  step: number;
  status: 'in_progress' | 'done';
}

export interface UpdateProgressResult {
  points_added: number;
  total_points: number;
}

export function useToolProgress(tool: string) {
  return useQuery({
    queryKey: ['toolProgress', tool],
    queryFn: async (): Promise<ToolProgress> => {
      const response = await apiClient.get<{ ok: boolean; data?: ToolProgress; error?: any }>(
        `/v1/tools/progress?tool=${tool}`
      );

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '진행 상황을 불러올 수 없어요.');
      }

      return response.data.data;
    },
    enabled: !!tool,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useUpdateToolProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateProgressRequest): Promise<UpdateProgressResult> => {
      const response = await apiClient.post<{
        ok: boolean;
        data?: UpdateProgressResult;
        error?: any;
      }>('/v1/tools/progress', request);

      if (!response.data.ok || !response.data.data) {
        throw new Error(response.data.error?.message || '업데이트에 실패했어요.');
      }

      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['toolProgress', variables.tool] });
    },
  });
}
