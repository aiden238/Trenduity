# Render 환경 변수 - 복사해서 사용하세요

## 🔐 Render Dashboard에 입력할 환경 변수

### 1. SUPABASE_URL
```
https://onnthandrqutdmvwnilf.supabase.co
```

### 2. SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubnRoYW5kcnF1dGRtdnduaWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MjA4NjAsImV4cCI6MjA0NzM5Njg2MH0.W6xQGXBaVwWFSgLJ-R0zDJUE-Y4PJo_dDBEcWKmw_oY
```

### 3. SUPABASE_SERVICE_ROLE_KEY
⚠️ **중요**: 이 키는 매우 민감한 정보입니다!

Supabase 대시보드에서 직접 복사하세요:
1. https://app.supabase.com 로그인
2. 프로젝트 선택 (onnthandrqutdmvwnilf)
3. Settings → API → service_role key (secret) 복사

### 4. ENV
```
production
```

### 5. PYTHON_VERSION
```
3.11.0
```

---

## 📋 Render 설정 체크리스트

### Web Service 생성 시
- [ ] Name: `trenduity-bff`
- [ ] Region: `Singapore`
- [ ] Branch: `main`
- [ ] Root Directory: `services/bff-fastapi`
- [ ] Runtime: `Python 3`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Instance Type: `Free`

### Environment Variables 입력
- [ ] SUPABASE_URL (위 값 복사)
- [ ] SUPABASE_ANON_KEY (위 값 복사)
- [ ] SUPABASE_SERVICE_ROLE_KEY (Supabase에서 복사)
- [ ] ENV = production
- [ ] PYTHON_VERSION = 3.11.0

---

## ✅ 배포 성공 확인

배포 완료 후 테스트:

```powershell
# Health check (Render URL로 변경)
Invoke-WebRequest -Uri "https://trenduity-bff.onrender.com/health"

# API 테스트
Invoke-WebRequest -Uri "https://trenduity-bff.onrender.com/v1/cards/today" -Headers @{"Authorization"="Bearer test-jwt-token-for-senior-user"}
```

예상 응답: 200 OK

---

**다음 파일 참조**: 
- 상세 가이드: `RENDER_QUICKSTART.md`
- 전체 문서: `docs/RENDER_DEPLOYMENT.md`
