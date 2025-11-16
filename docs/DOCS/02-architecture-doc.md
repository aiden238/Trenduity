# 02. Architecture Doc 작성 가이드

> **목적**: `docs/ARCHITECTURE.md`를 작성하여 개발자가 시스템 구조를 이해할 수 있도록 합니다.  
> **대상 독자**: 개발자 (백엔드, 프론트엔드, DevOps)  
> **출력**: `docs/ARCHITECTURE.md`

---

## 📋 개요

ARCHITECTURE 문서는 **시스템의 뼈대**를 설명합니다. 다음 질문에 답해야 합니다:

- **어떻게 구조화되어 있나?** → 모노레포 구조
- **각 레이어의 책임은?** → Mobile, Web, BFF, DB, Redis, Auth
- **데이터는 어떻게 흐르나?** → 시퀀스 다이어그램
- **DB는 어떻게 설계되었나?** → 주요 테이블과 관계

---

## 🎯 포함해야 할 섹션

### 1. 모노레포 구조

````markdown
## 모노레포 구조

### 디렉터리 개요

\```
Trenduity/ (모노레포 루트)
├── apps/
│ ├── mobile-rn/ # 시니어용 모바일 앱 (Expo RN)
│ └── web-console/ # 가족용 웹 콘솔 (Next.js)
├── services/
│ └── bff-fastapi/ # Backend for Frontend (FastAPI)
├── packages/
│ ├── ui/ # 공유 UI 컴포넌트 + 디자인 토큰
│ └── types/ # 공유 TypeScript 타입
├── infra/
│ └── supabase/
│ ├── migrations/ # DB 마이그레이션
│ └── functions/ # Edge Functions
├── scripts/
│ ├── seed_db.py # 시드 데이터 스크립트
│ └── deploy.sh # 배포 스크립트
└── docs/ # 문서
\```

### 각 앱/서비스 역할

#### `apps/mobile-rn` (모바일 앱)

- **목적**: 50-70대 시니어를 위한 주요 인터페이스
- **기술**: Expo React Native + TypeScript
- **책임**:
  - 오늘의 카드, 인사이트, 음성 인텐트 UI
  - 접근성 모드 (Normal/Easy/Ultra)
  - TTS 연동
  - Supabase Direct Access (읽기 전용)
  - BFF API 호출 (쓰기 작업)

#### `apps/web-console` (웹 콘솔)

- **목적**: 가족/보호자를 위한 대시보드
- **기술**: Next.js 14 (App Router) + TypeScript
- **책임**:
  - 시니어 활동 모니터링 (사용량, 복약 체크)
  - 가족 초대 및 권한 관리
  - 알림 설정
  - BFF API 호출

#### `services/bff-fastapi` (BFF)

- **목적**: 비즈니스 로직 중앙 집중화
- **기술**: FastAPI + Pydantic v2 + Python 3.11
- **책임**:
  - 모든 쓰기 작업 (INSERT, UPDATE, DELETE)
  - 게임화 로직 (포인트, 배지, 스트릭)
  - 복잡한 쿼리 (여러 테이블 조인)
  - 외부 API 연동 (LLM, TTS)
  - 사기 검사 로직

#### `packages/ui` (공유 UI)

- **목적**: 디자인 시스템 중앙화
- **기술**: React Native + TypeScript
- **내용**:
  - 접근성 토큰 (폰트, 간격, 버튼 크기)
  - 공용 컴포넌트 (Button, Card, Typography)
  - 색상/타이포그래피 상수

#### `packages/types` (공유 타입)

- **목적**: 타입 일관성 보장
- **기술**: TypeScript
- **내용**:
  - API 요청/응답 인터페이스
  - DB 테이블 타입
  - Enum (카드 상태, 위험도 레벨 등)
    \```

---

### 2. 레이어 책임

````markdown
## 레이어 책임

### Presentation Layer (Mobile + Web)

- **책임**: UI 렌더링, 사용자 인터랙션, 접근성
- **데이터 접근**:
  - 읽기: Supabase Direct (RLS 보호)
  - 쓰기: BFF API
- **상태 관리**: React Query (TanStack Query)

### BFF Layer (FastAPI)

- **책임**: 비즈니스 로직, 데이터 변환, 외부 API 연동
- **패턴**:
  - Router → Service → Repository
  - DTOs (Pydantic 모델)
  - 에러 핸들링 (Envelope 패턴)
- **인증**: Supabase JWT 검증

### Data Layer (Supabase)

- **책임**: 데이터 저장, 권한 관리, 실시간 구독
- **구성**:
  - Postgres (주요 데이터)
  - Row-Level Security (RLS)
  - Auth (JWT)
  - Storage (프로필 이미지 등)

### Cache Layer (Redis)

- **책임**: 성능 최적화
- **캐싱 대상**:
  - 오늘의 카드 (1시간)
  - 인사이트 목록 (30분)
  - 게임화 통계 (5분)
    \```

---

### 3. 주요 데이터 플로우

````markdown
## 주요 데이터 플로우

### 1) Daily Card 조회 & 완료

\```
[Mobile App]
↓ GET /v1/cards/today
[BFF]
↓ 1. Redis 캐시 확인
↓ 2. 없으면 Supabase 조회
↓ 3. Redis에 저장 (1시간)
[Redis / Supabase]
↓ 카드 데이터 반환
[Mobile App]
↓ 카드 UI 렌더링
↓ 사용자 퀴즈 완료
↓ POST /v1/cards/complete
[BFF]
↓ 1. 게임화 로직 실행 (포인트 계산)
↓ 2. cards 테이블 UPDATE (status='completed')
↓ 3. gamification 테이블 UPDATE (points, streak)
↓ 4. audit_logs 테이블 INSERT
[Supabase]
↓ DB 업데이트 완료
[BFF]
↓ 응답 반환 (포인트, 스트릭, 배지)
[Mobile App]
↓ 축하 애니메이션 표시
\```

### 2) 인사이트 조회

\```
[Mobile App]
↓ Supabase Direct Access
↓ SELECT \* FROM insights WHERE ...
[Supabase]
↓ RLS 정책 확인 (공개 데이터만)
↓ 데이터 반환
[Mobile App]
↓ 리스트 렌더링
\```

### 3) 음성 인텐트 처리

\```
[Mobile App]
    ↓ 음성 녹음 → 텍스트 변환 (클라이언트)
    ↓ POST /v1/voice/intent
    ↓ body: { text: "전화해줘 김민수" }
[BFF]
    ↓ 1. 한국어 파싱 (정규식)
    ↓ 2. 인텐트 분류 (call, message, search 등)
    ↓ 3. 엔티티 추출 (이름, 번호 등)
[BFF]
    ↓ 응답: { intent: "call", target: "김민수", phone: "010-1234-5678" }
[Mobile App]
    ↓ Linking.openURL(`tel:010-1234-5678`)
\```

### 4) 사기검사

\```
[Mobile App]
↓ POST /v1/scam/check
↓ body: { text: "계좌 확인 필요. 링크 클릭 http://..." }
[BFF]
↓ 1. 키워드 패턴 매칭 (긴급, 계좌, 링크 등)
↓ 2. URL 위험도 분석
↓ 3. LLM 요약 (선택)
[BFF]
↓ 응답: { label: "danger", tips: ["경찰에 신고하세요", ...] }
[Mobile App]
↓ 경고 UI 표시 (빨간색 배너)
\```

### 5) 복약 체크 → 가족 대시보드

\```
[Mobile App]
↓ POST /v1/family/med-check
↓ body: { med_id: "med-123", checked: true }
[BFF]
↓ med_checks 테이블 INSERT
↓ usage_counters 테이블 UPDATE (daily_med_checks++)
[Supabase]
↓ DB 업데이트
[Web Console]
↓ Supabase Realtime Subscription
↓ 대시보드 자동 갱신
\```
\```

---

### 4. DB 스키마 개요

````markdown
## DB 스키마 개요

### 주요 테이블 및 관계 (ERD 텍스트)

\```
profiles (사용자 프로필)
├── id (uuid, PK)
├── email (string)
├── display_name (string)
├── age_group (enum: 50s/60s/70s)
├── a11y_mode (enum: normal/easy/ultra)
└── created_at (timestamp)

cards (오늘의 카드)
├── id (uuid, PK)
├── user_id (uuid, FK → profiles.id)
├── date (date)
├── title (string)
├── tldr (string)
├── body (text)
├── quiz (jsonb)
├── status (enum: pending/completed)
└── completed_at (timestamp)

gamification (게임화 데이터)
├── user_id (uuid, PK, FK → profiles.id)
├── total_points (int)
├── current_streak_days (int)
├── longest_streak_days (int)
├── badges (jsonb[])
└── updated_at (timestamp)

insights (인사이트 허브)
├── id (uuid, PK)
├── title (string)
├── topic (enum: ai/health/finance/leisure)
├── body (text)
├── visibility (enum: public/premium)
├── view_count (int)
└── created_at (timestamp)

tool_tracks (도구 실습 트랙)
├── id (uuid, PK)
├── tool_name (enum: canva/miri/sora)
├── steps (jsonb[])
└── created_at (timestamp)

tool_progress (사용자 진행도)
├── user_id (uuid, FK → profiles.id)
├── track_id (uuid, FK → tool_tracks.id)
├── completed_steps (int[])
├── completed_at (timestamp)
└── PRIMARY KEY (user_id, track_id)

qna (커뮤니티 Q&A)
├── id (uuid, PK)
├── author_id (uuid, FK → profiles.id)
├── question (text)
├── is_anonymous (boolean)
├── answer_summary (text)
├── useful_count (int)
└── created_at (timestamp)

family_links (가족 연동)
├── senior_id (uuid, FK → profiles.id)
├── guardian_id (uuid, FK → profiles.id)
├── permission_level (enum: view/manage)
├── created_at (timestamp)
└── PRIMARY KEY (senior_id, guardian_id)

med_checks (복약 체크)
├── id (uuid, PK)
├── user_id (uuid, FK → profiles.id)
├── med_name (string)
├── scheduled_time (time)
├── checked_at (timestamp)
└── date (date)

usage_counters (사용량 통계)
├── user_id (uuid, PK, FK → profiles.id)
├── date (date, PK)
├── daily_cards_completed (int)
├── daily_insights_viewed (int)
├── daily_med_checks (int)
└── updated_at (timestamp)

audit_logs (감사 로그)
├── id (uuid, PK)
├── user_id (uuid, FK → profiles.id)
├── action (string)
├── resource_type (string)
├── resource_id (uuid)
├── metadata (jsonb)
└── created_at (timestamp)
\```

### RLS 정책 예시

\```sql
-- cards 테이블: 본인 카드만 조회 가능
CREATE POLICY "Users can view own cards"
ON cards FOR SELECT
USING (auth.uid() = user_id);

-- insights 테이블: 공개 인사이트는 모두 조회 가능
CREATE POLICY "Anyone can view public insights"
ON insights FOR SELECT
USING (visibility = 'public');

-- family_links: 가족은 시니어 데이터 조회 가능
CREATE POLICY "Guardians can view linked seniors"
ON usage_counters FOR SELECT
USING (
user_id IN (
SELECT senior_id FROM family_links
WHERE guardian_id = auth.uid()
)
);
\```
\```

---

### 5. 보안/성능/원가

````markdown
## 보안, 성능, 원가

### 보안

- **인증**: Supabase Auth (JWT)
- **권한**: Row-Level Security (RLS)
- **가족 위임**: family_links 테이블로 권한 관리
- **PII 보호**: 로그에 이름/전화번호 제외

### 성능

- **Redis 캐싱**:
  - 오늘의 카드: 1시간
  - 인사이트 목록: 30분
  - 게임화 통계: 5분
- **DB 인덱스**:
  - `cards(user_id, date)`
  - `insights(topic, created_at)`
  - `audit_logs(user_id, created_at)`
- **페이지네이션**: 최대 20개/페이지

### 원가 관리

- **LLM 호출 가드**:
  - 입력 길이 제한 (500자)
  - 하드캡: 1000 요청/일
  - 폴백: 패턴 매칭
- **Supabase 무료 티어**:
  - 500MB DB
  - 50,000 MAU
- **Redis 무료 티어**:
  - Upstash 10,000 요청/일

### 게임화 포인트 정책

\```python
POINTS = {
"card_complete": 5,
"quiz_correct": 2,
"daily_streak_bonus": 3,
"tool_step_complete": 3,
"med_check": 2,
"qna_post": 5,
}
\```
\```

---

## ✅ 체크리스트

ARCHITECTURE 문서 작성 완료 후:

### 내용

- [ ] 모노레포 구조 (디렉터리 + 각 앱 역할)
- [ ] 레이어 책임 (Presentation/BFF/Data/Cache)
- [ ] 주요 데이터 플로우 5-7개 (텍스트 시퀀스)
- [ ] DB 스키마 개요 (10+ 테이블, RLS 정책)
- [ ] 보안/성능/원가 섹션

### 형식

- [ ] 다이어그램이 텍스트로 명확하게 표현됨
- [ ] 코드 블록에 언어 태그
- [ ] 용어 일관성 (시니어, 가족, BFF 등)

### 독자 테스트

- [ ] 백엔드 개발자가 읽고 BFF 구조 이해 가능
- [ ] 프론트엔드 개발자가 읽고 데이터 접근 방식 이해 가능
- [ ] DevOps가 읽고 배포 구조 파악 가능

---

## 🔗 다음 단계

- **다음**: [03. API Reference](./03-api-reference.md) - API 문서화

---

**문서 작성**: AI Documentation Guide  
**최종 업데이트**: 2025년 11월 14일
````
````
````
````
````
