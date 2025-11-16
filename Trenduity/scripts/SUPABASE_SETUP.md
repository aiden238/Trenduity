# Supabase 설정 및 시드 데이터 삽입 가이드

이 가이드는 Supabase 프로젝트를 설정하고 시드 데이터를 삽입하는 과정을 설명합니다.

---

## 📋 1단계: Supabase 프로젝트 생성

### 1.1 Supabase 계정 생성
1. https://supabase.com 방문
2. **Start your project** 클릭
3. GitHub 계정으로 로그인

### 1.2 새 프로젝트 생성
1. **New Project** 클릭
2. 프로젝트 정보 입력:
   - **Name**: `trenduity-dev` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (메모 필수!)
   - **Region**: `Northeast Asia (Seoul)` 선택 (가장 가까운 지역)
   - **Pricing Plan**: `Free` 선택

3. **Create new project** 클릭 (1-2분 소요)

---

## 📋 2단계: 데이터베이스 스키마 생성

### 2.1 SQL Editor 열기
1. Supabase 대시보드에서 좌측 메뉴 **SQL Editor** 클릭
2. **New query** 클릭

### 2.2 스키마 실행
1. `scripts/supabase_schema.sql` 파일 내용 전체 복사
2. SQL Editor에 붙여넣기
3. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
4. 성공 메시지 확인: "Success. No rows returned"

### 2.3 테이블 확인
1. 좌측 메뉴 **Table Editor** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - ✅ profiles
   - ✅ gamification
   - ✅ family_links
   - ✅ cards
   - ✅ insights
   - ✅ qna_posts

---

## 📋 3단계: 연결 정보 가져오기

### 3.1 Database URL 복사
1. 좌측 메뉴 **Project Settings** (톱니바퀴 아이콘) 클릭
2. **Database** 탭 선택
3. **Connection string** 섹션에서 **URI** 복사

   예시:
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
   ```

4. `[YOUR-PASSWORD]`를 실제 데이터베이스 비밀번호로 변경

### 3.2 .env 파일 생성
1. `f:\Trenduity\Trenduity` 디렉터리에 `.env` 파일 생성
2. 다음 내용 입력:

```bash
# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (for seed scripts)
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres

# BFF API
BFF_API_URL=http://localhost:8000
NEXT_PUBLIC_BFF_API_URL=http://localhost:8000

# Environment
ENV=development
DEBUG=true
```

3. Supabase 대시보드에서 값 가져오기:
   - **SUPABASE_URL**: Project Settings > API > Project URL
   - **SUPABASE_ANON_KEY**: Project Settings > API > Project API keys > `anon` `public`
   - **SUPABASE_SERVICE_ROLE_KEY**: Project Settings > API > Project API keys > `service_role` (Show 클릭)

---

## 📋 4단계: 시드 데이터 삽입

### 4.1 Python 의존성 설치
```powershell
cd f:\Trenduity\Trenduity
pip install psycopg2-binary python-dotenv
```

### 4.2 시드 스크립트 실행
```powershell
python scripts\seed_data.py
```

### 4.3 예상 출력
```
============================================================
🌱 Trenduity Seed Script
============================================================
Started at: 2025-11-14 10:30:00

👤 Seeding 5 profiles...
  ✅ Inserted: 김민수 (50대)
  ✅ Inserted: 이영희 (60대)
  ✅ Inserted: 박철수 (70대)
  ✅ Inserted: 김지우 (보호자)
  ✅ Inserted: 이민준 (보호자)

✅ Profiles: 5 inserted, 0 updated

🎮 Seeding 3 gamification records...
  ✅ Inserted: demo-user-50s (200 pts)
  ✅ Inserted: demo-user-60s (120 pts)
  ✅ Inserted: demo-user-70s (60 pts)

✅ Gamification: 3 inserted, 0 updated

👨‍👩‍👧 Seeding 2 family links...
  ✅ Linked: demo-guardian-50s → demo-user-50s
  ✅ Linked: demo-guardian-60s → demo-user-70s

✅ Family Links: 2 inserted, 0 skipped

🃏 Seeding 8 cards...
  ✅ Inserted: AI란 무엇인가요?
  ✅ Inserted: 챗GPT 활용법
  ...

✅ Cards: 8 inserted, 0 updated

💡 Seeding 15 insights...
  ✅ Inserted: 생성형 AI의 기초
  ...

✅ Insights: 15 inserted, 0 updated

💬 Seeding 5 Q&A posts...
  ✅ Inserted: 문자에 있는 링크 눌러도 되나요? (익명)
  ...

✅ Q&A Posts: 5 inserted, 0 skipped

============================================================
🎉 Seed completed successfully!
============================================================
Profiles:      5 inserted, 0 updated
Gamification:  3 inserted, 0 updated
Family Links:  2 inserted, 0 skipped
Cards:         8 inserted, 0 updated
Insights:      15 inserted, 0 updated
Q&A Posts:     5 inserted, 0 skipped
Finished at:   2025-11-14 10:30:15
============================================================
```

---

## 📋 5단계: 데이터 확인

### 5.1 Supabase Table Editor에서 확인
1. **Table Editor** 메뉴 클릭
2. 각 테이블 확인:
   - `profiles`: 5개 행
   - `gamification`: 3개 행
   - `family_links`: 2개 행
   - `cards`: 8개 행
   - `insights`: 15개 행
   - `qna_posts`: 5개 행

### 5.2 SQL로 확인
```sql
-- 각 테이블 행 개수
SELECT 'profiles' AS table_name, COUNT(*) FROM profiles
UNION ALL
SELECT 'gamification', COUNT(*) FROM gamification
UNION ALL
SELECT 'family_links', COUNT(*) FROM family_links
UNION ALL
SELECT 'cards', COUNT(*) FROM cards
UNION ALL
SELECT 'insights', COUNT(*) FROM insights
UNION ALL
SELECT 'qna_posts', COUNT(*) FROM qna_posts;
```

예상 결과:
```
profiles      | 5
gamification  | 3
family_links  | 2
cards         | 8
insights      | 15
qna_posts     | 5
```

---

## 📋 6단계: BFF API 연동 (다음 단계)

시드 데이터 삽입이 완료되면 BFF API를 Supabase에 연결하여 테스트할 수 있습니다:

```powershell
cd services\bff-fastapi
pip install fastapi uvicorn supabase-py python-dotenv
uvicorn app.main:app --reload
```

엔드포인트 테스트:
- `http://localhost:8000/health`
- `http://localhost:8000/v1/cards/today` (인증 필요)
- `http://localhost:8000/v1/insights`

---

## 🔧 문제 해결

### 오류: "connection to server ... failed"
- DATABASE_URL이 올바른지 확인
- 비밀번호에 특수문자가 있으면 URL 인코딩 필요
- Supabase 프로젝트가 활성 상태인지 확인

### 오류: "relation does not exist"
- `supabase_schema.sql`을 SQL Editor에서 실행했는지 확인
- Table Editor에서 테이블이 생성되었는지 확인

### 오류: "duplicate key value violates unique constraint"
- 이미 시드 데이터가 삽입된 상태
- 재실행해도 안전 (ON CONFLICT 처리됨)

### 한글 깨짐
- DATABASE_URL 끝에 `?client_encoding=utf8` 추가
- 예: `...postgres?client_encoding=utf8`

---

## ✅ 완료 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] `supabase_schema.sql` 실행 (6개 테이블 생성)
- [ ] `.env` 파일에 DATABASE_URL 설정
- [ ] `python scripts\seed_data.py` 실행 성공
- [ ] Table Editor에서 데이터 확인 (5+3+2+8+15+5 = 38개 행)
- [ ] BFF API 연동 준비 완료

---

**다음 단계**: SEED-04 (Wiring Seed Data) - BFF API가 시드 데이터를 정상적으로 반환하는지 검증
