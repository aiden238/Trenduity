# Trenduity 프로젝트 백업 스크립트
# 사용법: .\scripts\backup.ps1 [-ExcludeNodeModules] [-Push]

param(
    [switch]$ExcludeNodeModules,  # node_modules 제외 (빠른 백업)
    [switch]$Push                  # Git push 포함
)

$ErrorActionPreference = "Stop"

# 경로 설정
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backupDir = "c:\AIDEN_PROJECT\Trenduity\backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "🔄 Trenduity 백업 시작..." -ForegroundColor Cyan
Write-Host "📁 프로젝트: $projectRoot" -ForegroundColor Gray

# 1. Git 상태 확인 및 커밋
Set-Location $projectRoot
$status = git status --porcelain
if ($status) {
    Write-Host "📝 커밋되지 않은 변경사항 발견, 자동 커밋 중..." -ForegroundColor Yellow
    git add -A
    git commit -m "backup: 자동 백업 $timestamp"
    Write-Host "✅ 자동 커밋 완료" -ForegroundColor Green
} else {
    Write-Host "✅ 모든 변경사항이 이미 커밋됨" -ForegroundColor Green
}

# 2. Git Push (옵션)
if ($Push) {
    Write-Host "🚀 원격 저장소에 Push 중..." -ForegroundColor Yellow
    git push origin main
    Write-Host "✅ Push 완료" -ForegroundColor Green
}

# 3. ZIP 백업 생성
if (!(Test-Path $backupDir)) { 
    New-Item -ItemType Directory -Path $backupDir | Out-Null 
}

$zipName = if ($ExcludeNodeModules) { 
    "Trenduity_${timestamp}_light.zip" 
} else { 
    "Trenduity_${timestamp}.zip" 
}
$zipPath = Join-Path $backupDir $zipName

Write-Host "📦 ZIP 아카이브 생성 중..." -ForegroundColor Yellow

if ($ExcludeNodeModules) {
    # node_modules 제외 (빠른 백업)
    $tempDir = Join-Path $env:TEMP "trenduity_backup_$timestamp"
    
    # rsync 스타일 복사 (node_modules 제외)
    $excludes = @("node_modules", ".expo", "dist", "build", ".next", "__pycache__", "*.pyc", "venv")
    
    robocopy $projectRoot $tempDir /E /XD $excludes /NFL /NDL /NJH /NJS /NC /NS | Out-Null
    Compress-Archive -Path $tempDir -DestinationPath $zipPath -CompressionLevel Optimal
    Remove-Item -Recurse -Force $tempDir
} else {
    # 전체 백업
    Compress-Archive -Path $projectRoot -DestinationPath $zipPath -CompressionLevel Optimal
}

# 4. 결과 출력
$zipInfo = Get-Item $zipPath
$sizeMB = [math]::Round($zipInfo.Length / 1MB, 2)

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ 백업 완료!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📁 파일: $zipPath" -ForegroundColor White
Write-Host "💾 크기: $sizeMB MB" -ForegroundColor White
Write-Host "🕐 시간: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White

# 최근 커밋 정보
$lastCommit = git log -1 --oneline
Write-Host "📌 마지막 커밋: $lastCommit" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

# 이전 백업 목록 (최근 5개)
Write-Host ""
Write-Host "📋 최근 백업 목록:" -ForegroundColor Yellow
Get-ChildItem $backupDir -Filter "Trenduity_*.zip" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 5 | 
    ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "   $($_.Name) ($size MB)" -ForegroundColor Gray
    }
