# 🚨 긴급: Completed Date 컬럼 추가 필요

## 문제 상황
- **GamificationService는 완벽하게 작동함** ✅
- **중복 완료 방지가 작동하지 않음** ❌
  - 원인: `completed_cards` 테이블에 `completed_date` 컬럼 누락
  - 결과: 같은 날 여러 번 카드 완료 가능, 포인트 중복 부여

## 해결 방법

### 1️⃣ Supabase 웹 콘솔 접속
1. https://supabase.com/dashboard/project/onnthandrqutdmvwnilf
2. SQL Editor 탭 클릭

### 2️⃣ 마이그레이션 SQL 실행
아래 SQL을 복사하여 SQL Editor에 붙여넣고 RUN:

```sql
-- Step 1: Add completed_date column
ALTER TABLE completed_cards 
ADD COLUMN IF NOT EXISTS completed_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Step 2: Populate existing rows
UPDATE completed_cards 
SET completed_date = DATE(completed_at) 
WHERE completed_date IS NULL OR completed_date = CURRENT_DATE;

-- Step 3: Drop old constraint
ALTER TABLE completed_cards 
DROP CONSTRAINT IF EXISTS completed_cards_user_id_card_id_date_key;

-- Step 4: Add new UNIQUE constraint
ALTER TABLE completed_cards 
ADD CONSTRAINT completed_cards_user_id_card_id_completed_date_unique 
UNIQUE (user_id, card_id, completed_date);

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS idx_completed_cards_date 
ON completed_cards(user_id, completed_date);
```

### 3️⃣ 검증
마이그레이션 후 실행:

```sql
-- 최근 완료된 카드 확인
SELECT user_id, card_id, completed_at, completed_date 
FROM completed_cards 
ORDER BY completed_at DESC 
LIMIT 10;

-- UNIQUE 제약 확인
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'completed_cards' 
  AND constraint_type = 'UNIQUE';
```

## 마이그레이션 후 테스트

### E2E 테스트 재실행
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
npx playwright test e2e/scenarios/card-completion.spec.ts --reporter=list
```

**기대 결과:**
- ✅ 첫 완료: 200, points_added: 8
- ✅ 두 번째 완료: 400, ALREADY_COMPLETED 에러

### 수동 테스트
```powershell
# 첫 완료
python -c "import requests; r = requests.post('http://localhost:8002/v1/cards/complete', headers={'Authorization': 'Bearer test-new-user'}, json={'card_id': 'test-card-123'}); print(f'Status: {r.status_code}, Points: {r.json()}')"

# 두 번째 완료 (즉시)
python -c "import requests; r = requests.post('http://localhost:8002/v1/cards/complete', headers={'Authorization': 'Bearer test-new-user'}, json={'card_id': 'test-card-123'}); print(f'Status: {r.status_code}, Error: {r.json()}')"
```

## 현재 상태 요약

### ✅ 작동하는 기능
- GamificationService.award_for_card_completion() - **포인트 계산 완벽**
- 스트릭 계산 (연속 일수)
- 배지 체크 (첫걸음, 포인트 100/500/1000 등)
- 레벨 계산 (1~5)
- Redis 캐싱

### ❌ 작동하지 않는 기능 (이 마이그레이션으로 수정)
- 같은 날 중복 완료 방지
  - 현재: 200 OK, 포인트 재부여
  - 수정 후: 400 Bad Request, ALREADY_COMPLETED

## 추가 조치

마이그레이션 완료 후:
1. BFF 서버 재시작 (혹시 모를 캐싱 이슈)
2. E2E 테스트 4/4 통과 확인
3. 수동으로 2-3회 중복 완료 시도하여 400 반환 확인

---

**마이그레이션 파일 위치:** 
`c:\AIDEN_PROJECT\Trenduity\Trenduity\scripts\migrations\add_completed_date_column.sql`
