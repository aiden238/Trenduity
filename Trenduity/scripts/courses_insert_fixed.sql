-- 강좌 테이블 삽입
INSERT INTO courses (id, title, thumbnail, description, category, total_lectures) VALUES ('course-001', 'AI 도우미로 재미있는 소설 만들기', '📖', 'AI와 함께 나만의 이야기를 만들어보세요. 쉽고 재미있게 배워요!', 'ai_creative', 5) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, updated_at=NOW();

INSERT INTO courses (id, title, thumbnail, description, category, total_lectures) VALUES ('course-002', '기분이 우울할 때 AI 도우미 활용하기', '😊', '마음이 힘들 때 AI와 대화하며 위로받는 방법을 배워요.', 'ai_wellness', 4) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, updated_at=NOW();

INSERT INTO courses (id, title, thumbnail, description, category, total_lectures) VALUES ('course-003', '손주에게 보낼 생일 메시지 만들기', '🎂', 'AI의 도움을 받아 따뜻한 생일 축하 메시지를 작성해요.', 'ai_communication', 3) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, updated_at=NOW();

INSERT INTO courses (id, title, thumbnail, description, category, total_lectures) VALUES ('course-004', 'AI로 건강 정보 쉽게 찾기', '🏥', '병원 가기 전 증상을 AI에게 물어보고 정보를 얻어요.', 'ai_health', 4) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, updated_at=NOW();

INSERT INTO courses (id, title, thumbnail, description, category, total_lectures) VALUES ('course-005', 'AI와 함께하는 여행 계획 세우기', '✈️', 'AI의 도움으로 가족 여행 계획을 쉽고 재미있게 만들어요.', 'ai_lifestyle', 5) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, updated_at=NOW();

