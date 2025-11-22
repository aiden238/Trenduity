import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
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
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="다시 시도"
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
