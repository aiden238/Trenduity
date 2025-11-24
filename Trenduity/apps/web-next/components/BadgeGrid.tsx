/**
 * BadgeGrid 컴포넌트
 * 배지 컬렉션 그리드 표시
 */

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
}

interface BadgeGridProps {
  /** 획득한 배지 목록 */
  earnedBadges: Badge[];
  /** 전체 가능한 배지 목록 */
  allBadges: Badge[];
}

export function BadgeGrid({ earnedBadges, allBadges }: BadgeGridProps) {
  const earnedIds = new Set(earnedBadges.map(b => b.id));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {allBadges.map((badge) => {
        const isEarned = earnedIds.has(badge.id);
        const earnedBadge = earnedBadges.find(b => b.id === badge.id);

        return (
          <div
            key={badge.id}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
              isEarned
                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 opacity-60 hover:opacity-80'
            }`}
          >
            {/* 배지 아이콘 */}
            <div className="text-center mb-3">
              <div
                className={`text-5xl mb-2 ${
                  isEarned ? 'filter-none' : 'grayscale opacity-40'
                }`}
              >
                {badge.icon}
              </div>
              
              {/* 배지 이름 */}
              <h4 className={`font-bold text-sm ${
                isEarned ? 'text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-500'
              }`}>
                {badge.name}
              </h4>
            </div>

            {/* 배지 설명 */}
            <p className={`text-xs text-center mb-2 ${
              isEarned ? 'text-gray-600 dark:text-slate-400' : 'text-gray-400 dark:text-slate-600'
            }`}>
              {badge.description}
            </p>

            {/* 획듍 날짜 */}
            {isEarned && earnedBadge?.earnedAt && (
              <p className="text-xs text-center text-yellow-700 dark:text-yellow-500 font-medium">
                {new Date(earnedBadge.earnedAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}

            {/* 미획듍 표시 */}
            {!isEarned && (
              <div className="absolute top-2 right-2 text-gray-400 dark:text-slate-600">
                🔒
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// 기본 배지 목록 (서버에서 가져올 수도 있음)
export const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first-step',
    name: '첫걸음',
    icon: '🎯',
    description: '첫 카드 완료',
  },
  {
    id: 'week-streak',
    name: '일주일 연속',
    icon: '🔥',
    description: '7일 스트릭 달성',
  },
  {
    id: 'month-streak',
    name: '한 달 연속',
    icon: '🏆',
    description: '30일 스트릭 달성',
  },
  {
    id: 'points-100',
    name: '포인트 100',
    icon: '⭐',
    description: '100 포인트 달성',
  },
  {
    id: 'points-500',
    name: '포인트 500',
    icon: '🌟',
    description: '500 포인트 달성',
  },
  {
    id: 'points-1000',
    name: '포인트 1000',
    icon: '💫',
    description: '1000 포인트 달성',
  },
  {
    id: 'quiz-master',
    name: '퀴즈 마스터',
    icon: '🎓',
    description: '퀴즈 50개 정답',
  },
  {
    id: 'scam-guardian',
    name: '사기 파수꾼',
    icon: '🛡️',
    description: '사기 검사 10회',
  },
  {
    id: 'med-keeper',
    name: '안전 지킴이',
    icon: '💊',
    description: '복약 체크 30회',
  },
  {
    id: 'community-star',
    name: '커뮤니티 스타',
    icon: '⭐',
    description: 'Q&A 좋아요 10개',
  },
];
