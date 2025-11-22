import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 환경 변수 검증
if (!SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
}

/**
 * Supabase 브라우저 클라이언트
 * RLS 보호된 읽기 전용 작업에 사용
 * 쓰기 작업은 BFF를 경유해야 함
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
