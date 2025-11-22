# 웹 콘솔 Dashboard 테스트 가이드

## ✅ 완료된 작업

1. **API 클라이언트 유틸** (`apps/web-next/src/utils/apiClient.ts`)
   - BFF 엔드포인트 호출 함수 (apiGet, apiPost)
   - Envelope 패턴 처리
   - 한국어 에러 메시지

2. **SWR 의존성** (`apps/web-next/package.json`)
   - swr ^2.2.4 추가

3. **Dashboard 페이지** (`apps/web-next/app/page.tsx`)
   - /v1/family/members BFF API 연동
   - 로딩/에러 상태 처리
   - 마지막 활동 시간 포맷팅
   - 빈 상태 처리

4. **Supabase 클라이언트** (`apps/web-next/lib/supabase.ts`)
   - 환경변수 검증 추가
   - RLS 설명 주석

5. **환경 변수 설정**
   - `.env` (루트)
   - `.env.local` (web-next)

## 🚀 테스트 방법

### 1단계: Docker 서비스 시작

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\infra\dev
docker-compose up -d
```

**확인:**
```powershell
docker ps
```
`senior-learning-postgres`와 `senior-learning-redis` 컨테이너가 실행 중이어야 함

### 2단계: 데이터베이스 스키마 적용

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\scripts
# PostgreSQL 클라이언트 (psql 또는 DBeaver 등) 사용
# supabase_schema.sql 실행
```

또는 Python 시드 스크립트:
```powershell
python seed_data.py
```

### 3단계: BFF 서버 시작

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**확인:**
```powershell
curl http://localhost:8000/health
```

### 4단계: Supabase 프로젝트 설정 (필수!)

**중요**: 현재 로컬 Docker에는 Supabase가 없으므로 실제 Supabase 프로젝트 필요

1. https://cloud.supabase.com 접속
2. 새 프로젝트 생성
3. Settings → API에서 키 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

4. 환경 변수 업데이트:
   - `Trenduity\.env`
   - `Trenduity\apps\web-next\.env.local`

5. Supabase SQL Editor에서 `scripts/supabase_schema.sql` 실행

### 5단계: 웹 콘솔 의존성 설치 및 실행

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\web-next
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 📊 예상 결과

### 성공 케이스

1. **빈 상태** (family_links 테이블이 비어있을 때)
   - "관리 중인 회원: 0"
   - "연동된 가족 멤버가 없어요."

2. **데이터 있음** (family_links + users 데이터 존재)
   - 멤버 목록 표시
   - 이름, 권한, 마지막 활동 시간

### 에러 케이스

1. **BFF 서버 미실행**
   - 빨간 에러 메시지: "네트워크 연결을 확인해 주세요."

2. **Supabase 키 미설정**
   - 콘솔 에러: "NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다."

3. **BFF 엔드포인트 에러**
   - 빨간 에러 메시지: API에서 반환한 한국어 메시지

## 🔍 디버깅

### 브라우저 개발자 도구 (F12)

**Network 탭:**
- `v1/family/members` 요청 확인
- 응답 형식: `{ ok: true, data: { members: [...] } }`

**Console 탭:**
- SWR 에러 로그 확인
- API 호출 에러 확인

### BFF 로그 확인

터미널에서 FastAPI 로그:
```
INFO:     127.0.0.1:xxxx - "GET /v1/family/members HTTP/1.1" 200 OK
```

## 🎯 다음 단계

Dashboard가 정상 작동하면:

1. **Members 상세 페이지** (`apps/web-next/app/members/[id]/page.tsx`)
   - 개별 멤버 활동 내역
   - 카드 완료 통계
   - 포인트/배지 현황

2. **Redis 캐싱 구현**
   - BFF의 `/v1/family/members` 응답 캐싱
   - 30초 TTL

3. **실시간 알림**
   - Supabase Realtime 구독
   - 멤버 활동 시 자동 갱신

## ⚠️ 알려진 제약사항

- **Supabase 프로젝트 필수**: 로컬 Docker에는 Supabase 없음
- **Auth 미구현**: 현재 인증 없이 BFF 직접 호출 (MVP 단계)
- **통계 API 없음**: "오늘 학습 완료", "미확인 알림"은 TODO 상태
