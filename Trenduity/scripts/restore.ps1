# Trenduity 빠른 복원 스크립트
# 사용법: .\scripts\restore.ps1 [-BackupFile <경로>] [-List]

param(
    [string]$BackupFile,  # 복원할 백업 파일 경로 (지정 안 하면 최신 백업)
    [switch]$List         # 백업 목록만 표시
)

$ErrorActionPreference = "Stop"

$backupDir = "c:\AIDEN_PROJECT\Trenduity\backups"
$projectRoot = "c:\AIDEN_PROJECT\Trenduity\Trenduity"

# 백업 목록 표시
if ($List -or !$BackupFile) {
    Write-Host ""
    Write-Host "📋 사용 가능한 백업 목록:" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
    
    $backups = Get-ChildItem $backupDir -Filter "Trenduity_*.zip" | 
        Sort-Object LastWriteTime -Descending
    
    if ($backups.Count -eq 0) {
        Write-Host "   백업 파일이 없습니다." -ForegroundColor Yellow
        exit
    }
    
    $i = 1
    $backups | ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        $date = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        $marker = if ($i -eq 1) { " (최신)" } else { "" }
        Write-Host "   [$i] $($_.Name) - $size MB - $date$marker" -ForegroundColor White
        $i++
    }
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
    
    if ($List) { exit }
    
    # 사용자 선택
    Write-Host ""
    $selection = Read-Host "복원할 번호 입력 (취소: Enter)"
    
    if ([string]::IsNullOrEmpty($selection)) {
        Write-Host "❌ 복원 취소됨" -ForegroundColor Yellow
        exit
    }
    
    $selectedIndex = [int]$selection - 1
    if ($selectedIndex -lt 0 -or $selectedIndex -ge $backups.Count) {
        Write-Host "❌ 잘못된 선택" -ForegroundColor Red
        exit
    }
    
    $BackupFile = $backups[$selectedIndex].FullName
}

# 백업 파일 확인
if (!(Test-Path $BackupFile)) {
    Write-Host "❌ 백업 파일을 찾을 수 없음: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⚠️  경고: 현재 프로젝트가 덮어써집니다!" -ForegroundColor Red
Write-Host "   백업 파일: $BackupFile" -ForegroundColor Yellow
$confirm = Read-Host "계속하시겠습니까? (yes 입력)"

if ($confirm -ne "yes") {
    Write-Host "❌ 복원 취소됨" -ForegroundColor Yellow
    exit
}

# 복원 시작
Write-Host ""
Write-Host "🔄 복원 시작..." -ForegroundColor Cyan

# 1. 현재 프로젝트 백업 (안전망)
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$emergencyBackup = Join-Path $backupDir "Trenduity_${timestamp}_pre_restore.zip"
Write-Host "📦 현재 상태 임시 백업 중..." -ForegroundColor Yellow
Compress-Archive -Path $projectRoot -DestinationPath $emergencyBackup -CompressionLevel Fastest

# 2. 기존 프로젝트 삭제
Write-Host "🗑️  기존 프로젝트 삭제 중..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $projectRoot

# 3. 백업에서 복원
Write-Host "📂 백업에서 복원 중..." -ForegroundColor Yellow
Expand-Archive -Path $BackupFile -DestinationPath (Split-Path $projectRoot -Parent)

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ 복원 완료!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📁 복원된 경로: $projectRoot" -ForegroundColor White
Write-Host "🔒 복원 전 백업: $emergencyBackup" -ForegroundColor White
Write-Host ""
Write-Host "💡 다음 명령으로 의존성 재설치하세요:" -ForegroundColor Yellow
Write-Host "   cd $projectRoot" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
