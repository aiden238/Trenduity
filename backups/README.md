# Trenduity 백업 디렉터리

## 📁 백업 위치
`c:\AIDEN_PROJECT\Trenduity\backups\`

## 🛠️ 사용 방법

### 빠른 백업 (현재 상태 즉시 저장)
```powershell
# 전체 백업 (node_modules 포함, ~310MB)
.\Trenduity\scripts\backup.ps1

# 경량 백업 (node_modules 제외, ~15MB)
.\Trenduity\scripts\backup.ps1 -ExcludeNodeModules

# 백업 + Git Push
.\Trenduity\scripts\backup.ps1 -Push
```

### 복원
```powershell
# 백업 목록 확인 및 선택 복원
.\Trenduity\scripts\restore.ps1

# 백업 목록만 표시
.\Trenduity\scripts\restore.ps1 -List

# 특정 백업 파일로 복원
.\Trenduity\scripts\restore.ps1 -BackupFile "c:\AIDEN_PROJECT\Trenduity\backups\Trenduity_20251208_110441.zip"
```

## 📋 백업 파일 명명 규칙
- `Trenduity_YYYYMMDD_HHmmss.zip` - 전체 백업
- `Trenduity_YYYYMMDD_HHmmss_light.zip` - node_modules 제외
- `Trenduity_YYYYMMDD_HHmmss_pre_restore.zip` - 복원 전 자동 백업

## 🔄 현재 프로젝트 상태 (2025-12-08 기준)

### 최근 커밋 히스토리
```
74fd71e fix: React/React Native 중복 의존성 해결
986ee1b feat: 긴급 상담 페이지 구현
0ff72fb fix: Legal 화면 spacing 오류 수정
6667e92 feat: BFF keep-alive 기능 추가
6557ed7 fix: 연결 타임아웃 30초로 증가
0452c6d style: 회원가입 UI 통일
eecbe1b perf: 로그인/회원가입 속도 최적화
bbe0b93 feat: 홈, 인사이트, 마이페이지 화면 복구
```

### 주요 기술 스택
- **Expo SDK**: ~54.0.0
- **React**: 19.1.0 (overrides로 고정)
- **React Native**: 0.81.5 (overrides로 고정)
- **BFF**: https://trenduity-bff.onrender.com

### 해결된 이슈
- ✅ React/React Native 중복 의존성 → overrides + peerDependencies로 해결
- ✅ OAuth 소셜 로그인 정상 동작
- ✅ BFF keep-alive로 콜드 스타트 최소화
- ✅ 긴급 상담 페이지 추가

## ⚠️ 복원 후 필수 작업
1. `cd c:\AIDEN_PROJECT\Trenduity\Trenduity`
2. `npm install` (의존성 재설치)
3. `.env` 파일 확인 (gitignore에 포함되어 있을 수 있음)
