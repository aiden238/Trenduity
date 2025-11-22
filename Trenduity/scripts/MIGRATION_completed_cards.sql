-- ==========================================
-- completed_cards 테이블 생성 마이그레이션
-- ==========================================
-- 생성일: 2025-11-19
-- 목적: 카드 완료 기록 추적 (중복 방지)
-- ==========================================

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS completed_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    card_id UUID NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_date DATE,
    quiz_correct INT DEFAULT 0,
    quiz_total INT DEFAULT 0
);

-- 2. 트리거 함수 (completed_date 자동 채우기)
CREATE OR REPLACE FUNCTION set_completed_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.completed_date := DATE(NEW.completed_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE TRIGGER trg_set_completed_date
BEFORE INSERT OR UPDATE ON completed_cards
FOR EACH ROW
EXECUTE FUNCTION set_completed_date();

-- 3. Foreign Key 제약 조건
ALTER TABLE completed_cards 
ADD CONSTRAINT completed_cards_user_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE completed_cards 
ADD CONSTRAINT completed_cards_card_fkey 
FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;

-- 4. Unique 인덱스 (하루 1회 완료 제한)
CREATE UNIQUE INDEX IF NOT EXISTS idx_completed_cards_daily_unique 
ON completed_cards(user_id, card_id, completed_date);

-- 4. 성능 인덱스
CREATE INDEX IF NOT EXISTS idx_completed_cards_user 
ON completed_cards(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_completed_cards_card 
ON completed_cards(card_id);

-- ==========================================
-- 실행 방법:
-- 1. https://supabase.com/dashboard 접속
-- 2. 프로젝트 선택 (onnthandrqutdmvwnilf)
-- 3. SQL Editor 메뉴 선택
-- 4. 위 SQL 전체 복사-붙여넣기 후 실행
-- ==========================================
