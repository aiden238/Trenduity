# Web Console E2E 테스트 가이드

## 📦 개요

Playwright를 사용한 웹 콘솔의 End-to-End 테스트입니다.

## ✅ 테스트 커버리지

### 1. **Dashboard (dashboard.spec.ts)**
- ✅ 페이지 로드 및 렌더링
- ✅ 통계 카드 표시 (4개)
- ✅ 주간 활동 차트 렌더링
- ✅ 멤버 카드 그리드 표시
- ✅ 다크모드 토글
- ✅ 로딩 스켈레톤 표시
- ✅ 에러 상태 처리
- ✅ 멤버 상세 페이지 이동

**총 11개 테스트**

### 2. **Members (members.spec.ts)**
- ✅ 멤버 목록 페이지 로드
- ✅ 멤버 카드 정보 표시
- ✅ 멤버 클릭 → 상세 페이지 이동
- ✅ 검색 기능
- ✅ 필터링 기능
- ✅ 상세 정보 표시
- ✅ 뒤로가기 버튼
- ✅ 활동 히스토리 차트

**총 8개 테스트**

### 3. **Alerts & Encourage (alerts.spec.ts)**
- ✅ 알림 페이지 로드
- ✅ 알림 목록 표시
- ✅ 알림 타입별 필터링
- ✅ 알림 상세 보기
- ✅ 격려 메시지 페이지 로드
- ✅ 멤버 선택 UI
- ✅ 메시지 입력 폼
- ✅ 미리 정의된 템플릿 선택
- ✅ 격려 메시지 전송
- ✅ 필수 입력값 검증
- ✅ Dashboard/멤버 상세에서 격려 바로가기

**총 11개 테스트**

### 4. **접근성 (dashboard.spec.ts 내)**
- ✅ 키보드 네비게이션
- ✅ ARIA 속성

**총 2개 테스트**

---

**전체: 32개 E2E 테스트**

## 🚀 실행 방법

### 1. Playwright 설치

```bash
cd apps/web-next/e2e
npm install
npx playwright install
```

브라우저 드라이버 설치:
```bash
npx playwright install chromium firefox webkit
```

### 2. 개발 서버 실행 (자동)

Playwright가 자동으로 `npm run dev`를 실행하므로 별도 실행 불필요.

수동으로 실행하려면:
```bash
cd apps/web-next
npm run dev
```

### 3. 테스트 실행

```bash
# 루트에서 실행
cd apps/web-next

# 헤드리스 모드 (기본)
npm run test:e2e

# UI 모드 (권장)
npm run test:e2e:ui

# 특정 파일만 실행
cd e2e
npx playwright test dashboard.spec.ts

# 특정 브라우저만 실행
npx playwright test --project=chromium

# 디버그 모드
npx playwright test --debug

# 헤드풀 모드 (브라우저 보이기)
npx playwright test --headed
```

### 4. 리포트 보기

```bash
npm run test:e2e:report
```

자동으로 브라우저에서 HTML 리포트가 열립니다.

## 📁 파일 구조

```
apps/web-next/
├── e2e/
│   ├── dashboard.spec.ts    # Dashboard 페이지 테스트
│   ├── members.spec.ts      # Members 페이지 테스트
│   ├── alerts.spec.ts       # Alerts/Encourage 페이지 테스트
│   ├── fixtures.ts          # 테스트 픽스처 및 헬퍼
│   ├── playwright.config.ts # Playwright 설정
│   ├── package.json         # E2E 의존성
│   ├── tsconfig.json        # TypeScript 설정
│   ├── .gitignore          # 테스트 결과 무시
│   └── test-results/        # 테스트 결과 (자동 생성)
└── package.json             # E2E 스크립트 포함
```

## 🧪 테스트 작성 패턴

### 기본 구조

```typescript
import { test, expect } from '@playwright/test';

test.describe('페이지/기능 이름', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/path');
  });

  test('테스트 설명', async ({ page }) => {
    // 액션
    await page.click('button');
    
    // 검증
    await expect(page.getByText('결과')).toBeVisible();
  });
});
```

### 커스텀 픽스처 사용

```typescript
import { test, expect } from './fixtures';

test('BFF API 모킹', async ({ page, mockBffApi }) => {
  // mockBffApi 픽스처가 자동으로 API 응답 모킹
  await page.goto('http://localhost:3000');
  
  // 모킹된 데이터로 테스트
  await expect(page.getByText('홍길동')).toBeVisible();
});
```

### 헬퍼 함수 사용

```typescript
import { test, expect, waitForLoadingComplete } from './fixtures';

test('로딩 완료 후 테스트', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await waitForLoadingComplete(page);
  
  // 로딩 완료 후 검증
  await expect(page.getByRole('article')).toBeVisible();
});
```

## 📊 픽스처 및 헬퍼

### 제공되는 픽스처

**1. mockBffApi**
- BFF API 응답 자동 모킹
- 멤버 목록, 알림 목록 기본 데이터 제공

**2. loginAsAdmin**
- 관리자 권한 로그인 상태 모킹
- Supabase Auth 토큰 설정

### 제공되는 헬퍼

- `scrollIntoView(page, selector)` - 요소로 스크롤
- `waitForLoadingComplete(page)` - 로딩 완료 대기
- `waitForApiResponse(page, endpoint)` - API 응답 대기
- `expectToastVisible(page, message)` - Toast 확인
- `toggleDarkMode(page)` - 다크모드 전환
- `fillForm(page, fields)` - 폼 입력 자동화
- `takeScreenshot(page, name)` - 스크린샷 저장

## 🎯 테스트 전략

### 1. **Critical User Journeys**

우선순위 높은 사용자 플로우:

1. **Dashboard 확인** → 멤버 카드 클릭 → 상세 보기
2. **멤버 검색** → 필터링 → 상세 보기
3. **알림 확인** → 타입별 필터링 → 상세 보기
4. **격려 메시지 작성** → 멤버 선택 → 전송

### 2. **Edge Cases**

- 빈 데이터 상태 (Empty State)
- API 에러 응답
- 네트워크 지연
- 다크모드 전환

### 3. **Accessibility**

- 키보드 네비게이션
- ARIA 속성
- Focus 관리

## 🐛 문제 해결

### 1. "Target page, context or browser has been closed"

**원인**: 페이지가 예상보다 빨리 닫힘  
**해결**: 타임아웃 증가 또는 `page.waitForLoadState()` 추가

### 2. "Timeout 30000ms exceeded"

**원인**: 요소를 찾지 못함  
**해결**: 
- 셀렉터 확인
- 타임아웃 증가: `await expect(element).toBeVisible({ timeout: 60000 })`
- 로딩 완료 대기: `await waitForLoadingComplete(page)`

### 3. "Test failed on CI but passed locally"

**원인**: 환경 차이 (속도, 브라우저 버전)  
**해결**:
- `retries` 설정 (playwright.config.ts)
- 명시적 대기 추가: `page.waitForTimeout(500)`
- 네트워크 idle 대기: `page.waitForLoadState('networkidle')`

### 4. "Element is not visible"

**원인**: 스크롤 필요 또는 로딩 중  
**해결**:
```typescript
await page.locator(selector).scrollIntoViewIfNeeded();
await page.waitForSelector(selector, { state: 'visible' });
```

### 5. BFF API 연결 실패

**원인**: BFF 서버 미실행  
**해결**:
```bash
# 수동으로 BFF 실행
cd services/bff-fastapi
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8002
```

## 📚 참고 자료

- [Playwright 문서](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## 🎓 Best Practices

### ✅ Do

- 사용자 관점에서 테스트 (실제 클릭, 입력)
- role/label로 요소 찾기 (`getByRole`, `getByLabel`)
- 명시적 대기 사용 (`waitFor`, `toBeVisible`)
- 독립적인 테스트 (순서 의존성 없음)
- 의미 있는 테스트 이름

### ❌ Don't

- `data-testid` 남발 (시맨틱 셀렉터 우선)
- 하드코딩된 대기 (`page.waitForTimeout(5000)`)
- 테스트 간 상태 공유
- 너무 세밀한 구현 테스트
- 유닛 테스트와 혼동

### 예시: Good vs Bad

```typescript
// ❌ Bad - 구현 세부사항에 의존
await page.click('.css-class-123');
await page.waitForTimeout(3000);

// ✅ Good - 사용자 관점
await page.getByRole('button', { name: '전송' }).click();
await expect(page.getByText('전송 완료')).toBeVisible();
```

## 🚦 CI/CD 통합

### GitHub Actions 예시

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd apps/web-next
          npm ci
          cd e2e && npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd apps/web-next
          npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/web-next/e2e/test-results/
```

---

**작성일**: 2025년 1월  
**버전**: 1.0  
**상태**: Task 11 완료 ✅  
**총 테스트**: 32개 (Dashboard 11 + Members 8 + Alerts 11 + A11y 2)
