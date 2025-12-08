import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';

interface ToolItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  gradientColor: string;
}

const TOOLS: ToolItem[] = [
  { id: 'canva', name: 'Canva', icon: '🎨', description: '디자인 도구', gradientColor: COLORS.primary.main },
  { id: 'miri', name: 'Miri', icon: '🤖', description: 'AI 비서', gradientColor: COLORS.secondary.main },
  { id: 'sora', name: 'Sora', icon: '🎬', description: 'AI 영상', gradientColor: COLORS.accent.orange },
];

export function ToolListScreen() {
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const navigation = useNavigation<any>();

  const handleToolPress = (toolId: string) => {
    navigation.navigate('ToolTrack', { tool: toolId });
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View
        style={[styles.header, { 
          paddingTop: spacing.lg + 40, 
          paddingBottom: spacing.xl, 
          paddingHorizontal: spacing.lg,
          backgroundColor: COLORS.accent.orange 
        }]}
      >
        <Text
          style={[styles.headerTitle, {
            fontSize: fontSizes.heading1,
            marginBottom: spacing.sm,
          }]}
        >
          🛠️ AI 도구 실습
        </Text>
        <Text
          style={[styles.headerSubtitle, {
            fontSize: fontSizes.body,
          }]}
        >
          단계별로 따라하며 AI 도구를 배워보세요
        </Text>
      </View>

      <FlatList
        data={TOOLS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleToolPress(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name} 실습 시작`}
            accessibilityHint="버튼을 누르면 도구 실습을 시작합니다"
            style={[
              styles.toolCard,
              { 
                backgroundColor: item.gradientColor,
                marginBottom: spacing.md,
                borderRadius: RADIUS.lg,
              }
            ]}
          >
            <View style={[styles.toolContent, { padding: spacing.lg }]}>
              <Text style={[styles.toolIcon, { fontSize: fontSizes.heading1 * 1.5 }]}>{item.icon}</Text>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[styles.toolName, { fontSize: fontSizes.body }]}>
                  {item.name}
                </Text>
                <Text style={[styles.toolDescription, { fontSize: fontSizes.small, marginTop: spacing.xs }]}>
                  {item.description}
                </Text>
              </View>
              <Text style={[styles.arrow, { fontSize: fontSizes.heading1 }]}>→</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  header: {
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  toolCard: {
    ...SHADOWS.lg,
  },
  toolContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolIcon: {
    textAlign: 'center',
  },
  toolName: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toolDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  arrow: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
