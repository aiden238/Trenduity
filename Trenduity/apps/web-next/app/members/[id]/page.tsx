'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { apiGet } from '../../utils/apiClient';
import type { MemberProfile, MemberActivity } from '../../types/family';
import { useFamilyActivitySubscription } from '../../../hooks/useRealtimeSubscription';
import { TabNavigation, Tab } from '../../../components/TabNavigation';
import { BadgeGrid, DEFAULT_BADGES } from '../../../components/BadgeGrid';
import { ActivityChart } from '../../../components/ActivityChart';
import { StatCard } from '../../../components/StatCard';

/**
 * 회원 상세 페이지 (Enhanced UI)
 * 
 * ✅ BFF API 연동
 * ✅ 탭 네비게이션 (활동/배지/설정)
 * ✅ 프로필 헤더 (그라디언트)
 * ✅ 활동 차트 (recharts)
 * ✅ 배지 그리드
 * ✅ Realtime 업데이트
 */

const fetcher = (url: string) => apiGet<any>(url);

const TABS: Tab[] = [
  { id: 'activity', label: '활동', icon: '📊' },
  { id: 'badges', label: '배지', icon: '🏆' },
  { id: 'settings', label: '설정', icon: '⚙️' },
];

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
  const [activeTab, setActiveTab] = React.useState('activity');
  
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

  // 차트 데이터 변환
  const chartData = activityData?.daily_activities.map(activity => ({
    date: activity.date,
    completed: activity.cards_completed,
    quizCorrect: activity.med_checks, // 복약 체크를 퀴즈로 표시
  })) || [];

  // 배지 데이터 변환
  const earnedBadges = (profileData?.badges || []).map((badgeId: string) => {
    const badge = DEFAULT_BADGES.find(b => b.id === badgeId);
    return badge ? { ...badge, earnedAt: new Date().toISOString() } : null;
  }).filter(Boolean);
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.push('/')}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>대시보드로 돌아가기</span>
      </button>

      {/* 실시간 활동 알림 */}
      {realtimeActivity && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-800 px-6 py-4 rounded-xl mb-8 flex items-center shadow-md animate-slide-in-right">
          <span className="text-2xl mr-3">🎉</span>
          <div>
            <p className="font-semibold">{realtimeActivity}</p>
            <p className="text-sm text-green-600">방금 전</p>
          </div>
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
          {/* 프로필 헤더 (그라디언트) */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* 아바타 */}
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-5xl font-bold border-4 border-white/30">
                  {profileData.name[0]}
                </div>
                
                {/* 기본 정보 */}
                <div>
                  <h1 className="text-4xl font-bold mb-2">{profileData.name}</h1>
                  <p className="text-blue-100 mb-1">{profileData.email || '이메일 없음'}</p>
                  <p className="text-sm text-blue-200">
                    가입일: {formatDate(profileData.created_at)}
                  </p>
                </div>
              </div>

              {/* 빠른 통계 */}
              <div className="hidden md:flex gap-6">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                  <div className="text-3xl font-bold">{profileData.total_points}</div>
                  <div className="text-sm text-blue-100">포인트</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                  <div className="text-3xl font-bold">{profileData.current_streak}</div>
                  <div className="text-sm text-blue-100">일 연속</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                  <div className="text-3xl font-bold">{profileData.badges.length}</div>
                  <div className="text-sm text-blue-100">배지</div>
                </div>
              </div>
            </div>
          </div>

          {/* 통계 카드 그리드 (모바일용) */}
          <div className="grid grid-cols-1 md:hidden gap-4 mb-8">
            <StatCard
              icon="⭐"
              value={profileData.total_points}
              label="총 포인트"
              gradient="from-yellow-500 to-amber-600"
            />
            <StatCard
              icon="🔥"
              value={profileData.current_streak}
              label="연속 학습"
              unit="일"
              gradient="from-orange-500 to-red-600"
            />
            <StatCard
              icon="🏆"
              value={profileData.badges.length}
              label="획득 배지"
              unit="개"
              gradient="from-purple-500 to-pink-600"
            />
          </div>

          {/* 탭 네비게이션 */}
          <TabNavigation
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          {/* 탭 컨텐츠 */}
          {activeTab === 'activity' && (
            <div className="space-y-8">
              {/* 주간 요약 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                  icon="📚"
                  value={activityData.total_cards_7days}
                  label="완료한 학습 카드"
                  unit="개"
                  gradient="from-green-500 to-emerald-600"
                  info="최근 7일"
                />
                <StatCard
                  icon="💊"
                  value={activityData.total_med_checks_7days}
                  label="복약 체크"
                  unit="회"
                  gradient="from-purple-500 to-indigo-600"
                  info="최근 7일"
                />
              </div>

              {/* 주간 활동 차트 */}
              <ActivityChart data={chartData} height={320} />
              
              {/* 복약 체크 히스토리 */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">💊 복약 체크 히스토리</h3>
                
                {activityData.total_med_checks_7days === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💊</div>
                    <p className="text-gray-500">최근 7일 동안 복약 체크 기록이 없어요.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activityData.daily_activities
                      .filter(activity => activity.med_checks > 0)
                      .map((activity) => (
                        <div
                          key={activity.date}
                          className="flex justify-between items-center bg-purple-50 rounded-lg px-4 py-3 hover:bg-purple-100 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {formatDate(activity.date)}
                          </span>
                          <span className="text-sm font-bold text-purple-600 bg-white px-3 py-1 rounded-full">
                            {activity.med_checks}회 체크 ✅
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">🏆 배지 컬렉션</h3>
                <p className="text-gray-600">
                  {earnedBadges.length}/{DEFAULT_BADGES.length}개 획득 
                  ({Math.round((earnedBadges.length / DEFAULT_BADGES.length) * 100)}%)
                </p>
              </div>
              
              <BadgeGrid
                earnedBadges={earnedBadges}
                allBadges={DEFAULT_BADGES}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">⚙️ 설정</h3>
              
              <div className="space-y-6">
                {/* 알림 설정 */}
                <div className="border-b pb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">알림 설정</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <span className="text-sm text-gray-700">활동 알림 받기</span>
                      <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <span className="text-sm text-gray-700">복약 체크 알림</span>
                      <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                    </label>
                  </div>
                </div>

                {/* 권한 정보 */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">내 권한</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      ✅ 활동 조회 권한
                    </p>
                    <p className="text-sm text-blue-900">
                      ✅ 알림 수신 권한
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
