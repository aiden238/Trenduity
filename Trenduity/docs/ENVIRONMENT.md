# 환경 변수 가이드

## 📋 개요

Trenduity 프로젝트는 모노레포 구조로, 각 앱/서비스마다 환경 변수가 필요합니다.

## 🗂️ 환경 변수 파일 위치

### 1. 루트 `.env` (전역 설정)
- **위치**: `Trenduity/.env`
- **용도**: 전체 프로젝트 공통 설정 (스크립트, 시드 데이터 등)
- **템플릿**: `.env.example`

### 2. BFF FastAPI `.env`
- **위치**: `Trenduity/services/bff-fastapi/.env`
- **용도**: BFF 서버 설정 (Supabase, Redis, CORS 등)
- **템플릿**: `services/bff-fastapi/.env.example`

### 3. Next.js 웹 `.env.local`
- **위치**: `Trenduity/apps/web-next/.env.local`
- **용도**: 웹 대시보드 설정 (BFF URL, Supabase 공개 키)
- **템플릿**: `apps/web-next/.env.example`

### 4. Expo 모바일 `.env`
- **위치**: `Trenduity/apps/mobile-expo/.env`
- **용도**: 모바일 앱 설정 (BFF URL, Supabase 공개 키)
- **템플릿**: `apps/mobile-expo/.env.example`

---

## 🔑 환경 변수 상세 설명

### Supabase 설정

| 변수명 | 용도 | 어디서 사용? | 필수 |
|--------|------|--------------|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL | 모든 곳 | ✅ |
| `SUPABASE_ANON_KEY` | 공개 키 (RLS 적용됨) | 클라이언트 (웹/모바일) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | 관리자 키 (RLS 우회) | **BFF만!** | ✅ |

**⚠️ 중요**: `SERVICE_ROLE_KEY`는 절대 클라이언트에 노출하면 안 됩니다!

**Supabase 키 확인 방법**:
1. Supabase 대시보드 접속 (https://supabase.com/dashboard)
2. 프로젝트 선택
3. Settings → API 메뉴
4. URL과 키 복사

---

### Redis 설정

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `REDIS_URL` | `redis://localhost:6379/0` | Redis 서버 연결 URL |
| `REDIS_PASSWORD` | (없음) | Redis 비밀번호 (프로덕션 환경) |

**로컬 개발용 Redis 실행**:
```powershell
# Docker로 Redis 실행
docker run -d -p 6379:6379 redis:7-alpine
```

---

### BFF API 설정

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `BFF_API_URL` | `http://localhost:8000` | BFF 서버 URL |
| `PORT` | `8000` | BFF 서버 포트 |
| `CORS_ORIGINS` | `http://localhost:3000,...` | CORS 허용 오리진 |

---

### JWT 설정

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `JWT_SECRET` | `dev-secret-change-in-production` | JWT 서명용 시크릿 (최소 32자) |
| `JWT_EXPIRATION` | `3600` | JWT 토큰 만료 시간 (초) |

**⚠️ 프로덕션 배포 시 반드시 변경!**

**JWT 시크릿 생성 방법**:
```powershell
# PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

### 외부 API (선택사항)

| 변수명 | 용도 | 필수 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 키 (AI 요약 기능) | ❌ |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI 엔드포인트 | ❌ |
| `SENTRY_DSN` | Sentry 에러 추적 | ❌ |

---

### 기능 플래그

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `FEATURE_AI_ENABLED` | `true` | AI 기능 활성화 |
| `FEATURE_VOICE_ENABLED` | `true` | 음성 인식 활성화 |
| `FEATURE_COMMUNITY_ENABLED` | `true` | 커뮤니티 Q&A 활성화 |
| `FEATURE_FAMILY_ENABLED` | `true` | 가족 연동 활성화 |

---

## 🚀 초기 설정 가이드

### 1. 템플릿 파일 복사

```powershell
# 루트 .env
Copy-Item .env.example .env

# BFF .env
Copy-Item services\bff-fastapi\.env.example services\bff-fastapi\.env

# Next.js .env.local
Copy-Item apps\web-next\.env.example apps\web-next\.env.local

# Expo .env
Copy-Item apps\mobile-expo\.env.example apps\mobile-expo\.env
```

### 2. Supabase 키 입력

각 `.env` 파일에 Supabase 키를 입력합니다:

```env
# Supabase 대시보드에서 복사한 값 입력
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...  # BFF만!
```

### 3. 환경 변수 검증

BFF 서버를 시작하면 자동으로 환경 변수를 검증합니다:

```powershell
cd services\bff-fastapi
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**성공 시**:
```
✅ 환경 변수 검증 완료 (ENV=development)
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**실패 시**:
```
❌ 필수 환경 변수가 설정되지 않았습니다:
   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

💡 해결 방법:
   1. .env.example 파일을 복사하여 .env 파일 생성
   2. .env 파일에 실제 값 입력
   3. BFF 서버 재시작
```

---

## 🔍 환경별 설정 차이

### 개발 환경 (Development)

```env
ENV=development
DEBUG=true
LOG_LEVEL=DEBUG
SUPABASE_URL=http://localhost:54321  # 로컬 Supabase (선택)
REDIS_URL=redis://localhost:6379
```

### 스테이징 환경 (Staging)

```env
ENV=staging
DEBUG=false
LOG_LEVEL=INFO
SUPABASE_URL=https://staging-project.supabase.co
REDIS_URL=redis://staging-redis.cloud:6379
JWT_SECRET=<강력한 랜덤 시크릿>
```

### 프로덕션 환경 (Production)

```env
ENV=production
DEBUG=false
LOG_LEVEL=WARNING
SUPABASE_URL=https://prod-project.supabase.co
REDIS_URL=redis://prod-redis.cloud:6379
JWT_SECRET=<매우 강력한 랜덤 시크릿>
SENTRY_DSN=https://...@sentry.io/...
FEATURE_AI_ENABLED=true
```

---

## ⚠️ 보안 주의사항

### 절대 Git에 커밋하지 말 것

```gitignore
# .gitignore (이미 설정됨)
.env
.env.local
.env.*.local
services/bff-fastapi/.env
apps/web-next/.env.local
apps/mobile-expo/.env
```

### 클라이언트 노출 금지 키

- ❌ `SUPABASE_SERVICE_ROLE_KEY` → BFF에서만 사용
- ❌ `JWT_SECRET` → 서버에서만 사용
- ❌ `REDIS_PASSWORD` → 서버에서만 사용
- ✅ `SUPABASE_ANON_KEY` → 클라이언트 사용 가능 (RLS 보호)

### 프로덕션 배포 시 반드시 변경

- `JWT_SECRET`: dev-secret → 강력한 랜덤 문자열
- `DEBUG`: true → false
- `LOG_LEVEL`: DEBUG → WARNING or ERROR

---

## 🔧 문제 해결

### "SUPABASE_URL이 설정되지 않았습니다"

**원인**: `.env` 파일이 없거나 변수가 비어있음

**해결**:
```powershell
# 1. .env.example 복사
Copy-Item services\bff-fastapi\.env.example services\bff-fastapi\.env

# 2. .env 파일 열어서 실제 값 입력
notepad services\bff-fastapi\.env

# 3. BFF 재시작
```

### "CORS policy 에러"

**원인**: `CORS_ORIGINS`에 클라이언트 URL이 없음

**해결**:
```env
# BFF .env
CORS_ORIGINS=http://localhost:3000,http://localhost:19006
```

### "Redis connection refused"

**원인**: Redis 서버가 실행 중이지 않음

**해결**:
```powershell
# Docker로 Redis 실행
docker run -d -p 6379:6379 redis:7-alpine

# 또는 로컬 Redis 설치
# https://redis.io/download
```

---

## 📚 추가 자료

- **Supabase 문서**: https://supabase.com/docs
- **Redis 문서**: https://redis.io/docs
- **FastAPI 환경 변수**: https://fastapi.tiangolo.com/advanced/settings/
- **Next.js 환경 변수**: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables

---

**마지막 업데이트**: 2025-11-18  
**관련 문서**: `README.md`, `SCAFFOLD/01-workspace-setup.md`
