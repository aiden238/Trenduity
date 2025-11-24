'use client';

import React from 'react';
import { useKeyboardShortcut, useFocusTrap } from '../hooks/useKeyboardNavigation';
import { getFocusClass } from '../utils/focusUtils';

interface ModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 제목 */
  title?: string;
  /** 내용 */
  children: React.ReactNode;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 닫기 버튼 숨기기 */
  hideCloseButton?: boolean;
  /** 오버레이 클릭으로 닫기 */
  closeOnOverlayClick?: boolean;
}

/**
 * Modal 컴포넌트
 * 키보드 접근성 (Escape, 포커스 트랩) 포함
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideCloseButton = false,
  closeOnOverlayClick = true,
}) => {
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Escape 키로 닫기
  useKeyboardShortcut({
    key: 'Escape',
    callback: () => {
      if (isOpen) onClose();
    },
  });

  // 크기별 클래스
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={trapRef}
        className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full ${sizeClasses[size]} animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            {title && (
              <h2
                id="modal-title"
                className="text-2xl font-bold text-gray-900 dark:text-slate-100"
              >
                {title}
              </h2>
            )}
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${getFocusClass('default')}`}
                aria-label="모달 닫기"
              >
                <svg
                  className="w-6 h-6 text-gray-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* 내용 */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
