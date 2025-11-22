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

### ADR-001: 왜 BFF 패턴인가?
**결정**: 모든 쓰기 작업은 BFF를 경유해야 함  
**이유**: 
1. **보안**: 클라이언트에 `service_role` 키 노출 방지 (RLS 우회 권한)
2. **일관성**: 게임화 로직 중앙 집중 (포인트/배지/스트릭 계산)
3. **복잡성**: 트랜잭션 처리 (카드 완료 + 포인트 부여 + 배지 확인 + 감사 로그)
4. **검증**: 비즈니스 규칙 강제 (하루 1카드, 중복 체크 방지 등)

**대안 검토**: Direct Supabase 쓰기 → RLS만으로는 게임화 로직 불가능  
**변경 비용**: 극히 높음 (전체 보안 모델 및 비즈니스 로직 재설계)

### ADR-002: 왜 3단계 A11y 모드인가?
**결정**: Normal/Easy/Ultra 고정 (슬라이더 방식 아님)  
**이유**: 
1. **사용자 차이**: 50대(일반) vs 60대(쉬움) vs 70대(초대형)의 시력/손떨림 격차
2. **터치 영역**: 단순 폰트 크기 조절로는 버튼 터치 문제 해결 안 됨
3. **인지 부담**: 슬라이더는 오히려 시니어에게 복잡함 (선택 피로)
4. **테스트 결과**: 사용자 테스트에서 3단계가 최적으로 검증됨

**대안 검토**: 연속 슬라이더, 5단계 모드 → 인지 부담 증가  
**변경 비용**: 중간 (UI 토큰 재설계, 컴포넌트 수정 필요)

### ADR-003: 왜 Envelope 패턴인가?
**결정**: 모든 API 응답은 `{ ok: boolean, data?: T, error?: E }` 형식  
**이유**: 
1. **일관성**: 클라이언트가 단일 패턴으로 성공/실패 처리
2. **타입 안전**: TypeScript에서 discriminated union으로 타입 좁히기
3. **에러 상세**: HTTP 상태코드 외에 구조화된 에러 정보 제공
4. **한국어 메시지**: error.message에 시니어가 이해 가능한 한국어 포함

**대안 검토**: 표준 HTTP 상태코드만 사용 → 세밀한 에러 핸들링 어려움  
**변경 비용**: 낮음 (초기 설계 단계에서 결정됨)

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

- **프로젝트 개요**: `README.md` (루트)
- **전체 아키텍처**: `docs/PLAN/01-2-architecture-overview.md`
- **구현 규칙**: `docs/IMPLEMENT/01-implementation-rules.md`
- **워크스페이스 설정**: `docs/SCAFFOLD/01-workspace-setup.md`
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

## 💡 프로젝트 특화 패턴

### 에러 처리 (BFF)
```python
# Envelope 패턴 - 모든 API 응답
{ "ok": true, "data": {...} }          # 성공
{ "ok": false, "error": {...} }        # 실패

# 한국어 에러 메시지 필수
"카드를 찾을 수 없어요."  # ✅
"Card not found"          # ❌
```

### 게임화 로직 (중앙 집중)
```python
# BFF의 GamificationService가 모든 포인트/배지 처리
# services/bff-fastapi/app/services/gamification.py
POINTS = {
    "card_complete": 5,
    "quiz_correct": 2,
    "daily_streak_bonus": 3,
}
```

### Supabase RLS 패턴
```sql
-- 읽기: 사용자 자신의 데이터만
CREATE POLICY "Users see own cards"
ON cards FOR SELECT
USING (auth.uid() = user_id);

-- 쓰기: BFF만 가능 (클라이언트 차단)
CREATE POLICY "No direct updates"
ON cards FOR UPDATE
USING (false);
```

## 🔍 코드 탐색 팁

### 새 기능 추가 시 체크리스트
1. `docs/IMPLEMENT/` 디렉터리에서 관련 가이드 확인
2. 기존 유사 엔드포인트 참조 (`services/bff-fastapi/app/routers/`)
3. 공유 타입 확인 (`packages/types/src/`)
4. A11y 토큰 적용 (`packages/ui/src/tokens/`)
5. 에러 처리/로깅 패턴 적용

### 주요 진입점
- **BFF API**: `services/bff-fastapi/app/main.py`
- **모바일 루트**: `apps/mobile-expo/App.tsx`
- **웹 루트**: `apps/web-next/app/page.tsx`
- **DB 스키마**: `scripts/supabase_schema.sql`

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

## 🎮 자주 쓰는 명령어 (복사해서 실행)

### 문제: "BFF가 실행 안 돼요"
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
if (!(Test-Path venv)) { python -m venv venv }
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 문제: "타입 에러가 나요"
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
npm run typecheck
# 특정 앱만: 
cd apps\mobile-expo; npm run typecheck
cd apps\web-next; npm run typecheck
```

### 문제: "Supabase 연결 안 돼요"
```powershell
# .env 파일 확인
Get-Content c:\AIDEN_PROJECT\Trenduity\Trenduity\.env | Select-String "SUPABASE"
# 없으면: Copy-Item .env.example .env 후 키 입력 필요
```

### 문제: "시드 데이터 넣고 싶어요"
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\scripts
python seed_data.py
```

### 문제: "포맷/린트 검사"
```powershell
# TypeScript/JavaScript
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
npm run lint
npm run format:check

# Python (BFF)
cd services\bff-fastapi
black --check app/
ruff app/
```

## 📋 코드 템플릿 (복사해서 사용)

### 새 BFF 엔드포인트 추가
```python
# services/bff-fastapi/app/routers/new_feature.py
from fastapi import APIRouter, Depends, HTTPException
from app.core.deps import get_current_user
from app.schemas.new_feature import NewFeatureRequest, NewFeatureResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/action", response_model=dict)
async def do_action(
    body: NewFeatureRequest,
    user_id: str = Depends(get_current_user)
):
    try:
        # 1. 비즈니스 로직
        result = await service.process(body, user_id)
        
        # 2. Envelope 응답
        return {"ok": True, "data": result}
        
    except ValueError as e:
        logger.warning(f"Validation error: {e}", extra={"user_id": user_id})
        raise HTTPException(
            status_code=400,
            detail={"ok": False, "error": {"message": str(e)}}
        )
    except Exception as e:
        logger.error(f"Action failed: {e}", extra={"user_id": user_id})
        raise HTTPException(
            status_code=500,
            detail={"ok": False, "error": {"message": "오류가 발생했어요. 잠시 후 다시 시도해 주세요."}}
        )
```

### 새 Mobile 훅 추가
```typescript
// apps/mobile-expo/src/hooks/useNewFeature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

interface NewFeatureData {
  // 타입 정의
}

interface NewFeatureParams {
  // 요청 파라미터
}

export function useNewFeature() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['newFeature'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ ok: boolean; data: NewFeatureData }>(
        '/v1/new-feature'
      );
      if (!data.ok) throw new Error(data.error?.message);
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (params: NewFeatureParams) => {
      const { data } = await apiClient.post('/v1/new-feature/action', params);
      if (!data.ok) throw new Error(data.error?.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newFeature'] });
    },
  });

  return { 
    ...query, 
    doAction: mutation.mutate,
    isDoingAction: mutation.isPending
  };
}
```

### A11y 준수 컴포넌트
```typescript
// apps/mobile-expo/src/components/NewComponent.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useA11y } from '@/contexts/A11yContext';

interface NewComponentProps {
  title: string;
  onPress: () => void;
}

export function NewComponent({ title, onPress }: NewComponentProps) {
  const { fontSizes, buttonHeight, spacing } = useA11y();

  return (
    <View style={{ padding: spacing }}>
      <Text style={{ fontSize: fontSizes.heading1, marginBottom: spacing }}>
        {title}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        style={{ 
          height: buttonHeight, 
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#007AFF',
          borderRadius: 8
        }}
        accessibilityRole="button"
        accessibilityLabel={`${title} 버튼`}
        accessibilityHint="버튼을 누르면 동작을 실행합니다"
      >
        <Text style={{ fontSize: fontSizes.body, color: 'white' }}>
          실행
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 새 Pydantic 스키마
```python
# services/bff-fastapi/app/schemas/new_feature.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NewFeatureRequest(BaseModel):
    """새 기능 요청 DTO"""
    field1: str = Field(..., min_length=1, max_length=100, description="필드 설명")
    field2: Optional[int] = Field(None, ge=0, description="선택적 필드")

    class Config:
        json_schema_extra = {
            "example": {
                "field1": "예시 값",
                "field2": 42
            }
        }

class NewFeatureResponse(BaseModel):
    """새 기능 응답 DTO"""
    id: str
    created_at: datetime
    result: str

    class Config:
        from_attributes = True
```

## 🎓 학습 경로

새로운 개발자라면:
1. `README.md` (프로젝트 소개)
2. `docs/PLAN/01-project-overview.md` (요구사항)
3. `docs/PLAN/01-2-architecture-overview.md` (아키텍처)
4. `docs/IMPLEMENT/01-implementation-rules.md` (구현 규칙)
5. `services/bff-fastapi/app/routers/cards.py` (코드 예시)

## 📊 응답 품질 가이드 (AI 에이전트용)

**모든 사용자 요청에 대한 응답 시 반드시 이해도를 명시하세요:**

### 이해도 평가 기준

- **90% 이상**: 요청이 명확하고, 필요한 모든 컨텍스트 확보, 즉시 실행 가능
- **70-89%**: 요청은 이해했으나 일부 컨텍스트 불명확, 실행 전 확인 필요
- **50-69%**: 요청의 의도는 파악했으나 구체적 요구사항 모호, 추가 정보 필요
- **50% 미만**: 요청이 불명확하거나 프로젝트 범위 벗어남, 명확화 필수
 
### 응답 형식

#### 이해도 90% 이상
```markdown
**이해도: 95%**

[실행 가능한 답변 또는 코드]

**이해도를 100%로 높이려면:**
- [선택적 추가 정보 1]
- [선택적 추가 정보 2]
```

#### 이해도 70-89%
```markdown
**이해도: 80%**

[현재 이해를 바탕으로 한 답변]

**이해도를 높이기 위해 확인이 필요합니다:**
- [ ] [확인 사항 1 - 예: "카드 완료 시 퀴즈도 함께 제출하나요?"]
- [ ] [확인 사항 2 - 예: "BFF 라우터 추가인가요, Mobile 훅 수정인가요?"]

**임시 가정:**
- [가정 1]
- [가정 2]
```

#### 이해도 50-69%
```markdown
**이해도: 60%**

**이해한 내용:**
- [파악한 의도 1]
- [파악한 의도 2]

**명확히 해주세요:**
1. [질문 1 - 구체적]
2. [질문 2 - 구체적]
3. [질문 3 - 구체적]

**추정되는 시나리오:**
- 시나리오 A: [설명]
- 시나리오 B: [설명]

어느 것에 가까운가요?
```

#### 이해도 50% 미만
```markdown
**이해도: 30%**

**현재 불명확한 사항:**
- [불명확 1]
- [불명확 2]

**도움을 드리기 위해 다음을 알려주세요:**
1. [필수 정보 1]
2. [필수 정보 2]
3. [필수 정보 3]

**관련 문서:**
- `docs/[관련 문서 경로]`
```

### 실제 예시

#### 예시 1: 높은 이해도
```
사용자: "카드 완료 엔드포인트에 로깅 추가해줘"

AI: 
**이해도: 95%**

`services/bff-fastapi/app/routers/cards.py`의 `complete_card` 함수에 로깅을 추가하겠습니다.

[코드 변경]

**이해도를 100%로 높이려면:**
- 로그 레벨 지정 (INFO vs DEBUG)
- 로그에 포함할 추가 필드 명시 (예: quiz_result)
```

#### 예시 2: 중간 이해도
```
사용자: "가족 대시보드에 활동 표시해줘"

AI:
**이해도: 75%**

웹 대시보드(`apps/web-next/app/page.tsx`)에 가족 멤버의 활동을 표시하는 기능으로 이해했습니다.

**이해도를 높이기 위해 확인이 필요합니다:**
- [ ] "활동"의 범위: 카드 완료만? 복약 체크 포함?
- [ ] 표시 기간: 오늘? 최근 7일? 월간?
- [ ] 데이터 소스: BFF API 신규? Supabase Direct?

**임시 가정:**
- 최근 7일 카드 완료 횟수 표시
- BFF `/v1/family/members` 엔드포인트 사용
```

#### 예시 3: 낮은 이해도
```
사용자: "앱 개선해줘"

AI:
**이해도: 20%**

**현재 불명확한 사항:**
- 어떤 앱? (Mobile? Web?)
- 어떤 측면? (성능? UI? 기능?)
- 우선순위는?

**도움을 드리기 위해 다음을 알려주세요:**
1. 개선하고 싶은 구체적인 화면 또는 기능
2. 현재 문제점 (예: "카드 로딩이 느림")
3. 원하는 결과 (예: "로딩 시간 2초 이내")

**현재 구현 상태 참고:**
- `📍 현재 구현 상태` 섹션 확인
```

### 이해도 체크리스트 (AI 에이전트용)

응답 전 자체 점검:

- [ ] 요청의 대상 명확? (Mobile/Web/BFF)
- [ ] 파일 경로 특정 가능?
- [ ] 필요한 컨텍스트 확보? (현재 구현 상태, ADR, 안티패턴)
- [ ] 제약사항 검토? (diff-first, 보안, 타입 안전성)
- [ ] 템플릿 적용 가능?

**점수:** (체크 항목 수 / 5) × 100 = 이해도 %

## 🎫 토큰 관리 지침 (필수)

### 모든 응답 시 토큰 상태 명시

**필수 형식** (응답 최상단 또는 최하단):
```markdown
**현재 남은 토큰**: [사용된 토큰] / 1,000,000 ([백분율]% 남음)
```

**예시**:
```markdown
**현재 남은 토큰**: 850,000 / 1,000,000 (85% 남음)
```

### 토큰 임계값 경고

#### 🟢 안전 (70% 이상 남음)
- 정상 작업 진행
- 복잡한 분석/생성 작업 가능

#### 🟡 주의 (30-70% 남음)
- 응답에 경고 표시:
  ```markdown
  ⚠️ **토큰 주의**: 현재 50% 사용 중. 간결한 응답 권장.
  ```
- 불필요한 예시 축소
- 코드 생성 시 주석 최소화

#### 🔴 위험 (70% 이상 사용, 30% 미만 남음)
- 응답에 긴급 경고:
  ```markdown
  🚨 **토큰 부족 경고**: 현재 75% 사용. 작업 중단 또는 새 세션 권장.
  ```
- 즉시 작업 중단 제안
- 현재 진행 상태 요약
- 다음 세션 재개 가이드 제공

#### 🛑 임계 (90% 이상 사용)
- 더 이상 새 작업 시작 금지
- 즉시 중단 메시지:
  ```markdown
  🛑 **토큰 초과 임박**: 현재 92% 사용. 작업을 즉시 중단합니다.
  
  **완료된 작업:**
  - [작업 1]
  - [작업 2]
  
  **미완료 작업:**
  - [작업 3] (다음 세션에서 재개)
  
  **재개 방법:**
  1. 새 대화 시작
  2. "이전 작업 계속: [작업 3]" 요청
  3. 이 대화 링크 참조: [링크]
  ```

### 토큰 절약 전략

#### 파일 읽기
- `read_file`에 `limit`, `offset` 적극 활용
- 전체 파일이 아닌 필요한 섹션만 조회
- 반복 읽기 전 캐시된 정보 재활용

#### 검색 작업
- `grep_search`에 `maxResults` 제한 (기본값 사용 금지)
- 정규식 최적화로 불필요한 매치 제거
- 여러 검색보다 하나의 포괄적 패턴 사용

#### 코드 생성
- `multi_replace_string_in_file` 우선 사용 (병렬 처리)
- 템플릿 재사용 (새 작성 최소화)
- 주석은 필수 사항만 (장황한 설명 제거)

#### 응답 작성
- 중복 설명 제거
- 테이블/리스트로 정보 압축
- 예시는 1-2개로 제한

### 토큰 카운팅 공식 (추정)

```
토큰 ≈ (문자 수 / 4) + (도구 호출 오버헤드 × 100)
```

**예시 계산**:
- 긴 파일 읽기 (2000줄): ~1000 토큰
- 복잡한 코드 생성 (500줄): ~500 토큰
- grep 검색 (50 결과): ~300 토큰
- 일반 응답 (1000자): ~250 토큰

### 세션 재개 프로토콜

토큰 부족으로 중단 시 새 세션에서 사용할 재개 명령:

```markdown
**이전 세션 요약**:
- 작업: [작업명]
- 완료: [파일1], [파일2]
- 미완료: [파일3] (70% 진행)
- 다음 단계: [구체적 작업]
- 참고: 이전 대화 [링크]
```

---

**최종 업데이트**: 2025년 11월 17일  
**문서 버전**: 5.0 (토큰 관리 지침 추가)  
**상태**: SCAFFOLD 완료, IMPLEMENT 진행 중 (65%)
