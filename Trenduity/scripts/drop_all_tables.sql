-- ==========================================
-- 기존 테이블 전체 삭제 (Clean Slate)
-- ==========================================

-- RLS 정책 먼저 삭제
DROP POLICY IF EXISTS "Users can view own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can view own med checks" ON med_checks;
DROP POLICY IF EXISTS "Users can view all reactions" ON reactions;
DROP POLICY IF EXISTS "Users can view own tool progress" ON tools_progress;
DROP POLICY IF EXISTS "Users can view own follows" ON insight_follows;
DROP POLICY IF EXISTS "Guardians can view their family links" ON family_links;
DROP POLICY IF EXISTS "QnA posts are viewable by everyone" ON qna_posts;
DROP POLICY IF EXISTS "Insights are viewable by everyone" ON insights;
DROP POLICY IF EXISTS "Cards are viewable by everyone" ON cards;
DROP POLICY IF EXISTS "Users can view own gamification" ON gamification;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- 테이블 삭제 (외래키 순서 고려)
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS med_checks CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS tools_progress CASCADE;
DROP TABLE IF EXISTS insight_follows CASCADE;
DROP TABLE IF EXISTS qna_posts CASCADE;
DROP TABLE IF EXISTS insights CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS family_links CASCADE;
DROP TABLE IF EXISTS gamification CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 완료 메시지
SELECT '✅ 모든 테이블과 정책이 삭제되었습니다. 이제 supabase_schema.sql을 실행하세요.' AS status;
