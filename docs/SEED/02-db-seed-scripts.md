# 02. DB Seed Scripts (데이터베이스 초기화 스크립트)

> **목적**: 시드 데이터를 Supabase/Postgres에 자동으로 삽입하는 스크립트 작성  
> **언어**: Python 또는 TypeScript/Node.js  
> **실행 환경**: 로컬 개발, CI/CD 파이프라인

---

## 📋 목표

**Idempotent**(멱등성) 방식으로 시드 데이터를 삽입:
- 중복 실행 시 데이터 중복 없음
- 실패 시 명확한 에러 로그
- 진행 상황 출력 (삽입/업데이트 개수)

**삽입 대상**:
- `cards` 테이블 (8개)
- `insights` 테이블 (15개)
- `qna_posts` 테이블 (5개)
- `profiles` 테이블 (3개, 선택)

---

## 🐍 Python 버전

### 1) 환경 설정

```bash
# requirements.txt
psycopg2-binary==2.9.9
python-dotenv==1.0.0
```

```bash
pip install -r requirements.txt
```

### 2) `.env` 파일

```bash
# .env
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres
# 또는 Supabase URL
# DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### 3) `scripts/seed_data.py`

```python
#!/usr/bin/env python3
"""
Seed script for 50-70대 AI 학습 앱 MVP
Inserts cards, insights, qna_posts into Supabase/Postgres
"""

import os
import json
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env")

# ============================================================
# Seed Data (from 01-seed-data-design.md)
# ============================================================

SEED_CARDS = [
    {
        "type": "ai_tips",
        "title": "AI란 무엇인가요?",
        "tldr": "사람처럼 생각하고 배우는 컴퓨터 기술이에요.",
        "body": "AI(인공지능)는 컴퓨터가 사람처럼 생각하고 학습하는 기술입니다...",
        "impact": "AI를 이해하면 스마트폰을 더 편하게 사용할 수 있어요.",
        "quiz": [
            {
                "question": "AI가 할 수 있는 일은 무엇인가요?",
                "options": ["사진 속 꽃 이름 알려주기", "날씨 예보하기", "문자 메시지 읽어주기", "모두 가능해요"],
                "correctIndex": 3,
                "explanation": "AI는 사진 분석, 음성 인식, 추천 등 다양한 일을 할 수 있어요!"
            }
        ],
        "estimated_read_minutes": 3
    },
    {
        "type": "safety",
        "title": "스미싱 문자 구별하는 법",
        "tldr": "모르는 번호의 링크는 절대 클릭하지 마세요.",
        "body": "스미싱은 문자로 가짜 링크를 보내서 개인정보를 훔치는 사기예요...",
        "impact": "스미싱을 피하면 금전 피해와 개인정보 유출을 막을 수 있어요.",
        "quiz": [
            {
                "question": "스미싱 문자를 받았을 때 올바른 행동은?",
                "options": ["링크를 바로 클릭한다", "모르는 번호면 무시한다", "가족에게 확인 후 클릭한다", "링크 주소를 확인한다"],
                "correctIndex": 1,
                "explanation": "모르는 번호의 링크는 절대 클릭하지 말고 무시하는 게 가장 안전해요!"
            }
        ],
        "estimated_read_minutes": 3
    },
    # ... (나머지 6개 카드는 01-seed-data-design.md 참조)
]

SEED_INSIGHTS = [
    {
        "topic": "ai",
        "title": "생성형 AI의 기초 이해하기",
        "summary": "텍스트, 이미지, 영상을 만드는 AI 기술의 원리와 활용 방법을 쉽게 설명합니다.",
        "body": "생성형 AI는 데이터를 학습해서 새로운 콘텐츠를 만드는 기술입니다...",
        "read_time_minutes": 5
    },
    # ... (나머지 14개 인사이트)
]

SEED_QNA_POSTS = [
    {
        "topic": "safety",
        "question": "문자에 있는 링크 눌러도 되나요?",
        "body": "택배 왔다고 문자가 왔는데, 링크를 눌러도 되는지 궁금합니다.",
        "is_anon": True,
        "ai_summary": "모르는 번호의 링크는 클릭하지 마세요."
    },
    # ... (나머지 4개 질문)
]

# ============================================================
# Database Functions
# ============================================================

def get_connection():
    """PostgreSQL 연결"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise

def seed_cards(conn):
    """cards 테이블에 시드 데이터 삽입"""
    cursor = conn.cursor()
    inserted = 0
    updated = 0
    
    for card in SEED_CARDS:
        try:
            # Idempotent: 동일 title이 있으면 업데이트, 없으면 삽입
            cursor.execute("""
                INSERT INTO cards (type, title, tldr, body, impact, quiz, estimated_read_minutes)
                VALUES (%(type)s, %(title)s, %(tldr)s, %(body)s, %(impact)s, %(quiz)s, %(estimated_read_minutes)s)
                ON CONFLICT (title)
                DO UPDATE SET
                    body = EXCLUDED.body,
                    quiz = EXCLUDED.quiz,
                    updated_at = NOW()
                RETURNING (xmax = 0) AS inserted
            """, {
                **card,
                'quiz': json.dumps(card['quiz'])  # JSON 직렬화
            })
            
            result = cursor.fetchone()
            if result and result[0]:
                inserted += 1
            else:
                updated += 1
        except Exception as e:
            print(f"❌ Failed to insert card '{card['title']}': {e}")
            conn.rollback()
            raise
    
    conn.commit()
    print(f"✅ Cards: {inserted} inserted, {updated} updated")

def seed_insights(conn):
    """insights 테이블에 시드 데이터 삽입"""
    cursor = conn.cursor()
    inserted = 0
    updated = 0
    
    for insight in SEED_INSIGHTS:
        try:
            cursor.execute("""
                INSERT INTO insights (topic, title, summary, body, read_time_minutes)
                VALUES (%(topic)s, %(title)s, %(summary)s, %(body)s, %(read_time_minutes)s)
                ON CONFLICT (title)
                DO UPDATE SET
                    body = EXCLUDED.body,
                    summary = EXCLUDED.summary,
                    updated_at = NOW()
                RETURNING (xmax = 0) AS inserted
            """, insight)
            
            result = cursor.fetchone()
            if result and result[0]:
                inserted += 1
            else:
                updated += 1
        except Exception as e:
            print(f"❌ Failed to insert insight '{insight['title']}': {e}")
            conn.rollback()
            raise
    
    conn.commit()
    print(f"✅ Insights: {inserted} inserted, {updated} updated")

def seed_qna_posts(conn):
    """qna_posts 테이블에 시드 데이터 삽입"""
    cursor = conn.cursor()
    inserted = 0
    
    # Demo user ID 가져오기 (없으면 생성)
    cursor.execute("""
        INSERT INTO profiles (id, display_name, age_band)
        VALUES ('demo-user-seed', '데모유저', '60s')
        ON CONFLICT (id) DO NOTHING
        RETURNING id
    """)
    
    for post in SEED_QNA_POSTS:
        try:
            cursor.execute("""
                INSERT INTO qna_posts (author_id, topic, question, body, is_anon, ai_summary)
                VALUES ('demo-user-seed', %(topic)s, %(question)s, %(body)s, %(is_anon)s, %(ai_summary)s)
                ON CONFLICT (question) DO NOTHING
                RETURNING id
            """, {
                **post,
                'body': post.get('body'),
                'ai_summary': post.get('ai_summary')
            })
            
            if cursor.fetchone():
                inserted += 1
        except Exception as e:
            print(f"❌ Failed to insert Q&A '{post['question']}': {e}")
            conn.rollback()
            raise
    
    conn.commit()
    print(f"✅ Q&A Posts: {inserted} inserted")

# ============================================================
# Main
# ============================================================

def main():
    print("🌱 Starting seed script...")
    
    try:
        conn = get_connection()
        print("✅ Database connected")
        
        seed_cards(conn)
        seed_insights(conn)
        seed_qna_posts(conn)
        
        conn.close()
        print("🎉 Seed completed successfully!")
        
    except Exception as e:
        print(f"❌ Seed failed: {e}")
        exit(1)

if __name__ == "__main__":
    main()
```

### 4) 실행

```bash
cd scripts/
python seed_data.py
```

**예상 출력**:
```
🌱 Starting seed script...
✅ Database connected
✅ Cards: 8 inserted, 0 updated
✅ Insights: 15 inserted, 0 updated
✅ Q&A Posts: 5 inserted
🎉 Seed completed successfully!
```

---

## 🟦 TypeScript/Node.js 버전 (선택)

### 1) 환경 설정

```bash
# package.json에 추가
npm install --save-dev @types/node dotenv pg
```

### 2) `scripts/seed_data.ts`

```typescript
// scripts/seed_data.ts
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { SEED_CARDS, SEED_INSIGHTS, SEED_QNA_POSTS } from './seed_data.json';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedCards() {
  let inserted = 0;
  let updated = 0;

  for (const card of SEED_CARDS) {
    const result = await pool.query(
      `
      INSERT INTO cards (type, title, tldr, body, impact, quiz, estimated_read_minutes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (title)
      DO UPDATE SET
        body = EXCLUDED.body,
        quiz = EXCLUDED.quiz,
        updated_at = NOW()
      RETURNING (xmax = 0) AS inserted
      `,
      [card.type, card.title, card.tldr, card.body, card.impact, JSON.stringify(card.quiz), card.estimated_read_minutes]
    );

    if (result.rows[0].inserted) {
      inserted++;
    } else {
      updated++;
    }
  }

  console.log(`✅ Cards: ${inserted} inserted, ${updated} updated`);
}

async function seedInsights() {
  let inserted = 0;
  let updated = 0;

  for (const insight of SEED_INSIGHTS) {
    const result = await pool.query(
      `
      INSERT INTO insights (topic, title, summary, body, read_time_minutes)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (title)
      DO UPDATE SET
        body = EXCLUDED.body,
        summary = EXCLUDED.summary,
        updated_at = NOW()
      RETURNING (xmax = 0) AS inserted
      `,
      [insight.topic, insight.title, insight.summary, insight.body, insight.read_time_minutes]
    );

    if (result.rows[0].inserted) {
      inserted++;
    } else {
      updated++;
    }
  }

  console.log(`✅ Insights: ${inserted} inserted, ${updated} updated`);
}

async function seedQnA() {
  // Demo user 생성
  await pool.query(`
    INSERT INTO profiles (id, display_name, age_band)
    VALUES ('demo-user-seed', '데모유저', '60s')
    ON CONFLICT (id) DO NOTHING
  `);

  let inserted = 0;

  for (const post of SEED_QNA_POSTS) {
    const result = await pool.query(
      `
      INSERT INTO qna_posts (author_id, topic, question, body, is_anon, ai_summary)
      VALUES ('demo-user-seed', $1, $2, $3, $4, $5)
      ON CONFLICT (question) DO NOTHING
      RETURNING id
      `,
      [post.topic, post.question, post.body, post.is_anon, post.ai_summary]
    );

    if (result.rowCount > 0) {
      inserted++;
    }
  }

  console.log(`✅ Q&A Posts: ${inserted} inserted`);
}

async function main() {
  console.log('🌱 Starting seed script...');

  try {
    await seedCards();
    await seedInsights();
    await seedQnA();

    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
```

### 3) `package.json`에 스크립트 추가

```json
{
  "scripts": {
    "seed": "ts-node scripts/seed_data.ts"
  }
}
```

### 4) 실행

```bash
npm run seed
```

---

## 🔧 Idempotent 전략 설명

### 1) `ON CONFLICT DO UPDATE`

```sql
INSERT INTO cards (title, body, ...)
VALUES ('AI란 무엇인가요?', '...', ...)
ON CONFLICT (title)  -- title에 UNIQUE 제약 필요
DO UPDATE SET
  body = EXCLUDED.body,
  updated_at = NOW()
```

**장점**:
- 중복 실행 시 기존 데이터 업데이트
- 에러 없이 안전하게 재실행 가능

**단점**:
- `title`에 UNIQUE 제약 조건 필요

### 2) `ON CONFLICT DO NOTHING`

```sql
INSERT INTO qna_posts (question, body, ...)
VALUES ('문자 링크 눌러도 되나요?', '...', ...)
ON CONFLICT (question) DO NOTHING
```

**장점**:
- 중복 시 무시 (삽입 안 함)
- 로그 간결

**단점**:
- 기존 데이터 업데이트 안 됨

---

## 🧪 테스트 방법

### 1단계: 스크립트 실행
```bash
python scripts/seed_data.py
```

### 2단계: 데이터 확인
```sql
-- psql 또는 Supabase SQL Editor에서
SELECT COUNT(*) FROM cards;       -- 예상: 8
SELECT COUNT(*) FROM insights;    -- 예상: 15
SELECT COUNT(*) FROM qna_posts;   -- 예상: 5

-- 샘플 카드 조회
SELECT title, type FROM cards LIMIT 3;

-- 샘플 인사이트 조회
SELECT title, topic FROM insights WHERE topic = 'ai';

-- Q&A 조회
SELECT question, is_anon FROM qna_posts;
```

### 3단계: 재실행 테스트
```bash
# 스크립트 다시 실행
python scripts/seed_data.py

# 출력 확인:
# ✅ Cards: 0 inserted, 8 updated  <- 중복 없음
```

---

## ⚠️ 주의사항

### 1) Database URL 보안
- `.env` 파일을 `.gitignore`에 추가
- Production DB URL은 절대 커밋하지 말 것

### 2) UTF-8 인코딩
```python
# Python에서 한글 깨짐 방지
conn = psycopg2.connect(DATABASE_URL, client_encoding='utf8')
```

### 3) Transaction Rollback
```python
try:
    cursor.execute(...)
    conn.commit()
except Exception as e:
    conn.rollback()  # 실패 시 전체 롤백
    raise
```

---

## ✅ 체크리스트

### 스크립트 기능
- [ ] `.env`에서 `DATABASE_URL` 읽기
- [ ] `cards`, `insights`, `qna_posts` 삽입
- [ ] Idempotent 전략 구현 (`ON CONFLICT`)
- [ ] 삽입/업데이트 개수 로그 출력
- [ ] 실패 시 명확한 에러 메시지

### 데이터 검증
- [ ] 8개 카드 삽입 확인
- [ ] 15개 인사이트 삽입 확인
- [ ] 5개 Q&A 삽입 확인
- [ ] 한글 인코딩 정상
- [ ] JSON 필드 (quiz) 정상 파싱

### 재실행 테스트
- [ ] 스크립트 2회 실행 후 중복 없음
- [ ] 업데이트 로그 정상 출력

---

## 🔗 다음 단계

- **[03. Demo Profiles](./03-demo-profiles.md)** - 데모 유저 생성
- **[04. Wiring Seed Data](./04-wiring-seed-data.md)** - BFF 연동 확인

---

**문서 작성**: AI Seed Guide  
**최종 업데이트**: 2025년 11월 13일
