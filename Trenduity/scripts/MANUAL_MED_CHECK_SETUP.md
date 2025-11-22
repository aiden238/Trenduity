# Med Check 테이블 수동 생성 가이드

## 📋 Step 1: Supabase Dashboard 접속

1. **브라우저에서 열기**: https://app.supabase.com/project/onnthandrqutdmvwnilf/editor
2. **왼쪽 메뉴에서 "SQL Editor" 클릭**

## 📝 Step 2: SQL 실행

### 복사할 SQL (아래 전체 선택하여 복사)

```sql
-- 기존 테이블 삭제 (있다면)
DROP TABLE IF EXISTS med_checks CASCADE;

-- 완전한 테이블 생성
CREATE TABLE med_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  medication_name TEXT,
  notes TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, time_slot)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_med_checks_user_date ON med_checks(user_id, date);
CREATE INDEX idx_med_checks_date ON med_checks(date);

-- RLS 정책 설정 (보안)
ALTER TABLE med_checks ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 복약 체크만 조회 가능
CREATE POLICY "Users can view own med checks"
  ON med_checks FOR SELECT
  USING (auth.uid()::text = user_id);

-- 삽입/업데이트/삭제는 BFF만 가능 (service_role)
CREATE POLICY "Service role only for modifications"
  ON med_checks FOR ALL
  USING (false);
```

### 실행 방법

1. **"New query" 버튼 클릭** (왼쪽 상단)
2. **위 SQL 전체 복사 → 붙여넣기**
3. **"RUN" 버튼 클릭** (또는 Ctrl+Enter)
4. **성공 메시지 확인**: "Success. No rows returned"

## ✅ Step 3: 완료 확인

### 테이블 구조 확인 (선택사항)

SQL Editor에서 다음 쿼리 실행:

```sql
-- 테이블 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'med_checks'
ORDER BY ordinal_position;
```

**기대 결과**: 8개 컬럼 표시
- id (uuid)
- user_id (text)
- date (date)
- time_slot (text)
- **medication_name (text)** ← 중요!
- **notes (text)** ← 중요!
- checked_at (timestamp with time zone)

## 🚀 Step 4: 완료 후 작업

이 파일이 있는 디렉터리에서:

```powershell
# 자동 진행 스크립트 실행
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
python scripts\verify_med_check_setup.py
```

또는 **Copilot에게 알려주세요**:
```
"supabase sql 실행 완료했어"
```

그러면 자동으로:
1. ✅ 테이블 구조 검증
2. ✅ Med Check E2E 테스트 실행 (5개)
3. ✅ 전체 E2E 테스트 실행 (34개)
4. ✅ 진행 상황 문서 업데이트
5. ✅ 최종 결과 리포트

## ⚠️ 문제 발생 시

### "relation already exists" 에러
→ DROP 문이 실패한 경우, 다시 전체 SQL 실행

### "could not create unique index" 에러  
→ 중복 데이터 존재, 먼저 삭제:
```sql
DELETE FROM med_checks;
```
→ 그 후 다시 CREATE TABLE 실행

### RLS 정책 에러
→ 기존 정책 삭제 후 재실행:
```sql
DROP POLICY IF EXISTS "Users can view own med checks" ON med_checks;
DROP POLICY IF EXISTS "Service role only for modifications" ON med_checks;
```

## 📞 도움이 필요하면

- **스크린샷** 찍어서 보여주기
- **에러 메시지** 전체 복사해서 전달
- "supabase sql 에러 났어: [에러 내용]" 메시지

---

**예상 소요 시간**: 2-3분
