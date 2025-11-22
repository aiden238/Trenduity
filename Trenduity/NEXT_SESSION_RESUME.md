# 다음 세션 재개 가이드

## 📍 현재 상황 (2025-11-21)

### ✅ 완료된 작업
1. **Gamification 테이블 구조 수정** (100%)
   - `total_points`, `current_streak`, `longest_streak` 컬럼 추가
   - 마이그레이션 `002_verify_gamification_structure.sql` 실행 완료
   - BFF `GamificationService` 코드 수정 (INSERT 시 `longest_streak` 포함)

2. **E2E 테스트 개선** (74% 달성 - 목표 70% 초과)
   - 25/34 테스트 통과
   - A11y: 10/10 ✅
   - Med Check: 5/5 ✅
   - Scam Check: 6/6 ✅
   - Health: 1/1 ✅
   - Card: 3/4 (1개 실패)
   - Family: 0/8 (스킵)

3. **테스트 에러 핸들링 강화**
   - 500 에러 감지 및 명확한 메시지 제공
   - 첫 완료와 두 번째 완료 모두 에러 핸들링 추가

### 🔴 남은 문제 (핵심 - 다음 세션 최우선)

**카드 완료 테스트 - 두 번째 완료 시 500 에러**
- **증상**: 
  - 첫 번째 완료: ✅ 성공 (200, 8 포인트)
  - 두 번째 완료: ❌ 500 Internal Server Error
- **예상 원인**:
  1. `_is_card_completed_today()` 중복 체크가 Redis 캐시를 제대로 읽지 못함
  2. `gamification.award_for_card_completion()`에서 중복 완료 시 예외 발생
  3. Redis 키 TTL 또는 키 형식 문제

---

## 🚀 다음 세션 시작 체크리스트

### 1단계: 환경 상태 확인 (2분)

```powershell
# BFF 서버 실행 중인지 확인
Get-NetTCPConnection -LocalPort 8002 -ErrorAction SilentlyContinue

# Docker 컨테이너 상태
docker ps --filter "name=redis" --filter "name=postgres"

# 현재 브랜치 및 변경사항
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
git status --short
```

### 2단계: 테스트 환경 리셋 (1분)

```powershell
# 완료 기록 삭제 + Redis 플러시
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
. .\venv\Scripts\Activate.ps1
python ..\..\scripts\reset_card_completion.py
docker exec trenduity-redis redis-cli FLUSHALL
```

### 3단계: BFF 서버 재시작 (디버그 모드) (2분)

```powershell
# 기존 프로세스 종료
$proc = Get-NetTCPConnection -LocalPort 8002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($proc) { Stop-Process -Id $proc -Force; Start-Sleep -Seconds 3 }

# 새 터미널에서 디버그 모드로 시작 (로그 확인 가능)
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
. .\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload --log-level debug
```

### 4단계: E2E 테스트 실행 (별도 터미널) (1분)

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\e2e
npx playwright test scenarios/card-completion.spec.ts:91 --reporter=list
```

---

## 🔍 디버깅 전략

### Option A: BFF 로그 분석 (추천)

BFF 서버 터미널에서 실시간 로그 확인:
- ✅ `🔥 Complete card called` (엔드포인트 진입)
- ✅ `🔥 Card found` (카드 조회 성공)
- ❓ **중복 체크 통과 여부** (로그 없으면 문제)
- ❓ `🔥 Calling gamification` (게임화 서비스 호출)
- ❌ 에러 발생 지점

**예상되는 로그 패턴:**
```
INFO: 127.0.0.1:xxxxx - "POST /v1/cards/complete HTTP/1.1" 200 OK
🔥 Complete card called: card_id=xxx, user_id=demo-user-50s
🔥 Card found: dict_keys([...])
🔥 Calling gamification: completion_date=2025-11-21, quiz_result=None
🔥 Gamification result: {...}
🔥 Card completion recorded

# 두 번째 호출
INFO: 127.0.0.1:xxxxx - "POST /v1/cards/complete HTTP/1.1" 500 Internal Server Error
🔥 Complete card called: card_id=xxx, user_id=demo-user-50s
🔥 Card found: dict_keys([...])
# ❓ 여기서 멈추거나 에러 발생
```

### Option B: Redis 키 확인

```powershell
# 첫 완료 후 Redis 키 확인
docker exec trenduity-redis redis-cli KEYS "card:complete:*"

# 예상 키 형식
# card:complete:demo-user-50s:ee4148a8-6f5b-497f-8f44-40c537e19220

# 키 값 확인
docker exec trenduity-redis redis-cli GET "card:complete:demo-user-50s:ee4148a8-6f5b-497f-8f44-40c537e19220"

# TTL 확인 (86400초 = 24시간)
docker exec trenduity-redis redis-cli TTL "card:complete:demo-user-50s:ee4148a8-6f5b-497f-8f44-40c537e19220"
```

### Option C: Python 직접 테스트

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
. .\venv\Scripts\Activate.ps1

# 첫 완료
python ..\..\scripts\test_card_completion.py

# Redis 키 확인
docker exec trenduity-redis redis-cli KEYS "*"

# 두 번째 완료 (400 예상)
python ..\..\scripts\test_card_completion.py
```

---

## 🛠️ 예상되는 수정 사항

### 수정 1: Redis 키 생성 함수 확인

**파일**: `services/bff-fastapi/app/routers/cards.py`

```python
def _get_completion_key(user_id: str, card_id: str) -> str:
    """Redis 완료 키 생성"""
    return f"card:complete:{user_id}:{card_id}"
```

### 수정 2: 중복 체크 로직 강화

**파일**: `services/bff-fastapi/app/routers/cards.py` (line 26-50)

**현재 코드**:
```python
def _is_card_completed_today(redis: Optional[Redis], db: Optional[Client], user_id: str, card_id: str) -> bool:
    """Redis 또는 DB에서 오늘 완료 여부 확인 (동기 함수)"""
    # 1. Redis 우선 확인 (빠름)
    if redis:
        key = _get_completion_key(user_id, card_id)
        try:
            if redis.exists(key) > 0:
                logger.info(f"Redis에서 중복 감지: {key}")
                return True
        except Exception as e:
            logger.error(f"Redis 완료 확인 실패: {e}")
    # ...
```

**개선 필요 사항**:
- `redis.exists(key)` 실패 시 로그 추가
- Redis 연결 상태 확인
- 키 형식 검증

### 수정 3: Gamification 중복 완료 처리

**파일**: `services/bff-fastapi/app/services/gamification.py` (line 70-105)

**가능한 문제**:
- `_get_or_create_gamification` 호출 시 DB 에러
- `_update_streak` 호출 시 날짜 파싱 에러
- `_check_new_badges` 호출 시 배지 로직 에러

**추가할 에러 핸들링**:
```python
async def award_for_card_completion(...):
    try:
        # 기존 로직
        gamif = await self._get_or_create_gamification(user_id)
        streak_days = await self._update_streak(gamif, completion_date)
        # ...
    except Exception as e:
        logger.error(f"Gamification 에러: {e}", exc_info=True)
        # 기본값 반환 (포인트만 부여)
        return {
            "points_added": points,
            "total_points": 0,
            "streak_days": 0,
            "new_badges": [],
            "level": 1
        }
```

---

## 📊 성공 기준

### 최소 목표 (이미 달성 ✅)
- E2E 테스트 70% 이상 통과 (현재 74%)

### 이상적 목표 (다음 세션)
- 카드 완료 테스트 4/4 통과 → **26/34 (76%)**
- 두 번째 완료 시 400 에러 (ALREADY_COMPLETED) 반환
- Redis 캐시 정상 작동

### 최종 목표 (선택)
- Family link 테스트 구현 (Next.js 서버 필요) → 34/34 (100%)

---

## 📁 핵심 파일 위치

```
services/bff-fastapi/app/
├── routers/cards.py                   # 카드 완료 엔드포인트 (line 319-455)
│   ├── _get_completion_key()          # Redis 키 생성 (line 22-24)
│   ├── _is_card_completed_today()     # 중복 체크 (line 26-50)
│   └── _mark_card_completed()         # 완료 기록 (line 52-78)
├── services/gamification.py            # 게임화 로직 (line 70-145)
│   ├── award_for_card_completion()    # 포인트/스트릭 업데이트
│   ├── _get_or_create_gamification()  # 게임화 레코드 조회/생성
│   └── _update_streak()               # 스트릭 계산
└── core/deps.py                        # Redis 의존성 (line 80-95)

e2e/scenarios/card-completion.spec.ts   # 테스트 (line 91-160)
scripts/reset_card_completion.py         # 테스트 환경 리셋
scripts/test_card_completion.py          # 직접 API 테스트
scripts/migrations/002_verify_gamification_structure.sql  # DB 마이그레이션
```

---

## 🎯 다음 세션 목표 (30분 예상)

1. **BFF 로그 분석** (10분)
   - 두 번째 완료 시 어디서 멈추는지 확인
   - Redis 키 존재 여부 확인
   - Gamification 호출 여부 확인

2. **근본 원인 수정** (15분)
   - 중복 체크 로직 강화 또는
   - Gamification 에러 핸들링 추가

3. **E2E 테스트 검증** (5분)
   - 26/34 (76%) 달성 확인
   - 카드 완료 4/4 통과 확인

---

## 💡 빠른 시작 명령어 (복사 후 실행)

```powershell
# 터미널 1: BFF 서버 (디버그 모드)
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
. .\venv\Scripts\Activate.ps1
docker exec trenduity-redis redis-cli FLUSHALL
python ..\..\scripts\reset_card_completion.py
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload --log-level debug
```

```powershell
# 터미널 2: E2E 테스트
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\e2e
npx playwright test scenarios/card-completion.spec.ts:91 --reporter=list
```

---

**현재 남은 토큰**: 927,018 / 1,000,000 (92.7% 사용)  
**최종 업데이트**: 2025-11-21  
**다음 세션 우선순위**: P1 - 카드 완료 중복 방지 500 에러 해결
