# BFF Server Start Script
# Runs in background to keep running during tests

$bffPath = "c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi"
$pythonExe = "$bffPath\venv\Scripts\python.exe"

Write-Host "[START] Starting BFF server..." -ForegroundColor Green

Set-Location $bffPath

# Check and kill existing processes
$existingProcess = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*uvicorn*" -or $_.CommandLine -like "*uvicorn*"
}

if ($existingProcess) {
    Write-Host "[WARN] Stopping existing BFF server process..." -ForegroundColor Yellow
    $existingProcess | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Start server (background)
$job = Start-Job -ScriptBlock {
    param($pythonPath, $workDir)
    Set-Location $workDir
    & $pythonPath -m uvicorn app.main:app --host 127.0.0.1 --port 8000
} -ArgumentList $pythonExe, $bffPath

Write-Host "[WAIT] Waiting for server to start (5 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Health check
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get -ErrorAction Stop
    if ($response.status -eq "healthy" -or $response.status -eq "ok") {
        Write-Host "[OK] BFF server running (http://127.0.0.1:8000)" -ForegroundColor Green
        Write-Host "[INFO] Job ID: $($job.Id) | Status: $($response.status)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "To stop server: Stop-Job -Id $($job.Id); Remove-Job -Id $($job.Id)" -ForegroundColor Yellow
    } else {
        Write-Host "[ERROR] Server response abnormal: $($response | ConvertTo-Json)" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] Server connection failed: $_" -ForegroundColor Red
    Write-Host "Check job status: Get-Job -Id $($job.Id)" -ForegroundColor Yellow
}
