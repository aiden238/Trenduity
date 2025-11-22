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
