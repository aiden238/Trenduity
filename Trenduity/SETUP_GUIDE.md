# Trenduity 개발 환경 설치 가이드

> 테스트 및 개발을 위한 필수 도구 설치

## 📋 필수 도구

1. **Python 3.11**
2. **Docker Desktop**
3. **Node.js 18+** (이미 설치되어 있을 가능성 높음)

---

## 1️⃣ Python 3.11 설치

### Windows 설치 방법

#### 옵션 A: 공식 설치 프로그램 (추천)

1. **다운로드**
   - https://www.python.org/downloads/
   - "Download Python 3.11.x" 버튼 클릭
   - 또는 직접 링크: https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe

2. **설치**
   ```
   ✅ "Add Python 3.11 to PATH" 체크박스 반드시 선택!
   ✅ "Install Now" 클릭
   ```

3. **설치 확인**
   ```powershell
   # 새 PowerShell 창 열기 (기존 창은 PATH 업데이트 안 됨)
   python --version
   # 출력: Python 3.11.9
   
   pip --version
   # 출력: pip 24.0 from ...
   ```

#### 옵션 B: winget (Windows 11)

```powershell
# 관리자 권한으로 PowerShell 실행
winget install Python.Python.3.11
```

#### 옵션 C: Chocolatey

```powershell
# 관리자 권한으로 PowerShell 실행
choco install python311
```

---

## 2️⃣ Docker Desktop 설치

### Windows 설치 방법

1. **다운로드**
   - https://www.docker.com/products/docker-desktop/
   - "Download for Windows" 클릭
   - 또는 직접 링크: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

2. **시스템 요구사항 확인**
   - Windows 10 64-bit: Pro, Enterprise, Education (Build 19044 이상)
   - Windows 11 64-bit
   - WSL 2 활성화 필요 (설치 프로그램이 자동으로 설정)

3. **설치**
   ```
   ✅ "Use WSL 2 instead of Hyper-V" 선택 (기본값)
   ✅ 설치 완료 후 재부팅 필요할 수 있음
   ```

4. **Docker Desktop 시작**
   - 시작 메뉴에서 "Docker Desktop" 실행
   - 첫 실행 시 WSL 2 커널 업데이트 요구될 수 있음
   - https://aka.ms/wsl2kernel 에서 다운로드

5. **설치 확인**
   ```powershell
   # 새 PowerShell 창 열기
   docker --version
   # 출력: Docker version 24.x.x, build ...
   
   docker compose version
   # 출력: Docker Compose version v2.x.x
   
   # Docker 실행 상태 확인
   docker ps
   # 출력: CONTAINER ID   IMAGE   ... (빈 테이블)
   ```

---

## 3️⃣ 설치 후 환경 설정

### Python 가상환경 생성

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi

# 가상환경 생성
python -m venv venv

# 가상환경 활성화
.\venv\Scripts\Activate.ps1

# 의존성 설치
pip install -r requirements.txt
```

**만약 PowerShell 실행 정책 오류 발생 시:**
```powershell
# 관리자 권한으로 PowerShell 실행
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Docker Compose 서비스 시작

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\infra\dev

# PostgreSQL + Redis 컨테이너 시작
docker compose up -d

# 실행 확인
docker ps
# 출력: postgres, redis 컨테이너 2개 확인

# 로그 확인
docker compose logs -f
# Ctrl+C로 종료
```

---

## 4️⃣ 설치 검증 체크리스트

모든 항목이 ✅ 되어야 테스트 진행 가능:

```powershell
# 1. Python 버전 확인
python --version
# 기대값: Python 3.11.x

# 2. Docker 버전 확인
docker --version
# 기대값: Docker version 24.x.x

# 3. Docker Compose 버전 확인
docker compose version
# 기대값: Docker Compose version v2.x.x

# 4. Docker 컨테이너 확인
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\infra\dev
docker compose ps
# 기대값: postgres, redis 컨테이너 "running" 상태

# 5. Python 가상환경 확인
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
Test-Path venv
# 기대값: True

# 6. 가상환경 활성화 및 패키지 확인
.\venv\Scripts\Activate.ps1
pip list | Select-String "fastapi"
# 기대값: fastapi 0.x.x 표시
```

---

## 5️⃣ BFF 서버 시작 (설치 완료 후)

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**기대 출력:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Redis 연결 풀 초기화 시작
INFO:     Redis 연결 풀 초기화 성공
INFO:     Application startup complete.
```

**헬스 체크:**
```powershell
# 새 PowerShell 창에서 실행
curl http://localhost:8000/health
# 출력: {"status":"ok","message":"BFF is running"}
```

---

## 🚨 문제 해결

### Python 설치 후 "python을 찾을 수 없습니다"

**원인**: PATH 환경변수 업데이트 안 됨

**해결**:
1. PowerShell 완전히 종료 후 재시작
2. 또는 시스템 재부팅
3. 여전히 안 되면: 제어판 → 시스템 → 고급 시스템 설정 → 환경 변수 → PATH에 Python 경로 수동 추가
   - 예: `C:\Users\YourName\AppData\Local\Programs\Python\Python311`

### Docker Desktop 실행 안 됨

**원인**: WSL 2 미설치 또는 Hyper-V 비활성화

**해결**:
```powershell
# 관리자 권한으로 PowerShell 실행
# WSL 2 설치
wsl --install

# 재부팅
Restart-Computer

# WSL 버전 확인
wsl --list --verbose
# 기대값: Ubuntu 또는 기본 배포판 표시
```

### Docker Compose 파일 없음

**확인**:
```powershell
Test-Path c:\AIDEN_PROJECT\Trenduity\Trenduity\infra\dev\docker-compose.yml
```

**만약 False라면**: `infra/dev` 디렉터리에 `docker-compose.yml` 파일이 누락되었습니다. AI에게 생성 요청하세요.

### pip 설치 중 SSL 에러

**해결**:
```powershell
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

---

## 📞 설치 완료 후 다음 단계

설치가 모두 완료되면 채팅에 다음 중 하나를 입력하세요:

- **"설치 완료"** - AI가 자동으로 테스트 시작
- **"설치 중 오류 발생: [오류 메시지]"** - AI가 문제 해결 지원

---

**예상 소요 시간**:
- Python 설치: 5분
- Docker 설치: 10-15분 (WSL 2 포함)
- 환경 설정: 5-10분
- **총 시간: 20-30분**

**설치 순서**: Python → Docker → 가상환경 → Docker Compose → BFF 서버
