# 04. E2E Smoke Tests (Playwright)

> **목적**: 전체 플로우 엔드투엔드 검증 (선택사항)  
> **도구**: Playwright  
> **환경**: `e2e/tests/`

---

## 📋 목표

**최소한의 smoke tests**:
- 웹 대시보드 접속 및 주요 요소 확인
- (선택) 모바일 앱 홈 스크린 렌더링

---

## 🌐 Web E2E Tests

### `e2e/tests/dashboard.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // 페이지 로드 확인
    await expect(page).toHaveTitle(/Dashboard/);
    
    // 주요 요소 확인
    await expect(page.locator('h1')).toContainText('가족 대시보드');
  });
  
  test('should display senior list', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Senior 카드 확인
    const seniorCard = page.locator('[data-testid="senior-card"]').first();
    await expect(seniorCard).toBeVisible();
  });
  
  test('should navigate to senior detail', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Senior 클릭
    await page.locator('[data-testid="senior-card"]').first().click();
    
    // 상세 페이지 이동 확인
    await expect(page).toHaveURL(/\/dashboard\/[a-z0-9-]+/);
  });
});

test.describe('Auth', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/login/);
  });
});
```

---

## 📱 Mobile E2E (선택사항)

### Expo App Smoke Test

```typescript
// e2e/tests/mobile.spec.ts
import { device, element, by, expect as detoxExpect } from 'detox';

describe('Mobile App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  it('should show home screen', async () => {
    await detoxExpect(element(by.id('home-screen'))).toBeVisible();
  });
  
  it('should display today card', async () => {
    await detoxExpect(element(by.id('today-card'))).toBeVisible();
  });
});
```

---

## 🧪 실행 방법

### Playwright 설치

```bash
npm install -D @playwright/test
npx playwright install
```

### 테스트 실행

```bash
# 웹 서버 시작
npm run dev

# E2E 테스트 실행 (다른 터미널)
npx playwright test

# UI 모드
npx playwright test --ui

# 특정 브라우저만
npx playwright test --project=chromium
```

---

## ⚙️ Playwright 설정

### `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
});
```

---

## ✅ 체크리스트

- [ ] Dashboard 페이지 로드
- [ ] Senior 목록 표시
- [ ] Senior 상세 페이지 이동
- [ ] 인증 리다이렉트
- [ ] (선택) Mobile 홈 스크린

---

**문서 작성**: AI Test Guide  
**최종 업데이트**: 2025년 11월 13일
