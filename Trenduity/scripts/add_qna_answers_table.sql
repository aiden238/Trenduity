-- ==========================================
-- 추가: qna_answers 테이블 (Q&A 답변)
-- ==========================================

CREATE TABLE IF NOT EXISTS qna_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES qna_posts(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  is_anon BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_qna_answers_post ON qna_answers(post_id);
CREATE INDEX IF NOT EXISTS idx_qna_answers_author ON qna_answers(author_id);
CREATE INDEX IF NOT EXISTS idx_qna_answers_created_at ON qna_answers(created_at DESC);

-- RLS 정책
DROP POLICY IF EXISTS "Answers are viewable by everyone" ON qna_answers;
ALTER TABLE qna_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Answers are viewable by everyone" 
  ON qna_answers FOR SELECT 
  USING (true);

SELECT '✅ qna_answers 테이블이 생성되었습니다.' AS status;
