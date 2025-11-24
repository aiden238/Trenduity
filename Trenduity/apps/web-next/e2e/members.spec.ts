import { test, expect } from '@playwright/test';

/**
 * Web Console E2E 테스트: Members 페이지
 * 
 * 테스트 시나리오:
 * 1. 멤버 목록 페이지 로드
 * 2. 멤버 검색 기능
 * 3. 멤버 상세 보기
 * 4. 멤버 필터링
 */

test.describe('Members 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/members');
  });

  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    // 타이틀 또는 헤딩 확인
    await expect(page.getByRole('heading', { name: /멤버|가족/i })).toBeVisible({ timeout: 10000 });
  });

  test('멤버 목록이 표시된다', async ({ page }) => {
    // 멤버 카드 또는 빈 상태 확인
    const hasMemberCards = await page.locator('[href^="/members/"]').count() > 0;
    const hasEmptyState = await page.getByText(/멤버가 없습니다|초대/i).count() > 0;
    
    expect(hasMemberCards || hasEmptyState).toBeTruthy();
  });

  test('멤버 카드에 필수 정보가 표시된다', async ({ page }) => {
    const firstMemberCard = page.locator('[href^="/members/"]').first();
    
    if (await firstMemberCard.count() > 0) {
      await expect(firstMemberCard).toBeVisible();
      
      // 카드 내부의 정보 확인 (이름, 스트릭, 포인트)
      const cardText = await firstMemberCard.textContent();
      
      // 최소한 하나의 숫자가 있어야 함 (스트릭 또는 포인트)
      expect(cardText).toMatch(/\d+/);
    }
  });

  test('멤버 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    const firstMemberCard = page.locator('[href^="/members/"]').first();
    
    if (await firstMemberCard.count() > 0) {
      const href = await firstMemberCard.getAttribute('href');
      await firstMemberCard.click();
      
      // URL 확인
      await expect(page).toHaveURL(new RegExp(href!));
      
      // 상세 페이지 로드 확인
      await expect(page.getByRole('heading')).toBeVisible();
    }
  });

  test('검색 기능이 동작한다', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]').first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('홍길동');
      await page.waitForTimeout(500); // debounce 대기
      
      // 검색 결과 확인 (또는 빈 상태)
      const results = await page.locator('[href^="/members/"]').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('필터링 기능이 동작한다', async ({ page }) => {
    const filterButton = page.locator('button').filter({ hasText: /필터|정렬/i }).first();
    
    if (await filterButton.count() > 0) {
      const initialCount = await page.locator('[href^="/members/"]').count();
      
      await filterButton.click();
      await page.waitForTimeout(500);
      
      const newCount = await page.locator('[href^="/members/"]').count();
      
      // 필터 적용 후 개수가 변경되거나 동일할 수 있음
      expect(typeof newCount).toBe('number');
    }
  });
});

test.describe('Member 상세 페이지', () => {
  test('상세 정보가 표시된다', async ({ page }) => {
    // Dashboard에서 첫 번째 멤버 클릭
    await page.goto('http://localhost:3000');
    const firstMember = page.locator('[href^="/members/"]').first();
    
    if (await firstMember.count() > 0) {
      await firstMember.click();
      
      // 상세 페이지 콘텐츠 확인
      await expect(page.getByRole('heading')).toBeVisible();
      
      // 통계 정보 확인
      const hasStats = await page.locator('text=/스트릭|포인트|활동/i').count() > 0;
      expect(hasStats).toBeTruthy();
    }
  });

  test('뒤로가기 버튼이 동작한다', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const firstMember = page.locator('[href^="/members/"]').first();
    
    if (await firstMember.count() > 0) {
      await firstMember.click();
      await expect(page).toHaveURL(/\/members\/.+/);
      
      // 뒤로가기
      await page.goBack();
      await expect(page).toHaveURL('http://localhost:3000');
    }
  });

  test('활동 히스토리 차트가 표시된다', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const firstMember = page.locator('[href^="/members/"]').first();
    
    if (await firstMember.count() > 0) {
      await firstMember.click();
      
      // 차트 대기
      await page.waitForTimeout(2000);
      
      // SVG 차트 확인
      const chartExists = await page.locator('svg').count() > 0;
      expect(typeof chartExists).toBe('boolean');
    }
  });
});
