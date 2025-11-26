# Render.com 배포 가이드 (무료 대안)

## 🎯 Railway 대신 Render 사용하기

Render.com은 Railway와 유사하지만 **완전 무료 플랜**을 제공합니다.

### 제한사항:
- 서비스가 15분간 요청이 없으면 슬립 모드
- 첫 요청 시 콜드 스타트 (30초-1분 지연)
- 월 750시간 무료 실행 시간

---

## 📋 1단계: Render 계정 생성

1. https://render.com 방문
2. **"Get Started for Free"** 클릭
3. GitHub 계정으로 로그인

---

## 🚀 2단계: BFF API 배포

### 2.1 새 Web Service 생성
1. Dashboard → **"New +"** → **"Web Service"**
2. GitHub 저장소 연결 (Trenduity)
3. 다음 설정 입력:

### 2.2 기본 설정
```
Name: trenduity-bff
Region: Singapore (또는 가장 가까운 지역)
Branch: main
Root Directory: services/bff-fastapi
Runtime: Python 3
```

### 2.3 빌드 설정
```
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

⚠️ **중요**: Render는 `$PORT` 환경 변수를 자동 할당하므로 8002 고정 대신 `$PORT` 사용

### 2.4 환경 변수 추가
**"Advanced"** → **"Add Environment Variable"** 클릭:

```env
SUPABASE_URL=https://onnthandrqutdmvwnilf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<Supabase에서 확인>
ENV=production
PYTHON_VERSION=3.11
```

### 2.5 무료 플랜 선택
- **Instance Type**: Free
- **Create Web Service** 클릭

### 2.6 배포 URL 확인
빌드 완료 후 생성된 URL 메모:
```
https://trenduity-bff.onrender.com
```

---

## 🌐 3단계: Vercel에 Web 배포 (무료)

Vercel은 여전히 무료 플랜이 우수하므로 그대로 사용:

1. https://vercel.com → GitHub 로그인
2. "New Project" → Trenduity 선택
3. **Root Directory**: `apps/web-next`
4. 환경 변수:
   ```env
   NEXT_PUBLIC_BFF_API_URL=https://trenduity-bff.onrender.com
   NEXT_PUBLIC_SUPABASE_URL=https://onnthandrqutdmvwnilf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<키>
   ```
5. Deploy

---

## 📱 4단계: Mobile App .env 업데이트

```powershell
# apps/mobile-expo/.env 수정
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://onnthandrqutdmvwnilf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_BFF_API_URL=https://trenduity-bff.onrender.com
ENV=production
```

---

## 🔧 Render 전용 수정사항

Render는 `$PORT` 환경 변수를 사용하므로 BFF 시작 명령 수정 필요:

### 파일: `services/bff-fastapi/app/main.py`

기존 코드가 있다면 포트를 동적으로 받도록 수정:

```python
import os

# ... 기존 코드 ...

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8002))  # Render는 PORT 사용
    uvicorn.run(app, host="0.0.0.0", port=port)
```

---

## ⚡ 콜드 스타트 문제 해결

Render 무료 플랜은 15분 후 슬립 모드로 전환됩니다.

### 해결책 1: Uptime 모니터링 (무료)
UptimeRobot으로 5분마다 핑 전송:

1. https://uptimerobot.com 가입
2. "Add New Monitor" 
3. URL: `https://trenduity-bff.onrender.com/health`
4. Interval: 5분

### 해결책 2: Render 유료 플랜 ($7/월)
- 슬립 모드 없음
- 더 빠른 응답 속도

---

## 💰 비용 비교

| 서비스 | 무료 플랜 | 유료 플랜 |
|--------|----------|----------|
| **Railway** | ❌ 평가판 만료 | $5/월 |
| **Render** | ✅ 무료 (슬립 모드) | $7/월 |
| **Fly.io** | ✅ 무료 (제한적) | $1.94/월~ |
| **Vercel** | ✅ 무료 | $20/월 |

---

## 🎯 권장 사항

### 테스트 단계 (지금)
**Render 무료 플랜** 사용:
- 비용: $0
- 단점: 콜드 스타트 30초
- UptimeRobot으로 슬립 방지

### 프로덕션 단계 (나중)
**Railway Hobby ($5/월)** 또는 **Render Starter ($7/월)**:
- 24/7 가동
- 콜드 스타트 없음
- 더 나은 성능

---

## 🚨 트러블슈팅

### Render 빌드 실패
**증상**: "Build failed"

**해결**:
1. `requirements.txt` 확인
2. Python 버전 명시:
   ```
   Environment Variables → PYTHON_VERSION=3.11
   ```

### PORT 에러
**증상**: "Address already in use"

**해결**:
Start Command를 다음으로 변경:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 슬립 모드로 인한 타임아웃
**증상**: 첫 요청이 30초 이상 걸림

**해결**:
- UptimeRobot 설정 (위 참조)
- 또는 유료 플랜 업그레이드

---

## ✅ 체크리스트

- [ ] Render 계정 생성
- [ ] BFF Web Service 생성
- [ ] 환경 변수 설정 (SUPABASE 키들)
- [ ] 빌드 성공 확인
- [ ] 배포 URL 메모
- [ ] Vercel에 Web 배포
- [ ] Mobile .env 업데이트
- [ ] UptimeRobot 설정 (선택사항)
- [ ] 전체 플로우 테스트

---

## 📞 다음 단계

1. **지금**: Render 무료로 시작
2. **1-2주 후**: 사용자 피드백 수집
3. **필요시**: Render $7/월 또는 Railway $5/월 업그레이드

**예상 소요 시간**: 15-20분  
**예상 비용**: $0 (완전 무료)
