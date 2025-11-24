'use client';

import React, { useEffect, useState } from 'react';
import { TOAST_CONFIGS, TOAST_ANIMATION, type ToastMessage } from '../../../packages/ui/src/tokens/toast';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
  isDark: boolean;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose, isDark }) => {
  const [isExiting, setIsExiting] = useState(false);
  const config = TOAST_CONFIGS[toast.type];
  const colors = isDark ? config.colors.dark : config.colors.light;

  useEffect(() => {
    // 자동 닫기 타이머
    const timer = setTimeout(() => {
      handleClose();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
      toast.onClose?.();
    }, TOAST_ANIMATION.exit.duration);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      style={{
        backgroundColor: colors.background,
        borderLeft: `4px solid ${colors.border}`,
        maxWidth: '400px',
        minWidth: '320px',
      }}
      role="alert"
      aria-live="polite"
    >
      {/* 아이콘 */}
      <div
        className="flex-shrink-0 text-2xl"
        style={{ color: colors.icon }}
        aria-hidden="true"
      >
        {config.icon}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm"
          style={{ color: colors.text }}
        >
          {toast.message}
        </p>
        {toast.description && (
          <p
            className="text-xs mt-1 opacity-80"
            style={{ color: colors.text }}
          >
            {toast.description}
          </p>
        )}

        {/* 액션 버튼 (선택) */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onPress();
              handleClose();
            }}
            className="mt-2 text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
            style={{ color: colors.icon }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-2 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
        style={{ color: colors.text }}
        aria-label="토스트 닫기"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>

      {/* 진행 바 (자동 닫기 표시) */}
      <div
        className="absolute bottom-0 left-0 h-1 rounded-b-xl transition-all"
        style={{
          background: `linear-gradient(90deg, ${config.gradient[0]}, ${config.gradient[1]})`,
          animation: `shrink ${toast.duration || 3000}ms linear`,
        }}
      />

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};
