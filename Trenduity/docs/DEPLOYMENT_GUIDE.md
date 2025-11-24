# Trenduity 클라우드 배포 가이드

## 📋 개요
Trenduity 프로젝트를 클라우드 환경에 배포하기 위한 단계별 가이드입니다.

- **BFF API**: Railway (FastAPI)
- **Web Dashboard**: Vercel (Next.js)
- **Mobile App**: Expo Application Services (EAS)
- **Database**: Supabase (이미 클라우드 호스팅 중)

---

## 🚀 1단계: BFF API를 Railway에 배포

### 1.1 Railway 계정 생성
1. https://railway.app 방문
2. GitHub 계정으로 로그인
3. 무료 플랜으로 시작 (매월 $5 크레딧 제공)

### 1.2 새 프로젝트 생성
1. Railway 대시보드에서 **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. Trenduity 저장소 연결 및 선택
4. **Root Directory** 설정: `services/bff-fastapi`

### 1.3 환경 변수 설정
Railway 대시보드에서 다음 환경 변수 추가:

```env
# Supabase 연결 정보
SUPABASE_URL=https://onnthandrqutdmvwnilf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<서비스 롤 키 - Supabase 대시보드에서 확인>

# 환경 설정
ENV=production

# Redis (선택사항 - Railway에서 Redis 플러그인 추가 시)
REDIS_URL=${{REDIS_URL}}
```

### 1.4 배포 확인
1. Railway가 자동으로 Dockerfile 감지 및 빌드 시작
2. 배포 로그에서 에러 확인
3. **Settings** → **Generate Domain**으로 공개 URL 생성
4. 생성된 URL 메모 (예: `https://trenduity-bff-production.up.railway.app`)

### 1.5 헬스 체크 테스트
```powershell
# PowerShell에서 테스트
Invoke-WebRequest -Uri "https://trenduity-bff-production.up.railway.app/health"
```

예상 응답:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-17T10:30:00Z"
}
```

---

## 🌐 2단계: Web Dashboard를 Vercel에 배포

### 2.1 Vercel 계정 생성
1. https://vercel.com 방문
2. GitHub 계정으로 로그인

### 2.2 프로젝트 임포트
1. **"Add New..." → "Project"** 클릭
2. Trenduity 저장소 선택
3. **Framework Preset**: Next.js 자동 감지
4. **Root Directory**: `apps/web-next`

### 2.3 환경 변수 설정
Vercel 프로젝트 설정에서 다음 환경 변수 추가:

```env
# BFF API URL (Railway에서 생성된 URL)
NEXT_PUBLIC_BFF_API_URL=https://trenduity-bff-production.up.railway.app

# Supabase 연결 정보
NEXT_PUBLIC_SUPABASE_URL=https://onnthandrqutdmvwnilf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.4 배포 확인
1. **"Deploy"** 클릭
2. 빌드 로그 확인
3. 생성된 URL 메모 (예: `https://trenduity.vercel.app`)

---

## 📱 3단계: Mobile App 환경 변수 업데이트

### 3.1 .env 파일 수정
`apps/mobile-expo/.env` 파일을 Railway URL로 업데이트:

```env
# Supabase 연결 정보 (변경 없음)
EXPO_PUBLIC_SUPABASE_URL=https://onnthandrqutdmvwnilf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# BFF API URL (Railway URL로 변경)
EXPO_PUBLIC_BFF_API_URL=https://trenduity-bff-production.up.railway.app

# 환경 설정
ENV=production
```

### 3.2 Expo 개발 서버 재시작
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
npm start -- --clear
```

### 3.3 모바일 테스트
1. Expo Go 앱에서 QR 코드 스캔
2. 홈 화면 로드 확인
3. 카드 데이터 로딩 테스트
4. 퀴즈 제출 테스트

---

## 🏗️ 4단계 (선택사항): EAS Build로 독립 실행형 앱 빌드

### 4.1 EAS CLI 설치
```powershell
npm install -g eas-cli
```

### 4.2 Expo 계정 로그인
```powershell
eas login
```

### 4.3 프로젝트 구성
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
eas build:configure
```

### 4.4 Android APK 빌드 (테스트용)
```powershell
eas build --platform android --profile preview
```

빌드 완료 후 QR 코드 또는 다운로드 링크 제공됨.

### 4.5 iOS 빌드 (Apple Developer 계정 필요)
```powershell
eas build --platform ios --profile preview
```

---

## ✅ 배포 체크리스트

### BFF API (Railway)
- [ ] Railway 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] 환경 변수 설정
- [ ] 도메인 생성
- [ ] 헬스 체크 통과 (`/health`)
- [ ] API 엔드포인트 테스트 (`/v1/cards/today`)

### Web Dashboard (Vercel)
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정 (BFF URL)
- [ ] 빌드 성공
- [ ] 웹사이트 접속 확인
- [ ] BFF API 연동 테스트

### Mobile App
- [ ] `.env` 파일에 Railway URL 설정
- [ ] Expo 서버 재시작
- [ ] 모바일에서 접속 테스트
- [ ] 카드 로딩 확인
- [ ] 퀴즈 제출 확인
- [ ] 게임화 기능 (포인트, 배지) 테스트

---

## 🐛 트러블슈팅

### Railway 빌드 실패
**증상**: "Failed to build Docker image"

**해결**:
1. `railway logs` 명령어로 에러 확인
2. `requirements.txt` 의존성 문제 확인:
   ```powershell
   cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
   pip install -r requirements.txt
   ```
3. Dockerfile 문법 오류 확인

### Vercel 빌드 실패
**증상**: "Build failed with exit code 1"

**해결**:
1. Vercel 대시보드에서 빌드 로그 확인
2. TypeScript 타입 에러:
   ```powershell
   cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\web-next
   npm run typecheck
   ```
3. 로컬에서 빌드 테스트:
   ```powershell
   npm run build
   ```

### Mobile App "Network request failed"
**증상**: 모바일 앱에서 API 호출 실패

**해결**:
1. `.env` 파일 확인 (Railway URL 정확한지)
2. Railway 서비스 상태 확인
3. CORS 설정 확인 (`services/bff-fastapi/app/main.py`):
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # 프로덕션에서는 특정 도메인만 허용
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### Supabase 연결 오류
**증상**: "Invalid API key"

**해결**:
1. Supabase 대시보드에서 키 재확인:
   - Settings → API → Project URL
   - Settings → API → anon public key
   - Settings → API → service_role key (비밀!)
2. 환경 변수 재설정 (Railway, Vercel)

---

## 📊 비용 예상

### Railway (BFF API)
- **무료 플랜**: 월 $5 크레딧 (500시간 실행)
- **예상 사용량**: 소규모 테스트 시 무료 범위 내
- **유료 시**: 월 $5-20 (트래픽에 따라)

### Vercel (Web Dashboard)
- **Hobby 플랜**: 무료
- **제한**: 100GB 대역폭/월
- **예상 사용량**: 테스트 단계에서 충분

### EAS Build (Mobile)
- **무료 플랜**: 월 30 빌드
- **유료 플랜**: $29/월 (무제한 빌드 + 우선 처리)

**총 예상 비용**: 테스트 단계에서 **$0-5/월** (대부분 무료)

---

## 🎯 다음 단계

배포 완료 후:

1. **E2E 테스트**: 모바일 → BFF → Supabase 전체 플로우 테스트
2. **성능 최적화**: API 응답 시간 모니터링
3. **에러 추적**: Sentry 등 에러 모니터링 도구 추가
4. **CI/CD 파이프라인**: GitHub Actions로 자동 배포 설정
5. **도메인 연결**: 커스텀 도메인 구매 및 연결
6. **보안 강화**: API 키 순환, 레이트 리미팅, HTTPS 강제

---

## 📞 도움말

문제가 발생하면:
1. 각 플랫폼의 로그 확인 (Railway, Vercel, Expo)
2. `docs/IMPLEMENT/` 디렉터리의 구현 가이드 참조
3. Supabase 대시보드에서 RLS 정책 확인
4. 이 문서의 트러블슈팅 섹션 참조

**현재 상태**: 
- ✅ Dockerfile 생성 완료
- ✅ .dockerignore 생성 완료
- ✅ Vercel 설정 파일 생성 완료
- ✅ Railway 설정 파일 생성 완료
- ⏳ Railway/Vercel 계정 생성 및 배포 대기 중
