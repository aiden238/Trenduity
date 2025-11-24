import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { TOAST_CONFIGS, TOAST_ANIMATION, TOAST_DEFAULTS, type ToastMessage } from '@repo/ui';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
  isDark: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const Toast: React.FC<ToastProps> = ({ toast, onClose, isDark }) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const config = TOAST_CONFIGS[toast.type];
  const colors = isDark ? config.colors.dark : config.colors.light;

  useEffect(() => {
    // 진입 애니메이션
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: TOAST_ANIMATION.enterMobile.duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: TOAST_ANIMATION.enterMobile.duration,
        useNativeDriver: true,
      }),
    ]).start();

    // 햅틱 피드백
    switch (toast.type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // 자동 닫기 타이머
    const timer = setTimeout(() => {
      handleClose();
    }, toast.duration || TOAST_DEFAULTS.duration);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    // 퇴장 애니메이션
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: TOAST_ANIMATION.exitMobile.duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: TOAST_ANIMATION.exitMobile.duration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose(toast.id);
      toast.onClose?.();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: colors.background,
          borderLeftColor: colors.border,
          width: typeof TOAST_DEFAULTS.width.mobile === 'string' 
            ? SCREEN_WIDTH * 0.9 
            : TOAST_DEFAULTS.width.mobile,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {/* 아이콘 */}
      <Text style={[styles.icon, { color: colors.icon }]}>{config.icon}</Text>

      {/* 내용 */}
      <View style={styles.content}>
        <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
          {toast.message}
        </Text>
        {toast.description && (
          <Text style={[styles.description, { color: colors.text, opacity: 0.8 }]} numberOfLines={2}>
            {toast.description}
          </Text>
        )}

        {/* 액션 버튼 (선택) */}
        {toast.action && (
          <TouchableOpacity
            onPress={() => {
              toast.action!.onPress();
              handleClose();
            }}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={toast.action.label}
          >
            <Text style={[styles.actionText, { color: colors.icon }]}>
              {toast.action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 닫기 버튼 */}
      <TouchableOpacity
        onPress={handleClose}
        style={styles.closeButton}
        accessibilityRole="button"
        accessibilityLabel="토스트 닫기"
      >
        <Text style={[styles.closeIcon, { color: colors.text }]}>✕</Text>
      </TouchableOpacity>

      {/* 진행 바 */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.icon,
              width: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: ['100%', '0%'],
              }),
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginHorizontal: '5%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  actionButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
});
