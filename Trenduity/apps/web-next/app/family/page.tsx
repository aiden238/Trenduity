'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { apiGet } from './utils/apiClient';
import type { FamilyMembersResponse } from './types/family';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useFamilyActivitySubscription } from '../hooks/useRealtimeSubscription';
import { StatCard } from '../components/StatCard';
import { MemberCard } from '../components/MemberCard';
import { CardSkeleton } from '../components/Skeleton';
import { ErrorBoundary } from '../components/ErrorBoundary';
// 차트 컴포넌트 Lazy Loading (번들 크기 최적화)
import { 
  LazyActivityChart, 
  LazyBarChart, 
  LazyPieChart, 
  LazyAreaChart 
} from '../components/LazyCharts';
import { useTheme } from 'next-themes';
import { Suspense } from 'react';
import { ChartSkeleton } from '../components/Skeleton';

/**
 * 메인 대시보드 (Enhanced UI)
 * 
 * ✅ BFF API 연동 완료
 * ✅ 통계 카드 (StatCard)
 * ✅ 멤버 카드 (MemberCard)
 * ✅ 주간 활동 차트 (ActivityChart)
 * ✅ Realtime 구독
 */

// SWR fetcher 함수
const fetcher = (url: string) => apiGet<FamilyMembersResponse>(url);

// 더미 차트 데이터 (TODO: BFF API 통합)
const generateMockChartData = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString(),
      completed: Math.floor(Math.random() * 5) + 1,
      quizCorrect: Math.floor(Math.random() * 3),
    };
  });
};

// 월별 카드 완료 데이터 (최근 12개월)
const generateMonthlyCardData = () => {
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  return months.map((month, i) => ({
    name: month,
    value: Math.floor(Math.random() * 30) + 10,
  }));
};

// 카테고리별 카드 분포 데이터
const generateCategoryData = () => {
  return [
    { name: 'AI 도구', value: 42, color: '#3B82F6', icon: '🤖' },
    { name: '디지털 안전', value: 35, color: '#10B981', icon: '🔒' },
    { name: '건강', value: 28, color: '#F59E0B', icon: '💊' },
    { name: '금융', value: 22, color: '#EF4444', icon: '💰' },
  ];
};

// 누적 포인트 데이터 (최근 30일)
const generateCumulativePointsData = () => {
  let cumulative = 0;
  return Array.from({ length: 30 }, (_, i) => {
    cumulative += Math.floor(Math.random() * 15) + 5;
    return {
      name: `${i + 1}일`,
      value: cumulative,
    };
  });
};

function formatLastActivity(lastActivity: string | null): string {
  if (!lastActivity) return '활동 없음';
  
  const date = new Date(lastActivity);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays}일 전`;
  if (diffHours > 0) return `${diffHours}시간 전`;
  return '방금 전';
}

export default function DashboardPage() {
  const [recentActivity, setRecentActivity] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // BFF API로 가족 멤버 조회
  const { data, error, isLoading, mutate } = useSWR<FamilyMembersResponse>(
    '/v1/family/members',
    fetcher,
    {
      refreshInterval: 30000, // 30초마다 갱신
      revalidateOnFocus: true,
    }
  );

  const members = data?.members || [];
  const memberIds = members.map(m => m.user_id);

  // ✅ Realtime 구독: 가족 멤버의 활동을 실시간으로 모니터링
  useFamilyActivitySubscription(memberIds, (activity) => {
    console.log('[Realtime] Family activity:', activity);
    
    // 활동 타입에 따른 메시지 생성
    const activityMessage = 
      activity.type === 'card_completed' 
        ? '카드를 완료했어요!' 
        : '복약 체크를 했어요!';
    
    setRecentActivity(`${members.find(m => m.user_id === activity.userId)?.name || '회원'}님이 ${activityMessage}`);
    
    // 멤버 목록 새로고침
    mutate();

    // 5초 후 메시지 제거
    setTimeout(() => setRecentActivity(null), 5000);
  });

  // 차트 데이터 (임시)
  const chartData = generateMockChartData();
  const monthlyCardData = generateMonthlyCardData();
  const categoryData = generateCategoryData();
  const cumulativePointsData = generateCumulativePointsData();

  // 활동 통계 계산
  const activeMembers = members.filter(m => {
    if (!m.last_activity) return false;
    const daysDiff = Math.floor((Date.now() - new Date(m.last_activity).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 1;
  }).length;

  const totalPoints = members.reduce((sum, m) => sum + (m.total_points || 0), 0);
  const totalStreak = members.reduce((sum, m) => sum + (m.current_streak || 0), 0);

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <header className="mb-8">
        <h1 id="page-title" className="text-4xl font-bold text-gray-900 dark:text-white mb-2">가족 대시보드</h1>
        <p className="text-gray-800 dark:text-slate-300">가족 멤버들의 학습 현황을 한눈에 확인하세요</p>
      </header>

      {/* 실시간 활동 알림 */}
      {recentActivity && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-l-4 border-green-500 dark:border-green-600 text-green-800 dark:text-green-300 px-6 py-4 rounded-xl mb-8 flex items-center shadow-md animate-slide-in-right">
          <span className="text-2xl mr-3">🎉</span>
          <div>
            <p className="font-semibold">{recentActivity}</p>
            <p className="text-sm text-green-600 dark:text-green-400">방금 전</p>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <>
          {/* 통계 카드 스켈레톤 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} avatar={false} title={true} descriptionLines={1} />
            ))}
          </div>

          {/* 차트 스켈레톤 */}
          <div className="mb-8">
            <ChartSkeleton height="20rem" title={true} />
          </div>

          {/* 상세 통계 스켈레톤 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">상세 통계</h2>
            <div className="mb-6">
              <ChartSkeleton height="18.75rem" title={true} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton height="20rem" title={true} />
              <ChartSkeleton height="20rem" title={true} />
            </div>
          </div>

          {/* 멤버 카드 스켈레톤 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">가족 멤버</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} avatar={true} title={true} descriptionLines={2} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* 에러 상태 */}
      {error && (
        <ErrorState
          message={error.message || '데이터를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.'}
        />
      )}

      {/* 데이터 표시 */}
      {!isLoading && !error && (
        <>
          {/* 통계 카드 그리드 */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" aria-label="주요 통계">
            <StatCard
              icon="👥"
              value={members.length}
              label="관리 중인 가족"
              unit="명"
              gradient="from-blue-500 to-blue-600"
            />
            <StatCard
              icon="⚡"
              value={activeMembers}
              label="활동 중"
              unit="명"
              gradient="from-green-500 to-emerald-600"
              info="24시간 이내"
            />
            <StatCard
              icon="⭐"
              value={totalPoints}
              label="총 포인트"
              gradient="from-yellow-500 to-amber-600"
            />
            <StatCard
              icon="🔥"
              value={totalStreak}
              label="누적 스트릭"
              unit="일"
              gradient="from-orange-500 to-red-600"
            />
          </div>

          {/* 차트 섹션 */}
          <section className="mb-8" aria-label="주간 활동 차트">
            <ErrorBoundary>
              <Suspense fallback={<ChartSkeleton />}>
                <LazyActivityChart data={chartData} height={320} />
              </Suspense>
            </ErrorBoundary>
          </section>

          {/* 통계 차트 섹션 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">상세 통계</h2>
            
            {/* 월별 카드 완료 - 전체 너비 */}
            <ErrorBoundary>
              <Suspense fallback={<div className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700"><ChartSkeleton /></div>}>
                <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
                  <LazyBarChart
                    data={monthlyCardData}
                    title="월별 카드 완료 현황"
                    description="최근 12개월간 완료한 카드 수를 보여줍니다"
                    gradient={['#3B82F6', '#1E40AF']}
                    height={300}
                    isDark={isDark}
                  />
                </div>
              </Suspense>
            </ErrorBoundary>

            {/* 카테고리 분포 & 누적 포인트 - 2열 그리드 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ErrorBoundary>
                <Suspense fallback={<div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700"><ChartSkeleton /></div>}>
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
                    <LazyPieChart
                      data={categoryData}
                      title="카테고리별 분포"
                      description="학습한 카드의 카테고리 분포입니다"
                      height={320}
                      isDark={isDark}
                      showPercentage={true}
                    />
                  </div>
                </Suspense>
              </ErrorBoundary>

              <ErrorBoundary>
                <Suspense fallback={<div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700"><ChartSkeleton /></div>}>
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
                    <LazyAreaChart
                      data={cumulativePointsData}
                      title="누적 포인트"
                      description="최근 30일간 누적된 포인트 추이입니다"
                      gradient={['#10B981', '#059669']}
                      height={320}
                      isDark={isDark}
                    />
                  </div>
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>

          {/* 회원 카드 그리드 */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">가족 멤버</h2>
              <Link 
                href="/members" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
              >
                전체 보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {members.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-12 border border-gray-100 dark:border-slate-700">
                <EmptyState
                  icon="👥"
                  title="연동된 가족 멤버가 없어요"
                  description="모바일 앱에서 가족 초대를 시도해 보세요."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => (
                  <MemberCard
                    key={member.user_id}
                    userId={member.user_id}
                    name={member.name}
                    lastActivity={member.last_activity}
                    currentStreak={member.current_streak}
                    totalPoints={member.total_points}
                    permissions={member.perms}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 바로가기 액션 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/alerts"
              className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-800 dark:to-purple-900 text-white dark:text-slate-100 rounded-xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-bold mb-1">알림 확인</h3>
                <p className="text-sm opacity-90">가족의 중요한 알림을 확인하세요</p>
              </div>
              <div className="text-4xl">🔔</div>
            </Link>

            <Link
              href="/encourage"
              className="bg-gradient-to-r from-pink-500 to-rose-600 dark:from-pink-800 dark:to-rose-900 text-white dark:text-slate-100 rounded-xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-bold mb-1">응원 보내기</h3>
                <p className="text-sm opacity-90">따뜻한 응원 메시지를 전달하세요</p>
              </div>
              <div className="text-4xl">💌</div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

