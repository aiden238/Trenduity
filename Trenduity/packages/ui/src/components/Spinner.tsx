import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

/**
 * 로딩 스피너 컴포넌트
 * 
 * 사용 예시:
 * <Spinner size="large" color="#2196F3" />
 */
export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'large', 
  color = '#2196F3',
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
