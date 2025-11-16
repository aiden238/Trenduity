# 01. Seed Data Design (시드 데이터 설계)

> **목적**: 앱 데모에 필요한 **실제 콘텐츠 정의**  
> **포맷**: JSON 구조 + 샘플 텍스트  
> **원칙**: 시니어 친화적, 교육적, 안전한 내용

---

## 📋 목표

MVP 앱이 **첫 실행부터 유용한 콘텐츠**를 제공하도록 시드 데이터를 설계합니다.

**핵심 요구사항**:
- 🎴 Daily Cards 8개 (4가지 타입)
- 💡 Insights 15개 (5개 토픽 × 3개)
- 💬 Q&A Posts 5개
- 🎮 Gamification Baseline (선택)

---

## 🎴 Daily Cards (8개)

### 데이터 구조

```typescript
interface SeedCard {
  type: 'ai_tips' | 'trend' | 'safety' | 'mobile101';
  title: string;
  tldr: string; // 한 줄 요약 (50자 이내)
  body: string; // 본문 (300-500자)
  impact: string; // 영향력 설명 (100자 이내)
  quiz: Array<{
    question: string;
    options: string[]; // 4지선다
    correctIndex: number; // 0-3
    explanation: string;
  }>;
  estimated_read_minutes: number; // 3분 고정
}
```

### 샘플 1: AI 활용법

```json
{
  "type": "ai_tips",
  "title": "AI란 무엇인가요?",
  "tldr": "사람처럼 생각하고 배우는 컴퓨터 기술이에요.",
  "body": "AI(인공지능)는 컴퓨터가 사람처럼 생각하고 학습하는 기술입니다. 예를 들어, 음성 비서(시리, 구글 어시스턴트)가 여러분의 말을 알아듣고 대답하는 것도 AI 덕분이에요.\n\n요즘은 AI가 사진을 분석해서 꽃 이름을 알려주거나, 문자 메시지를 읽어주기도 합니다. 심지어 여러분이 좋아할 만한 영상을 추천해주는 것도 AI가 하는 일이에요.\n\nAI는 어렵지 않아요. 스마트폰만 있으면 누구나 쉽게 사용할 수 있습니다. 오늘부터 음성 비서에게 \"오늘 날씨 알려줘\"라고 말해보세요!",
  "impact": "AI를 이해하면 스마트폰을 더 편하게 사용할 수 있어요.",
  "quiz": [
    {
      "question": "AI가 할 수 있는 일은 무엇인가요?",
      "options": [
        "사진 속 꽃 이름 알려주기",
        "날씨 예보하기",
        "문자 메시지 읽어주기",
        "모두 가능해요"
      ],
      "correctIndex": 3,
      "explanation": "AI는 사진 분석, 음성 인식, 추천 등 다양한 일을 할 수 있어요!"
    }
  ],
  "estimated_read_minutes": 3
}
```

### 샘플 2: 디지털 안전

```json
{
  "type": "safety",
  "title": "스미싱 문자 구별하는 법",
  "tldr": "모르는 번호의 링크는 절대 클릭하지 마세요.",
  "body": "스미싱은 문자로 가짜 링크를 보내서 개인정보를 훔치는 사기예요. \"택배가 도착했어요\", \"과태료를 납부하세요\" 같은 문자에 링크가 있다면 조심해야 합니다.\n\n구별하는 방법:\n1. 모르는 번호에서 온 문자는 의심하세요.\n2. 링크 주소가 이상하면(짧은 영문, 숫자) 클릭하지 마세요.\n3. 급하게 행동하라고 재촉하면 100% 사기예요.\n\n진짜 택배 회사나 은행은 문자에 링크를 넣지 않아요. 의심스러우면 직접 전화하거나 공식 앱을 사용하세요.",
  "impact": "스미싱을 피하면 금전 피해와 개인정보 유출을 막을 수 있어요.",
  "quiz": [
    {
      "question": "스미싱 문자를 받았을 때 올바른 행동은?",
      "options": [
        "링크를 바로 클릭한다",
        "모르는 번호면 무시한다",
        "가족에게 확인 후 클릭한다",
        "링크 주소를 확인한다"
      ],
      "correctIndex": 1,
      "explanation": "모르는 번호의 링크는 절대 클릭하지 말고 무시하는 게 가장 안전해요!"
    },
    {
      "question": "다음 중 스미싱일 가능성이 높은 문자는?",
      "options": [
        "\"택배 도착, http://bit.ly/xxx 확인하세요\"",
        "\"010-1234-5678님, 약속 시간 확인해주세요\"",
        "\"엄마, 전화 좀 해줘\"",
        "\"[은행] 입금 완료 (공식 앱 확인)\""
      ],
      "correctIndex": 0,
      "explanation": "짧은 URL(bit.ly)과 긴급한 톤은 스미싱의 대표적인 특징이에요."
    }
  ],
  "estimated_read_minutes": 3
}
```

### 샘플 3: 생활 팁 (모바일101)

```json
{
  "type": "mobile101",
  "title": "사진 정리하는 간단한 방법",
  "tldr": "앨범 기능을 사용하면 사진을 쉽게 분류할 수 있어요.",
  "body": "스마트폰에 사진이 너무 많아서 찾기 힘드셨나요? 걱정 마세요, 앨범 기능을 사용하면 쉽게 정리할 수 있어요.\n\n정리하는 방법:\n1. 사진 앱을 열고 '앨범' 탭을 터치하세요.\n2. '+' 버튼을 눌러 '가족 여행', '손주 사진' 같은 이름으로 새 앨범을 만드세요.\n3. 정리하고 싶은 사진을 길게 눌러 선택한 후, 만든 앨범으로 이동하세요.\n\n팁: 아이폰은 자동으로 인물, 장소별로 분류해줘요. '인물' 앨범에서 가족 얼굴을 찾아보세요!",
  "impact": "사진을 앨범별로 정리하면 원하는 사진을 빠르게 찾을 수 있어요.",
  "quiz": [
    {
      "question": "사진을 앨범으로 정리하는 첫 단계는?",
      "options": [
        "사진을 모두 삭제한다",
        "사진 앱에서 '앨범' 탭을 연다",
        "새 폴더를 만든다",
        "클라우드에 업로드한다"
      ],
      "correctIndex": 1,
      "explanation": "사진 앱의 '앨범' 탭에서 새 앨범을 만들어 정리할 수 있어요!"
    }
  ],
  "estimated_read_minutes": 3
}
```

### 샘플 4: 최신 트렌드

```json
{
  "type": "trend",
  "title": "2024년 AI 트렌드: 생성형 AI",
  "tldr": "AI가 글, 그림, 영상을 만들어주는 시대예요.",
  "body": "요즘 AI는 사람처럼 글을 쓰고, 그림을 그리고, 심지어 영상도 만들어요. 이걸 '생성형 AI'라고 부릅니다.\n\n예를 들어:\n- ChatGPT: 질문하면 답변을 작성해줘요.\n- DALL-E: \"고양이가 우주복 입고 달에 있는 그림\"이라고 말하면 그려줘요.\n- Sora: 짧은 영상을 만들어줘요.\n\n이런 도구는 창작 활동, 학습, 업무에 큰 도움이 돼요. 하지만 AI가 만든 콘텐츠는 항상 사실이 아닐 수 있으니, 중요한 결정은 사람이 확인해야 해요.",
  "impact": "생성형 AI를 알면 새로운 기술 트렌드를 이해하고 활용할 수 있어요.",
  "quiz": [
    {
      "question": "생성형 AI가 할 수 있는 일은?",
      "options": [
        "글쓰기",
        "그림 그리기",
        "영상 만들기",
        "모두 가능해요"
      ],
      "correctIndex": 3,
      "explanation": "생성형 AI는 글, 그림, 영상 등 다양한 콘텐츠를 만들 수 있어요!"
    }
  ],
  "estimated_read_minutes": 3
}
```

### 나머지 4개 카드 (간략 버전)

**5. AI 활용법**: "음성 비서로 할 수 있는 일들"  
- 알람 설정, 날씨 확인, 전화 걸기, 메모 작성 등

**6. 디지털 안전**: "비밀번호 안전하게 관리하기"  
- 복잡한 비밀번호, 메모장에 저장 금지, 비밀번호 관리 앱 사용

**7. 모바일101**: "문자 크기 키우는 방법"  
- 설정 → 디스플레이 → 글꼴 크기, 확대/축소 기능

**8. 최신 트렌드**: "빅테크 기업들의 AI 경쟁"  
- 구글, 애플, 마이크로소프트가 AI에 투자하는 이유

---

## 💡 Insights (15개, 5개 토픽)

### 데이터 구조

```typescript
interface SeedInsight {
  topic: 'ai' | 'bigtech' | 'economy' | 'safety' | 'mobile101';
  title: string;
  summary: string; // 150자 이내
  body: string; // 500-800자
  read_time_minutes: number; // 5-7분
  is_following: boolean; // 초기값 false
}
```

### 샘플: AI 토픽

```json
{
  "topic": "ai",
  "title": "생성형 AI의 기초 이해하기",
  "summary": "텍스트, 이미지, 영상을 만드는 AI 기술의 원리와 활용 방법을 쉽게 설명합니다.",
  "body": "생성형 AI는 데이터를 학습해서 새로운 콘텐츠를 만드는 기술입니다. 사람이 쓴 수백만 개의 글을 읽고 패턴을 배워서, 질문에 답하거나 이야기를 만들어요.\n\n대표적인 예:\n- ChatGPT: 질문에 답변하고, 이메일을 작성하고, 번역도 해줘요.\n- Midjourney: 설명만 하면 그림을 그려줘요.\n- Sora: 짧은 영상을 만들어줘요.\n\n하지만 AI는 완벽하지 않아요. 때로는 틀린 정보를 주거나, 상식에 맞지 않는 답을 할 수 있어요. 그래서 중요한 결정은 사람이 확인해야 합니다.\n\n생성형 AI를 사용할 때는:\n1. 명확하게 질문하세요. \"내일 날씨\"보다 \"서울 내일 날씨\"가 더 좋아요.\n2. 답변을 믿기 전에 다른 출처와 비교하세요.\n3. 개인정보는 절대 입력하지 마세요.\n\n생성형 AI는 도구일 뿐이에요. 우리가 똑똑하게 사용하면 큰 도움이 되지만, 맹신하면 위험할 수 있어요.",
  "read_time_minutes": 5,
  "is_following": false
}
```

### 토픽별 제목 (간략)

**AI (3개)**:
1. "생성형 AI의 기초 이해하기" (위 샘플)
2. "AI와 일자리: 위협일까, 기회일까?"
3. "AI 윤리: 공정성과 편향 문제"

**BigTech (3개)**:
1. "애플의 새로운 접근성 기능"
2. "구글이 AI 검색을 개선하는 방법"
3. "마이크로소프트의 AI 비서, Copilot"

**Economy (3개)**:
1. "AI가 경제에 미치는 영향"
2. "디지털 경제 시대, 시니어의 역할"
3. "온라인 쇼핑의 미래"

**Safety (3개)**:
1. "피싱과 스미싱의 차이"
2. "공공 와이파이 사용 시 주의사항"
3. "앱 권한 관리하는 법"

**Mobile101 (3개)**:
1. "스마트폰 배터리 오래 쓰는 팁"
2. "클라우드 저장소 활용법"
3. "앱 업데이트가 중요한 이유"

---

## 💬 Q&A Posts (5개)

### 데이터 구조

```typescript
interface SeedQnAPost {
  topic: 'ai' | 'bigtech' | 'economy' | 'safety' | 'mobile101';
  question: string;
  body?: string; // 질문 상세 (선택)
  is_anon: boolean;
  author_nickname?: string; // is_anon=false인 경우
  answer_count: number; // 초기값 0
  vote_count: number; // 초기값 0
  ai_summary?: string; // 선택
}
```

### 샘플 데이터

```json
[
  {
    "topic": "safety",
    "question": "문자에 있는 링크 눌러도 되나요?",
    "body": "택배 왔다고 문자가 왔는데, 링크를 눌러도 되는지 궁금합니다. 사기일까 봐 무서워요.",
    "is_anon": true,
    "answer_count": 0,
    "vote_count": 0,
    "ai_summary": "모르는 번호의 링크는 클릭하지 마세요. 진짜 택배 회사는 공식 앱이나 웹사이트를 사용합니다."
  },
  {
    "topic": "mobile101",
    "question": "미리캔버스에서 글씨 크기 바꾸는 법?",
    "body": null,
    "is_anon": false,
    "author_nickname": "디지털배우는김씨",
    "answer_count": 0,
    "vote_count": 0
  },
  {
    "topic": "ai",
    "question": "AI 음성 비서 추천해주세요",
    "body": "아이폰 쓰는데, 시리 말고 다른 AI 비서도 있나요?",
    "is_anon": false,
    "author_nickname": "호기심많은이씨",
    "answer_count": 0,
    "vote_count": 0
  },
  {
    "topic": "mobile101",
    "question": "가족과 사진 공유하는 쉬운 방법?",
    "body": "손주 사진을 가족들에게 보내고 싶은데, 카카오톡 말고 다른 방법도 있나요?",
    "is_anon": false,
    "author_nickname": "사진많은박씨",
    "answer_count": 0,
    "vote_count": 0
  },
  {
    "topic": "ai",
    "question": "포인트는 어떻게 쌓나요?",
    "body": null,
    "is_anon": true,
    "answer_count": 0,
    "vote_count": 0,
    "ai_summary": "카드 읽기, 퀴즈 풀기, Q&A 참여 등으로 포인트를 쌓을 수 있어요."
  }
]
```

---

## 🎮 Gamification Baseline (선택)

### Demo User 포인트 히스토리

```json
{
  "user_id": "demo-user-60s",
  "current_points": 150,
  "current_streak": 5,
  "history": [
    {
      "date": "2025-11-08",
      "action": "card_complete",
      "points": 30,
      "streak_bonus": 0
    },
    {
      "date": "2025-11-09",
      "action": "card_complete",
      "points": 30,
      "streak_bonus": 5
    },
    {
      "date": "2025-11-10",
      "action": "quiz_perfect",
      "points": 20,
      "streak_bonus": 0
    },
    {
      "date": "2025-11-11",
      "action": "card_complete",
      "points": 30,
      "streak_bonus": 5
    },
    {
      "date": "2025-11-12",
      "action": "card_complete",
      "points": 30,
      "streak_bonus": 0
    }
  ],
  "badges": [
    {
      "badge_id": "first_card",
      "name": "첫 카드 달성",
      "earned_at": "2025-11-08"
    }
  ]
}
```

---

## ✅ 체크리스트

### 콘텐츠 품질
- [ ] Daily Cards 8개 작성 (타입별 2개씩)
- [ ] 각 카드 본문 300-500자
- [ ] Quiz 1-3문항 포함
- [ ] Insights 15개 작성 (토픽별 3개)
- [ ] Q&A 5개 작성
- [ ] 한국어 자연스러움 확인

### 데이터 구조
- [ ] JSON 스키마 유효성 확인
- [ ] 필수 필드 누락 없음
- [ ] Enum 값 정확함 (type, topic)
- [ ] 날짜 형식 통일 (ISO 8601)

### 안전성
- [ ] 특정 개인/브랜드 비난 없음
- [ ] 의료/법률 조언 없음
- [ ] 정치적 편향 없음
- [ ] 시니어 존중하는 톤

---

## 🔗 다음 단계

시드 데이터 설계 완료 후:
1. **[02. DB Seed Scripts](./02-db-seed-scripts.md)** - 스크립트 작성
2. **[03. Demo Profiles](./03-demo-profiles.md)** - 데모 유저 생성
3. **[04. Wiring Seed Data](./04-wiring-seed-data.md)** - BFF 연동

---

**문서 작성**: AI Seed Guide  
**최종 업데이트**: 2025년 11월 13일
