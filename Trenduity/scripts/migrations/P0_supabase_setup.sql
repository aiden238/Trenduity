-- =====================================================
-- Trenduity P0 작업 - Supabase 설정 스크립트
-- 실행 순서: Supabase Dashboard → SQL Editor에 복사하여 실행
-- =====================================================

-- =====================================================
-- STEP 1: usage_counters 테이블 생성
-- =====================================================
CREATE TABLE IF NOT EXISTS usage_counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  month VARCHAR(7) NOT NULL, -- 'YYYY-MM' 형식
  cards_completed INT DEFAULT 0,
  insights_viewed INT DEFAULT 0,
  med_checks_done INT DEFAULT 0,
  total_points INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_usage_counters_user_month 
ON usage_counters(user_id, month);

CREATE INDEX IF NOT EXISTS idx_usage_counters_updated_at 
ON usage_counters(updated_at DESC);
                                    
-- 코멘트
COMMENT ON TABLE usage_counters IS '사용자별 월간 사용 통계';
COMMENT ON COLUMN usage_counters.month IS 'YYYY-MM 형식의 월';
COMMENT ON COLUMN usage_counters.cards_completed IS '완료한 카드 수';
COMMENT ON COLUMN usage_counters.insights_viewed IS '조회한 인사이트 수';
COMMENT ON COLUMN usage_counters.med_checks_done IS '복약 체크 횟수';
COMMENT ON COLUMN usage_counters.total_points IS '해당 월에 획득한 총 포인트';

-- =====================================================
-- STEP 2: RLS (Row Level Security) 정책 설정
-- =====================================================

-- usage_counters RLS 활성화
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- 사용자는 본인의 데이터만 조회 가능
CREATE POLICY "Users see own usage"
ON usage_counters FOR SELECT
USING (auth.uid()::text = user_id);

-- BFF만 모든 작업 가능 (service_role 키 사용)
CREATE POLICY "BFF updates usage"
ON usage_counters FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- STEP 3: gamification 테이블 업데이트
-- =====================================================

-- last_activity_date 컬럼 추가 (이미 있으면 스킵)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'gamification' AND column_name = 'last_activity_date'
    ) THEN
        ALTER TABLE gamification ADD COLUMN last_activity_date DATE;
    END IF;

    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'gamification' AND column_name = 'longest_streak'
    ) THEN
        ALTER TABLE gamification ADD COLUMN longest_streak INT DEFAULT 0;
    END IF;
END $$;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_gamification_last_activity 
ON gamification(user_id, last_activity_date);

CREATE INDEX IF NOT EXISTS idx_gamification_total_points 
ON gamification(total_points DESC);

-- 기존 데이터 마이그레이션 (completed_cards에서 가장 최근 날짜)
UPDATE gamification g
SET last_activity_date = (
    SELECT DATE(MAX(completed_at))
    FROM completed_cards cc
    WHERE cc.user_id = g.user_id
)
WHERE last_activity_date IS NULL;

-- =====================================================
-- STEP 4: Realtime 활성화 (5개 테이블)
-- =====================================================

-- Realtime 퍼블리케이션에 테이블 추가 (이미 있으면 에러 무시)
DO $$
BEGIN
    -- qna_answers
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE qna_answers;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- completed_cards
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE completed_cards;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- med_checks
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE med_checks;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- usage_counters
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE usage_counters;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- =====================================================
-- STEP 5: 기존 테이블 RLS 정책 검증 (에러 무시)
-- =====================================================

-- RLS 정책 설정 (테이블이 없거나 컬럼이 없으면 스킵)
DO $$
BEGIN
    -- profiles 테이블
    BEGIN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users see own profile" ON profiles;
        DROP POLICY IF EXISTS "BFF updates profiles" ON profiles;
        EXECUTE 'CREATE POLICY "BFF updates profiles" ON profiles FOR ALL USING (true) WITH CHECK (true)';
    EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN undefined_column THEN NULL;
    END;

    -- cards 테이블
    BEGIN
        ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Everyone can see cards" ON cards;
        DROP POLICY IF EXISTS "BFF updates cards" ON cards;
        CREATE POLICY "Everyone can see cards" ON cards FOR SELECT USING (true);
        CREATE POLICY "BFF updates cards" ON cards FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;

    -- completed_cards 테이블
    BEGIN
        ALTER TABLE completed_cards ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users see own completed cards" ON completed_cards;
        DROP POLICY IF EXISTS "BFF updates completed cards" ON completed_cards;
        EXECUTE 'CREATE POLICY "Users see own completed cards" ON completed_cards FOR SELECT USING (auth.uid()::text = user_id)';
        CREATE POLICY "BFF updates completed cards" ON completed_cards FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN undefined_column THEN NULL;
    END;

    -- insights 테이블
    BEGIN
        ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Everyone can see insights" ON insights;
        DROP POLICY IF EXISTS "BFF updates insights" ON insights;
        CREATE POLICY "Everyone can see insights" ON insights FOR SELECT USING (true);
        CREATE POLICY "BFF updates insights" ON insights FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;

    -- qna_posts 테이블
    BEGIN
        ALTER TABLE qna_posts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Everyone can see qna posts" ON qna_posts;
        DROP POLICY IF EXISTS "BFF updates qna posts" ON qna_posts;
        CREATE POLICY "Everyone can see qna posts" ON qna_posts FOR SELECT USING (true);
        CREATE POLICY "BFF updates qna posts" ON qna_posts FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;

    -- qna_answers 테이블
    BEGIN
        ALTER TABLE qna_answers ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Everyone can see qna answers" ON qna_answers;
        DROP POLICY IF EXISTS "BFF updates qna answers" ON qna_answers;
        CREATE POLICY "Everyone can see qna answers" ON qna_answers FOR SELECT USING (true);
        CREATE POLICY "BFF updates qna answers" ON qna_answers FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;

    -- family_links 테이블
    BEGIN
        ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users see own family links" ON family_links;
        DROP POLICY IF EXISTS "BFF updates family links" ON family_links;
        EXECUTE 'CREATE POLICY "Users see own family links" ON family_links FOR SELECT USING (auth.uid()::text = user_id OR auth.uid()::text = guardian_id)';
        CREATE POLICY "BFF updates family links" ON family_links FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN undefined_column THEN NULL;
    END;

    -- med_checks 테이블
    BEGIN
        ALTER TABLE med_checks ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users see own med checks" ON med_checks;
        DROP POLICY IF EXISTS "BFF updates med checks" ON med_checks;
        EXECUTE 'CREATE POLICY "Users see own med checks" ON med_checks FOR SELECT USING (auth.uid()::text = user_id)';
        CREATE POLICY "BFF updates med checks" ON med_checks FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN undefined_column THEN NULL;
    END;

    -- gamification 테이블
    BEGIN
        ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users see own gamification" ON gamification;
        DROP POLICY IF EXISTS "BFF updates gamification" ON gamification;
        EXECUTE 'CREATE POLICY "Users see own gamification" ON gamification FOR SELECT USING (auth.uid()::text = user_id)';
        CREATE POLICY "BFF updates gamification" ON gamification FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN undefined_column THEN NULL;
    END;
END $$;

-- =====================================================
-- STEP 6: 성능 최적화 인덱스 (에러 무시)
-- =====================================================

DO $$
BEGIN
    -- completed_cards: 사용자별 완료 조회
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_completed_cards_user_completed 
        ON completed_cards(user_id, completed_at DESC);
    EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN undefined_column THEN NULL;
    END;

    -- qna_posts: 카테고리별 최신순
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_qna_posts_category_created 
        ON qna_posts(category, created_at DESC);
    EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN undefined_column THEN NULL;
    END;

    -- user_follows: 팔로워별 타겟 조회
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_user_follows_follower_target 
        ON user_follows(follower_id, target_type, target_id);
    EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN undefined_column THEN NULL;
    END;

    -- med_checks: 사용자별 날짜순
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_med_checks_user_date 
        ON med_checks(user_id, date DESC);
    EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN undefined_column THEN NULL;
    END;
END $$;

-- =====================================================
-- 완료 확인
-- =====================================================
SELECT 
    'P0-4 Supabase 설정 완료!' AS status,
    '다음 단계: BFF 서버 재시작 및 API 테스트' AS next_step;
