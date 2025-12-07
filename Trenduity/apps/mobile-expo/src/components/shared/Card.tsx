import React from 'react';
import { View, ViewStyle } from 'react-native';
import { A11yMode, getA11yTokens } from '../../tokens/a11y';

export interface CardProps {
  mode?: A11yMode;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Card 컴포넌트
 * 
 * TODO(IMPLEMENT): elevation/shadow 추가
 */
export const Card: React.FC<CardProps> = ({
  mode = 'normal',
  children,
  style,
}) => {
  const tokens = getA11yTokens(mode);

  const cardStyle: ViewStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: tokens.spacing,
  };

  return <View style={[cardStyle, style]}>{children}</View>;
};
