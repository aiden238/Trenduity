# 04. Wiring Seed Data (시드 데이터 연동)

> **목적**: 시드 데이터가 BFF → Mobile → Web에서 **정상적으로 표시**되도록 보장  
> **검증**: API 응답, 모바일 화면, 웹 대시보드  
> **조정**: 쿼리 조건, 기본값, 에러 처리

---

## 📋 목표

시드 데이터를 삽입한 후 **실제 앱에서 보이는지** 검증하고, 필요 시 BFF 로직을 조정합니다.

**보장해야 할 것**:
- `/v1/cards/today` 최소 1개 카드 반환
- `/v1/insights` 각 토픽별 1개 이상 반환
- `/v1/qna` 시드 질문 노출
- 모바일 홈 화면에 "오늘의 카드" 표시
- 웹 대시보드에 가족 활동 표시

---

## 🎴 1. Daily Cards Wiring

### 문제: `/v1/cards/today` 빈 배열 반환

**원인**:
- 시드 카드의 `created_at`이 오늘 날짜가 아님
- BFF 쿼리가 `WHERE created_at = CURRENT_DATE` 필터링

**해결 방법 1**: 시드 카드 날짜 업데이트

```python
# scripts/seed_data.py에 추가
import datetime

for card in SEED_CARDS:
    cursor.execute("""
        INSERT INTO cards (type, title, tldr, body, impact, quiz, estimated_read_minutes, created_at)
        VALUES (%(type)s, %(title)s, %(tldr)s, %(body)s, %(impact)s, %(quiz)s, %(estimated_read_minutes)s, CURRENT_DATE)
        ON CONFLICT (title) DO UPDATE SET created_at = CURRENT_DATE
    """, card)
```

**해결 방법 2**: BFF 쿼리 완화

```python
# apps/bff-fastapi/routers/cards.py

@router.get("/today")
async def get_today_card(db: Session = Depends(get_db)):
    # 오늘 카드가 없으면 가장 최근 카드 반환
    today_card = db.query(Card).filter(
        Card.created_at == datetime.date.today()
    ).first()
    
    if not today_card:
        # Fallback: 가장 최근 카드
        today_card = db.query(Card).order_by(Card.created_at.desc()).first()
    
    if not today_card:
        raise HTTPException(status_code=404, detail="No cards available")
    
    return {
        "id": str(today_card.id),
        "type": today_card.type,
        "title": today_card.title,
        "tldr": today_card.tldr,
        "body": today_card.body,
        "impact": today_card.impact,
        "quiz": today_card.quiz,
        "estimatedReadMinutes": today_card.estimated_read_minutes
    }
```

### 검증

```bash
# curl 테스트
curl http://localhost:8000/v1/cards/today

# 예상 응답:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "ai_tips",
  "title": "AI란 무엇인가요?",
  "tldr": "사람처럼 생각하고 배우는 컴퓨터 기술이에요.",
  "body": "AI(인공지능)는 컴퓨터가 사람처럼...",
  "quiz": [...]
}
```

```bash
# 모바일 앱에서 확인
cd apps/mobile-rn
npm start
# HomeAScreen에 카드 표시됨
```

---

## 💡 2. Insights Wiring

### 문제: 특정 토픽에서 인사이트가 안 보임

**원인**:
- 토픽 필터링 시 대소문자 불일치 (`AI` vs `ai`)
- 시드 데이터에 특정 토픽 누락

**해결 방법 1**: 토큰 값 통일

```python
# apps/bff-fastapi/routers/insights.py

@router.get("")
async def list_insights(
    topic: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Insight)
    
    if topic:
        # 대소문자 무시
        query = query.filter(func.lower(Insight.topic) == topic.lower())
    
    insights = query.order_by(Insight.created_at.desc()).limit(20).all()
    
    return {
        "insights": [
            {
                "id": str(i.id),
                "topic": i.topic,
                "title": i.title,
                "summary": i.summary,
                "readTimeMinutes": i.read_time_minutes,
                "isFollowing": False  # TODO: user별 follow 상태
            }
            for i in insights
        ]
    }
```

**해결 방법 2**: 시드 데이터 검증

```sql
-- 토픽별 인사이트 개수 확인
SELECT topic, COUNT(*) 
FROM insights 
GROUP BY topic;

-- 예상 결과:
-- ai       | 3
-- bigtech  | 3
-- economy  | 3
-- safety   | 3
-- mobile101| 3
```

### 검증

```bash
# 전체 인사이트
curl http://localhost:8000/v1/insights

# 토픽 필터
curl http://localhost:8000/v1/insights?topic=ai
curl http://localhost:8000/v1/insights?topic=safety

# 모바일 앱
# InsightListScreen에서 각 토픽 탭 확인
```

---

## 💬 3. Q&A Wiring

### 문제: Q&A 화면이 비어있음

**원인**:
- 시드 데이터 미삽입
- `author_id`가 존재하지 않는 유저 참조

**해결 방법**: 데모 유저 먼저 생성

```python
# scripts/seed_data.py

# 1. 데모 유저 먼저 생성
cursor.execute("""
    INSERT INTO profiles (id, display_name, age_band)
    VALUES ('demo-user-seed', '데모유저', '60s')
    ON CONFLICT (id) DO NOTHING
""")

# 2. Q&A 삽입 시 author_id 사용
for post in SEED_QNA_POSTS:
    cursor.execute("""
        INSERT INTO qna_posts (author_id, topic, question, body, is_anon, ai_summary)
        VALUES ('demo-user-seed', %(topic)s, %(question)s, %(body)s, %(is_anon)s, %(ai_summary)s)
        ON CONFLICT (question) DO NOTHING
    """, post)
```

### 검증

```bash
# API 테스트
curl http://localhost:8000/v1/qna

# 예상 응답:
{
  "posts": [
    {
      "id": "...",
      "question": "문자에 있는 링크 눌러도 되나요?",
      "topic": "safety",
      "isAnon": true,
      "authorNickname": null,
      "answerCount": 0,
      "voteCount": 0,
      "aiSummary": "모르는 번호의 링크는 클릭하지 마세요."
    },
    ...
  ]
}
```

```bash
# 모바일 앱
# QnAListScreen에서 질문 목록 확인
```

---

## 👨‍👩‍👧 4. Family Dashboard Wiring

### 문제: 가족 대시보드에 활동이 안 보임

**원인**:
- `usage_counters` 테이블이 비어있음
- BFF가 `usage_counters`에서 통계를 읽는데 seed 안 함

**해결 방법**: Seed 시 usage_counters 생성

```python
# scripts/seed_profiles.py에 추가

USAGE_COUNTERS = [
    {
        "user_id": "demo-user-50s",
        "date": "2025-11-12",
        "cards_read": 1,
        "insights_read": 2,
        "qna_posts": 0,
        "voice_intents": 3
    },
    {
        "user_id": "demo-user-60s",
        "date": "2025-11-12",
        "cards_read": 1,
        "insights_read": 0,
        "qna_posts": 1,
        "voice_intents": 1
    }
]

def seed_usage_counters(conn):
    cursor = conn.cursor()
    
    for counter in USAGE_COUNTERS:
        cursor.execute("""
            INSERT INTO usage_counters (user_id, date, cards_read, insights_read, qna_posts, voice_intents)
            VALUES (%(user_id)s, %(date)s, %(cards_read)s, %(insights_read)s, %(qna_posts)s, %(voice_intents)s)
            ON CONFLICT (user_id, date) DO UPDATE SET
                cards_read = EXCLUDED.cards_read,
                insights_read = EXCLUDED.insights_read
        """, counter)
    
    conn.commit()
    print(f"✅ Usage Counters: {len(USAGE_COUNTERS)} inserted")
```

### 검증

```bash
# BFF API
curl http://localhost:8000/v1/family/members/demo-user-50s/stats

# 예상 응답:
{
  "userId": "demo-user-50s",
  "displayName": "김민수 (50대)",
  "lastActive": "2025-11-12T10:30:00Z",
  "stats": {
    "cardsRead": 7,
    "insightsRead": 5,
    "qnaPosts": 1,
    "currentStreak": 7
  }
}
```

```bash
# 웹 대시보드
cd apps/web-next
npm run dev
# http://localhost:3000/dashboard 접속
# Guardian 계정으로 로그인 후 가족 활동 확인
```

---

## 🧪 5. E2E Verification Script

### `scripts/verify_seed.sh`

```bash
#!/bin/bash
# Seed 데이터 검증 스크립트

BFF_URL="http://localhost:8000"

echo "🧪 Verifying seed data..."

# 1. Daily Card
echo "1️⃣ Testing /v1/cards/today"
CARD_RESPONSE=$(curl -s $BFF_URL/v1/cards/today)
CARD_TITLE=$(echo $CARD_RESPONSE | jq -r '.title')

if [ -z "$CARD_TITLE" ]; then
  echo "❌ No card returned"
  exit 1
else
  echo "✅ Card: $CARD_TITLE"
fi

# 2. Insights
echo "2️⃣ Testing /v1/insights?topic=ai"
INSIGHT_COUNT=$(curl -s "$BFF_URL/v1/insights?topic=ai" | jq '.insights | length')

if [ "$INSIGHT_COUNT" -ge 1 ]; then
  echo "✅ Insights: $INSIGHT_COUNT found"
else
  echo "❌ No insights for topic 'ai'"
  exit 1
fi

# 3. Q&A
echo "3️⃣ Testing /v1/qna"
QNA_COUNT=$(curl -s $BFF_URL/v1/qna | jq '.posts | length')

if [ "$QNA_COUNT" -ge 1 ]; then
  echo "✅ Q&A: $QNA_COUNT posts"
else
  echo "❌ No Q&A posts found"
  exit 1
fi

# 4. Family Stats
echo "4️⃣ Testing /v1/family/members/demo-user-50s/stats"
STATS_RESPONSE=$(curl -s $BFF_URL/v1/family/members/demo-user-50s/stats)
USER_NAME=$(echo $STATS_RESPONSE | jq -r '.displayName')

if [ "$USER_NAME" == "김민수 (50대)" ]; then
  echo "✅ Family Stats: $USER_NAME"
else
  echo "❌ Family stats not found"
  exit 1
fi

echo "🎉 All verifications passed!"
```

### 실행

```bash
chmod +x scripts/verify_seed.sh
./scripts/verify_seed.sh
```

**예상 출력**:
```
🧪 Verifying seed data...
1️⃣ Testing /v1/cards/today
✅ Card: AI란 무엇인가요?
2️⃣ Testing /v1/insights?topic=ai
✅ Insights: 3 found
3️⃣ Testing /v1/qna
✅ Q&A: 5 posts
4️⃣ Testing /v1/family/members/demo-user-50s/stats
✅ Family Stats: 김민수 (50대)
🎉 All verifications passed!
```

---

## 🔧 6. Common Issues & Fixes

### Issue 1: "No cards available"

**원인**: `cards` 테이블이 비어있음

**해결**:
```bash
python scripts/seed_data.py
```

### Issue 2: Insights 빈 배열

**원인**: 토픽 enum 불일치

**해결**:
```sql
-- insights 테이블의 topic 컬럼 확인
SELECT DISTINCT topic FROM insights;

-- 시드 스크립트의 topic 값과 일치하는지 확인
-- 'ai', 'bigtech', 'economy', 'safety', 'mobile101'
```

### Issue 3: Q&A author_id FK 오류

**원인**: `author_id`가 존재하지 않는 유저 참조

**해결**:
```python
# 1. 데모 유저 먼저 생성
cursor.execute("""
    INSERT INTO profiles (id, display_name, age_band)
    VALUES ('demo-user-seed', '데모유저', '60s')
    ON CONFLICT (id) DO NOTHING
""")

# 2. Q&A 삽입
```

### Issue 4: 한글 깨짐

**원인**: UTF-8 인코딩 설정 누락

**해결**:
```python
# Python
conn = psycopg2.connect(DATABASE_URL, client_encoding='utf8')

# JSON 파일
with open('seed_data.json', 'r', encoding='utf-8') as f:
```

### Issue 5: BFF 500 에러

**원인**: DB 스키마와 모델 불일치

**해결**:
```bash
# 마이그레이션 재실행
cd apps/bff-fastapi
alembic upgrade head

# 또는 Supabase 스키마 확인
```

---

## ✅ 최종 체크리스트

### API 응답 확인
- [ ] `/v1/cards/today` 카드 1개 반환
- [ ] `/v1/insights` 전체 목록 반환
- [ ] `/v1/insights?topic=ai` 필터링 동작
- [ ] `/v1/qna` 질문 5개 반환
- [ ] `/v1/family/members/xxx/stats` 통계 반환

### 모바일 앱 확인
- [ ] HomeAScreen에 "오늘의 카드" 표시
- [ ] InsightListScreen에 인사이트 목록
- [ ] 토픽 필터 탭 동작
- [ ] QnAListScreen에 질문 목록
- [ ] 익명 질문 "익명" 표시

### 웹 대시보드 확인
- [ ] Guardian 로그인 후 대시보드 접근
- [ ] 가족 목록 표시
- [ ] 활동 통계 표시 (카드/인사이트/Q&A)
- [ ] 최근 활동 시간 표시

### 데이터 품질
- [ ] 한글 정상 표시 (깨짐 없음)
- [ ] JSON 필드 (quiz) 정상 파싱
- [ ] 날짜 형식 일관성
- [ ] 외래 키 오류 없음

---

## 🔗 관련 문서

### SEED 단계
- [Index](./index.md) - 전체 개요
- [01. Seed Data Design](./01-seed-data-design.md) - 콘텐츠 정의
- [02. DB Seed Scripts](./02-db-seed-scripts.md) - 스크립트 작성
- [03. Demo Profiles](./03-demo-profiles.md) - 데모 유저

### IMPLEMENT 단계
- [Daily Card Implementation](../IMPLEMENT/02-daily-card-gamification.md)
- [Insight Hub Implementation](../IMPLEMENT/03-insight-hub.md)
- [Community Q&A Implementation](../IMPLEMENT/07-community-qna.md)

---

## 📝 Wiring Checklist for Each Feature

| Feature | API Endpoint | Mobile Screen | Web Page | Seed Data |
|---------|-------------|---------------|----------|-----------|
| Daily Card | `/v1/cards/today` | HomeAScreen, TodayCardScreen | - | 8 cards |
| Insights | `/v1/insights` | InsightListScreen, InsightDetailScreen | - | 15 insights |
| Q&A | `/v1/qna` | QnAListScreen | - | 5 posts |
| Family Stats | `/v1/family/members/:id/stats` | - | Dashboard | 3 profiles + usage_counters |
| Gamification | `/v1/gamification/points` | (Embedded in screens) | - | Points history |

---

**문서 작성**: AI Seed Guide  
**최종 업데이트**: 2025년 11월 13일
