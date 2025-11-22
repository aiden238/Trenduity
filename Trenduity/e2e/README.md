# E2E 테스트 설정

## Playwright 설치 및 설정

```powershell
# 루트 디렉터리에서 실행
npm install -D @playwright/test
npx playwright install chromium
```

## 테스트 구조

```
Trenduity/
├── e2e/
│   ├── playwright.config.ts       # Playwright 설정
│   ├── fixtures/                  # 테스트 픽스처
│   │   └── auth.ts
│   ├── scenarios/                 # 시나리오별 테스트
│   │   ├── card-completion.spec.ts
│   │   ├── scam-check.spec.ts
│   │   ├── med-check.spec.ts
│   │   ├── family-link.spec.ts
│   │   └── a11y-mode.spec.ts
│   └── utils/                     # 테스트 유틸
│       └── helpers.ts
```

## 시나리오 개요

### 1. 카드 완료 플로우 (2h)
- **목표**: 오늘의 카드 읽기 → 퀴즈 풀기 → 완료 → 포인트 확인
- **검증**: gamification 테이블의 points 증가
- **엔드포인트**: 
  - GET /v1/cards/today
  - POST /v1/cards/complete

### 2. 사기 검사 플로우 (1h)
- **목표**: 의심 텍스트 입력 → BFF 검사 → 위험도 라벨 표시
- **검증**: scam_checks 테이블에 기록
- **엔드포인트**: 
  - POST /v1/scam/check

### 3. 복약 체크 플로우 (1h)
- **목표**: 복약 버튼 클릭 → 체크 기록 → 알림 생성
- **검증**: med_checks, family_alerts 테이블
- **엔드포인트**: 
  - POST /v1/med/check

### 4. 가족 연동 플로우 (2h)
- **목표**: 웹 로그인 → 멤버 목록 → 상세 페이지 → 통계 확인
- **검증**: family_members, gamification 조회
- **엔드포인트**: 
  - GET /v1/family/members
  - GET /v1/family/members/:id/activity

### 5. 접근성 모드 플로우 (1h)
- **목표**: 설정 화면 → 모드 변경 → 폰트/버튼 크기 검증
- **검증**: CSS 계산 값 확인
- **엔드포인트**: 없음 (클라이언트 전용)

## 실행 방법

```powershell
# 모든 테스트 실행
npm run test:e2e

# 특정 시나리오만 실행
npx playwright test scenarios/card-completion.spec.ts

# UI 모드로 실행 (디버깅)
npx playwright test --ui

# 헤드풀 모드 (브라우저 보기)
npx playwright test --headed
```

## 환경 설정

테스트 실행 전 필요 사항:
1. BFF 서버 실행 중 (http://localhost:8000)
2. Supabase 연결 설정 (.env 파일)
3. 시드 데이터 삽입 완료 (seed_data.py)

## CI 통합

GitHub Actions 워크플로우 (`.github/workflows/e2e-tests.yml`):
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```
