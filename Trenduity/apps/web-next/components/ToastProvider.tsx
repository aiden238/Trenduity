'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { Toast } from './Toast';
import { TOAST_DEFAULTS, type ToastMessage, type ToastType } from '../../../packages/ui/src/tokens/toast';

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (type: ToastType, message: string, options?: Partial<ToastMessage>) => void;
  success: (message: string, options?: Partial<ToastMessage>) => void;
  error: (message: string, options?: Partial<ToastMessage>) => void;
  warning: (message: string, options?: Partial<ToastMessage>) => void;
  info: (message: string, options?: Partial<ToastMessage>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const showToast = useCallback(
    (type: ToastType, message: string, options: Partial<ToastMessage> = {}) => {
      const newToast: ToastMessage = {
        id: generateId(),
        type,
        message,
        duration: TOAST_DEFAULTS.duration,
        ...options,
      };

      setToasts((prev) => {
        // 최대 3개까지만 표시
        const updated = [...prev, newToast];
        if (updated.length > TOAST_DEFAULTS.maxToasts) {
          return updated.slice(-TOAST_DEFAULTS.maxToasts);
        }
        return updated;
      });
    },
    []
  );

  const success = useCallback(
    (message: string, options?: Partial<ToastMessage>) => {
      showToast('success', message, options);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: Partial<ToastMessage>) => {
      showToast('error', message, options);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: Partial<ToastMessage>) => {
      showToast('warning', message, options);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: Partial<ToastMessage>) => {
      showToast('info', message, options);
    },
    [showToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        success,
        error,
        warning,
        info,
        removeToast,
        clearAll,
      }}
    >
      {children}

      {/* Toast Container - 우측 상단 */}
      {toasts.length > 0 && (
        <div
          className="fixed z-50 flex flex-col gap-3"
          style={{
            top: TOAST_DEFAULTS.offset.web.top,
            right: TOAST_DEFAULTS.offset.web.right,
          }}
        >
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} isDark={isDark} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
