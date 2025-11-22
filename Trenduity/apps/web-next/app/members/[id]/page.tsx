'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { apiGet } from '../../utils/apiClient';
import type { MemberProfile, MemberActivity } from '../../types/family';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';

/**
 * 회원 상세 페이지
 * 
 * BFF API 연동 완료 ✅
 * - 프로필 정보 (이름, 이메일, 포인트, 배지)
 * - 주간 활동 차트 (7일 카드 완료)
 * - 복약 체크 히스토리
 * - Realtime 업데이트 (카드 완료, 복약 체크) ✅
 */

const fetcher = (url: string) => apiGet<any>(url);

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MemberDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const memberId = resolvedParams.id;
  const [realtimeActivity, setRealtimeActivity] = React.useState<string | null>(null);
  
  // 프로필 데이터
  const { data: profileData, error: profileError, isLoading: profileLoading, mutate: mutateProfile } = useSWR<MemberProfile>(
    `/v1/family/members/${memberId}/profile`,
    fetcher,
    { revalidateOnFocus: true }
  );
  
  // 활동 데이터
  const { data: activityData, error: activityError, isLoading: activityLoading, mutate: mutateActivity } = useSWR<MemberActivity>(
    `/v1/family/members/${memberId}/activity`,
    fetcher,
    { refreshInterval: 60000 } // 1분마다 갱신
  );

  // ✅ Realtime 구독: 회원의 활동을 실시간으로 모니터링
  useRealtimeSubscription([
    {
      table: 'completed_cards',
      event: 'INSERT',
      filter: `user_id=eq.${memberId}`,
      callback: (payload) => {
        console.log('[Realtime] Card completed:', payload);
        setRealtimeActivity('학습 카드를 완료했어요! 🎉');
        mutateProfile(); // 포인트 업데이트
        mutateActivity(); // 활동 데이터 새로고침
        setTimeout(() => setRealtimeActivity(null), 5000);
      },
    },
    {
      table: 'med_checks',
      event: 'INSERT',
      filter: `user_id=eq.${memberId}`,
      callback: (payload) => {
        console.log('[Realtime] Med check:', payload);
        setRealtimeActivity('복약 체크를 했어요! 💊');
        mutateActivity(); // 활동 데이터 새로고침
        setTimeout(() => setRealtimeActivity(null), 5000);
      },
    },
    {
      table: 'usage_counters',
      event: 'UPDATE',
      filter: `user_id=eq.${memberId}`,
      callback: (payload) => {
        console.log('[Realtime] Usage counter updated:', payload);
        mutateProfile(); // 통계 업데이트
        mutateActivity(); // 활동 데이터 새로고침
      },
    },
  ]);
  
  const isLoading = profileLoading || activityLoading;
  const hasError = profileError || activityError;
  
  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← 대시보드로 돌아가기
        </button>
      </div>
      
      <h2 className="text-3xl font-bold mb-6">회원 상세</h2>

      {/* 실시간 활동 알림 */}
      {realtimeActivity && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center animate-fade-in">
          <span className="mr-2">🎉</span>
          <span>{realtimeActivity}</span>
        </div>
      )}
      
      {/* 로딩 */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      )}
      
      {/* 에러 */}
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">
            {(profileError || activityError)?.message || '데이터를 불러올 수 없어요.'}
          </p>
        </div>
      )}
      
      {/* 데이터 표시 */}
      {!isLoading && !hasError && profileData && activityData && (
        <>
          {/* 프로필 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 기본 정보 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">이름</p>
                  <p className="text-xl font-bold">{profileData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">이메일</p>
                  <p className="text-sm">{profileData.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">가입일</p>
                  <p className="text-sm">{formatDate(profileData.created_at)}</p>
                </div>
              </div>
            </div>
            
            {/* 포인트 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">활동 포인트</h3>
              <p className="text-5xl font-bold text-blue-600">{profileData.total_points}</p>
              <p className="text-sm text-gray-600 mt-2">누적 포인트</p>
            </div>
            
            {/* 배지 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">획득 배지</h3>
              <p className="text-5xl font-bold text-yellow-600">{profileData.badges.length}</p>
              <p className="text-sm text-gray-600 mt-2">개 획득</p>
            </div>
          </div>
          
          {/* 주간 활동 섹션 */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">최근 7일 활동</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">완료한 학습 카드</p>
                <p className="text-3xl font-bold text-green-600">{activityData.total_cards_7days}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">복약 체크</p>
                <p className="text-3xl font-bold text-purple-600">{activityData.total_med_checks_7days}</p>
              </div>
            </div>
            
            {/* 간단한 막대 차트 (CSS만으로) */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 mb-3">일별 학습 카드 완료</p>
              {activityData.daily_activities.map((activity) => {
                const maxValue = Math.max(...activityData.daily_activities.map(a => a.cards_completed), 1);
                const percentage = (activity.cards_completed / maxValue) * 100;
                
                return (
                  <div key={activity.date} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20">
                      {new Date(activity.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        {activity.cards_completed > 0 && (
                          <span className="text-xs text-white font-semibold">{activity.cards_completed}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 복약 체크 히스토리 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">복약 체크 히스토리</h3>
            
            {activityData.total_med_checks_7days === 0 ? (
              <p className="text-gray-600 text-center py-4">
                최근 7일 동안 복약 체크 기록이 없어요.
              </p>
            ) : (
              <div className="space-y-2">
                {activityData.daily_activities
                  .filter(activity => activity.med_checks > 0)
                  .map((activity) => (
                    <div key={activity.date} className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-gray-700">
                        {formatDate(activity.date)}
                      </span>
                      <span className="text-sm font-semibold text-purple-600">
                        {activity.med_checks}회 체크
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
