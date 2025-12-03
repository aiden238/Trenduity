# Trenduity 문서 인덱스

**최종 업데이트**: 2025-12-02  
**프로젝트**: 50-70대 시니어 AI 학습 앱  
**상태**: IMPLEMENT 단계 (65% 완료)

---

## 🗺️ 문서 구조

```
docs/
├── README.md                    (이 파일 - 네비게이션 인덱스)
├── ISSUES/                      🔴 이슈 트래킹
├── SETUP/                       🟢 설치 및 배포
├── WORK/                        🟡 작업 세션 관리
├── PLAN/                        📘 기획 문서
├── IMPLEMENT/                   📗 구현 가이드
├── SCAFFOLD/                    🏗️ 뼈대 구축
├── SEED/                        🌱 시드 데이터
└── TEST/                        🧪 테스트
```

---

## 🚀 빠른 시작

### 처음 시작하는 개발자
1. [프로젝트 개요](../README.md) - 전체 소개
2. [설치 가이드](./SETUP/02-python-docker-setup.md) - Python, Docker 설치
3. [아키텍처](./PLAN/01-2-architecture-overview.md) - 시스템 구조
4. [구현 규칙](./IMPLEMENT/01-implementation-rules.md) - 코딩 규칙

### 배포하려는 개발자
1. [배포 가이드](./SETUP/03-deployment-setup.md) - Render 배포
2. [환경 변수 설정](./SETUP/03-deployment-setup.md#2-환경-변수-설정)
3. [검증 체크리스트](./ISSUES/FIX_CHECKLIST.md)

### 문제 해결이 필요한 개발자
1. [이슈 트래커](./ISSUES/README.md) - P0/P1 수정 사항
2. [백엔드 이슈](./ISSUES/BACKEND_ISSUES.md)
3. [프론트엔드 이슈](./ISSUES/FRONTEND_ISSUES.md)

---

## 🔴 이슈 트래킹 (ISSUES/)

### [📋 이슈 트래커](./ISSUES/README.md)
전체 이슈 현황 및 완료 상태 (63% 완료)

### [🔧 백엔드 이슈](./ISSUES/BACKEND_ISSUES.md)
- P0: 4개 수정 완료 ✅
- P1: 4개 수정 완료 ✅
- P2: 2개 연기 ⏸️
- 성능: qna.py 91% 향상

### [📱 프론트엔드 이슈](./ISSUES/FRONTEND_ISSUES.md)
- P0: 4개 수정 완료 ✅
- expo-dev-client, React 18.2.0, app.json, 환경변수

### [✅ 수정 체크리스트](./ISSUES/FIX_CHECKLIST.md)
- Frontend: 4개 ✅
- Backend: 6개 ✅
- 통합 테스트: 5개 (대기 중)

---

## 🟢 설치 및 배포 (SETUP/)

### [🔧 Python/Docker 설치](./SETUP/02-python-docker-setup.md)
- Python 3.11 설치 (Windows)
- Docker Desktop 설치
- 가상환경 생성
- 설치 검증 체크리스트

### [🚀 배포 가이드](./SETUP/03-deployment-setup.md)
- Render.com 배포 (BFF API)
- 환경 변수 설정 (Supabase 키)
- Vercel 배포 (Web Dashboard)
- 트러블슈팅

---

## 🟡 작업 세션 관리 (WORK/)

### [📝 세션 관리 가이드](./WORK/README.md)
- 세션 재개 체크리스트
- 일반적인 문제 해결
- 작업 템플릿

### [🔄 다음 세션 재개](./WORK/NEXT_SESSION_RESUME.md)
- 현재 진행 중인 작업
- 환경 설정 체크리스트
- 빠른 재개 명령어

### [📚 아카이브](./WORK/ARCHIVE/)
- [2025-11-21 마이그레이션](./WORK/ARCHIVE/session-2025-11-21-migration.md)
- [2025-11-21 통합 테스트](./WORK/ARCHIVE/session-2025-11-21-integration.md)

---

## 📘 기획 문서 (PLAN/)

### [📄 프로젝트 개요](./PLAN/01-project-overview.md)
타겟, 핵심 가치, MVP 범위

### [🏗️ 아키텍처](./PLAN/01-2-architecture-overview.md)
- 모노레포 구조
- BFF 패턴
- 데이터 흐름 (읽기/쓰기 분리)

### [🧩 도메인 분해](./PLAN/02-3-domain-&-feature-decomposition.md)
8개 도메인, 기능 분해

### [💾 데이터 모델](./PLAN/03-4-data-model-overview.md)
Supabase 테이블 스키마

### [🗂️ 모듈 책임](./PLAN/04-5-module-&-file-responsibility-map.md)
파일별 역할 및 책임

### [⚙️ 횡단 관심사](./PLAN/05-6-cross-cutting-concerns.md)
인증, 에러 처리, 로깅, A11y

### [📅 6주 계획](./PLAN/06-7-6-week-milestone-plan-(mvp).md)
주차별 마일스톤

### [⚠️ 리스크](./PLAN/07-8-risks-&-mitigations.md)
위험 요소 및 완화 전략

### [✅ 인수 기준](./PLAN/08-9-acceptance-criteria-for-mvp.md)
MVP 완료 조건

---

## 📗 구현 가이드 (IMPLEMENT/)

### [📏 구현 규칙](./IMPLEMENT/01-implementation-rules.md)
- diff-first 원칙
- 에러 처리 패턴
- 네이밍 컨벤션

### [🎮 게임화](./IMPLEMENT/02-daily-card-gamification.md)
포인트, 배지, 스트릭 시스템

### [📊 Insight Hub](./IMPLEMENT/03-insight-hub.md)
주간 인사이트, 캐싱

### [🎤 음성 UI](./IMPLEMENT/04-voice-intents.md)
TTS, 음성 명령

### [🚨 사기 체크](./IMPLEMENT/05-scam-check.md)
룰 기반 + LLM 검증

### [🛤️ Tool Tracks](./IMPLEMENT/06-tool-tracks.md)
복약, 건강 체크

### [💬 커뮤니티](./IMPLEMENT/07-community-qna.md)
Q&A, 투표 시스템

### [👨‍👩‍👧 가족 연동](./IMPLEMENT/08-family-med-check.md)
가족 대시보드, 알림

### [♿ 접근성](./IMPLEMENT/09-a11y-wiring.md)
3단계 모드, TTS, 색상 대비

---

## 🏗️ 뼈대 구축 (SCAFFOLD/)

### [🔧 워크스페이스 설정](./SCAFFOLD/01-workspace-setup.md)
모노레포 초기화

### [📦 공유 패키지](./SCAFFOLD/02-shared-packages.md)
packages/ui, packages/types

### [📱 모바일 앱](./SCAFFOLD/03-mobile-app.md)
Expo, React Native

### [🌐 웹 콘솔](./SCAFFOLD/04-web-console.md)
Next.js, 가족 대시보드

### [⚙️ BFF 서비스](./SCAFFOLD/05-bff-service.md)
FastAPI, 라우터 구조

### [🛠️ 인프라 스크립트](./SCAFFOLD/06-infra-scripts.md)
Docker, 시드 데이터

---

## 🌱 시드 데이터 (SEED/)

### [📝 시드 데이터 설계](./SEED/01-seed-data-design.md)
데이터 구조, 카테고리

### [💾 DB 시드 스크립트](./SEED/02-db-seed-scripts.md)
Supabase 초기 데이터

### [👤 데모 프로필](./SEED/03-demo-profiles.md)
테스트 사용자 (50대/60대/70대)

### [🔌 시드 데이터 연동](./SEED/04-wiring-seed-data.md)
BFF와 Mobile 연결

---

## 🧪 테스트 (TEST/)

### [🔬 BFF 단위 테스트](./TEST/01-bff-unit-tests.md)
FastAPI 라우터 테스트

### [📋 DTO 스키마 테스트](./TEST/02-dto-schema-tests.md)
Pydantic 검증

### [🧩 컴포넌트 테스트](./TEST/03-component-tests.md)
React Native 컴포넌트

### [🎭 E2E 스모크 테스트](./TEST/04-e2e-smoke-tests.md)
Playwright 시나리오

### [♿ A11y 체크](./TEST/05-a11y-checks.md)
접근성 자동 검증

### [🔄 CI 통합](./TEST/06-ci-integration.md)
GitHub Actions

### [🔗 통합 테스트](./WORK/ARCHIVE/session-2025-11-21-integration.md)
Redis + Members 페이지

---

## 📊 기타 문서

### 프로젝트 진행 상황
- [작업 진행 트래커](./WORK_PROGRESS_TRACKER.md)
- [완료 보고서](./COMPLETION_REPORT.md)
- [E2E 테스트 결과](./E2E_TEST_RESULTS.md)

### 환경 설정
- [환경 변수](./ENVIRONMENT.md)
- [Supabase 설정](./SUPABASE_SETUP_GUIDE.md)
- [Metro 터널 가이드](./METRO_TUNNEL_GUIDE.md)

### 성능 및 접근성
- [성능 가이드](./PERFORMANCE.md)
- [접근성 감사](./ACCESSIBILITY_AUDIT.md)

### UI 관련
- [UI 컴포넌트](./UI/)
- [수동 웹 UI 테스트](./MANUAL_WEB_UI_TEST_GUIDE.md)

---

## 🔍 문서 검색 팁

### 키워드로 찾기
- **설치**: SETUP/ 디렉터리
- **에러**: ISSUES/ 디렉터리
- **API**: IMPLEMENT/ + SCAFFOLD/ 디렉터리
- **테스트**: TEST/ 디렉터리
- **배포**: SETUP/03-deployment-setup.md

### 파일 이름 패턴
- `01-`, `02-`: 순서대로 읽어야 하는 문서
- `README.md`: 각 디렉터리의 인덱스
- `*-ISSUES.md`: 문제 트래킹
- `*-GUIDE.md`: 실행 가이드
- `session-*.md`: 과거 작업 기록

---

## 📞 긴급 참조

### 즉시 필요한 문서
- [이슈 트래커](./ISSUES/README.md) - 현재 문제 상황
- [수정 체크리스트](./ISSUES/FIX_CHECKLIST.md) - 검증 방법
- [배포 가이드](./SETUP/03-deployment-setup.md) - 프로덕션 배포

### Copilot AI 지침
- [Copilot 지침서](../.github/copilot-instructions.md) - AI 에이전트용 규칙

---

## ✅ 문서 상태

| 디렉터리 | 문서 수 | 상태 | 최종 업데이트 |
|---------|--------|------|--------------|
| ISSUES/ | 4 | ✅ 완료 | 2025-12-02 |
| SETUP/ | 2 | ✅ 완료 | 2025-12-02 |
| WORK/ | 4 | ✅ 완료 | 2025-12-02 |
| PLAN/ | 9 | ✅ 완료 | 2025-11-17 |
| IMPLEMENT/ | 9 | ✅ 완료 | 2025-11-17 |
| SCAFFOLD/ | 6 | ✅ 완료 | 2025-11-17 |
| SEED/ | 4 | ✅ 완료 | 2025-11-17 |
| TEST/ | 7 | ✅ 완료 | 2025-11-21 |

---

**프로젝트 홈**: [../README.md](../README.md)  
**문서 버전**: 1.0  
**작성자**: AI Copilot
