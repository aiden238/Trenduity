# 통합 테스트 가이드 - Redis + Members 페이지

## 🎯 테스트 목표

1. Redis 캐싱 동작 확인 (Insights)
2. Redis 레이트 리미팅 확인 (Scam)
3. Members 상세 페이지 데이터 로딩

---

## 🚀 전체 테스트 프로세스

### 1단계: 환경 준비

```powershell
# Docker 서비스 시작
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\infra\dev
docker-compose up -d

# 상태 확인
docker ps
# senior-learning-postgres, senior-learning-redis 실행 중 확인
```

### 2단계: BFF 서버 시작

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**예상 로그:**
```
INFO:     BFF 서버 시작 중...
INFO:     Redis 연결 풀 초기화 성공: redis://localhost:6379/0
INFO:     Redis 연결 풀 초기화 완료
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

**✅ 체크포인트 1**: "Redis 연결 풀 초기화 성공" 로그 확인

### 3단계: 웹 콘솔 시작

```powershell
# 새 PowerShell 터미널
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\web-next
npm install  # swr 의존성 설치
npm run dev
```

**접속**: http://localhost:3000

**✅ 체크포인트 2**: 컴파일 에러 없이 웹 서버 실행

---

## 🧪 테스트 시나리오

### 시나리오 A: Redis 캐싱 테스트

#### A-1. Insights 캐싱 (첫 요청)

```powershell
curl http://localhost:8000/v1/insights?topic=ai_tools
```

**BFF 로그 확인:**
```
INFO:     캐시 저장: insights:list:topic_ai_tools:range_weekly:limit_20:offset_0 (TTL: 300s)
```

**측정**: 응답 시간 기록 (예: 300ms)

#### A-2. Insights 캐싱 (두 번째 요청)

```powershell
# 즉시 재실행
curl http://localhost:8000/v1/insights?topic=ai_tools
```

**BFF 로그 확인:**
```
INFO:     캐시 히트: insights:list:topic_ai_tools:range_weekly:limit_20:offset_0
```

**측정**: 응답 시간 기록 (예: 30ms)

**✅ 예상 결과**: 두 번째 요청이 첫 번째보다 약 10배 빠름

#### A-3. Redis 캐시 데이터 확인

```powershell
docker exec -it senior-learning-redis redis-cli

127.0.0.1:6379> KEYS insights:*
# 1) "insights:list:topic_ai_tools:range_weekly:limit_20:offset_0"

127.0.0.1:6379> TTL insights:list:topic_ai_tools:range_weekly:limit_20:offset_0
# (integer) 287  (남은 초)

127.0.0.1:6379> GET insights:list:topic_ai_tools:range_weekly:limit_20:offset_0
# JSON 데이터 출력

127.0.0.1:6379> exit
```

**✅ 체크포인트 3**: 캐시 키가 존재하고 TTL이 300초 이하

---

### 시나리오 B: 레이트 리미팅 테스트

#### B-1. 정상 요청 (1-5회)

**주의**: JWT 토큰 필요 (테스트용 토큰 생성 필요)

```powershell
# 임시: 인증 우회 테스트 (개발 환경)
# 실제로는 JWT 토큰 필요

# 5회 연속 요청
for ($i=1; $i -le 5; $i++) {
    Write-Host "요청 $i/5"
    curl -X POST http://localhost:8000/v1/scam/check `
      -H "Content-Type: application/json" `
      -H "Authorization: Bearer test-token" `
      -d '{"input":"무료 쿠폰 받으세요 링크 클릭"}'
}
```

**BFF 로그:**
```
INFO:     레이트 리미팅: user=user-id, count=1/5
INFO:     레이트 리미팅: user=user-id, count=2/5
...
INFO:     레이트 리미팅: user=user-id, count=5/5
```

#### B-2. 초과 요청 (6회)

```powershell
# 6번째 요청
curl -X POST http://localhost:8000/v1/scam/check `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer test-token" `
  -d '{"input":"무료 쿠폰 받으세요 링크 클릭"}'
```

**예상 응답:**
```json
{
  "detail": {
    "ok": false,
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "사기 검사를 너무 자주 요청했어요. 1분 후 다시 시도해 주세요."
    }
  }
}
```

**HTTP 상태**: 429

**✅ 체크포인트 4**: 6번째 요청에서 429 에러

---

### 시나리오 C: Members 상세 페이지 테스트

#### C-1. Dashboard → Members 네비게이션

1. 브라우저: http://localhost:3000
2. Dashboard 페이지 로딩 확인
3. "회원 목록"에서 멤버 클릭

**예상**: `/members/{user_id}` 페이지로 이동

#### C-2. Members 상세 데이터 로딩

**브라우저 개발자 도구 (F12) → Network 탭:**

1. **첫 번째 요청**:
   - URL: `/v1/family/members/{user_id}/profile`
   - 상태: 200 OK
   - 응답: `{ ok: true, data: { name, email, total_points, badges } }`

2. **두 번째 요청**:
   - URL: `/v1/family/members/{user_id}/activity`
   - 상태: 200 OK
   - 응답: `{ ok: true, data: { daily_activities, total_cards_7days } }`

**✅ 체크포인트 5**: 두 API 모두 200 응답, 데이터 표시

#### C-3. UI 요소 확인

페이지에서 확인할 항목:

- [ ] **기본 정보 카드**: 이름, 이메일, 가입일 표시
- [ ] **포인트 카드**: 숫자 표시 (파란색)
- [ ] **배지 카드**: 획득 배지 수 (노란색)
- [ ] **주간 활동**: "완료한 학습 카드", "복약 체크" 통계
- [ ] **막대 차트**: 7일치 데이터 (날짜 라벨 + 파란 막대)
- [ ] **복약 히스토리**: 체크 기록 또는 "기록이 없어요" 메시지

#### C-4. 에러 시나리오 테스트

**잘못된 user_id 접근:**
```
URL: http://localhost:3000/members/invalid-id-123
```

**예상**:
- 빨간 에러 박스: "연동된 멤버가 아니에요."

**✅ 체크포인트 6**: 에러 메시지 표시 (빨간 배경)

---

## 📊 성능 측정

### 캐싱 효과 측정

```powershell
# PowerShell 측정 스크립트
$results = @()

# Cache Miss (1회)
$miss = Measure-Command { 
    curl -s http://localhost:8000/v1/insights?topic=ai_tools | Out-Null
}

# Cache Hit (3회 평균)
$hits = 1..3 | ForEach-Object {
    Measure-Command { 
        curl -s http://localhost:8000/v1/insights?topic=ai_tools | Out-Null
    }
}
$avgHit = ($hits | Measure-Object -Property TotalMilliseconds -Average).Average

Write-Host "Cache Miss: $($miss.TotalMilliseconds)ms"
Write-Host "Cache Hit (평균): ${avgHit}ms"
Write-Host "성능 향상: $([math]::Round($miss.TotalMilliseconds / $avgHit, 2))배"
```

**기대 결과**:
```
Cache Miss: 280ms
Cache Hit (평균): 25ms
성능 향상: 11.2배
```

---

## 🐛 문제 해결

### 문제 1: "Redis 연결 풀이 초기화되지 않았습니다"

**원인**: Docker Redis 컨테이너 미실행

**해결**:
```powershell
docker ps | Select-String redis
# 없으면:
docker-compose up -d redis
```

### 문제 2: "연동된 멤버가 아니에요"

**원인**: `family_links` 테이블에 데이터 없음

**해결**:
```sql
-- Supabase SQL Editor 또는 psql
INSERT INTO family_links (guardian_id, user_id, perms)
VALUES ('guardian-uuid', 'user-uuid', '{"read": true, "alerts": true}');
```

### 문제 3: Members 페이지 빈 화면

**원인**: API 응답 에러

**확인**:
1. 브라우저 Console (F12) → 에러 로그 확인
2. BFF 터미널 → 에러 스택 확인
3. Network 탭 → 요청 상태코드 확인

### 문제 4: 차트가 표시되지 않음

**원인**: `daily_activities` 배열이 비어있음

**확인**:
```powershell
curl http://localhost:8000/v1/family/members/{user_id}/activity
# daily_activities가 빈 배열인지 확인
```

**임시 해결**: 시드 데이터 추가
```sql
INSERT INTO cards (user_id, date, completed_at)
VALUES 
  ('user-uuid', CURRENT_DATE, NOW()),
  ('user-uuid', CURRENT_DATE - 1, NOW() - interval '1 day');
```

---

## ✅ 최종 체크리스트

### Redis 캐싱
- [ ] BFF 시작 시 "Redis 연결 풀 초기화 성공" 로그
- [ ] Insights 첫 요청: "캐시 저장" 로그
- [ ] Insights 두 번째 요청: "캐시 히트" 로그
- [ ] Redis CLI에서 캐시 키 확인
- [ ] 두 번째 요청이 첫 번째보다 빠름 (5배 이상)

### 레이트 리미팅
- [ ] 5회 연속 요청 성공
- [ ] 6번째 요청 HTTP 429 응답
- [ ] 1분 대기 후 다시 요청 성공

### Members 페이지
- [ ] Dashboard → Members 클릭 시 상세 페이지 이동
- [ ] 프로필 정보 표시 (이름, 이메일)
- [ ] 포인트 & 배지 숫자 표시
- [ ] 7일 막대 차트 렌더링
- [ ] 복약 히스토리 표시 (또는 빈 상태 메시지)
- [ ] 잘못된 ID 접근 시 에러 메시지

---

## 🎯 다음 단계

모든 테스트 통과 시:

1. **우선순위 1.3**: Alerts 페이지 구현
2. **우선순위 1.4**: Encourage 페이지 구현
3. **우선순위 2**: E2E 테스트 작성

---

**테스트 시작 명령어 요약:**

```powershell
# 터미널 1: Docker
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\infra\dev
docker-compose up -d

# 터미널 2: BFF
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# 터미널 3: 웹 콘솔
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\web-next
npm run dev

# 브라우저
http://localhost:3000
```
