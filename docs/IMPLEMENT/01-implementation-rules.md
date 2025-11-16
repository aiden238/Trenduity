# 01. 전역 구현 규칙

> **목적**: 모든 기능 구현 시 준수해야 할 공통 규칙과 가이드라인  
> **적용 대상**: BFF (FastAPI), Mobile (Expo RN), Web (Next.js)

---

## 📋 목표

- **일관성**: 모든 코드가 동일한 패턴과 컨벤션 따르기
- **명확성**: 50-70대 사용자를 위한 명확한 에러 메시지
- **타입 안전성**: TypeScript strict, Pydantic 타입 체크 통과
- **접근성 우선**: WCAG 2.1 AA 기준 준수

---

## 🎯 기술 스택 제약

### 허용된 기술만 사용
```yaml
Mobile: Expo React Native + TypeScript
Web: Next.js (App Router) + TypeScript
BFF: FastAPI + Pydantic v2
Database: Supabase (Postgres + Auth + RLS + Storage)
Cache: Redis (Upstash compatible)
Validation: Zod (TS), Pydantic (Python)
State: React Query / TanStack Query
```

### 금지 사항
❌ 새로운 프레임워크 추가 (예: Vue, Angular)  
❌ 마이크로서비스 분리 (BFF는 단일 FastAPI 앱)  
❌ GraphQL (REST API만 사용)  
❌ 과도한 추상화 (팩토리 패턴, 복잡한 DI 등)  
❌ 클래스형 컴포넌트 (함수형 React만)

---

## 🚨 에러 처리 규칙

### BFF (FastAPI)

#### 응답 포맷
모든 엔드포인트는 **Envelope 패턴** 사용:

```python
# 성공 응답
{
  "ok": true,
  "data": { ... }
}

# 실패 응답
{
  "ok": false,
  "error": {
    "code": "CARD_NOT_FOUND",
    "message": "오늘의 카드를 찾을 수 없어요."
  }
}
```

#### 에러 코드 컨벤션
```python
# services/bff-fastapi/app/errors.py
class AppError:
    # 400 Bad Request
    INVALID_INPUT = ("INVALID_INPUT", "입력값이 올바르지 않아요.")
    
    # 404 Not Found
    CARD_NOT_FOUND = ("CARD_NOT_FOUND", "카드를 찾을 수 없어요.")
    INSIGHT_NOT_FOUND = ("INSIGHT_NOT_FOUND", "인사이트를 찾을 수 없어요.")
    
    # 403 Forbidden
    NO_PERMISSION = ("NO_PERMISSION", "권한이 없어요.")
    
    # 500 Internal Server Error
    DB_ERROR = ("DB_ERROR", "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.")
    EXTERNAL_API_ERROR = ("EXTERNAL_API_ERROR", "외부 서비스 연결에 실패했어요.")
```

#### 로깅
```python
import logging

logger = logging.getLogger(__name__)

try:
    result = await db.execute(query)
except Exception as e:
    logger.error(
        "Failed to fetch card",
        extra={
            "user_id": user_id,
            "date": date,
            "error": str(e)
        }
    )
    # PII (이름, 전화번호 등)는 로그에 남기지 않기!
    raise HTTPException(
        status_code=500,
        detail={"ok": False, "error": AppError.DB_ERROR}
    )
```

### Mobile (React Native)

#### 에러 Toast
```typescript
// src/utils/errorHandler.ts
export function handleApiError(error: ApiError) {
  const message = error.error?.message || "오류가 발생했어요.";
  
  Toast.show({
    type: 'error',
    text1: message,
    position: 'bottom',
    visibilityTime: 3000,
  });
}
```

#### 네트워크 에러 대응
```typescript
// src/hooks/useTodayCard.ts
const { data, error, isLoading } = useQuery({
  queryKey: ['todayCard'],
  queryFn: fetchTodayCard,
  retry: 2, // 2번 재시도
  retryDelay: 1000,
});

if (error) {
  return (
    <ErrorBanner message="네트워크가 불안정해요. 잠시 후 다시 시도해 주세요." />
  );
}
```

#### 사용자 친화적 메시지 원칙
✅ **좋은 예**:
- "네트워크가 불안정해요."
- "잠시 후 다시 시도해 주세요."
- "오늘의 카드를 불러올 수 없어요."

❌ **나쁜 예**:
- "Network timeout occurred"
- "Error code: 500"
- "Failed to fetch data from API"

### Web (Next.js)

#### Server Action 에러
```typescript
// app/actions/members.ts
export async function getMemberActivity(userId: string) {
  try {
    const data = await supabase
      .from('usage_counters')
      .select('*')
      .eq('user_id', userId);
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch member activity:', error);
    return {
      success: false,
      error: '멤버 활동 정보를 불러올 수 없어요.'
    };
  }
}
```

---

## ♿ 접근성 (A11y) 규칙

### 필수 준수 사항

#### 1. Typography 토큰 사용
```typescript
import { useA11y } from '@/contexts/A11yContext';
import { Typography } from '@repo/ui';

function CardTitle({ text }: { text: string }) {
  const { fontSizes } = useA11y();
  
  return (
    <Typography
      variant="heading1"
      fontSize={fontSizes.heading1} // 모드별 크기 자동 적용
    >
      {text}
    </Typography>
  );
}
```

#### 2. 터치 타겟 크기
```typescript
// packages/ui/src/tokens/a11y.ts
export const A11Y_TOKENS = {
  normal: {
    buttonHeight: 48,  // dp
    spacing: 16,
  },
  easy: {
    buttonHeight: 56,
    spacing: 20,
  },
  ultra: {
    buttonHeight: 64,
    spacing: 24,
  },
};
```

#### 3. Accessibility Labels
```typescript
<Button
  onPress={handleComplete}
  accessibilityLabel="오늘의 카드 완료하기"
  accessibilityHint="이 버튼을 누르면 카드가 완료되고 포인트를 받아요"
>
  완료
</Button>
```

#### 4. Color Contrast
모든 텍스트는 **WCAG 2.1 AA 기준**(4.5:1 이상) 준수:
```typescript
// packages/ui/src/tokens/colors.ts
export const COLORS = {
  text: {
    primary: '#000000',   // 배경 #FFFFFF 대비 21:1
    secondary: '#666666', // 배경 #FFFFFF 대비 5.74:1
  },
  background: {
    primary: '#FFFFFF',
    card: '#F5F5F5',
  },
};
```

---

## 🗄️ 데이터 접근 패턴

### 언제 Supabase Direct Access?
✅ **허용**:
- 단순 읽기 (SELECT)
- 개인 데이터 (RLS로 보호됨)
- 실시간 구독 필요한 경우

```typescript
// Mobile: 카드 목록 읽기
const { data } = await supabase
  .from('cards')
  .select('*')
  .eq('user_id', userId)
  .order('date', { ascending: false });
```

### 언제 BFF 필요?
✅ **필수**:
- 쓰기 작업 (INSERT, UPDATE, DELETE)
- 여러 테이블 조인
- 비즈니스 로직 (게임화, 사기 검사 등)
- 외부 API 호출 (LLM, TTS 등)

```typescript
// Mobile → BFF
const response = await fetch('/v1/cards/complete', {
  method: 'POST',
  body: JSON.stringify({
    card_id: 'card-123',
    quizAnswers: { q1: 0, q2: 1 }
  }),
});
```

### BFF Repository 패턴
```python
# services/bff-fastapi/app/repositories/cards.py
from supabase import Client

class CardRepository:
    def __init__(self, db: Client):
        self.db = db
    
    async def get_today_card(self, user_id: str, date: str):
        result = self.db.table('cards') \
            .select('*') \
            .eq('user_id', user_id) \
            .eq('date', date) \
            .limit(1) \
            .execute()
        
        return result.data[0] if result.data else None
    
    async def mark_completed(self, card_id: str):
        self.db.table('cards') \
            .update({'status': 'completed'}) \
            .eq('id', card_id) \
            .execute()
```

---

## 🎮 게임화 규칙

### 중앙 집중식 관리
모든 포인트/배지/스트릭 업데이트는 **단일 서비스**를 통해:

```python
# services/bff-fastapi/app/services/gamification.py
class GamificationService:
    BASE_CARD_POINTS = 5
    CORRECT_ANSWER_POINTS = 2
    DAILY_STREAK_BONUS = 3
    
    async def award_for_card_completion(
        self,
        user_id: str,
        num_correct: int,
        num_questions: int,
        date: str
    ) -> dict:
        """
        카드 완료 시 포인트/스트릭 업데이트
        
        Returns:
            {
                "points_added": 13,
                "total_points": 150,
                "streak_days": 7,
                "new_badges": ["첫걸음"]
            }
        """
        points = self.BASE_CARD_POINTS + (num_correct * self.CORRECT_ANSWER_POINTS)
        
        # 스트릭 확인
        last_completion = await self._get_last_completion_date(user_id)
        streak_days = await self._update_streak(user_id, date, last_completion)
        
        if streak_days > 0:
            points += self.DAILY_STREAK_BONUS
        
        # DB 업데이트
        await self._add_points(user_id, points)
        
        # 배지 확인
        new_badges = await self._check_new_badges(user_id)
        
        return {
            "points_added": points,
            "total_points": await self._get_total_points(user_id),
            "streak_days": streak_days,
            "new_badges": new_badges
        }
```

### 포인트 정책
```python
# 액션별 포인트
POINTS = {
    "card_complete": 5,
    "quiz_correct": 2,
    "daily_streak_bonus": 3,
    "tool_step_complete": 3,
    "med_check": 2,
    "qna_post": 5,
    "qna_useful_vote": 1,
}
```

---

## 🔐 보안 규칙

### 인증
```python
# BFF: JWT 검증
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]  # user_id
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="인증이 필요해요.")
```

### RLS (Row Level Security)
```sql
-- Supabase: cards 테이블
CREATE POLICY "Users can only see their own cards"
ON cards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users cannot modify cards directly"
ON cards
FOR UPDATE
USING (false);  -- BFF만 수정 가능
```

### PII 보호
```python
# 로그에 PII 절대 포함 금지
logger.info(f"User {user_id} completed card")  # ✅ OK
logger.info(f"User {user_name} completed card")  # ❌ 금지 (이름은 PII)
```

---

## 📊 성능 규칙

### 캐싱 전략
```python
# Redis 캐싱 예시
import redis

r = redis.from_url(REDIS_URL)

async def get_today_card(user_id: str, date: str):
    cache_key = f"card:{user_id}:{date}"
    cached = r.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    card = await db.get_card(user_id, date)
    r.setex(cache_key, 3600, json.dumps(card))  # 1시간 캐시
    return card
```

### DB 쿼리 제한
```typescript
// 페이지네이션 필수
const insights = await supabase
  .from('insights')
  .select('*')
  .range(0, 19)  // 최대 20개
  .order('date', { ascending: false });
```

### LLM 호출 가드
```python
# 너무 긴 입력 차단
MAX_INPUT_LENGTH = 500

def check_scam_risk(text: str):
    if len(text) > MAX_INPUT_LENGTH:
        raise ValueError("입력이 너무 길어요. 500자 이내로 입력해 주세요.")
    
    # LLM 호출...
```

---

## 🧪 테스트 가능성

### 순수 함수 우선
```python
# ✅ 좋은 예: 순수 함수
def calculate_points(num_correct: int, num_questions: int) -> int:
    base = 5
    bonus = num_correct * 2
    return base + bonus

# ❌ 나쁜 예: 사이드 이펙트
def calculate_and_save_points(user_id: str, num_correct: int):
    points = 5 + num_correct * 2
    db.update_points(user_id, points)  # 테스트하기 어려움
```

### 의존성 주입
```python
# BFF 라우터
@router.post("/complete")
async def complete_card(
    body: CompleteCardRequest,
    user_id: str = Depends(get_current_user),
    gamification: GamificationService = Depends(get_gamification_service)
):
    result = await gamification.award_for_card_completion(...)
    return {"ok": True, "data": result}
```

---

## 📝 코드 스타일

### TypeScript
```typescript
// 명시적 타입
interface TodayCardData {
  id: string;
  title: string;
  tldr: string;
  body: string;
  quiz?: QuizQuestion[];
}

// 함수명: 동사 시작
function fetchTodayCard(): Promise<TodayCardData> { }
function completeTodayCard(cardId: string): Promise<void> { }

// 컴포넌트명: 대문자 시작, 명사
function TodayCardScreen() { }
function QuizSection() { }
```

### Python
```python
# PEP 8 준수
# 함수명: snake_case
def get_today_card(user_id: str) -> dict:
    pass

# 클래스명: PascalCase
class GamificationService:
    pass

# 상수: UPPER_SNAKE_CASE
MAX_QUIZ_QUESTIONS = 3
```

---

## ✅ 체크리스트

구현 시작 전 확인:
- [ ] TypeScript/Python 타입 정의 완료
- [ ] 에러 처리 전략 수립
- [ ] A11y 토큰 적용 계획
- [ ] 데이터 접근 패턴 결정 (Direct vs BFF)
- [ ] 게임화 포인트 정책 확인

코드 작성 후 확인:
- [ ] 타입 체크 통과 (`tsc --noEmit`, `mypy`)
- [ ] 에러 메시지 한국어로 명확하게
- [ ] 접근성 라벨 추가
- [ ] 캐싱/성능 최적화 적용
- [ ] 로그에 PII 없음

---

## 🔗 다음 단계

규칙을 숙지했다면 첫 번째 기능 구현 시작:
- **다음**: [02. Daily Card + Gamification](./02-daily-card-gamification.md)

---

**문서 작성**: AI Implementation Guide  
**최종 업데이트**: 2025년 11월 13일
