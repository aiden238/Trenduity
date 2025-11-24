import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, RADIUS, SPACING } from '../tokens/colors';

export interface GradientCardProps {
  /**
   * 자식 컴포넌트
   */
  children: React.ReactNode;

  /**
   * 그라데이션 색상 배열
   * @default COLORS.gradients.primary
   */
  colors?: string[];

  /**
   * 그라데이션 방향 (각도)
   * @default [0, 0] → [1, 0] (좌→우)
   */
  start?: { x: number; y: number };
  end?: { x: number; y: number };

  /**
   * 카드 크기
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * 그림자 크기
   * @default 'md'
   */
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';

  /**
   * 보더 반경
   * @default 'lg'
   */
  radius?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * 커스텀 스타일
   */
  style?: ViewStyle;

  /**
   * 접근성 라벨
   */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const SIZE_STYLES = {
  small: {
    padding: SPACING.sm,
    minHeight: 80,
  },
  medium: {
    padding: SPACING.md,
    minHeight: 120,
  },
  large: {
    padding: SPACING.lg,
    minHeight: 160,
  },
};

/**
 * GradientCard 컴포넌트
 * 
 * 그라데이션 배경을 가진 카드 컴포넌트입니다.
 * 시각적으로 매력적인 UI 요소를 만들 때 사용합니다.
 * 
 * @example
 * ```tsx
 * <GradientCard
 *   colors={COLORS.gradients.primary}
 *   size="medium"
 *   shadow="md"
 * >
 *   <Text>Hello</Text>
 * </GradientCard>
 * ```
 */
export function GradientCard({
  children,
  colors = COLORS.gradients.primary,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  size = 'medium',
  shadow = 'md',
  radius = 'lg',
  style,
  accessibilityLabel,
  accessibilityHint,
}: GradientCardProps) {
  const sizeStyle = SIZE_STYLES[size];
  const shadowStyle = shadow !== 'none' ? SHADOWS[shadow] : undefined;
  const radiusValue = RADIUS[radius];

  return (
    <View
      style={[
        styles.container,
        shadowStyle,
        { borderRadius: radiusValue },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={[
          styles.gradient,
          sizeStyle,
          { borderRadius: radiusValue },
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
  },
});
