# 06. Infra & Scripts - 인프라 및 개발 스크립트

> 개발 환경 설정 및 자동화 스크립트

---

## 📋 목표

- Docker Compose로 로컬 개발 환경 구성 (Postgres, Redis)
- 부트스트랩 스크립트 (의존성 설치, Git hooks)
- 개발 서버 실행 스크립트
- 루트 README.md 및 .env.example 완성

---

## 🗂️ 폴더 구조

```
repo/
├── infra/
│   └── dev/
│       └── docker-compose.yml      # 개발용 Docker Compose
├── scripts/
│   ├── bootstrap.sh                # 초기 설정 스크립트
│   └── dev.sh                      # 개발 서버 실행
├── .env.example                    # 환경변수 예시
└── README.md                       # 프로젝트 개요
```

---

## 📄 파일별 상세 내용

### infra/dev/docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: senior-learning-postgres
    environment:
      POSTGRES_DB: senior_learning_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: senior-learning-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Optional: Mailhog for email debugging (향후)
  # mailhog:
  #   image: mailhog/mailhog
  #   container_name: senior-learning-mailhog
  #   ports:
  #     - "1025:1025"  # SMTP
  #     - "8025:8025"  # Web UI

volumes:
  postgres_data:
  redis_data:
```

**사용법**:
```bash
cd infra/dev
docker-compose up -d
```

**주의사항**:
- 실제 Supabase 사용 시: Postgres 컨테이너는 로컬 테스트용
- 프로덕션: Supabase Cloud 사용 권장

---

### scripts/bootstrap.sh

```bash
#!/bin/bash
set -e

echo "======================================"
echo "50-70대 AI 학습 앱 - 초기 설정"
echo "======================================"

# 1. Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Error: Node.js 18 이상이 필요합니다."
  echo "   현재 버전: $(node -v)"
  exit 1
fi
echo "✅ Node.js version: $(node -v)"

# 2. Check Python version (for BFF)
echo ""
echo "Checking Python version..."
if ! command -v python3 &> /dev/null; then
  echo "❌ Error: Python 3가 설치되어 있지 않습니다."
  exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✅ Python version: $PYTHON_VERSION"

# 3. Install Node dependencies
echo ""
echo "Installing Node dependencies..."
npm install
echo "✅ Node dependencies installed"

# 4. Install Python dependencies (BFF)
echo ""
echo "Installing Python dependencies for BFF..."
cd services/bff-fastapi
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ../..
echo "✅ Python dependencies installed"

# 5. Copy .env.example to .env (if not exists)
echo ""
if [ ! -f .env ]; then
  echo "Copying .env.example to .env..."
  cp .env.example .env
  echo "✅ .env 파일이 생성되었습니다. 환경변수를 설정해 주세요."
else
  echo "⚠️  .env 파일이 이미 존재합니다."
fi

# 6. Setup Git hooks (optional)
# echo ""
# echo "Setting up Git hooks..."
# TODO: Setup husky or simple pre-commit hooks

# 7. Start Docker Compose
echo ""
echo "Starting Docker Compose (Postgres, Redis)..."
cd infra/dev
docker-compose up -d
cd ../..
echo "✅ Docker Compose started"

echo ""
echo "======================================"
echo "✅ 초기 설정 완료!"
echo "======================================"
echo ""
echo "다음 단계:"
echo "1. .env 파일을 편집하여 Supabase 키 등을 설정하세요."
echo "2. 개발 서버를 시작하려면: ./scripts/dev.sh"
echo ""
```

**Windows (PowerShell) 버전** - `scripts/bootstrap.ps1`:
```powershell
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "50-70대 AI 학습 앱 - 초기 설정" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check Node.js
Write-Host "`nChecking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Node.js가 설치되어 있지 않습니다." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Check Python
Write-Host "`nChecking Python version..." -ForegroundColor Yellow
$pythonVersion = python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Python이 설치되어 있지 않습니다." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python version: $pythonVersion" -ForegroundColor Green

# Install Node dependencies
Write-Host "`nInstalling Node dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Node dependencies installed" -ForegroundColor Green

# Install Python dependencies
Write-Host "`nInstalling Python dependencies for BFF..." -ForegroundColor Yellow
Set-Location services\bff-fastapi
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
deactivate
Set-Location ..\..
Write-Host "✅ Python dependencies installed" -ForegroundColor Green

# Copy .env.example
Write-Host "`n" -ForegroundColor Yellow
if (-Not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ .env 파일이 생성되었습니다." -ForegroundColor Green
} else {
    Write-Host "⚠️  .env 파일이 이미 존재합니다." -ForegroundColor Yellow
}

# Start Docker Compose
Write-Host "`nStarting Docker Compose..." -ForegroundColor Yellow
Set-Location infra\dev
docker-compose up -d
Set-Location ..\..
Write-Host "✅ Docker Compose started" -ForegroundColor Green

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "✅ 초기 설정 완료!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "`n다음 단계:" -ForegroundColor Yellow
Write-Host "1. .env 파일을 편집하여 Supabase 키 등을 설정하세요."
Write-Host "2. 개발 서버를 시작하려면: .\scripts\dev.ps1"
```

---

### scripts/dev.sh

```bash
#!/bin/bash
set -e

echo "======================================"
echo "50-70대 AI 학습 앱 - 개발 서버 실행"
echo "======================================"

# Check if Docker Compose is running
echo "Checking Docker Compose status..."
cd infra/dev
if ! docker-compose ps | grep -q "Up"; then
  echo "⚠️  Docker Compose가 실행 중이 아닙니다. 시작합니다..."
  docker-compose up -d
else
  echo "✅ Docker Compose is running"
fi
cd ../..

# Function to kill all background processes on exit
cleanup() {
  echo ""
  echo "Stopping all servers..."
  kill $(jobs -p) 2>/dev/null || true
  echo "✅ All servers stopped"
}
trap cleanup EXIT

echo ""
echo "======================================"
echo "서버 시작 중..."
echo "======================================"

# 1. Start BFF (FastAPI)
echo ""
echo "1️⃣  Starting BFF (FastAPI)..."
cd services/bff-fastapi
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BFF_PID=$!
echo "   BFF PID: $BFF_PID"
echo "   URL: http://localhost:8000"
cd ../..

# 2. Start Web Console (Next.js)
echo ""
echo "2️⃣  Starting Web Console (Next.js)..."
cd apps/web-next
npm run dev &
WEB_PID=$!
echo "   Web PID: $WEB_PID"
echo "   URL: http://localhost:3000"
cd ../..

# 3. Start Mobile App (Expo)
echo ""
echo "3️⃣  Starting Mobile App (Expo)..."
cd apps/mobile-expo
npm start &
EXPO_PID=$!
echo "   Expo PID: $EXPO_PID"
echo "   URL: http://localhost:19006"
cd ../..

echo ""
echo "======================================"
echo "✅ 모든 서버가 시작되었습니다!"
echo "======================================"
echo ""
echo "🔗 접속 주소:"
echo "   - BFF:     http://localhost:8000"
echo "   - BFF Docs: http://localhost:8000/docs"
echo "   - Web:     http://localhost:3000"
echo "   - Expo:    http://localhost:19006"
echo ""
echo "종료하려면 Ctrl+C를 누르세요."
echo ""

# Wait for user interrupt
wait
```

**Windows (PowerShell) 버전** - `scripts/dev.ps1`:
```powershell
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "50-70대 AI 학습 앱 - 개발 서버 실행" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check Docker Compose
Write-Host "`nChecking Docker Compose status..." -ForegroundColor Yellow
Set-Location infra\dev
$dockerStatus = docker-compose ps
if ($dockerStatus -notmatch "Up") {
    Write-Host "⚠️  Docker Compose가 실행 중이 아닙니다. 시작합니다..." -ForegroundColor Yellow
    docker-compose up -d
} else {
    Write-Host "✅ Docker Compose is running" -ForegroundColor Green
}
Set-Location ..\..

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "서버 시작 중..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Start BFF
Write-Host "`n1️⃣  Starting BFF (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services\bff-fastapi; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000"

# Start Web
Write-Host "`n2️⃣  Starting Web Console (Next.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web-next; npm run dev"

# Start Mobile
Write-Host "`n3️⃣  Starting Mobile App (Expo)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\mobile-expo; npm start"

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "✅ 모든 서버가 시작되었습니다!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "`n🔗 접속 주소:" -ForegroundColor Yellow
Write-Host "   - BFF:     http://localhost:8000"
Write-Host "   - BFF Docs: http://localhost:8000/docs"
Write-Host "   - Web:     http://localhost:3000"
Write-Host "   - Expo:    http://localhost:19006"
Write-Host "`n각 서버는 별도 창에서 실행 중입니다." -ForegroundColor Yellow
Write-Host "종료하려면 각 창을 닫으세요." -ForegroundColor Yellow
```

---

### .env.example (루트)

```bash
# ==========================================
# 50-70대 AI 학습 앱 - 환경변수
# ==========================================

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# BFF API
BFF_API_URL=http://localhost:8000
NEXT_PUBLIC_BFF_API_URL=http://localhost:8000

# Redis (Upstash or Local)
REDIS_URL=redis://localhost:6379/0

# Expo (Mobile)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Next.js (Web)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# LLM (향후)
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# Sentry (향후)
# SENTRY_DSN=https://...

# Environment
ENV=development
DEBUG=true
```

---

### README.md (루트) - 업데이트

이미 01-workspace-setup.md에서 작성한 README.md를 기반으로 아래 섹션 추가:

```markdown
## 🚀 빠른 시작

### 1단계: 초기 설정

```bash
# 저장소 클론
git clone <repository-url>
cd senior-learning-app

# 부트스트랩 실행 (의존성 설치, Docker 시작)
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh

# Windows
.\scripts\bootstrap.ps1
```

### 2단계: 환경변수 설정

`.env` 파일을 편집하여 Supabase 키를 설정하세요:

```bash
# Supabase 프로젝트에서 키 복사
# Settings > API > Project URL, anon key, service_role key
```

### 3단계: 개발 서버 실행

```bash
# 모든 서버 실행 (BFF, Web, Mobile)
chmod +x scripts/dev.sh
./scripts/dev.sh

# Windows
.\scripts\dev.ps1
```

### 4단계: 접속 확인

- **BFF API**: http://localhost:8000
- **BFF Swagger UI**: http://localhost:8000/docs
- **웹 콘솔**: http://localhost:3000
- **모바일 앱**: http://localhost:19006 (Expo DevTools)

---

## 📚 개발 가이드

### 프로젝트 구조

자세한 내용은 [docs/SCAFFOLD/index.md](./docs/SCAFFOLD/index.md) 참조

### 환경별 설정

- **개발**: `.env` (로컬)
- **스테이징**: `.env.staging` (향후)
- **프로덕션**: 환경변수 주입 (CI/CD)

### 주요 명령어

```bash
# 린트
npm run lint
npm run lint:fix

# 타입 체크
npm run typecheck

# 포맷
npm run format

# 클린
npm run clean
```

---

## 🐳 Docker 관리

```bash
# 시작
cd infra/dev
docker-compose up -d

# 중지
docker-compose down

# 로그 확인
docker-compose logs -f

# 데이터 초기화 (주의!)
docker-compose down -v
```

---

## 🔧 트러블슈팅

### Docker 연결 실패
- Docker Desktop이 실행 중인지 확인
- `docker-compose ps`로 컨테이너 상태 확인

### 포트 충돌
- 8000, 3000, 19006 포트가 다른 프로세스에서 사용 중인지 확인
- 포트 변경: 각 앱의 package.json/config 수정

### Expo 앱 실행 안 됨
- `npm start -- --clear` (캐시 클리어)
- `expo-cli` 전역 설치: `npm install -g expo-cli`

### BFF 실행 안 됨
- Python 가상환경 활성화 확인
- `pip install -r requirements.txt` 재실행
```

---

## ✅ 작업 체크리스트

### Docker Compose
- [ ] `infra/dev/docker-compose.yml` 생성
- [ ] Postgres 컨테이너 설정
- [ ] Redis 컨테이너 설정
- [ ] `docker-compose up -d` 테스트

### 스크립트
- [ ] `scripts/bootstrap.sh` 생성 (또는 .ps1)
- [ ] `scripts/dev.sh` 생성 (또는 .ps1)
- [ ] 실행 권한 부여 (`chmod +x`)

### 환경변수
- [ ] 루트 `.env.example` 생성
- [ ] 각 앱별 환경변수 문서화

### README
- [ ] 빠른 시작 가이드 추가
- [ ] Docker 관리 섹션
- [ ] 트러블슈팅 섹션

### 통합 테스트
- [ ] `./scripts/bootstrap.sh` 실행 성공
- [ ] Docker 컨테이너 모두 실행
- [ ] `./scripts/dev.sh` 실행 성공
- [ ] BFF, Web, Mobile 모두 접속 가능

---

## 🎉 SCAFFOLD 단계 완료!

모든 체크리스트를 완료하면 다음 단계로 진행할 수 있습니다:

1. **IMPLEMENT 단계**: 실제 비즈니스 로직 구현
2. **SEED 단계**: 테스트 데이터 생성
3. **TEST 단계**: 테스트 스위트 작성
4. **DOCS 단계**: API 문서 및 가이드 완성

---

## 📝 최종 확인 사항

### 모든 앱이 빌드/실행 가능한가?
- [ ] 모바일 앱: `npm start` 성공
- [ ] 웹 콘솔: `npm run dev` 성공
- [ ] BFF: `uvicorn app.main:app` 성공

### 모든 모듈이 올바르게 import 되는가?
- [ ] `@repo/ui` 패키지 사용 가능
- [ ] `@repo/types` 패키지 사용 가능
- [ ] 타입 체크 통과

### 비즈니스 로직이 TODO로 남아있는가?
- [ ] 모든 API 엔드포인트가 플레이스홀더 응답
- [ ] Supabase 쿼리가 스텁 상태
- [ ] 실제 데이터베이스 작업 없음

---

**작성일**: 2025년 11월 13일  
**작성자**: AI Scaffolding Assistant
