/**
 * 차트 컴포넌트 Lazy Loading
 * 큰 번들 크기의 recharts 라이브러리를 동적으로 로드
 */

'use client';

import dynamic from 'next/dynamic';
import { ChartSkeleton } from './Skeleton';

/**
 * BarChart - 동적 임포트
 * 번들 크기: ~50KB (recharts)
 */
export const LazyBarChart = dynamic(
  () => import('./BarChart').then(mod => ({ default: mod.BarChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // 클라이언트 전용 (차트는 서버 렌더링 불필요)
  }
);

/**
 * PieChart - 동적 임포트
 * 번들 크기: ~50KB (recharts)
 */
export const LazyPieChart = dynamic(
  () => import('./PieChart').then(mod => ({ default: mod.PieChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

/**
 * AreaChart - 동적 임포트
 * 번들 크기: ~50KB (recharts)
 */
export const LazyAreaChart = dynamic(
  () => import('./AreaChart').then(mod => ({ default: mod.AreaChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

/**
 * ActivityChart - 동적 임포트
 * 번들 크기: ~50KB (recharts)
 */
export const LazyActivityChart = dynamic(
  () => import('./ActivityChart').then(mod => ({ default: mod.ActivityChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
