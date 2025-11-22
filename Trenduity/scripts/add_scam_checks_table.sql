-- scam_checks 테이블 추가 (배지 시스템 확장)
CREATE TABLE IF NOT EXISTS scam_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  input TEXT NOT NULL, -- 검사한 텍스트 (최대 200자 저장)
  label TEXT NOT NULL, -- 'safe', 'warn', 'danger'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scam_checks_user ON scam_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_scam_checks_created_at ON scam_checks(created_at DESC);

-- RLS for scam_checks
DROP POLICY IF EXISTS "Users can view own scam checks" ON scam_checks;
ALTER TABLE scam_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scam checks" 
  ON scam_checks FOR SELECT 
  USING (auth.uid()::text = user_id);

SELECT '✅ scam_checks 테이블이 추가되었습니다.' AS status;
