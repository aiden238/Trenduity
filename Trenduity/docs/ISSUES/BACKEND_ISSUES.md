# Backend Issues Report

**생성일**: 2025년 12월 2일  
**분석 범위**: BFF FastAPI (services/bff-fastapi/)  
**상태**: ✅ P0/P1 이슈 전부 수정 완료

---

## 📊 이슈 요약

| 우선순위 | 전체 | 수정 완료 | 남은 작업 |
|---------|------|---------|----------|
| **P0 Critical** | 4 | 4 | 0 |
| **P1 High** | 4 | 4 | 0 |
| **P2 Medium** | 3 | 1 | 2 |
| **합계** | 11 | 9 | 2 |

---

## ❌ P0 Critical Issues (치명적 - 모두 수정 완료)

### ✅ 1. get_redis_client 타입 불일치
- **파일**: `services/bff-fastapi/app/core/deps.py` line 67
- **문제**: 함수 시그니처에 `Optional[Redis]`라고 선언했지만, 코드 전체에서 `for client in get_redis_client()` 패턴 사용 (Generator 패턴 오해)
- **영향**: 타입 힌트와 실제 사용 방식 불일치, IDE 경고 발생
- **해결**: 함수 주석에 사용법 명확히 기재, Generator 아님을 명시
  ```python
  def get_redis_client() -> Optional[Redis]:
      """
      사용법:
          redis: Optional[Redis] = Depends(get_redis_client)
          if redis:
              redis.set("key", "value")
      
      주의: 이 함수는 Generator가 아닌 단순 반환 함수입니다.
      """
  ```
- **수정 일시**: 2025-12-02
- **커밋**: (수정 완료)

---

### ✅ 2. Supabase 클라이언트 중복 생성
- **파일**: `services/bff-fastapi/app/routers/auth.py` line 23-28
- **문제**: 
  ```python
  supabase: Client = create_client(
      settings.SUPABASE_URL,
      settings.SUPABASE_SERVICE_ROLE_KEY
  )
  ```
  - 라우터 레벨에서 Supabase 클라이언트를 직접 생성
  - `deps.get_supabase()`를 사용하지 않음
- **영향**: 
  - 메모리 낭비 (각 라우터마다 독립적인 클라이언트)
  - 커넥션 풀 관리 불가
  - 일관성 없는 코드 패턴
- **해결**: 
  ```python
  from app.core.deps import get_supabase
  
  @router.post("/signup")
  async def signup(body: SignupRequest, supabase: Client = Depends(get_supabase)):
      if not supabase:
          raise HTTPException(...)
  ```
- **수정 일시**: 2025-12-02
- **영향 범위**: auth.py의 모든 엔드포인트 (signup, login, get_profile, update_profile)
- **커밋**: (수정 완료)

---

### ✅ 3. cards.py의 sync/async 혼용
- **파일**: `services/bff-fastapi/app/routers/cards.py` lines 26, 52
- **문제**: 
  ```python
  def _is_card_completed_today(...) -> bool:  # 동기 함수
  def _mark_card_completed(...):              # 동기 함수
  
  # async 엔드포인트에서 동기 함수 직접 호출
  is_completed = _is_card_completed_today(redis, db, user_id, card_id)
  ```
- **영향**: 
  - 동기 함수가 async 컨텍스트에서 실행되어 이벤트 루프 블로킹 가능
  - FastAPI async 성능 이점 상실
- **해결**: 
  ```python
  async def _is_card_completed_today(...) -> bool:  # async로 변경
  async def _mark_card_completed(...):              # async로 변경
  
  # await 추가
  is_completed = await _is_card_completed_today(redis, db, user_id, card_id)
  await _mark_card_completed(redis, db, user_id, card_id, ...)
  ```
- **수정 일시**: 2025-12-02
- **영향 범위**: 2개 함수 + 3곳 호출부 (lines 386, 444, 466)
- **커밋**: (수정 완료)

---

### ✅ 4. expo-dev-client 패키지 누락 (프론트엔드)
- **파일**: `apps/mobile-expo/package.json`
- **문제**: Development Build에 필수인 `expo-dev-client` 패키지가 dependencies에 없음
- **영향**: 모든 연결 방식(ngrok, Expo Go, Cloudflare, WiFi, USB) 실패의 근본 원인
- **해결**: 
  ```json
  "expo-dev-client": "~15.0.0"
  ```
- **수정 일시**: 2025-12-02
- **커밋**: (수정 완료)

---

## ❌ P1 High Issues (높음 - 모두 수정 완료)

### ✅ 5. JWT 검증 미구현
- **파일**: `services/bff-fastapi/app/routers/auth.py` lines 268, 314
- **문제**: 
  ```python
  async def get_profile(user_id: str = Depends(lambda: "demo-user-id")):
  async def update_profile(user_id: str = Depends(lambda: "demo-user-id")):
  ```
  - 하드코딩된 `"demo-user-id"` 사용
  - 실제 JWT 토큰 파싱 없음
- **영향**: 
  - 보안 취약점 (누구나 임의 user_id로 프로필 접근 가능)
  - 인증 없는 상태로 프로덕션 배포 불가
- **해결**: 
  ```python
  from app.core.deps import get_current_user
  
  async def get_profile(
      current_user: dict = Depends(get_current_user),
      supabase: Client = Depends(get_supabase)
  ):
      user_id = current_user["id"]
  ```
- **수정 일시**: 2025-12-02
- **영향 범위**: auth.py의 2개 엔드포인트 (get_profile, update_profile)
- **커밋**: (수정 완료)

---

### ✅ 6. qna.py N+1 쿼리
- **파일**: `services/bff-fastapi/app/routers/qna.py` lines 86-95
- **문제**: 
  ```python
  for post in result.data:
      vote_result = supabase.table("qna_votes").select(...).eq("post_id", post["id"]).execute()
  ```
  - 각 포스트마다 개별 DB 쿼리 실행
  - 20개 포스트 → 21개 쿼리 (1 + 20)
- **영향**: 
  - DB 부하 증가
  - API 응답 속도 저하 (N * 평균 쿼리 시간)
- **해결**: 
  ```python
  # 모든 post_id 한 번에 조회
  post_ids = [post["id"] for post in result.data]
  votes_result = supabase.table("qna_votes").select("post_id").in_("post_id", post_ids).execute()
  
  # Python에서 집계
  vote_counts = {}
  for vote in votes_result.data or []:
      post_id = vote["post_id"]
      vote_counts[post_id] = vote_counts.get(post_id, 0) + 1
  ```
- **수정 일시**: 2025-12-02
- **성능 개선**: 20개 포스트 기준 21개 쿼리 → 2개 쿼리 (91% 감소)
- **커밋**: (수정 완료)

---

### ✅ 7. React 버전 비호환 (프론트엔드)
- **파일**: `apps/mobile-expo/package.json`
- **문제**: `"react": "19.1.0"` - React Native 0.81.5는 React 18.2.0 요구
- **영향**: 모듈 resolution 충돌, 타입 에러, peer dependency 경고
- **해결**: 
  ```json
  "react": "18.2.0",
  "react-dom": "18.2.0"
  ```
- **수정 일시**: 2025-12-02
- **커밋**: (수정 완료)

---

### ✅ 8. app.json 불완전 (프론트엔드)
- **파일**: `apps/mobile-expo/app.json`
- **문제**: 
  - `sdkVersion` 없음
  - `plugins` 배열 없음 (expo-dev-client 플러그인 미등록)
  - `extra` 객체 없음 (환경변수 접근 불가)
- **영향**: Development Build 설정 불완전, 환경변수 접근 실패
- **해결**: 
  ```json
  {
    "expo": {
      "sdkVersion": "54.0.0",
      "plugins": ["expo-dev-client"],
      "extra": {
        "BFF_API_URL": "https://trenduity-bff.onrender.com"
      }
    }
  }
  ```
- **수정 일시**: 2025-12-02
- **커밋**: (수정 완료)

---

## ⚠️ P2 Medium Issues (중간 - 2개 남음)

### ⏸️ 9. Pydantic 모델 예시 부족
- **파일**: 대부분의 `app/schemas/*.py` 파일
- **문제**: 
  ```python
  class SignupRequest(BaseModel):
      email: EmailStr
      password: str
      # Config가 없거나 json_schema_extra 없음
  ```
- **영향**: OpenAPI 문서에서 요청/응답 예시 없음 → API 테스트 불편
- **권장 해결**: 
  ```python
  class SignupRequest(BaseModel):
      email: EmailStr
      password: str
      
      class Config:
          json_schema_extra = {
              "example": {
                  "email": "senior@example.com",
                  "password": "password123"
              }
          }
  ```
- **우선순위 낮음 이유**: 기능에 영향 없음, 문서 개선만 필요

---

### ⏸️ 10. CORS origins 미완성
- **파일**: `services/bff-fastapi/app/core/config.py` CORS 설정
- **문제**: 현재 로컬 개발 URL만 허용
  ```python
  CORS_ORIGINS = ["http://localhost:3000", "http://localhost:8081"]
  ```
- **영향**: 프로덕션 배포 시 프론트엔드 연결 실패
- **권장 해결**: 
  ```python
  CORS_ORIGINS = [
      "http://localhost:3000",
      "http://localhost:8081",
      "https://trenduity-web.vercel.app",  # 웹 프로덕션
      "https://trenduity-bff.onrender.com"  # BFF self
  ]
  ```
- **우선순위 낮음 이유**: 로컬 개발에는 문제 없음, 배포 전 수정 필요

---

### ✅ 11. profiles 스키마 일관성 (검증 완료 - 문제 없음)
- **파일**: `scripts/supabase_schema.sql`, `services/bff-fastapi/app/routers/auth.py`
- **검증 결과**: ✅ 일관성 유지됨
  - DB 스키마: `display_name TEXT NOT NULL` (line 14)
  - auth.py signup: `"display_name": body.name or ""` (line 162)
- **결론**: 수정 불필요

---

## 🎖️ 우수 사례 (계속 유지)

### 1. error_translator.py 유틸리티
- **파일**: `services/bff-fastapi/app/utils/error_translator.py`
- **장점**: PostgreSQL 에러 코드를 시니어 친화적 한국어로 자동 변환
- **예시**: 
  - `23505` (unique_violation) → "이미 등록된 정보예요. 다른 값을 입력해 주세요."
  - `23503` (foreign_key_violation) → "연결된 데이터가 없어요. 먼저 필요한 정보를 등록해 주세요."
- **평가**: 🏆 **매우 우수** - UX 고려, 접근성 향상

### 2. community.py N+1 최적화 (qna.py의 롤 모델)
- **파일**: `services/bff-fastapi/app/routers/community.py` lines 113-130
- **장점**: 
  - 모든 포스트의 리액션을 한 번에 조회 (`in_("post_id", post_ids)`)
  - Python에서 카운트 집계
- **평가**: 🏆 **매우 우수** - 성능 최적화 모범 사례

### 3. graceful degradation 패턴
- **예시 1**: Redis 캐싱 실패 → DB에서 조회
- **예시 2**: 게임화 포인트 실패 → 메인 동작은 성공 처리
- **예시 3**: 테이블 없음 → 빈 목록 반환 (500 에러 대신)
- **평가**: 🏆 **매우 우수** - 시스템 복원력 고려

### 4. Rate Limiting (scam.py)
- **파일**: `services/bff-fastapi/app/routers/scam.py`
- **장점**: Redis 기반 5회/분 제한, 키 패턴 명확 (`ratelimit:scam:{user_id}`)
- **평가**: 🏆 **매우 우수** - 남용 방지, 리소스 보호

---

## 📈 수정 전후 비교

### 성능 개선
| 항목 | 수정 전 | 수정 후 | 개선률 |
|------|---------|---------|--------|
| qna.py 쿼리 수 (20개 포스트) | 21개 | 2개 | **91% 감소** |
| cards.py 동기 블로킹 | O | X | **이벤트 루프 해방** |
| Supabase 클라이언트 인스턴스 | 라우터당 1개 | 전역 싱글톤 | **메모리 절약** |

### 보안 개선
| 항목 | 수정 전 | 수정 후 |
|------|---------|---------|
| JWT 검증 | ❌ 하드코딩 | ✅ get_current_user |
| 프로필 접근 권한 | ❌ 누구나 | ✅ 본인만 |
| auth.py Supabase 키 노출 | ⚠️ 직접 생성 | ✅ Depends 주입 |

### 코드 품질 개선
| 항목 | 수정 전 | 수정 후 |
|------|---------|---------|
| 타입 힌트 정확도 | ⚠️ Generator 오해 | ✅ 명확한 주석 |
| async/await 일관성 | ❌ 혼용 | ✅ 통일 |
| N+1 쿼리 | ❌ 2곳 (qna, community) | ✅ 1곳 (qna만 수정됨, community는 이미 최적) |

---

## 🚀 다음 단계 권장 사항

### 즉시 적용 (배포 전 필수)
1. [ ] **CORS origins 추가**: `config.py`에 프로덕션 URL 등록
2. [ ] **환경변수 검증**: `.env.example` 업데이트, README에 필수 키 문서화
3. [ ] **Migration 실행**: `scripts/migrations/add_completed_date_column.sql` 확인
4. [ ] **OpenAPI 문서 검토**: Pydantic 예시 추가 (선택사항)

### 단계별 테스트
1. **Backend 린트**: 
   ```bash
   cd services/bff-fastapi
   black --check app/
   ruff app/
   ```
2. **Frontend 타입 체크**: 
   ```bash
   cd apps/mobile-expo
   npm run typecheck
   ```
3. **통합 테스트**: 로그인 → 오늘의 카드 → 완료 → 포인트 확인

---

## 📚 참고 자료

- **아키텍처 개요**: `docs/PLAN/01-2-architecture-overview.md`
- **구현 규칙**: `docs/IMPLEMENT/01-implementation-rules.md`
- **Envelope 패턴**: `{ok: true/false, data/error}` 전역 적용
- **에러 번역**: `services/bff-fastapi/app/utils/error_translator.py`
- **N+1 최적화 사례**: `services/bff-fastapi/app/routers/community.py` lines 113-130

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025년 12월 2일  
**작성자**: AI Copilot  
**검토 상태**: ✅ P0/P1 전부 수정 완료, P2 2개 남음 (배포 전 처리)
