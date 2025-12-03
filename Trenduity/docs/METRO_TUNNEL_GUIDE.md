# Metro 터널 연결 가이드

## 📍 현재 상태 (2025-12-02)

**활성 솔루션**: ngrok  
**이유**: Cloudflare DNS 전파 실패 (6시간+ 대기)  
**상태**: Cloudflare Tunnel은 작동 중이나 DNS 레코드가 활성화 안됨

---

## 🚀 ngrok 사용법 (현재)

### 1. ngrok 시작
```powershell
cd C:\Users\songb\ngrok
.\ngrok.exe http 8081
```

### 2. URL 확인
터미널에서 다음과 같은 줄을 찾으세요:
```
Forwarding: https://xxxx-xxxx.ngrok-free.app -> http://localhost:8081
```

### 3. 앱 연결
Development Build 앱에서:
1. "Enter URL manually" 선택
2. `https://xxxx-xxxx.ngrok-free.app` 입력
3. "Connect" 탭

### 4. 주의사항
- ⚠️ ngrok URL은 재시작 시마다 변경됨
- ⚠️ 무료 버전은 세션 제한 있음 (2시간)
- ✅ 즉시 작동, 설정 불필요
- ✅ HTTPS 자동 제공

---

## 🔄 Cloudflare Tunnel 복귀 방법 (추후)

### 전제조건
Cloudflare DNS가 전파되면 (`metro.trenduity.app`이 해결되면)

### 1. Cloudflare Tunnel 상태 확인
```powershell
# 터널 프로세스 확인
Get-Process cloudflared -ErrorAction SilentlyContinue

# 없으면 재시작
cd C:\Users\songb\.cloudflared
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel run trenduity-metro"
```

### 2. DNS 전파 확인
```powershell
# 3개 DNS 서버 확인
Resolve-DnsName -Name metro.trenduity.app
Resolve-DnsName -Name metro.trenduity.app -Server 8.8.8.8
Resolve-DnsName -Name metro.trenduity.app -Server 1.1.1.1
```

### 3. 앱 URL 변경
Development Build 앱에서:
- 기존: `https://xxxx.ngrok-free.app`
- 변경: `https://metro.trenduity.app`

### 4. ngrok 중단
```powershell
# ngrok 프로세스 찾기
Get-Process | Where-Object { $_.ProcessName -like "*ngrok*" }

# 중단 (PID 확인 후)
Stop-Process -Name ngrok -Force
```

---

## 🔧 Cloudflare Tunnel 정보

### Tunnel 상세
- **Tunnel ID**: `e66c75af-f76a-4889-9f36-2e04ad681859`
- **Domain**: `metro.trenduity.app`
- **Target**: `http://localhost:8081`
- **Config**: `C:\Users\songb\.cloudflared\config.yml`

### CNAME 레코드 (Cloudflare Dashboard)
```
Type:   CNAME
Name:   metro
Target: e66c75af-f76a-4889-9f36-2e04ad681859.cfargotunnel.com
Proxy:  DNS only (회색 구름)
TTL:    Auto
```

### Tunnel 실행 명령어
```powershell
# 방법 1: 백그라운드 실행
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel run trenduity-metro"

# 방법 2: 직접 실행 (로그 확인)
cloudflared tunnel run trenduity-metro
```

### Tunnel 로그 확인
```powershell
# 프로세스 상태
Get-Process cloudflared | Select-Object Id, CPU, WorkingSet

# 연결 상태 (4개 연결 확인)
# 로그에서 "Registered tunnel connection" 찾기
```

---

## 🐛 문제 해결

### ngrok 문제

#### "command not found"
```powershell
# ngrok 경로 확인
Test-Path C:\Users\songb\ngrok\ngrok.exe

# 없으면 재설치
# (설치 스크립트 참조)
```

#### "failed to start tunnel"
```powershell
# Metro 실행 확인
Get-NetTCPConnection -LocalPort 8081 -State Listen

# 없으면 Metro 시작
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
npm start -- --dev-client
```

#### URL 변경됨
- 정상 동작 (ngrok 특성)
- 새 URL을 앱에 다시 입력

### Cloudflare Tunnel 문제

#### Tunnel 실행 안됨
```powershell
# 프로세스 확인
Get-Process cloudflared -ErrorAction SilentlyContinue

# 없으면 재시작 (위 명령어 참조)
```

#### DNS 전파 안됨
- **현재 상태**: 재생성 후에도 5분간 전파 실패
- **권장**: ngrok 사용 지속
- **대안**: Cloudflare 지원팀 문의

#### Metro 연결 실패
```powershell
# Metro 포트 확인
Get-NetTCPConnection -LocalPort 8081

# 재시작 필요 시
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
npm start -- --dev-client
```

---

## 📊 비교표

| 항목 | ngrok | Cloudflare Tunnel |
|------|-------|-------------------|
| **설정 시간** | 1분 | 완료 (DNS만 대기) |
| **안정성** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **URL 고정** | ❌ 재시작마다 변경 | ✅ 고정 (metro.trenduity.app) |
| **세션 제한** | ⚠️ 2시간 (무료) | ✅ 무제한 |
| **HTTPS** | ✅ 자동 | ✅ 자동 |
| **현재 상태** | ✅ 작동 중 | ⏳ DNS 전파 대기 |

---

## ✅ 체크리스트

### ngrok 사용 중
- [ ] ngrok 실행 (`.\ngrok.exe http 8081`)
- [ ] HTTPS URL 확인 (`https://xxxx.ngrok-free.app`)
- [ ] Metro 실행 중 (Port 8081)
- [ ] 앱에 URL 입력 완료
- [ ] 앱 연결 성공

### Cloudflare 복귀 시
- [ ] DNS 전파 확인 (3개 서버)
- [ ] Cloudflare Tunnel 실행 중
- [ ] Metro 실행 중
- [ ] 앱에 새 URL 입력 (`metro.trenduity.app`)
- [ ] 앱 연결 성공
- [ ] ngrok 중단

---

## 📝 이력

### 2025-12-02 02:30
- **결정**: ngrok으로 전환
- **이유**: Cloudflare DNS 재생성 후에도 5분간 전파 실패
- **총 대기 시간**: 6시간+
- **Cloudflare Tunnel 상태**: 작동 중 (4 QUIC 연결)
- **DNS 레코드 상태**: 존재하나 비활성

### 2025-12-01 18:48 (추정)
- **설정**: Cloudflare Named Tunnel 생성
- **CNAME**: metro.trenduity.app 레코드 생성
- **문제 발생**: DNS 전파 시작 안됨

### 2025-12-01 00:30 (추정)
- **시도**: Proxy 설정을 DNS only로 변경
- **결과**: 70분 후에도 전파 실패

### 2025-12-02 02:25
- **시도**: CNAME 레코드 삭제 및 재생성
- **결과**: 5분 후에도 전파 실패
- **Analytics**: metro.trenduity.app 쿼리 0건 (다른 서브도메인은 정상)

---

## 🔗 관련 파일

- `.env.metro`: Metro URL 환경 변수 템플릿
- `C:\Users\songb\.cloudflared\config.yml`: Cloudflare Tunnel 설정
- `C:\Users\songb\ngrok\ngrok.exe`: ngrok 실행 파일
- `docs/USB_TETHERING_SETUP.md`: USB 테더링 가이드 (하드웨어 제약으로 실패)

---

## 💡 추천 사항

**현재 (2025-12-02):**
- ✅ ngrok 사용 (즉시 작동, OAuth 테스트 시작 가능)
- ⏸️ Cloudflare DNS 자연 전파 대기 (백그라운드)
- 📊 주기적 DNS 확인 (하루 1-2회)

**추후 (DNS 전파 시):**
- 🔄 Cloudflare Tunnel로 복귀 (URL 고정, 무제한)
- 🗑️ ngrok 중단

**장기 (프로덕션):**
- 🚀 Vercel/Netlify 배포 (정적 웹)
- ☁️ Railway/Render 배포 (BFF FastAPI)
- 📱 EAS Build + App Store 배포
