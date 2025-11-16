import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Supabase 브라우저 클라이언트
 * 
 * TODO(IMPLEMENT): 환경변수 검증
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
