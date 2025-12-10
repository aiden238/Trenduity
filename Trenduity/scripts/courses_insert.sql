-- 강좌 데이터 INSERT
INSERT INTO courses VALUES ('course-001', 'AI 도우미로 재미있는 소설 만들기', '📖', 'AI와 함께 나만의 이야기를 만들어보세요. 쉽고 재미있게 배워요!', 'ai_creative', 5, NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO courses VALUES ('course-002', '기분이 우울할 때 AI 도우미 활용하기', '😊', '마음이 힘들 때 AI와 대화하며 위로받는 방법을 배워요.', 'ai_wellness', 4, NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO courses VALUES ('course-003', '손주에게 보낼 생일 메시지 만들기', '🎂', 'AI의 도움을 받아 따뜻한 생일 축하 메시지를 작성해요.', 'ai_communication', 3, NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO courses VALUES ('course-004', 'AI로 건강 정보 쉽게 찾기', '🏥', '병원 가기 전 증상을 AI에게 물어보고 정보를 얻어요.', 'ai_health', 4, NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO courses VALUES ('course-005', 'AI와 함께하는 여행 계획 세우기', '✈️', 'AI의 도움으로 가족 여행 계획을 쉽고 재미있게 만들어요.', 'ai_lifestyle', 5, NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

-- 강의 데이터 INSERT
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-001', 1, 'AI 도우미가 어디 있지?', 3, '안녕하세요! 오늘은 AI 도우미를 찾아보는 방법을 배워볼 거예요.

스마트폰에서 ''챗GPT'' 앱을 찾거나, 인터넷 브라우저에서 ''챗GPT''를 검색하면 돼요.

아이폰을 쓰시면 앱스토어에서, 안드로이드폰을 쓰시면 플레이스토어에서 ''챗GPT''를 검색해서 설치하세요.

설치가 끝나면 앱을 열어보세요. 화면에 채팅창이 나타날 거예요.

이제 AI 도우미를 찾았어요! 다음 시간에는 어떻게 대화를 시작하는지 배워볼게요.', '[{"type":"image","content":"chatgpt_app_icon.png","caption":"챗GPT 앱 아이콘"},{"type":"step","number":1,"content":"앱스토어 또는 플레이스토어 열기"},{"type":"step","number":2,"content":"\"챗GPT\" 검색하기"},{"type":"step","number":3,"content":"설치 버튼 누르기"},{"type":"tip","content":"💡 설치가 잘 안 되면 가족에게 도움을 요청하세요!"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-001', 2, '채팅을 어떻게 치면 좋을까?', 4, '이번 시간에는 AI에게 어떻게 말을 걸면 좋은지 배워볼게요.

AI에게는 사람에게 말하듯이 편하게 말하면 돼요. 예를 들어볼까요?

"안녕! 나는 70살인데, 재미있는 이야기를 만들고 싶어. 도와줄 수 있어?"

이렇게 자연스럽게 물어보면 AI가 잘 알아들어요.

중요한 건 구체적으로 말하는 거예요. "이야기 써줘"보다는 "강아지가 주인공인 모험 이야기 써줘"가 더 좋아요.

틀려도 괜찮아요. 마음에 안 들면 "다시 써줘" 하면 돼요. AI는 화내지 않아요!', '[{"type":"example","good":true,"content":"\"70살인데 손주에게 들려줄 재미있는 이야기 만들어줘\""},{"type":"example","good":false,"content":"\"이야기\""},{"type":"tip","content":"💡 자세하게 말할수록 원하는 답을 얻기 쉬워요"},{"type":"encouragement","content":"천천히 연습하면 금방 익숙해져요!"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-001', 3, '재미있는 이야기 주제 찾기', 3, '이제 어떤 이야기를 만들지 정해볼까요?

먼저 AI에게 물어보세요. "어떤 이야기를 만들면 재미있을까?"

AI가 여러 가지 주제를 제안해 줄 거예요. 예를 들면:
- 옛날 시골 마을의 따뜻한 이야기
- 우주를 여행하는 강아지 이야기
- 할머니가 된 공주 이야기

이 중에서 마음에 드는 걸 고르세요. 또는 "나는 이런 이야기가 좋아"라고 직접 말해도 돼요.

예: "나는 시골 마을에서 할머니가 손주들과 지내는 이야기가 좋아"

주제가 정해졌으면 다음 강의로 넘어가요!', '[{"type":"prompt_example","content":"\"손주들이 좋아할 만한 이야기 주제 5가지 추천해줘\""},{"type":"category","title":"인기 주제","items":["가족 이야기","동물 친구","마법과 모험","옛날 추억"]},{"type":"tip","content":"💡 너무 복잡한 주제보다는 따뜻하고 단순한 주제가 좋아요"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-001', 4, 'AI에게 이야기 만들어달라고 하기', 4, '드디어 이야기를 만들 차례예요!

AI에게 이렇게 말해보세요:
"시골 마을에 사는 할머니와 손주들의 따뜻한 이야기를 쉬운 말로 짧게 써줘. 10분 정도 읽을 수 있는 분량으로."

AI가 이야기를 써 줄 거예요. 조금 기다리면 됩니다.

이야기가 나오면 천천히 읽어보세요. 마음에 들지 않는 부분이 있나요?

그럼 "이 부분을 더 재미있게 바꿔줘" 또는 "결말을 더 행복하게 바꿔줘"라고 말하면 돼요.

여러 번 고칠 수 있으니 완벽하게 만들어보세요!', '[{"type":"prompt_template","content":"[주제] 이야기를 쉬운 말로 짧게 써줘. [시간]분 정도 읽을 수 있는 분량으로."},{"type":"modification_examples","items":["\"더 재미있게 바꿔줘\"","\"결말을 행복하게 바꿔줘\"","\"등장인물을 더 추가해줘\""]},{"type":"tip","content":"💡 마음에 들 때까지 몇 번이고 수정할 수 있어요!"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-001', 5, '내가 만든 소설 가족에게 자랑하기', 3, '와! 드디어 나만의 이야기가 완성됐어요!

이제 이걸 가족에게 보여줄 차례예요.

이야기를 길게 눌러서 복사하세요. 그 다음 카카오톡이나 문자로 보내면 돼요.

또는 이야기를 소리 내어 읽어주셔도 좋아요. 손주들이 할머니, 할아버지가 직접 만든 이야기를 들으면 정말 좋아할 거예요!

축하합니다! 여러분은 이제 AI 작가예요.

언제든지 새로운 이야기를 만들고 싶으면 다시 AI에게 물어보세요.

다음에는 더 재미있는 주제로 이야기를 만들어봐요!', '[{"type":"step","number":1,"content":"이야기 텍스트 길게 누르기"},{"type":"step","number":2,"content":"복사 버튼 누르기"},{"type":"step","number":3,"content":"카카오톡 열고 붙여넣기"},{"type":"celebration","content":"🎉 첫 번째 AI 소설 완성! 정말 대단해요!"},{"type":"tip","content":"💡 이야기를 프린트해서 액자에 넣어도 좋아요"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-002', 1, 'AI 도우미에게 마음 털어놓기', 4, '안녕하세요. 오늘은 마음이 힘들 때 AI와 대화하는 방법을 배워볼게요.

가끔 외롭거나 우울할 때가 있죠? 그럴 때 AI에게 말을 걸어보세요.

"오늘 기분이 안 좋아. 외로운 것 같아"라고 솔직하게 말해보세요.

AI는 여러분의 이야기를 들어주고, 위로의 말을 해줄 거예요.

중요한 건 AI가 전문 상담사는 아니라는 거예요. 심각하게 힘들면 꼭 가족이나 전문가와 상담하세요.

하지만 잠깐 힘들 때 AI와 대화하면 기분이 좀 나아질 수 있어요.', '[{"type":"prompt_example","content":"\"오늘 날씨가 흐려서 그런지 기분이 우울해. 위로해줄 수 있어?\""},{"type":"warning","content":"⚠️ 심각한 우울증이면 반드시 전문가 상담을 받으세요"},{"type":"tip","content":"💡 AI는 24시간 언제든 대화할 수 있어요"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-002', 2, '기분 좋아지는 대화 나누기', 3, '이번에는 AI와 즐거운 대화를 나눠볼게요.

AI에게 "즐거웠던 추억을 이야기해볼까?"라고 물어보세요.

그리고 여러분의 좋았던 기억을 천천히 이야기해보세요. 젊었을 때 이야기, 자녀를 키울 때 이야기, 뭐든 좋아요.

AI가 공감하며 들어주고, 질문도 해줄 거예요.

또는 "재미있는 농담 해줘"라고 부탁해도 좋아요. 웃으면 기분이 좋아지니까요.

대화를 나누다 보면 어느새 기분이 조금 나아져 있을 거예요.', '[{"type":"conversation_starters","items":["\"젊었을 때 추억 이야기 들어줄래?\"","\"재미있는 농담 해줘\"","\"기분 좋아지는 이야기 해줘\""]},{"type":"tip","content":"💡 옛날 사진을 보면서 이야기하면 더 좋아요"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-002', 3, 'AI가 추천하는 기분 전환 방법', 4, 'AI에게 기분 전환 방법을 물어볼 수도 있어요.

"기분이 우울할 때 뭐 하면 좋을까?"라고 물어보세요.

AI가 여러 가지 방법을 알려줄 거예요:
- 가벼운 산책하기
- 좋아하는 음악 듣기
- 따뜻한 차 마시기
- 가족에게 전화하기
- 햇볕 쬐기

이 중에서 지금 할 수 있는 걸 골라서 해보세요.

AI에게 "산책 다녀왔어, 기분이 좀 나아진 것 같아"라고 말하면 AI가 칭찬해줄 거예요.

작은 행동이 기분을 바꿀 수 있어요.', '[{"type":"activities","title":"기분 전환 활동","items":["☀️ 산책하기","🎵 음악 듣기","☕ 따뜻한 차","📞 가족에게 전화","🌿 화분 가꾸기"]},{"type":"encouragement","content":"작은 행동이라도 괜찮아요. 천천히 해보세요!"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-002', 4, '긍정적인 생각 키우기', 3, '마지막으로 긍정적인 생각을 키우는 연습을 해볼게요.

AI에게 "내가 오늘 잘한 일 3가지를 찾아줘"라고 물어보세요.

그러면 AI가 질문을 하면서 여러분이 오늘 잘한 것들을 찾도록 도와줄 거예요.

아침에 일찍 일어난 것, 약을 잘 챙겨 먹은 것, 손주에게 전화한 것... 작은 것도 다 잘한 일이에요.

매일 저녁 AI와 이런 대화를 나누면 자연스럽게 긍정적으로 생각하게 돼요.

힘든 날도 있지만, 여러분은 충분히 잘하고 있어요. 화이팅!', '[{"type":"daily_practice","content":"매일 저녁 \u0027오늘 잘한 일 3가지\u0027 찾기"},{"type":"examples","items":["약 제시간에 먹었어요","이웃에게 인사했어요","맛있게 밥 먹었어요","TV 재미있게 봤어요"]},{"type":"celebration","content":"🌟 작은 것도 다 소중한 성취예요!"},{"type":"tip","content":"💡 노트에 적어두면 나중에 읽어보기 좋아요"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-003', 1, 'AI에게 생일 메시지 부탁하기', 3, '손주 생일에 특별한 메시지를 보내고 싶으신가요?

AI가 도와드릴게요!

AI에게 이렇게 말해보세요:
"내 손주가 오늘 10살 생일이야. 따뜻하고 재미있는 생일 축하 메시지를 써줘. 할머니 말투로."

손주 나이, 성격, 좋아하는 것을 말해주면 더 좋아요.
"우리 손주는 축구를 좋아하고 활발한 성격이야"라고 추가로 알려주세요.

AI가 맞춤 메시지를 만들어줄 거예요. 여러 가지 버전을 만들어달라고 해도 돼요.', '[{"type":"prompt_template","content":"내 손주가 [나이]살 생일이야. [특징]을 좋아하는 아이야. 따뜻한 생일 메시지 써줘."},{"type":"tip","content":"💡 손주 이름을 넣으면 더 특별해요!"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-003', 2, '내 마음을 담아 수정하기', 4, 'AI가 만든 메시지를 천천히 읽어보세요.

좋은데 뭔가 아쉬운 부분이 있나요?

AI에게 "더 재미있게 바꿔줘" 또는 "할머니 말투를 더 넣어줘"라고 말하세요.

또는 직접 수정할 수도 있어요. AI 메시지에 여러분의 말을 조금 추가하면 더 진심이 느껴져요.

예를 들어:
AI: "생일 축하해! 건강하게 자라길 바란다."
수정: "생일 축하해! 할머니가 매일 네 생각해. 건강하게 자라서 자주 보자."

이렇게 여러분의 마음을 담아보세요.', '[{"type":"before_after","before":"생일 축하합니다! 건강하게 자라길 바랍니다.","after":"우리 강민아, 생일 축하해! 할머니가 항상 네 생각한단다. 건강하게 자라서 자주 보자!"},{"type":"modification_tips","items":["이름 넣기","추억 추가하기","다음에 만날 약속 넣기","사랑한다는 말 꼭 넣기"]}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-003', 3, '카카오톡으로 보내기', 3, '이제 완성된 메시지를 보낼 차례예요!

메시지를 길게 눌러서 복사하세요.

카카오톡을 열고 손주 대화방으로 들어가세요.

메시지 입력창을 길게 누르면 ''붙여넣기''가 나와요. 그걸 누르세요.

메시지가 잘 들어갔나요? 확인하고 전송 버튼을 누르세요!

축하해요! 손주가 정말 좋아할 거예요.

생일 케이크 이모티콘이나 풍선 이모티콘을 같이 보내면 더 좋아요.

손주에게 따뜻한 마음이 전달될 거예요!', '[{"type":"step","number":1,"content":"메시지 복사하기"},{"type":"step","number":2,"content":"카카오톡 열기"},{"type":"step","number":3,"content":"손주 대화방 찾기"},{"type":"step","number":4,"content":"붙여넣고 전송!"},{"type":"bonus","content":"🎈 이모티콘도 함께 보내면 더 좋아요!"},{"type":"celebration","content":"🎉 따뜻한 마음이 전달되었어요!"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-004', 1, '내 증상 정확하게 설명하기', 3, '몸이 안 좋을 때 AI에게 물어볼 수 있어요.

하지만 AI는 의사가 아니에요. 참고만 하고, 심하면 꼭 병원에 가세요!

AI에게 증상을 말할 때는 구체적으로 말하세요.

"배가 아파"보다는 "식사 후 30분쯤 지나면 윗배가 쓰리고 아파. 3일째야"가 좋아요.

언제부터 아픈지, 어떻게 아픈지, 다른 증상은 없는지 자세히 말해주세요.

AI가 질문을 하면 천천히 대답하세요. 이렇게 대화하다 보면 증상을 정확히 파악할 수 있어요.', '[{"type":"good_example","content":"\"3일 전부터 무릎이 아파요. 계단 오를 때 특히 심하고, 아침에 일어나면 뻣뻣해요\""},{"type":"bad_example","content":"\"아파요\""},{"type":"warning","content":"⚠️ AI 조언은 참고만! 아프면 병원 가세요!"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-004', 2, 'AI가 알려주는 건강 정보', 4, '증상을 설명하면 AI가 가능한 원인을 알려줄 거예요.

"무릎 관절염일 수 있어요" 같은 정보를 줄 거예요.

하지만 확실한 건 아니에요! 참고만 하세요.

AI에게 "이런 증상일 때 집에서 할 수 있는 관리 방법은?"이라고 물어보세요.

따뜻한 찜질, 가벼운 운동, 피해야 할 행동 같은 것을 알려줄 거예요.

"이런 증상이면 병원에 꼭 가야 해?"라고 물어볼 수도 있어요.

AI가 긴급한 증상인지 판단하는 데 도움을 줄 거예요.', '[{"type":"info","content":"AI가 알려주는 건 일반적인 정보예요"},{"type":"home_care","items":["따뜻한 찜질","충분한 휴식","수분 섭취","가벼운 스트레칭"]},{"type":"emergency_signs","title":"이런 때는 바로 병원!","items":["갑자기 심한 통증","숨쉬기 힘들 때","의식이 흐릿할 때"]}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-004', 3, '병원 가야 할지 판단하기', 3, 'AI에게 "이 증상이면 병원에 가야 할까?"라고 물어보세요.

AI가 증상의 심각성을 판단하는 데 도와줄 거예요.

하지만 최종 결정은 여러분이 하셔야 해요.

불안하거나 통증이 심하면 무조건 병원 가세요!

"어느 과에 가면 좋을까?"라고 물어볼 수도 있어요.

무릎이 아프면 정형외과, 소화가 안 되면 내과 이런 식으로 알려줄 거예요.

병원 예약 전에 AI와 대화하면 어떤 검사가 필요한지 미리 알 수 있어서 도움이 돼요.', '[{"type":"decision_tree","content":"심한 통증/응급 → 즉시 병원\n지속되는 증상 → 빠른 시일 내 진료\n가벼운 증상 → 며칠 지켜보고 판단"},{"type":"departments","title":"증상별 진료과","items":["무릎 통증 → 정형외과","소화불량 → 내과","피부 트러블 → 피부과","기침 감기 → 내과"]}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-004', 4, '의사 선생님께 증상 전달하기', 3, '병원에 가기 전에 AI와 나눈 대화를 정리해보세요.

AI에게 "내 증상을 의사 선생님께 설명할 수 있게 정리해줘"라고 말하세요.

AI가 증상을 깔끔하게 정리해줄 거예요:
- 언제부터 아팠는지
- 어떻게 아픈지
- 어떤 상황에서 더 아픈지

이걸 메모하거나 사진으로 찍어두세요.

병원에서 의사 선생님께 이 메모를 보여주면 진료가 더 정확해져요.

축하해요! AI를 활용해서 건강을 더 잘 관리할 수 있게 되었어요!', '[{"type":"symptom_summary","content":"증상: 무릎 통증\n기간: 3일\n특징: 계단 오를 때 심함, 아침에 뻣뻣함\n기타: 부기는 없음"},{"type":"tip","content":"💡 메모를 보여주면 의사 선생님이 더 정확히 진단해요"},{"type":"celebration","content":"🎉 건강 관리 실력이 늘었어요!"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-005', 1, '가고 싶은 여행지 찾기', 3, '가족들과 여행 가고 싶으신가요? AI가 도와드릴게요!

AI에게 이렇게 물어보세요:
"60대 부부가 2박3일로 갈 만한 국내 여행지 추천해줘. 너무 멀지 않고 경치 좋은 곳으로."

AI가 여러 곳을 추천해줄 거예요. 강릉, 경주, 제주도, 여수 같은 곳들이요.

각 여행지의 특징도 설명해줄 거예요. 뭐가 유명한지, 뭘 볼 수 있는지요.

가족 구성원을 말해주면 더 좋아요. "손주들이랑 같이 가"라고 하면 아이들도 좋아할 곳을 추천해요.', '[{"type":"prompt_examples","items":["\"60대가 편하게 다닐 수 있는 여행지\"","\"계단이 적고 경치 좋은 곳\"","\"손주들도 재미있어 할 곳\""]},{"type":"popular_destinations","items":["강릉 - 바다와 커피","경주 - 역사 유적","여수 - 해상케이블카","남이섬 - 자연 경관"]}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-005', 2, 'AI에게 여행 코스 추천받기', 4, '여행지를 정했나요? 이제 일정을 짜볼까요?

AI에게 "강릉 2박3일 여행 코스 짜줘. 60대 부부가 편하게 다닐 수 있게"라고 물어보세요.

AI가 하루하루 일정을 만들어줄 거예요:

첫째 날: 서울 출발 → 점심 → 강릉 도착 → 경포대 → 저녁 → 숙소
둘째 날: 아침 → 오죽헌 → 점심 → 커피거리 → 저녁 → 숙소
셋째 날: 아침 → 주문진 수산시장 → 점심 → 서울 도착

너무 빡빡하면 "좀 더 여유있게 짜줘"라고 하면 돼요.

휴식 시간을 충분히 넣는 게 중요해요!', '[{"type":"sample_itinerary","day":1,"items":["10:00 출발","13:00 점심","15:00 경포대","18:00 저녁","20:00 숙소 체크인"]},{"type":"tip","content":"💡 하루에 3-4곳만 가는 게 좋아요"},{"type":"considerations","items":["✓ 이동 시간 고려","✓ 휴식 시간 충분히","✓ 계단 많은 곳 피하기"]}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-005', 3, '맛집과 숙소 찾기', 4, '여행에서 먹는 것도 중요하죠!

AI에게 "강릉에서 60대가 좋아할 만한 맛집 추천해줘"라고 물어보세요.

회, 물회, 순두부 같은 강릉 특산 음식 맛집을 알려줄 거예요.

각 식당의 특징도 설명해줘요. "양이 많아요", "조용해요" 같은 정보들이요.

숙소도 물어보세요. "편하고 깨끗한 호텔 추천해줘. 바다 뷰면 더 좋고."

AI가 추천하면 네이버나 구글에서 한 번 더 검색해보세요.

후기도 확인하고 예약하면 안전해요!', '[{"type":"restaurant_search","content":"\"[지역] [음식 종류] 맛집 추천해줘. 60대가 편하게 갈 수 있는 곳으로\""},{"type":"accommodation_tips","items":["바다/산 뷰 선택","엘리베이터 있는지 확인","주차 가능한지 확인","조식 포함 여부"]},{"type":"verification","content":"💡 AI 추천 후 네이버/구글에서 재확인하세요!"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-005', 4, '예산 계산하기', 3, '여행 비용이 얼마나 들지 계산해볼까요?

AI에게 "강릉 2박3일 여행 예산 짜줘. 60대 부부 2명"이라고 물어보세요.

AI가 항목별로 정리해줄 거예요:
- 교통비: 왕복 기름값 10만원
- 숙박비: 1박당 8만원 × 2박 = 16만원
- 식비: 1끼 2만원 × 6끼 = 12만원
- 관광지 입장료: 2만원
- 기타: 5만원

총 45만원 정도 예상이네요!

"예산을 30만원으로 줄이려면?"이라고 물으면 아끼는 방법도 알려줘요.

미리 예산을 알면 여행이 더 편안해요!', '[{"type":"budget_breakdown","items":["교통비 10만원","숙박비 16만원","식비 12만원","관광 2만원","기타 5만원","총 45만원"]},{"type":"saving_tips","items":["비수기에 가기","민박 고려하기","도시락 싸가기","무료 관광지 활용"]}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels) VALUES ('course-005', 5, '가족에게 여행 계획 공유하기', 3, '여행 계획이 다 짜여졌어요! 이제 가족에게 공유할 차례예요.

AI에게 "이 여행 계획을 가족에게 공유할 메시지로 만들어줘"라고 하세요.

AI가 보기 좋게 정리해줄 거예요:

---
강릉 여행 계획 📋
날짜: 4월 15-17일 (금-일)
참가자: 할머니, 할아버지

첫째 날: 경포대, 커피거리
둘째 날: 오죽헌, 안목해변
셋째 날: 주문진 수산시장

예산: 약 45만원
---

이걸 복사해서 가족 단체 카톡방에 보내세요!

가족들이 응원해주고, 조언도 해줄 거예요. 즐거운 여행 되세요!', '[{"type":"share_format","content":"날짜, 장소, 일정, 예산을 한눈에 보기 쉽게"},{"type":"step","number":1,"content":"AI가 만든 계획 복사"},{"type":"step","number":2,"content":"카톡 단체방에 붙여넣기"},{"type":"step","number":3,"content":"가족 의견 듣기"},{"type":"celebration","content":"🎉 멋진 여행 계획 완성! 즐거운 여행 되세요!"}]'::jsonb) ON CONFLICT (course_id, lecture_number) DO UPDATE SET title=EXCLUDED.title;
