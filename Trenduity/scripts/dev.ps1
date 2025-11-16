Write-Host "======================================" -ForegroundColor Cyan
Write-Host "50-70대 AI 학습 앱 - 개발 서버 실행" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check Docker Compose
Write-Host "`nChecking Docker Compose status..." -ForegroundColor Yellow
Push-Location infra\dev
$dockerStatus = docker-compose ps 2>$null
if ($LASTEXITCODE -ne 0 -or $dockerStatus -notmatch "Up") {
    Write-Host "⚠️  Docker Compose가 실행 중이 아닙니다. 시작합니다..." -ForegroundColor Yellow
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker Compose started" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Docker Compose 시작 실패 (건너뜁니다)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Docker Compose is running" -ForegroundColor Green
}
Pop-Location

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "서버 시작 중..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Start BFF
Write-Host "`n1️⃣  Starting BFF (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\services\bff-fastapi'; if (Test-Path venv\Scripts\Activate.ps1) { .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000 } else { Write-Host 'venv not found. Run bootstrap.ps1 first' -ForegroundColor Red }"

# Start Web
Write-Host "`n2️⃣  Starting Web Console (Next.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\web-next'; npm run dev"

# Start Mobile
Write-Host "`n3️⃣  Starting Mobile App (Expo)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\mobile-expo'; npm start"

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "✅ 모든 서버가 시작되었습니다!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "`n🔗 접속 주소:" -ForegroundColor Yellow
Write-Host "   - BFF:      http://localhost:8000"
Write-Host "   - BFF Docs: http://localhost:8000/docs"
Write-Host "   - Web:      http://localhost:3000"
Write-Host "   - Expo:     http://localhost:19006"
Write-Host "`n각 서버는 별도 창에서 실행 중입니다." -ForegroundColor Yellow
Write-Host "종료하려면 각 창을 닫으세요." -ForegroundColor Yellow
Write-Host ""
