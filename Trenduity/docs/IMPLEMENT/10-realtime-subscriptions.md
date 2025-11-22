# 10. Supabase Realtime 구독

> **기능**: 실시간 알림, 커뮤니티 답변, 가족 활동 모니터링  
> **우선순위**: 🟡 SHOULD (Week 5-6)  
> **의존성**: [01-implementation-rules.md](./01-implementation-rules.md)

---

## 📋 목표

Supabase Realtime을 활용하여 사용자 경험을 향상시키는 실시간 기능을 구현합니다.

**핵심 가치**:
- 🔔 **실시간 알림**: 가족 알림, 커뮤니티 답변 등을 즉시 수신
- 👥 **가족 모니터링**: 웹 대시보드에서 가족 멤버 활동을 실시간으로 확인
- 💬 **커뮤니티**: Q&A 답변이 달리면 즉시 알림
- 💊 **복약 체크**: 가족 멤버의 복약 체크를 실시간으로 모니터링

---

## 🏗️ 아키텍처 개요

### Supabase Realtime 동작 방식

```
클라이언트 → Supabase Realtime Server → PostgreSQL (WAL 로그)
    ↑                                            ↓
    └─────── Broadcast (postgres_changes) ──────┘
```

**핵심 개념**:
- **Channel**: 여러 구독을 그룹화하는 논리적 단위
- **postgres_changes**: DB 변경사항(INSERT/UPDATE/DELETE)을 실시간으로 수신
- **Filter**: 특정 조건에 맞는 변경사항만 수신 (예: `user_id=eq.123`)

---

## 📱 Mobile 구현

### 1) useRealtimeSubscription 훅

```typescript
// apps/mobile-expo/src/hooks/useRealtimeSubscription.ts
import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

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
```

### 2) 특화된 구독 훅

#### Q&A 답변 구독

```typescript
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
```

**사용 예시** (QnaDetailScreen):

```typescript
import { useQnaAnswersSubscription } from '../../hooks/useRealtimeSubscription';

export function QnaDetailScreen() {
  const { postId } = route.params;
  const { refetch: refetchAnswers } = useAnswers(postId);

  // ✅ Realtime 구독: 새 답변이 추가되면 실시간으로 목록 새로고침
  useQnaAnswersSubscription(postId, (newAnswer) => {
    console.log('[Realtime] New answer received:', newAnswer);
    refetchAnswers(); // 답변 목록 새로고침
    setToastMessage('새 답변이 달렸어요!');
    setShowToast(true);
  });

  // ... 나머지 컴포넌트 로직
}
```

#### 가족 알림 구독

```typescript
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
```

#### 복약 체크 구독

```typescript
/**
 * 복약 체크 구독 훅
 * 
 * 가족 멤버의 복약 체크를 실시간으로 수신
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
```

---

## 🌐 Web 구현

### 1) useRealtimeSubscription 훅 (Web)

```typescript
// apps/web-next/hooks/useRealtimeSubscription.ts
import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ... (Mobile과 동일한 구조)
```

### 2) 가족 활동 모니터링

```typescript
/**
 * 가족 멤버 활동 구독 훅
 * 
 * 여러 가족 멤버의 활동(카드 완료, 복약 체크)을 실시간으로 모니터링
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
```

**사용 예시** (Dashboard):

```typescript
'use client';

import { useState } from 'react';
import { useFamilyActivitySubscription } from '../hooks/useRealtimeSubscription';

export default function DashboardPage() {
  const [recentActivity, setRecentActivity] = useState<string | null>(null);
  const { data, mutate } = useSWR('/v1/family/members', fetcher);
  
  const members = data?.members || [];
  const memberIds = members.map(m => m.user_id);

  // ✅ Realtime 구독: 가족 멤버의 활동을 실시간으로 모니터링
  useFamilyActivitySubscription(memberIds, (activity) => {
    console.log('[Realtime] Family activity:', activity);
    
    const activityMessage = 
      activity.type === 'card_completed' 
        ? '카드를 완료했어요!' 
        : '복약 체크를 했어요!';
    
    setRecentActivity(
      `${members.find(m => m.user_id === activity.userId)?.name}님이 ${activityMessage}`
    );
    
    mutate(); // 멤버 목록 새로고침
    
    // 5초 후 메시지 제거
    setTimeout(() => setRecentActivity(null), 5000);
  });

  return (
    <div>
      {/* 실시간 활동 알림 */}
      {recentActivity && (
        <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-lg mb-6">
          🎉 {recentActivity}
        </div>
      )}
      
      {/* ... 나머지 대시보드 */}
    </div>
  );
}
```

---

## 🗄️ DB 설정

### Realtime 활성화

Supabase 대시보드에서 Realtime을 활성화해야 합니다:

1. **Database > Replication** 메뉴 이동
2. 다음 테이블에 대해 Realtime 활성화:
   - `qna_answers`
   - `completed_cards`
   - `med_checks`
   - `family_alerts`
   - `usage_counters`

```sql
-- SQL로도 활성화 가능
ALTER PUBLICATION supabase_realtime ADD TABLE qna_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE completed_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE med_checks;
ALTER PUBLICATION supabase_realtime ADD TABLE family_alerts;
```

### RLS 정책 확인

Realtime은 RLS 정책을 따릅니다. 구독자가 볼 수 있는 데이터만 수신합니다.

```sql
-- 예시: qna_answers는 모두에게 공개
CREATE POLICY "QnA answers are viewable by everyone" 
  ON qna_answers FOR SELECT 
  USING (true);

-- 예시: med_checks는 본인과 보호자만 조회 가능
CREATE POLICY "Users and guardians can view med checks" 
  ON med_checks FOR SELECT 
  USING (
    user_id = current_setting('app.current_user_id', true)
    OR EXISTS (
      SELECT 1 FROM family_links 
      WHERE user_id = med_checks.user_id 
      AND guardian_id = current_setting('app.current_user_id', true)
    )
  );
```

---

## 🔒 보안 고려사항

### 1. RLS 정책 필수

Realtime 구독은 RLS 정책을 우회하지 않습니다. 반드시 적절한 RLS 정책을 설정해야 합니다.

### 2. 민감한 데이터 필터링

민감한 정보는 Realtime으로 전송하지 않습니다:

```typescript
// ❌ 나쁜 예: 전체 데이터 구독
channel.on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, callback);

// ✅ 좋은 예: 특정 필드만 구독 (필터 사용)
channel.on('postgres_changes', { 
  event: 'UPDATE', 
  schema: 'public', 
  table: 'profiles',
  filter: `id=eq.${userId}` 
}, callback);
```

### 3. 구독 수 제한

과도한 구독은 성능 문제를 일으킬 수 있습니다. 필요한 데이터만 구독하세요.

```typescript
// ❌ 나쁜 예: 여러 개별 채널
members.forEach(member => {
  supabase.channel(`member_${member.id}`).subscribe(/* ... */);
});

// ✅ 좋은 예: 단일 채널에 여러 구독
const channel = supabase.channel('family_activities');
members.forEach(member => {
  channel.on('postgres_changes', { 
    event: 'INSERT', 
    table: 'completed_cards',
    filter: `user_id=eq.${member.id}` 
  }, callback);
});
channel.subscribe();
```

---

## 🧪 테스트

### 1. 로컬 테스트

```typescript
// apps/mobile-expo/src/__tests__/useRealtimeSubscription.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useQnaAnswersSubscription } from '../hooks/useRealtimeSubscription';

describe('useQnaAnswersSubscription', () => {
  it('should receive new answer', async () => {
    const postId = 'test-post-id';
    const mockCallback = jest.fn();

    renderHook(() => useQnaAnswersSubscription(postId, mockCallback));

    // Supabase 테스트 클라이언트를 사용하여 INSERT 시뮬레이션
    await supabase.from('qna_answers').insert({
      post_id: postId,
      body: 'Test answer',
    });

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => 
      useQnaAnswersSubscription('test-post-id', jest.fn())
    );

    const unsubscribeSpy = jest.spyOn(supabase, 'removeChannel');
    unmount();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
```

### 2. E2E 테스트

```typescript
// e2e/realtime.spec.ts
import { test, expect } from '@playwright/test';

test('should receive realtime notifications', async ({ page, context }) => {
  // 대시보드 열기
  await page.goto('/dashboard');

  // 새 탭에서 멤버 활동 시뮬레이션
  const memberPage = await context.newPage();
  await memberPage.goto('/mobile/home');
  await memberPage.click('[data-testid="complete-card"]');

  // 대시보드에서 실시간 알림 확인
  await expect(page.locator('.realtime-alert')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('.realtime-alert')).toContainText('카드를 완료했어요!');
});
```

---

## 📊 성능 최적화

### 1. 구독 조건 최적화

```typescript
// ❌ 비효율적: 전체 테이블 구독
channel.on('postgres_changes', { event: '*', table: 'qna_answers' }, callback);

// ✅ 효율적: 필요한 데이터만 필터링
channel.on('postgres_changes', { 
  event: 'INSERT', 
  table: 'qna_answers',
  filter: `post_id=eq.${postId}` 
}, callback);
```

### 2. 디바운싱

```typescript
import { debounce } from 'lodash';

const debouncedCallback = debounce((payload) => {
  console.log('Realtime event:', payload);
  refetchData();
}, 500);

useRealtimeSubscription([
  {
    table: 'completed_cards',
    event: 'INSERT',
    callback: debouncedCallback,
  },
]);
```

### 3. 조건부 구독

```typescript
// 화면이 포커스되었을 때만 구독
useEffect(() => {
  if (!isFocused) return;

  const channel = supabase.channel('my_channel');
  // ... 구독 설정
  channel.subscribe();

  return () => channel.unsubscribe();
}, [isFocused]);
```

---

## ✅ Done 정의

- [ ] Mobile: useRealtimeSubscription 훅 구현
- [ ] Mobile: Q&A 답변 실시간 알림
- [ ] Web: useRealtimeSubscription 훅 구현
- [ ] Web: 가족 활동 실시간 모니터링
- [ ] Supabase: Realtime 활성화 (테이블 4개 이상)
- [ ] RLS: 모든 구독 테이블에 정책 설정
- [ ] 테스트: 실시간 알림 E2E 테스트
- [ ] 문서: Realtime 사용 가이드 작성

---

## 🔗 참고 문서

- [Supabase Realtime 공식 문서](https://supabase.com/docs/guides/realtime)
- [Realtime Broadcast](https://supabase.com/docs/guides/realtime/broadcast)
- [Realtime Presence](https://supabase.com/docs/guides/realtime/presence)
- [프로젝트 아키텍처](../PLAN/01-2-architecture-overview.md)
