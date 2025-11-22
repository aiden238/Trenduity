import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// e2e/.env 파일 로드
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.parsed) {
    // 환경 변수를 process.env에 명시적으로 설정
    Object.assign(process.env, result.parsed);
    console.log(`[Playwright] Loaded ${Object.keys(result.parsed).length} env vars from ${envPath}`);
  }
} else {
  console.warn(`[Playwright] .env file not found at ${envPath}`);
}

/**
 * Playwright E2E 테스트 설정
 * 
 * 문서: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './scenarios',
  fullyParallel: false, // 순차 실행 (DB 상태 관리)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 단일 워커 (DB 충돌 방지)
  reporter: [
    ['html'],
    ['list'],
  ],
  use: {
    baseURL: process.env.BFF_URL || 'http://localhost:8002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // 환경 변수를 extraHTTPHeaders로 전달하지 말고, 테스트 코드에서 직접 사용
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // 필요 시 추가:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // 개발 서버 자동 시작 (BFF + Next.js)
  webServer: [
    {
      command: 'cd ../services/bff-fastapi && .\\venv\\Scripts\\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8002',
      url: 'http://localhost:8002/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'cd ../apps/web-next && npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
