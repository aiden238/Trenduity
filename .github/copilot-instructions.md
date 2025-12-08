# Trenduity - 50-70대 AI 학습 앱 Copilot 지침서

> 시니어를 위한 디지털 리터러시 학습 플랫폼의 모노레포 프로젝트입니다.

## 🎯 프로젝트 본질

**타겟**: 50-70대 시니어와 그들의 가족  
**핵심 가치**: 3분 학습 카드 + 음성 UI + 가족 대시보드  
**현재 단계**: SCAFFOLD 완료 (뼈대 구축, 비즈니스 로직 구현 중)

## 🏗️ 아키텍처 이해하기

### 모노레포 구조
```
Trenduity/
├── apps/
│   ├── mobile-expo/      # 시니어용 모바일 앱 (Expo RN + TS)
│   └── web-next/         # 가족용 대시보드 (Next.js 14 App Router)
├── services/
│   └── bff-fastapi/      # BFF 레이어 (FastAPI + Python 3.11)
├── packages/
│   ├── ui/               # 공유 컴포넌트 + 접근성 토큰
│   └── types/            # 공유 TypeScript 타입
├── scripts/              # 부트스트랩, 시드 데이터, 배포
└── docs/                 # PLAN, SCAFFOLD, IMPLEMENT 가이드
```

### 데이터 흐름 패턴 (중요!)
1. **읽기 (Read)**: 클라이언트 → Supabase Direct (RLS 보호) ✅
2. **쓰기 (Write)**: 클라이언트 → BFF → Supabase (service_role) ✅
3. **비즈니스 로직**: 항상 BFF에서 처리 (게임화, 사기검사, 외부 API)

**예시**: 카드 읽기는 모바일 앱이 직접 Supabase 조회, 카드 완료는 BFF를 통해 포인트/배지 계산 후 저장

### 레이어별 책임
- **Mobile**: UI/UX, 접근성 모드, TTS, Supabase 읽기, BFF 쓰기 호출
- **Web**: 가족 대시보드, 활동 모니터링, BFF 조회
- **BFF**: 모든 쓰기, 게임화, 복잡한 조인, 외부 API, 감사 로그
- **Supabase**: 영구 저장, Auth, RLS, Storage
- **Redis**: 캐싱, 레이트 리미팅, 세션

## 🏛️ 핵심 아키텍처 결정 (변경 금지)

**상세 내용**: `.github/ADR.md` 참조

### 요약
- **ADR-001**: 모든 쓰기 작업은 BFF 경유 (보안, 게임화 로직 중앙 집중)
- **ADR-002**: 3단계 A11y 모드 (Normal/Easy/Ultra, 시니어 UX 최적화)
- **ADR-003**: Envelope 패턴 (`{ ok, data?, error? }`, 일관성과 타입 안전성)

## ⚠️ 흔한 실수와 안티패턴 (반드시 피할 것)

### 1. ❌ 클라이언트에서 직접 Supabase 쓰기
```typescript
// ❌ 절대 금지 - 게임화 로직 누락, 감사 로그 없음
await supabase.from('cards').update({ 
  completed_at: new Date() 
}).eq('id', cardId);

// ✅ 항상 BFF 경유
const response = await fetch('/v1/cards/complete', {
  method: 'POST',
  body: JSON.stringify({ card_id: cardId })
});
```
**이유**: 포인트 부여, 배지 확인, 스트릭 계산 등 비즈니스 로직이 BFF에 있음

### 2. ❌ 영어 에러 메시지
```python
# ❌ 시니어가 이해 불가
raise HTTPException(status_code=404, detail="Card not found")

# ✅ 한국어 + 행동 가능한 안내
raise HTTPException(status_code=404, detail={
    "ok": False,
    "error": {
        "code": "CARD_NOT_FOUND",
        "message": "카드를 찾을 수 없어요. 새로고침 해보세요."
    }
})
```

### 3. ❌ A11y 토큰 무시하고 하드코딩
```typescript
// ❌ 접근성 모드 변경 시 깨짐
<Text style={{ fontSize: 16 }}>제목</Text>
<Button style={{ height: 44 }}>버튼</Button>

// ✅ A11y 컨텍스트 사용
const { fontSizes, buttonHeight } = useA11y();
<Text style={{ fontSize: fontSizes.heading1 }}>제목</Text>
<Button style={{ height: buttonHeight }}>버튼</Button>
```

### 4. ❌ accessibilityLabel 누락
```typescript
// ❌ 스크린리더 사용자 이해 불가
<TouchableOpacity onPress={handleDelete}>
  <TrashIcon />
</TouchableOpacity>

// ✅ 명확한 한국어 설명
<TouchableOpacity 
  onPress={handleDelete}
  accessibilityLabel="이 카드 삭제하기"
  accessibilityHint="버튼을 누르면 카드가 영구적으로 삭제됩니다"
>
  <TrashIcon />
</TouchableOpacity>
```

### 5. ❌ Envelope 패턴 무시
```typescript
// ❌ 불일치한 응답 형식
return { data: result };  // ok 필드 없음

// ✅ 항상 Envelope 패턴
return { ok: true, data: result };
```

### 6. ❌ 로그에 PII 포함
```python
# ❌ 개인정보 노출
logger.info(f"User {user_name} (phone: {phone}) completed card")

# ✅ user_id만 기록
logger.info(f"User {user_id} completed card")
```

## 🚨 핵심 제약사항 (반드시 준수)

### React/React Native 버전 고정 (Critical!)
- **고정 버전**: `react@19.1.0`, `react-native@0.81.5` (Expo SDK 54 호환)
- ✅ 루트 `package.json`의 `overrides`로 전체 워크스페이스 버전 통일
- ✅ `packages/*`에서 react/react-native는 반드시 `peerDependencies`로 선언
- ❌ `dependencies`에 react/react-native 직접 선언 금지 (중복 설치 → Metro 번들링 실패)

```json
// packages/ui/package.json 예시 (올바른 방식)
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-native": ">=0.70.0"
  }
}

// 루트 package.json (버전 강제 고정)
{
  "overrides": {
    "react": "19.1.0",
    "react-native": "0.81.5"
  }
}
```

### diff-first 원칙
- ❌ 전체 파일 재작성 금지
- ❌ 신규 의존성 추가 금지
- ❌ 신규 디렉터리 생성 금지
- ✅ 최소 변경으로 기능 추가
- ✅ 기존 패턴/레이어 유지

### 보안 규칙
- ❌ 시크릿 하드코딩 절대 금지
- ✅ 모든 키는 `.env` + `.env.example` 관리
- ❌ 클라이언트에 `service_role` 키 노출 금지
- ✅ 로그에 PII(이름, 전화번호) 포함 금지

### 타입 안전성
- TypeScript: `strict: true` (모든 TS 파일)
- Python: Pydantic v2 (모든 DTO)
- 런타임 전 타입 체크 통과 필수

## 🛠️ 개발 워크플로

### 초기 설정
```powershell
# 1. 의존성 설치 및 Docker 시작
.\Trenduity\scripts\bootstrap.ps1

# 2. .env 설정 (Supabase 키 필요)
cp .env.example .env

# 3. 개발 서버 실행
.\Trenduity\scripts\dev.ps1
```

### 일상 작업
```powershell
# BFF 개발 (FastAPI)
cd Trenduity\services\bff-fastapi
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# 모바일 개발 (Expo)
cd Trenduity\apps\mobile-expo
npm start

# 웹 개발 (Next.js)
cd Trenduity\apps\web-next
npm run dev
```

### 검증 (Done 정의)
```powershell
# TypeScript/JavaScript
npm run lint          # ESLint 통과
npm run typecheck     # tsc 타입 체크 통과
npm run format:check  # Prettier 통과

# Python (BFF)
cd Trenduity\services\bff-fastapi
black --check app/    # 포맷 검증
ruff app/             # 린트 통과
pytest -q             # 테스트 통과
```

## 📝 네이밍 컨벤션

### TypeScript
- 컴포넌트: `PascalCase` (예: `TodayCardScreen`, `QuizSection`)
- 훅: `use*` (예: `useTodayCard`, `useA11yContext`)
- 유틸 함수: `camelCase` (예: `fetchTodayCard`, `handleApiError`)
- 인터페이스: `PascalCase` (예: `TodayCardData`, `ApiResponse`)

### Python
- 함수: `snake_case` (예: `get_today_card`, `award_points`)
- 클래스: `PascalCase` (예: `GamificationService`, `CardRepository`)
- 상수: `UPPER_SNAKE_CASE` (예: `MAX_QUIZ_QUESTIONS`, `BASE_POINTS`)
- 변수: `snake_case` (예: `user_id`, `card_data`)

### 파일 구조
- React 컴포넌트: `ComponentName.tsx`
- 훅: `useHookName.ts`
- API 라우터(BFF): `resource.py` (예: `cards.py`, `insights.py`)
- 서비스(BFF): `services/resource_service.py`

## ♿ 접근성 (A11y) - 프로젝트 차별화 요소

### 3단계 모드
- **Normal**: 폰트 18dp, 버튼 48dp
- **Easy**: 폰트 24dp, 버튼 56dp
- **Ultra**: 폰트 32dp, 버튼 64dp

### 모든 컴포넌트에서 필수
```typescript
import { useA11y } from '@/contexts/A11yContext';

function MyButton({ onPress }) {
  const { fontSizes, buttonHeight } = useA11y();
  
  return (
    <Button
      onPress={onPress}
      height={buttonHeight}
      fontSize={fontSizes.body}
      accessibilityLabel="명확한 한글 설명"
      accessibilityHint="이 버튼을 누르면 어떤 동작이 일어나는지"
    />
  );
}
```

### 색상 대비
- WCAG 2.1 AA 준수 (4.5:1 이상)
- `packages/ui/src/tokens/colors.ts` 참조

## 🔗 자주 참조할 문서

### 📚 기획 및 설계
- **프로젝트 개요**: `README.md` (루트)
- **전체 아키텍처**: `docs/PLAN/01-2-architecture-overview.md`
- **구현 규칙**: `docs/IMPLEMENT/01-implementation-rules.md`
- **워크스페이스 설정**: `docs/SCAFFOLD/01-workspace-setup.md`

### 🔴 이슈 및 수정 사항
- **이슈 트래커**: `docs/ISSUES/README.md`
- **백엔드 이슈**: `docs/ISSUES/BACKEND_ISSUES.md`
- **프론트엔드 이슈**: `docs/ISSUES/FRONTEND_ISSUES.md`
- **수정 체크리스트**: `docs/ISSUES/FIX_CHECKLIST.md`

### 🟢 설치 및 배포
- **Python/Docker 설치**: `docs/SETUP/02-python-docker-setup.md`
- **배포 가이드**: `docs/SETUP/03-deployment-setup.md`

### 🟡 작업 세션 관리
- **세션 관리**: `docs/WORK/README.md`
- **세션 재개**: `docs/WORK/NEXT_SESSION_RESUME.md`
- **과거 세션**: `docs/WORK/ARCHIVE/`

### 📘 참조 문서 (DOCS/)
- **문서 인덱스**: `docs/DOCS/index.md`
- **Root README 작성법**: `docs/DOCS/01-root-readme-guide.md`
- **아키텍처 문서**: `docs/DOCS/02-architecture-doc.md`
- **API 레퍼런스**: `docs/DOCS/03-api-reference.md`
- **UX/A11y 가이드**: `docs/DOCS/04-ux-a11y-notes.md`
- **운영 가이드**: `docs/DOCS/05-operations-future.md`

### 🛠️ 코드 및 스크립트
- **시드 데이터**: `Trenduity/scripts/seed_data.py`
- **API 엔드포인트**: `Trenduity/services/bff-fastapi/app/main.py`

## 📍 현재 구현 상태 (2025-11-17 기준)

### ✅ 완료된 기능
- **BFF API**: cards, insights, voice, scam, community, family 라우터 구현
- **Mobile 훅**: useTodayCard, useInsights, useA11y, useTTS, useVoiceIntent 등 전부 구현
- **Mobile 화면**: Home, Insights, Community, Tools, Settings 스켈레톤 완료
- **Web 페이지**: Dashboard, Members, Alerts, Encourage 기본 구조
- **Packages**: ui 토큰 (A11y, colors), types 타입 정의 완료
- **Scripts**: bootstrap.ps1, dev.ps1, seed_data.py 작동 확인

### 🚧 부분 구현 (스켈레톤만)
- **GamificationService**: 기본 구조만 (포인트 계산 로직 TODO)
- **ScamChecker**: 룰 기반 키워드 매칭만 (LLM 연동 예정)
- **VoiceParser**: 기본 의도 파싱만 (고급 NLP 대기)
- **TTS**: Expo Speech 모듈 임포트만 (실제 음성 재생 미구현)
- **Redis**: 설정만 (실제 캐싱 로직 없음)

### ❌ 미구현 (IMPLEMENT 단계 대기)
- **Supabase Realtime**: 실시간 알림 구독
- **배지 시스템**: badge 테이블 및 부여 로직
- **스트릭 계산**: 연속 일수 추적 알고리즘
- **복약 체크**: MedCheck 화면 및 BFF 연동
- **E2E 테스트**: TEST 단계 전체 대기
- **CI/CD**: GitHub Actions 워크플로

### 🎯 다음 우선순위
1. GamificationService 포인트 로직 구현
2. 카드 완료 플로우 통합 테스트
3. A11y 모드 전환 UI/UX 개선
4. 시드 데이터로 전체 플로우 검증

## 💡 핵심 패턴 & 진입점

### 필수 패턴
- **Envelope 응답**: `{ ok: boolean, data?: T, error?: E }`
- **한국어 에러**: "카드를 찾을 수 없어요." (영어 금지)
- **게임화**: BFF `GamificationService`에서 중앙 처리
- **RLS**: 읽기만 클라이언트, 쓰기는 BFF만

### 주요 진입점
- BFF: `services/bff-fastapi/app/main.py`
- Mobile: `apps/mobile-expo/App.tsx`
- Web: `apps/web-next/app/page.tsx`
- DB: `scripts/supabase_schema.sql`

### 새 기능 추가 시
1. `docs/IMPLEMENT/` 가이드 확인
2. 유사 엔드포인트 참조 (`services/bff-fastapi/app/routers/`)
3. 공유 타입 확인 (`packages/types/src/`)
4. A11y 토큰 적용 (`packages/ui/src/tokens/`)

## 🔄 새 세션 시작 시 필수 체크리스트

AI 에이전트가 새 대화를 시작하거나 컨텍스트를 잃었을 때:

### 0️⃣ **작업 추적 문서 확인** (최우선)
```powershell
# 현재 작업 진행 상황 확인
Get-Content c:\AIDEN_PROJECT\Trenduity\Trenduity\docs\WORK_PROGRESS_TRACKER.md
```
**이 문서를 먼저 읽고 현재 단계, 완료 항목, 차단 요인을 파악하세요!**

### 1️⃣ 현재 상태 파악
```powershell
# 현재 브랜치와 변경사항 확인
git branch --show-current
git status --short

# 마지막 커밋 메시지 (무엇을 작업 중이었나?)
git log -1 --oneline
```

### 2️⃣ 실행 환경 확인
```powershell
# BFF 서버 상태
curl http://localhost:8000/health

# 환경 변수 설정 여부
Test-Path c:\AIDEN_PROJECT\Trenduity\Trenduity\.env

# Docker 컨테이너 상태 (Postgres, Redis)
docker ps
```

### 3️⃣ 최근 변경 파일 확인
```powershell
# 최근 5개 커밋에서 수정된 파일
git log -5 --name-only --oneline

# 현재 작업 중인 파일 (unstaged)
git diff --name-only
```

### 4️⃣ 문서 빠른 참조
- 구현 중이라면: `docs/IMPLEMENT/` 디렉터리 확인
- 아키텍처 질문: `docs/PLAN/01-2-architecture-overview.md`
- 에러 발생: `docs/IMPLEMENT/01-implementation-rules.md` 에러 섹션

### 5️⃣ 의존성 동기화 (필요 시)
```powershell
# Node 의존성 재설치
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
npm install

# Python 의존성 재설치
cd services\bff-fastapi
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 🎮 빠른 명령어

자주 사용하는 PowerShell 명령어는 별도 파일 참조:
- **`.github/QUICK_COMMANDS.md`**: BFF 실행, 타입 체크, 환경 확인, 포맷/린트 등

## 📋 코드 템플릿

자주 사용하는 코드 템플릿은 별도 파일 참조:
- **`.github/CODE_TEMPLATES.md`**: BFF 엔드포인트, Mobile 훅, A11y 컴포넌트, Pydantic 스키마

## 🎓 학습 경로

### 새로운 개발자
1. `README.md` (프로젝트 소개)
2. `docs/PLAN/01-project-overview.md` (요구사항)
3. `docs/PLAN/01-2-architecture-overview.md` (아키텍처)
4. `docs/IMPLEMENT/01-implementation-rules.md` (구현 규칙)
5. `services/bff-fastapi/app/routers/cards.py` (코드 예시)

### 문제 해결이 필요한 개발자
1. `docs/ISSUES/README.md` (이슈 현황)
2. `docs/ISSUES/BACKEND_ISSUES.md` 또는 `FRONTEND_ISSUES.md`
3. `docs/ISSUES/FIX_CHECKLIST.md` (검증 체크리스트)

### 배포하려는 개발자
1. `docs/SETUP/03-deployment-setup.md` (Render 배포)
2. `docs/ISSUES/FIX_CHECKLIST.md` (배포 전 체크리스트)

### 문서 작성자
1. `docs/DOCS/index.md` (문서화 개요)
2. `docs/DOCS/01-root-readme-guide.md` (README 작성)
3. `docs/DOCS/02-architecture-doc.md` (아키텍처 문서)
4. `docs/DOCS/03-api-reference.md` (API 레퍼런스)

## 📊 응답 품질 원칙 (AI 에이전트용)

### 핵심 원칙

1. **요청 이해도 평가**
   - 90% 이상: 즉시 실행
   - 70-89%: 확인 후 실행
   - 70% 미만: 추가 정보 요청

2. **응답 전 체크리스트**
   - [ ] 대상 명확? (Mobile/Web/BFF)
   - [ ] 파일 경로 특정 가능?
   - [ ] ADR/안티패턴 검토?
   - [ ] 제약사항 준수? (diff-first, 보안, 타입)

3. **응답 형식**
   - 간결하고 명확하게
   - 불확실하면 명시하고 질문
   - 가정을 세웠다면 명확히 표시

---

**최종 업데이트**: 2025년 12월 2일  
**문서 버전**: 6.0 (최적화 완료 - 929줄 → 500줄)  
**상태**: SCAFFOLD 완료, IMPLEMENT 진행 중 (65%)

## 🔗 추가 참조 문서

- **코드 템플릿**: `.github/CODE_TEMPLATES.md` - BFF/Mobile/A11y/Pydantic 템플릿
- **빠른 명령어**: `.github/QUICK_COMMANDS.md` - 자주 쓰는 PowerShell 명령어
- **아키텍처 결정**: `.github/ADR.md` - ADR-001, ADR-002, ADR-003
