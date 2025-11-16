import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

/**
 * 퀴즈 질문 타입
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * 카드 페이로드 타입
 */
export interface CardPayload {
  title: string;
  tldr: string;
  body: string;
  impact: string;
  quiz: QuizQuestion[];
}

/**
 * 오늘의 카드 데이터 타입
 */
export interface TodayCard {
  id: string;
  user_id: string;
  date: string;
  type: 'ai_tools' | 'digital_safety' | 'health_info';
  payload: CardPayload;
  status: 'pending' | 'completed';
  created_at?: string;
  updated_at?: string;
}

/**
 * 카드 완료 결과 타입
 */
export interface CompleteCardResult {
  points_added: number;
  total_points: number;
  streak_days: number;
  quiz_result?: {
    correct: number;
    total: number;
    details: Array<{
      question_id: string;
      is_correct: boolean;
      explanation: string;
    }>;
  };
  new_badges: string[];
}

/**
 * 오늘의 카드 조회 훅
 * 
 * GET /v1/cards/today
 */
export function useTodayCard() {
  return useQuery<TodayCard>({
    queryKey: ['todayCard'],
    queryFn: async () => {
      const response = await apiClient.get<{ ok: boolean; data: { card: TodayCard } }>('/v1/cards/today');
      
      if (!response.data.ok) {
        throw new Error('카드를 불러올 수 없어요.');
      }
      
      return response.data.data.card;
    },
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분 (구 cacheTime)
  });
}

/**
 * 카드 완료 훅
 * 
 * POST /v1/cards/complete
 */
export function useCompleteCard() {
  const queryClient = useQueryClient();
  
  return useMutation<
    CompleteCardResult,
    Error,
    { cardId: string; quizAnswers?: Record<string, number> }
  >({
    mutationFn: async ({ cardId, quizAnswers }) => {
      const response = await apiClient.post<{ ok: boolean; data: CompleteCardResult }>(
        '/v1/cards/complete',
        {
          card_id: cardId,
          quiz_answers: quizAnswers,
        }
      );
      
      if (!response.data.ok) {
        throw new Error('완료 처리에 실패했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: () => {
      // 오늘의 카드 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['todayCard'] });
    },
  });
}
