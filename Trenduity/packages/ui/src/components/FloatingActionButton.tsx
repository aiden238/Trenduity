import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Typography } from './Typography';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../tokens/colors';

export interface FloatingActionButtonProps {
  /** 버튼 텍스트 */
  label: string;
  /** 아이콘 (이모지 또는 컴포넌트) */
  icon?: string;
  /** 버튼 클릭 핸들러 */
  onPress: () => void;
  /** 그라디언트 색상 배열 */
  colors?: string[];
  /** 버튼 위치 (bottom, right 픽셀값) */
  position?: { bottom?: number; right?: number; left?: number };
  /** 추가 스타일 */
  style?: ViewStyle;
  /** 접근성 레이블 */
  accessibilityLabel?: string;
  /** 접근성 힌트 */
  accessibilityHint?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * FloatingActionButton 컴포넌트
 * 
 * 주요 액션을 위한 플로팅 버튼
 * - 그라디언트 배경
 * - 그림자 효과
 * - 아이콘 + 텍스트
 * - 화면 우하단 고정
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  label,
  icon,
  onPress,
  colors = COLORS.gradients.primary,
  position = { bottom: 24, right: 24 },
  style,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          bottom: position.bottom,
          right: position.right,
          left: position.left,
        },
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      <LinearGradient
        colors={disabled ? ['#CCCCCC', '#999999'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {icon && (
          <Typography
            variant="title"
            style={styles.icon}
          >
            {icon}
          </Typography>
        )}
        <Typography
          variant="body"
          style={styles.label}
        >
          {label}
        </Typography>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
