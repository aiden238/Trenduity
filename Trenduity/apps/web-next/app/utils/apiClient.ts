/**
 * BFF API 클라이언트 유틸리티
 * Envelope 패턴 { ok: boolean, data?: T, error?: E } 처리
 */

const BFF_BASE_URL = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:8000';

interface ApiError {
  code?: string;
  message: string;
}

interface EnvelopeResponse<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
}

class ApiClientError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * BFF API GET 요청
 */
export async function apiGet<T>(
  endpoint: string,
  token?: string
): Promise<T> {
  const url = `${BFF_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const envelope: EnvelopeResponse<T> = await response.json();

    if (!response.ok || !envelope.ok) {
      throw new ApiClientError(
        envelope.error?.message || '요청을 처리할 수 없어요.',
        envelope.error?.code,
        response.status
      );
    }

    if (!envelope.data) {
      throw new ApiClientError('응답 데이터가 없어요.', 'NO_DATA', response.status);
    }

    return envelope.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiClientError('네트워크 연결을 확인해 주세요.', 'NETWORK_ERROR');
    }
    throw new ApiClientError('알 수 없는 오류가 발생했어요.', 'UNKNOWN_ERROR');
  }
}

/**
 * BFF API POST 요청
 */
export async function apiPost<T, B = unknown>(
  endpoint: string,
  body?: B,
  token?: string
): Promise<T> {
  const url = `${BFF_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const envelope: EnvelopeResponse<T> = await response.json();

    if (!response.ok || !envelope.ok) {
      throw new ApiClientError(
        envelope.error?.message || '요청을 처리할 수 없어요.',
        envelope.error?.code,
        response.status
      );
    }

    if (!envelope.data) {
      throw new ApiClientError('응답 데이터가 없어요.', 'NO_DATA', response.status);
    }

    return envelope.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiClientError('네트워크 연결을 확인해 주세요.', 'NETWORK_ERROR');
    }
    throw new ApiClientError('알 수 없는 오류가 발생했어요.', 'UNKNOWN_ERROR');
  }
}

export { ApiClientError };
export type { ApiError, EnvelopeResponse };
