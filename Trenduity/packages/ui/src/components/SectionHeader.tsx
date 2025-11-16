import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { A11yMode, getA11yTokens } from '../tokens/a11y';

export interface SectionHeaderProps {
  title: string;
  mode?: A11yMode;
  style?: ViewStyle;
}

/**
 * SectionHeader 컴포넌트
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  mode = 'normal',
  style,
}) => {
  const tokens = getA11yTokens(mode);

  return (
    <View style={[{ marginBottom: tokens.spacing.md }, style]}>
      <Typography variant="heading" mode={mode}>
        {title}
      </Typography>
    </View>
  );
};
