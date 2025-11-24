/**
 * MemberCard 컴포넌트
 * 가족 멤버 정보를 표시하는 카드
 */

import Link from 'next/link';
import { OptimizedAvatar } from './OptimizedImage';

interface MemberCardProps {
  /** 아바타 이미지 URL (선택) */
  avatarUrl?: string;
  /** 사용자 ID */
  userId: string;
  /** 이름 */
  name: string;
  /** 마지막 활동 시간 */
  lastActivity: string | null;
  /** 현재 스트릭 */
  currentStreak?: number;
  /** 총 포인트 */
  totalPoints?: number;
  /** 권한 정보 */
  permissions?: {
    read: boolean;
    alerts: boolean;
  };
}

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

export function MemberCard({ 
  userId, 
  name, 
  lastActivity, 
  currentStreak = 0,
  totalPoints = 0,
  permissions,
  avatarUrl
}: MemberCardProps) {
  const isActive = lastActivity && (Date.now() - new Date(lastActivity).getTime()) < 24 * 60 * 60 * 1000;

  return (
    <Link
      href={`/members/${userId}`}
      className="block bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-slate-700 min-h-[180px] focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-slate-900"
      aria-label={`${name}님의 상세 정보 보기`}
    >
      {/* 상태 표시 바 */}
      <div className={`h-2 ${isActive ? 'bg-gradient-to-r from-green-700 to-green-800 dark:from-green-500 dark:to-green-600' : 'bg-gray-300 dark:bg-slate-600'}`} />

      <div className="p-6">
        {/* 헤더: 이름 + 상태 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* 아바타 - 최적화된 이미지 또는 폴백 */}
            {avatarUrl ? (
              <OptimizedAvatar
                src={avatarUrl}
                alt={`${name}님의 프로필`}
                width={48}
                height={48}
                fallbackSrc={`https://via.placeholder.com/48x48.png?text=${encodeURIComponent(name[0])}`}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-700 dark:to-blue-900 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {name[0]}
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {permissions?.read && permissions?.alerts
                  ? '모든 권한'
                  : permissions?.read
                  ? '읽기 전용'
                  : '제한됨'}
              </p>
            </div>
          </div>

          {/* 활동 상태 */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
          }`}>
            {isActive ? '활동 중' : '대기'}
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* 스트릭 */}
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">
              {currentStreak}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">
              🔥 연속
            </div>
          </div>

          {/* 포인트 */}
          <div className="text-center border-x border-gray-200 dark:border-slate-600">
            <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
              {totalPoints}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">
              ⭐ 포인트
            </div>
          </div>

          {/* 마지막 활동 */}
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              {formatLastActivity(lastActivity)}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">
              마지막 활동
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-medium">
          <span>자세히 보기</span>
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
