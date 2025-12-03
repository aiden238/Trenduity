# 문서 재구성 계획

**생성일**: 2025-12-02  
**목적**: Root에 흩어진 MD 파일을 체계적으로 docs/ 하위로 통합

---

## 📊 현재 상태

### Root 디렉터리 MD 파일 (10개)
```
Trenduity/
├── README.md                    (유지 - 메인 소개)
├── SETUP_GUIDE.md               (이동 대상)
├── RENDER_QUICKSTART.md         (이동 대상)
├── RENDER_ENV_VARIABLES.md      (이동 대상)
├── NEXT_SESSION_RESUME.md       (이동 대상)
├── MIGRATION_REQUIRED.md        (이동 대상)
├── INTEGRATION_TEST.md          (이동 대상)
├── BACKEND_ISSUES.md            (이동 대상)
├── FRONTEND_ISSUES.md           (이동 대상)
└── FIX_CHECKLIST.md             (이동 대상)
```

### 기존 docs/ 구조
```
docs/
├── PLAN/                        (기획 문서 - 변경 없음)
├── IMPLEMENT/                   (구현 가이드 - 변경 없음)
├── SCAFFOLD/                    (뼈대 구축 - 변경 없음)
├── SEED/                        (시드 데이터 - 변경 없음)
├── TEST/                        (테스트 - 변경 없음)
└── DOCS/                        (API 참조 - 변경 없음)
```

---

## 🎯 재구성 목표

1. ✅ **Root 디렉터리 정리**: README.md 외 모든 MD 파일 제거
2. ✅ **문서 분류**: 목적별로 docs/ 하위 디렉터리에 배치
3. ✅ **중복 제거**: 같은 내용 다른 파일에 있으면 병합
4. ✅ **불필요한 내용 제거**: 완료된 작업, 오래된 정보 삭제
5. ✅ **내부 링크 업데이트**: 경로 변경 시 링크 수정
6. ✅ **docs/README.md 생성**: 전체 네비게이션 인덱스

---

## 🗂️ 제안 구조

```
docs/
├── README.md                      (신규 - 네비게이션 인덱스)
│
├── SETUP/                         (기존 + 통합)
│   ├── 01-workspace-setup.md      (기존 유지)
│   ├── 02-python-docker-setup.md  (← SETUP_GUIDE.md 이동 + 이름 변경)
│   └── 03-deployment-setup.md     (← RENDER 파일들 병합)
│       - Render 배포 (QUICKSTART)
│       - 환경 변수 (ENV_VARIABLES)
│
├── ISSUES/                        (신규 디렉터리)
│   ├── README.md                  (신규 - 이슈 트래커 인덱스)
│   ├── BACKEND_ISSUES.md          (← 이동)
│   ├── FRONTEND_ISSUES.md         (← 이동)
│   └── FIX_CHECKLIST.md           (← 이동)
│
├── TEST/                          (기존 + 통합)
│   ├── 01-bff-unit-tests.md       (기존 유지)
│   ├── 02-dto-schema-tests.md     (기존 유지)
│   ├── 03-component-tests.md      (기존 유지)
│   ├── 04-e2e-smoke-tests.md      (기존 유지)
│   ├── 05-a11y-checks.md          (기존 유지)
│   ├── 06-ci-integration.md       (기존 유지)
│   └── 07-integration-test.md     (← INTEGRATION_TEST.md 이동 + 이름 변경)
│
├── WORK/                          (신규 디렉터리)
│   ├── README.md                  (신규 - 세션 관리 가이드)
│   ├── NEXT_SESSION_RESUME.md     (← 이동)
│   └── ARCHIVE/                   (완료된 세션 노트 보관)
│       └── session-2025-11-21.md  (← MIGRATION_REQUIRED.md 이동 + 이름 변경)
│
├── PLAN/                          (변경 없음)
├── IMPLEMENT/                     (변경 없음)
├── SCAFFOLD/                      (변경 없음)
├── SEED/                          (변경 없음)
└── DOCS/                          (변경 없음)
```

---

## 📝 파일별 이동 계획

### 1️⃣ SETUP 그룹

#### SETUP_GUIDE.md → docs/SETUP/02-python-docker-setup.md
- **변경사항**:
  - 이름: SETUP_GUIDE.md → 02-python-docker-setup.md
  - 위치: Root → docs/SETUP/
  - 내용 수정:
    * 헤더 레벨 조정 (# → ##)
    * "이 파일은 `docs/SETUP/02-python-docker-setup.md`로 이동되었습니다" 안내 추가
- **내부 링크**: 없음 (독립 문서)

#### RENDER 파일 병합 → docs/SETUP/03-deployment-setup.md
- **병합 대상**:
  * RENDER_QUICKSTART.md (배포 절차)
  * RENDER_ENV_VARIABLES.md (환경 변수 레퍼런스)
- **새 파일 구조**:
  ```markdown
  # 배포 설정 가이드
  
  ## 1. Render 빠른 시작 (QUICKSTART 내용)
  ## 2. 환경 변수 레퍼런스 (ENV_VARIABLES 내용)
  ## 3. 검증 및 문제 해결
  ```
- **중복 제거**: 
  * 두 파일 모두 "SUPABASE_URL" 설명 → 하나로 통합
  * "Supabase 키 찾기" 중복 → 한 번만 언급

---

### 2️⃣ ISSUES 그룹 (신규 디렉터리)

#### BACKEND_ISSUES.md → docs/ISSUES/BACKEND_ISSUES.md
- **변경사항**:
  - 위치: Root → docs/ISSUES/
  - 내용: 수정 없음 (최신 상태)
- **내부 링크**: 
  * `.github/copilot-instructions.md` (경로 유지)
  * `docs/IMPLEMENT/01-implementation-rules.md` (경로 유지)

#### FRONTEND_ISSUES.md → docs/ISSUES/FRONTEND_ISSUES.md
- **변경사항**:
  - 위치: Root → docs/ISSUES/
  - 내용: 수정 없음
- **내부 링크**: 
  * `docs/PLAN/01-2-architecture-overview.md` (경로 유지)

#### FIX_CHECKLIST.md → docs/ISSUES/FIX_CHECKLIST.md
- **변경사항**:
  - 위치: Root → docs/ISSUES/
  - 내용: 수정 없음
- **내부 링크**: 
  * `BACKEND_ISSUES.md` → `./BACKEND_ISSUES.md` (상대 경로)
  * `FRONTEND_ISSUES.md` → `./FRONTEND_ISSUES.md` (상대 경로)

#### 신규: docs/ISSUES/README.md
- **내용**:
  ```markdown
  # 이슈 트래커
  
  ## 📋 이슈 문서
  - [백엔드 이슈](./BACKEND_ISSUES.md) - P0/P1 수정 사항
  - [프론트엔드 이슈](./FRONTEND_ISSUES.md) - P0 수정 사항
  - [수정 체크리스트](./FIX_CHECKLIST.md) - 통합 검증
  
  ## ✅ 완료 상태 (2025-12-02)
  - Frontend P0: 4/4 ✅
  - Backend P0: 3/3 ✅
  - Backend P1: 3/3 ✅
  - 통합 테스트: 대기 중 ⏳
  ```

---

### 3️⃣ TEST 그룹

#### INTEGRATION_TEST.md → docs/TEST/07-integration-test.md
- **변경사항**:
  - 이름: INTEGRATION_TEST.md → 07-integration-test.md
  - 위치: Root → docs/TEST/
  - 내용 수정:
    * 파일 경로 업데이트 (`c:\AIDEN_PROJECT\Trenduity\Trenduity\...` → 프로젝트 루트 기준)
    * 헤더 레벨 조정
- **내부 링크**: 없음

---

### 4️⃣ WORK 그룹 (신규 디렉터리)

#### NEXT_SESSION_RESUME.md → docs/WORK/NEXT_SESSION_RESUME.md
- **변경사항**:
  - 위치: Root → docs/WORK/
  - 내용 수정:
    * ⚠️ **불필요한 내용 대폭 삭제** (OAuth 테스트는 이미 완료됨)
    * 현재 진행 중인 작업만 유지
    * "다음 세션 재개용 프롬프트" 섹션만 남김
- **주요 삭제 내용**:
  * OAuth 소셜 로그인 관련 전체 (이미 구현 완료)
  * ngrok/Cloudflare Tunnel 설정 (네트워크 연결 완료)
  * USB 테더링 가이드 (더 이상 필요 없음)
- **유지할 내용**:
  * 다음 세션 재개 체크리스트 (환경 상태 확인)
  * BFF/Docker 시작 명령어
  * 일반적인 문제 해결 패턴

#### MIGRATION_REQUIRED.md → docs/WORK/ARCHIVE/session-2025-11-21.md
- **변경사항**:
  - 이름: MIGRATION_REQUIRED.md → session-2025-11-21.md
  - 위치: Root → docs/WORK/ARCHIVE/
  - 상태: ✅ **완료된 작업** (completed_date 컬럼 추가 완료)
  - 내용 수정:
    * 상단에 "✅ 완료됨 (2025-11-21)" 배너 추가
    * "다음 세션" 섹션 삭제 (더 이상 유효하지 않음)

#### 신규: docs/WORK/README.md
- **내용**:
  ```markdown
  # 작업 세션 관리
  
  ## 🎯 현재 세션 (2025-12-02)
  - [다음 세션 재개 프롬프트](./NEXT_SESSION_RESUME.md)
  
  ## 📚 과거 세션 아카이브
  - [2025-11-21 세션](./ARCHIVE/session-2025-11-21.md) - 카드 완료 중복 방지 마이그레이션
  
  ## 📝 세션 재개 가이드
  1. `NEXT_SESSION_RESUME.md` 읽기
  2. 환경 상태 확인 (BFF, Docker)
  3. 브랜치 및 변경사항 확인
  4. 작업 재개
  ```

---

## 🔗 내부 링크 업데이트 필요 파일

### README.md (Root)
- 추가:
  ```markdown
  ## 📚 문서
  - [전체 문서 인덱스](docs/README.md)
  - [이슈 트래커](docs/ISSUES/)
  - [설치 가이드](docs/SETUP/)
  ```

### .github/copilot-instructions.md
- 업데이트 필요:
  ```markdown
  # 변경 전
  - 전체 아키텍처: `docs/PLAN/01-2-architecture-overview.md`
  - 구현 규칙: `docs/IMPLEMENT/01-implementation-rules.md`
  - 워크스페이스 설정: `docs/SCAFFOLD/01-workspace-setup.md`
  - 시드 데이터: `Trenduity/scripts/seed_data.py`
  
  # 변경 후 (추가)
  + 이슈 트래커: `docs/ISSUES/README.md`
  + 설치 가이드: `docs/SETUP/02-python-docker-setup.md`
  + 배포 가이드: `docs/SETUP/03-deployment-setup.md`
  + 통합 테스트: `docs/TEST/07-integration-test.md`
  ```

---

## ⚠️ 중복/불필요한 내용 처리

### 중복 제거
1. **RENDER_QUICKSTART.md + RENDER_ENV_VARIABLES.md**
   - 중복: "Supabase 키 찾기" 절차
   - 통합: `03-deployment-setup.md`의 "환경 변수" 섹션에서 한 번만 설명

2. **SETUP_GUIDE.md vs docs/SCAFFOLD/01-workspace-setup.md**
   - 중복 없음 (SETUP_GUIDE는 Python/Docker 설치, SCAFFOLD는 모노레포 구조)

### 불필요한 내용 삭제
1. **NEXT_SESSION_RESUME.md**
   - 삭제: OAuth 구현 완료 내용 (800+ 줄)
   - 삭제: ngrok/Cloudflare 설정 (네트워크 연결 완료)
   - 유지: 일반적인 세션 재개 체크리스트 (100줄)

2. **MIGRATION_REQUIRED.md**
   - 상태: ✅ 마이그레이션 완료
   - 처리: ARCHIVE로 이동, "완료됨" 배너 추가

---

## 🚀 실행 계획

### 1단계: 신규 디렉터리 생성
```powershell
New-Item -ItemType Directory -Path "docs/ISSUES" -Force
New-Item -ItemType Directory -Path "docs/WORK" -Force
New-Item -ItemType Directory -Path "docs/WORK/ARCHIVE" -Force
```

### 2단계: ISSUES 파일 이동
```powershell
Move-Item "BACKEND_ISSUES.md" "docs/ISSUES/"
Move-Item "FRONTEND_ISSUES.md" "docs/ISSUES/"
Move-Item "FIX_CHECKLIST.md" "docs/ISSUES/"
```

### 3단계: SETUP 파일 이동 및 병합
```powershell
# SETUP_GUIDE 이동 및 이름 변경
Move-Item "SETUP_GUIDE.md" "docs/SETUP/02-python-docker-setup.md"

# RENDER 파일 병합 (수동 작업 필요)
# 1. 03-deployment-setup.md 생성
# 2. RENDER_QUICKSTART.md 내용 복사
# 3. RENDER_ENV_VARIABLES.md 내용 병합
# 4. 중복 제거
# 5. 원본 파일 삭제
```

### 4단계: TEST 파일 이동
```powershell
Move-Item "INTEGRATION_TEST.md" "docs/TEST/07-integration-test.md"
```

### 5단계: WORK 파일 이동 및 정리
```powershell
# NEXT_SESSION_RESUME 이동 (내용 수정 후)
# 1. 불필요한 내용 삭제 (OAuth 등)
# 2. docs/WORK/로 이동

# MIGRATION_REQUIRED 아카이브
Move-Item "MIGRATION_REQUIRED.md" "docs/WORK/ARCHIVE/session-2025-11-21.md"
# "완료됨" 배너 추가
```

### 6단계: README 파일 생성
```powershell
# docs/README.md (네비게이션 인덱스)
# docs/ISSUES/README.md (이슈 트래커 인덱스)
# docs/WORK/README.md (세션 관리 가이드)
```

### 7단계: 내부 링크 업데이트
- README.md (Root)
- .github/copilot-instructions.md
- FIX_CHECKLIST.md (상대 경로로 변경)

### 8단계: 검증
```powershell
# Root에 README.md만 남았는지 확인
Get-ChildItem -Path "." -Filter "*.md" | Where-Object { $_.Name -ne "README.md" }

# docs/ 하위 구조 확인
tree docs /F
```

---

## ✅ 완료 기준

- [ ] Root 디렉터리에 README.md 외 MD 파일 없음
- [ ] docs/ISSUES/ 디렉터리 생성 및 3개 파일 이동
- [ ] docs/SETUP/ 에 02, 03 파일 추가 (병합 포함)
- [ ] docs/TEST/ 에 07 파일 추가
- [ ] docs/WORK/ 디렉터리 생성 및 파일 정리
- [ ] docs/README.md 네비게이션 인덱스 생성
- [ ] 내부 링크 업데이트 (3개 파일)
- [ ] 모든 링크 테스트 (클릭 시 올바른 파일 열림)

---

## 📊 통계

**Before**:
- Root MD 파일: 10개 (README 제외 9개 이동 대상)
- docs/ 하위: 5개 디렉터리

**After**:
- Root MD 파일: 1개 (README.md만)
- docs/ 하위: 7개 디렉터리 (ISSUES, WORK 추가)
- 통합된 파일: 3개 (RENDER 파일 2개 → 1개)
- 삭제된 불필요한 내용: 약 800줄 (NEXT_SESSION_RESUME)

---

**작성자**: AI Copilot  
**최종 업데이트**: 2025-12-02  
**다음 단계**: 17번 Task (MD 파일 통합 실행) 진행
