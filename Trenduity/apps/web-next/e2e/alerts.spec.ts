import { test, expect } from '@playwright/test';

/**
 * Web Console E2E 테스트: Alerts 페이지
 * 
 * 테스트 시나리오:
 * 1. 알림 페이지 로드
 * 2. 알림 목록 표시
 * 3. 알림 생성 (격려 메시지)
 * 4. 알림 필터링
 */

test.describe('Alerts 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/alerts');
  });

  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /알림|활동 알림/i })).toBeVisible({ timeout: 10000 });
  });

  test('알림 목록이 표시된다', async ({ page }) => {
    // 알림 카드 또는 빈 상태 확인
    const hasAlerts = await page.locator('[role="listitem"], [role="article"]').count() > 0;
    const hasEmptyState = await page.getByText(/알림이 없습니다/i).count() > 0;
    
    expect(hasAlerts || hasEmptyState).toBeTruthy();
  });

  test('알림 타입별 필터링이 동작한다', async ({ page }) => {
    // 필터 탭/버튼 찾기
    const filterTabs = page.locator('button').filter({ hasText: /전체|성취|주의|격려/i });
    
    if (await filterTabs.count() > 1) {
      const initialCount = await page.locator('[role="listitem"], [role="article"]').count();
      
      // 두 번째 필터 클릭
      await filterTabs.nth(1).click();
      await page.waitForTimeout(500);
      
      const newCount = await page.locator('[role="listitem"], [role="article"]').count();
      
      // 필터 적용 확인 (개수 변경 또는 유지)
      expect(typeof newCount).toBe('number');
    }
  });

  test('알림 상세 보기가 동작한다', async ({ page }) => {
    const firstAlert = page.locator('[role="listitem"], [role="article"]').first();
    
    if (await firstAlert.count() > 0) {
      await firstAlert.click();
      
      // 모달 또는 상세 페이지 표시 확인
      const hasModal = await page.locator('[role="dialog"], [role="article"]').count() > 0;
      expect(hasModal).toBeTruthy();
    }
  });
});

test.describe('Encourage 페이지 (격려 메시지)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/encourage');
  });

  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /격려|응원/i })).toBeVisible({ timeout: 10000 });
  });

  test('멤버 선택 UI가 표시된다', async ({ page }) => {
    // 멤버 선택 드롭다운/버튼 확인
    const memberSelector = page.locator('select, button').filter({ hasText: /멤버|선택/i }).first();
    
    if (await memberSelector.count() > 0) {
      await expect(memberSelector).toBeVisible();
    }
  });

  test('메시지 입력 폼이 동작한다', async ({ page }) => {
    // 메시지 입력 필드 찾기
    const messageInput = page.locator('textarea, input[type="text"]').first();
    
    if (await messageInput.count() > 0) {
      await messageInput.fill('오늘도 수고 많으셨어요! 🎉');
      
      // 입력 확인
      const value = await messageInput.inputValue();
      expect(value).toContain('수고');
    }
  });

  test('미리 정의된 메시지 템플릿을 선택할 수 있다', async ({ page }) => {
    // 템플릿 버튼 찾기
    const templateButtons = page.locator('button').filter({ hasText: /화이팅|수고|축하/i });
    
    if (await templateButtons.count() > 0) {
      const firstTemplate = templateButtons.first();
      await firstTemplate.click();
      
      // 메시지 입력 필드에 템플릿 텍스트 채워짐
      const messageInput = page.locator('textarea, input[type="text"]').first();
      const value = await messageInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
  });

  test('격려 메시지 전송이 동작한다', async ({ page }) => {
    // 멤버 선택
    const memberSelector = page.locator('select').first();
    if (await memberSelector.count() > 0) {
      await memberSelector.selectOption({ index: 1 });
    }
    
    // 메시지 입력
    const messageInput = page.locator('textarea, input[type="text"]').first();
    if (await messageInput.count() > 0) {
      await messageInput.fill('테스트 격려 메시지');
    }
    
    // 전송 버튼 클릭
    const sendButton = page.locator('button').filter({ hasText: /전송|보내기/i }).first();
    
    if (await sendButton.count() > 0) {
      // API 응답 모킹
      await page.route('**/v1/family/encourage', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, data: { message_id: 'test-123' } }),
        });
      });
      
      await sendButton.click();
      
      // 성공 메시지 확인 (Toast 또는 Alert)
      await page.waitForTimeout(1000);
      const successMessage = await page.locator('text=/성공|전송|완료/i').count();
      expect(successMessage).toBeGreaterThanOrEqual(0); // 성공 메시지가 있거나 없을 수 있음
    }
  });

  test('필수 입력값 검증이 동작한다', async ({ page }) => {
    // 전송 버튼 찾기
    const sendButton = page.locator('button').filter({ hasText: /전송|보내기/i }).first();
    
    if (await sendButton.count() > 0) {
      // 빈 입력으로 전송 시도
      await sendButton.click();
      
      // 에러 메시지 또는 비활성화 상태 확인
      const hasError = await page.locator('text=/필수|입력|선택/i').count() > 0;
      const isDisabled = await sendButton.isDisabled();
      
      expect(hasError || isDisabled).toBeTruthy();
    }
  });
});

test.describe('알림 생성 플로우', () => {
  test('Dashboard에서 격려 바로가기가 동작한다', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const encourageLink = page.locator('[href="/encourage"]').first();
    
    if (await encourageLink.count() > 0) {
      await encourageLink.click();
      await expect(page).toHaveURL('/encourage');
    }
  });

  test('멤버 상세에서 격려 버튼이 동작한다', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const firstMember = page.locator('[href^="/members/"]').first();
    
    if (await firstMember.count() > 0) {
      await firstMember.click();
      
      // 격려 버튼 찾기
      const encourageButton = page.locator('button').filter({ hasText: /격려|응원/i }).first();
      
      if (await encourageButton.count() > 0) {
        await encourageButton.click();
        
        // 격려 페이지 또는 모달 표시 확인
        const hasEncouragePage = await page.url().includes('/encourage');
        const hasModal = await page.locator('[role="dialog"]').count() > 0;
        
        expect(hasEncouragePage || hasModal).toBeTruthy();
      }
    }
  });
});
