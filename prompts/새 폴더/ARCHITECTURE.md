# ARCHITECTURE - System Architecture

> **대상**: 개발자  
> **목적**: 시스템 구조, 데이터 플로우, DB 스키마 이해

---

## 📁 모노레포 구조

```
project/
├── apps/
│   ├── mobile-rn/         # React Native (Expo)
│   ├── web-next/          # Next.js (웹 대시보드)
│   └── bff-fastapi/       # FastAPI (BFF)
├── packages/
│   ├── ui/                # 공용 UI 컴포넌트
│   └── types/             # 공용 타입 (Zod 스키마)
├── scripts/               # 시드/마이그레이션 스크립트
├── docs/                  # 문서
│   ├── PLAN/
│   ├── SCAFFOLD/
│   ├── IMPLEMENT/
│   ├── SEED/
│   └── TEST/
└── infra/                 # 인프라 설정 (Docker, CI/CD)
```

---

## 🏛️ 레이어별 책임

### 1. Presentation Layer (Mobile/Web)

#### Mobile (apps/mobile-rn)
- **역할**: 시니어 사용자 앱
- **기술**: Expo RN, TypeScript, TanStack Query
- **주요 화면**:
  - HomeAScreen (홈)
  - TodayCardScreen (카드)
  - InsightListScreen (인사이트)
  - VoiceOverlay (음성)
  - ScamCheckSheet (사기검사)
  - QnAListScreen (커뮤니티)

#### Web (apps/web-next)
- **역할**: 가족 대시보드
- **기술**: Next.js 14 (App Router), Tailwind CSS
- **주요 페이지**:
  - `/dashboard` - 가족 목록
  - `/dashboard/[userId]` - 상세 통계
  - `/login` - 인증

### 2. BFF Layer (apps/bff-fastapi)

- **역할**: API Gateway + 비즈니스 로직
- **기술**: FastAPI, Pydantic, SQLAlchemy
- **구조**:
  ```
  apps/bff-fastapi/
  ├── routers/          # API 라우터
  │   ├── cards.py
  │   ├── voice.py
  │   ├── scam.py
  │   ├── insights.py
  │   └── qna.py
  ├── services/         # 비즈니스 로직
  │   ├── voice_parser.py
  │   ├── scam_checker.py
  │   └── gamification.py
  ├── models/           # ORM 모델
  └── schemas/          # Pydantic 스키마
  ```

### 3. Data Layer

#### Supabase (Postgres + Auth + RLS)
- **역할**: 메인 데이터베이스 + 인증
- **RLS**: Row-Level Security로 사용자별 데이터 격리
- **테이블**: 16개 (다음 섹션 참조)

#### Redis
- **역할**: 캐싱, 세션
- **캐싱 대상**:
  - 오늘의 카드 (TTL: 1일)
  - 인사이트 목록 (TTL: 10분)
  - 사용자 포인트/스트릭 (TTL: 1시간)

---

## 🔄 주요 데이터 플로우

### 1. Daily Card Fetch & Complete

```
[Mobile] GET /v1/cards/today
    ↓
[BFF] Redis에서 캐시 확인
    ↓ (캐시 없음)
[BFF] DB에서 오늘 카드 조회
    ↓
[BFF] Redis에 캐시 (TTL: 1일)
    ↓
[Mobile] 카드 표시

[Mobile] POST /v1/cards/complete
    ↓
[BFF] Gamification Service 호출
    ↓
[BFF] DB에 completion 기록 + 포인트 업데이트
    ↓
[Mobile] 포인트/스트릭 표시
```

### 2. Voice Intent 처리

```
[Mobile] 음성 입력 "엄마에게 전화해 줘"
    ↓
[Mobile] POST /v1/voice/intent
    ↓
[BFF] VoiceParser.parse(text)
    ↓
[BFF] Intent: CALL, Slots: {target: "엄마"}
    ↓
[Mobile] 확인 다이얼로그 표시
    ↓
[Mobile] 사용자 확인
    ↓
[Mobile] OS 전화 앱 실행
```

### 3. Scam Check

```
[Mobile] 문자/URL 입력
    ↓
[Mobile] POST /v1/scam/check
    ↓
[BFF] ScamChecker.check(text, url)
    ↓
[BFF] 패턴 매칭 (긴급/승인/단축URL 등)
    ↓
[BFF] Risk Level: danger/warn/safe
    ↓
[Mobile] 결과 + 팁 표시
```

### 4. Family Dashboard

```
[Web] GET /v1/family/members
    ↓
[BFF] family_links 조회 (senior_id)
    ↓
[BFF] usage_counters 집계 (cards_read, streak 등)
    ↓
[Web] 통계 표시
```

---

## 🗄️ DB 스키마 개요

### 핵심 테이블 (16개)

#### 1. profiles
- 사용자 기본 정보
- `id`, `email`, `display_name`, `age_band`, `a11y_mode`, `points`, `current_streak`

#### 2. cards
- 일일 학습 카드
- `id`, `type`, `title`, `tldr`, `body`, `quiz`, `estimated_read_minutes`

#### 3. card_completions
- 카드 완료 기록
- `user_id`, `card_id`, `quiz_answers`, `read_time_seconds`, `completed_at`

#### 4. insights
- 인사이트 콘텐츠
- `id`, `topic`, `title`, `summary`, `body`, `read_time_minutes`

#### 5. insight_follows
- 토픽 팔로우
- `user_id`, `topic`

#### 6. voice_logs
- 음성 명령 로그
- `user_id`, `text`, `intent`, `slots`, `executed`

#### 7. scam_checks
- 사기검사 기록
- `user_id`, `text`, `url`, `risk_level`, `matched_patterns`

#### 8. tools_progress
- 도구 트랙 진행도
- `user_id`, `tool_id`, `step_index`, `completed`

#### 9. qna_posts
- Q&A 게시글
- `author_id`, `topic`, `question`, `body`, `is_anon`, `ai_summary`

#### 10. qna_votes
- Q&A 투표
- `post_id`, `user_id`, `value` (+1/-1)

#### 11. reactions
- 리액션
- `user_id`, `target_type`, `target_id`, `reaction_type`

#### 12. family_links
- 가족 연동
- `senior_id`, `guardian_id`, `relation`, `status`

#### 13. med_checks
- 복약 체크
- `user_id`, `check_date`, `checked`, `checked_at`

#### 14. usage_counters
- 일일 사용 통계
- `user_id`, `date`, `cards_read`, `insights_read`, `qna_posts`, `voice_intents`

#### 15. gamification_history
- 포인트/스트릭 히스토리
- `user_id`, `action`, `points_earned`, `streak_bonus`, `created_at`

#### 16. audit_logs
- 감사 로그
- `user_id`, `action`, `details`, `created_at`

### 관계 (텍스트 ERD)

```
profiles
  ├──< card_completions (user_id)
  ├──< insight_follows (user_id)
  ├──< voice_logs (user_id)
  ├──< scam_checks (user_id)
  ├──< tools_progress (user_id)
  ├──< qna_posts (author_id)
  ├──< qna_votes (user_id)
  ├──< reactions (user_id)
  ├──< family_links (senior_id / guardian_id)
  ├──< med_checks (user_id)
  ├──< usage_counters (user_id)
  └──< gamification_history (user_id)

cards
  └──< card_completions (card_id)

insights
  ├──< insight_follows (topic)
  └──< reactions (target_id)

qna_posts
  ├──< qna_votes (post_id)
  └──< reactions (target_id)
```

---

## 🔐 보안 & 성능

### RLS (Row-Level Security)

```sql
-- Example: card_completions 테이블
CREATE POLICY "Users can only see their own completions"
ON card_completions
FOR SELECT
USING (auth.uid() = user_id);

-- Example: family_links 테이블
CREATE POLICY "Guardians can see linked seniors"
ON family_links
FOR SELECT
USING (
  auth.uid() = guardian_id 
  OR auth.uid() = senior_id
);
```

### Redis 캐싱 전략

| 데이터 | Key Pattern | TTL |
|--------|-------------|-----|
| 오늘의 카드 | `card:today` | 24h |
| 인사이트 목록 | `insights:{topic}` | 10m |
| 사용자 포인트 | `user:{id}:points` | 1h |
| Q&A 목록 | `qna:{topic}` | 5m |

### 성능 목표

- **API 응답 시간**: P95 < 300ms
- **카드 로딩**: < 200ms (캐시 적중 시)
- **음성 파싱**: < 100ms
- **DB 쿼리**: < 50ms (인덱스 활용)

### LLM 비용 가드 (향후)

- **하드캡**: 월 $100 초과 시 자동 중단
- **사전생성**: 인사이트/Q&A 요약 미리 생성
- **폴백**: LLM 실패 시 규칙 기반 요약

---

## 📊 모니터링

### 로깅 이벤트

- `card_complete`: 카드 완료
- `voice_intent`: 음성 명령 실행
- `scam_check`: 사기검사 실행
- `qna_post`: 질문 게시
- `family_link`: 가족 연동
- `med_check`: 복약 체크

### 메트릭

- **User Retention**: Day 1/7/30 리텐션
- **Engagement**: 일일 활성 사용자 (DAU)
- **Card Completion Rate**: 카드 읽기 → 완료 비율
- **Voice Intent Success**: 음성 명령 성공률
- **Scam Check Usage**: 사기검사 사용 빈도

---

**작성**: AI Architecture Guide  
**업데이트**: 2025년 11월 13일
