# Supabase에 강좌 시스템 설정하기

## 📋 목차
1. 스키마 생성
2. 강좌 데이터 삽입
3. 확인 및 테스트

---

## 1️⃣ 스키마 생성

### Supabase Dashboard 접속
1. https://supabase.com/dashboard 로그인
2. **Trenduity** 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New Query** 버튼 클릭

### 스키마 SQL 실행
`scripts/courses_schema.sql` 파일 내용을 복사해서 붙여넣고 **RUN** 버튼 클릭

✅ 성공 메시지: "Success. No rows returned"

---

## 2️⃣ 강좌 데이터 삽입

### INSERT 문 생성 스크립트 실행
PowerShell에서:
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\scripts
python generate_supabase_insert.py > courses_insert.sql
```

### Supabase에서 INSERT 실행
1. `courses_insert.sql` 파일 열기
2. 전체 내용 복사
3. Supabase SQL Editor에 붙여넣기
4. **RUN** 버튼 클릭

✅ 성공 메시지: "5 rows inserted" (courses 테이블) + "21 rows inserted" (lectures 테이블)

---

## 3️⃣ 확인

### SQL Editor에서 확인:
```sql
-- 강좌 수 확인
SELECT COUNT(*) FROM courses;
-- 결과: 5

-- 강의 수 확인
SELECT COUNT(*) FROM lectures;
-- 결과: 21

-- 강좌 목록 확인
SELECT id, title, category, total_lectures FROM courses;
```

---

## 🔧 대안: Python 스크립트로 직접 삽입

### .env 파일 수정
`scripts/.env` 파일에 Supabase URL 추가:
```bash
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 스크립트 실행
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\scripts
python seed_courses.py
```

---

## ✅ 완료 후 테스트

### 모바일 앱에서 확인:
1. Expo Dev Client 재시작
2. 홈 화면에서 "오늘의 추천 강좌" 확인
3. 강좌 목록 화면 열기

### API 직접 테스트:
```powershell
curl https://trenduity-bff.onrender.com/v1/courses
```

정상 응답:
```json
{
  "ok": true,
  "data": [
    { "id": "course-001", "title": "AI 도우미로 재미있는 소설 만들기", ... }
  ]
}
```
