import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { A11yMode, getA11yTokens } from '../tokens/a11y';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  mode?: A11yMode;
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Button 컴포넌트
 * 
 * TODO(IMPLEMENT): A11y Context에서 mode 자동 주입
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  mode = 'normal',
  onPress,
  children,
  disabled = false,
  style,
}) => {
  const tokens = getA11yTokens(mode);

  const buttonStyle: ViewStyle = {
    minWidth: tokens.touchTarget.minWidth,
    minHeight: tokens.touchTarget.minHeight,
    backgroundColor: variant === 'primary' ? '#007AFF' : '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    opacity: disabled ? 0.5 : 1,
  };

  const textStyle: TextStyle = {
    fontSize: tokens.fontSize.body,
    color: variant === 'primary' ? '#FFFFFF' : '#000000',
    fontWeight: '600',
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};
