# 50-70대 AI 학습 앱 - MVP 계획서

> **문서 구조**: 이 파일은 목차 역할만 합니다. 각 섹션의 상세 내용은 `PLAN/` 폴더의 개별 파일을 참조하세요.

---

## 📋 목차

1. **[Project Overview](./PLAN/01-project-overview.md)**
   - 타겟 사용자 (50대/60대/70대)
   - 핵심 가치 제안
   - MVP 범위 제외 사항

2. **[Architecture Overview](./PLAN/01-2-architecture-overview.md)**
   - 3계층 아키텍처 (Presentation/BFF/Data)
   - 7가지 주요 기능의 데이터 플로우 다이어그램

3. **[Domain & Feature Decomposition](./PLAN/02-3-domain-&-feature-decomposition.md)**
   - 9개 도메인별 사용자 스토리, 엔티티, 불변식, 실패 모드
   - DailyCard, InsightHub, VoiceIntent, ScamCheck, ToolTrack, LightCommunity, FamilyMed, Gamification, A11y

4. **[Data Model Overview](./PLAN/03-4-data-model-overview.md)**
   - 16개 테이블 상세 설명
   - Authorization Model (RLS 정책)
   - Access Patterns & Indexing

5. **[Module & File Responsibility Map](./PLAN/04-5-module-&-file-responsibility-map.md)**
   - 모바일 (Expo RN), 웹 (Next.js), BFF (FastAPI) 구조
   - 도메인 분리 원칙
   - 플랫폼별 로직

6. **[Cross-Cutting Concerns](./PLAN/05-6-cross-cutting-concerns.md)**
   - Error Handling (클라이언트/서버)
   - Logging & Audit
   - Performance & Cost (캐싱, P95 목표, LLM 가드)
   - Security & Privacy (Auth, RLS, 가족 위임)

7. **[6-Week Milestone Plan](./PLAN/06-7-6-week-milestone-plan-(mvp).md)**
   - 주차별 목표, 산출물, 데모 시나리오
   - 우선순위 (MUST/SHOULD/NICE)

8. **[Risks & Mitigations](./PLAN/07-8-risks-&-mitigations.md)**
   - 10가지 주요 리스크
   - 발생 가능성, 영향도, 조기 감지 방법, 완화 방안

9. **[Acceptance Criteria for MVP](./PLAN/08-9-acceptance-criteria-for-mvp.md)**
   - E2E 시나리오 10개
   - 접근성 요구사항 (WCAG 2.1 AA)
   - 성능 목표, 분석 이벤트

---

## 🚀 빠른 참조

### 구현 시작 전 필수 읽기
- [섹션 1: Project Overview](./PLAN/01-project-overview.md) - 타겟 사용자 이해
- [섹션 2: Architecture Overview](./PLAN/01-2-architecture-overview.md) - 전체 구조 파악
- [섹션 4: Data Model](./PLAN/03-4-data-model-overview.md) - 데이터베이스 스키마

### 코딩 중 참조
- [섹션 5: Module Structure](./PLAN/04-5-module-&-file-responsibility-map.md) - 파일 구조 및 책임
- [섹션 3: Domain Decomposition](./PLAN/02-3-domain-&-feature-decomposition.md) - 비즈니스 로직
- [섹션 6: Cross-Cutting Concerns](./PLAN/05-6-cross-cutting-concerns.md) - 에러 처리, 로깅, 보안

### 배포 전 체크리스트
- [섹션 8: Risks](./PLAN/07-8-risks-&-mitigations.md) - 리스크 대응 계획 확인
- [섹션 9: Acceptance Criteria](./PLAN/08-9-acceptance-criteria-for-mvp.md) - MVP 완성 기준

### 일정 관리
- [섹션 7: 6-Week Milestone](./PLAN/06-7-6-week-milestone-plan-(mvp).md) - 주차별 계획

---

## 📁 파일 구조

```
docs/
├── PLAN.md                    # 본 파일 (목차)
└── PLAN/                      # 상세 문서
    ├── 01-project-overview.md
    ├── 01-2-architecture-overview.md
    ├── 02-3-domain-&-feature-decomposition.md
    ├── 03-4-data-model-overview.md
    ├── 04-5-module-&-file-responsibility-map.md
    ├── 05-6-cross-cutting-concerns.md
    ├── 06-7-6-week-milestone-plan-(mvp).md
    ├── 07-8-risks-&-mitigations.md
    └── 08-9-acceptance-criteria-for-mvp.md
```

---

## 💡 AI 작업 시 팁

**효율적인 컨텍스트 관리:**
- 전체 문서를 읽지 말고 **필요한 섹션만** 지정하여 읽기
- 예: "섹션 3의 DailyCard 도메인만 읽고 카드 완료 API 구현해줘"
- 예: "섹션 5의 BFF 구조를 참고해서 scam_checker 서비스 작성해줘"

**병렬 작업:**
- 팀원 A: 섹션 5 참조하여 모바일 화면 구현
- 팀원 B: 섹션 7 참조하여 Week 2 마일스톤 진행
- PM: 섹션 9 참조하여 QA 체크리스트 작성

---

## 📝 변경 이력

- **2025-11-13**: 초안 작성 (섹션 1-9 완성)
- **2025-11-13**: 모듈화 (단일 파일 → 9개 파일 분할)

---

**문서 작성자**: AI Planning Assistant  
**최종 업데이트**: 2025년 11월 13일

---

# 1. Project Overview (간략 요약)
- **디지털 리터러시**: 스마트폰과 PC 사용에 익숙함
- **주요 과제**: 
  - AI 개념과 최신 디지털 툴에 대한 이해 부족
  - 트렌드와 변화 속도를 따라가는 데 어려움
  - "이게 나한테 어떤 의미인지" 연결 부족
- **행동 패턴**: 정보 검색 가능하지만 신뢰할 수 있는 출처 구분 어려움

### 60대 (60s)
- **디지털 리터러시**: 스마트폰·PC 활용도가 점차 낮아짐
- **주요 과제**:
  - 디지털 사기(스미싱, 피싱)에 대한 불안감 높음
  - 설정과 보안 관리에 대한 두려움
  - 복잡한 UI/UX에 쉽게 압도됨
- **행동 패턴**: 자녀나 지인의 도움에 의존, 실수에 대한 두려움으로 시도 자체를 꺼림

### 70대 (70s)
- **디지털 리터러시**: IT 기기 사용 자체가 부담스러움
- **주요 과제**:
  - 한 화면에 1-2개의 명확한 행동만 처리 가능
  - 작은 글씨, 복잡한 메뉴, 여러 단계의 프로세스 모두 장벽
  - 가족의 지속적인 지원 필수
- **행동 패턴**: 음성 인터페이스 선호, 반복 학습 필요, 에러 복구 불가능

## 1.2 Core Value Proposition

우리 앱은 다음 세 가지 핵심 가치를 제공합니다:

1. **찾지 않아도 한 번에 이해되는 3분 카드**
   - 매일 큐레이션된 한 가지 주제 (AI, 트렌드, 사기 예방, 스마트폰 팁)
   - 300-500자의 짧은 문장, 명확한 TL;DR, "내 생활에 미치는 영향" 설명
   - 퀴즈로 이해도 확인, TTS로 듣기 가능

2. **버튼 몇 개, 음성으로 끝나는 실행 경험**
   - 음성 인텐트 6종: "엄마에게 전화해 줘", "내일 아침 약 먹으라고 알림 설정해 줘"
   - 접근성 모드 3단계 (normal/easy/ultra): 폰트 크기, 터치 영역, 대비 자동 조정
   - 복잡한 워크플로우 제거, 한 화면 = 한 목표

3. **가족/기관이 뒤에서 quietly 서포트하는 구조**
   - 가족 대시보드(웹): 카드 완료 여부, 복약 체크, 사용량 확인
   - 개인정보 침해 없이 "괜찮은지" 확인 가능
   - 필요 시 개입, 평소엔 자율성 존중

**엘리베이터 피치 (한국어)**  
> "50-70대 어르신들이 AI와 디지털 세상을 두려워하지 않고, 매일 3분 카드 한 장으로 안전하게 배우고, 음성과 큰 버튼으로 직접 써보고, 가족은 조용히 지켜보며 응원할 수 있는 학습 앱입니다."

## 1.3 What This MVP Is NOT

이 MVP는 다음을 **포함하지 않습니다**:

- **완전한 SNS 플랫폼**: 
  - 타임라인, 팔로우/팔로워, DM, 프로필 꾸미기 등 없음
  - 라이트 커뮤니티는 Q&A와 반응(응원/도움됐어요) 수준만 제공

- **인앱 결제 시스템**:
  - 현재 MVP는 무료 또는 스폰서 코드 기반 접근만 지원
  - 구독/결제 플로우, PG 연동, 환불 로직 없음

- **실제 머신러닝 모델 훈련**:
  - AI 요약, 사기 검사 등은 룰 기반 또는 외부 LLM API 호출
  - 자체 모델 학습, fine-tuning, MLOps 인프라 없음

- **병원 EMR(전자의무기록) 연동**:
  - 복약 체크는 단순 self-report 방식
  - 실제 의료 데이터, 처방전, 병원 시스템 연동 없음

- **완전한 디바이스 제어**:
  - 음성 인텐트는 deep link / OS 기본 앱 호출 수준
  - 시스템 설정 변경, 루팅/탈옥 기능 없음

- **고도화된 게임 메커니즘**:
  - 포인트, 스트릭, 배지는 있지만 리더보드, PvP, 길드, 아이템 교환 등 없음
  - 단순 격려와 진행도 시각화 목적

---

# 2. Architecture Overview

## 2.1 Layered Architecture

### 2.1.1 Presentation Layer

**Mobile App (Expo React Native)**
- **책임**:
  - 시니어 사용자 대면 UI/UX
  - 접근성 모드 관리 (폰트, 터치, 대비, TTS)
  - Supabase Auth를 통한 사용자 인증 (anon_key 사용)
  - 읽기 전용 데이터는 Supabase에서 직접 조회 (RLS 보호)
  - 쓰기/민감/비즈니스 로직은 BFF 호출
- **금지 사항**:
  - `service_role` 키 절대 포함 금지
  - RLS 우회 금지
  - 직접적인 외부 API 호출 최소화 (BFF 경유)
  - 복잡한 비즈니스 로직 구현 금지

**Web Console (Next.js App Router)**
- **책임**:
  - 가족/기관 관리자용 대시보드
  - 시니어 사용 현황 조회 (카드 완료, 복약, 사용량)
  - 가족 링크 관리, 알림 설정
  - Supabase Auth로 guardian/org 역할 인증
  - 대부분의 데이터는 BFF를 통해 조회/수정
- **금지 사항**:
  - 시니어의 상세 행동 로그 노출 (프라이버시 침해)
  - `service_role` 키 클라이언트 번들에 포함 금지
  - 직접적인 Supabase 쓰기 (RLS 정책 위반 가능성)

### 2.1.2 BFF Layer

**FastAPI Service**
- **책임**:
  - 모든 쓰기 작업의 단일 진입점
  - 비즈니스 규칙 검증 (예: 하루 한 카드만 완료 가능)
  - Gamification 로직 (포인트, 스트릭, 배지 부여)
  - 외부 API 연동 (LLM, 사기 검사 외부 DB, 음성 처리)
  - Supabase에 `service_role`로 접근 (RLS 우회 가능)
  - Redis를 통한 캐싱, 레이트 리미팅, 세션 관리
  - 감사 로그(audit_logs) 기록
- **금지 사항**:
  - UI 렌더링 로직 포함 금지
  - 사용자별 상태 저장 금지 (stateless 유지)
  - 장기 실행 작업은 백그라운드 큐로 위임 (초기 MVP는 동기 처리)

### 2.1.3 Data Layer

**Supabase (Postgres + Auth + RLS + Storage)**
- **책임**:
  - 모든 영구 데이터 저장
  - Row-Level Security(RLS)를 통한 읽기 권한 제어
  - Auth: 시니어(user), 가족(guardian), 기관(org) 역할 관리
  - Storage: 프로필 이미지, 카드 썸네일 (S3 호환)
- **접근 패턴**:
  - 클라이언트 → `anon_key` + RLS → 안전한 읽기
  - BFF → `service_role` → 모든 쓰기 + 복잡한 조회

**Redis (Upstash)**
- **책임**:
  - 세션 캐시 (짧은 수명 토큰, 사용자 프로필)
  - API 레이트 리미팅 (예: 사기검사 1분 5회)
  - LLM 응답 캐시 (동일 입력 재사용)
  - 리더보드/카운터 임시 저장 (배치로 Postgres 동기화)
- **금지 사항**:
  - 영구 데이터 저장 금지 (eviction 가능)
  - 민감 정보 장기 보관 금지

## 2.2 Data Flow Diagrams

### 2.2.1 Daily Card Read & Complete

```
[시니어 앱]
  ↓ GET /api/cards/today (with auth token)
[Supabase Auth] 토큰 검증 → user_id 추출
  ↓
[Supabase RLS] cards 테이블 조회
  - WHERE user_id = {current_user}
  - WHERE date = {today}
  - RLS: auth.uid() = cards.user_id
  ↓
[시니어 앱] 카드 렌더링, TTS 재생, 퀴즈 표시
  ↓ (사용자가 "완료" 버튼 클릭)
[시니어 앱] POST /bff/cards/{card_id}/complete (with auth token)
  ↓
[FastAPI BFF]
  1) 토큰 검증 (Supabase Auth)
  2) 비즈니스 규칙 검증:
     - 이미 완료된 카드인지 확인
     - 같은 날짜에 중복 완료 금지
  3) Supabase (service_role) 업데이트:
     - cards.completed_at = NOW()
     - cards.status = 'completed'
  4) Gamification 서비스 호출:
     - gamification.points += 10
     - 연속일수 확인 → streak 업데이트
     - 배지 조건 확인 (예: 첫 카드 완료)
  5) audit_logs 기록:
     - action: 'card_completed', user_id, card_id, timestamp
  ↓
[FastAPI] 200 OK 응답 (포인트, 배지 정보 포함)
  ↓
[시니어 앱] 축하 애니메이션 + 포인트 표시
```

### 2.2.2 Insight 조회

```
[시니어 앱] 인사이트 허브 진입
  ↓ GET /api/insights?topic=ai&limit=10
[Supabase Auth] 토큰 검증
  ↓
[Supabase RLS] insights 테이블 조회
  - WHERE topic = 'ai'
  - ORDER BY published_at DESC
  - LIMIT 10
  - RLS: insights.is_published = true (모든 인증 사용자)
  ↓
[시니어 앱] 인사이트 리스트 렌더링
  ↓ (사용자가 특정 인사이트 클릭)
[시니어 앱] GET /api/insights/{id}
  ↓
[Supabase RLS] 상세 조회 + reactions 조인
  ↓
[시니어 앱] 인사이트 본문, TTS, 반응 버튼 표시
  ↓ (사용자가 "도움됐어요" 클릭)
[시니어 앱] POST /bff/insights/{id}/react (type: 'useful')
  ↓
[FastAPI BFF]
  1) 토큰 검증
  2) reactions 테이블 upsert:
     - 이미 같은 타입 반응 존재 → 취소
     - 없으면 → INSERT
  3) 카운터 업데이트 (insights.useful_count += 1)
  4) Gamification: 첫 반응 시 +2 포인트
  ↓
[FastAPI] 200 OK (새 카운트 반환)
  ↓
[시니어 앱] 애니메이션 + 카운트 업데이트
```

### 2.2.3 Voice Intent 처리

```
[시니어 앱] 홈 화면 → "말하기" 버튼 탭
  ↓
[Expo Speech] 음성 녹음 시작
  ↓ (사용자: "엄마에게 전화해 줘")
[Expo Speech] 음성 → 텍스트 변환 (OS 레벨 STT)
  ↓
[시니어 앱] POST /bff/voice/parse
  - body: { text: "엄마에게 전화해 줘" }
  ↓
[FastAPI BFF]
  1) 토큰 검증
  2) voice_parser 서비스 (룰 기반):
     - "전화" 키워드 감지 → intent: 'call'
     - "엄마" 추출 → slot: { contact_name: "엄마" }
  3) contacts 테이블 조회 (연락처 정보):
     - WHERE user_id = {current_user}
     - WHERE name ILIKE '%엄마%'
     - 결과: phone_number 획득
  4) action 생성:
     - { action: 'call', phone: '+821012345678' }
  ↓
[FastAPI] 200 OK
  - { intent: 'call', contact: '엄마', phone: '+821012345678' }
  ↓
[시니어 앱]
  1) 확인 다이얼로그: "엄마(010-1234-5678)에게 전화를 걸까요?"
  2) 사용자 승인 → Linking.openURL('tel:+821012345678')
  3) OS 전화 앱으로 전환
  ↓
[시니어 앱] Gamification: 음성 인텐트 사용 +5 포인트 (BFF 호출)
```

### 2.2.4 Scam Check

```
[시니어 앱] 홈 → "사기검사" 기능
  ↓ (사용자가 의심스러운 문자 복사-붙여넣기)
[시니어 앱] POST /bff/scam/check
  - body: { text: "국세청입니다. 환급금 200만원...", url: null }
  ↓
[FastAPI BFF]
  1) 토큰 검증
  2) 레이트 리미팅 확인 (Redis):
     - key: scam_check:{user_id}
     - 1분 5회 제한
  3) scam_checker 서비스 (룰 기반):
     - 키워드 매칭: "환급금", "국세청", "긴급", "클릭"
     - 점수 산출: keyword_score + urgency_score
     - URL 존재 시:
       - 도메인 화이트리스트 확인
       - 단축 URL 감지 (bit.ly, t.co 등)
       - 유사 도메인 검사 (goverment.kr vs government.go.kr)
  4) 판정:
     - score >= 80: 'danger'
     - score 40-79: 'warn'
     - score < 40: 'safe'
  5) 설명 생성:
     - "환급금과 긴급 클릭 요구는 전형적인 스미싱 수법입니다."
  6) audit_logs 기록
  7) usage_counters.scam_checks += 1
  ↓
[FastAPI] 200 OK
  - { label: 'danger', confidence: 0.85, explanation: "...", tips: "..." }
  ↓
[시니어 앱]
  - 경고 색상(빨강) + 큰 경고 아이콘
  - 설명 + "절대 링크 클릭하지 마세요" 행동 팁
  - TTS 자동 재생 (선택)
  ↓
[시니어 앱] Gamification: 사기검사 사용 +3 포인트
```

### 2.2.5 Tool Track 단계 완료

```
[시니어 앱] 도구 실습 → "미리캔버스" 트랙 진입
  ↓ GET /api/tools/tracks/{track_id}
[Supabase RLS] tool_tracks 테이블 조회
  - steps 배열 반환 (JSON)
  ↓
[시니어 앱] 1단계 화면 렌더링 (목표, 설명, 체크리스트, 퀴즈)
  ↓ (사용자가 체크리스트 완료 + 퀴즈 정답)
[시니어 앱] POST /bff/tools/tracks/{track_id}/steps/{step_num}/complete
  ↓
[FastAPI BFF]
  1) 토큰 검증
  2) 비즈니스 규칙:
     - 이전 단계 완료 여부 확인 (step_num - 1)
     - 이미 완료된 단계는 재완료 허용 (재학습)
  3) tools_progress 테이블 upsert:
     - WHERE user_id = {current_user}
       AND track_id = {track_id}
       AND step_num = {step_num}
     - SET completed_at = NOW()
  4) Gamification:
     - 단계 완료 +5 포인트
     - 전체 트랙 완료 시 배지 "도구 마스터" 부여
  5) 다음 단계 언락 (progress.unlocked_steps 업데이트)
  ↓
[FastAPI] 200 OK (진행률, 포인트, 배지 정보)
  ↓
[시니어 앱]
  - 축하 애니메이션
  - 진행률 바 업데이트 (1/4 → 2/4)
  - 다음 단계 버튼 활성화
```

### 2.2.6 Q&A 작성/조회

```
[시니어 앱] 커뮤니티 → Q&A → "질문하기"
  ↓ (사용자가 제목, 본문, 주제 선택, 익명 체크)
[시니어 앱] POST /bff/community/qna
  - body: {
      subject: "폰",
      title: "사진 용량 줄이는 법",
      body: "...",
      is_anon: true
    }
  ↓
[FastAPI BFF]
  1) 토큰 검증
  2) 내용 검증:
     - 금칙어 필터 (욕설, 스팸 키워드)
     - 길이 제한 (제목 100자, 본문 1000자)
  3) AI 요약 생성 (초기 MVP는 룰 기반):
     - 첫 50자 + "..." 또는 제목 복사
  4) qna_posts 테이블 INSERT:
     - author_id: {current_user} (실제 저장)
     - display_name: is_anon ? "익명" : profile.nickname
     - ai_summary: "사진 용량 줄이는 방법 질문"
  5) usage_counters.qna_posts += 1
  6) audit_logs 기록
  ↓
[FastAPI] 201 Created (post_id 반환)
  ↓
[시니어 앱] "질문이 등록되었어요!" → Q&A 목록으로 이동
  ↓
[다른 사용자 앱] Q&A 목록 새로고침
  ↓ GET /api/community/qna?subject=폰&limit=20
[Supabase RLS]
  - qna_posts 조회 (is_deleted = false)
  - JOIN qna_votes (투표 수)
  - ORDER BY created_at DESC
  ↓
[시니어 앱] 리스트 렌더링 (익명/닉네임, 제목, ai_summary, 반응 수)
  ↓ (특정 질문 클릭)
[시니어 앱] GET /api/community/qna/{post_id}
  ↓
[Supabase RLS] 상세 조회 + comments (초기 MVP는 댓글 생략)
  ↓
[시니어 앱] 본문, 투표 버튼 ("도움됐어요") 표시
```

### 2.2.7 Med Check & 가족 대시보드 반영

```
[시니어 앱] 홈 화면 → "오늘 약 먹기 체크하기" 큰 버튼
  ↓ (사용자가 버튼 탭)
[시니어 앱] POST /bff/med/check
  - body: { date: "2025-11-13", time: "09:00" }
  ↓
[FastAPI BFF]
  1) 토큰 검증
  2) 비즈니스 규칙:
     - 하루 최대 3회 체크 (아침/점심/저녁)
     - 이미 해당 시간대 체크 완료 시 → 409 Conflict
  3) med_checks 테이블 INSERT:
     - user_id, date, time_slot: 'morning', checked_at: NOW()
  4) Gamification:
     - +3 포인트
     - 연속 7일 체크 시 "꾸준한 건강 관리자" 배지
     - streak 업데이트
  5) usage_counters.med_checks += 1
  6) 가족 알림 트리거 (선택적):
     - family_links 조회 (guardian_id)
     - alerts 테이블 INSERT (type: 'med_checked')
  ↓
[FastAPI] 200 OK (포인트, 스트릭, 축하 메시지)
  ↓
[시니어 앱]
  - 체크 완료 애니메이션
  - "오늘 아침 약을 챙겼어요! 3일 연속이에요 👍"
  - 포인트 증가 표시
  ↓
[가족 웹 대시보드]
  - 실시간 또는 다음 새로고침 시
  - GET /bff/family/senior/{senior_id}/summary (with guardian token)
  ↓
[FastAPI BFF]
  1) guardian 토큰 검증
  2) family_links 확인:
     - WHERE guardian_id = {current_user}
       AND senior_id = {senior_id}
       AND status = 'active'
  3) 권한 확인 후 데이터 조회:
     - 최근 7일 카드 완료 여부 (cards)
     - 최근 7일 복약 체크 (med_checks)
     - 사용량 카운터 (usage_counters)
     - 민감 정보 제외 (구체적 카드 내용, Q&A 본문 등)
  ↓
[FastAPI] 200 OK (요약 데이터)
  ↓
[가족 웹] 대시보드 업데이트:
  - "어머니는 오늘 아침 약을 챙겼어요 ✓"
  - 주간 카드 완료: 5/7일
  - 복약 스트릭: 3일 연속
```

---

---

# 3. Domain & Feature Decomposition

## 3.1 DailyCard

### User Stories

**50대:**
- "매일 아침 출근 전 3분, 오늘의 AI 트렌드 카드를 읽고 퀴즈를 풀며 포인트를 모아요."
- "카드에서 '챗GPT로 이메일 작성하기' 팁을 보고 바로 회사에서 써봤어요."

**60대:**
- "카드가 너무 길면 글씨가 작아 보이는데, 큰 글씨 모드로 읽고 TTS로 들으니 편해요."
- "사기 예방 카드를 읽고 어제 받은 문자가 스미싱이었다는 걸 알았어요."

**70대:**
- "손주가 '오늘의 카드 완료하셨어요?' 물어보는데, 큰 버튼 하나만 누르면 끝나서 좋아요."
- "퀴즈는 어렵지만 틀려도 설명이 나와서 다시 배워요."

### Primary Entities

- **cards**: 카드 메타데이터 (id, type, title, tldr, body, impact, quiz_json, user_id, date, status, completed_at)
- **gamification**: 포인트, 스트릭 업데이트
- **reactions**: 사용자 반응 (cheer, useful)

### Invariants

- 한 사용자는 특정 날짜에 **최대 1개의 활성 카드**만 가질 수 있음
- 카드 완료는 **멱등성**: 같은 카드를 여러 번 완료해도 포인트는 1회만 부여
- 퀴즈 정답률은 **0-100%** 범위, 음수 불가
- 카드 상태: `pending` → `active` → `completed` (역행 불가)

### Failure Modes

- **카드 불러오기 실패** (네트워크/DB):
  - "지금은 네트워크가 불안정해요. 잠시 후 다시 시도해 주세요."
  - 로컬 캐시에서 어제 카드 표시 (선택적)
  
- **TTS 재생 실패** (권한/OS):
  - "음성 읽기 기능을 사용할 수 없어요. 설정에서 권한을 확인해 주세요."
  - 텍스트만 표시, 계속 이용 가능
  
- **퀴즈 제출 실패** (타임아웃):
  - "답안이 저장되지 않았어요. 다시 제출할까요?"
  - 로컬 저장 → 재시도 버튼

## 3.2 InsightHub

### User Stories

**50대:**
- "AI 토픽을 팔로우하면 관련 인사이트가 매주 정리되어 푸시로 와요."
- "빅테크 기업 뉴스를 읽고 '도움됐어요' 버튼을 눌렀어요."

**60대:**
- "안전 토픽의 최근 10개 글을 한 번에 보고, TTS로 하나씩 들어요."
- "월간 요약 페이지에서 이번 달 주요 트렌드를 복습해요."

**70대:**
- "인사이트는 카드보다 길어서 가족이 같이 읽어줘요."
- "저장 기능으로 나중에 다시 보려고 했는데, 어디 갔는지 잊어버렸어요."

### Primary Entities

- **insights**: 인사이트 콘텐츠 (id, topic, title, body, published_at, is_published)
- **insight_follows**: 사용자-토픽 팔로우 관계
- **reactions**: 인사이트 반응 (useful, cheer)

### Invariants

- 토픽은 **사전 정의된 5종**만 허용: `ai`, `bigtech`, `economy`, `safety`, `mobile101`
- 인사이트는 **published_at 이후**에만 사용자에게 노출
- 팔로우/언팔로우는 **멱등성**: 중복 팔로우 허용 안 함
- 반응은 사용자당 인사이트당 **1개 타입만** (useful 또는 cheer, 동시 불가)

### Failure Modes

- **토픽 리스트 불러오기 실패**:
  - "인사이트를 불러올 수 없어요. 잠시 후 다시 시도해 주세요."
  - 캐시된 목록 표시 (있다면)
  
- **팔로우 실패** (네트워크):
  - "팔로우 설정이 저장되지 않았어요. 다시 시도해 주세요."
  - 로컬 상태 롤백
  
- **푸시 알림 미전송** (권한/설정):
  - "알림 권한이 없어요. 설정에서 알림을 허용해 주세요."
  - 앱 내 알림 배지로 대체

## 3.3 VoiceIntent

### User Stories

**50대:**
- "'네이버 열어 줘'라고 말하면 바로 네이버 앱이 실행돼요."
- "'내일 오후 2시 미팅 알림 설정해 줘'로 캘린더 알림 생성."

**60대:**
- "'딸에게 문자 보내 줘'라고 하면 문자 앱이 열리고 딸 연락처가 자동 입력돼요."
- "음성 인식이 잘못될 때가 있는데, 다시 말하기 버튼이 있어서 괜찮아요."

**70대:**
- "버튼을 누르고 '집 근처 병원 찾아 줘'라고 말하면 지도가 열려요."
- "소음이 많으면 인식이 안 돼서, 조용한 곳에서만 써요."

### Primary Entities

- **voice_intents**: 파싱된 인텐트 로그 (id, user_id, raw_text, intent, slots_json, action_json, created_at)
- **contacts**: 사용자 연락처 (name, phone, relation) - 선택적 저장
- **gamification**: 음성 사용 포인트

### Invariants

- 인텐트 타입은 **6종 고정**: `open`, `search`, `call`, `sms`, `remind`, `navigate`
- `call`, `sms` 인텐트는 **사용자 명시적 승인** 후에만 실행
- 파싱 실패 시 `intent: 'unknown'`, `confidence: 0`으로 기록
- 민감 인텐트(call/sms)는 **audit_logs 필수 기록**

### Failure Modes

- **음성 인식 실패** (권한/소음):
  - "음성을 인식할 수 없어요. 다시 말씀해 주세요."
  - 마이크 권한 확인 프롬프트
  
- **인텐트 파싱 실패** (모호한 문장):
  - "무엇을 도와드릴까요? 예: '엄마에게 전화해 줘', '지하철역 찾아 줘'"
  - 예시 문장 3개 표시
  
- **연락처 없음** (call/sms):
  - "'엄마' 연락처를 찾을 수 없어요. 연락처를 추가해 주세요."
  - 연락처 앱으로 이동 버튼

## 3.4 ScamCheck

### User Stories

**50대:**
- "회사에서 받은 의심스러운 이메일을 복사해서 사기검사에 넣어봤어요."
- "URL 단축 링크를 붙여넣었더니 '위험' 판정이 나왔어요."

**60대:**
- "국세청 사칭 문자를 검사했더니 '매우 위험' 경고와 함께 '절대 클릭하지 마세요' 팁이 나왔어요."
- "안전 판정 받은 메시지도 혹시 몰라 가족에게 한 번 더 물어봐요."

**70대:**
- "문자 전체를 복사하는 게 어려워서 가족이 대신 검사해 줘요."
- "빨간색 경고 화면이 나오면 무서워서 바로 삭제해요."

### Primary Entities

- **scam_checks**: 검사 로그 (id, user_id, input_text, input_url, label, confidence, explanation, created_at)
- **scam_rules**: 룰 정의 (키워드, 도메인 블랙리스트) - 서버 측 설정
- **usage_counters**: 사용 횟수 집계

### Invariants

- 판정 라벨은 **3종 고정**: `safe`, `warn`, `danger`
- Confidence는 **0.0-1.0** 범위
- 레이트 리미팅: **1분당 5회** (Redis)
- 입력 텍스트는 **최대 2000자**, URL은 **최대 500자**
- 민감 정보(계좌번호, 주민번호)는 **마스킹 후 로그**

### Failure Modes

- **레이트 리미팅 초과**:
  - "잠시 후 다시 시도해 주세요. (1분에 5회 제한)"
  - 남은 시간 카운트다운 표시
  
- **입력 길이 초과**:
  - "텍스트가 너무 길어요. 2000자 이내로 줄여주세요."
  - 현재 글자 수 표시
  
- **판정 실패** (룰 엔진 오류):
  - "지금은 사기검사를 할 수 없어요. 의심스러운 내용은 가족이나 경찰(112)에 문의하세요."
  - 항상 안전 우선 메시지

## 3.5 ToolTrack

### User Stories

**50대:**
- "미리캔버스 트랙을 따라 4단계를 완료하고 '디자인 입문자' 배지를 받았어요."
- "각 단계마다 체크리스트가 있어서 빠뜨리지 않고 따라할 수 있어요."

**60대:**
- "소라(AI 영상)트랙을 시작했는데 2단계에서 막혀서 1단계를 다시 복습했어요."
- "퀴즈를 틀려도 설명이 나와서 이해가 돼요."

**70대:**
- "가족이 '캔바 트랙 해봐요'라고 했는데, 1단계부터 어려워서 포기했어요."
- "큰 그림과 한 줄 설명만 있으면 좋겠어요."

### Primary Entities

- **tool_tracks**: 트랙 메타데이터 (id, tool_name, title, description, steps_json, difficulty)
- **tools_progress**: 사용자 진행도 (user_id, track_id, step_num, completed_at, unlocked_steps)
- **gamification**: 단계 완료 포인트, 트랙 완주 배지

### Invariants

- 트랙은 **순차 진행**: 이전 단계 완료 없이 다음 단계 불가 (unlock 방식)
- 각 단계는 **재완료 허용** (재학습 목적)
- 진행률은 **0-100%**, 소수점 1자리
- 트랙 난이도: `beginner`, `intermediate`, `advanced` 중 하나

### Failure Modes

- **단계 불러오기 실패**:
  - "트랙 정보를 불러올 수 없어요. 잠시 후 다시 시도해 주세요."
  - 이전 단계 정보 표시 (캐시)
  
- **순서 위반 시도**:
  - "이전 단계를 먼저 완료해 주세요."
  - 현재 완료된 단계 강조
  
- **완료 저장 실패**:
  - "진행 상황이 저장되지 않았어요. 다시 시도해 주세요."
  - 로컬 임시 저장 → 재시도

## 3.6 LightCommunity

### User Stories

**50대:**
- "Q&A에서 '갤럭시 사진 백업 방법' 질문을 올렸더니 다른 분이 '도움됐어요' 눌러줬어요."
- "익명으로 질문할 수 있어서 부끄러운 질문도 할 수 있어요."

**60대:**
- "사기 관련 질문을 검색하니 비슷한 사례가 많이 나와서 안심했어요."
- "댓글 기능이 없어서 간단하고 좋아요."

**70대:**
- "질문하기 버튼을 눌렀는데 제목과 본문을 다 써야 해서 어려웠어요."
- "다른 사람 질문을 읽기만 해요."

### Primary Entities

- **qna_posts**: 질문 게시글 (id, author_id, subject, title, body, is_anon, ai_summary, created_at, is_deleted)
- **qna_votes**: 투표 (post_id, user_id, vote_type: 'useful')
- **reactions**: 게시글 반응 (cheer, useful)
- **moderation_logs**: 신고/금칙어 필터 로그

### Invariants

- 게시글은 **작성자만 삭제 가능** (is_deleted = true, 실제 DELETE 안 함)
- 익명 게시글도 **author_id는 저장** (관리/신고 목적)
- 제목 **최대 100자**, 본문 **최대 1000자**
- 주제(subject)는 **4종 프리셋**: `폰`, `사기`, `도구`, `생활`
- 투표는 사용자당 게시글당 **1회만**

### Failure Modes

- **금칙어 감지**:
  - "부적절한 단어가 포함되어 있어요. 수정 후 다시 작성해 주세요."
  - 해당 단어 하이라이트 (선택적)
  
- **길이 초과**:
  - "제목은 100자, 본문은 1000자 이내로 작성해 주세요."
  - 현재 글자 수 표시
  
- **중복 투표 시도**:
  - "이미 투표하셨어요."
  - 조용히 무시 (에러 표시 안 함)

## 3.7 FamilyMed

### User Stories

**50대 (시니어):**
- "아침 약 먹고 큰 버튼 누르면 가족에게 알림이 가요."
- "3일 연속 체크하면 포인트가 더 많이 올라요."

**60대 (시니어):**
- "약 먹는 걸 자주 잊는데, 앱에서 알림이 와서 도움이 돼요."
- "가족이 '어제 약 드셨어요?' 물어보지 않아도 앱에서 확인하는 것 같아요."

**70대 (시니어):**
- "버튼 하나만 누르면 끝이라 쉬워요."
- "가끔 실수로 두 번 눌렀는데 괜찮대요."

**가족 (Web):**
- "어머니가 이번 주 5일 약을 챙기셨어요. 걱정 덜었어요."
- "복약 연속 기록이 끊기면 부드럽게 확인 전화를 드려요."

### Primary Entities

- **med_checks**: 복약 체크 기록 (user_id, date, time_slot: 'morning'/'lunch'/'evening', checked_at)
- **family_links**: 가족 연결 (senior_id, guardian_id, relation, status, created_at)
- **alerts**: 가족 알림 (guardian_id, type, payload, is_read)
- **gamification**: 복약 포인트, 연속 스트릭

### Invariants

- 하루 최대 **3회 체크** (아침/점심/저녁)
- 같은 시간대 **중복 체크 불가**
- 가족 링크는 **양방향 동의** 필요 (초대 → 수락)
- guardian는 **최대 5명의 시니어** 관리 가능
- 시니어는 **최대 3명의 guardian** 연결 가능

### Failure Modes

- **중복 체크 시도**:
  - "오늘 아침 약은 이미 체크하셨어요!"
  - 체크 시간 표시
  
- **가족 링크 미연결**:
  - "가족 연결이 없어요. 설정에서 가족을 초대해 보세요."
  - 초대 화면으로 이동 버튼
  
- **대시보드 권한 없음** (Web):
  - "이 사용자의 정보를 볼 권한이 없습니다."
  - 403 Forbidden

## 3.8 Gamification

### User Stories

**50대:**
- "카드 완료하면 10포인트, 퀴즈 맞히면 5포인트 추가로 받아요."
- "100포인트 모으면 '열정 학습자' 배지를 받았어요."

**60대:**
- "7일 연속 카드 완료하면 '꾸준한 학습자' 배지를 받아요."
- "포인트가 쌓이는 게 재미있어서 매일 접속해요."

**70대:**
- "포인트가 뭔지 잘 모르지만, 숫자가 올라가는 게 보여요."
- "배지는 가족이 '대단하다'고 칭찬해 줘요."

### Primary Entities

- **gamification**: 포인트, 레벨, 스트릭, 배지 목록 (user_id, points, level, current_streak, badges_json)
- **badge_definitions**: 배지 정의 (id, name, description, condition, icon_url)
- **point_transactions**: 포인트 지급/차감 로그 (user_id, amount, reason, created_at)

### Invariants

- 포인트는 **항상 0 이상** (음수 불가)
- 레벨은 **포인트 기반 자동 산출** (100pts = Lv1, 500pts = Lv2, ...)
- 스트릭은 **연속일수**, 하루 누락 시 **0으로 리셋**
- 배지는 **중복 획득 불가** (이미 보유 시 재지급 안 함)
- 모든 포인트 변경은 **point_transactions 로그 필수**

### Failure Modes

- **포인트 지급 실패** (DB 충돌):
  - "포인트 지급이 지연되고 있어요. 잠시 후 확인해 주세요."
  - 비동기 재시도 큐 등록
  
- **배지 조건 오류**:
  - 조용히 실패, 관리자 알림
  - 사용자에게는 에러 노출 안 함
  
- **레벨 계산 오류**:
  - 포인트는 정상 표시, 레벨만 "계산 중..."
  - 백그라운드 재계산

## 3.9 Accessibility

### User Stories

**50대:**
- "기본 모드(normal)로 충분해요. 글씨 크기와 버튼이 적당해요."
- "밤에는 다크 모드로 바꿔서 눈이 편해요."

**60대:**
- "쉬운 모드(easy)로 설정하면 글씨가 커지고 버튼 간격이 넓어져서 좋아요."
- "TTS로 카드를 들으면서 산책해요."

**70대:**
- "초간단 모드(ultra)는 버튼이 정말 커서 실수 안 해요."
- "색 대비가 강해서 글씨가 잘 보여요."

### Primary Entities

- **profiles.a11y_mode**: 접근성 모드 (`normal`, `easy`, `ultra`)
- **profiles.preferences_json**: 폰트 크기, 대비, TTS 속도 등 상세 설정
- **tts_logs**: TTS 사용 로그 (선택적)

### Invariants

- 모드 변경은 **즉시 반영** (재시작 불필요)
- 모든 모드에서 **WCAG 2.1 AA 이상** 목표
- 터치 영역: normal=44x44dp, easy=60x60dp, ultra=80x80dp
- 폰트 크기: normal=16sp, easy=20sp, ultra=28sp
- TTS 지원은 **모든 주요 텍스트** (카드, 인사이트, 에러 메시지)

### Failure Modes

- **TTS 초기화 실패**:
  - "음성 읽기 기능을 사용할 수 없어요."
  - 텍스트만 표시, 앱 사용 계속 가능
  
- **모드 변경 실패**:
  - "설정을 저장할 수 없어요. 다시 시도해 주세요."
  - 이전 설정 유지
  
- **대비 조정 불가** (디바이스 제약):
  - "일부 색상 설정이 지원되지 않을 수 있어요."
  - 최선의 폴백 적용

---

# 4. Data Model Overview

## 4.1 Core Tables

### profiles

**목적**: 사용자 기본 정보 및 설정 저장

**주요 필드**:
- `id` (UUID, PK): Supabase Auth user_id와 동일
- `role` (ENUM): `user` (시니어), `guardian` (가족), `org` (기관)
- `nickname` (TEXT): 표시 이름
- `age_band` (TEXT): `50s`, `60s`, `70s` (선택적)
- `a11y_mode` (ENUM): `normal`, `easy`, `ultra`
- `preferences_json` (JSONB): 폰트, 대비, TTS 속도, 알림 설정 등
- `created_at`, `updated_at` (TIMESTAMP)

**관계**:
- 1:N → cards (사용자별 카드)
- 1:N → gamification (사용자별 게임화 데이터)
- N:M → family_links (시니어 ↔ guardian)

**권한**:
- **본인**: 읽기/쓰기
- **guardian**: 연결된 시니어의 일부 필드 읽기 (nickname, age_band, a11y_mode)
- **org**: 소속 시니어의 통계 읽기 (개인정보 제외)

### cards

**목적**: 일일 카드 메타데이터 및 사용자별 완료 상태

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `date` (DATE): 카드 발행 날짜
- `type` (ENUM): `ai`, `trend`, `safety`, `mobile`
- `title`, `tldr`, `body`, `impact` (TEXT)
- `quiz_json` (JSONB): [{ question, options, correct_idx, explanation }]
- `status` (ENUM): `pending`, `active`, `completed`
- `completed_at` (TIMESTAMP)
- `quiz_score` (FLOAT): 0.0-1.0

**관계**:
- N:1 → profiles (사용자)
- 1:N → reactions (반응)

**권한**:
- **본인**: 자기 카드만 읽기/완료
- RLS: `auth.uid() = cards.user_id`

**인덱싱**:
- `(user_id, date)`: 특정 날짜 카드 조회
- `(user_id, status)`: 미완료 카드 조회
- `created_at DESC`: 최근 카드 목록

### courses

**목적**: 학습 코스 메타데이터 (초기 MVP에서는 미사용, 향후 확장)

**주요 필드**:
- `id` (UUID, PK)
- `title`, `description` (TEXT)
- `difficulty` (ENUM): `beginner`, `intermediate`, `advanced`
- `duration_minutes` (INT)
- `is_published` (BOOL)

**관계**:
- 1:N → course_enrollments (수강 신청)

### course_enrollments

**목적**: 사용자별 코스 수강 상태

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `course_id` (UUID, FK → courses.id)
- `status` (ENUM): `enrolled`, `in_progress`, `completed`
- `progress_percent` (FLOAT): 0.0-100.0
- `enrolled_at`, `completed_at` (TIMESTAMP)

**권한**:
- **본인**: 자기 수강 정보만 읽기/쓰기

### family_links

**목적**: 시니어-가족 연결 관계

**주요 필드**:
- `id` (UUID, PK)
- `senior_id` (UUID, FK → profiles.id, role=user)
- `guardian_id` (UUID, FK → profiles.id, role=guardian)
- `relation` (TEXT): "아들", "딸", "배우자", "친구" 등
- `status` (ENUM): `pending`, `active`, `rejected`
- `invited_at`, `accepted_at` (TIMESTAMP)

**관계**:
- N:1 → profiles (senior)
- N:1 → profiles (guardian)

**권한**:
- **senior**: 자기 링크 조회/수락/거절
- **guardian**: 자기 링크 조회, 초대 생성
- RLS: `auth.uid() IN (senior_id, guardian_id)`

**인덱싱**:
- `(senior_id, status)`: 시니어별 활성 링크
- `(guardian_id, status)`: 가족별 관리 대상

### sponsor_codes

**목적**: 기관 스폰서 코드 관리 (무료 접근 권한)

**주요 필드**:
- `id` (UUID, PK)
- `code` (TEXT, UNIQUE): "ORG2024ABC"
- `org_id` (UUID, FK → profiles.id, role=org)
- `max_uses` (INT): 최대 사용 횟수
- `used_count` (INT): 현재 사용 횟수
- `expires_at` (TIMESTAMP)
- `is_active` (BOOL)

**권한**:
- **org**: 자기 코드만 생성/조회
- **user**: 코드 사용 (읽기 불가)

### alerts

**목적**: 가족/기관 알림 저장

**주요 필드**:
- `id` (UUID, PK)
- `recipient_id` (UUID, FK → profiles.id): guardian 또는 org
- `type` (ENUM): `med_checked`, `card_completed`, `streak_broken`, `new_qna`
- `payload` (JSONB): 알림 상세 정보
- `is_read` (BOOL)
- `created_at` (TIMESTAMP)

**권한**:
- **recipient**: 자기 알림만 읽기/업데이트
- RLS: `auth.uid() = recipient_id`

**인덱싱**:
- `(recipient_id, is_read, created_at DESC)`: 미읽음 알림 목록

### usage_counters

**목적**: 사용자별 기능 사용 카운터 (분석용)

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `date` (DATE): 집계 날짜
- `cards_completed` (INT)
- `voice_intents_used` (INT)
- `scam_checks` (INT)
- `qna_posts` (INT)
- `med_checks` (INT)

**권한**:
- **본인**: 읽기 전용
- **guardian**: 연결된 시니어 읽기
- **org**: 소속 시니어 통계 읽기

**인덱싱**:
- `(user_id, date DESC)`: 일별 사용량 조회

### audit_logs

**목적**: 민감 작업 감사 로그

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `action` (TEXT): `card_completed`, `scam_checked`, `voice_call`, `family_linked`
- `resource_type` (TEXT): `card`, `scam_check`, `voice_intent`
- `resource_id` (UUID)
- `metadata_json` (JSONB)
- `ip_address` (INET)
- `created_at` (TIMESTAMP)

**권한**:
- **admin/org**: 읽기 전용 (관리 목적)
- **user/guardian**: 접근 불가

**인덱싱**:
- `(user_id, created_at DESC)`: 사용자별 로그
- `(action, created_at DESC)`: 액션별 검색

### insights

**목적**: 인사이트 허브 콘텐츠

**주요 필드**:
- `id` (UUID, PK)
- `topic` (ENUM): `ai`, `bigtech`, `economy`, `safety`, `mobile101`
- `title`, `body` (TEXT)
- `author_id` (UUID, FK → profiles.id, role=org/admin)
- `published_at` (TIMESTAMP)
- `is_published` (BOOL)
- `view_count`, `useful_count`, `cheer_count` (INT)

**권한**:
- **모든 인증 사용자**: is_published=true 읽기
- **author/org**: 작성/수정/삭제
- RLS: `is_published = true OR auth.uid() = author_id`

**인덱싱**:
- `(topic, published_at DESC)`: 토픽별 최신순
- `(is_published, published_at DESC)`: 공개 인사이트 목록

### insight_follows

**목적**: 사용자별 토픽 팔로우 관계

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `topic` (ENUM): `ai`, `bigtech`, `economy`, `safety`, `mobile101`
- `followed_at` (TIMESTAMP)

**권한**:
- **본인**: 자기 팔로우만 관리
- RLS: `auth.uid() = user_id`

**인덱싱**:
- `(user_id, topic)`: UNIQUE 제약, 중복 팔로우 방지

### reactions

**목적**: 카드/인사이트/Q&A 반응 (범용)

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `target_type` (ENUM): `card`, `insight`, `qna_post`
- `target_id` (UUID): 대상 리소스 ID
- `reaction_type` (ENUM): `cheer`, `useful`
- `created_at` (TIMESTAMP)

**권한**:
- **본인**: 자기 반응만 생성/삭제
- **모든 인증 사용자**: 카운트 읽기

**인덱싱**:
- `(target_type, target_id)`: 대상별 반응 목록
- `(user_id, target_type, target_id)`: UNIQUE 제약 (중복 반응 방지)

### qna_posts

**목적**: 커뮤니티 Q&A 게시글

**주요 필드**:
- `id` (UUID, PK)
- `author_id` (UUID, FK → profiles.id)
- `subject` (ENUM): `폰`, `사기`, `도구`, `생활`
- `title` (TEXT, 최대 100자)
- `body` (TEXT, 최대 1000자)
- `is_anon` (BOOL): 익명 여부
- `ai_summary` (TEXT): AI 생성 요약 (초기는 룰 기반)
- `is_deleted` (BOOL): soft delete
- `created_at`, `updated_at` (TIMESTAMP)

**권한**:
- **모든 인증 사용자**: is_deleted=false 읽기
- **author**: 수정/삭제
- RLS: `is_deleted = false OR auth.uid() = author_id`

**인덱싱**:
- `(subject, created_at DESC)`: 주제별 최신순
- `(is_deleted, created_at DESC)`: 활성 게시글

### qna_votes

**목적**: Q&A 게시글 투표 (도움됐어요)

**주요 필드**:
- `id` (UUID, PK)
- `post_id` (UUID, FK → qna_posts.id)
- `user_id` (UUID, FK → profiles.id)
- `vote_type` (ENUM): `useful` (초기는 1종만)
- `created_at` (TIMESTAMP)

**권한**:
- **본인**: 자기 투표만 생성/취소
- **모든 인증 사용자**: 카운트 읽기

**인덱싱**:
- `(post_id, user_id)`: UNIQUE 제약 (중복 투표 방지)

### gamification

**목적**: 사용자별 게임화 데이터

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id, UNIQUE)
- `points` (INT, >= 0)
- `level` (INT): 포인트 기반 자동 산출
- `current_streak` (INT): 연속일수
- `longest_streak` (INT): 최장 연속일수
- `badges_json` (JSONB): [{ badge_id, earned_at }]
- `last_activity_date` (DATE): 스트릭 계산용

**권한**:
- **본인**: 읽기 전용
- **BFF**: service_role로 쓰기

**인덱싱**:
- `user_id`: UNIQUE, 1:1 관계
- `points DESC`: 리더보드 (향후 확장)

### tools_progress

**목적**: 도구 실습 트랙 진행도

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `track_id` (UUID, FK → tool_tracks.id)
- `step_num` (INT): 1, 2, 3, 4 등
- `completed_at` (TIMESTAMP)
- `unlocked_steps` (INT[]): 언락된 단계 배열

**권한**:
- **본인**: 자기 진행도만 읽기/쓰기
- RLS: `auth.uid() = user_id`

**인덱싱**:
- `(user_id, track_id, step_num)`: UNIQUE 제약
- `(user_id, track_id)`: 트랙별 진행도 조회

## 4.2 Authorization Model

**역할 정의**:
- **user (시니어)**: 앱의 주 사용자, 카드/인사이트/커뮤니티 이용
- **guardian (가족)**: 시니어의 사용 현황 조회 (웹 대시보드), 직접 개입 최소화
- **org (기관)**: 스폰서 코드 관리, 소속 시니어 통계 조회 (개인 식별 정보 제외)
- **admin (관리자)**: 모든 데이터 접근 (초기 MVP에서는 최소 사용)

**RLS 정책 원칙**:
1. **본인 데이터 우선**: 사용자는 자기 데이터만 읽기/쓰기
2. **family_links 기반 위임**: guardian은 active 링크가 있는 시니어의 일부 데이터만 읽기
3. **공개 데이터**: insights(is_published=true), qna_posts(is_deleted=false)는 모든 인증 사용자 읽기
4. **BFF 우회**: service_role은 RLS 무시, 비즈니스 로직에서 권한 검증

**예시 RLS 정책 (cards)**:
```
-- 읽기: 본인 카드만
CREATE POLICY "Users can view own cards"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

-- 쓰기: BFF만 (service_role)
-- 클라이언트는 읽기 전용
```

**예시 RLS 정책 (qna_posts)**:
```
-- 읽기: 삭제되지 않은 게시글 또는 본인 게시글
CREATE POLICY "Users can view active or own posts"
  ON qna_posts FOR SELECT
  USING (is_deleted = false OR auth.uid() = author_id);

-- 쓰기: BFF만
```

## 4.3 Access Patterns & Indexing

**고빈도 조회 패턴**:

1. **오늘의 카드 조회** (초당 수십 건):
   - `SELECT * FROM cards WHERE user_id = ? AND date = CURRENT_DATE`
   - 인덱스: `(user_id, date)`

2. **인사이트 토픽별 목록** (초당 수십 건):
   - `SELECT * FROM insights WHERE topic = ? AND is_published = true ORDER BY published_at DESC LIMIT 10`
   - 인덱스: `(topic, is_published, published_at DESC)`

3. **가족 대시보드 요약** (초당 수 건):
   - `SELECT * FROM family_links WHERE guardian_id = ? AND status = 'active'`
   - `SELECT * FROM usage_counters WHERE user_id IN (...) AND date >= ?`
   - 인덱스: `(guardian_id, status)`, `(user_id, date DESC)`

4. **사용자 게임화 데이터** (초당 수십 건):
   - `SELECT * FROM gamification WHERE user_id = ?`
   - 인덱스: `user_id` (UNIQUE, PK 역할)

5. **Q&A 주제별 목록** (초당 수 건):
   - `SELECT * FROM qna_posts WHERE subject = ? AND is_deleted = false ORDER BY created_at DESC LIMIT 20`
   - 인덱스: `(subject, is_deleted, created_at DESC)`

**캐싱 전략 (Redis)**:
- **카드**: 당일 카드는 Redis에 1시간 캐시
- **인사이트**: 토픽별 최신 10개는 10분 캐시
- **사용자 프로필**: 로그인 후 세션 동안 캐시
- **게임화 데이터**: 포인트 변경 시 즉시 갱신, 읽기는 캐시 우선

**페이지네이션 필수 엔드포인트**:
- 인사이트 목록: 10개/페이지
- Q&A 목록: 20개/페이지
- 감사 로그: 50개/페이지 (관리자용)

**성능 목표**:
- P95 카드 조회 < 200ms
- P95 인사이트 목록 < 300ms
- P95 BFF 쓰기 작업 < 500ms (gamification 포함)

---

---

# 5. Module & File Responsibility Map

## 5.1 Mobile App (apps/mobile-expo/)

### Directory Structure

```
apps/mobile-expo/
├── src/
│   ├── screens/          # 화면 컴포넌트 (Navigation 대상)
│   │   ├── Home/         # 홈 (카드, 복약, 음성)
│   │   ├── InsightHub/   # 인사이트 허브
│   │   ├── Community/    # 커뮤니티 Q&A
│   │   ├── Tools/        # 도구 실습 트랙
│   │   ├── Profile/      # 프로필 & 설정
│   │   └── Auth/         # 로그인/회원가입
│   ├── features/         # 도메인별 비즈니스 로직
│   │   ├── cards/        # 카드 관련
│   │   ├── insights/     # 인사이트 관련
│   │   ├── voice/        # 음성 인텐트
│   │   ├── scam/         # 사기검사
│   │   ├── tools/        # 도구 트랙
│   │   ├── community/    # Q&A
│   │   ├── family/       # 가족 연동
│   │   ├── gamification/ # 게임화
│   │   └── a11y/         # 접근성
│   ├── components/       # 공통 UI 컴포넌트
│   │   ├── buttons/      # 버튼 (큰 버튼, TTS 버튼)
│   │   ├── cards/        # 카드 UI
│   │   ├── typography/   # 텍스트 (접근성 대응)
│   │   └── layout/       # 레이아웃 (헤더, 바텀탭)
│   ├── hooks/            # 커스텀 훅
│   │   ├── useSupabase.ts
│   │   ├── useTTS.ts
│   │   ├── useVoice.ts
│   │   └── useA11y.ts
│   ├── services/         # API 호출 레이어
│   │   ├── supabase/     # Supabase 직접 조회
│   │   ├── bff/          # BFF API 호출
│   │   └── storage/      # AsyncStorage/SQLite
│   ├── navigation/       # React Navigation 설정
│   ├── theme/            # 테마 (접근성 모드별)
│   └── utils/            # 유틸리티 함수
├── app.json              # Expo 설정
├── package.json
└── tsconfig.json
```

### Key Modules

**screens/Home/**
- `HomeScreen.tsx`: 메인 화면 (오늘의 카드, 복약 체크, 음성 버튼, 게임화 요약)
- 역할: 모든 주요 기능의 진입점, 접근성 모드별 레이아웃 분기

**features/cards/**
- `CardService.ts`: 카드 조회/완료 API 호출
- `useCard.ts`: 카드 상태 관리 훅
- `CardDetail.tsx`: 카드 상세 화면 (TL;DR, body, impact, quiz)
- `QuizComponent.tsx`: 퀴즈 UI 및 채점 로직

**features/voice/**
- `VoiceService.ts`: BFF 음성 파싱 API 호출
- `useVoiceIntent.ts`: Expo Speech 통합, 음성 → 텍스트 → 인텐트
- `VoiceButton.tsx`: 마이크 버튼 UI
- `IntentConfirmDialog.tsx`: "엄마에게 전화를 걸까요?" 확인 다이얼로그

**features/gamification/**
- `GamificationService.ts`: 포인트/배지 조회
- `useGamification.ts`: 실시간 포인트 업데이트 구독
- `PointsDisplay.tsx`: 홈 상단 포인트 표시
- `BadgeList.tsx`: 배지 목록 화면

**features/a11y/**
- `A11yProvider.tsx`: 접근성 모드 전역 Context
- `useA11y.ts`: 현재 모드 및 설정값 제공 (폰트 크기, 터치 영역 등)
- `A11ySettingsScreen.tsx`: 설정 화면 (normal/easy/ultra 선택)

### Domain Separation

- **도메인별 features/ 디렉토리**: 각 도메인(cards, insights, voice 등)은 독립적인 서비스, 훅, 컴포넌트 보유
- **screens/는 조합 계층**: 여러 features를 조합하여 화면 구성
- **components/는 범용 UI**: 도메인 무관, 재사용 가능한 UI 컴포넌트만
- **services/는 데이터 레이어**: Supabase 직접 조회 vs BFF 호출 분리

**금지 사항**:
- screens/에 비즈니스 로직 직접 작성 금지 → features/로 이동
- features/ 간 직접 import 최소화 → hooks/services를 통한 간접 호출
- 플랫폼별 코드(iOS/Android)는 `Platform.select` 또는 조건부 import

## 5.2 Web Console (apps/web-next/)

### Directory Structure

```
apps/web-next/
├── app/                  # Next.js App Router
│   ├── (auth)/           # 로그인/회원가입 그룹
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/      # 대시보드 그룹 (레이아웃 공유)
│   │   ├── layout.tsx
│   │   ├── page.tsx      # 메인 대시보드
│   │   ├── seniors/      # 시니어 목록
│   │   │   └── [id]/     # 시니어 상세
│   │   ├── alerts/       # 알림 목록
│   │   └── settings/     # 설정
│   ├── api/              # API Routes (BFF 프록시, 선택적)
│   └── layout.tsx        # 루트 레이아웃
├── components/           # UI 컴포넌트
│   ├── dashboard/        # 대시보드 전용
│   │   ├── SeniorCard.tsx
│   │   ├── ActivityChart.tsx
│   │   └── AlertList.tsx
│   └── ui/               # 공통 UI (packages/ui 재사용)
├── lib/                  # 유틸리티
│   ├── supabase.ts       # Supabase 클라이언트
│   ├── bff.ts            # BFF API 호출
│   └── utils.ts
├── hooks/
│   ├── useFamilyLinks.ts
│   └── useSeniorSummary.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

### Key Modules

**(dashboard)/page.tsx**
- 역할: 가족이 관리하는 시니어 목록 카드형 표시
- 각 카드: 닉네임, 최근 활동 요약 (카드 완료, 복약 체크), 알림 배지

**(dashboard)/seniors/[id]/page.tsx**
- 역할: 특정 시니어의 상세 활동 내역
- 주간 카드 완료 캘린더, 복약 체크 히스토리, 사용량 카운터 차트
- 민감 정보 제외 (카드 내용, Q&A 본문 등)

**components/dashboard/ActivityChart.tsx**
- 역할: 주간/월간 활동 추이 시각화 (Chart.js 또는 Recharts)
- 데이터: usage_counters 집계

**lib/bff.ts**
- 역할: BFF 엔드포인트 호출 헬퍼
- 예시: `GET /bff/family/senior/{id}/summary` → 권한 확인 후 데이터 반환
- Guardian 토큰을 Authorization 헤더에 포함

### Domain Separation

- **가족 관련 기능만**: 시니어의 학습/활동 기능은 모바일 앱에만 존재
- **읽기 중심**: 쓰기 작업은 최소 (가족 링크 초대 정도)
- **프라이버시 우선**: 시니어의 구체적 행동보다 "괜찮은지" 요약만 제공

## 5.3 BFF Service (services/bff-fastapi/)

### Directory Structure

```
services/bff-fastapi/
├── app/
│   ├── main.py           # FastAPI 앱 초기화
│   ├── routers/          # API 엔드포인트 (도메인별)
│   │   ├── cards.py      # /cards/*
│   │   ├── insights.py   # /insights/*
│   │   ├── voice.py      # /voice/*
│   │   ├── scam.py       # /scam/*
│   │   ├── tools.py      # /tools/*
│   │   ├── community.py  # /community/*
│   │   ├── family.py     # /family/*
│   │   └── med.py        # /med/*
│   ├── services/         # 비즈니스 로직 레이어
│   │   ├── gamification.py  # 포인트/배지/스트릭 로직
│   │   ├── voice_parser.py  # 음성 인텐트 룰 기반 파싱
│   │   ├── scam_checker.py  # 사기검사 룰 엔진
│   │   ├── llm_client.py    # LLM API 호출 (향후)
│   │   └── notification.py  # 푸시 알림 (향후)
│   ├── models/           # Pydantic 모델
│   │   ├── card.py
│   │   ├── voice.py
│   │   ├── scam.py
│   │   └── common.py     # 공통 응답 모델
│   ├── db/               # DB 접근 레이어
│   │   ├── supabase.py   # Supabase 클라이언트 (service_role)
│   │   ├── redis.py      # Redis 클라이언트
│   │   └── queries.py    # 공통 쿼리 함수
│   ├── middleware/       # 미들웨어
│   │   ├── auth.py       # Supabase 토큰 검증
│   │   ├── rate_limit.py # Redis 기반 레이트 리미팅
│   │   └── logging.py    # 요청/응답 로깅
│   ├── utils/
│   │   ├── validators.py # 입력 검증 (금칙어, 길이 등)
│   │   └── errors.py     # 커스텀 예외 클래스
│   └── config.py         # 환경변수 설정
├── tests/                # 테스트
├── requirements.txt
├── Dockerfile
└── pyproject.toml
```

### Key Modules

**routers/cards.py**
- `POST /cards/{card_id}/complete`: 카드 완료 처리
  - 비즈니스 규칙 검증 (중복 완료 방지)
  - Supabase 업데이트 (service_role)
  - Gamification 서비스 호출 (포인트, 스트릭)
  - audit_logs 기록

**services/gamification.py**
- `award_points(user_id, amount, reason)`: 포인트 지급
  - gamification 테이블 업데이트 (트랜잭션)
  - point_transactions 로그 INSERT
  - 레벨 재계산
- `update_streak(user_id)`: 스트릭 업데이트
  - last_activity_date 비교
  - 연속이면 +1, 중단이면 0으로 리셋
- `check_and_award_badges(user_id)`: 배지 조건 확인
  - badge_definitions 조회
  - 조건 충족 시 badges_json 업데이트

**services/voice_parser.py**
- `parse_intent(text: str) -> VoiceIntent`: 룰 기반 파싱
  - 키워드 매칭 ("전화", "문자", "열어", "찾아", "알림")
  - 슬롯 추출 (정규표현식): 이름, 장소, 시간
  - 신뢰도 계산 (0.0-1.0)
  - 예시: "엄마에게 전화해 줘" → `{ intent: 'call', slots: { contact_name: '엄마' }, confidence: 0.9 }`

**services/scam_checker.py**
- `check_scam(text: str, url: str) -> ScamResult`: 사기 판정
  - 키워드 점수: "환급", "국세청", "긴급", "클릭" 등
  - URL 분석: 단축 URL, 도메인 화이트리스트, 유사 도메인
  - 점수 합산 → label 결정 (safe/warn/danger)
  - 설명 생성 (템플릿 기반)

**middleware/auth.py**
- `verify_token(request)`: Supabase JWT 검증
  - Authorization 헤더에서 토큰 추출
  - Supabase Auth API 호출로 유효성 확인
  - user_id 추출 후 request.state.user에 저장
  - 실패 시 401 Unauthorized

**middleware/rate_limit.py**
- `rate_limit(key, max_requests, window_seconds)`: Redis 기반
  - 예시: `scam_check:{user_id}`, 5회/60초
  - Redis INCR + EXPIRE
  - 초과 시 429 Too Many Requests

### Domain Separation

- **routers/는 엔드포인트 정의만**: 요청/응답 모델 정의, services/ 호출
- **services/는 비즈니스 로직**: 순수 함수 지향, 테스트 가능
- **db/는 데이터 접근**: SQL/Supabase 호출 캡슐화
- **도메인 간 의존성 최소화**: gamification은 여러 도메인에서 호출하지만, 역방향 의존 없음

**금지 사항**:
- routers/에 직접 DB 쿼리 작성 금지 → db/ 또는 services/ 경유
- services/에서 HTTP 요청 직접 처리 금지 → routers/가 담당
- 전역 상태 저장 금지 (stateless 유지)

## 5.4 Shared Packages

### packages/ui/

**목적**: 모바일(RN)과 웹(Next.js) 간 공통 UI 컴포넌트 공유 (제한적)

**구조**:
```
packages/ui/
├── src/
│   ├── Button/           # 플랫폼 무관 버튼 로직
│   ├── Typography/       # 폰트 크기 계산 유틸
│   └── theme/            # 색상, 간격 토큰
├── package.json
└── tsconfig.json
```

**현실적 제약**:
- RN과 React DOM은 컴포넌트 호환 불가 → **로직/유틸만 공유**
- 실제 렌더링은 각 플랫폼에서 구현
- 예시: `getA11yFontSize(mode: 'normal' | 'easy' | 'ultra') => number`

### packages/types/

**목적**: TypeScript 타입 정의 공유 (모바일, 웹, BFF 모두 사용)

**구조**:
```
packages/types/
├── src/
│   ├── api/              # API 요청/응답 타입
│   │   ├── cards.ts
│   │   ├── insights.ts
│   │   └── voice.ts
│   ├── db/               # DB 스키마 타입
│   │   ├── profiles.ts
│   │   ├── cards.ts
│   │   └── gamification.ts
│   ├── domain/           # 도메인 엔티티
│   │   ├── Card.ts
│   │   ├── VoiceIntent.ts
│   │   └── ScamResult.ts
│   └── common/           # 공통 타입
│       ├── enums.ts      # A11yMode, CardType, IntentType 등
│       └── pagination.ts
├── package.json
└── tsconfig.json
```

**활용**:
- BFF에서 Pydantic 모델을 TypeScript로 export (코드 생성 도구 사용 고려)
- 모바일/웹에서 API 호출 시 타입 안전성 확보
- DB 스키마 변경 시 중앙에서 타입 업데이트

## 5.5 Platform-Specific Logic

### Mobile (React Native)

**플랫폼별 기능**:
- **TTS**: `expo-speech` (iOS/Android 공통 API)
- **STT**: `expo-speech` (음성 인식)
- **Deep Link**: `Linking.openURL()` (전화, 문자, 지도)
- **푸시 알림**: `expo-notifications`
- **로컬 저장소**: `AsyncStorage` (간단 데이터), `expo-sqlite` (복잡 데이터)

**조건부 코드 예시**:
```typescript
import { Platform } from 'react-native';

const touchSize = Platform.select({
  ios: 44,      // iOS HIG 권장
  android: 48,  // Material Design 권장
});
```

### Web (Next.js)

**플랫폼별 기능**:
- **SSR/SSG**: 대시보드 초기 로딩 최적화
- **Web Speech API**: TTS (브라우저 내장, 모바일보다 품질 낮음)
- **차트 라이브러리**: Recharts 또는 Chart.js (React Native 미지원)
- **쿠키 기반 세션**: Supabase Auth 쿠키 전략

**금지 사항**:
- Web에서 Deep Link 불가 → 모바일 앱 전용 기능

### BFF (FastAPI)

**플랫폼 무관**: 모든 클라이언트에 동일한 REST API 제공

**클라이언트 구분**:
- User-Agent 헤더로 모바일/웹 구분 (선택적)
- 특정 엔드포인트는 역할 기반 제한 (guardian 전용)

---

# 6. Cross-Cutting Concerns

## 6.1 Error Handling

### Client-Side Patterns

**3단계 에러 표시**:

1. **Toast/Snackbar** (일시적 에러):
   - 네트워크 타임아웃, 일시적 서버 오류
   - 3-5초 자동 사라짐
   - 예시: "네트워크가 불안정해요. 잠시 후 다시 시도해 주세요."

2. **Inline 에러** (필드별 검증 오류):
   - 입력 폼 아래 빨간색 텍스트
   - 예시: "제목은 100자 이내로 작성해 주세요."

3. **Full-Page 에러** (치명적 오류):
   - 로그인 실패, 권한 없음, 앱 크래시
   - 전체 화면 에러 페이지 + 홈으로 돌아가기 버튼
   - 예시: "로그인이 만료되었어요. 다시 로그인해 주세요."

**에러 메시지 원칙**:
- **한국어 존댓말**: "~해요", "~주세요"
- **부정적 단어 최소화**: "실패", "오류" 대신 "불안정", "확인 필요"
- **행동 유도**: "다시 시도", "설정 확인", "가족에게 문의"
- **70대 고려**: 기술 용어 배제, 한 줄로 요약

**재시도 로직**:
- 네트워크 오류: 자동 재시도 1회 (exponential backoff)
- 서버 오류(5xx): 사용자에게 재시도 버튼 제공
- 클라이언트 오류(4xx): 재시도 불가, 입력 수정 유도

### Server-Side Patterns

**로깅 형식** (구조화된 JSON):
```json
{
  "timestamp": "2025-11-13T09:30:00Z",
  "level": "ERROR",
  "service": "bff-fastapi",
  "endpoint": "/cards/123/complete",
  "user_id": "uuid",
  "error_type": "ValidationError",
  "message": "Card already completed",
  "stack_trace": "...",
  "request_id": "req-abc123"
}
```

**에러 레벨**:
- **DEBUG**: 상세 흐름 (개발 환경만)
- **INFO**: 정상 요청 (성공한 API 호출)
- **WARN**: 비정상이지만 처리 가능 (레이트 리미팅, 중복 요청)
- **ERROR**: 예외 발생 (검증 실패, DB 오류)
- **CRITICAL**: 서비스 중단 위험 (DB 연결 끊김, Redis 장애)

**알림 트리거**:
- ERROR 5건/분 → Slack 알림
- CRITICAL 1건 → 즉시 전화/SMS

### Error Envelopes

**표준 응답 형식**:

**성공 (200 OK)**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "req-abc123",
    "timestamp": "2025-11-13T09:30:00Z"
  }
}
```

**실패 (4xx/5xx)**:
```json
{
  "success": false,
  "error": {
    "code": "CARD_ALREADY_COMPLETED",
    "message": "이미 완료한 카드예요.",
    "details": {
      "card_id": "uuid",
      "completed_at": "2025-11-13T08:00:00Z"
    }
  },
  "meta": {
    "request_id": "req-abc123",
    "timestamp": "2025-11-13T09:30:00Z"
  }
}
```

**에러 코드 네이밍**:
- `RESOURCE_NOT_FOUND`: 404
- `VALIDATION_ERROR`: 400
- `RATE_LIMIT_EXCEEDED`: 429
- `UNAUTHORIZED`: 401
- `FORBIDDEN`: 403
- `INTERNAL_SERVER_ERROR`: 500

## 6.2 Logging & Audit

### What to Log

**필수 로그**:
- 모든 API 요청/응답 (엔드포인트, 메서드, 상태 코드, 소요 시간)
- 인증/인가 이벤트 (로그인, 토큰 갱신, 권한 거부)
- 비즈니스 중요 이벤트:
  - 카드 완료, 퀴즈 제출
  - 사기검사 실행 (판정 결과 포함)
  - 음성 인텐트 파싱 (call/sms는 audit_logs에도 기록)
  - 가족 링크 생성/승인/거절
  - 복약 체크
- 에러 및 예외 (스택 트레이스 포함)
- 외부 API 호출 (LLM, 푸시 알림)

**선택적 로그**:
- 포인트 지급 (point_transactions 테이블에 기록)
- 페이지 뷰 (분석 목적)

### What NOT to Log

**절대 금지**:
- **비밀번호** (해시만 저장, 로그 제외)
- **Supabase service_role 키** (환경변수만)
- **전체 JWT 토큰** (user_id만 로그)
- **카드 번호, 계좌번호** (사용자 입력 시 마스킹: `****-1234`)
- **주민등록번호** (수집하지 않음)
- **민감한 개인정보** (건강 정보, 위치 정보 - 복약 체크는 날짜만)

**마스킹 규칙**:
- 전화번호: `010-****-5678`
- 이메일: `u***@example.com`
- 계좌번호: `****-****-1234`

### Audit Trail

**audit_logs 테이블 기록 대상**:
- 민감 작업:
  - 음성 인텐트: call, sms (실제 실행 시)
  - 사기검사 (danger 판정)
  - 가족 링크 생성/승인 (데이터 접근 권한 변경)
- 관리자 작업:
  - 스폰서 코드 생성
  - 사용자 역할 변경 (향후)
- 데이터 삭제:
  - Q&A 게시글 삭제 (soft delete)
  - 가족 링크 해제

**보관 기간**:
- audit_logs: 1년 (법적 요구사항 고려)
- 일반 로그: 30일 (압축 후 90일 보관)

## 6.3 Performance & Cost

### Caching Strategy

**Redis 캐싱**:

1. **사용자 프로필** (읽기 빈도 매우 높음):
   - Key: `profile:{user_id}`
   - TTL: 1시간
   - 갱신: 프로필 수정 시 즉시 invalidate

2. **오늘의 카드** (같은 날짜 동일 데이터):
   - Key: `card:today:{user_id}`
   - TTL: 1시간 (자정 이후 자동 만료)
   - 갱신: 완료 시 즉시 invalidate

3. **인사이트 토픽별 목록**:
   - Key: `insights:{topic}:latest`
   - TTL: 10분
   - 갱신: 신규 인사이트 발행 시 invalidate

4. **게임화 데이터** (빈번한 조회):
   - Key: `gamification:{user_id}`
   - TTL: 5분
   - 갱신: 포인트 지급 시 즉시 업데이트

5. **레이트 리미팅**:
   - Key: `ratelimit:{action}:{user_id}`
   - TTL: 60초 (window 크기)
   - 예시: `ratelimit:scam_check:uuid`, 5회/분

**클라이언트 캐싱** (모바일):
- AsyncStorage: 마지막 조회한 카드 (오프라인 대비)
- SQLite: 완료한 카드 히스토리 (7일치)
- 메모리 캐시: 현재 세션 동안 프로필, 게임화 데이터

### Pagination Requirements

**필수 페이지네이션 엔드포인트**:

1. **인사이트 목록**:
   - `GET /insights?topic=ai&page=1&limit=10`
   - 기본 limit: 10, 최대 50

2. **Q&A 목록**:
   - `GET /community/qna?subject=폰&page=1&limit=20`
   - 기본 limit: 20, 최대 100

3. **알림 목록** (가족 웹):
   - `GET /family/alerts?page=1&limit=30`
   - 기본 limit: 30, 최대 100

4. **감사 로그** (관리자):
   - `GET /admin/audit?page=1&limit=50`
   - 기본 limit: 50, 최대 200

**페이지네이션 응답 형식**:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_items": 156,
    "total_pages": 16,
    "has_next": true,
    "has_prev": false
  }
}
```

### P95 Targets

**클라이언트 측 (모바일 앱)**:
- 홈 화면 렌더링: < 1초 (초기 로딩)
- 카드 상세 조회: < 500ms
- TTS 재생 시작: < 300ms
- 음성 인텐트 파싱: < 1초 (STT 제외)

**서버 측 (BFF)**:
- 읽기 전용 API: P95 < 200ms
  - 예시: `GET /cards/today`, `GET /insights?topic=ai`
- 쓰기 API (단순): P95 < 500ms
  - 예시: `POST /cards/{id}/complete` (gamification 포함)
- 쓰기 API (복잡): P95 < 1000ms
  - 예시: `POST /voice/parse` (연락처 조회 포함)
  - 예시: `POST /scam/check` (룰 엔진 실행)

**Supabase 직접 조회**:
- 간단 SELECT: P95 < 100ms
- JOIN 쿼리: P95 < 300ms

**Redis**:
- GET/SET: P95 < 10ms (Upstash 기준)

### LLM Cost Guards

**초기 MVP는 LLM 최소 사용** (룰 기반 우선):
- 음성 파싱: 룰 기반 (정규표현식)
- 사기검사: 룰 기반 (키워드 매칭)
- Q&A 요약: 룰 기반 (첫 50자)

**향후 LLM 도입 시 가드**:

1. **입력 길이 제한**:
   - 카드 요약: 최대 1000자
   - 사기검사: 최대 2000자
   - Q&A 요약: 최대 500자

2. **월 예산 제한**:
   - 사용자당 월 10회 LLM 호출 제한
   - 전체 월 예산: $500 (토큰 수 추산)
   - Redis로 사용량 추적: `llm_usage:{user_id}:{month}`

3. **폴백 전략**:
   - LLM 실패 시 룰 기반으로 폴백
   - 타임아웃: 5초 (LLM 응답 대기)
   - 예시: Q&A 요약 실패 → 제목 복사

4. **캐싱**:
   - 동일 입력 → Redis에 24시간 캐시
   - Key: `llm:scam_check:{hash(input)}`

## 6.4 Security & Privacy

### Authentication Model

**Supabase Auth 사용**:
- **제공자**: Email/Password, 소셜 로그인 (Google, 향후 Naver/Kakao)
- **토큰**: JWT (Access Token + Refresh Token)
- **역할**: `role` 필드로 구분 (`user`, `guardian`, `org`)

**토큰 검증 흐름**:
1. 클라이언트 → API 요청 (Authorization: Bearer {token})
2. BFF middleware → Supabase Auth API 호출 (토큰 검증)
3. 유효하면 user_id 추출 → request.state.user
4. 무효하면 401 Unauthorized

**세션 관리**:
- 모바일: AsyncStorage에 토큰 저장 (보안 스토리지 고려)
- 웹: HttpOnly 쿠키 (XSS 방어)
- Refresh Token: 7일 유효, Access Token: 1시간 유효

### Row-Level Security

**Supabase RLS 정책**:

**읽기 전용 테이블 (클라이언트 직접 조회)**:
- `cards`: 본인 카드만 (`auth.uid() = user_id`)
- `insights`: 공개 인사이트만 (`is_published = true`)
- `qna_posts`: 삭제되지 않은 게시글 또는 본인 게시글
- `gamification`: 본인 데이터만

**쓰기 금지 (BFF만 가능)**:
- `cards`, `gamification`, `audit_logs` 등
- 클라이언트는 읽기 전용, BFF가 service_role로 쓰기

**다중 조건 RLS 예시** (family_links):
```sql
-- 시니어와 가족 모두 자기 링크만 조회
CREATE POLICY "Users can view own family links"
ON family_links FOR SELECT
USING (
  auth.uid() = senior_id OR auth.uid() = guardian_id
);
```

### Family Delegation

**가족 데이터 접근 규칙**:

1. **family_links 확인**:
   - guardian_id = {current_user}
   - senior_id = {target_user}
   - status = 'active'

2. **접근 가능 데이터**:
   - **프로필**: nickname, age_band, a11y_mode (민감 정보 제외)
   - **사용량**: usage_counters (집계 데이터만)
   - **카드**: 완료 여부만 (completed_at), 내용은 제외
   - **복약**: med_checks (날짜, 시간대만)

3. **접근 불가 데이터**:
   - Q&A 게시글 내용
   - 사기검사 입력 텍스트
   - 음성 인텐트 원문
   - 퀴즈 정답/오답

**권한 검증 (BFF)**:
```python
async def verify_family_access(guardian_id: UUID, senior_id: UUID):
    link = await db.get_family_link(guardian_id, senior_id)
    if not link or link.status != 'active':
        raise HTTPException(403, "접근 권한이 없습니다.")
```

### Data Access Control

**최소 권한 원칙**:
- 모바일 앱: `anon_key` 사용 (RLS 보호)
- BFF: `service_role` 사용 (RLS 우회, 코드에서 검증)
- 웹 콘솔: `anon_key` + guardian 역할 토큰

**API 키 관리**:
- 환경변수로 주입 (`.env` 파일, 절대 커밋 금지)
- CI/CD: Secret Manager 사용 (GitHub Secrets, AWS Secrets Manager)
- 로컬 개발: `.env.local` (`.gitignore`에 추가)

**HTTPS 필수**:
- 프로덕션: 모든 API는 HTTPS only
- 개발: localhost는 HTTP 허용

**CORS 설정**:
- 모바일: `*` 허용 (네이티브 앱은 CORS 무관)
- 웹: 특정 도메인만 허용 (예: `https://family.ourapp.com`)

---

# 7. 6-Week Milestone Plan (MVP)

## Week 1: Foundation & Infrastructure

### Objectives

**아키텍처 목표**:
- Monorepo 구조 확립 (apps/, services/, packages/)
- Supabase 프로젝트 초기화 (Postgres, Auth, Storage)
- Redis (Upstash) 설정
- CI/CD 파이프라인 기본 구조 (GitHub Actions)

**제품 목표**:
- 개발 환경 통일 (모든 팀원이 로컬에서 앱 실행 가능)
- 핵심 테이블 스키마 초안 완성 (profiles, cards, gamification)

### Deliverables

**인프라**:
- Supabase 프로젝트 생성 + RLS 정책 1개 (profiles 읽기)
- Redis 연결 테스트 (간단한 GET/SET)
- FastAPI 기본 구조: `/health`, `/version` 엔드포인트
- Expo 앱 초기화: 빈 화면 + Supabase Auth 연동

**데이터베이스**:
- Migration 1: `profiles`, `cards`, `gamification` 테이블 생성
- Seed 데이터: 테스트 사용자 3명 (50대, 60대, 70대 프로필)

**문서**:
- README.md: 로컬 개발 환경 설정 가이드
- CONTRIBUTING.md: 브랜치 전략, 커밋 규칙

### Demo Slice

**데모 시나리오**:
- 로컬에서 Expo 앱 실행 → 로그인 화면 표시
- 테스트 계정으로 로그인 → 빈 홈 화면 표시
- BFF `/health` 호출 → 200 OK 응답
- Supabase Admin에서 profiles 테이블 조회

### Priority Marking

- **MUST**: Monorepo, Supabase, FastAPI `/health`, Expo 초기화
- **SHOULD**: CI/CD 초안, Migration 1
- **NICE**: Seed 데이터 자동화 스크립트

---

## Week 2: Core Features - Daily Card & Auth

### Objectives

**아키텍처 목표**:
- BFF 인증 미들웨어 구현 (Supabase JWT 검증)
- RLS 정책 확장 (cards 테이블)
- 모바일 Navigation 구조 (React Navigation)

**제품 목표**:
- 사용자가 오늘의 카드를 읽고 완료할 수 있음
- 회원가입/로그인 플로우 완성
- 접근성 모드 3단계 (normal/easy/ultra) 기본 구현

### Deliverables

**모바일 (Expo)**:
- 화면: `LoginScreen`, `SignupScreen`, `HomeScreen`, `CardDetailScreen`
- 기능:
  - Email/Password 회원가입 (Supabase Auth)
  - 로그인 + 토큰 저장 (AsyncStorage)
  - 오늘의 카드 조회 (Supabase 직접 조회, RLS)
  - 카드 상세: TL;DR, body, impact 표시
  - TTS 버튼 (expo-speech로 body 읽기)
- 접근성: `A11yProvider` 구현, 폰트 크기 3단계 적용

**BFF (FastAPI)**:
- 엔드포인트:
  - `POST /cards/{id}/complete`: 카드 완료 처리
  - `POST /gamification/award`: 포인트 지급 (내부용)
- 미들웨어: `verify_token()` (JWT 검증)
- 서비스: `GamificationService.award_points()` 기본 로직

**데이터베이스**:
- Migration 2: `audit_logs`, `point_transactions` 테이블
- Seed: 카드 7개 (각 타입별)

### Demo Slice

**데모 시나리오**:
- 새 사용자 회원가입 → 프로필 생성 확인
- 로그인 → 홈 화면에서 "오늘의 카드" 표시
- 카드 클릭 → 상세 화면 (TL;DR, body, impact)
- TTS 버튼 → 음성으로 body 읽기
- "완료" 버튼 → BFF 호출 → 포인트 10점 획득

### Priority Marking

- **MUST**: 로그인, 카드 조회, 카드 완료, 포인트 지급
- **SHOULD**: TTS, 접근성 모드 3단계
- **NICE**: 회원가입 시 닉네임 설정

---

## Week 3: Insight Hub & Voice Intents

### Objectives

**아키텍처 목표**:
- BFF에 voice_parser 서비스 구현 (룰 기반)
- Redis 캐싱 첫 적용 (인사이트 목록)

**제품 목표**:
- 인사이트 허브에서 토픽별 콘텐츠 조회
- 음성 버튼으로 "엄마에게 전화해 줘" 파싱 가능
- 게임화: 스트릭 기능 추가

### Deliverables

**모바일 (Expo)**:
- 화면: `InsightHubScreen`, `InsightDetailScreen`, `VoiceIntentScreen`
- 기능:
  - 인사이트 토픽 선택 (ai, bigtech, economy, safety, mobile101)
  - 토픽별 최신 10개 조회 (Supabase RLS)
  - 인사이트 상세: body, TTS 지원
  - 반응 버튼 ("도움됐어요", "응원해요")
  - 홈 화면에 "음성 버튼" 추가
  - 음성 녹음 (expo-speech STT) → BFF 파싱 API 호출
  - 인텐트 확인 다이얼로그 ("엄마에게 전화를 걸까요?")
  - 승인 시 `Linking.openURL('tel:...')`

**BFF (FastAPI)**:
- 엔드포인트:
  - `POST /insights/{id}/react`: 반응 추가 (useful/cheer)
  - `POST /voice/parse`: 음성 텍스트 → 인텐트 파싱
- 서비스:
  - `VoiceParser.parse_intent()`: 키워드 매칭 (전화, 문자, 열어, 찾아, 알림)
  - 슬롯 추출 (정규표현식): 이름, 앱, 장소
- Redis: 인사이트 목록 10분 캐시

**데이터베이스**:
- Migration 3: `insights`, `insight_follows`, `reactions`, `voice_intents` 테이블
- Seed: 인사이트 20개 (토픽별 4개)

### Demo Slice

**데모 시나리오**:
- 인사이트 허브 진입 → "AI" 토픽 선택 → 최신 10개 리스트
- 인사이트 클릭 → 상세 본문 + TTS 재생
- "도움됐어요" 버튼 → 반응 카운트 증가 + 포인트 2점
- 홈 → 음성 버튼 탭 → "엄마에게 전화해 줘" 말하기
- BFF 파싱 → 확인 다이얼로그 → 승인 → 전화 앱 실행

### Priority Marking

- **MUST**: 인사이트 조회, 음성 파싱 (call 인텐트만)
- **SHOULD**: 반응 기능, 인사이트 TTS, 음성 5종 인텐트 (open, search, sms, remind, navigate)
- **NICE**: 인사이트 팔로우 기능

---

## Week 4: Scam Check & Tool Tracks

### Objectives

**아키텍처 목표**:
- BFF에 scam_checker 서비스 구현 (룰 기반)
- Redis 레이트 리미팅 적용 (사기검사 1분 5회)

**제품 목표**:
- 사용자가 의심스러운 문자/URL을 검사할 수 있음
- 도구 실습 트랙(미리캔버스, 캔바) 시작 가능
- 퀴즈 기능 추가 (카드 및 도구 트랙)

### Deliverables

**모바일 (Expo)**:
- 화면: `ScamCheckScreen`, `ToolTracksScreen`, `ToolTrackDetailScreen`
- 기능:
  - 사기검사: 텍스트 입력 → BFF 호출 → 판정 (safe/warn/danger)
  - 판정 결과: 라벨, 신뢰도, 설명, 행동 팁
  - 경고 색상 (빨강/노랑/초록) + 큰 아이콘
  - 도구 트랙 목록 (미리캔버스, 캔바, 소라)
  - 트랙 상세: 단계별 체크리스트, 설명, 퀴즈
  - 단계 완료 → BFF 호출 → 포인트 5점
- 카드 상세에 퀴즈 컴포넌트 추가
  - 객관식 1-3문항
  - 제출 → 채점 → 정답/오답 표시 + 설명

**BFF (FastAPI)**:
- 엔드포인트:
  - `POST /scam/check`: 사기 검사
  - `POST /tools/tracks/{id}/steps/{num}/complete`: 단계 완료
- 서비스:
  - `ScamChecker.check()`: 키워드 점수 + URL 분석
  - 키워드: "환급", "국세청", "긴급", "클릭", "당첨" 등
  - URL: 단축 URL 감지, 도메인 화이트리스트
- 미들웨어: `rate_limit()` (Redis)

**데이터베이스**:
- Migration 4: `scam_checks`, `tool_tracks`, `tools_progress` 테이블
- Seed: 도구 트랙 2개 (미리캔버스 4단계, 캔바 3단계)

### Demo Slice

**데모 시나리오**:
- 홈 → "사기검사" 진입
- 문자 복사-붙여넣기: "국세청입니다. 환급금 200만원..."
- 검사 실행 → 판정: **danger**, 신뢰도 0.85
- 설명: "환급금과 긴급 클릭은 전형적인 스미싱 수법입니다."
- 행동 팁: "절대 링크를 클릭하지 마세요. 국세청 고객센터(126)로 확인하세요."
- 도구 트랙 → "미리캔버스" 선택 → 1단계 시작
- 체크리스트 완료 + 퀴즈 정답 → 단계 완료 → 포인트 5점 + 2/4 진행률

### Priority Marking

- **MUST**: 사기검사 (텍스트만), 도구 트랙 단계 완료, 카드 퀴즈
- **SHOULD**: 사기검사 URL 분석, 레이트 리미팅
- **NICE**: 도구 트랙 3개 이상, 배지 "도구 마스터"

---

## Week 5: Community & Family Features

### Objectives

**아키텍처 목표**:
- 웹 콘솔 (Next.js) 초기화
- BFF에 가족 대시보드 API 구현
- RLS 정책: family_links, qna_posts

**제품 목표**:
- Q&A 커뮤니티 기본 기능 (작성, 조회, 투표)
- 가족 웹 대시보드에서 시니어 활동 조회
- 복약 체크 기능

### Deliverables

**모바일 (Expo)**:
- 화면: `CommunityScreen`, `QnAListScreen`, `QnADetailScreen`, `QnAWriteScreen`, `MedCheckScreen`
- 기능:
  - Q&A 주제 선택 (폰, 사기, 도구, 생활)
  - 질문 작성: 제목, 본문, 익명 옵션
  - 질문 목록: 제목, ai_summary, 투표 수
  - 질문 상세: 본문, "도움됐어요" 투표
  - 홈 화면에 "오늘 약 먹기 체크하기" 큰 버튼
  - 복약 체크 → BFF 호출 → 포인트 3점 + 스트릭 업데이트

**웹 콘솔 (Next.js)**:
- 페이지:
  - `/login`: 가족 로그인
  - `/dashboard`: 관리 중인 시니어 목록 카드
  - `/seniors/[id]`: 시니어 상세 (주간 카드 완료, 복약 히스토리, 사용량)
- 기능:
  - Supabase Auth (guardian 역할)
  - BFF API 호출 (`/family/seniors`, `/family/senior/{id}/summary`)
  - 차트: 주간 활동 추이 (Recharts)

**BFF (FastAPI)**:
- 엔드포인트:
  - `POST /community/qna`: Q&A 작성
  - `GET /community/qna?subject={subject}`: Q&A 목록
  - `POST /community/qna/{id}/vote`: 투표
  - `POST /med/check`: 복약 체크
  - `GET /family/seniors`: guardian의 시니어 목록 (family_links 조인)
  - `GET /family/senior/{id}/summary`: 시니어 활동 요약
- 서비스:
  - 금칙어 필터 (간단 키워드 블랙리스트)
  - 가족 권한 검증 (`verify_family_access`)

**데이터베이스**:
- Migration 5: `qna_posts`, `qna_votes`, `family_links`, `med_checks`, `alerts` 테이블
- Seed: Q&A 10개, 가족 링크 2개 (테스트 계정)

### Demo Slice

**데모 시나리오 (모바일)**:
- 커뮤니티 → "폰" 주제 선택 → Q&A 목록
- "질문하기" → 제목: "사진 백업 방법", 본문 작성, 익명 체크
- 제출 → 목록에 새 질문 표시
- 다른 질문 클릭 → 상세 본문 + "도움됐어요" 투표
- 홈 → "오늘 약 먹기" 버튼 → 체크 완료 → 포인트 3점 + "3일 연속!"

**데모 시나리오 (웹)**:
- 가족 로그인 → 대시보드
- 시니어 카드 2개 표시 (어머니, 아버지)
- "어머니" 클릭 → 상세 페이지
  - 주간 카드 완료: 5/7일
  - 복약 체크: 아침/점심/저녁 히스토리
  - 사용량 차트 (음성 5회, 사기검사 2회)

### Priority Marking

- **MUST**: Q&A 작성/조회, 복약 체크, 가족 대시보드 기본
- **SHOULD**: Q&A 투표, 가족 차트, 금칙어 필터
- **NICE**: Q&A 검색, 알림 기능 (alerts 테이블)

---

## Week 6: Polish, Testing & Launch Prep

### Objectives

**아키텍처 목표**:
- 통합 테스트 (E2E) 주요 플로우
- 성능 측정 (P95 목표 확인)
- 프로덕션 환경 설정 (HTTPS, CORS, 환경변수)

**제품 목표**:
- 모든 접근성 모드 검증 (normal/easy/ultra)
- 에러 메시지 한국어 통일
- 배지 시스템 완성 (10개 이상)
- 최종 UX 폴리싱 (애니메이션, 로딩 상태)

### Deliverables

**모바일 (Expo)**:
- 기능 완성:
  - 접근성 설정 화면 (모드 선택, 폰트 크기 미리보기)
  - 프로필 화면 (닉네임, 포인트, 레벨, 배지 목록, 스트릭)
  - 홈 화면 개선 (포인트 애니메이션, 스트릭 강조)
  - 모든 화면 로딩 스피너 + 에러 토스트
- 배지 10개 구현:
  - 첫 카드 완료, 7일 연속, 첫 퀴즈 정답, 사기검사 5회, 도구 트랙 완주 등
- TTS 전체 화면 지원 확인

**웹 콘솔 (Next.js)**:
- 기능 완성:
  - 가족 링크 초대 기능 (초대 코드 생성 → 시니어가 코드 입력)
  - 알림 페이지 (복약 체크, 카드 완료 알림)
- 반응형 디자인 (태블릿, 데스크톱)

**BFF (FastAPI)**:
- 성능 최적화:
  - Redis 캐싱 적용 확인 (카드, 인사이트, 프로필)
  - DB 쿼리 최적화 (N+1 제거, 인덱스 확인)
- 레이트 리미팅 전체 적용 (사기검사, Q&A 작성)
- 에러 핸들링 통일 (에러 봉투 형식)

**테스트**:
- E2E 시나리오 10개 (Detox 또는 수동):
  1. 회원가입 → 로그인 → 카드 완료
  2. 인사이트 조회 → 반응
  3. 음성 인텐트 (call)
  4. 사기검사 (danger 판정)
  5. 도구 트랙 완주
  6. Q&A 작성 → 투표
  7. 복약 체크 → 스트릭 업데이트
  8. 가족 대시보드 조회
  9. 접근성 모드 변경 (normal → ultra)
  10. 배지 획득

**문서**:
- API 문서 (FastAPI 자동 생성 Swagger UI)
- 운영 가이드: 배포 절차, 모니터링, 장애 대응

### Demo Slice

**최종 데모 (Stakeholder 대상)**:
1. **50대 사용자 시나리오** (5분):
   - 회원가입 → 오늘의 카드 (AI 트렌드) 읽기 + TTS
   - 퀴즈 정답 → 10+5 포인트 획득
   - 인사이트 "빅테크" 조회 → "도움됐어요" 반응
   - 음성: "네이버 열어 줘" → 네이버 앱 실행

2. **60대 사용자 시나리오** (5분):
   - 로그인 (쉬운 모드, 폰트 20sp)
   - 사기검사: 스미싱 문자 입력 → danger 판정 + 행동 팁
   - Q&A: "폰 화면 녹화 방법" 질문 작성
   - 복약 체크 → "3일 연속!" 메시지

3. **70대 사용자 시나리오** (3분):
   - 로그인 (초간단 모드, 폰트 28sp)
   - 홈 화면: 3개 버튼만 (카드, 복약, 음성)
   - 카드 TTS로 듣기 → "완료" 큰 버튼
   - 복약 체크 → 포인트 증가

4. **가족 대시보드 시나리오** (3분):
   - 가족 로그인 → 어머니 카드 선택
   - 주간 카드 완료: 5/7일
   - 복약 연속: 3일
   - 사용량 차트: 음성 10회, 사기검사 3회

### Priority Marking

- **MUST**: E2E 테스트 5개 이상, 접근성 검증, 배지 5개, 에러 메시지 한국어
- **SHOULD**: 배지 10개, 성능 측정 (P95), API 문서
- **NICE**: 애니메이션 폴리싱, 가족 초대 기능

---

# 8. Risks & Mitigations

## Risk 1: Over-complicated UI for 70+

### Likelihood
**Medium** - 설계 단계에서 단순화를 목표로 하지만, 기능 추가 시 복잡도 증가 가능성

### Impact
**High** - 70대가 앱을 포기하면 핵심 타겟 세그먼트 이탈

### Detection
- **조기 발견 방법**:
  - Week 2부터 70대 테스터 1-2명 초대 (주간 피드백)
  - 화면당 버튼 개수 카운트 (ultra 모드는 최대 3개 제한)
  - 가족 인터뷰: "어르신이 혼자 사용하기 어려운 부분이 있나요?"

### Mitigation
- **예방**:
  - 초간단 모드(ultra)는 홈에 버튼 3개만 (카드, 복약, 음성)
  - 모든 기능에 "건너뛰기" 옵션
  - 필수 흐름 외 기능은 "더보기" 메뉴에 숨김
- **대응**:
  - Week 3-4에 "초간단 홈" 별도 컴포넌트 개발
  - 가족 대시보드에서 "추천 모드" 제안 기능 (70대 → ultra 자동 권장)

## Risk 2: RLS Misconfiguration

### Likelihood
**Medium** - Supabase RLS는 설정 오류 시 데이터 유출 가능

### Impact
**Critical** - 다른 사용자의 카드/복약 정보 노출 → 개인정보 침해

### Detection
- **조기 발견 방법**:
  - Week 1부터 RLS 정책 테스트 자동화 (Supabase Test Suite)
  - 매주 금요일: 수동 권한 체크 (테스트 계정 A로 B의 데이터 조회 시도)
  - Supabase Dashboard에서 RLS 정책 코드 리뷰 (peer review)

### Mitigation
- **예방**:
  - 모든 테이블에 RLS 활성화 강제 (Supabase 설정)
  - 클라이언트는 `anon_key`만 사용 (service_role 절대 포함 금지)
  - BFF에서도 최소 권한 검증 (user_id 확인)
- **대응**:
  - 정책 위반 감지 시 즉시 테이블 접근 차단 + 긴급 패치
  - 영향 받은 사용자 식별 → 개인정보 유출 여부 확인 → 통지

## Risk 3: LLM Cost Spike

### Likelihood
**Low** (초기 MVP는 LLM 미사용) → **Medium** (향후 LLM 도입 시)

### Impact
**Medium** - 예산 초과 시 서비스 일부 중단 또는 품질 저하

### Detection
- **조기 발견 방법**:
  - Redis에 월별 LLM 사용량 추적 (`llm_usage:{month}`)
  - 일일 예산 50% 도달 시 Slack 알림
  - 일일 예산 80% 도달 시 경고 + 속도 제한

### Mitigation
- **예방**:
  - 초기 MVP는 룰 기반만 사용 (비용 0)
  - LLM 도입 시:
    - 사용자당 월 10회 제한
    - 입력 길이 제한 (1000자)
    - 캐싱 (Redis, 동일 입력 재사용)
- **대응**:
  - 예산 초과 시 자동으로 룰 기반 폴백
  - 월말까지 LLM 기능 일시 비활성화 (사용자에게 공지)

## Risk 4: Redis Outage

### Likelihood
**Low** - Upstash는 고가용성이지만 완전 무장애는 아님

### Impact
**Medium** - 캐싱/레이트 리미팅 실패 → 성능 저하, 악용 가능성

### Detection
- **조기 발견 방법**:
  - BFF에서 Redis 연결 실패 시 ERROR 로그 + Slack 알림
  - Health check 엔드포인트에 Redis 상태 포함
  - 매분 자동 핑 (Upstash 대시보드 모니터링)

### Mitigation
- **예방**:
  - Redis 연결 실패 시 graceful degradation:
    - 캐싱 실패 → Supabase 직접 조회 (느리지만 작동)
    - 레이트 리미팅 실패 → 제한 없이 허용 (단기간 악용 감수)
  - Redis 타임아웃 1초 설정 (장애 시 빠른 폴백)
- **대응**:
  - Upstash 장애 확인 → 상태 페이지 확인
  - 대체 Redis 인스턴스 준비 (Failover, NICE)
  - 복구 후 캐시 워밍 (주요 데이터 미리 로드)

## Risk 5: Overscoped Community Features

### Likelihood
**High** - 커뮤니티는 요구사항이 끝없이 확장됨 (댓글, 좋아요, 신고, 검색 등)

### Impact
**Medium** - 개발 일정 지연, MVP 출시 지연

### Detection
- **조기 발견 방법**:
  - Week 5 중간 체크: Q&A 기본 기능만 구현되었는지 확인
  - 기능 요청 시 "MUST/SHOULD/NICE" 재분류
  - 팀 회의: "이 기능이 없으면 MVP 출시 불가한가?" 질문

### Mitigation
- **예방**:
  - MVP 범위 명확화: Q&A 작성, 조회, 단일 투표만
  - 댓글, 이미지 첨부, 신고 기능은 **POST-MVP**
  - Week 5는 3일만 커뮤니티에 할당 (나머지는 가족 기능)
- **대응**:
  - 범위 초과 감지 시 즉시 중단 → NICE로 이동
  - 출시 후 사용자 피드백으로 우선순위 재조정

## Risk 6: TTS/Voice Recognition Quality

### Likelihood
**Medium** - expo-speech는 OS 의존, 디바이스마다 품질 차이

### Impact
**Medium** - 음성 기능 불만 → 70대 사용자 이탈

### Detection
- **조기 발견 방법**:
  - Week 3부터 다양한 디바이스 테스트 (iOS, Android, 저가형 폰)
  - 음성 인식 실패율 로깅 (BFF에서 `confidence < 0.5` 비율 추적)
  - 사용자 피드백: "음성 기능 만족도" 설문 (5점 척도)

### Mitigation
- **예방**:
  - TTS는 모든 텍스트에 선택적 제공 (필수 아님)
  - 음성 인식 실패 시 명확한 안내: "다시 말씀해 주세요" + 예시 문장
  - 소음 환경 감지 → "조용한 곳에서 시도해 주세요" 힌트
- **대응**:
  - 인식률 < 60% → 외부 STT API 도입 고려 (Google Cloud Speech, 비용 검토)
  - 대체 입력 방법 제공 (텍스트로 인텐트 입력)

## Risk 7: Family Dashboard Complexity

### Likelihood
**Medium** - 가족이 원하는 정보와 시니어 프라이버시 균형이 어려움

### Impact
**Medium** - 가족 불만 (정보 부족) 또는 시니어 불만 (감시받는 느낌)

### Detection
- **조기 발견 방법**:
  - Week 5 가족 인터뷰: "보고 싶은 정보가 더 있나요?"
  - 시니어 인터뷰: "가족이 내 정보를 보는 것이 불편한가요?"
  - 대시보드 사용 로그 분석 (어떤 페이지를 자주 보는지)

### Mitigation
- **예방**:
  - 프라이버시 우선: 구체적 내용 제외, 요약만 제공
  - 대시보드 메인: "괜찮은지" 한눈에 (카드 완료율, 복약 연속)
  - 상세 페이지: 날짜별 집계 (카드 제목은 숨김)
- **대응**:
  - 피드백 기반 조정: "카드 제목 보기" 옵션 추가 (시니어 동의 필요)
  - 프라이버시 설정: 시니어가 가족에게 보여줄 정보 선택

## Risk 8: Data Migration Issues

### Likelihood
**Low** (초기 MVP는 신규 데이터만) → **Medium** (향후 스키마 변경 시)

### Impact
**High** - 마이그레이션 실패 → 데이터 손실 또는 서비스 중단

### Detection
- **조기 발견 방법**:
  - 모든 마이그레이션은 로컬에서 먼저 테스트
  - Supabase Migration 파일 버전 관리 (Git)
  - 프로덕션 마이그레이션 전 백업 자동화 (pg_dump)

### Mitigation
- **예방**:
  - Week 1-2에 주요 테이블 스키마 확정 (변경 최소화)
  - 컬럼 추가는 허용, 삭제/타입 변경은 신중 검토
  - `ALTER TABLE` 대신 새 테이블 + 데이터 복사 + 원자적 스왑
- **대응**:
  - 마이그레이션 실패 시 즉시 롤백 (Supabase 백업 복원)
  - 다운타임 최소화: 읽기 전용 모드 → 마이그레이션 → 정상화

## Risk 9: Third-Party API Dependencies

### Likelihood
**Low** (초기 MVP는 Supabase, Redis, Expo만) → **Medium** (향후 LLM, 푸시 등)

### Impact
**Medium** - 외부 API 장애 → 일부 기능 불가

### Detection
- **조기 발견 방법**:
  - BFF에서 외부 API 호출 타임아웃 로깅
  - 외부 API 응답 시간 모니터링 (P95)
  - 상태 페이지 구독 (Supabase Status, Upstash Status)

### Mitigation
- **예방**:
  - 중요 기능은 외부 API 의존도 최소화 (카드 조회는 Supabase만)
  - 외부 API 호출에 타임아웃 설정 (3-5초)
  - Circuit Breaker 패턴 (연속 실패 시 일시 차단)
- **대응**:
  - LLM 실패 → 룰 기반 폴백
  - 푸시 알림 실패 → 앱 내 알림으로 대체
  - Supabase 장애 → 서비스 중단 공지 (대체 불가능)

## Risk 10: Accessibility Compliance

### Likelihood
**Medium** - WCAG 2.1 AA 준수는 세부 요구사항 많음

### Impact
**Medium** - 접근성 미달 → 70대 사용 불가, 법적 리스크 (장애인차별금지법)

### Detection
- **조기 발견 방법**:
  - Week 2부터 접근성 자동 검사 도구 (axe, Lighthouse)
  - 매주 1회 수동 체크: 스크린 리더 테스트 (TalkBack, VoiceOver)
  - 터치 타겟 크기 측정 (개발자 도구)

### Mitigation
- **예방**:
  - 컴포넌트 개발 시 접근성 우선:
    - 터치 영역 최소 44x44dp (normal), 80x80dp (ultra)
    - 색상 대비 최소 4.5:1 (WCAG AA)
    - 모든 아이콘 버튼에 라벨 (accessibilityLabel)
  - TTS 지원을 모든 주요 텍스트에 기본 제공
- **대응**:
  - Week 6에 접근성 전담 테스트 2일 할당
  - 미달 항목 발견 시 우선순위 MUST로 상향 → 출시 전 필수 해결

---

# 9. Acceptance Criteria for MVP

## 9.1 End-to-End Flows

### Critical User Journeys

**MVP 출시 전 반드시 작동해야 하는 시나리오**:

1. **회원가입 → 로그인 → 첫 카드 완료** (50/60/70대 공통):
   - 이메일/비밀번호 회원가입 → 프로필 생성 확인
   - 로그인 → 홈 화면 표시
   - 오늘의 카드 조회 → 상세 화면
   - TTS 재생 (선택적)
   - 퀴즈 풀기 → 정답 확인
   - "완료" 버튼 → 포인트 10+5점 획득 → 애니메이션

2. **인사이트 조회 → 반응** (50/60대):
   - 인사이트 허브 진입 → 토픽 선택 (ai)
   - 최신 10개 리스트 표시
   - 인사이트 클릭 → 상세 본문 + TTS
   - "도움됐어요" 버튼 → 카운트 증가 + 포인트 2점

3. **음성 인텐트: 전화 걸기** (60/70대):
   - 홈 → 음성 버튼 탭
   - "엄마에게 전화해 줘" 말하기
   - BFF 파싱 → 확인 다이얼로그 표시
   - 승인 → 전화 앱 실행

4. **사기검사: 스미싱 감지** (60대):
   - 홈 → 사기검사 진입
   - 의심 문자 붙여넣기
   - 검사 실행 → danger 판정 + 설명 + 행동 팁
   - 포인트 3점

5. **도구 트랙 완주** (50대):
   - 도구 트랙 목록 → 미리캔버스 선택
   - 1단계 시작 → 체크리스트 + 퀴즈 완료 → 단계 완료
   - 2-4단계 반복
   - 트랙 완주 → 배지 "도구 마스터" 획득 + 포인트 20점

6. **Q&A 작성 → 투표** (50/60대):
   - 커뮤니티 → 폰 주제 → "질문하기"
   - 제목 + 본문 작성 → 제출
   - 다른 사용자가 조회 → "도움됐어요" 투표
   - 작성자 포인트 1점

7. **복약 체크 → 스트릭** (60/70대):
   - 홈 → "오늘 약 먹기" 버튼
   - 체크 완료 → 포인트 3점
   - 3일 연속 → "3일 연속!" 메시지 + 스트릭 표시

8. **가족 대시보드 조회** (가족):
   - 웹 로그인 (guardian 계정)
   - 대시보드 → 시니어 목록 카드
   - 시니어 클릭 → 상세 페이지 (주간 카드 5/7, 복약 히스토리)

9. **접근성 모드 변경** (70대):
   - 프로필 → 접근성 설정
   - 초간단 모드(ultra) 선택
   - 홈 화면 → 버튼 3개만 + 폰트 28sp + 터치 80x80dp

10. **배지 획득** (50/60/70대 공통):
    - 첫 카드 완료 → "첫걸음" 배지
    - 7일 연속 카드 → "꾸준한 학습자" 배지
    - 프로필에서 배지 목록 확인

### Success Metrics

**각 시나리오에 대한 성공 기준**:

- **완료율**: 테스트 사용자 10명 중 최소 8명이 시나리오 완료
- **오류 없음**: 치명적 에러 (앱 크래시, 데이터 손실) 0건
- **사용자 피드백**: "이해하기 쉬웠다" 평균 4점 이상 (5점 척도)
- **소요 시간**:
  - 회원가입 → 첫 카드 완료: 5분 이내 (70대 10분)
  - 사기검사: 1분 이내
  - 복약 체크: 10초 이내

## 9.2 Accessibility Requirements

### WCAG Compliance Level

**목표**: WCAG 2.1 AA 준수 (최소)

**필수 체크리스트**:

1. **색상 대비**:
   - 일반 텍스트: 최소 4.5:1
   - 큰 텍스트 (18sp 이상): 최소 3:1
   - 경고/위험 색상은 색상만으로 구분 금지 (아이콘 병행)

2. **키보드 접근성** (웹만 해당):
   - 모든 기능 키보드로 접근 가능
   - Tab 순서 논리적
   - Focus 표시 명확

3. **스크린 리더 지원**:
   - 모든 버튼/링크에 명확한 라벨
   - 이미지에 대체 텍스트 (decorative 이미지는 제외)
   - 상태 변화 알림 (예: "포인트가 10점 증가했습니다")

4. **시간 제한 없음**:
   - 세션 타임아웃 최소 30분
   - 타임아웃 전 경고 + 연장 옵션

### TTS Coverage

**TTS 필수 제공 텍스트**:
- 카드: TL;DR, body, impact, 퀴즈 문제/해설
- 인사이트: 본문 전체
- 에러 메시지: 중요 에러 (네트워크 오류, 권한 필요)
- 사기검사 결과: 판정 + 설명 + 행동 팁

**TTS 제외**:
- 버튼 라벨 (스크린 리더가 읽음)
- 짧은 토스트 메시지 (3초 내 사라짐)

**TTS 품질**:
- 한국어 음성 (OS 기본 TTS 엔진 사용)
- 재생 속도 조절 가능 (0.8x, 1.0x, 1.2x)
- 일시정지/재개 버튼

### Touch Target Sizes

**모드별 최소 크기**:
- **Normal**: 44x44dp (iOS HIG 권장)
- **Easy**: 60x60dp
- **Ultra**: 80x80dp

**간격**:
- 버튼 간 최소 8dp (normal), 16dp (easy), 24dp (ultra)

**예외**:
- 긴 텍스트 링크는 높이만 44dp 이상 (너비는 텍스트 길이)

## 9.3 Performance Targets

### Client-Side Latency

**모바일 앱 (Expo)**:

- **초기 로딩** (스플래시 → 홈):
  - Normal: < 2초
  - 3G 네트워크: < 5초

- **화면 전환**:
  - 네비게이션 애니메이션: 60fps (16ms/frame)
  - 데이터 로딩 포함: < 1초

- **카드 조회**:
  - Supabase 직접 조회: P95 < 500ms
  - 캐시 히트: < 100ms

- **TTS 재생 시작**:
  - 버튼 클릭 → 첫 소리: < 300ms

- **음성 인식**:
  - STT 완료 → 인텐트 파싱: < 1초

### Server-Side P95

**BFF (FastAPI)**:

- **읽기 API**:
  - `GET /cards/today`: < 200ms
  - `GET /insights?topic=ai`: < 300ms

- **쓰기 API (단순)**:
  - `POST /cards/{id}/complete`: < 500ms (gamification 포함)
  - `POST /med/check`: < 400ms

- **쓰기 API (복잡)**:
  - `POST /voice/parse`: < 1000ms (연락처 조회 포함)
  - `POST /scam/check`: < 800ms (룰 엔진 실행)

- **Supabase 직접 조회**:
  - 간단 SELECT: P95 < 100ms
  - JOIN 쿼리: P95 < 300ms

### Cache Hit Rates

**Redis 캐싱 목표**:

- **사용자 프로필**: 80% 이상
- **오늘의 카드**: 70% 이상 (아침 피크 시간)
- **인사이트 목록**: 60% 이상

**측정 방법**:
- Redis 명령어 카운트: `INFO stats` (keyspace_hits / keyspace_misses)
- BFF 로그: 캐시 히트 여부 기록

## 9.4 Analytics & Metrics

### Required Events

**MVP 출시 시 추적해야 하는 최소 이벤트**:

1. **사용자 온보딩**:
   - `user_signup` (age_band, a11y_mode)
   - `user_login`

2. **카드 관련**:
   - `card_viewed` (card_id, type)
   - `card_completed` (card_id, quiz_score)
   - `card_tts_played` (card_id)

3. **인사이트**:
   - `insight_viewed` (insight_id, topic)
   - `insight_reacted` (insight_id, reaction_type)

4. **음성 인텐트**:
   - `voice_intent_parsed` (intent, confidence)
   - `voice_intent_executed` (intent, success)

5. **사기검사**:
   - `scam_check_performed` (label, confidence)

6. **도구 트랙**:
   - `tool_step_completed` (track_id, step_num)

7. **커뮤니티**:
   - `qna_post_created` (subject, is_anon)
   - `qna_post_voted` (post_id)

8. **복약**:
   - `med_check_completed` (time_slot, streak)

9. **게임화**:
   - `points_awarded` (amount, reason)
   - `badge_earned` (badge_id)
   - `streak_updated` (current_streak)

10. **접근성**:
    - `a11y_mode_changed` (from, to)

### Dashboard Views

**관리자/운영팀용 대시보드 필수 뷰**:

1. **일일 활성 사용자 (DAU)**:
   - 연령대별 (50/60/70)
   - 접근성 모드별 (normal/easy/ultra)

2. **기능별 사용률**:
   - 카드 완료율 (전체 사용자 중 오늘 카드 완료한 비율)
   - 음성 인텐트 사용자 수
   - 사기검사 사용자 수
   - Q&A 작성자 수

3. **성능 메트릭**:
   - BFF API P95 레이턴시 (엔드포인트별)
   - 에러율 (4xx, 5xx)
   - 캐시 히트율

4. **게임화 현황**:
   - 평균 포인트 (연령대별)
   - 평균 스트릭
   - 배지 획득 분포

5. **가족 대시보드 사용**:
   - 활성 가족 링크 수
   - 가족 대시보드 조회 수

### Alert Thresholds

**즉시 알림이 필요한 상황**:

1. **에러율 급증**:
   - 5분간 5xx 에러 > 5% → Slack 알림
   - 특정 엔드포인트 에러율 > 10% → 즉시 조사

2. **성능 저하**:
   - P95 레이턴시 > 목표의 2배 (예: 카드 조회 > 1000ms)
   - Redis 응답 시간 > 50ms

3. **보안 이슈**:
   - 동일 IP에서 1분간 로그인 실패 > 10회 → 차단 고려
   - RLS 정책 위반 시도 감지 (audit_logs)

4. **비즈니스 이상**:
   - 일일 카드 완료율 < 30% (평소 50%) → 원인 조사
   - 사기검사 danger 판정 비율 > 80% (평소 20%) → 룰 오류 의심

5. **인프라**:
   - Supabase/Redis 연결 실패 → 즉시 알림
   - 디스크/메모리 사용률 > 80%

---

## 최종 요약

- **섹션 7**: 6주 마일스톤 계획 (주차별 목표, 산출물, 데모, 우선순위)
- **섹션 8**: 10가지 리스크 (UI 복잡도, RLS, LLM 비용, Redis, 커뮤니티, TTS, 가족, 마이그레이션, API 의존, 접근성) 및 완화 방안
- **섹션 9**: MVP 수락 기준 (E2E 시나리오 10개, 접근성 요구사항, 성능 목표, 분석 이벤트, 알림 임계값)

**이 계획 문서(`docs/PLAN.md`)는 이제 완성되었습니다.** 모든 엔지니어, 디자이너, PM이 참조하여 MVP 구현을 진행할 수 있습니다.
