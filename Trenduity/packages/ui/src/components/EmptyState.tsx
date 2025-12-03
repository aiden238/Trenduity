import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../tokens/colors';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  style?: ViewStyle;
  /** 그라디언트 배경 사용 여부 */
  useGradient?: boolean;
}

/**
 * 빈 상태 컴포넌트
 * 
 * 사용 예시:
 * <EmptyState 
 *   icon="📭"
 *   title="아직 질문이 없어요"
 *   description="첫 질문을 남겨보세요!"
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  style,
  useGradient = false,
}) => {
  if (useGradient) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.gradientWrapper, SHADOWS.md]}>
          <LinearGradient
            colors={[COLORS.neutral.surface, COLORS.neutral.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.titleGradient}>
              {title}
            </Text>
            {description && (
              <Text style={styles.descriptionGradient}>
                {description}
              </Text>
            )}
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
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
  gradientWrapper: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    maxWidth: 400,
  },
  gradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 1.5,
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  titleGradient: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.neutral.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  descriptionGradient: {
    fontSize: 14,
    color: COLORS.neutral.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
