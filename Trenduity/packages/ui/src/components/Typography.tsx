import React from 'react';
import { Text, TextStyle } from 'react-native';
import { A11yMode, getA11yTokens } from '../tokens/a11y';

export interface TypographyProps {
  variant?: 'small' | 'body' | 'title' | 'heading';
  mode?: A11yMode;
  children: React.ReactNode;
  style?: TextStyle;
  accessibilityRole?: 'text' | 'header' | 'none';
  accessibilityLabel?: string;
}

/**
 * Typography 컴포넌트
 * 
 * TODO(IMPLEMENT): A11y Context에서 mode 자동 주입
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  mode = 'normal',
  children,
  style,
  accessibilityRole = 'text',
  accessibilityLabel,
}) => {
  const tokens = getA11yTokens(mode);
  const fontSize = tokens.fontSize[variant];

  // heading variant일 때 기본 accessibilityRole을 'header'로
  const role = variant === 'heading' && accessibilityRole === 'text' ? 'header' : accessibilityRole;

  return (
    <Text
      style={[
        {
          fontSize,
          color: tokens.colors.text.primary,
        },
        style,
      ]}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Text>
  );
};
