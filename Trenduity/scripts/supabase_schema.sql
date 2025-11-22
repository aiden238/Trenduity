-- ==========================================
-- Trenduity Database Schema for Supabase
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Profiles (사용자 프로필)
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  age_band TEXT, -- '50s', '60s', '70s', '30s', '20s'
  a11y_mode TEXT DEFAULT 'normal', -- 'normal', 'easy', 'ultra'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ==========================================
-- 2. Gamification (포인트/스트릭/배지)
-- ==========================================
CREATE TABLE IF NOT EXISTS gamification (
  user_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  points INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_activity_date DATE,
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);  

CREATE INDEX IF NOT EXISTS idx_gamification_points ON gamification(points DESC);

-- ==========================================
-- 2-1. Completed Cards (완료된 카드 추적)
-- ==========================================
CREATE TABLE IF NOT EXISTS completed_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quiz_correct INT DEFAULT 0,
  quiz_total INT DEFAULT 0,
  
  UNIQUE(user_id, card_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_completed_cards_user ON completed_cards(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_completed_cards_card ON completed_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_completed_cards_date ON completed_cards(user_id, completed_date);

-- ==========================================
-- 3. Family Links (가족 연동)
-- ==========================================
CREATE TABLE IF NOT EXISTS family_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guardian_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  perms JSONB DEFAULT '{"read": true, "alerts": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(guardian_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_family_links_guardian ON family_links(guardian_id);
CREATE INDEX IF NOT EXISTS idx_family_links_user ON family_links(user_id);

-- ==========================================
-- 4. Cards (일일 학습 카드)
-- ==========================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'ai_tips', 'trend', 'safety', 'mobile101'
  title TEXT NOT NULL UNIQUE,
  tldr TEXT NOT NULL,
  body TEXT NOT NULL,
  impact TEXT,
  quiz JSONB,
  estimated_read_minutes INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at DESC);

-- ==========================================
-- 5. Insights (주간/월간 인사이트)
-- ==========================================
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL, -- 'ai', 'bigtech', 'economy', 'safety', 'mobile101'
  title TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  read_time_minutes INT DEFAULT 5,
  is_following BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_topic ON insights(topic);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at DESC);

-- ==========================================
-- 5-1. Insight Follows (인사이트 주제 팔로우)
-- ==========================================
CREATE TABLE IF NOT EXISTS insight_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL, -- 'ai', 'bigtech', 'economy', 'safety', 'mobile101'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, topic)
);

CREATE INDEX IF NOT EXISTS idx_insight_follows_user ON insight_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_insight_follows_topic ON insight_follows(topic);

-- ==========================================
-- 6. QnA Posts (커뮤니티 Q&A)
-- ==========================================
CREATE TABLE IF NOT EXISTS qna_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  topic TEXT NOT NULL, -- 'ai_tools', 'digital_safety', 'health', 'general'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_anon BOOLEAN DEFAULT false,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qna_posts_topic ON qna_posts(topic);
CREATE INDEX IF NOT EXISTS idx_qna_posts_created_at ON qna_posts(created_at DESC);

-- ==========================================
-- Row Level Security (RLS) - 기본 정책
-- ==========================================

-- 기존 정책 먼저 삭제
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own gamification" ON gamification;
DROP POLICY IF EXISTS "Cards are viewable by everyone" ON cards;
DROP POLICY IF EXISTS "Insights are viewable by everyone" ON insights;
DROP POLICY IF EXISTS "QnA posts are viewable by everyone" ON qna_posts;
DROP POLICY IF EXISTS "Guardians can view their family links" ON family_links;
DROP POLICY IF EXISTS "Users can view own follows" ON insight_follows;

-- Profiles: 모든 사용자 읽기 가능
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

-- Gamification: 본인 데이터만 조회/수정
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own gamification" 
  ON gamification FOR SELECT 
  USING (user_id = current_setting('app.current_user_id', true));

-- Cards: 모든 사용자 읽기 가능
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cards are viewable by everyone" 
  ON cards FOR SELECT 
  USING (true);

-- Insights: 모든 사용자 읽기 가능
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insights are viewable by everyone" 
  ON insights FOR SELECT 
  USING (true);

-- QnA Posts: 모든 사용자 읽기 가능
ALTER TABLE qna_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "QnA posts are viewable by everyone" 
  ON qna_posts FOR SELECT 
  USING (true);

-- Family Links: Guardian만 조회 가능
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guardians can view their family links" 
  ON family_links FOR SELECT 
  USING (guardian_id = current_setting('app.current_user_id', true));

-- Insight Follows: 본인 팔로우만 조회/수정
ALTER TABLE insight_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own follows" 
  ON insight_follows FOR SELECT 
  USING (user_id = current_setting('app.current_user_id', true));

-- ==========================================
-- 7. Tools Progress (도구 실습 진행 상황)
-- ==========================================
CREATE TABLE IF NOT EXISTS tools_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tool TEXT NOT NULL, -- 'canva', 'miri', 'sora'
  step INT NOT NULL, -- 1, 2, 3, ...
  status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'done'
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, tool, step)
);

CREATE INDEX IF NOT EXISTS idx_tools_progress_user_tool ON tools_progress(user_id, tool);

-- RLS for tools_progress
DROP POLICY IF EXISTS "Users can view own tool progress" ON tools_progress;
ALTER TABLE tools_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tool progress" 
  ON tools_progress FOR SELECT 
  USING (user_id = current_setting('app.current_user_id', true));

-- ==========================================
-- 8. Reactions (리액션: 응원, 도움됐어요, 좋아요)
-- ==========================================
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL, -- 'card', 'insight', 'qna_post'
  target_id UUID NOT NULL,
  kind TEXT NOT NULL, -- 'cheer', 'useful', 'like'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, target_type, target_id, kind)
);

CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);

-- RLS for reactions
DROP POLICY IF EXISTS "Users can view all reactions" ON reactions;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all reactions" 
  ON reactions FOR SELECT 
  USING (true);

-- ==========================================
-- 9. Med Checks (복약 체크)
-- ==========================================
CREATE TABLE IF NOT EXISTS med_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_med_checks_user ON med_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_med_checks_date ON med_checks(date DESC);

-- RLS for med_checks
DROP POLICY IF EXISTS "Users can view own med checks" ON med_checks;
ALTER TABLE med_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own med checks" 
  ON med_checks FOR SELECT 
  USING (user_id = current_setting('app.current_user_id', true));

-- ==========================================
-- 10. Alerts (가족 알림)
-- ==========================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'encouragement', 'reminder', 'achievement'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- RLS for alerts
DROP POLICY IF EXISTS "Users can view own alerts" ON alerts;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alerts" 
  ON alerts FOR SELECT 
  USING (user_id = current_setting('app.current_user_id', true));

-- ==========================================
-- 12. scam_checks (사기 검사 기록)
-- ==========================================
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
  USING (user_id = current_setting('app.current_user_id', true));

-- ==========================================
-- 완료
-- ==========================================
-- 이 스키마를 Supabase SQL Editor에서 실행하세요.
-- 실행 후 scripts/seed_data.py로 데모 데이터를 삽입하세요.
