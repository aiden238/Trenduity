import React from 'react';
import { Text, TextStyle } from 'react-native';
import { A11yMode, getA11yTokens } from '../../tokens/a11y';

export interface TypographyProps {
  variant?: 'small' | 'body' | 'title' | 'heading' | 'heading1' | 'heading2' | 'caption';
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
  
  // variant 매핑
  const fontSizeMap: Record<string, number> = {
    'small': tokens.fontSizes.caption - 2,
    'caption': tokens.fontSizes.caption,
    'body': tokens.fontSizes.body,
    'title': tokens.fontSizes.heading2,
    'heading': tokens.fontSizes.heading1,
    'heading1': tokens.fontSizes.heading1,
    'heading2': tokens.fontSizes.heading2,
  };
  
  const fontSize = fontSizeMap[variant] || tokens.fontSizes.body;

  // heading variant일 때 기본 accessibilityRole을 'header'로
  const role = (variant === 'heading' || variant === 'heading1' || variant === 'heading2') && accessibilityRole === 'text' ? 'header' : accessibilityRole;

  return (
    <Text
      style={[
        {
          fontSize,
          color: '#000000', // 기본 텍스트 색상
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
