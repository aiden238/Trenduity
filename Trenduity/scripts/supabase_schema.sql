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
  total_points INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  last_activity_date DATE,
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gamification_points ON gamification(total_points DESC);

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
-- 6. QnA Posts (커뮤니티 Q&A)
-- ==========================================
CREATE TABLE IF NOT EXISTS qna_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  topic TEXT NOT NULL, -- 'ai', 'bigtech', 'economy', 'safety', 'mobile101', 'etc'
  question TEXT NOT NULL UNIQUE,
  body TEXT,
  is_anon BOOLEAN DEFAULT false,
  author_nickname TEXT,
  answer_count INT DEFAULT 0,
  vote_count INT DEFAULT 0,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qna_posts_topic ON qna_posts(topic);
CREATE INDEX IF NOT EXISTS idx_qna_posts_created_at ON qna_posts(created_at DESC);

-- ==========================================
-- Row Level Security (RLS) - 기본 정책
-- ==========================================

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

-- ==========================================
-- 완료
-- ==========================================
-- 이 스키마를 Supabase SQL Editor에서 실행하세요.
-- 실행 후 scripts/seed_data.py로 데모 데이터를 삽입하세요.
