# Render 배포 빠른 시작 가이드

## 🚀 1단계: Render 계정 생성 (1분)

1. 브라우저에서 https://render.com 열기
2. **"Get Started for Free"** 클릭
3. **"Sign in with GitHub"** 클릭하여 로그인

---

## 📦 2단계: BFF API 배포 (5분)

### 방법 A: Blueprint로 자동 배포 (권장)

1. Render Dashboard → **"New +"** → **"Blueprint"**
2. GitHub 저장소 **"Trenduity"** 선택
3. **"Apply"** 클릭

`render.yaml` 파일을 자동으로 감지하여 배포 시작!

### 방법 B: 수동 Web Service 생성

1. Render Dashboard → **"New +"** → **"Web Service"**
2. **"Build and deploy from a Git repository"** 선택
3. GitHub 저장소 **"Trenduity"** 연결

**설정값 입력**:
```
Name: trenduity-bff
Region: Singapore
Branch: main
Root Directory: services/bff-fastapi
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Instance Type: Free
```

---

## 🔐 3단계: 환경 변수 설정 (3분)

Render Dashboard의 해당 서비스 → **"Environment"** 탭:

**추가할 환경 변수**:

| Key | Value | 어디서 확인? |
|-----|-------|-------------|
| `SUPABASE_URL` | `https://onnthandrqutdmvwnilf.supabase.co` | 이미 알고 있음 |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | `.env` 파일 또는 Supabase 대시보드 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase → Settings → API → service_role |
| `ENV` | `production` | 그대로 입력 |
| `PYTHON_VERSION` | `3.11.0` | 그대로 입력 |

**Supabase 키 찾기**:
```powershell
# 로컬 .env 파일에서 확인
Get-Content c:\AIDEN_PROJECT\Trenduity\Trenduity\.env | Select-String "SUPABASE"
```

또는:
1. https://app.supabase.com 로그인
2. 프로젝트 선택 (onnthandrqutdmvwnilf)
3. Settings → API
4. **anon public** 키와 **service_role** 키 복사

---

## ✅ 4단계: 배포 확인 (2분)

### 빌드 로그 확인
1. Render Dashboard → 서비스 선택
2. **"Logs"** 탭에서 실시간 로그 확인
3. "Application startup complete" 메시지 대기

### 배포 URL 메모
1. **"Settings"** 탭 → 상단에서 URL 확인
   ```
   예: https://trenduity-bff.onrender.com
   ```
2. 이 URL을 메모장에 저장 (나중에 필요)

### 헬스 체크 테스트
```powershell
# PowerShell에서 테스트
Invoke-WebRequest -Uri "https://trenduity-bff.onrender.com/health"
```

예상 응답:
```json
{
  "status": "healthy",
  "environment": "production"
}
```

---

## 🌐 5단계: Vercel에 Web 배포 (3분)

1. https://vercel.com 로그인 (GitHub 계정)
2. **"Add New..." → "Project"**
3. Trenduity 저장소 선택
4. **"Configure Project"**:
   - Framework Preset: **Next.js** (자동 감지)
   - Root Directory: **apps/web-next**
5. **Environment Variables** 추가:
   ```
   NEXT_PUBLIC_BFF_API_URL=https://trenduity-bff.onrender.com
   NEXT_PUBLIC_SUPABASE_URL=https://onnthandrqutdmvwnilf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon 키>
   ```
6. **"Deploy"** 클릭

---

## 📱 6단계: Mobile App 설정 업데이트

로컬 파일 수정:

```powershell
# .env 파일 열기
code c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo\.env
```

**변경할 내용**:
```env
# Supabase (변경 없음)
EXPO_PUBLIC_SUPABASE_URL=https://onnthandrqutdmvwnilf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# BFF URL (Render URL로 변경!)
EXPO_PUBLIC_BFF_API_URL=https://trenduity-bff.onrender.com

# 환경
ENV=production
```

---

## 🎯 7단계: 모바일 앱 테스트

```powershell
# Expo 서버 재시작 (캐시 클리어)
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
npm start -- --clear
```

1. 폰에서 Expo Go 앱 열기
2. QR 코드 스캔
3. 앱 로드 확인
4. **홈 화면에서 카드 로딩 테스트**
5. **퀴즈 제출 테스트**

---

## 🐛 트러블슈팅

### ❌ "Build failed"

**증상**: Render에서 빌드 실패

**해결**:
1. Logs 탭에서 에러 메시지 확인
2. Python 버전 문제:
   ```
   Environment → PYTHON_VERSION → 3.11.0
   ```
3. 의존성 문제:
   ```powershell
   # 로컬에서 테스트
   cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
   pip install -r requirements.txt
   ```

### ⏱️ "콜드 스타트 느림"

**증상**: 첫 요청이 30초 이상 걸림

**원인**: Render 무료 플랜은 15분 후 슬립 모드

**해결책 1: UptimeRobot (무료)**
1. https://uptimerobot.com 가입
2. "Add New Monitor":
   - Monitor Type: HTTP(s)
   - URL: `https://trenduity-bff.onrender.com/health`
   - Monitoring Interval: **5 minutes**
3. "Create Monitor"

**해결책 2: Render 유료 플랜 ($7/월)**
- 슬립 모드 없음
- 더 빠른 응답

### 🔒 "Invalid API key"

**증상**: Supabase 연결 실패

**해결**:
1. Render Dashboard → Environment 탭
2. `SUPABASE_SERVICE_ROLE_KEY` 다시 확인
3. Supabase 대시보드에서 키 재복사

### 📱 Mobile "Network request failed"

**증상**: 모바일 앱에서 API 호출 실패

**해결**:
1. `.env` 파일 URL 확인:
   ```powershell
   Get-Content c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo\.env
   ```
2. Render URL 정확한지 확인 (https:// 포함)
3. Expo 서버 완전히 재시작:
   ```powershell
   # Ctrl+C로 종료 후
   npm start -- --clear
   ```

---

## ✅ 최종 체크리스트

### BFF API (Render)
- [ ] Render 계정 생성
- [ ] Web Service 생성 (Blueprint 또는 수동)
- [ ] 환경 변수 5개 설정 (SUPABASE 키들)
- [ ] 빌드 성공 확인 (Logs 탭)
- [ ] 배포 URL 메모
- [ ] 헬스 체크 통과 (`/health`)

### Web Dashboard (Vercel)
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 3개 설정
- [ ] 빌드 성공
- [ ] 웹사이트 접속 확인

### Mobile App
- [ ] `.env` 파일에 Render URL 설정
- [ ] Expo 서버 재시작 (`--clear`)
- [ ] 폰에서 QR 스캔
- [ ] 홈 화면 로딩 확인
- [ ] 카드 데이터 표시 확인
- [ ] 퀴즈 제출 테스트

### 선택사항
- [ ] UptimeRobot 설정 (슬립 방지)
- [ ] 커스텀 도메인 연결 (Render + Vercel)

---

## 🎉 완료 후

배포 성공 시:
- **BFF API**: https://trenduity-bff.onrender.com
- **Web Dashboard**: https://trenduity.vercel.app
- **Mobile App**: 폰에서 정상 작동

**총 소요 시간**: 약 15-20분  
**총 비용**: $0 (완전 무료)

---

## 📞 다음 단계

1. **전체 플로우 테스트**: 모바일 → BFF → Supabase
2. **성능 모니터링**: Render Dashboard에서 응답 시간 확인
3. **에러 추적**: Logs 탭에서 에러 발생 시 즉시 확인
4. **필요 시 업그레이드**: 실사용자 증가 시 Render Starter ($7/월) 고려

---

**문제 발생 시**: 
- Render Logs 탭 확인
- `docs/RENDER_DEPLOYMENT.md` 상세 가이드 참조
- Supabase Dashboard에서 RLS 정책 확인
