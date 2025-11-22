# Med Checks 테이블 마이그레이션

## 실행 방법

1. Supabase 대시보드 접속 (https://supabase.com/dashboard)
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New Query** 버튼 클릭
5. 아래 SQL 전체를 복사하여 붙여넣기
6. **Run** 버튼 클릭 (또는 Ctrl+Enter)

## SQL

```sql
-- ==========================================
-- Med Checks Table Migration
-- 복약 체크 테이블 생성
-- ==========================================

-- 복약 체크 테이블
CREATE TABLE IF NOT EXISTS med_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  medication_name TEXT,
  notes TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 하루에 같은 time_slot은 중복 불가
  UNIQUE(user_id, date, time_slot)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_med_checks_user ON med_checks(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_med_checks_date ON med_checks(date DESC);

-- RLS 정책 (사용자 자신의 데이터만 조회 가능)
ALTER TABLE med_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own med checks"
  ON med_checks FOR SELECT
  USING (auth.uid() = user_id);

-- BFF는 service_role로 모든 작업 가능하므로 INSERT/UPDATE/DELETE는 별도 정책 불필요

COMMENT ON TABLE med_checks IS '시니어 복약 체크 기록';
COMMENT ON COLUMN med_checks.time_slot IS '복약 시간대: morning(아침), afternoon(점심), evening(저녁)';
COMMENT ON COLUMN med_checks.date IS '복약 날짜 (YYYY-MM-DD)';
```

## 확인 방법

실행 후 다음 쿼리로 테이블 생성 확인:

```sql
SELECT * FROM med_checks LIMIT 1;
```

성공 메시지: `Success. No rows returned` (테이블은 생성되었으나 데이터가 없음)

## 예상 효과

이 마이그레이션 후:
- Med Check 테스트 3개 추가 통과 (2/5 → 5/5)
- 전체 E2E 테스트: 28/34 → 31/34 (91.2%)
