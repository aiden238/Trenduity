-- Migration: 002_verify_gamification_structure
-- Date: 2025-11-20
-- Purpose: gamification 테이블 구조 확인 및 필요한 컬럼 추가/수정

-- 1. 테이블 구조 확인 및 컬럼 추가
DO $$ 
BEGIN
    -- total_points 컬럼 추가 (기존 points를 대체)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'gamification' AND column_name = 'total_points'
    ) THEN
        ALTER TABLE gamification ADD COLUMN total_points INT DEFAULT 0;
        -- 기존 points 데이터를 total_points로 복사
        UPDATE gamification SET total_points = COALESCE(points, 0);
    END IF;

    -- current_streak 컬럼 추가 (기존 streak_days를 대체)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'gamification' AND column_name = 'current_streak'
    ) THEN
        ALTER TABLE gamification ADD COLUMN current_streak INT DEFAULT 0;
        -- 기존 streak_days 데이터를 current_streak로 복사
        UPDATE gamification SET current_streak = COALESCE(streak_days, 0);
    END IF;

    -- longest_streak 컬럼 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'gamification' AND column_name = 'longest_streak'
    ) THEN
        ALTER TABLE gamification ADD COLUMN longest_streak INT DEFAULT 0;
        -- 현재 스트릭을 longest_streak 초기값으로 설정
        UPDATE gamification SET longest_streak = COALESCE(current_streak, 0);
    END IF;

    -- badges 컬럼은 JSONB 유지 (TEXT[] 변경 불필요)
    -- BFF 코드에서 JSONB 배열로 처리
END $$;

-- 2. 인덱스 추가 (이미 존재하면 스킵)
CREATE INDEX IF NOT EXISTS idx_gamification_total_points 
ON gamification(total_points DESC);

CREATE INDEX IF NOT EXISTS idx_gamification_current_streak 
ON gamification(current_streak DESC);

-- 3. 코멘트 추가
COMMENT ON COLUMN gamification.longest_streak IS '역대 최장 스트릭 (일)';
COMMENT ON COLUMN gamification.current_streak IS '현재 연속 스트릭 (일)';
COMMENT ON COLUMN gamification.badges IS '획득한 배지 목록 (JSONB 배열)';
COMMENT ON COLUMN gamification.total_points IS '총 획득 포인트';

-- 4. 기존 컬럼 제거 안내 (데이터 마이그레이션 완료 후 수동 실행)
-- ALTER TABLE gamification DROP COLUMN IF EXISTS points;
-- ALTER TABLE gamification DROP COLUMN IF EXISTS streak_days;

-- 5. 배지 목록 정의 (참고용 - 실제 배지는 gamification.badges JSONB 배열에 저장)
-- 가능한 배지들:
-- - "첫걸음": 첫 카드 완료 (5 포인트)
-- - "일주일 연속": 7일 스트릭
-- - "한 달 연속": 30일 스트릭
-- - "포인트 100": 100 포인트 달성
-- - "포인트 500": 500 포인트 달성
-- - "포인트 1000": 1000 포인트 달성
-- - "퀴즈 마스터": 퀴즈 50개 정답
-- - "사기 파수꾼": 사기 검사 10회
-- - "안전 지킴이": 복약 체크 30회
-- - "커뮤니티 스타": Q&A 좋아요 10개

-- 완료
SELECT 'Migration 002_verify_gamification_structure completed successfully' AS status;
