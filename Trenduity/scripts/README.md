# Trenduity Seed Scripts

시드 데이터를 Supabase/Postgres 데이터베이스에 삽입하는 스크립트입니다.

## 📋 구성

- `seed_data.json`: 시드 데이터 (8개 카드, 15개 인사이트, 5개 Q&A)
- `seed_data.py`: Python 실행 스크립트
- `requirements.txt`: Python 의존성

## 🚀 사용 방법

### 1. 환경 설정

```bash
# 1) Python 가상환경 생성 (선택사항)
python -m venv venv
.\venv\Scripts\activate  # Windows PowerShell
# source venv/bin/activate  # Mac/Linux

# 2) 의존성 설치
cd scripts
pip install -r requirements.txt
```

### 2. 환경변수 설정

루트 디렉토리의 `.env` 파일에 `DATABASE_URL`을 추가하세요:

```bash
# .env
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

**Supabase Cloud 사용 시**:
```bash
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### 3. 스크립트 실행

```bash
python seed_data.py
```

**예상 출력**:
```
============================================================
🌱 Trenduity Seed Script
============================================================
Started at: 2025-11-14 10:30:00
✅ Loaded seed data from F:\Trenduity\scripts\seed_data.json
✅ Database connected

📝 Seeding 8 cards...
  ✅ Inserted: AI란 무엇인가요?
  ✅ Inserted: 스미싱 문자 구별하는 법
  ... (8개)

✅ Cards: 8 inserted, 0 updated

💡 Seeding 15 insights...
  ✅ Inserted: 생성형 AI의 기초 이해하기
  ... (15개)

✅ Insights: 15 inserted, 0 updated

💬 Seeding 5 Q&A posts...
  ✅ Inserted: 문자에 있는 링크 눌러도 되나요? (익명)
  ... (5개)

✅ Q&A Posts: 5 inserted, 0 skipped

============================================================
🎉 Seed completed successfully!
============================================================
Cards:     8 inserted, 0 updated
Insights:  15 inserted, 0 updated
Q&A Posts: 5 inserted, 0 skipped
Finished at: 2025-11-14 10:30:15
============================================================
```

### 4. 데이터 확인

**BFF API 테스트**:
```bash
# 카드 확인
curl http://localhost:8000/v1/cards/today

# 인사이트 확인
curl http://localhost:8000/v1/insights?topic=ai

# Q&A 확인
curl http://localhost:8000/v1/qna
```

**Supabase SQL Editor**:
```sql
SELECT COUNT(*) FROM cards;       -- 예상: 8
SELECT COUNT(*) FROM insights;    -- 예상: 15
SELECT COUNT(*) FROM qna_posts;   -- 예상: 5

-- 샘플 데이터 조회
SELECT title, type FROM cards LIMIT 3;
SELECT title, topic FROM insights WHERE topic = 'ai';
SELECT question, is_anon FROM qna_posts;
```

## ✨ 주요 기능

### Idempotent (멱등성)
- 중복 실행 시 데이터 중복 없음
- `ON CONFLICT` 전략으로 기존 데이터 업데이트
- 안전한 재실행 가능

### 진행 상황 로그
- 각 테이블별 삽입/업데이트/스킵 개수 표시
- 개별 항목 처리 상태 출력
- 명확한 에러 메시지

### UTF-8 인코딩
- 한글 텍스트 정상 처리
- JSON 필드 (quiz) 올바른 직렬화

## 🔧 Troubleshooting

### 문제: "DATABASE_URL not found"
```bash
# 해결: .env 파일에 DATABASE_URL 추가
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### 문제: "Database connection failed"
```bash
# 해결 1: Supabase 로컬 실행 확인
supabase status

# 해결 2: DATABASE_URL 형식 확인
# 올바른 형식: postgresql://username:password@host:port/database
```

### 문제: "relation does not exist"
```bash
# 해결: 테이블 생성 필요 (Supabase 마이그레이션 실행)
# cards, insights, qna_posts, profiles 테이블이 존재해야 함
```

### 문제: 한글 깨짐
```bash
# 스크립트에서 자동 처리됨 (client_encoding='utf8')
# JSON 직렬화 시 ensure_ascii=False 설정
```

### 문제: 재실행 시 중복 데이터
```bash
# 정상 동작: ON CONFLICT 전략으로 업데이트됨
# 출력 예: "Cards: 0 inserted, 8 updated"
```

## 📊 시드 데이터 구조

### Daily Cards (8개)
- AI 활용법 × 2
- 최신 트렌드 × 2
- 디지털 안전 × 2
- 생활 팁 × 2

각 카드:
- 본문: 300-500자
- 퀴즈: 1-3문항 (4지선다)
- 읽기 시간: 3분

### Insights (15개)
- AI × 3
- BigTech × 3
- Economy × 3
- Safety × 3
- Mobile101 × 3

각 인사이트:
- 본문: 500-800자
- 읽기 시간: 5-7분

### Q&A Posts (5개)
- 다양한 토픽 (safety, ai, mobile101)
- 익명/닉네임 혼합
- AI 요약 포함 (일부)

## 📝 참고 문서

- [SEED/01-seed-data-design.md](../../docs/SEED/01-seed-data-design.md) - 시드 데이터 설계
- [SEED/02-db-seed-scripts.md](../../docs/SEED/02-db-seed-scripts.md) - 스크립트 문서
- [SEED/index.md](../../docs/SEED/index.md) - SEED 단계 개요

## 🔗 다음 단계

1. **SEED-03**: 데모 프로필 생성 (50/60/70대 유저)
2. **SEED-04**: BFF 연동 확인 및 엔드포인트 테스트
3. **TEST**: 단위 테스트 및 E2E 테스트

---

**작성일**: 2025년 11월 14일  
**작성자**: AI Implementation Guide
