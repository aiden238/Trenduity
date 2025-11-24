import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { GradientCard, Typography, COLORS, SPACING, SHADOWS, RADIUS } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';

interface ToolItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const TOOLS: ToolItem[] = [
  { id: 'canva', name: 'Canva', icon: '🎨', description: '디자인 도구' },
  { id: 'miri', name: 'Miri', icon: '🤖', description: 'AI 비서' },
  { id: 'sora', name: 'Sora', icon: '🎬', description: 'AI 영상' },
];

export function ToolListScreen() {
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const navigation = useNavigation();

  const handleToolPress = (toolId: string) => {
    navigation.navigate('ToolTrack', { tool: toolId });
  };

  return (
    <View style={styles.container}>
      {/* 그라디언트 헤더 */}
      <LinearGradient
        colors={COLORS.gradients.warm}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: spacing.lg, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg }}
      >
        <Typography
          variant="heading1"
          style={{
            fontSize: fontSizes.xl,
            color: '#FFFFFF',
            fontWeight: '700',
            marginBottom: spacing.sm,
          }}
        >
          🛠️ AI 도구 실습
        </Typography>
        <Typography
          variant="body"
          style={{
            fontSize: fontSizes.md,
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          단계별로 따라하며 AI 도구를 배워보세요
        </Typography>
      </LinearGradient>

      <FlatList
        data={TOOLS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
        renderItem={({ item }) => {
          // 도구별 그라디언트 색상
          const gradients = [
            COLORS.gradients.primary,
            COLORS.gradients.warm,
            COLORS.gradients.sunset,
          ];
          const gradientIndex = TOOLS.findIndex(t => t.id === item.id) % gradients.length;
          
          return (
            <TouchableOpacity
              onPress={() => handleToolPress(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`${item.name} 실습 시작`}
              accessibilityHint="버튼을 누르면 도구 실습을 시작합니다"
            >
              <GradientCard
                colors={gradients[gradientIndex]}
                size="medium"
                shadow="lg"
                radius="lg"
              >
                <View style={styles.toolContent}>
                  <Text style={[styles.toolIcon, { fontSize: fontSizes.xl * 1.5 }]}>{item.icon}</Text>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={[styles.toolName, { fontSize: fontSizes.lg, color: '#FFFFFF', fontWeight: '700' }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.toolDescription, { fontSize: fontSizes.md, color: 'rgba(255, 255, 255, 0.9)', marginTop: spacing.xs }]}>
                      {item.description}
                    </Text>
                  </View>
                  <Text style={[styles.arrow, { fontSize: fontSizes.xl, color: '#FFFFFF', fontWeight: '700' }]}>→</Text>
                </View>
              </GradientCard>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  toolContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  toolIcon: {
    textAlign: 'center',
  },
  toolName: {},
  toolDescription: {},
  arrow: {},
});
