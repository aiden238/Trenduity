'use client';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * 에러 상태 컴포넌트 (웹용)
 */
export function ErrorState({ message, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-16 text-center ${className}`}>
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-red-600 text-lg mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
