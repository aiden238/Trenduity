import { useCallback } from 'react';
import { supabase } from '../config/supabase';

/**
 * Supabase 훅 (스텁)
 * 
 * TODO(IMPLEMENT): 실제 쿼리 로직 구현
 */
export const useSupabase = () => {
  const fetchCards = useCallback(async () => {
    // TODO: 실제 Supabase 쿼리
    console.log('[TODO] fetchCards: Supabase query not implemented');
    return [];
  }, []);

  const fetchInsights = useCallback(async (topic: string) => {
    // TODO: 실제 Supabase 쿼리
    console.log(`[TODO] fetchInsights(${topic}): Supabase query not implemented`);
    return [];
  }, []);

  return { fetchCards, fetchInsights };
};
