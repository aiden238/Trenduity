'use client';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  className?: string;
}

/**
 * 빈 상태 컴포넌트 (웹용)
 */
export function EmptyState({ 
  icon = '📭', 
  title, 
  description,
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-16 text-center ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 max-w-md">{description}</p>
      )}
    </div>
  );
}
