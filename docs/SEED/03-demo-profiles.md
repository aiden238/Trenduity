# 03. Demo Profiles (데모 유저 생성)

> **목적**: E2E 테스트 및 데모용 **가상 사용자 프로필** 생성  
> **대상**: 50대/60대/70대 각 1명씩 (총 3명)  
> **용도**: 가족 연동 테스트, 접근성 모드 확인, 게이미피케이션 히스토리

---

## 📋 목표

실제 사용자처럼 동작하는 **데모 프로필**을 생성하여:
- 앱 실행 시 바로 테스트 가능
- 가족 연동 기능 데모
- 접근성 모드별 UI 확인
- 포인트/스트릭 히스토리 시뮬레이션

---

## 👤 Demo Profiles 정의

### 데이터 구조

```typescript
interface DemoProfile {
  id: string; // UUID 또는 demo-xxx 형식
  email: string; // demo+xxx@example.com
  display_name: string;
  age_band: '50s' | '60s' | '70s';
  a11y_mode: 'normal' | 'easy' | 'ultra';
  points: number;
  current_streak: number;
  badges: string[]; // badge_id 배열
}
```

---

## 🧑 Profile 1: 50대 (디지털 익숙)

```json
{
  "id": "demo-user-50s",
  "email": "demo+50s@example.com",
  "display_name": "김민수 (50대)",
  "age_band": "50s",
  "a11y_mode": "normal",
  "points": 200,
  "current_streak": 7,
  "badges": ["first_card", "week_streak"],
  "created_at": "2025-11-06T09:00:00Z"
}
```

**특징**:
- 접근성: **normal** 모드 (기본 크기)
- 활동: 7일 연속 학습 중
- 관심사: AI 활용, 최신 트렌드
- 가족: 자녀 1명 연동 (demo-guardian-50s)

**포인트 히스토리**:
```json
[
  {
    "date": "2025-11-06",
    "action": "card_complete",
    "points": 30,
    "card_title": "AI란 무엇인가요?"
  },
  {
    "date": "2025-11-07",
    "action": "quiz_perfect",
    "points": 20,
    "streak_bonus": 5
  },
  {
    "date": "2025-11-08",
    "action": "card_complete",
    "points": 30
  },
  {
    "date": "2025-11-09",
    "action": "insight_read",
    "points": 10
  },
  {
    "date": "2025-11-10",
    "action": "card_complete",
    "points": 30,
    "streak_bonus": 5
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
    "streak_bonus": 5
  }
]
```

---

## 👵 Profile 2: 60대 (접근성 필요)

```json
{
  "id": "demo-user-60s",
  "email": "demo+60s@example.com",
  "display_name": "이영희 (60대)",
  "age_band": "60s",
  "a11y_mode": "easy",
  "points": 120,
  "current_streak": 3,
  "badges": ["first_card"],
  "created_at": "2025-11-09T10:00:00Z"
}
```

**특징**:
- 접근성: **easy** 모드 (글자 크기 20dp)
- 활동: 3일 연속 학습 중
- 관심사: 디지털 안전, 생활 팁
- 가족: 자녀 2명 연동

**포인트 히스토리**:
```json
[
  {
    "date": "2025-11-10",
    "action": "card_complete",
    "points": 30,
    "card_title": "스미싱 문자 구별하는 법"
  },
  {
    "date": "2025-11-11",
    "action": "card_complete",
    "points": 30,
    "streak_bonus": 5
  },
  {
    "date": "2025-11-12",
    "action": "quiz_partial",
    "points": 10,
    "card_title": "사진 정리하는 방법"
  },
  {
    "date": "2025-11-12",
    "action": "qna_post",
    "points": 15
  }
]
```

---

## 👴 Profile 3: 70대 (초대형 모드)

```json
{
  "id": "demo-user-70s",
  "email": "demo+70s@example.com",
  "display_name": "박철수 (70대)",
  "age_band": "70s",
  "a11y_mode": "ultra",
  "points": 60,
  "current_streak": 1,
  "badges": [],
  "created_at": "2025-11-12T11:00:00Z"
}
```

**특징**:
- 접근성: **ultra** 모드 (글자 크기 24dp, 버튼 64dp)
- 활동: 방금 시작함 (1일)
- 관심사: 모바일 기초
- 가족: 손주(guardian) 1명 연동

**포인트 히스토리**:
```json
[
  {
    "date": "2025-11-12",
    "action": "card_complete",
    "points": 30,
    "card_title": "음성 비서로 할 수 있는 일들"
  },
  {
    "date": "2025-11-12",
    "action": "quiz_perfect",
    "points": 20
  }
]
```

---

## 👨‍👩‍👧 Family Links (가족 연동)

### Guardian Profile 1

```json
{
  "id": "demo-guardian-50s",
  "email": "demo+guardian1@example.com",
  "display_name": "김지우 (자녀)",
  "age_band": "30s",
  "linked_seniors": ["demo-user-50s"]
}
```

**권한**:
- `demo-user-50s`의 활동 통계 조회
- 복약 체크 알림 설정

### Guardian Profile 2

```json
{
  "id": "demo-guardian-60s",
  "email": "demo+guardian2@example.com",
  "display_name": "이민준 (손주)",
  "age_band": "20s",
  "linked_seniors": ["demo-user-70s"]
}
```

**권한**:
- `demo-user-70s`의 학습 진도 확인
- 가족 대시보드 접근

---

## 💊 Med Check Records (복약 기록)

### 60대 유저 복약 기록

```json
{
  "user_id": "demo-user-60s",
  "medication_name": "혈압약",
  "schedule": "매일 아침 8시",
  "checks": [
    {
      "date": "2025-11-10",
      "time": "08:15:00",
      "checked": true
    },
    {
      "date": "2025-11-11",
      "time": "08:10:00",
      "checked": true
    },
    {
      "date": "2025-11-12",
      "time": "08:20:00",
      "checked": true
    }
  ]
}
```

### 70대 유저 복약 기록

```json
{
  "user_id": "demo-user-70s",
  "medication_name": "당뇨약",
  "schedule": "매일 아침/저녁",
  "checks": [
    {
      "date": "2025-11-12",
      "time": "08:00:00",
      "checked": true
    },
    {
      "date": "2025-11-12",
      "time": "19:00:00",
      "checked": false
    }
  ]
}
```

---

## 🎮 Gamification Data

### Badges 정의

```json
{
  "badges": [
    {
      "id": "first_card",
      "name": "첫 카드 달성",
      "description": "첫 번째 카드를 완료했어요!",
      "icon": "🎉"
    },
    {
      "id": "week_streak",
      "name": "7일 연속 학습",
      "description": "일주일 동안 매일 학습했어요!",
      "icon": "🔥"
    },
    {
      "id": "quiz_master",
      "name": "퀴즈 마스터",
      "description": "10개 퀴즈를 완벽하게 풀었어요!",
      "icon": "🏆"
    }
  ]
}
```

### Points System

| 활동 | 포인트 | 스트릭 보너스 |
|------|--------|--------------|
| 카드 완료 | 30pt | +5pt (3일 이상) |
| 퀴즈 완벽 | 20pt | - |
| 퀴즈 부분 정답 | 10pt | - |
| 인사이트 읽기 | 10pt | - |
| Q&A 게시 | 15pt | - |
| Q&A 답변 | 10pt | - |

---

## 🔧 Seed Script 추가

### `scripts/seed_profiles.py`

```python
#!/usr/bin/env python3
"""
Seed demo profiles for testing
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DEMO_PROFILES = [
    {
        "id": "demo-user-50s",
        "email": "demo+50s@example.com",
        "display_name": "김민수 (50대)",
        "age_band": "50s",
        "a11y_mode": "normal",
        "points": 200,
        "current_streak": 7
    },
    {
        "id": "demo-user-60s",
        "email": "demo+60s@example.com",
        "display_name": "이영희 (60대)",
        "age_band": "60s",
        "a11y_mode": "easy",
        "points": 120,
        "current_streak": 3
    },
    {
        "id": "demo-user-70s",
        "email": "demo+70s@example.com",
        "display_name": "박철수 (70대)",
        "age_band": "70s",
        "a11y_mode": "ultra",
        "points": 60,
        "current_streak": 1
    }
]

DEMO_GUARDIANS = [
    {
        "id": "demo-guardian-50s",
        "email": "demo+guardian1@example.com",
        "display_name": "김지우 (자녀)",
        "age_band": "30s"
    },
    {
        "id": "demo-guardian-60s",
        "email": "demo+guardian2@example.com",
        "display_name": "이민준 (손주)",
        "age_band": "20s"
    }
]

FAMILY_LINKS = [
    {
        "senior_id": "demo-user-50s",
        "guardian_id": "demo-guardian-50s",
        "relation": "child"
    },
    {
        "senior_id": "demo-user-70s",
        "guardian_id": "demo-guardian-60s",
        "relation": "grandchild"
    }
]

def seed_profiles(conn):
    cursor = conn.cursor()
    
    for profile in DEMO_PROFILES:
        cursor.execute("""
            INSERT INTO profiles (id, email, display_name, age_band, a11y_mode, points, current_streak)
            VALUES (%(id)s, %(email)s, %(display_name)s, %(age_band)s, %(a11y_mode)s, %(points)s, %(current_streak)s)
            ON CONFLICT (id) DO UPDATE SET
                points = EXCLUDED.points,
                current_streak = EXCLUDED.current_streak
        """, profile)
    
    conn.commit()
    print(f"✅ Profiles: {len(DEMO_PROFILES)} inserted/updated")

def seed_guardians(conn):
    cursor = conn.cursor()
    
    for guardian in DEMO_GUARDIANS:
        cursor.execute("""
            INSERT INTO profiles (id, email, display_name, age_band)
            VALUES (%(id)s, %(email)s, %(display_name)s, %(age_band)s)
            ON CONFLICT (id) DO NOTHING
        """, guardian)
    
    conn.commit()
    print(f"✅ Guardians: {len(DEMO_GUARDIANS)} inserted")

def seed_family_links(conn):
    cursor = conn.cursor()
    
    for link in FAMILY_LINKS:
        cursor.execute("""
            INSERT INTO family_links (senior_id, guardian_id, relation, status)
            VALUES (%(senior_id)s, %(guardian_id)s, %(relation)s, 'accepted')
            ON CONFLICT (senior_id, guardian_id) DO NOTHING
        """, link)
    
    conn.commit()
    print(f"✅ Family Links: {len(FAMILY_LINKS)} inserted")

def main():
    DATABASE_URL = os.getenv('DATABASE_URL')
    conn = psycopg2.connect(DATABASE_URL)
    
    try:
        seed_profiles(conn)
        seed_guardians(conn)
        seed_family_links(conn)
        print("🎉 Demo profiles seeded successfully!")
    except Exception as e:
        print(f"❌ Failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    main()
```

---

## 🧪 테스트 방법

### 1단계: 스크립트 실행
```bash
python scripts/seed_profiles.py
```

### 2단계: 프로필 확인
```sql
-- 데모 유저 조회
SELECT id, display_name, age_band, a11y_mode, points, current_streak
FROM profiles
WHERE id LIKE 'demo-user-%';

-- 가족 연동 확인
SELECT 
  fl.senior_id,
  p1.display_name AS senior_name,
  fl.guardian_id,
  p2.display_name AS guardian_name,
  fl.relation
FROM family_links fl
JOIN profiles p1 ON fl.senior_id = p1.id
JOIN profiles p2 ON fl.guardian_id = p2.id;
```

### 3단계: 앱에서 테스트
```bash
# 모바일 앱 실행
cd apps/mobile-rn
npm start

# 로그인 화면에서 demo+50s@example.com 입력
# (실제 비밀번호 인증은 Supabase Auth 설정 필요)
```

---

## ✅ 체크리스트

### 프로필 생성
- [ ] 50대 유저 생성 (normal 모드)
- [ ] 60대 유저 생성 (easy 모드)
- [ ] 70대 유저 생성 (ultra 모드)
- [ ] Guardian 2명 생성
- [ ] Family Links 2개 생성

### 데이터 검증
- [ ] 포인트/스트릭 값 정상
- [ ] A11y 모드 설정 확인
- [ ] 가족 연동 관계 확인
- [ ] 이메일 형식 `demo+xxx@example.com`

### 기능 테스트
- [ ] 각 유저로 로그인 가능
- [ ] A11y 모드별 UI 차이 확인
- [ ] Guardian 대시보드 접근 확인
- [ ] 복약 체크 기록 표시

---

## 🔗 다음 단계

- **[04. Wiring Seed Data](./04-wiring-seed-data.md)** - BFF 연동 확인

---

**문서 작성**: AI Seed Guide  
**최종 업데이트**: 2025년 11월 13일
