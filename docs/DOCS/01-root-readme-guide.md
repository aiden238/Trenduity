# 01. Root README.md 작성 가이드

> **목적**: 프로젝트 루트의 `README.md`를 작성하여 개발자와 비개발자 모두가 프로젝트를 이해할 수 있도록 합니다.  
> **대상 독자**: 개발자 + 비개발자 (교수님, 심사위원, 파트너 등)  
> **출력**: `README.md` (프로젝트 루트)

---

## 📋 개요

Root README는 **프로젝트의 첫인상**입니다. 다음 질문에 답해야 합니다:

- **이게 뭔데?** → 프로젝트 한글 요약
- **왜 만들었는데?** → 문제 정의 & 핵심 가치
- **어떻게 써?** → 빠른 시작 가이드
- **누가 써?** → 타겟 사용자

---

## 🎯 포함해야 할 섹션

### 1. 프로젝트 한글 요약

#### 타겟 사용자

```markdown
## 프로젝트 소개

**Trenduity**는 50-70대 시니어를 위한 AI 학습 앱입니다.

### 타겟 사용자

- **50대**: 디지털 기기 익숙, 새로운 트렌드에 관심 많음
- **60대**: 기기 사용 가능하지만 복잡한 UI 어려움, 실용적 정보 선호
- **70대**: 기본 앱 사용만 가능, 음성 인터페이스 필요, 가족 지원 필수
```

#### 문제 정의

```markdown
### 해결하는 문제

1. **디지털 격차**: 빠르게 변화하는 디지털 환경에서 소외됨
2. **AI/트렌드 정보 부족**: ChatGPT, 생성형 AI 등을 이해하고 활용하기 어려움
3. **사기 피해**: 보이스피싱, 스미싱 등에 취약
```

#### 핵심 가치 제안 (3가지)

```markdown
### 핵심 가치

✅ **쉽고 재밌게**: 오늘의 한 가지 카드 + 퀴즈로 부담 없이 학습  
✅ **실용적**: AI 도구(Canva, ChatGPT) 실습, 사기 검사, 복약 관리  
✅ **안전하게**: 가족 대시보드로 사용 현황 모니터링, 접근성 3단계 지원
```

---

### 2. 주요 기능 요약

```markdown
## 주요 기능

### 📚 학습 기능

1. **오늘의 한 가지 (Daily Card)**

   - 하루 한 가지 AI/트렌드 카드 제공
   - 간단한 퀴즈로 이해도 확인
   - 완료 시 포인트/배지 획득

2. **인사이트 허브 (Insight Hub)**

   - AI, 건강, 금융, 여가 등 주제별 인사이트 모음
   - 관심 주제 팔로우
   - TTS(음성 읽기) 지원

3. **음성 인텐트 (Voice Intents)**
   - "전화해줘", "문자 보내줘", "검색해줘" 등 6가지 음성 명령
   - 한국어 자연어 처리

### 🛡️ 안전 기능

4. **사기검사 (Scam Check)**
   - 의심스러운 문자/URL 위험도 판정
   - 대응 팁 제공

### 🛠️ 실습 기능

5. **도구 트랙 (Tool Tracks)**
   - Canva, 미리캔버스, Sora 등 AI 도구 단계별 실습
   - 완료 시 게임화 포인트

### 💬 커뮤니티

6. **라이트 커뮤니티 (Light Community)**
   - 익명 Q&A
   - 리액션 (👍, ❤️, 🙏)

### 👨‍👩‍👧‍👦 가족 연동

7. **가족/복약/게임화**
   - 가족 초대 및 권한 위임
   - 복약 체크리스트
   - 웹 대시보드로 사용량 모니터링

### ♿ 접근성

8. **3단계 접근성 모드**
   - Normal / Easy / Ultra
   - 폰트 크기, 버튼 크기, 간격 자동 조정
```

---

### 3. 기술 스택 텍스트 다이어그램

```markdown
## 기술 스택

### 아키텍처 개요
```

[모바일 앱 (React Native)]
↕️
[BFF (FastAPI)]
↕️
[DB (Supabase Postgres + Auth + RLS + Storage)]
↕️
[Cache (Redis)]

[웹 콘솔 (Next.js)] → [BFF] → [DB]

```

### 상세 스택
- **Frontend**
  - Mobile: Expo React Native + TypeScript
  - Web Console: Next.js 14 (App Router) + TypeScript
  - UI: Shared design system (`@repo/ui`)

- **Backend**
  - BFF: FastAPI + Pydantic v2
  - Auth: Supabase Auth (JWT)
  - DB: Supabase Postgres (Row-Level Security)
  - Cache: Redis (Upstash compatible)

- **Infrastructure**
  - Monorepo: Turborepo
  - Deployment: Vercel (Web), Expo EAS (Mobile), Fly.io (BFF)
  - CI/CD: GitHub Actions
```

---

### 4. 빠른 시작 (Quick Start)

````markdown
## 빠른 시작

### 필수 설치 도구

- **Node.js**: v20+ (권장: v20.11.0)
- **Python**: 3.11+
- **Docker**: 최신 버전 (Redis 로컬 실행용)
- **pnpm**: `npm install -g pnpm`

### 로컬 개발 단계

#### 1. 의존성 설치

\```bash

# 루트 디렉터리에서

pnpm install

# BFF 의존성

cd services/bff-fastapi
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
\```

#### 2. 환경 변수 설정

\```bash

# 루트에 .env 파일 생성

cp .env.example .env

# 필수 환경 변수 설정

# - SUPABASE_URL

# - SUPABASE_ANON_KEY

# - REDIS_URL

\```

#### 3. Dev 환경 실행

\```bash

# 터미널 1: BFF 실행

cd services/bff-fastapi
uvicorn app.main:app --reload --port 8000

# 터미널 2: 모바일 앱 실행

cd apps/mobile-rn
pnpm dev # Expo 개발 서버 시작

# 터미널 3: 웹 콘솔 실행

cd apps/web-console
pnpm dev # Next.js 개발 서버 시작
\```

#### 4. Seed 실행

\```bash

# DB 시드 데이터 삽입

cd scripts
python seed_db.py
\```

#### 5. 테스트 실행

\```bash

# 전체 테스트

pnpm test

# BFF 단위 테스트

cd services/bff-fastapi
pytest

# 모바일 컴포넌트 테스트

cd apps/mobile-rn
pnpm test
\```

---

### 데모 시나리오 (Quick Demo)

#### 시니어 사용자 플로우

1. **로그인**: 시니어 계정으로 로그인
2. **오늘의 카드 보기**: 홈 화면에서 오늘의 AI 카드 읽기
3. **퀴즈 풀기**: 카드 내용 관련 3지선다 퀴즈 완료
4. **포인트 획득**: 5포인트 + 정답당 2포인트 획득
5. **복약 체크**: 오늘의 약 복용 체크
6. **음성 인텐트**: "전화해줘 김민수" 음성 명령 실행

#### 가족 사용자 플로우

1. **웹 콘솔 로그인**: 가족 계정으로 웹 콘솔 접속
2. **대시보드 확인**: 시니어의 오늘 활동 확인 (카드 완료, 복약 체크)
3. **알림 확인**: 복약 미체크 시 알림 수신
````

---

### 5. 프로젝트 구조 (선택)

````markdown
## 프로젝트 구조

\```
Trenduity/
├── apps/
│ ├── mobile-rn/ # Expo React Native 앱
│ └── web-console/ # Next.js 웹 콘솔
├── services/
│ └── bff-fastapi/ # FastAPI BFF
├── packages/
│ ├── ui/ # 공유 UI 컴포넌트
│ └── types/ # 공유 TypeScript 타입
├── infra/
│ └── supabase/ # DB 마이그레이션/함수
├── scripts/
│ └── seed_db.py # 시드 데이터 스크립트
└── docs/ # 문서
├── PLAN/ # 계획서
├── IMPLEMENT/ # 구현 가이드
├── SEED/ # 시드 가이드
├── TEST/ # 테스트 가이드
└── DOCS/ # 문서화 가이드
\```
````

---

### 6. 추가 문서 링크

```markdown
## 추가 문서

- **[아키텍처 개요](./docs/ARCHITECTURE.md)**: 시스템 구조 및 데이터 플로우
- **[API 레퍼런스](./docs/API.md)**: 전체 엔드포인트 문서
- **[UX & 접근성 가이드](./docs/UX_A11Y.md)**: 연령대별 UX 원칙
- **[운영 가이드](./docs/OPERATIONS_FUTURE.md)**: 배포 및 모니터링
- **[기획 문서](./docs/PLAN/index.md)**: MVP 전체 계획
```

---

### 7. 라이선스 & 기여

```markdown
## 라이선스

MIT License

## 기여

풀 리퀘스트는 언제나 환영합니다! 기여 전에 다음을 확인해 주세요:

1. `docs/IMPLEMENT/01-implementation-rules.md` 읽기
2. 코드 스타일 가이드 준수 (TypeScript strict, Python PEP 8)
3. 접근성 우선 (WCAG 2.1 AA)

## 문의

- **프로젝트 리드**: [이름] ([이메일])
- **이슈 트래커**: [GitHub Issues 링크]
```

---

## ✅ 체크리스트

README 작성 완료 후 확인:

### 내용

- [ ] 프로젝트 한글 요약 (타겟 사용자, 문제 정의, 핵심 가치)
- [ ] 주요 기능 7-8개 bullet으로 요약
- [ ] 기술 스택 텍스트 다이어그램
- [ ] 빠른 시작 (설치 → 실행 → 시드 → 테스트)
- [ ] 데모 시나리오 (시니어 + 가족 플로우)

### 형식

- [ ] 제목 계층 구조 명확 (# → ## → ###)
- [ ] 코드 블록에 언어 태그 (`bash, `typescript)
- [ ] 이모지 적절히 사용 (가독성 향상)
- [ ] 링크 모두 작동

### 독자 테스트

- [ ] 비개발자가 읽고 프로젝트 이해 가능
- [ ] 개발자가 읽고 10분 내 로컬 환경 구축 가능
- [ ] 심사위원이 읽고 핵심 가치 파악 가능

---

## 💡 작성 팁

### 비개발자를 위한 섹션

- 프로젝트 소개 (타겟 사용자, 문제, 가치)
- 주요 기능 요약
- 데모 시나리오

### 개발자를 위한 섹션

- 기술 스택
- 빠른 시작
- 프로젝트 구조
- 추가 문서 링크

### 명확한 언어

- ✅ "오늘의 한 가지 카드 제공" (명확)
- ❌ "Daily card feature implementation" (불명확)

### 시각적 구조

- 이모지로 섹션 구분 (📚, 🛡️, 🛠️)
- 코드 블록으로 명령어 강조
- Bullet으로 목록 정리

---

## 🔗 다음 단계

README 작성 완료 후:

- **다음**: [02. Architecture Doc](./02-architecture-doc.md) - 시스템 아키텍처 문서화

---

**문서 작성**: AI Documentation Guide  
**최종 업데이트**: 2025년 11월 14일
