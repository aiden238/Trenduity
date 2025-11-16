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
