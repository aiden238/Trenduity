# Supabase 데이터베이스 설정 가이드

**프로젝트**: Trenduity MVP  
**날짜**: 2025년 11월 20일  
**소요 시간**: 약 10분  
**난이도**: ⭐⭐☆☆☆ (초급)

---

## 🎯 목표

P0 단계 완료를 위한 Supabase 데이터베이스 설정을 완료합니다:
- `usage_counters` 테이블 생성
- Realtime 기능 활성화 (5개 테이블)
- `gamification` 테이블 구조 업데이트
- RLS (Row Level Security) 정책 검증
- 성능 최적화 인덱스 추가

---

## 📋 사전 준비사항

### 1. Supabase 프로젝트 정보 확인

```powershell
# .env 파일에서 확인
Get-Content c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi\.env | Select-String "SUPABASE"
```

**필요 정보**:
- ✅ SUPABASE_URL: `https://onnthandrqutdmvwnilf.supabase.co`
- ✅ SUPABASE_SERVICE_ROLE_KEY: (암호화된 키)

### 2. Supabase Dashboard 접속

1. 브라우저에서 https://supabase.com/dashboard 접속
2. GitHub 계정으로 로그인
3. `Trenduity` 프로젝트 선택

---

## 🚀 실행 단계 (Step-by-Step)

### Step 1: SQL Editor 열기

1. Supabase Dashboard 좌측 메뉴에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭 (또는 + 아이콘)
3. 쿼리 이름 입력: `P0_Setup_Complete`

### Step 2: SQL 파일 내용 복사

파일 위치: `c:\AIDEN_PROJECT\Trenduity\Trenduity\scripts\migrations\P0_supabase_setup.sql`

```powershell
# PowerShell에서 파일 열기
code c:\AIDEN_PROJECT\Trenduity\Trenduity\scripts\migrations\P0_supabase_setup.sql
```

**또는** 전체 내용을 아래에서 복사:

<details>
<summary>📄 P0_supabase_setup.sql 전체 내용 보기 (클릭하여 펼치기)</summary>

```sql
-- =============================================
-- P0 Supabase 설정 스크립트
-- =============================================
-- 
-- 이 스크립트는 Trenduity MVP의 P0 (필수 기능) 완료를 위한
-- Supabase 데이터베이스 설정을 수행합니다.
--
-- 포함 내용:
-- 1. usage_counters 테이블 생성
-- 2. Realtime 기능 활성화 (5개 테이블)
-- 3. gamification 테이블 구조 업데이트
-- 4. RLS 정책 생성/검증
-- 5. 성능 최적화 인덱스
--
-- 실행 방법:
-- 1. Supabase Dashboard > SQL Editor 접속
-- 2. 이 파일 전체 내용 복사
-- 3. SQL Editor에 붙여넣기
-- 4. "Run" 버튼 클릭
--
-- 소요 시간: 약 5-10초
-- =============================================

-- 1. usage_counters 테이블 생성
-- =============================================
-- 사용자별 월간 활동 통계 저장

CREATE TABLE IF NOT EXISTS usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- 'YYYY-MM' 형식
    cards_completed INT DEFAULT 0,
    insights_viewed INT DEFAULT 0,
    med_checks_done INT DEFAULT 0,
    total_points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약 조건: user_id + month 조합은 유일
    UNIQUE(user_id, month)
);

-- usage_counters 인덱스
CREATE INDEX IF NOT EXISTS idx_usage_counters_user_month 
    ON usage_counters(user_id, month);

-- usage_counters RLS 활성화
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- usage_counters RLS 정책: 사용자는 자신의 데이터만 조회
CREATE POLICY "Users can view own usage counters"
    ON usage_counters FOR SELECT
    USING (auth.uid() = user_id);

-- usage_counters RLS 정책: BFF는 모든 데이터 업데이트 가능
CREATE POLICY "BFF can update all usage counters"
    ON usage_counters FOR ALL
    USING (true); -- service_role 키 사용 시 적용

COMMENT ON TABLE usage_counters IS '사용자별 월간 활동 통계 (P0-4)';

-- 2. Realtime 기능 활성화
-- =============================================
-- 다음 테이블들에 대해 실시간 구독 가능하도록 설정

-- 2.1. qna_answers 테이블 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE qna_answers;
COMMENT ON TABLE qna_answers IS 'Q&A 답변 - Realtime 활성화됨 (P0-4)';

-- 2.2. completed_cards 테이블 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE completed_cards;
COMMENT ON TABLE completed_cards IS '완료된 카드 - Realtime 활성화됨 (P0-4)';

-- 2.3. med_checks 테이블 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE med_checks;
COMMENT ON TABLE med_checks IS '복약 체크 - Realtime 활성화됨 (P0-4)';

-- 2.4. family_alerts 테이블 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE family_alerts;
COMMENT ON TABLE family_alerts IS '가족 알림 - Realtime 활성화됨 (P0-4)';

-- 2.5. usage_counters 테이블 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE usage_counters;

-- 3. gamification 테이블 구조 업데이트
-- =============================================

-- 3.1. last_activity_date 컬럼 추가 (없으면)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gamification' AND column_name = 'last_activity_date'
    ) THEN
        ALTER TABLE gamification ADD COLUMN last_activity_date DATE;
        COMMENT ON COLUMN gamification.last_activity_date IS '마지막 활동 날짜 (스트릭 계산용)';
    END IF;
END $$;

-- 3.2. longest_streak 컬럼 추가 (없으면)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gamification' AND column_name = 'longest_streak'
    ) THEN
        ALTER TABLE gamification ADD COLUMN longest_streak INT DEFAULT 0;
        COMMENT ON COLUMN gamification.longest_streak IS '최장 연속 학습 일수';
    END IF;
END $$;

-- 3.3. badges 컬럼 타입 확인 및 수정
DO $$
BEGIN
    -- badges 컬럼이 TEXT[] 타입인지 확인
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gamification' 
        AND column_name = 'badges'
        AND data_type != 'ARRAY'
    ) THEN
        -- TEXT 타입이면 TEXT[]로 변환
        ALTER TABLE gamification ALTER COLUMN badges TYPE TEXT[] USING string_to_array(badges, ',');
    END IF;
END $$;

-- 3.4. last_activity_date 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_gamification_last_activity 
    ON gamification(user_id, last_activity_date);

-- 4. RLS 정책 생성/검증
-- =============================================
-- 모든 테이블에 대한 RLS 정책 확인 및 생성

-- 4.1. profiles 테이블
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "BFF can update all profiles"
    ON profiles FOR ALL
    USING (true);

-- 4.2. cards 테이블
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view cards"
    ON cards FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "BFF can manage all cards"
    ON cards FOR ALL
    USING (true);

-- 4.3. completed_cards 테이블
ALTER TABLE completed_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own completed cards"
    ON completed_cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "BFF can manage all completed cards"
    ON completed_cards FOR ALL
    USING (true);

-- 4.4. insights 테이블
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view insights"
    ON insights FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "BFF can manage all insights"
    ON insights FOR ALL
    USING (true);

-- 4.5. qna_posts 테이블
ALTER TABLE qna_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view qna posts"
    ON qna_posts FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "BFF can manage all qna posts"
    ON qna_posts FOR ALL
    USING (true);

-- 4.6. qna_answers 테이블
ALTER TABLE qna_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view qna answers"
    ON qna_answers FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "BFF can manage all qna answers"
    ON qna_answers FOR ALL
    USING (true);

-- 4.7. family_links 테이블
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own family links"
    ON family_links FOR SELECT
    USING (auth.uid() = senior_id OR auth.uid() = family_id);

CREATE POLICY IF NOT EXISTS "BFF can manage all family links"
    ON family_links FOR ALL
    USING (true);

-- 4.8. med_checks 테이블
ALTER TABLE med_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own med checks"
    ON med_checks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "BFF can manage all med checks"
    ON med_checks FOR ALL
    USING (true);

-- 4.9. gamification 테이블
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own gamification"
    ON gamification FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "BFF can manage all gamification"
    ON gamification FOR ALL
    USING (true);

-- 4.10. user_follows 테이블
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own follows"
    ON user_follows FOR SELECT
    USING (auth.uid() = follower_id);

CREATE POLICY IF NOT EXISTS "BFF can manage all user follows"
    ON user_follows FOR ALL
    USING (true);

-- 4.11. tools_progress 테이블
ALTER TABLE tools_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own tools progress"
    ON tools_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "BFF can manage all tools progress"
    ON tools_progress FOR ALL
    USING (true);

-- 5. 성능 최적화 인덱스
-- =============================================

-- 5.1. completed_cards 인덱스
CREATE INDEX IF NOT EXISTS idx_completed_cards_user_card_date
    ON completed_cards(user_id, card_id, completed_at);

-- 5.2. qna_posts 인덱스
CREATE INDEX IF NOT EXISTS idx_qna_posts_topic_created
    ON qna_posts(topic, created_at DESC);

-- 5.3. qna_answers 인덱스
CREATE INDEX IF NOT EXISTS idx_qna_answers_post_created
    ON qna_answers(post_id, created_at DESC);

-- 5.4. insights 인덱스
CREATE INDEX IF NOT EXISTS idx_insights_topic_created
    ON insights(topic, created_at DESC);

-- 5.5. med_checks 인덱스
CREATE INDEX IF NOT EXISTS idx_med_checks_user_date
    ON med_checks(user_id, check_date DESC);

-- 5.6. family_links 인덱스
CREATE INDEX IF NOT EXISTS idx_family_links_senior
    ON family_links(senior_id, status);

CREATE INDEX IF NOT EXISTS idx_family_links_family
    ON family_links(family_id, status);

-- 5.7. tools_progress 인덱스
CREATE INDEX IF NOT EXISTS idx_tools_progress_user_tool
    ON tools_progress(user_id, tool_id);

-- =============================================
-- 완료 메시지
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ P0-4 Supabase 설정 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '완료된 작업:';
    RAISE NOTICE '1. ✅ usage_counters 테이블 생성';
    RAISE NOTICE '2. ✅ Realtime 활성화 (5개 테이블)';
    RAISE NOTICE '3. ✅ gamification 테이블 업데이트';
    RAISE NOTICE '4. ✅ RLS 정책 검증 (12개 테이블)';
    RAISE NOTICE '5. ✅ 성능 인덱스 생성 (8개)';
    RAISE NOTICE '';
    RAISE NOTICE '다음 단계:';
    RAISE NOTICE '1. BFF 서버 재시작 (port 8002)';
    RAISE NOTICE '2. 게임화 엔드포인트 테스트';
    RAISE NOTICE '3. 모바일 앱에서 카드 완료 테스트';
END $$;
```

</details>

### Step 3: SQL 실행

1. 복사한 SQL 전체를 SQL Editor에 붙여넣기
2. 우측 하단 **Run** 버튼 클릭 (또는 `Ctrl + Enter`)
3. 실행 완료 대기 (약 5-10초)

### Step 4: 결과 확인

**성공 메시지 확인**:
```
✅ P0-4 Supabase 설정 완료!

완료된 작업:
1. ✅ usage_counters 테이블 생성
2. ✅ Realtime 활성화 (5개 테이블)
3. ✅ gamification 테이블 업데이트
4. ✅ RLS 정책 검증 (12개 테이블)
5. ✅ 성능 인덱스 생성 (8개)
```

**에러 발생 시**:
- `permission denied` 에러: service_role 키 확인 필요
- `relation already exists` 경고: 무시 가능 (이미 존재하는 테이블)
- `syntax error`: SQL 복사 시 잘못된 부분이 있는지 확인

---

## ✅ 검증 단계

### 1. 테이블 생성 확인

SQL Editor에서 실행:

```sql
-- usage_counters 테이블 확인
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'usage_counters'
ORDER BY ordinal_position;
```

**예상 결과**: 8개 컬럼 (id, user_id, month, cards_completed, insights_viewed, med_checks_done, total_points, created_at, updated_at)

### 2. Realtime 활성화 확인

```sql
-- Realtime 활성화된 테이블 확인
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

**예상 결과**: `qna_answers`, `completed_cards`, `med_checks`, `family_alerts`, `usage_counters` 포함

### 3. gamification 테이블 구조 확인

```sql
-- gamification 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gamification'
AND column_name IN ('last_activity_date', 'longest_streak', 'badges')
ORDER BY column_name;
```

**예상 결과**:
- `last_activity_date`: `date`, YES
- `longest_streak`: `integer`, YES
- `badges`: `ARRAY`, YES (또는 `text[]`)

### 4. RLS 정책 확인

```sql
-- 모든 테이블의 RLS 상태 확인
SELECT tablename, 
       rowsecurity AS rls_enabled,
       (SELECT COUNT(*) 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = t.tablename) AS policy_count
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'cards', 'completed_cards', 'insights', 
                  'qna_posts', 'qna_answers', 'family_links', 'med_checks', 
                  'gamification', 'user_follows', 'tools_progress', 'usage_counters')
ORDER BY tablename;
```

**예상 결과**: 모든 테이블의 `rls_enabled = true`, `policy_count >= 2`

---

## 🔧 문제 해결 (Troubleshooting)

### 문제 1: "permission denied for schema public"

**원인**: 잘못된 키 사용 또는 권한 부족

**해결**:
1. Supabase Dashboard → Settings → API
2. `service_role` 키 복사 (anon 키 아님!)
3. `.env` 파일의 `SUPABASE_SERVICE_ROLE_KEY` 업데이트
4. BFF 서버 재시작

### 문제 2: "relation already exists"

**원인**: 테이블이 이미 존재함 (정상)

**해결**: 경고 무시하고 계속 진행 (CREATE TABLE IF NOT EXISTS 사용)

### 문제 3: "publication supabase_realtime does not exist"

**원인**: Realtime 기능이 비활성화되어 있음

**해결**:
1. Supabase Dashboard → Database → Replication
2. `supabase_realtime` publication 확인
3. 없으면 Supabase Support에 문의

### 문제 4: SQL 실행이 멈춤

**원인**: 긴 SQL 스크립트 실행 중

**해결**:
- 30초 이상 대기
- 여전히 멈춰있으면: 브라우저 새로고침 후 재실행
- 섹션별로 나눠서 실행 (1-5번 섹션 각각)

---

## 📊 실행 후 BFF 테스트

### 1. BFF 서버 재시작

```powershell
# 기존 서버 종료 (Ctrl + C)
# 재시작
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8002
```

### 2. Health Check 확인

```powershell
curl http://localhost:8002/health
```

**예상 결과**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T12:00:00Z"
}
```

### 3. Gamification 엔드포인트 테스트

브라우저에서 접속: `http://localhost:8002/docs`

**테스트할 엔드포인트**:
- `GET /v1/gamification/stats` - 사용자 통계
- `GET /v1/gamification/level-progress` - 레벨 진행률
- `GET /v1/gamification/badges` - 배지 목록

### 4. 캐싱 동작 확인

BFF 터미널에서 로그 확인:

```
INFO: 캐시 히트: gamification:stats:{user_id}
INFO: 캐시 저장: gamification:stats:{user_id} (TTL: 60s)
```

---

## 🎉 완료 확인

**다음 항목이 모두 ✅이면 성공!**

- [ ] SQL 스크립트 에러 없이 실행 완료
- [ ] `usage_counters` 테이블 생성 확인
- [ ] Realtime 활성화 확인 (5개 테이블)
- [ ] `gamification` 테이블에 `last_activity_date`, `longest_streak` 컬럼 존재
- [ ] 모든 테이블의 RLS 활성화 확인 (12개)
- [ ] BFF 서버 정상 재시작
- [ ] `/health` 엔드포인트 응답 정상

---

## 📞 도움이 필요하면

**에러 메시지 복사 후**:
1. GitHub Issue 생성
2. 또는 Copilot에게 에러 메시지 전달

**필수 정보**:
- 에러 메시지 전체
- 실행한 SQL 섹션 (1-5번 중)
- Supabase 프로젝트 버전

---

**마지막 업데이트**: 2025년 11월 20일  
**문서 버전**: 1.0
