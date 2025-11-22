import { test, expect } from '@playwright/test';

/**
 * 간단한 Health Check 테스트
 */
test.describe('BFF Health Check', () => {
  test('서버가 실행 중이고 /health 응답', async ({ request }) => {
    const response = await request.get('http://localhost:8002/health');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('env');
  });
});
