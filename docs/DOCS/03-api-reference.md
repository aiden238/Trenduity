# 03. API Reference 작성 가이드

> **목적**: `docs/API.md`를 작성하여 클라이언트 개발자가 엔드포인트를 쉽게 참조할 수 있도록 합니다.  
> **대상 독자**: 클라이언트 개발자 (React Native, Next.js)  
> **출력**: `docs/API.md`

---

## 📋 개요

API Reference는 **엔드포인트 사용 설명서**입니다. 다음 정보를 포함해야 합니다:

- 메서드 + URL
- 설명 (한 줄 요약)
- 요청 JSON 예시
- 응답 JSON 예시
- 주요 에러 코드/상황

---

## 🎯 문서 구조

### 전체 구조

````markdown
# API Reference

## Base URL

\```

# 로컬 개발

http://localhost:8000

# 프로덕션

https://api.trenduity.com
\```

## 인증

모든 엔드포인트는 **Bearer 토큰**이 필요합니다 (Supabase JWT).

\```http
Authorization: Bearer <your_jwt_token>
\```

## 에러 응답 형식

모든 에러 응답은 Envelope 패턴을 따릅니다:

\```json
{
"ok": false,
"error": {
"code": "CARD_NOT_FOUND",
"message": "카드를 찾을 수 없어요."
}
}
\```

---

## 엔드포인트 목록

### Cards (오늘의 카드)

- [GET /v1/cards/today](#get-v1cardstoday)
- [POST /v1/cards/complete](#post-v1cardscomplete)

### Insights (인사이트 허브)

- [GET /v1/insights](#get-v1insights)
- [GET /v1/insights/:id](#get-v1insightsid)
- [POST /v1/insights/follow](#post-v1insightsfollow)
- [GET /v1/insights/following](#get-v1insightsfollowing)

### Voice (음성 인텐트)

- [POST /v1/voice/intent](#post-v1voiceintent)

### Scam (사기검사)

- [POST /v1/scam/check](#post-v1scamcheck)

### Tools (도구 트랙)

- [GET /v1/tools/tracks](#get-v1toolstracks)
- [POST /v1/tools/progress](#post-v1toolsprogress)

### Q&A (커뮤니티)

- [GET /v1/qna](#get-v1qna)
- [POST /v1/qna](#post-v1qna)
- [POST /v1/qna/:id/reaction](#post-v1qnaidreaction)

### Family (가족 연동)

- [POST /v1/family/invite](#post-v1familyinvite)
- [GET /v1/family/members](#get-v1familymembers)
- [POST /v1/family/med-check](#post-v1familymed-check)

### Usage (사용량 통계)

- [GET /v1/usage/daily](#get-v1usagedaily)
  \```

---

## 엔드포인트 상세 포맷

각 엔드포인트는 다음 템플릿을 따릅니다:

````markdown
### GET /v1/cards/today

**설명**: 사용자의 오늘 카드를 조회합니다.

**요청**
\```http
GET /v1/cards/today HTTP/1.1
Authorization: Bearer <jwt_token>
\```

**응답 (성공)**
\```json
{
"ok": true,
"data": {
"id": "card-123",
"title": "ChatGPT 사용법",
"tldr": "ChatGPT는 질문에 답하는 AI입니다.",
"body": "ChatGPT는 OpenAI가 만든...",
"quiz": [
{
"question": "ChatGPT는 무엇인가요?",
"options": ["AI 챗봇", "게임", "쇼핑몰"],
"correct": 0
}
],
"status": "pending",
"date": "2025-11-14"
}
}
\```

**응답 (실패 - 카드 없음)**
\```json
{
"ok": false,
"error": {
"code": "CARD_NOT_FOUND",
"message": "오늘의 카드를 찾을 수 없어요."
}
}
\```

**에러 코드**

- `CARD_NOT_FOUND` (404): 오늘 카드가 아직 생성되지 않음
- `UNAUTHORIZED` (401): 인증 토큰 없음
  \```

---

## 📄 다루어야 할 엔드포인트 (11개 그룹)

### 1) Cards (오늘의 카드)

````markdown
## Cards

### GET /v1/cards/today

오늘의 카드 조회

### POST /v1/cards/complete

카드 완료 및 게임화 포인트 획득

**요청**
\```json
{
"card_id": "card-123",
"quiz_answers": [0, 1, 2]
}
\```

**응답**
\```json
{
"ok": true,
"data": {
"points_added": 11,
"total_points": 150,
"streak_days": 7,
"new_badges": []
}
}
\```
\```

### 2) Insights (인사이트 허브)

````markdown
## Insights

### GET /v1/insights

인사이트 목록 조회 (페이지네이션, 필터링)

**쿼리 파라미터**

- `topic` (선택): ai, health, finance, leisure
- `limit` (선택): 기본 20, 최대 50
- `offset` (선택): 페이지네이션

**예시**
\```http
GET /v1/insights?topic=ai&limit=20&offset=0
\```

### GET /v1/insights/:id

인사이트 상세 조회

### POST /v1/insights/follow

주제 팔로우

**요청**
\```json
{
"topic": "ai"
}
\```

### GET /v1/insights/following

팔로우한 주제 목록
\```

### 3) Voice (음성 인텐트)

````markdown
## Voice

### POST /v1/voice/intent

음성 텍스트를 파싱하여 인텐트 추출

**요청**
\```json
{
"text": "전화해줘 김민수"
}
\```

**응답**
\```json
{
"ok": true,
"data": {
"intent": "call",
"target": "김민수",
"phone": "010-1234-5678",
"confidence": 0.95
}
}
\```

**지원 인텐트**

- `call`: 전화하기
- `message`: 문자 보내기
- `search`: 검색하기
- `weather`: 날씨 확인
- `alarm`: 알람 설정
- `reminder`: 리마인더 설정
  \```

### 4) Scam (사기검사)

````markdown
## Scam Check

### POST /v1/scam/check

의심스러운 문자/URL 위험도 분석

**요청**
\```json
{
"text": "긴급! 계좌 확인 필요. 링크 클릭 http://suspicious.link",
"type": "sms"
}
\```

**응답**
\```json
{
"ok": true,
"data": {
"label": "danger",
"confidence": 0.92,
"tips": [
"절대 링크를 클릭하지 마세요",
"발신자 번호를 확인하세요",
"경찰청(182)에 신고하세요"
],
"patterns_detected": ["긴급", "계좌", "의심스러운 링크"]
}
}
\```

**위험도 레벨**

- `safe`: 안전
- `warn`: 주의
- `danger`: 위험
  \```

### 5) Tools (도구 트랙)

````markdown
## Tool Tracks

### GET /v1/tools/tracks

사용 가능한 도구 트랙 목록

**응답**
\```json
{
"ok": true,
"data": [
{
"id": "track-canva",
"tool_name": "canva",
"display_name": "Canva 기초",
"steps": [
{ "order": 1, "title": "회원가입하기" },
{ "order": 2, "title": "첫 디자인 만들기" }
]
}
]
}
\```

### POST /v1/tools/progress

단계 완료 기록

**요청**
\```json
{
"track_id": "track-canva",
"step_order": 1
}
\```
\```

### 6) Q&A (커뮤니티)

````markdown
## Community Q&A

### GET /v1/qna

Q&A 목록 조회 (최신순)

### POST /v1/qna

새 질문 작성

**요청**
\```json
{
"question": "ChatGPT는 어떻게 사용하나요?",
"is_anonymous": true
}
\```

### POST /v1/qna/:id/reaction

리액션 추가

**요청**
\```json
{
"reaction_type": "useful"
}
\```
\```

### 7) Family (가족 연동)

````markdown
## Family

### POST /v1/family/invite

가족 구성원 초대

**요청**
\```json
{
"guardian_email": "family@example.com",
"permission_level": "view"
}
\```

### GET /v1/family/members

연동된 가족 목록

### POST /v1/family/med-check

복약 체크

**요청**
\```json
{
"med_id": "med-123",
"checked_at": "2025-11-14T09:00:00Z"
}
\```
\```

### 8) Usage (사용량 통계)

````markdown
## Usage Statistics

### GET /v1/usage/daily

일일 사용량 통계 (가족 대시보드용)

**쿼리 파라미터**

- `user_id`: 조회 대상 시니어 ID
- `start_date`: 시작 날짜
- `end_date`: 종료 날짜

**응답**
\```json
{
"ok": true,
"data": [
{
"date": "2025-11-14",
"cards_completed": 1,
"insights_viewed": 3,
"med_checks": 2
}
]
}
\```
\```

---

## ✅ 체크리스트

API 문서 작성 완료 후:

### 내용

- [ ] Base URL, 인증 방법, 에러 형식 설명
- [ ] 11개 엔드포인트 그룹 모두 포함
- [ ] 각 엔드포인트마다 요청/응답 JSON 예시
- [ ] 주요 에러 코드 명시

### 형식

- [ ] HTTP 메서드 명확 (GET, POST, PUT, DELETE)
- [ ] JSON 코드 블록에 언어 태그
- [ ] 일관된 네이밍 (snake_case for JSON keys)

### 독자 테스트

- [ ] 프론트엔드 개발자가 읽고 즉시 API 호출 가능
- [ ] Postman/curl로 테스트 가능한 예시

---

## 💡 작성 팁

### 요청/응답 예시 작성

- 실제 사용 가능한 JSON (복사-붙여넣기 가능)
- 주석 없이 깔끔하게
- 타입 명확히 (문자열은 따옴표, 숫자는 그대로)

### 에러 케이스

- 가장 흔한 에러 2-3개만 명시
- 한국어 메시지 포함

### 쿼리 파라미터

- 선택/필수 명시
- 기본값 명시

---

## 🔗 다음 단계

- **다음**: [04. UX & A11y Notes](./04-ux-a11y-notes.md) - UX/접근성 가이드

---

**문서 작성**: AI Documentation Guide  
**최종 업데이트**: 2025년 11월 14일
````
````
````
````
````
````
````
````
````
````
