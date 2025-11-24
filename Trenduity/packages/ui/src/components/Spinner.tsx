import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../tokens/colors';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  /** 로딩 메시지 */
  message?: string;
  /** 그라디언트 배경 사용 여부 */
  useGradient?: boolean;
}

/**
 * 로딩 스피너 컴포넌트
 * 
 * 사용 예시:
 * <Spinner size="large" color="#2196F3" />
 */
export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'large', 
  color = COLORS.primary.main,
  style,
  message,
  useGradient = false,
}) => {
  if (useGradient) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.gradientWrapper}>
          <LinearGradient
            colors={COLORS.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <ActivityIndicator size={size} color="#FFFFFF" />
            {message && (
              <Text style={styles.message}>
                {message}
              </Text>
            )}
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={[styles.message, { color: COLORS.neutral.text.secondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  gradientWrapper: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: SPACING.md,
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
  },
});
