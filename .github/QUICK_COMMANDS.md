# 빠른 명령어 모음

자주 사용하는 PowerShell 명령어 모음입니다.

## 🚀 개발 환경 시작

```powershell
# 전체 개발 환경 시작
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
.\scripts\dev.ps1
```

## 🔴 문제 해결 명령어

### BFF 실행 안 될 때
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
if (!(Test-Path venv)) { python -m venv venv }
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 타입 에러 발생 시
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
npm run typecheck

# 특정 앱만 체크
cd apps\mobile-expo; npm run typecheck
cd apps\web-next; npm run typecheck
```

### Supabase 연결 안 될 때
```powershell
# .env 파일 확인
Get-Content c:\AIDEN_PROJECT\Trenduity\Trenduity\.env | Select-String "SUPABASE"

# .env 없으면 생성
Copy-Item .env.example .env
# 그 후 키 입력 필요
```

### 시드 데이터 삽입
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\scripts
python seed_data.py
```

### 포맷/린트 검사
```powershell
# TypeScript/JavaScript
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
npm run lint
npm run format:check

# Python (BFF)
cd services\bff-fastapi
black --check app/
ruff app/
```

## 🔍 상태 확인 명령어

```powershell
# Git 현재 상태
git branch --show-current
git status --short
git log -1 --oneline

# BFF 서버 상태
curl http://localhost:8000/health

# Docker 컨테이너 상태
docker ps

# 최근 변경 파일
git log -5 --name-only --oneline
```

## 🔄 의존성 재설치

```powershell
# Node 의존성
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
npm install

# Python 의존성
cd services\bff-fastapi
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
