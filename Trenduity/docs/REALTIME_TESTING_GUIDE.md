# Supabase Realtime 테스트 가이드

> **작성일**: 2025년 11월 20일  
> **상태**: P1-4 Realtime Subscriptions 구현 완료 ✅

---

## 📋 개요

Supabase Realtime 기능이 Mobile과 Web에서 정상 작동하는지 검증하기 위한 테스트 가이드입니다.

**구현된 기능**:
- ✅ Mobile: Q&A 답변 실시간 알림 (`QnaDetailScreen`)
- ✅ Web: 가족 활동 실시간 모니터링 (`Dashboard`, `MemberDetailPage`)
- ✅ Web: 사용량 통계 실시간 업데이트 (`usage_counters`)

---

## 🔧 사전 준비

### 1. Supabase Realtime 활성화 확인

Supabase Dashboard에서 확인:

```sql
-- Realtime publication 확인
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 결과 예상:
-- completed_cards
-- med_checks
-- qna_answers
-- usage_counters
```

**필요 시 수동 활성화**:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE qna_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE completed_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE med_checks;
ALTER PUBLICATION supabase_realtime ADD TABLE usage_counters;
```

### 2. 환경 변수 설정 확인

**Mobile** (`apps/mobile-expo/.env`):
```bash
EXPO_PUBLIC_SUPABASE_URL=https://onnthandrqutdmvwnilf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Web** (`apps/web-next/.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://onnthandrqutdmvwnilf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. BFF 서버 실행 (포트 8002)

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8002
```

---

## 🧪 테스트 시나리오

### 시나리오 1: Q&A 답변 실시간 알림 (Mobile)

**목표**: QnaDetailScreen에서 다른 사용자가 답변을 달면 실시간으로 알림

**단계**:

1. **Mobile 앱 실행**
   ```powershell
   cd apps\mobile-expo
   npm start
   ```

2. **Q&A 상세 화면 열기**
   - Community 탭 → Q&A 게시글 선택
   - QnaDetailScreen 진입

3. **Supabase에서 새 답변 삽입 (시뮬레이션)**

   Supabase Dashboard SQL Editor:
   ```sql
   -- 테스트용 Q&A 게시글 ID 확인
   SELECT id, title FROM qna_posts LIMIT 5;
   
   -- 새 답변 삽입
   INSERT INTO qna_answers (post_id, user_id, body, is_anonymous)
   VALUES (
     'your-post-id-here',
     'test-user-id',
     '테스트 답변입니다. Realtime 작동 확인!',
     false
   );
   ```

4. **예상 결과**:
   - ✅ Mobile 앱 콘솔에 `[Realtime] New answer received:` 로그
   - ✅ 토스트 메시지: "새 답변이 달렸어요!"
   - ✅ 답변 목록에 새 답변 자동 추가 (새로고침 없이)

5. **실패 시 디버깅**:
   ```typescript
   // useRealtimeSubscription.ts에서 로그 확인
   console.log('[Realtime] Channel realtime_qna_answers status:', status);
   
   // status가 'SUBSCRIBED'가 아니면 연결 실패
   // status === 'CHANNEL_ERROR' → Supabase Realtime 설정 확인
   // status === 'TIMED_OUT' → 네트워크 또는 인증 문제
   ```

---

### 시나리오 2: 가족 활동 실시간 모니터링 (Web Dashboard)

**목표**: 가족 멤버가 카드를 완료하면 Dashboard에 실시간 알림

**단계**:

1. **Web 서버 실행**
   ```powershell
   cd apps\web-next
   npm run dev
   ```
   http://localhost:3000 접속

2. **Dashboard 페이지 열기**
   - 메인 대시보드 (/) 접속
   - 브라우저 개발자 도구 콘솔 열기 (F12)

3. **Supabase에서 카드 완료 삽입 (시뮬레이션)**

   ```sql
   -- 대시보드에 표시된 회원 ID 확인
   SELECT user_id, name FROM profiles LIMIT 5;
   
   -- 카드 완료 이벤트 삽입
   INSERT INTO completed_cards (user_id, card_id, completed_at, quiz_result)
   VALUES (
     'test-user-id',
     'card-id-123',
     NOW(),
     '{"correct": true, "selectedAnswer": "A"}'::jsonb
   );
   ```

4. **예상 결과**:
   - ✅ 브라우저 콘솔에 `[Realtime] completed_cards INSERT:` 로그
   - ✅ 화면 상단에 녹색 알림: "○○님이 카드를 완료했어요!"
   - ✅ 회원 목록에서 "마지막 활동" 시간 자동 업데이트
   - ✅ 5초 후 알림 자동 사라짐

5. **복약 체크 테스트**:
   ```sql
   INSERT INTO med_checks (user_id, date, checked_at)
   VALUES (
     'test-user-id',
     CURRENT_DATE,
     NOW()
   );
   ```

   **예상 결과**:
   - ✅ "○○님이 복약 체크를 했어요!" 알림

---

### 시나리오 3: 회원 상세 실시간 업데이트 (Web Member Detail)

**목표**: 특정 회원의 활동을 실시간으로 모니터링

**단계**:

1. **회원 상세 페이지 열기**
   - Dashboard → 회원 카드 클릭
   - `/members/[id]` 페이지 진입

2. **Supabase에서 해당 회원의 활동 삽입**

   ```sql
   -- 페이지에 표시된 회원 ID 사용
   INSERT INTO completed_cards (user_id, card_id, completed_at, quiz_result)
   VALUES (
     '[페이지의-회원-ID]',
     'card-id-456',
     NOW(),
     '{"correct": true, "selectedAnswer": "B"}'::jsonb
   );
   ```

3. **예상 결과**:
   - ✅ 브라우저 콘솔에 `[Realtime] Card completed:` 로그
   - ✅ 화면 상단에 "학습 카드를 완료했어요! 🎉" 알림
   - ✅ "활동 포인트" 숫자 자동 증가 (mutateProfile)
   - ✅ "최근 7일 활동" 차트 자동 업데이트 (mutateActivity)

4. **usage_counters 업데이트 테스트**:
   ```sql
   UPDATE usage_counters
   SET cards_completed = cards_completed + 1,
       total_points = total_points + 5,
       updated_at = NOW()
   WHERE user_id = '[페이지의-회원-ID]'
     AND month = TO_CHAR(CURRENT_DATE, 'YYYY-MM');
   ```

   **예상 결과**:
   - ✅ 콘솔에 `[Realtime] Usage counter updated:` 로그
   - ✅ 프로필 통계 자동 새로고침 (mutateProfile)

---

## 🔍 디버깅 가이드

### 문제 1: Realtime 연결 안 됨

**증상**: 콘솔에 `[Realtime] Channel ... status: CHANNEL_ERROR`

**원인 & 해결**:

1. **Realtime 활성화 확인**
   ```sql
   SELECT tablename 
   FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime'
     AND tablename IN ('qna_answers', 'completed_cards', 'med_checks', 'usage_counters');
   ```
   → 4개 테이블 모두 리턴되어야 함

2. **RLS 정책 확인**
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public'
     AND tablename IN ('qna_answers', 'completed_cards', 'med_checks', 'usage_counters')
   ORDER BY tablename;
   ```
   → 각 테이블에 최소 1개 이상의 SELECT 정책 필요

3. **네트워크 확인**
   - 브라우저 개발자 도구 → Network 탭
   - `wss://` WebSocket 연결 확인
   - Status가 101 (Switching Protocols)이어야 함

### 문제 2: 필터링 작동 안 함

**증상**: 다른 사용자의 데이터도 수신됨

**원인**: `filter` 파라미터 오타

**해결**:
```typescript
// ❌ 잘못된 필터
filter: `user_id=${userId}` // 등호 형식 오류

// ✅ 올바른 필터
filter: `user_id=eq.${userId}` // Supabase Realtime 필터 문법
```

**Supabase Realtime 필터 연산자**:
- `eq.value` - 같음
- `neq.value` - 같지 않음
- `gt.value` - 초과
- `gte.value` - 이상
- `lt.value` - 미만
- `lte.value` - 이하
- `in.(val1,val2)` - IN 연산

### 문제 3: 메모리 누수

**증상**: 페이지 이동 후에도 Realtime 연결 유지

**원인**: 클린업 함수 미실행

**해결**:
```typescript
// useRealtimeSubscription 훅 내부 확인
useEffect(() => {
  // ... 구독 설정
  
  // ✅ 반드시 클린업 함수 리턴
  return () => {
    console.log('[Realtime] Unsubscribing from', channelName);
    channel.unsubscribe(); // 구독 해제
  };
}, [configs]);
```

**검증 방법**:
1. Dashboard 접속
2. 브라우저 콘솔에서 활성 채널 수 확인:
   ```javascript
   supabase.getChannels().length // 1이어야 함
   ```
3. 다른 페이지로 이동
4. 다시 확인:
   ```javascript
   supabase.getChannels().length // 0이어야 함
   ```

### 문제 4: INSERT는 되는데 UPDATE는 안 됨

**증상**: `completed_cards` INSERT는 수신되지만 `usage_counters` UPDATE는 수신 안 됨

**원인**: RLS 정책에서 UPDATE 허용 안 함

**해결**:
```sql
-- usage_counters의 RLS 정책 확인
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usage_counters';

-- UPDATE 정책 추가 (필요 시)
CREATE POLICY "Users see own usage counters updates"
ON usage_counters FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);
```

---

## ✅ 테스트 체크리스트

### Mobile (React Native Expo)

- [ ] `useRealtimeSubscription` 훅이 `apps/mobile-expo/src/hooks/useRealtimeSubscription.ts`에 존재
- [ ] QnaDetailScreen에서 `useQnaAnswersSubscription` 훅 사용 중
- [ ] 새 답변 삽입 시 콘솔에 `[Realtime]` 로그 출력
- [ ] 토스트 메시지 "새 답변이 달렸어요!" 표시
- [ ] 답변 목록 자동 새로고침 (refetchAnswers 호출)
- [ ] 페이지 이동 시 구독 자동 해제 (Unsubscribing 로그)

### Web (Next.js)

- [ ] `useRealtimeSubscription` 훅이 `apps/web-next/hooks/useRealtimeSubscription.ts`에 존재
- [ ] Dashboard에서 `useFamilyActivitySubscription` 훅 사용 중
- [ ] Member Detail에서 3개 테이블 구독 (completed_cards, med_checks, usage_counters)
- [ ] 카드 완료 시 녹색 알림 표시
- [ ] 복약 체크 시 알림 표시
- [ ] 5초 후 알림 자동 사라짐
- [ ] 프로필/활동 데이터 자동 새로고침 (mutate 호출)
- [ ] 페이지 이동 시 구독 자동 해제

### Supabase 설정

- [ ] `qna_answers` 테이블 Realtime 활성화
- [ ] `completed_cards` 테이블 Realtime 활성화
- [ ] `med_checks` 테이블 Realtime 활성화
- [ ] `usage_counters` 테이블 Realtime 활성화
- [ ] 각 테이블에 RLS SELECT 정책 존재
- [ ] RLS에서 `auth.uid()::text = user_id` 형식 사용 (UUID → TEXT 캐스팅)

### 성능 & 안정성

- [ ] 페이지 이동 시 메모리 누수 없음 (getChannels().length === 0)
- [ ] 필터링 작동 확인 (본인 데이터만 수신)
- [ ] WebSocket 연결 안정적 (Status 101)
- [ ] 네트워크 단절 시 자동 재연결

---

## 📊 성능 모니터링

### 브라우저 개발자 도구

**Network 탭**:
- WebSocket 연결: `wss://onnthandrqutdmvwnilf.supabase.co/realtime/v1/websocket`
- Status: 101 Switching Protocols
- Messages 탭에서 실시간 메시지 확인

**Console 탭**:
```
[Realtime] Channel dashboard_completed_cards_med_checks status: SUBSCRIBED
[Realtime] completed_cards INSERT: { new: {...}, old: null }
[Realtime] Family activity: { type: 'card_completed', userId: '...', data: {...} }
```

### 예상 메시지 형식

```json
{
  "event": "postgres_changes",
  "payload": {
    "data": {
      "commit_timestamp": "2025-11-20T12:34:56Z",
      "eventType": "INSERT",
      "new": {
        "id": "uuid",
        "user_id": "test-user-id",
        "card_id": "card-123",
        "completed_at": "2025-11-20T12:34:56Z",
        "quiz_result": {"correct": true, "selectedAnswer": "A"}
      },
      "old": {},
      "schema": "public",
      "table": "completed_cards"
    }
  }
}
```

---

## 🎓 추가 학습 자료

- [Supabase Realtime 공식 문서](https://supabase.com/docs/guides/realtime)
- [Realtime 필터 문법](https://supabase.com/docs/guides/realtime/postgres-changes#filtering-changes)
- [RLS와 Realtime](https://supabase.com/docs/guides/realtime/authorization)

---

**최종 업데이트**: 2025년 11월 20일  
**작성자**: GitHub Copilot  
**상태**: P1-4 완료, 테스트 준비 완료 ✅
