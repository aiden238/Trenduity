/**
 * E2E 테스트 헬퍼 함수
 */

/**
 * API 엔드포인트 호출 (인증 포함)
 */
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseURL = process.env.BFF_URL || 'http://localhost:8002';
  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * 테스트용 임시 유저 생성
 */
export async function createTestUser(): Promise<{ userId: string; token: string }> {
  // TODO: Supabase Auth를 통한 임시 유저 생성
  // 현재는 시드 데이터의 기존 유저 사용
  return {
    userId: 'test-user-id',
    token: 'test-auth-token',
  };
}

/**
 * 테스트 후 데이터 정리
 */
export async function cleanupTestData(userId: string): Promise<void> {
  // TODO: 테스트 유저의 데이터 삭제
  console.log(`[Cleanup] User ${userId} data removed`);
}

/**
 * 데이터베이스 직접 조회 (검증용)
 */
export async function queryDatabase<T>(
  table: string,
  condition: string
): Promise<T[]> {
  // TODO: Supabase client를 통한 직접 조회
  // 예: SELECT * FROM gamification WHERE user_id = 'test-user-id'
  console.log(`[DB Query] SELECT * FROM ${table} WHERE ${condition}`);
  return [];
}

/**
 * 대기 시간 (ms)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 랜덤 문자열 생성
 */
export function randomString(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}
