# Fix Checklist

**생성일**: 2025년 12월 2일  
**목적**: 모든 P0/P1 수정사항 검증 체크리스트  
**상태**: 코드 수정 완료 ✅ / 테스트 대기 ⏳

---

## 📋 Frontend 수정사항 (4개)

### ✅ 1. expo-dev-client 패키지 설치
**파일**: `apps/mobile-expo/package.json`
```bash
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
npm install expo-dev-client@~15.0.0 --legacy-peer-deps
```

**검증**:
- [ ] `package.json`에 `"expo-dev-client": "~15.0.0"` 존재
- [ ] `node_modules/expo-dev-client` 디렉터리 존재
- [ ] `npm list expo-dev-client` 실행 시 버전 표시

---

### ✅ 2. React 버전 다운그레이드
**파일**: `apps/mobile-expo/package.json`
```bash
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
npm install react@18.2.0 react-dom@18.2.0 --legacy-peer-deps
```

**검증**:
- [ ] `package.json`에 `"react": "18.2.0"` 존재 (19.1.0 아님)
- [ ] `package.json`에 `"react-dom": "18.2.0"` 존재
- [ ] `npm list react` 실행 시 18.2.0 표시
- [ ] `npm run typecheck` 통과 (타입 에러 없음)

---

### ✅ 3. app.json 설정 추가
**파일**: `apps/mobile-expo/app.json`

**검증**:
- [ ] `"sdkVersion": "54.0.0"` 존재
- [ ] `"plugins": ["expo-dev-client"]` 존재
- [ ] `"extra": { "BFF_API_URL": "..." }` 존재
- [ ] JSON 문법 에러 없음 (유효한 JSON)

---

### ✅ 4. 환경변수 접근 방식 변경
**파일**: `apps/mobile-expo/src/utils/apiClient.ts`

**검증**:
- [ ] `import Constants from 'expo-constants'` 제거됨
- [ ] `process.env.EXPO_PUBLIC_BFF_API_URL` 사용 중
- [ ] `.env` 파일 생성 (로컬 개발용):
  ```
  EXPO_PUBLIC_BFF_API_URL=http://localhost:8000
  ```
- [ ] `npm run lint` 통과 (사용되지 않는 import 없음)

---

## 🔧 Backend 수정사항 (6개)

### ✅ 5. get_redis_client 타입 문서화
**파일**: `services/bff-fastapi/app/core/deps.py`

**검증**:
- [ ] Docstring에 "Generator가 아닌 단순 반환 함수" 명시됨
- [ ] 사용 예시 포함 (`redis: Optional[Redis] = Depends(get_redis_client)`)
- [ ] 잘못된 사용 예시 포함 (`for client in get_redis_client()` 금지)

---

### ✅ 6. Supabase client Depends 주입
**파일**: `services/bff-fastapi/app/routers/auth.py`

**검증**:
- [ ] 모듈 레벨 Supabase 초기화 제거됨 (line 23-28 삭제)
- [ ] `from app.core.deps import get_supabase` import 존재
- [ ] `signup` 함수 시그니처: `supabase: Client = Depends(get_supabase)`
- [ ] `login` 함수 시그니처: `supabase: Client = Depends(get_supabase)`
- [ ] `get_profile` 함수 시그니처: `supabase: Client = Depends(get_supabase)`
- [ ] `update_profile` 함수 시그니처: `supabase: Client = Depends(get_supabase)`
- [ ] `uvicorn app.main:app --reload` 실행 시 에러 없음

---

### ✅ 7. cards.py helper 함수 async 변환
**파일**: `services/bff-fastapi/app/routers/cards.py`

**검증**:
- [ ] `async def _is_card_completed_today(...)` (line 26)
- [ ] `async def _mark_card_completed(...)` (line 52)
- [ ] 3개 호출 사이트에 `await` 추가:
  - [ ] Line 386: `await _is_card_completed_today(...)`
  - [ ] Line 444: `await _is_card_completed_today(...)`
  - [ ] Line 466: `await _mark_card_completed(...)`
- [ ] `pytest services/bff-fastapi/tests/` 통과 (있다면)

---

### ✅ 8. JWT 검증 구현
**파일**: `services/bff-fastapi/app/routers/auth.py`

**검증**:
- [ ] `user_id = "demo-user-id"` 하드코딩 제거됨
- [ ] `current_user: dict = Depends(get_current_user)` 사용 중
- [ ] `user_id = current_user["id"]` 패턴 적용
- [ ] Authorization 헤더 없이 요청 시 401 에러 반환

**테스트 명령어**:
```bash
# 1. 로그인으로 토큰 획득
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'

# 2. 토큰으로 프로필 조회 (성공 예상)
curl http://localhost:8000/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. 토큰 없이 프로필 조회 (401 예상)
curl http://localhost:8000/v1/auth/profile
```

---

### ✅ 9. qna.py N+1 쿼리 해결
**파일**: `services/bff-fastapi/app/routers/qna.py`

**검증**:
- [ ] `post_ids` 리스트 수집 로직 존재 (line ~93)
- [ ] Bulk vote 조회: `supabase.table("qna_votes").select("post_id").in_("post_id", post_ids)` (line ~95)
- [ ] Python `Counter`로 vote_count 계산 (line ~98)
- [ ] Loop에서 개별 쿼리 제거됨
- [ ] `vote_count` 필드가 응답에 포함됨

**성능 테스트**:
```bash
# 20개 게시글 조회
curl http://localhost:8000/v1/qna/posts?skip=0&limit=20

# 예상 쿼리 수: 2개 (posts 1개 + votes bulk 1개)
# 이전: 21개 (posts 1개 + votes 20개)
```

---

### ✅ 10. 환경변수 처리
**파일**: `services/bff-fastapi/.env`

**검증**:
- [ ] `.env` 파일 존재
- [ ] 필수 변수 설정:
  ```
  SUPABASE_URL=https://...
  SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  REDIS_HOST=localhost
  REDIS_PORT=6379
  ```
- [ ] `.env.example` 파일도 최신 상태 (실제 값 제외)
- [ ] Docker Compose로 Redis 실행 중: `docker ps | grep redis`

---

## 🗄️ Database 스키마 검증

### ✅ 11. display_name 필드 일관성
**파일**: `scripts/supabase_schema.sql`

**검증**:
- [ ] `profiles` 테이블 정의: `display_name TEXT NOT NULL` (line 14)
- [ ] `auth.py` signup 엔드포인트: `"display_name": body.name or ""` 사용 (line 162)
- [ ] 필드명 불일치 없음 확인됨 ✅

---

## 🧪 통합 테스트

### 1️⃣ Frontend 연결 복구
```bash
# Metro 캐시 정리
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
npx expo start -c

# Development Build 실행
npx expo run:android
```

**예상 결과**:
- [ ] Metro bundler가 정상적으로 시작됨
- [ ] 앱이 빌드되고 에뮬레이터에서 실행됨
- [ ] "Could not connect to development server" 에러 없음
- [ ] 홈 화면이 정상적으로 렌더링됨

---

### 2️⃣ Backend API 연결
```bash
# BFF 서버 실행
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**테스트**:
```bash
# Health check
curl http://localhost:8000/health
# 예상: {"status":"ok"}

# Swagger UI 접근
# 브라우저에서 http://localhost:8000/docs 열기
```

**예상 결과**:
- [ ] 서버가 8000번 포트에서 실행됨
- [ ] `/health` 엔드포인트 응답: `{"status":"ok"}`
- [ ] Swagger UI가 정상적으로 로드됨 (모든 엔드포인트 표시)

---

### 3️⃣ 로그인 플로우
```bash
# 1. 회원가입 (Supabase 직접 또는 BFF)
curl -X POST http://localhost:8000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"테스트유저"}'

# 2. 로그인
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. 프로필 조회 (JWT 토큰 필요)
curl http://localhost:8000/v1/auth/profile \
  -H "Authorization: Bearer <토큰>"
```

**예상 결과**:
- [ ] 회원가입 성공: `{"ok":true,"data":{"user_id":"..."}}`
- [ ] 로그인 성공: `{"ok":true,"data":{"token":"eyJ...","user_id":"..."}}`
- [ ] 프로필 조회 성공: `{"ok":true,"data":{"email":"test@example.com","display_name":"테스트유저"}}`

---

### 4️⃣ 카드 완료 플로우
```bash
# 1. 오늘의 카드 조회
curl http://localhost:8000/v1/cards/today \
  -H "Authorization: Bearer <토큰>"

# 2. 카드 완료
curl -X POST http://localhost:8000/v1/cards/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <토큰>" \
  -d '{"card_id":"<카드ID>"}'

# 3. 포인트 확인
curl http://localhost:8000/v1/auth/profile \
  -H "Authorization: Bearer <토큰>"
```

**예상 결과**:
- [ ] 오늘의 카드 반환됨 (JSON 객체)
- [ ] 카드 완료 성공: `{"ok":true,"data":{"points_awarded":5}}`
- [ ] 프로필 `total_points` 증가 확인 (5 포인트 추가)

---

### 5️⃣ Q&A 게시판 성능
```bash
# 20개 게시글 조회 (N+1 테스트)
curl http://localhost:8000/v1/qna/posts?skip=0&limit=20 \
  -H "Authorization: Bearer <토큰>"
```

**성능 지표**:
- [ ] 응답 시간 < 500ms (20개 게시글)
- [ ] DB 쿼리 수: 2개 (BFF 로그 확인)
- [ ] 모든 게시글에 `vote_count` 필드 포함

---

## 🚀 배포 전 체크리스트

### 환경변수 설정 (Render.com)
- [ ] `SUPABASE_URL` 설정
- [ ] `SUPABASE_ANON_KEY` 설정
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 설정 (민감 정보)
- [ ] `REDIS_HOST` 설정 (Render Redis 또는 외부)
- [ ] `REDIS_PORT` 설정
- [ ] `CORS_ORIGINS` 추가 (프론트엔드 도메인)

### 보안 검토
- [ ] `service_role` 키가 클라이언트에 노출되지 않음
- [ ] 모든 쓰기 작업이 BFF를 경유함
- [ ] JWT 검증이 모든 보호 엔드포인트에 적용됨
- [ ] Rate limiting 설정 (Redis 기반)

### 문서 업데이트
- [ ] `BACKEND_ISSUES.md` 최신 상태
- [ ] `FRONTEND_ISSUES.md` 최신 상태
- [ ] `FIX_CHECKLIST.md` 최신 상태 (현재 파일)
- [ ] `README.md` 업데이트 (설치 명령어 반영)

---

## ❌ 알려진 남은 이슈 (P2 - 낮은 우선순위)

### P2-1: Pydantic 스키마 예시 누락
- **파일**: `services/bff-fastapi/app/schemas/*.py`
- **상태**: ⏸️ 연기 (기능에 영향 없음)
- **내용**: `Config.json_schema_extra` 예시 추가 권장
- **예상 작업 시간**: 1시간

### P2-2: CORS origins 불완전
- **파일**: `services/bff-fastapi/app/main.py`
- **상태**: ⏸️ 연기 (로컬 개발에서는 작동)
- **내용**: `allow_origins=["*"]` → 구체적 도메인 리스트
- **배포 전 필수**: ✅

---

## 📊 전체 진행 상황

| 카테고리 | 전체 | 완료 | 진행률 |
|---------|------|------|-------|
| Frontend P0 | 4 | 4 | 100% |
| Backend P0 | 3 | 3 | 100% |
| Backend P1 | 3 | 3 | 100% |
| 통합 테스트 | 5 | 0 | 0% |
| Backend P2 | 2 | 0 | 0% |
| **총계** | **17** | **10** | **59%** |

---

## 🎯 다음 단계

1. **즉시 실행** (코드 수정 완료):
   ```bash
   cd c:\AIDEN_PROJECT\Trenduity\Trenduity
   .\scripts\dev.ps1  # 전체 시스템 실행
   ```

2. **검증 순서**:
   - [ ] Frontend 연결 복구 테스트
   - [ ] Backend API 연결 테스트
   - [ ] 로그인 플로우 검증
   - [ ] 카드 완료 + 게임화 검증
   - [ ] Q&A 성능 측정

3. **문서 정리**:
   - [ ] 흩어진 MD 파일을 `docs/` 하위로 통합
   - [ ] 중복 내용 병합
   - [ ] 불필요한 파일 제거

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025년 12월 2일  
**작성자**: AI Copilot  
**검토 상태**: ✅ 코드 수정 완료 / ⏳ 테스트 대기
