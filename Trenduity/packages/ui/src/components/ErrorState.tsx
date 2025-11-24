import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../tokens/colors';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
  /** 그라디언트 버튼 사용 여부 */
  useGradient?: boolean;
}

/**
 * 에러 상태 컴포넌트
 * 
 * 사용 예시:
 * <ErrorState 
 *   message="데이터를 불러올 수 없어요."
 *   onRetry={() => refetch()}
 * />
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  style,
  useGradient = true,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.8}
          style={[styles.retryButtonWrapper, useGradient && SHADOWS.md]}
          accessibilityRole="button"
          accessibilityLabel="다시 시도"
          accessibilityHint="버튼을 누르면 데이터를 다시 불러옵니다"
        >
          {useGradient ? (
            <LinearGradient
              colors={COLORS.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>
                🔄 다시 시도
              </Text>
            </LinearGradient>
          ) : (
            <View style={[styles.retryButton, { backgroundColor: COLORS.primary.main }]}>
              <Text style={styles.retryButtonText}>
                🔄 다시 시도
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: 16,
    color: COLORS.status.error,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  retryButtonWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  retryButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
