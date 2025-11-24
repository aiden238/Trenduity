'use client';

import React from 'react';
import { useTheme } from 'next-themes';

interface SkeletonProps {
  /** 너비 (CSS 값) */
  width?: string;
  /** 높이 (CSS 값) */
  height?: string;
  /** 모양 타입 */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** 애니메이션 활성화 */
  animation?: boolean;
  /** 클래스명 */
  className?: string;
}

/**
 * 기본 Skeleton 컴포넌트
 * 로딩 상태를 표시하는 shimmer 효과
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  variant = 'text',
  animation = true,
  className = '',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const baseClasses = 'bg-gradient-to-r';
  const colorClasses = isDark
    ? 'from-slate-700 via-slate-600 to-slate-700'
    : 'from-slate-200 via-slate-100 to-slate-200';
  const animationClasses = animation ? 'animate-shimmer' : '';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  };

  return (
    <div
      className={`${baseClasses} ${colorClasses} ${animationClasses} ${variantClasses[variant]} ${className}`}
      style={{
        width,
        height,
        backgroundSize: '200% 100%',
      }}
      role="status"
      aria-label="로딩 중"
    />
  );
};

interface TextSkeletonProps {
  /** 줄 수 */
  lines?: number;
  /** 줄 간격 */
  spacing?: string;
  /** 마지막 줄 너비 (%) */
  lastLineWidth?: number;
}

/**
 * 텍스트용 Skeleton
 * 여러 줄의 텍스트 로딩 상태 표시
 */
export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  lines = 3,
  spacing = '0.75rem',
  lastLineWidth = 60,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={i === lines - 1 ? `${lastLineWidth}%` : '100%'}
        />
      ))}
    </div>
  );
};

interface CardSkeletonProps {
  /** 아바타 포함 여부 */
  avatar?: boolean;
  /** 제목 포함 여부 */
  title?: boolean;
  /** 설명 줄 수 */
  descriptionLines?: number;
  /** 액션 버튼 개수 */
  actions?: number;
}

/**
 * 카드용 Skeleton
 * 프로필 카드, 콘텐츠 카드 등의 로딩 상태
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  avatar = true,
  title = true,
  descriptionLines = 2,
  actions = 0,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
      {/* 헤더 영역 */}
      <div className="flex items-center gap-4 mb-4">
        {avatar && <Skeleton variant="circular" width="3rem" height="3rem" />}
        <div className="flex-1">
          {title && <Skeleton height="1.5rem" width="60%" className="mb-2" />}
          <Skeleton height="1rem" width="40%" />
        </div>
      </div>

      {/* 설명 영역 */}
      {descriptionLines > 0 && (
        <div className="space-y-2 mb-4">
          {Array.from({ length: descriptionLines }).map((_, i) => (
            <Skeleton
              key={i}
              height="1rem"
              width={i === descriptionLines - 1 ? '70%' : '100%'}
            />
          ))}
        </div>
      )}

      {/* 액션 버튼 영역 */}
      {actions > 0 && (
        <div className="flex gap-2 mt-4">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height="2.5rem"
              width="6rem"
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ChartSkeletonProps {
  /** 차트 높이 */
  height?: string;
  /** 제목 포함 여부 */
  title?: boolean;
}

/**
 * 차트용 Skeleton
 * BarChart, PieChart 등의 로딩 상태
 */
export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  height = '20rem',
  title = true,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
      {/* 제목 */}
      {title && (
        <div className="mb-4">
          <Skeleton height="1.5rem" width="40%" className="mb-2" />
          <Skeleton height="1rem" width="60%" />
        </div>
      )}

      {/* 차트 영역 */}
      <Skeleton variant="rounded" height={height} />
    </div>
  );
};

interface ListSkeletonProps {
  /** 아이템 개수 */
  items?: number;
  /** 아바타 포함 여부 */
  avatar?: boolean;
}

/**
 * 리스트용 Skeleton
 * 멤버 리스트, 알림 리스트 등의 로딩 상태
 */
export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 5,
  avatar = true,
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-slate-700"
        >
          {avatar && <Skeleton variant="circular" width="2.5rem" height="2.5rem" />}
          <div className="flex-1">
            <Skeleton height="1.25rem" width="50%" className="mb-2" />
            <Skeleton height="1rem" width="70%" />
          </div>
        </div>
      ))}
    </div>
  );
};
