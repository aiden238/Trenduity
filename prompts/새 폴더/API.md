# API Reference

> **대상**: 클라이언트 개발자 (Mobile/Web)  
> **Base URL**: `http://localhost:8000` (로컬), `https://api.example.com` (프로덕션)

---

## 인증

모든 요청은 `Authorization` 헤더에 Supabase JWT 토큰 필요:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📖 Daily Cards

### GET `/v1/cards/today`

오늘의 학습 카드 조회

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "ai_tips",
  "title": "AI란 무엇인가요?",
  "tldr": "사람처럼 생각하고 배우는 컴퓨터 기술이에요.",
  "body": "AI(인공지능)는 컴퓨터가 사람처럼...",
  "impact": "AI를 이해하면 스마트폰을 더 편하게 사용할 수 있어요.",
  "quiz": [
    {
      "question": "AI가 할 수 있는 일은?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 3,
      "explanation": "..."
    }
  ],
  "estimatedReadMinutes": 3
}
```

**Errors**:
- `404`: 오늘 카드 없음

---

### POST `/v1/cards/complete`

카드 완료 기록

**Request**:
```json
{
  "cardId": "550e8400-e29b-41d4-a716-446655440000",
  "quizAnswers": [0, 1, 3],
  "readTimeSeconds": 180
}
```

**Response 200**:
```json
{
  "pointsEarned": 50,
  "newStreak": 5,
  "newTotalPoints": 250,
  "badges": ["first_card"]
}
```

---

## 🎤 Voice Intents

### POST `/v1/voice/intent`

음성 명령 파싱

**Request**:
```json
{
  "text": "엄마에게 전화해 줘"
}
```

**Response 200**:
```json
{
  "intent": "call",
  "slots": {
    "target": "엄마"
  },
  "summary": "엄마에게 전화합니다",
  "confidence": 0.92
}
```

**Intents**:
- `call`: 전화 걸기
- `sms`: 문자 보내기
- `search`: 검색
- `remind`: 알림 설정
- `navigate`: 길찾기
- `open_app`: 앱 열기
- `fallback`: 의도 불명확

---

## 🚨 Scam Check

### POST `/v1/scam/check`

SMS/URL 사기 검사

**Request**:
```json
{
  "text": "[긴급] 카드 승인 확인 필요 http://bit.ly/xxx",
  "url": null
}
```

**Response 200**:
```json
{
  "riskLevel": "danger",
  "matchedPatterns": ["긴급", "단축URL"],
  "tips": [
    "모르는 번호의 링크는 클릭하지 마세요",
    "은행은 문자에 링크를 넣지 않습니다"
  ]
}
```

**Risk Levels**:
- `safe`: 안전
- `warn`: 경고
- `danger`: 위험

---

## 💡 Insights

### GET `/v1/insights`

인사이트 목록 조회

**Query Params**:
- `topic` (optional): `ai`, `bigtech`, `economy`, `safety`, `mobile101`
- `limit` (optional): 기본 20

**Response 200**:
```json
{
  "insights": [
    {
      "id": "123",
      "topic": "ai",
      "title": "생성형 AI의 기초",
      "summary": "텍스트, 이미지, 영상을 만드는 AI 기술...",
      "readTimeMinutes": 5,
      "isFollowing": false
    }
  ]
}
```

---

### GET `/v1/insights/:id`

인사이트 상세 조회

**Response 200**:
```json
{
  "id": "123",
  "topic": "ai",
  "title": "생성형 AI의 기초",
  "summary": "...",
  "body": "전체 본문...",
  "readTimeMinutes": 5,
  "isFollowing": false
}
```

---

### POST `/v1/insights/follow`

토픽 팔로우

**Request**:
```json
{
  "topic": "ai"
}
```

**Response 200**:
```json
{
  "success": true
}
```

---

### GET `/v1/insights/following`

팔로우 중인 토픽 목록

**Response 200**:
```json
{
  "topics": ["ai", "safety"]
}
```

---

## 💬 Q&A

### GET `/v1/qna`

질문 목록 조회

**Query Params**:
- `topic` (optional): 토픽 필터
- `limit` (optional): 기본 20

**Response 200**:
```json
{
  "posts": [
    {
      "id": "456",
      "topic": "safety",
      "question": "문자 링크 눌러도 되나요?",
      "body": "택배 왔다고 문자가...",
      "isAnon": true,
      "authorNickname": null,
      "answerCount": 2,
      "voteCount": 5,
      "aiSummary": "모르는 링크는 클릭하지 마세요",
      "createdAt": "2025-11-12T10:00:00Z"
    }
  ]
}
```

---

### POST `/v1/qna`

질문 작성

**Request**:
```json
{
  "topic": "ai",
  "question": "AI 음성 비서 추천해주세요",
  "body": "아이폰 쓰는데...",
  "isAnon": false
}
```

**Response 201**:
```json
{
  "id": "789",
  "question": "AI 음성 비서 추천해주세요"
}
```

---

## 👍 Reactions

### POST `/v1/reactions`

리액션 토글

**Request**:
```json
{
  "targetType": "qna_post",
  "targetId": "456",
  "reactionType": "like"
}
```

**Response 200**:
```json
{
  "success": true,
  "action": "added"  // or "removed"
}
```

**Reaction Types**:
- `like`: 👍
- `love`: ❤️
- `wow`: 😮

---

## 🛠️ Tool Tracks

### GET `/v1/tools/progress`

도구 트랙 진행도 조회

**Response 200**:
```json
{
  "tools": [
    {
      "toolId": "canva",
      "name": "Canva",
      "totalSteps": 5,
      "completedSteps": 3,
      "lastCompletedAt": "2025-11-12T10:00:00Z"
    }
  ]
}
```

---

### POST `/v1/tools/progress`

단계 완료 기록

**Request**:
```json
{
  "toolId": "canva",
  "stepIndex": 3
}
```

**Response 200**:
```json
{
  "success": true,
  "pointsEarned": 10
}
```

---

## 👨‍👩‍👧 Family

### GET `/v1/family/members`

연동된 가족 목록

**Response 200**:
```json
{
  "seniors": [
    {
      "id": "user-123",
      "displayName": "김민수 (50대)",
      "ageBand": "50s",
      "relation": "parent",
      "linkedAt": "2025-11-01T00:00:00Z"
    }
  ]
}
```

---

### GET `/v1/family/members/:id/stats`

가족 활동 통계

**Response 200**:
```json
{
  "userId": "user-123",
  "displayName": "김민수 (50대)",
  "lastActive": "2025-11-12T10:30:00Z",
  "stats": {
    "cardsRead": 7,
    "insightsRead": 5,
    "qnaPosts": 1,
    "currentStreak": 7,
    "totalPoints": 250
  },
  "medChecks": {
    "lastCheck": "2025-11-12T08:00:00Z",
    "recentChecks": [true, true, true, true, true, true, true]  // 7 days
  }
}
```

---

### POST `/v1/family/invite`

가족 초대

**Request**:
```json
{
  "seniorId": "user-123",
  "relation": "child"
}
```

**Response 201**:
```json
{
  "success": true,
  "linkId": "link-456"
}
```

---

## 📊 Usage

### GET `/v1/usage`

사용 통계 조회

**Query Params**:
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

**Response 200**:
```json
{
  "period": {
    "start": "2025-11-06",
    "end": "2025-11-12"
  },
  "stats": {
    "cardsRead": 7,
    "insightsRead": 12,
    "voiceIntents": 15,
    "scamChecks": 3,
    "qnaPosts": 2
  }
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "error": "INVALID_PAYLOAD",
  "message": "필수 필드가 누락되었습니다",
  "details": {
    "missing_fields": ["cardId"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "인증이 필요합니다"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "요청한 리소스를 찾을 수 없습니다"
}
```

### 500 Internal Server Error
```json
{
  "error": "INTERNAL_ERROR",
  "message": "서버 오류가 발생했습니다"
}
```

---

**작성**: AI API Guide  
**업데이트**: 2025년 11월 13일
