import { test, expect } from '@playwright/test';

/**
 * Web Console E2E 테스트: Dashboard
 * 
 * 테스트 시나리오:
 * 1. Dashboard 페이지 로드
 * 2. 통계 카드 표시 확인
 * 3. 차트 렌더링 확인
 * 4. 멤버 카드 표시 확인
 * 5. 다크모드 토글
 */

test.describe('Dashboard 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // Dashboard로 이동
    await page.goto('http://localhost:3000');
  });

  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    // 타이틀 확인
    await expect(page).toHaveTitle(/Trenduity/i);
    
    // 주요 헤딩 확인
    await expect(page.getByRole('heading', { name: /대시보드/i })).toBeVisible();
  });

  test('통계 카드들이 표시된다', async ({ page }) => {
    // 통계 카드 대기 (SWR 로딩)
    await page.waitForSelector('[role="article"]', { timeout: 10000 });
    
    // 최소 3개 이상의 통계 카드 표시
    const statCards = page.locator('[role="article"]');
    await expect(statCards).toHaveCount(4); // 총 멤버, 활동 중, 총 포인트, 누적 스트릭
    
    // 각 카드에 값이 표시되는지 확인
    for (let i = 0; i < await statCards.count(); i++) {
      const card = statCards.nth(i);
      await expect(card).toBeVisible();
    }
  });

  test('주간 활동 차트가 렌더링된다', async ({ page }) => {
    // 차트 섹션 대기
    await page.waitForSelector('[aria-label*="차트"]', { timeout: 10000 });
    
    // recharts SVG 확인
    const chartSvg = page.locator('svg').first();
    await expect(chartSvg).toBeVisible();
  });

  test('멤버 카드 그리드가 표시된다', async ({ page }) => {
    // "가족 멤버" 헤딩 확인
    await expect(page.getByRole('heading', { name: /가족 멤버/i })).toBeVisible();
    
    // 멤버 카드 또는 빈 상태 확인
    const hasMemberCards = await page.locator('[href^="/members/"]').count() > 0;
    const hasEmptyState = await page.locator('[role="status"]', { hasText: /연동된 가족 멤버가 없어요/i }).count() > 0;
    
    expect(hasMemberCards || hasEmptyState).toBeTruthy();
  });

  test('다크모드 토글이 동작한다', async ({ page }) => {
    // 다크모드 버튼 찾기
    const darkModeButton = page.locator('button').filter({ hasText: /dark|light|theme/i }).first();
    
    if (await darkModeButton.count() > 0) {
      // 초기 상태 확인
      const htmlElement = page.locator('html');
      const initialClass = await htmlElement.getAttribute('class');
      
      // 토글 클릭
      await darkModeButton.click();
      await page.waitForTimeout(500); // 애니메이션 대기
      
      // 클래스 변경 확인
      const newClass = await htmlElement.getAttribute('class');
      expect(initialClass).not.toBe(newClass);
    }
  });

  test('로딩 상태에서 스켈레톤이 표시된다', async ({ page }) => {
    // 네트워크를 느리게 설정
    await page.route('**/v1/family/members', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 지연
      await route.continue();
    });
    
    await page.goto('http://localhost:3000');
    
    // 스켈레톤 로더 확인 (첫 2초 동안)
    const skeleton = page.locator('.animate-pulse').first();
    await expect(skeleton).toBeVisible({ timeout: 1000 });
  });

  test('에러 발생 시 에러 상태를 표시한다', async ({ page }) => {
    // API 응답을 에러로 모킹
    await page.route('**/v1/family/members', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: { message: '서버 오류' } }),
      });
    });
    
    await page.goto('http://localhost:3000');
    
    // 에러 메시지 확인
    await expect(page.getByText(/문제가 발생했습니다|오류/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('멤버 상세 페이지', () => {
  test('멤버 카드 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 멤버 카드 대기
    const memberCard = page.locator('[href^="/members/"]').first();
    
    if (await memberCard.count() > 0) {
      await memberCard.click();
      
      // URL 변경 확인
      await expect(page).toHaveURL(/\/members\/.+/);
      
      // 상세 페이지 콘텐츠 확인
      await expect(page.getByRole('heading')).toBeVisible();
    }
  });
});

test.describe('네비게이션', () => {
  test('전체 보기 링크가 Members 페이지로 이동한다', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // "전체 보기" 링크 찾기
    const viewAllLink = page.getByRole('link', { name: /전체 보기/i });
    
    if (await viewAllLink.count() > 0) {
      await viewAllLink.click();
      
      // URL 확인
      await expect(page).toHaveURL(/\/members$/);
    }
  });

  test('바로가기 액션이 올바른 페이지로 이동한다', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 알림 바로가기
    const alertLink = page.locator('[href="/alerts"]').first();
    if (await alertLink.count() > 0) {
      await alertLink.click();
      await expect(page).toHaveURL('/alerts');
      await page.goBack();
    }
    
    // 격려 바로가기
    const encourageLink = page.locator('[href="/encourage"]').first();
    if (await encourageLink.count() > 0) {
      await encourageLink.click();
      await expect(page).toHaveURL('/encourage');
    }
  });
});

test.describe('접근성', () => {
  test('키보드 네비게이션이 동작한다', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Tab으로 포커스 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // 포커스된 요소 확인
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'DIV']).toContain(focusedElement);
  });

  test('적절한 ARIA 속성을 가진다', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // aria-label 확인
    const articlesWithLabel = await page.locator('[role="article"][aria-label]').count();
    expect(articlesWithLabel).toBeGreaterThan(0);
    
    // heading 구조 확인
    const headings = await page.locator('h1, h2, h3').count();
    expect(headings).toBeGreaterThan(0);
  });
});
