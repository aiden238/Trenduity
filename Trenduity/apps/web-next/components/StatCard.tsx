/**
 * StatCard 컴포넌트 (웹 버전)
 * 통계 수치를 시각적으로 표시하는 카드
 */

interface StatCardProps {
  /** 아이콘 (이모지 또는 React 노드) */
  icon: string | React.ReactNode;
  /** 값 */
  value: string | number;
  /** 라벨 */
  label: string;
  /** 단위 (선택) */
  unit?: string;
  /** 배경 그라디언트 (선택) */
  gradient?: string;
  /** 추가 정보 (선택) */
  info?: string;
}

export function StatCard({ 
  icon, 
  value, 
  label, 
  unit, 
  gradient,
  info 
}: StatCardProps) {
  // AAA 대비 그라디언트 (흰색 텍스트 7:1 이상)
  const gradientClass = gradient || 'from-blue-700 to-blue-800';
  
  // 다크 모드 그라디언트 매핑 - 더 어두운 톤으로 AAA 대비 유지
  const darkGradient = gradientClass
    .replace('from-blue-700', 'dark:from-blue-900')
    .replace('to-blue-800', 'dark:to-blue-950')
    .replace('from-green-700', 'dark:from-green-900')
    .replace('to-emerald-800', 'dark:to-emerald-950')
    .replace('from-yellow-700', 'dark:from-yellow-800')
    .replace('to-amber-800', 'dark:to-amber-900')
    .replace('from-orange-700', 'dark:from-orange-800')
    .replace('to-red-800', 'dark:to-red-900')
    .replace('from-purple-700', 'dark:from-purple-900')
    .replace('to-indigo-800', 'dark:to-indigo-950')
    .replace('from-pink-700', 'dark:from-pink-900')
    .replace('to-rose-800', 'dark:to-rose-950');

  return (
    <div 
      className={`bg-gradient-to-br ${gradientClass} ${darkGradient} rounded-2xl shadow-lg hover:shadow-xl p-6 min-h-[176px] text-white dark:text-white transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-4`}
      tabIndex={0}
      role="article"
      aria-label={`${label}: ${value}${unit || ''}`}
    >
      {/* 아이콘 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-4xl opacity-90">
          {typeof icon === 'string' ? icon : icon}
        </div>
        {info && (
          <div className="text-xs opacity-75 bg-white/20 px-2 py-1 rounded-full">
            {info}
          </div>
        )}
      </div>

      {/* 값 */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-5xl font-bold">
          {value}
        </span>
        {unit && (
          <span className="text-xl opacity-80">
            {unit}
          </span>
        )}
      </div>

      {/* 라벨 */}
      <div className="text-sm opacity-90 font-medium">
        {label}
      </div>
    </div>
  );
}
