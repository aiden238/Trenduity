import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Supabase Realtime 구독 훅 (Web)
 * 
 * 가족 대시보드에서 실시간 활동 모니터링
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

    // 고유한 채널 이름 생성
    const channelName = `dashboard_${configs.map(c => c.table).join('_')}`;
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

    // 클린업
    return () => {
      console.log(`[Realtime] Unsubscribing from ${channelName}`);
      channel.unsubscribe();
    };
  }, [configs]);

  return null;
};

/**
 * 가족 멤버 활동 구독 훅
 * 
 * 여러 가족 멤버의 활동(카드 완료, 복약 체크)를 실시간으로 모니터링
 * @param memberIds - 모니터링할 가족 멤버 ID 배열
 */
export const useFamilyActivitySubscription = (
  memberIds: string[],
  onActivity: (activity: { type: string; userId: string; data: any }) => void
) => {
  const configs: RealtimeConfig[] = [];

  // 각 멤버의 카드 완료 이벤트 구독
  memberIds.forEach((userId) => {
    configs.push({
      table: 'completed_cards',
      event: 'INSERT',
      filter: `user_id=eq.${userId}`,
      callback: (payload) =>
        onActivity({
          type: 'card_completed',
          userId,
          data: payload.new,
        }),
    });

    configs.push({
      table: 'med_checks',
      event: 'INSERT',
      filter: `user_id=eq.${userId}`,
      callback: (payload) =>
        onActivity({
          type: 'med_check',
          userId,
          data: payload.new,
        }),
    });
  });

  useRealtimeSubscription(configs);
};

/**
 * 사용량 통계 구독 훅
 * 
 * usage_counters 테이블의 변경사항을 실시간으로 수신
 * @param userId - 모니터링할 사용자 ID
 */
export const useUsageCounterSubscription = (
  userId: string | null,
  onUpdate: (counter: any) => void
) => {
  useRealtimeSubscription(
    userId
      ? [
          {
            table: 'usage_counters',
            event: 'UPDATE',
            filter: `user_id=eq.${userId}`,
            callback: (payload) => onUpdate(payload.new),
          },
        ]
      : []
  );
};
