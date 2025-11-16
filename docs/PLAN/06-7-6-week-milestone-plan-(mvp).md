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
