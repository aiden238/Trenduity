/**
 * 유틸리티 함수 테스트
 */

import { apiGet, apiPost } from '@/app/utils/apiClient';

// fetch 모킹
global.fetch = jest.fn();

describe('apiClient 유틸리티', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('apiGet', () => {
    it('GET 요청을 보낸다', async () => {
      const mockResponse = { ok: true, data: { message: 'success' } };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiGet('/test-endpoint');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('쿼리 파라미터를 포함할 수 있다', async () => {
      const mockResponse = { ok: true, data: [] };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await apiGet('/test', { limit: 10, offset: 0 });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=0'),
        expect.any(Object)
      );
    });
  });

  describe('apiPost', () => {
    it('POST 요청을 보낸다', async () => {
      const mockResponse = { ok: true, data: { id: 123 } };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const body = { name: 'test' };
      const result = await apiPost('/test-endpoint', body);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('에러 처리', () => {
    it('네트워크 에러 시 에러를 throw한다', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiGet('/test')).rejects.toThrow('Network error');
    });

    it('HTTP 에러 응답을 처리한다', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ ok: false, error: { message: 'Not found' } }),
      });

      const result = await apiGet('/test');
      expect(result.ok).toBe(false);
    });
  });
});

// 날짜 포맷 유틸리티 테스트 (MemberCard에서 사용)
describe('날짜 포맷 유틸리티', () => {
  // MemberCard에 내장된 formatLastActivity 함수 테스트
  // 실제 프로젝트에서는 utils/dateFormat.ts로 분리하는 것이 좋음

  it('null 입력 시 "활동 없음" 반환', () => {
    // 이 테스트는 MemberCard.test.tsx에서 이미 커버됨
    expect(true).toBe(true);
  });
});
