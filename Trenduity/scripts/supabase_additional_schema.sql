-- =====================================================
-- Trenduity 추가 기능을 위한 Supabase 테이블 스키마
-- 생성일: 2025-12-09
-- =====================================================
-- 
-- ⚠️ 중요: profiles 테이블의 PK 컬럼명을 확인하세요!
-- - profiles(id)를 사용하는 경우: 아래 스키마 그대로 사용
-- - profiles(user_id)를 사용하는 경우: REFERENCES profiles(user_id)로 변경
-- 
-- 또는 auth.users(id)를 직접 참조할 수도 있습니다.
-- =====================================================

-- =====================================================
-- 1. 생활요금 기록 테이블 (expense_records)
-- =====================================================
-- 용도: 월별 가계부 기능, 생활요금 체크
-- 카테고리: rent(월세), mortgage(담보이자), maintenance(관리비), 
--           electricity(전기), gas(가스), water(수도), 
--           telecom(통신), tv(TV요금), insurance(보험), 
--           loan(대출), transport(교통), food(식비), other(기타)

CREATE TABLE IF NOT EXISTS expense_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- auth.users(id)를 직접 참조 (가장 안전한 방법)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 월 기준 (매월 1일로 저장, 예: 2025-12-01)
  month DATE NOT NULL,
  
  -- 지출 카테고리
  category TEXT NOT NULL CHECK (category IN (
    'rent', 'mortgage', 'maintenance', 'electricity', 'gas', 'water',
    'telecom', 'tv', 'insurance', 'loan', 'transport', 'food', 'other'
  )),
  
  -- 금액 (원 단위)
  amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0),
  
  -- 메모 (기타 항목 설명용)
  note TEXT,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 유니크 제약: 같은 사용자, 같은 월, 같은 카테고리는 하나만
  UNIQUE (user_id, month, category, note)
);

-- 인덱스
CREATE INDEX idx_expense_records_user_id ON expense_records(user_id);
CREATE INDEX idx_expense_records_month ON expense_records(month);
CREATE INDEX idx_expense_records_user_month ON expense_records(user_id, month);

-- RLS 정책
ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 지출 기록만 조회 가능
CREATE POLICY "Users can read own expense records"
  ON expense_records FOR SELECT
  USING (auth.uid() = user_id);

-- 쓰기는 BFF를 통해서만 (service_role 사용)
-- 직접 INSERT/UPDATE/DELETE는 허용하지 않음


-- =====================================================
-- 2. 할일 메모장 테이블 (todo_items)
-- =====================================================
-- 용도: 할일 관리 + 알림 기능

CREATE TABLE IF NOT EXISTS todo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- auth.users(id)를 직접 참조
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 할일 제목 (필수)
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 200),
  
  -- 상세 설명 (선택)
  description TEXT,
  
  -- 마감일 (선택)
  due_date TIMESTAMPTZ,
  
  -- 알림 시간 (선택) - 이 시간에 푸시 알림
  reminder_time TIMESTAMPTZ,
  
  -- 완료 여부
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- 알림 전송 여부 (서버에서 관리)
  notification_sent BOOLEAN DEFAULT FALSE,
  
  -- 디바이스 알림 ID (클라이언트에서 관리, 알림 취소용)
  notification_id TEXT,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ -- 완료 시점 기록
);

-- 인덱스
CREATE INDEX idx_todo_items_user_id ON todo_items(user_id);
CREATE INDEX idx_todo_items_due_date ON todo_items(due_date);
CREATE INDEX idx_todo_items_reminder ON todo_items(reminder_time) WHERE reminder_time IS NOT NULL AND NOT notification_sent;
CREATE INDEX idx_todo_items_user_completed ON todo_items(user_id, is_completed);

-- RLS 정책
ALTER TABLE todo_items ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 할일만 조회 가능
CREATE POLICY "Users can read own todo items"
  ON todo_items FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 할일을 직접 수정 가능 (완료 토글 등)
CREATE POLICY "Users can update own todo items"
  ON todo_items FOR UPDATE
  USING (auth.uid() = user_id);

-- 사용자는 자신의 할일을 직접 삭제 가능
CREATE POLICY "Users can delete own todo items"
  ON todo_items FOR DELETE
  USING (auth.uid() = user_id);

-- 쓰기는 service_role 또는 인증된 사용자12
CREATE POLICY "Authenticated users can insert todo items"
  ON todo_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- =====================================================
-- 3. updated_at 자동 갱신 트리거
-- =====================================================

-- 트리거 함수 (기존에 없다면 생성)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- expense_records 테이블 트리거
DROP TRIGGER IF EXISTS update_expense_records_updated_at ON expense_records;
CREATE TRIGGER update_expense_records_updated_at
  BEFORE UPDATE ON expense_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- todo_items 테이블 트리거
DROP TRIGGER IF EXISTS update_todo_items_updated_at ON todo_items;
CREATE TRIGGER update_todo_items_updated_at
  BEFORE UPDATE ON todo_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- todo 완료 시 completed_at 자동 설정
CREATE OR REPLACE FUNCTION update_todo_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    NEW.completed_at = NOW();
  ELSIF NEW.is_completed = FALSE THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_todo_completed_at ON todo_items;
CREATE TRIGGER update_todo_completed_at
  BEFORE UPDATE ON todo_items
  FOR EACH ROW
  EXECUTE FUNCTION update_todo_completed_at();


-- =====================================================
-- 4. 월별 지출 요약 뷰 (편의용)
-- =====================================================

CREATE OR REPLACE VIEW v_monthly_expense_summary AS
SELECT 
  user_id,
  month,
  SUM(amount) as total_amount,
  COUNT(*) as item_count,
  MAX(updated_at) as last_updated,
  jsonb_object_agg(
    COALESCE(category || COALESCE('_' || note, ''), category),
    amount
  ) as breakdown
FROM expense_records
GROUP BY user_id, month
ORDER BY month DESC;


-- =====================================================
-- 5. 샘플 데이터 (테스트용, 프로덕션에서는 주석 처리)
-- =====================================================

-- 주석 해제하여 테스트 데이터 삽입
-- INSERT INTO expense_records (user_id, month, category, amount) VALUES
--   ('your-user-uuid-here', '2025-12-01', 'rent', 500000),
--   ('your-user-uuid-here', '2025-12-01', 'maintenance', 150000),
--   ('your-user-uuid-here', '2025-12-01', 'electricity', 45000),
--   ('your-user-uuid-here', '2025-12-01', 'gas', 30000),
--   ('your-user-uuid-here', '2025-12-01', 'water', 15000),
--   ('your-user-uuid-here', '2025-12-01', 'telecom', 65000),
--   ('your-user-uuid-here', '2025-12-01', 'food', 400000);

-- INSERT INTO todo_items (user_id, title, description, due_date, reminder_time) VALUES
--   ('your-user-uuid-here', '병원 예약하기', '정형외과 예약 전화', '2025-12-15 10:00:00+09', '2025-12-14 18:00:00+09'),
--   ('your-user-uuid-here', '약 타기', '고혈압약 처방전 갱신', '2025-12-20 14:00:00+09', NULL);


-- =====================================================
-- 완료! 
-- Supabase SQL Editor에서 이 스크립트를 실행하세요.
-- =====================================================
