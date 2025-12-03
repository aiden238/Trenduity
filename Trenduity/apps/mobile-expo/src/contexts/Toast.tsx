import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../tokens/colors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const TOAST_DEFAULTS = {
  duration: 3000,
  maxVisible: 3,
};

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
  isDark: boolean;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose, isDark }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // 나타나는 애니메이션
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // 자동 닫기
    if (toast.duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose(toast.id);
    });
  };

  const getBackgroundColor = () => {
    if (isDark) {
      switch (toast.type) {
        case 'success':
          return COLORS.dark.status.success;
        case 'error':
          return COLORS.dark.status.error;
        case 'warning':
          return COLORS.dark.status.warning;
        case 'info':
          return COLORS.dark.status.info;
        default:
          return COLORS.dark.background.secondary;
      }
    } else {
      switch (toast.type) {
        case 'success':
          return COLORS.status.success;
        case 'error':
          return COLORS.status.error;
        case 'warning':
          return COLORS.status.warning;
        case 'info':
          return COLORS.status.info;
        default:
          return COLORS.neutral.text.secondary;
      }
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handleClose}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${toast.type} 알림: ${toast.message}`}
        accessibilityHint="터치하여 닫기"
      >
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message} numberOfLines={3}>
          {toast.message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    ...SHADOWS.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    fontSize: 20,
    color: '#fff',
    marginRight: 12,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});
