import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Toast, ToastMessage, ToastType } from './Toast';
import { useTheme } from '../contexts/ThemeContext';

const TOAST_DEFAULTS = {
  duration: 3000,
  maxVisible: 3,
};

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
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

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

      {/* Toast Container - 하단 */}
      {toasts.length > 0 && (
        <View style={styles.container} pointerEvents="box-none">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} isDark={isDark} />
          ))}
        </View>
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: TOAST_DEFAULTS.offset.mobile.bottom,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});
