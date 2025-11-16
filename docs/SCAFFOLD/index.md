# SCAFFOLD Step - 프로젝트 스캐폴딩 가이드

> 이 문서는 50-70대 AI 학습 앱 MVP의 초기 프로젝트 구조 및 설정을 안내합니다.

---

## 📋 개요

**SCAFFOLD 단계의 목적**:
- PLAN 단계가 완료된 후, 실제 코드베이스의 뼈대를 구축
- 모노레포 구조, 설정, 실행 가능한 최소 스켈레톤 초기화
- 타입 체크 및 빌드가 가능한 상태로 준비 (비즈니스 로직 구현 전)
- 이후 IMPLEMENT/SEED/TEST/DOCS 단계가 기능 로직에 집중할 수 있도록 기반 마련

**핵심 원칙**:
- ✅ **컴파일 가능한 스켈레톤만**: 모든 앱이 빌드/실행 가능
- ✅ **모듈 간 올바른 import/export**: 타입 안전성 확보
- ❌ **비즈니스 로직 없음**: 실제 쿼리, 규칙, LLM 호출은 TODO로 남김
- ❌ **테스트 스위트 없음**: 이후 단계에서 추가
- ❌ **시드 데이터 없음**: 이후 단계에서 추가

---

## 📁 문서 구조

이 폴더는 SCAFFOLD 단계의 작업을 6개 영역으로 나누어 관리합니다:

1. **[01-workspace-setup.md](./01-workspace-setup.md)** - 모노레포 및 도구 설정
2. **[02-shared-packages.md](./02-shared-packages.md)** - UI 토큰 및 공통 타입
3. **[03-mobile-app.md](./03-mobile-app.md)** - Expo React Native 스켈레톤
4. **[04-web-console.md](./04-web-console.md)** - Next.js 웹 콘솔 스켈레톤
5. **[05-bff-service.md](./05-bff-service.md)** - FastAPI BFF 스켈레톤
6. **[06-infra-scripts.md](./06-infra-scripts.md)** - 인프라 및 개발 스크립트

---

## 🎯 프로젝트 컨텍스트 (요약)

**제품**: 50-70대 AI 학습 앱

**기술 스택**:
- **Mobile**: Expo React Native (TypeScript)
- **Web**: Next.js (App Router)
- **BFF**: FastAPI (Python)
- **Data**: Supabase (Postgres + Auth + RLS + Storage)
- **Cache**: Redis (Upstash)

**핵심 모듈** (9개 도메인):
1. Daily Cards/Quizzes (오늘의 카드)
2. Insight Hub (인사이트 허브)
3. Voice Intents 6종 (음성 인텐트)
4. Scam Check (사기 검사)
5. Tool Tracks (도구 실습: 미리캔버스/캔바/소라)
6. Light Community (커뮤니티 Q&A)
7. Family & Med Check (가족 연동 + 복약)
8. Gamification (게임화)
9. A11y Modes (접근성 3단계)

---

## 🗂️ 최종 레포지토리 구조

```
repo/
├── apps/
│   ├── mobile-expo/          # Expo RN 모바일 앱
│   └── web-next/              # Next.js 웹 콘솔
├── services/
│   └── bff-fastapi/           # FastAPI BFF 서비스
├── packages/
│   ├── ui/                    # 공통 UI 컴포넌트 및 디자인 토큰
│   └── types/                 # 공유 TypeScript 타입 및 Zod 스키마
├── infra/
│   ├── dev/                   # 개발 환경 (Docker Compose)
│   └── ci/                    # CI/CD 설정 (향후)
├── scripts/                   # 개발 및 배포 스크립트
├── docs/                      # 문서 (PLAN, SCAFFOLD 등)
├── .gitignore
├── package.json               # 루트 워크스페이스 설정
├── tsconfig.base.json         # TypeScript 기본 설정
├── .eslintrc.js               # ESLint 공통 설정
├── .prettierrc                # Prettier 설정
├── .env.example               # 환경변수 예시
└── README.md                  # 프로젝트 개요
```

---

## 📖 문서별 상세 내용

### 1️⃣ [Workspace Setup](./01-workspace-setup.md)
**워크스페이스 및 도구 설정**

- 루트 package.json (모노레포 워크스페이스 설정)
- tsconfig.base.json (공통 TypeScript 설정)
- ESLint + Prettier 설정
- 기본 스크립트 (dev, lint, test, typecheck, format)

### 2️⃣ [Shared Packages](./02-shared-packages.md)
**공유 패키지: UI 및 Types**

- **packages/ui**: 디자인 토큰, 기본 컴포넌트
  - A11y 토큰 (normal/easy/ultra 모드)
  - Typography, Button, Card, SectionHeader
- **packages/types**: DTO 및 스키마
  - Zod 스키마 + TypeScript 타입
  - card, insight, qna, reaction, gamification 등

### 3️⃣ [Mobile App](./03-mobile-app.md)
**Expo React Native 스켈레톤**

- 기본 앱 구조 및 네비게이션 (React Navigation)
- 더미 화면 (Home, Insights, Courses, Settings 등)
- A11y 컨텍스트 및 TTS 훅 스텁
- Supabase 클라이언트 설정 스텁

### 4️⃣ [Web Console](./04-web-console.md)
**Next.js 웹 콘솔 스켈레톤**

- App Router 구조
- 주요 라우트 (대시보드, 회원 목록, 알림 등)
- Supabase 브라우저 클라이언트 스텁
- packages/ui 컴포넌트 통합

### 5️⃣ [BFF Service](./05-bff-service.md)
**FastAPI BFF 스켈레톤**

- FastAPI 앱 구조
- 라우터별 플레이스홀더 엔드포인트
- Pydantic 스키마 (DTO 매칭)
- CORS 미들웨어 및 환경 설정

### 6️⃣ [Infra & Scripts](./06-infra-scripts.md)
**인프라 및 개발 스크립트**

- Docker Compose (Postgres, Redis)
- 부트스트랩 스크립트
- 개발 서버 실행 스크립트
- .env.example 및 README.md

---

## 🚀 빠른 시작 가이드

### 1단계: 의존성 설치
```bash
# 루트에서
npm install
# 또는
pnpm install
```

### 2단계: 환경 변수 설정
```bash
cp .env.example .env
# .env 파일 편집 (Supabase 키 등)
```

### 3단계: 개발 환경 실행
```bash
# Docker Compose 시작 (Postgres, Redis)
cd infra/dev
docker-compose up -d

# BFF 서버 시작
cd services/bff-fastapi
uvicorn app.main:app --reload

# 웹 콘솔 시작
cd apps/web-next
npm run dev

# 모바일 앱 시작
cd apps/mobile-expo
npm start
```

---

## ✅ 완료 체크리스트

### 워크스페이스 설정
- [ ] 루트 package.json 설정
- [ ] tsconfig.base.json 생성
- [ ] ESLint + Prettier 설정
- [ ] 기본 스크립트 정의

### 공유 패키지
- [ ] packages/ui - 디자인 토큰 (a11y)
- [ ] packages/ui - 기본 컴포넌트 4개
- [ ] packages/types - DTO 스키마 (Zod)

### 모바일 앱
- [ ] Expo 앱 초기화
- [ ] React Navigation 설정
- [ ] 더미 화면 8개 생성
- [ ] A11y 컨텍스트 및 TTS 훅

### 웹 콘솔
- [ ] Next.js App Router 설정
- [ ] 주요 라우트 5개 생성
- [ ] Supabase 클라이언트 스텁

### BFF 서비스
- [ ] FastAPI 앱 구조
- [ ] 라우터 6개 (플레이스홀더)
- [ ] Pydantic 스키마
- [ ] /health 엔드포인트

### 인프라 & 스크립트
- [ ] Docker Compose (Postgres, Redis)
- [ ] bootstrap.sh 스크립트
- [ ] dev.sh 스크립트
- [ ] .env.example 생성
- [ ] README.md 작성

---

## 📝 TODO 마커 컨벤션

코드에 남길 TODO 주석 형식:

```typescript
// TODO(SCAFFOLD): 비즈니스 로직 구현 필요
// TODO(IMPLEMENT): Supabase 쿼리 추가
// TODO(SEED): 테스트 데이터 필요
```

---

## 🔗 관련 문서

- **PLAN 문서**: `docs/PLAN/` - 전체 프로젝트 계획
- **아키텍처 개요**: `docs/PLAN/01-2-architecture-overview.md`
- **모듈 구조**: `docs/PLAN/04-5-module-&-file-responsibility-map.md`

---

## 📊 진행 상황 추적

| 영역 | 상태 | 담당자 | 완료일 |
|------|------|--------|--------|
| Workspace Setup | ⏳ 대기 | - | - |
| Shared Packages | ⏳ 대기 | - | - |
| Mobile App | ⏳ 대기 | - | - |
| Web Console | ⏳ 대기 | - | - |
| BFF Service | ⏳ 대기 | - | - |
| Infra & Scripts | ⏳ 대기 | - | - |

**상태 범례**:
- ⏳ 대기
- 🚧 진행 중
- ✅ 완료
- ⚠️ 블로커

---

## 💡 주의사항

1. **비즈니스 로직 금지**: 이 단계에서는 실제 쿼리, 규칙, 계산 로직을 구현하지 않습니다.
2. **플레이스홀더 사용**: 모든 함수는 `return {"status": "TODO"}` 같은 더미 응답 반환.
3. **타입 안전성 우선**: 컴파일/빌드가 성공해야 합니다.
4. **문서화**: 각 TODO에는 명확한 주석을 남깁니다.

---

**작성일**: 2025년 11월 13일  
**버전**: 1.0  
**작성자**: AI Scaffolding Assistant
