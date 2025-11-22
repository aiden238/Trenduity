-- Migration: 001_add_last_activity_date
-- Date: 2025-11-20
-- Purpose: gamification 테이블에 last_activity_date 컬럼 추가 (스트릭 계산용)

-- 1. last_activity_date 컬럼 추가 (NULL 허용)
ALTER TABLE gamification 
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- 2. 인덱스 추가 (스트릭 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_gamification_last_activity 
ON gamification(user_id, last_activity_date);

-- 3. 코멘트 추가
COMMENT ON COLUMN gamification.last_activity_date IS '마지막 활동 날짜 (카드 완료 기준)';

-- 4. 기존 데이터 마이그레이션 (completed_cards에서 가장 최근 날짜 가져오기)
UPDATE gamification g
SET last_activity_date = (
    SELECT DATE(MAX(completed_at))
    FROM completed_cards cc
    WHERE cc.user_id = g.user_id
)
WHERE last_activity_date IS NULL;

-- 완료
SELECT 'Migration 001_add_last_activity_date completed successfully' AS status;
