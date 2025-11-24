import { test as base } from '@playwright/test';

/**
 * E2E 테스트 픽스처 및 헬퍼
 */

// 커스텀 픽스처 타입
type CustomFixtures = {
  mockBffApi: void;
  loginAsAdmin: void;
};

// 픽스처 확장
export const test = base.extend<CustomFixtures>({
  // BFF API 모킹
  mockBffApi: async ({ page }, use) => {
    // 성공 응답 기본 모킹
    await page.route('**/v1/**', async (route, request) => {
      const url = request.url();
      
      // 멤버 목록
      if (url.includes('/v1/family/members')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            data: {
              members: [
                {
                  user_id: 'user-1',
                  name: '홍길동',
                  last_activity: new Date().toISOString(),
                  current_streak: 7,
                  total_points: 150,
                  perms: { read: true, alerts: true },
                },
                {
                  user_id: 'user-2',
                  name: '김철수',
                  last_activity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                  current_streak: 3,
                  total_points: 80,
                  perms: { read: true, alerts: false },
                },
              ],
            },
          }),
        });
        return;
      }
      
      // 알림 목록
      if (url.includes('/v1/family/alerts')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            data: {
              alerts: [
                {
                  id: 'alert-1',
                  type: 'achievement',
                  title: '7일 연속 달성!',
                  message: '홍길동님이 7일 연속으로 학습했어요',
                  created_at: new Date().toISOString(),
                },
              ],
            },
          }),
        });
        return;
      }
      
      // 기타 요청은 통과
      await route.continue();
    });
    
    await use();
  },

  // 관리자 로그인 (Supabase Auth 모킹)
  loginAsAdmin: async ({ page }, use) => {
    // 로그인 상태 모킹 (localStorage)
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-admin-token',
        user: {
          id: 'admin-123',
          email: 'admin@trenduity.com',
        },
      }));
    });
    
    await use();
  },
});

export { expect } from '@playwright/test';

/**
 * 헬퍼 함수들
 */

// 요소가 화면에 보일 때까지 스크롤
export async function scrollIntoView(page: any, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

// 로딩 완료 대기
export async function waitForLoadingComplete(page: any) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 5000 }).catch(() => {
    // 스켈레톤이 없으면 무시
  });
}

// API 응답 대기
export async function waitForApiResponse(page: any, endpoint: string) {
  return page.waitForResponse(
    (response: any) => response.url().includes(endpoint) && response.status() === 200,
    { timeout: 10000 }
  );
}

// Toast 메시지 확인
export async function expectToastVisible(page: any, message: string) {
  const toast = page.locator(`text=${message}`).first();
  await toast.waitFor({ state: 'visible', timeout: 5000 });
}

// 다크모드 토글
export async function toggleDarkMode(page: any) {
  const button = page.locator('button').filter({ hasText: /dark|light|theme/i }).first();
  if (await button.count() > 0) {
    await button.click();
    await page.waitForTimeout(300); // 애니메이션 대기
  }
}

// 폼 입력 헬퍼
export async function fillForm(page: any, fields: Record<string, string>) {
  for (const [selector, value] of Object.entries(fields)) {
    await page.locator(selector).fill(value);
  }
}

// 스크린샷 비교 (시각적 회귀 테스트)
export async function takeScreenshot(page: any, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}
