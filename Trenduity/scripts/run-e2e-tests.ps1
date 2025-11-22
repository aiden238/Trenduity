# E2E Test Runner Script
# Checks if BFF server is running and executes tests

param(
    [string]$TestFile = "",
    [switch]$Headed = $false,
    [switch]$UI = $false
)

$projectRoot = "c:\AIDEN_PROJECT\Trenduity\Trenduity"

Write-Host "[TEST] E2E test preparation..." -ForegroundColor Cyan

# Check BFF server status
Write-Host "[CHECK] BFF server status..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get -ErrorAction Stop
    if ($response.status -eq "healthy" -or $response.status -eq "ok") {
        Write-Host "[OK] BFF server is running (status: $($response.status))" -ForegroundColor Green
    } else {
        Write-Host "[WARN] BFF server response abnormal: $($response | ConvertTo-Json)" -ForegroundColor Yellow
        Write-Host "Start server: .\scripts\start-bff-server.ps1" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "[ERROR] BFF server is not running" -ForegroundColor Red
    Write-Host "Start server: .\scripts\start-bff-server.ps1" -ForegroundColor Yellow
    exit 1
}

# Run tests
Set-Location $projectRoot

$testCommand = "npx playwright test"

if ($TestFile) {
    $testCommand += " $TestFile"
}

if ($Headed) {
    $testCommand += " --headed"
}

if ($UI) {
    $testCommand += " --ui"
}

$testCommand += " --reporter=list"

Write-Host ""
Write-Host "[RUN] Executing: $testCommand" -ForegroundColor Green
Write-Host ""

Invoke-Expression $testCommand

Write-Host ""
Write-Host "[DONE] Test completed" -ForegroundColor Green
