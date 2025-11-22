import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

/**
 * Supabase Realtime 구독 훅
 * 
 * 실시간 알림, 커뮤니티 답변 등을 위한 Realtime 구독
 * 컴포넌트 언마운트 시 자동으로 구독 해제
 */

export interface RealtimeConfig {
  /** 구독할 테이블 이름 */
  table: string;
  /** 이벤트 타입 (INSERT, UPDATE, DELETE 등) */
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  /** 필터 조건 (예: eq.user_id.${userId}) */
  filter?: string;
  /** 데이터 수신 시 콜백 */
  callback: (payload: any) => void;
}

export const useRealtimeSubscription = (configs: RealtimeConfig[]) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (configs.length === 0) return;

    // 고유한 채널 이름 생성 (여러 테이블 구독 가능)
    const channelName = `realtime_${configs.map(c => c.table).join('_')}`;
    const channel = supabase.channel(channelName);

    // 각 config에 대해 구독 설정
    configs.forEach(({ table, event, filter, callback }) => {
      channel.on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          console.log(`[Realtime] ${table} ${event}:`, payload);
          callback(payload);
        }
      );
    });

    // 구독 시작
    channel.subscribe((status) => {
      console.log(`[Realtime] Channel ${channelName} status:`, status);
    });

    channelRef.current = channel;

    // 클린업: 언마운트 시 구독 해제
    return () => {
      console.log(`[Realtime] Unsubscribing from ${channelName}`);
      channel.unsubscribe();
    };
  }, [configs]);

  return null;
};

/**
 * 가족 알림 구독 훅
 * 
 * 가족 멤버의 활동 알림을 실시간으로 수신
 * @param guardianId - 보호자 ID
 */
export const useFamilyAlertsSubscription = (
  guardianId: string | null,
  onAlert: (alert: any) => void
) => {
  useRealtimeSubscription(
    guardianId
      ? [
          {
            table: 'family_alerts',
            event: 'INSERT',
            filter: `guardian_id=eq.${guardianId}`,
            callback: (payload) => onAlert(payload.new),
          },
        ]
      : []
  );
};

/**
 * Q&A 답변 구독 훅
 * 
 * 특정 Q&A 게시글의 새 답변을 실시간으로 수신
 * @param postId - Q&A 게시글 ID
 */
export const useQnaAnswersSubscription = (
  postId: string | null,
  onNewAnswer: (answer: any) => void
) => {
  useRealtimeSubscription(
    postId
      ? [
          {
            table: 'qna_answers',
            event: 'INSERT',
            filter: `post_id=eq.${postId}`,
            callback: (payload) => onNewAnswer(payload.new),
          },
        ]
      : []
  );
};

/**
 * 복약 체크 구독 훅
 * 
 * 가족 멤버의 복약 체크를 실시간으로 수신 (웹 대시보드용)
 * @param userId - 모니터링할 사용자 ID
 */
export const useMedCheckSubscription = (
  userId: string | null,
  onMedCheck: (check: any) => void
) => {
  useRealtimeSubscription(
    userId
      ? [
          {
            table: 'med_checks',
            event: 'INSERT',
            filter: `user_id=eq.${userId}`,
            callback: (payload) => onMedCheck(payload.new),
          },
        ]
      : []
  );
};
