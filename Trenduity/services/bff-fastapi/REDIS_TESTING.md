# Redis 캐싱 & 레이트 리미팅 테스트 가이드

## ✅ 완료된 작업

### 1. Redis 연결 풀 구현
**파일**: `services/bff-fastapi/app/core/deps.py`
- `init_redis_pool()`: 앱 시작 시 연결 풀 생성
- `get_redis_client()`: FastAPI 의존성 (None 반환 시 graceful degradation)
- 연결 실패 시 앱이 중단되지 않음

**파일**: `services/bff-fastapi/app/main.py`
- `lifespan` 핸들러에서 `init_redis_pool()` 호출
- 로깅 추가

### 2. Insights 라우터 캐싱
**파일**: `services/bff-fastapi/app/routers/insights.py`
- `GET /v1/insights`: 목록 조회 (TTL: 5분)
  - 캐시 키: `insights:list:topic_{topic}:range_{range}:limit_{limit}:offset_{offset}`
- `GET /v1/insights/{insight_id}`: 상세 조회 (TTL: 10분)
  - 캐시 키: `insights:detail:{insight_id}`

### 3. Scam 라우터 레이트 리미팅
**파일**: `services/bff-fastapi/app/routers/scam.py`
- `POST /v1/scam/check`: 1분당 5회 제한
  - 레이트 리미팅 키: `ratelimit:scam:{user_id}`
  - 초과 시 HTTP 429 응답

---

## 🚀 테스트 방법

### 1단계: Docker Redis 시작

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\infra\dev
docker-compose up -d redis
```

**확인:**
```powershell
docker ps | Select-String redis
# senior-learning-redis 컨테이너 실행 중이어야 함
```

### 2단계: Redis 연결 테스트

```powershell
# Redis CLI 접속
docker exec -it senior-learning-redis redis-cli

# 기본 명령어
127.0.0.1:6379> PING
# PONG 응답 확인

127.0.0.1:6379> SET test "hello"
# OK

127.0.0.1:6379> GET test
# "hello"

127.0.0.1:6379> exit
```

### 3단계: BFF 서버 재시작

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
```

### 4단계: 캐싱 테스트 (Insights)

#### 테스트 1: 첫 요청 (Cache Miss)

```powershell
curl http://localhost:8000/v1/insights?topic=ai_tools&range=weekly
```

**예상 로그 (BFF 터미널):**
```
INFO:     캐시 저장: insights:list:topic_ai_tools:range_weekly:limit_20:offset_0 (TTL: 300s)
```

#### 테스트 2: 두 번째 요청 (Cache Hit)

```powershell
# 즉시 재실행
curl http://localhost:8000/v1/insights?topic=ai_tools&range=weekly
```

**예상 로그:**
```
INFO:     캐시 히트: insights:list:topic_ai_tools:range_weekly:limit_20:offset_0
```

**성능 비교**:
- Cache Miss: ~200-500ms (DB 쿼리)
- Cache Hit: ~10-50ms (Redis 조회)

#### 테스트 3: 캐시 만료 확인

```powershell
# Redis CLI에서 TTL 확인
docker exec -it senior-learning-redis redis-cli

127.0.0.1:6379> KEYS insights:*
# 저장된 캐시 키 목록

127.0.0.1:6379> TTL insights:list:topic_ai_tools:range_weekly:limit_20:offset_0
# 남은 시간(초) 반환 (예: 287)

# 5분 후 자동 삭제 확인
127.0.0.1:6379> GET insights:list:topic_ai_tools:range_weekly:limit_20:offset_0
# (nil)
```

---

### 5단계: 레이트 리미팅 테스트 (Scam Check)

#### 테스트 1: 정상 요청 (1-5회)

**PowerShell 스크립트:**
```powershell
# 1-5회 요청 (성공해야 함)
for ($i=1; $i -le 5; $i++) {
    Write-Host "요청 $i/5"
    curl -X POST http://localhost:8000/v1/scam/check `
      -H "Content-Type: application/json" `
      -H "Authorization: Bearer YOUR_JWT_TOKEN" `
      -d '{"input":"무료 쿠폰 받으세요 링크 클릭"}'
    Start-Sleep -Seconds 1
}
```

**예상 로그 (BFF):**
```
INFO:     레이트 리미팅: user=user-uuid, count=1/5
INFO:     레이트 리미팅: user=user-uuid, count=2/5
...
INFO:     레이트 리미팅: user=user-uuid, count=5/5
```

#### 테스트 2: 초과 요청 (6회)

```powershell
# 6번째 요청 (실패해야 함)
curl -X POST http://localhost:8000/v1/scam/check `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -d '{"input":"무료 쿠폰 받으세요 링크 클릭"}'
```

**예상 응답:**
```json
{
  "ok": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "사기 검사를 너무 자주 요청했어요. 1분 후 다시 시도해 주세요."
  }
}
```

**HTTP 상태코드**: 429 (Too Many Requests)

#### 테스트 3: 1분 후 재요청

```powershell
# 60초 대기
Start-Sleep -Seconds 60

# 다시 요청 (성공해야 함)
curl -X POST http://localhost:8000/v1/scam/check `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -d '{"input":"무료 쿠폰 받으세요 링크 클릭"}'
```

**예상 로그:**
```
INFO:     레이트 리미팅: user=user-uuid, count=1/5
```

---

## 🔍 디버깅

### Redis 연결 문제

**증상**: "Redis 연결 풀이 초기화되지 않았습니다"

**해결**:
```powershell
# Docker 컨테이너 상태 확인
docker ps | Select-String redis

# Redis 로그 확인
docker logs senior-learning-redis

# 환경 변수 확인
Get-Content c:\AIDEN_PROJECT\Trenduity\Trenduity\.env | Select-String REDIS
# REDIS_URL=redis://localhost:6379/0 확인
```

### 캐시 수동 삭제

```powershell
# Redis CLI
docker exec -it senior-learning-redis redis-cli

# 특정 키 삭제
127.0.0.1:6379> DEL insights:list:topic_ai_tools:range_weekly:limit_20:offset_0

# 패턴 매칭 삭제 (전체 insights 캐시)
127.0.0.1:6379> EVAL "return redis.call('del', unpack(redis.call('keys', 'insights:*')))" 0

# 전체 캐시 초기화 (주의!)
127.0.0.1:6379> FLUSHDB
```

### 레이트 리미팅 리셋

```powershell
docker exec -it senior-learning-redis redis-cli

# 특정 사용자 레이트 리미팅 리셋
127.0.0.1:6379> DEL ratelimit:scam:user-uuid

# 모든 레이트 리미팅 리셋
127.0.0.1:6379> EVAL "return redis.call('del', unpack(redis.call('keys', 'ratelimit:*')))" 0
```

---

## 📊 성능 측정

### Insights 캐싱 효과

**테스트 도구**: Apache Bench 또는 PowerShell Measure-Command

```powershell
# 캐시 미적용 시 (기준)
Measure-Command { 
    curl http://localhost:8000/v1/insights?topic=ai_tools 
}

# 캐시 적용 후 (2회 이상)
Measure-Command { 
    curl http://localhost:8000/v1/insights?topic=ai_tools 
}
```

**기대 결과**:
- 캐시 미적용: ~300ms
- 캐시 적용: ~30ms (**10배 빠름**)

---

## ✅ 완료 체크리스트

- [ ] Docker Redis 컨테이너 실행 중
- [ ] BFF 서버 로그에 "Redis 연결 풀 초기화 성공" 표시
- [ ] Insights 목록 조회 2회 → 두 번째 요청이 빠름
- [ ] Insights 상세 조회 캐시 히트 로그 확인
- [ ] Scam check 6회 요청 → 6번째에 429 응답
- [ ] 1분 대기 후 Scam check 다시 성공

---

## 🎯 다음 단계

Redis 캐싱이 정상 작동하면:

1. **웹 콘솔 Members 상세 페이지** 구현
   - BFF API 추가 필요: `GET /v1/family/members/{user_id}/profile`

2. **모바일 앱에서 Insights 조회 테스트**
   - `apps/mobile-expo/src/hooks/useInsights.ts` 활용

3. **Redis 모니터링 추가**
   - 캐시 히트율 추적
   - 레이트 리미팅 통계

---

**JWT 토큰 얻기** (테스트용):
```powershell
# Supabase Auth로 로그인 → 토큰 복사
# 또는 테스트용 더미 토큰 생성 (개발 환경만)
```
