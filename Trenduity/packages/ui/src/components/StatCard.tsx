import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { GradientCard } from './GradientCard';
import { COLORS, SPACING } from '../tokens/colors';
import { getTypography } from '../tokens/typography';
import { A11yMode } from '../tokens/a11y';

export interface StatCardProps {
  /**
   * 아이콘 (Emoji 또는 React Element)
   */
  icon: string | React.ReactElement;

  /**
   * 표시할 값 (숫자)
   */
  value: number | string;

  /**
   * 라벨 (예: "포인트", "스트릭")
   */
  label: string;

  /**
   * 그라데이션 색상
   * @default COLORS.gradients.primary
   */
  colors?: string[];

  /**
   * 접근성 모드
   * @default 'normal'
   */
  a11yMode?: A11yMode;

  /**
   * 커스텀 스타일
   */
  style?: ViewStyle;

  /**
   * 값의 단위 (예: "개", "일", "pt")
   */
  unit?: string;

  /**
   * 접근성 라벨
   */
  accessibilityLabel?: string;
}

/**
 * StatCard 컴포넌트
 * 
 * 게임화 통계를 표시하는 카드 컴포넌트입니다.
 * 포인트, 스트릭, 레벨 등을 시각적으로 표시합니다.
 * 
 * @example
 * ```tsx
 * <StatCard
 *   icon="⭐"
 *   value={350}
 *   label="포인트"
 *   unit="pt"
 *   colors={COLORS.gradients.primary}
 *   a11yMode="normal"
 * />
 * ```
 */
export function StatCard({
  icon,
  value,
  label,
  colors = COLORS.gradients.primary,
  a11yMode = 'normal',
  style,
  unit,
  accessibilityLabel,
}: StatCardProps) {
  const typography = getTypography(a11yMode);
  
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return (
        <Text
          style={[
            styles.iconEmoji,
            { fontSize: typography.heading1.fontSize * 1.5 },
          ]}
        >
          {icon}
        </Text>
      );
    }
    return icon;
  };

  const accessibilityText = accessibilityLabel || `${label} ${value}${unit || ''}`;

  return (
    <GradientCard
      colors={colors}
      size="small"
      shadow="md"
      radius="lg"
      style={[styles.container, style]}
      accessibilityLabel={accessibilityText}
      accessibilityHint={`현재 ${label}는 ${value}${unit || ''}입니다`}
    >
      <View style={styles.content}>
        {/* 아이콘 */}
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>

        {/* 값 */}
        <Text
          style={[
            styles.value,
            typography.heading1,
            { color: COLORS.neutral.text.inverse },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
          {unit && (
            <Text
              style={[
                styles.unit,
                typography.caption,
                { color: COLORS.neutral.text.inverse },
              ]}
            >
              {unit}
            </Text>
          )}
        </Text>

        {/* 라벨 */}
        <Text
          style={[
            styles.label,
            typography.caption,
            { color: COLORS.neutral.text.inverse },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  iconContainer: {
    marginBottom: SPACING.xs,
  },
  iconEmoji: {
    textAlign: 'center',
  },
  value: {
    fontWeight: '700',
  },
  unit: {
    opacity: 0.8,
    marginLeft: 2,
  },
  label: {
    opacity: 0.9,
    textAlign: 'center',
  },
});
