# 50-70대 AI 학습 앱 MVP

> **타겟 사용자**: 50-70대 시니어  
> **문제 해결**: 디지털 격차, AI/트렌드/사기 정보 부족  
> **핵심 가치**: 찾지 않아도 이해되는 3분 카드 + 음성으로 끝나는 실행 + 가족의 조용한 서포트

---

## 📱 프로젝트 소개

**50-70대를 위한 AI 학습 앱**은 디지털 세대 격차를 해소하고, 시니어가 AI와 최신 기술을 **쉽고 안전하게** 배울 수 있도록 돕는 모바일/웹 플랫폼입니다.

### 해결하는 문제

- 📚 **정보 과부하**: 너무 많은 정보 속에서 무엇을 봐야 할지 모름
- 🤔 **복잡한 UI**: 작은 버튼, 어려운 용어, 많은 단계
- 😰 **사기 불안**: 스미싱, 피싱 등 디지털 사기에 대한 두려움
- 👨‍👩‍👧 **가족 걱정**: 부모님이 잘 사용하는지 확인하고 싶은 자녀들

### 핵심 가치

1. **📖 찾지 않아도 한 번에 이해되는 3분 카드**
   - 매일 하나의 주제를 300-500자로 압축
   - 퀴즈로 즉시 확인, 포인트/배지로 동기부여

2. **🗣️ 버튼 몇 개, 음성으로 끝나는 실행 경험**
   - 전화 걸기, 알림 설정, 검색 등 6가지 음성 명령
   - 복잡한 앱 설치 없이 기본 기능 활용

3. **👨‍👩‍👧 가족/기관이 뒤에서 quietly 서포트**
   - 자녀/손주가 웹 대시보드에서 학습 진도/복약 체크 확인
   - 과도한 개입 없이 필요할 때만 도움

---

## 🎯 주요 기능

### 1. 📖 오늘의 한 가지 (Daily Card + Quiz)
- 매일 3분 분량의 학습 카드 제공
- AI 활용법, 최신 트렌드, 디지털 안전, 생활 팁
- 퀴즈로 이해도 확인, 정답 시 포인트 획득

### 2. 💡 인사이트 허브 (Insight Hub)
- 5개 토픽(AI/빅테크/경제/안전/모바일101)별 인사이트
- 관심 토픽 팔로우, TTS로 음성 읽기
- 실시간 업데이트 (향후 LLM 연동 시)

### 3. 🎤 음성 인텐트 (Voice Intents)
- 6가지 명령: 전화 걸기, 문자 보내기, 검색, 알림, 길찾기, 앱 열기
- 한국어 자연어 처리 → 의도 파악 → 확인 → 실행
- "엄마에게 전화해 줘", "내일 아침 9시에 약 먹으라고 알림"

### 4. 🚨 사기검사 (Scam Check)
- SMS/URL 사기 패턴 탐지 (긴급/승인/즉시송금/단축URL)
- 3단계 위험도 (안전/경고/위험) + 실행 가능한 팁
- 가족과 결과 공유

### 5. 🛠️ 도구 트랙 (Tool Tracks)
- 미리캔버스, 캔바, Sora 등 AI 도구 단계별 튜토리얼
- 각 단계 완료 시 포인트 획득
- 외부 앱/웹 연동

### 6. 💬 라이트 커뮤니티 (Q&A)
- 질문 게시 (익명 가능)
- 리액션 (👍❤️😮), 투표
- AI 요약 (향후 LLM 연동 시)

### 7. 👨‍👩‍👧 가족 연동 & 복약 체크
- 자녀/손주가 시니어 계정 연동
- 웹 대시보드에서 학습 통계, 복약 체크 확인
- 7일 캘린더, 월간 통계

### 8. 🎮 게이미피케이션
- 포인트/스트릭/배지 시스템
- 카드 완료 30pt, 퀴즈 완벽 20pt, 연속 학습 보너스 5pt
- 배지: 첫 카드, 7일 연속, 퀴즈 마스터 등

### 9. ♿ 접근성 (A11y)
- 3단계 모드: normal(기본), easy(쉬움), ultra(초대형)
- 폰트 크기 18-32dp, 버튼 48-64dp
- WCAG 2.1 AA 준수, 고대비 색상

---

## 🏗️ 기술 스택

```
┌─────────────────────────────────────────────┐
│              👤 사용자                       │
└─────────────┬───────────────────────────────┘
              │
     ┌────────┴────────┐
     │                 │
┌────▼─────┐    ┌─────▼──────┐
│  모바일   │    │    웹      │
│ (React   │    │ (Next.js)  │
│  Native) │    │            │
└────┬─────┘    └─────┬──────┘
     │                │
     └────────┬───────┘
              │
        ┌─────▼──────┐
        │    BFF     │
        │ (FastAPI)  │
        └─────┬──────┘
              │
     ┌────────┴────────┐
     │                 │
┌────▼─────┐    ┌─────▼──────┐
│    DB    │    │   Redis    │
│(Supabase)│    │  (Cache)   │
└──────────┘    └────────────┘
```

### 상세 스택

- **모바일**: Expo React Native (TypeScript) + TanStack Query + Zustand
- **웹**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **BFF**: FastAPI (Python 3.11) + Pydantic v2 + SQLAlchemy
- **데이터**: Supabase (Postgres + Auth + RLS) + Redis (캐싱)
- **인프라**: Vercel (웹) + Railway/Fly.io (BFF) + Supabase Cloud
- **모노레포**: pnpm Workspaces + Turborepo

---

## 🚀 빠른 시작

### 필수 도구 설치

```bash
# Node.js 20+
node --version  # v20.x.x

# Python 3.11+
python --version  # Python 3.11.x

# pnpm
npm install -g pnpm

# Docker (로컬 DB용)
docker --version
```

### 1. 저장소 클론 및 의존성 설치

```bash
# 클론
git clone <repo-url>
cd project

# 의존성 설치 (모노레포 전체)
pnpm install

# Python 의존성 (BFF)
cd apps/bff-fastapi
pip install -r requirements.txt
```

### 2. 환경 변수 설정

```bash
# 루트에 .env 파일 생성
cp .env.example .env

# 필수 변수 설정
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### 3. 로컬 개발 서버 실행

```bash
# Terminal 1: BFF (FastAPI)
cd apps/bff-fastapi
uvicorn main:app --reload --port 8000

# Terminal 2: Web (Next.js)
cd apps/web-next
pnpm dev  # http://localhost:3000

# Terminal 3: Mobile (Expo)
cd apps/mobile-rn
pnpm start  # QR 코드로 Expo Go 앱에서 실행
```

### 4. 시드 데이터 삽입

```bash
# DB에 샘플 데이터 삽입
cd scripts/
python seed_data.py

# 결과 확인
# - Cards: 8개
# - Insights: 15개
# - Q&A: 5개
# - Demo Users: 3명
```

### 5. 테스트 실행

```bash
# 린트 + 타입 체크
pnpm lint
pnpm typecheck

# 전체 테스트
pnpm test

# BFF 테스트
cd apps/bff-fastapi
pytest
```

---

## 🎬 데모 시나리오

### 시니어 사용자 플로우

1. **📱 앱 실행** → 홈 화면에서 "오늘의 카드" 확인
2. **📖 카드 읽기** → "AI란 무엇인가요?" 3분 카드 읽기
3. **❓ 퀴즈 풀기** → 3문제 중 3개 정답 → 50pt 획득
4. **🎤 음성 명령** → "엄마에게 전화해 줘" → 확인 후 전화 연결
5. **🚨 사기검사** → 의심스러운 문자 입력 → "위험" 판정 + 팁 제공
6. **💊 복약 체크** → 오늘의 혈압약 복용 체크 → 가족에게 알림

### 가족 사용자 플로우 (웹)

1. **💻 웹 대시보드 접속** → http://localhost:3000/dashboard
2. **👨‍👩‍👧 가족 목록 확인** → "김민수 (50대)" 클릭
3. **📊 통계 확인** → 7일 연속 학습, 카드 7개 완료, 포인트 200pt
4. **💊 복약 기록** → 최근 7일 모두 체크 완료 → 안심

---

## 📚 문서

- **[PLAN](./docs/PLAN/index.md)**: 요구사항, 아키텍처, 도메인 모델, 마일스톤
- **[SCAFFOLD](./docs/SCAFFOLD/index.md)**: 모노레포 구조, 폴더 조직
- **[IMPLEMENT](./docs/IMPLEMENT/index.md)**: 기능별 구현 가이드 (9개 문서)
- **[SEED](./docs/SEED/index.md)**: 시드 데이터 설계 및 스크립트
- **[TEST](./docs/TEST/index.md)**: 유닛/통합/E2E 테스트 전략
- **[ARCHITECTURE](./docs/ARCHITECTURE.md)**: 시스템 아키텍처 상세
- **[API Reference](./docs/API.md)**: BFF API 엔드포인트
- **[UX & A11y](./docs/UX_A11Y.md)**: UX 원칙 및 접근성 가이드
- **[Operations](./docs/OPERATIONS_FUTURE.md)**: 배포 및 향후 계획

---

## 🤝 기여

### 브랜치 전략

- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치

### PR 체크리스트

- [ ] Lint 통과 (`pnpm lint`)
- [ ] 타입 체크 통과 (`pnpm typecheck`)
- [ ] 테스트 통과 (`pnpm test`)
- [ ] 문서 업데이트 (필요 시)
- [ ] 커밋 메시지 컨벤션 준수 (`feat:`, `fix:`, `docs:`)

---

## 📄 라이센스

MIT License

---

## 📞 문의

- **이메일**: project@example.com
- **GitHub Issues**: [Issue Tracker](https://github.com/...)

---

**프로젝트 시작일**: 2025년 11월 13일  
**버전**: MVP v1.0  
**마지막 업데이트**: 2025년 11월 13일
