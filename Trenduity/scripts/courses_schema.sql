-- ==========================================
-- 강좌 시스템 테이블 (Courses & Lectures)
-- ==========================================

-- 강좌 테이블
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY, -- 'course-001', 'course-002' 등 커스텀 ID
  title TEXT NOT NULL,
  thumbnail TEXT, -- 이모지 또는 이미지 URL
  description TEXT,
  category TEXT DEFAULT 'ai_learning',
  total_lectures INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- 강의 테이블 (각 강좌의 1강, 2강...)
CREATE TABLE IF NOT EXISTS lectures (
  id SERIAL PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lecture_number INT NOT NULL, -- 1, 2, 3, 4, 5
  title TEXT NOT NULL,
  duration INT DEFAULT 3, -- 분 단위
  script TEXT NOT NULL, -- TTS로 읽을 대본
  panels JSONB DEFAULT '[]', -- 화면에 표시할 패널 정보
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, lecture_number)
);

CREATE INDEX IF NOT EXISTS idx_lectures_course ON lectures(course_id, lecture_number);

-- 사용자 강좌 진도 테이블
CREATE TABLE IF NOT EXISTS user_course_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  last_watched_lecture INT DEFAULT 0, -- 마지막으로 본 강의 번호
  completed_lectures INT DEFAULT 0, -- 완료한 강의 수
  completed_at TIMESTAMPTZ, -- 전체 강좌 완료 시간
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_user_course_progress_user ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_last_accessed ON user_course_progress(user_id, last_accessed_at DESC);
