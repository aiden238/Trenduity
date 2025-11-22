import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  style?: ViewStyle;
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
}) => {
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
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
