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

/**
 * 메인 대시보드
 * 
 * 실제 BFF API 연동 완료 ✅
 * TODO(IMPLEMENT): 최근 알림 표시
 * TODO(IMPLEMENT): 요약 통계 (학습 완료수)
 */

// SWR fetcher 함수
const fetcher = (url: string) => apiGet<FamilyMembersResponse>(url);

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

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">대시보드</h2>

      {/* 실시간 활동 알림 */}
      {recentActivity && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center">
          <span className="mr-2">🎉</span>
          <span>{recentActivity}</span>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && <Spinner size="large" />}

      {/* 에러 상태 */}
      {error && (
        <ErrorState
          message={error.message || '데이터를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.'}
        />
      )}

      {/* 데이터 표시 */}
      {!isLoading && !error && (
        <>
          {/* 요약 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">관리 중인 회원</h3>
              <p className="text-4xl font-bold text-blue-600">{members.length}</p>
              <p className="text-sm text-gray-500 mt-2">명</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">최근 활동 중</h3>
              <p className="text-4xl font-bold text-green-600">
                {members.filter(m => {
                  if (!m.last_activity) return false;
                  const daysDiff = Math.floor((Date.now() - new Date(m.last_activity).getTime()) / (1000 * 60 * 60 * 24));
                  return daysDiff <= 1;
                }).length}
              </p>
              <p className="text-sm text-gray-500 mt-2">명 (24시간 이내)</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">바로가기</h3>
              <div className="flex flex-col space-y-2 mt-2">
                <Link href="/alerts" className="text-sm text-blue-600 hover:underline">
                  → 알림 확인
                </Link>
                <Link href="/encourage" className="text-sm text-blue-600 hover:underline">
                  → 응원 보내기
                </Link>
              </div>
            </div>
          </div>

          {/* 회원 목록 */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">회원 목록</h3>
            </div>
            {members.length === 0 ? (
              <EmptyState
                icon="👥"
                title="연동된 가족 멤버가 없어요"
                description="모바일 앱에서 가족 초대를 시도해 보세요."
              />
            ) : (
              <div className="divide-y">
                {members.map((member) => (
                  <Link
                    key={member.user_id}
                    href={`/members/${member.user_id}`}
                    className="block p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-lg font-semibold">{member.name}</h4>
                        <p className="text-sm text-gray-600">
                          {member.perms.read && member.perms.alerts
                            ? '모든 권한'
                            : member.perms.read
                            ? '읽기 전용'
                            : '제한됨'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">마지막 활동</p>
                        <p className="text-sm font-medium">
                          {formatLastActivity(member.last_activity)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
