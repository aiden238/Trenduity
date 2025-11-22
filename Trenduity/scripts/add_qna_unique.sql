-- qna_posts 테이블 정리 및 UNIQUE 제약 조건 추가

-- 기존 데이터 모두 삭제 (깨끗한 시작)
TRUNCATE TABLE qna_posts CASCADE;

-- UNIQUE 제약 조건 추가
ALTER TABLE qna_posts ADD CONSTRAINT qna_posts_title_unique UNIQUE (title);

-- 완료 메시지
SELECT '✅ qna_posts 테이블이 정리되고 UNIQUE 제약 조건이 추가되었습니다. 이제 시드 데이터를 실행하세요.' AS status;
