-- qna_posts 테이블 스키마 업데이트
-- 기존 컬럼 삭제
ALTER TABLE qna_posts DROP COLUMN IF EXISTS question;
ALTER TABLE qna_posts DROP COLUMN IF EXISTS author_nickname;
ALTER TABLE qna_posts DROP COLUMN IF EXISTS answer_count;
ALTER TABLE qna_posts DROP COLUMN IF EXISTS vote_count;

-- title 컬럼 추가 (없는 경우)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='qna_posts' AND column_name='title'
    ) THEN
        ALTER TABLE qna_posts ADD COLUMN title TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- 완료 메시지
SELECT '✅ qna_posts 테이블 구조가 업데이트되었습니다. 이제 시드 데이터를 실행하세요.' AS status;
