"""
데이터베이스 인덱스 최적화

성능 개선을 위한 추가 인덱스
"""

-- 가족 멤버 조회 최적화 (guardian_id로 자주 조회)
CREATE INDEX IF NOT EXISTS idx_family_members_guardian 
ON family_members(guardian_id) 
WHERE deleted_at IS NULL;

-- 사기 검사 기록 조회 최적화
CREATE INDEX IF NOT EXISTS idx_scam_checks_user_created 
ON scam_checks(user_id, created_at DESC);

-- 복약 체크 기록 조회 최적화 (날짜별 조회)
CREATE INDEX IF NOT EXISTS idx_med_checks_user_date 
ON med_checks(user_id, checked_at DESC);

-- 알림 조회 최적화 (guardian_id + 읽지 않은 알림)
CREATE INDEX IF NOT EXISTS idx_family_alerts_guardian_unread 
ON family_alerts(guardian_id, is_read, created_at DESC);

-- Q&A 답변 작성자 조회 최적화
CREATE INDEX IF NOT EXISTS idx_qna_answers_author_created 
ON qna_answers(author_id, created_at DESC) 
WHERE author_id IS NOT NULL;

-- 리액션 집계 최적화
CREATE INDEX IF NOT EXISTS idx_reactions_target 
ON reactions(target_type, target_id, reaction_type);

-- 게임화 배지 확인 최적화 (JSONB 인덱스)
CREATE INDEX IF NOT EXISTS idx_gamification_badges 
ON gamification USING GIN(badges);

-- 카드 타입별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_cards_type_date 
ON cards(type, date DESC);

-- 인사이트 주제별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_insights_topic_date 
ON insights(topic, date DESC);

-- 복합 인덱스: 사용자별 완료 카드 조회
CREATE INDEX IF NOT EXISTS idx_cards_user_status_date 
ON cards(user_id, status, date DESC);

-- ANALYZE로 통계 업데이트 (쿼리 플래너 최적화)
ANALYZE cards;
ANALYZE gamification;
ANALYZE qna_posts;
ANALYZE qna_answers;
ANALYZE family_members;
ANALYZE family_alerts;
ANALYZE scam_checks;
ANALYZE med_checks;
ANALYZE reactions;
ANALYZE insights;

-- 인덱스 사용 현황 확인 쿼리
/*
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
*/

-- 느린 쿼리 확인 (pg_stat_statements 필요)
/*
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 20;
*/
