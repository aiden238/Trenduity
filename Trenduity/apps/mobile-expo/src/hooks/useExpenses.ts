import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

/**
 * 지출 카테고리 타입
 */
export type ExpenseCategory = 
  | 'rent' | 'mortgage' | 'maintenance' | 'electricity' | 'gas' | 'water'
  | 'telecom' | 'tv' | 'insurance' | 'loan' | 'transport' | 'food' | 'other';

/**
 * 한글 카테고리명 매핑
 */
export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  rent: '월세',
  mortgage: '담보대출이자',
  maintenance: '관리비',
  electricity: '전기세',
  gas: '가스비',
  water: '수도세',
  telecom: '통신비',
  tv: 'TV요금',
  insurance: '보험료',
  loan: '대출이자',
  transport: '교통비',
  food: '식비',
  other: '기타',
};

/**
 * 지출 항목 타입
 */
export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  category_label: string;
  amount: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 월별 지출 요약 타입
 */
export interface MonthlyExpenseSummary {
  month: string;
  total_amount: number;
  item_count: number;
  breakdown: Record<string, number>;
  previous_month_total?: number;
  change_rate?: number;
}

/**
 * 월별 지출 응답 타입
 */
export interface ExpenseListResponse {
  month: string;
  expenses: ExpenseRecord[];
  summary: MonthlyExpenseSummary;
}

/**
 * AI 분석 응답 타입
 */
export interface ExpenseAnalysisResponse {
  month: string;
  total_amount: number;
  analysis: string;
  tips: string[];
  comparison?: string;
}

/**
 * 월별 지출 조회 훅
 * 
 * GET /v1/expenses/{month}
 */
export function useMonthlyExpenses(month: string) {
  return useQuery<ExpenseListResponse>({
    queryKey: ['expenses', month],
    queryFn: async () => {
      const response = await apiClient.get<{ ok: boolean; data: ExpenseListResponse }>(`/v1/expenses/${month}`);
      
      if (!response.data.ok) {
        throw new Error('지출 내역을 불러올 수 없어요.');
      }
      
      return response.data.data;
    },
    enabled: !!month,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 지출 추가 훅
 * 
 * POST /v1/expenses
 */
export function useAddExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      month: string;
      category: ExpenseCategory;
      amount: number;
      note?: string;
    }) => {
      const response = await apiClient.post<{ ok: boolean; data: { expense: ExpenseRecord; message: string } }>('/v1/expenses', data);
      
      if (!response.data.ok) {
        throw new Error('지출을 기록하지 못했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.month] });
    },
  });
}

/**
 * 지출 수정 훅
 * 
 * PUT /v1/expenses/{expense_id}
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      expenseId: string;
      month: string;
      amount?: number;
      note?: string;
    }) => {
      const { expenseId, month, ...updateData } = data;
      const response = await apiClient.put<{ ok: boolean; data: { expense: ExpenseRecord; message: string } }>(`/v1/expenses/${expenseId}`, updateData);
      
      if (!response.data.ok) {
        throw new Error('수정하지 못했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.month] });
    },
  });
}

/**
 * 지출 삭제 훅
 * 
 * DELETE /v1/expenses/{expense_id}
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { expenseId: string; month: string }) => {
      const response = await apiClient.delete<{ ok: boolean; data: { message: string } }>(`/v1/expenses/${data.expenseId}`);
      
      if (!response.data.ok) {
        throw new Error('삭제하지 못했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.month] });
    },
  });
}

/**
 * 지출 일괄 저장 훅
 * 
 * POST /v1/expenses/bulk
 */
export function useBulkSaveExpenses() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      month: string;
      expenses: Array<{
        category: ExpenseCategory;
        amount: number;
        note?: string;
      }>;
    }) => {
      const response = await apiClient.post<{ ok: boolean; data: { saved_count: number; message: string } }>('/v1/expenses/bulk', data);
      
      if (!response.data.ok) {
        throw new Error('저장하지 못했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.month] });
    },
  });
}

/**
 * AI 지출 분석 훅
 * 
 * POST /v1/expenses/analyze
 */
export function useAnalyzeExpenses() {
  return useMutation({
    mutationFn: async (month: string) => {
      const response = await apiClient.post<{ ok: boolean; data: ExpenseAnalysisResponse }>('/v1/expenses/analyze', { month });
      
      if (!response.data.ok) {
        throw new Error('분석을 완료하지 못했어요.');
      }
      
      return response.data.data;
    },
  });
}
