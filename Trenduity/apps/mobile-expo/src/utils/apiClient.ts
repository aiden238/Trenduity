import axios, { AxiosInstance } from 'axios';

/**
 * BFF API 클라이언트
 * 
 * 환경변수에서 BFF_API_URL을 읽어 사용
 * Authorization 헤더는 각 요청 시 추가 필요
 */

const BFF_API_URL = process.env.EXPO_PUBLIC_BFF_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BFF_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 인증 토큰 설정
 * 
 * 로그인 후 호출하여 모든 요청에 Authorization 헤더 추가
 */
export function setAuthToken(token: string) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

/**
 * 인증 토큰 제거
 * 
 * 로그아웃 시 호출
 */
export function clearAuthToken() {
  delete apiClient.defaults.headers.common['Authorization'];
}

/**
 * 에러 인터셉터
 * 
 * BFF의 envelope 패턴 에러를 처리
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error) {
      // BFF envelope 에러
      const { code, message } = error.response.data.error;
      throw new Error(message || '문제가 발생했어요. 다시 시도해 주세요.');
    }
    
    throw new Error('네트워크 연결을 확인해 주세요.');
  }
);
