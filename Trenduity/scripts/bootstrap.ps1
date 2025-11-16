Write-Host "======================================" -ForegroundColor Cyan
Write-Host "50-70대 AI 학습 앱 - 초기 설정" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check Node.js
Write-Host "`nChecking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js가 설치되어 있지 않습니다." -ForegroundColor Red
    exit 1
}

# Check Python
Write-Host "`nChecking Python version..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✅ Python version: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Python이 설치되어 있지 않습니다." -ForegroundColor Red
    exit 1
}

# Install Node dependencies
Write-Host "`nInstalling Node dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install Node dependencies" -ForegroundColor Red
    exit 1
}

# Install Python dependencies
Write-Host "`nInstalling Python dependencies for BFF..." -ForegroundColor Yellow
Push-Location services\bff-fastapi
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
deactivate
Pop-Location
Write-Host "✅ Python dependencies installed" -ForegroundColor Green

# Copy .env.example
Write-Host "" -ForegroundColor Yellow
if (-Not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ .env 파일이 생성되었습니다." -ForegroundColor Green
} else {
    Write-Host "⚠️  .env 파일이 이미 존재합니다." -ForegroundColor Yellow
}

# Start Docker Compose
Write-Host "`nStarting Docker Compose..." -ForegroundColor Yellow
Push-Location infra\dev
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker Compose started" -ForegroundColor Green
} else {
    Write-Host "⚠️  Docker Compose 시작 실패 (Docker Desktop이 실행 중인지 확인하세요)" -ForegroundColor Yellow
}
Pop-Location

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "✅ 초기 설정 완료!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "`n다음 단계:" -ForegroundColor Yellow
Write-Host "1. .env 파일을 편집하여 Supabase 키 등을 설정하세요."
Write-Host "2. 개발 서버를 시작하려면: .\scripts\dev.ps1"
Write-Host ""
