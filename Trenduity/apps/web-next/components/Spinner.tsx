'use client';

interface SpinnerProps {
  size?: 'small' | 'large';
  className?: string;
}

/**
 * 로딩 스피너 컴포넌트 (웹용)
 */
export function Spinner({ size = 'large', className = '' }: SpinnerProps) {
  const sizeClass = size === 'large' ? 'w-12 h-12 border-4' : 'w-6 h-6 border-2';

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div
        className={`${sizeClass} border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="로딩 중"
      />
    </div>
  );
}
