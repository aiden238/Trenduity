import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
      <View style={{ padding: spacing.lg }}>
        <Text style={[styles.title, { fontSize: fontSizes.xl, marginBottom: spacing.sm }]}>
          🛠️ AI 도구 실습
        </Text>
        <Text style={[styles.subtitle, { fontSize: fontSizes.md, marginBottom: spacing.lg }]}>
          단계별로 따라하며 AI 도구를 배워보세요.
        </Text>
      </View>

      <FlatList
        data={TOOLS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.toolCard,
              {
                padding: spacing.md,
                marginBottom: spacing.md,
                borderRadius: spacing.sm,
                minHeight: buttonHeight * 1.5,
              },
            ]}
            onPress={() => handleToolPress(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name} 실습 시작`}
          >
            <View style={styles.toolContent}>
              <Text style={[styles.toolIcon, { fontSize: fontSizes.xl * 1.5 }]}>{item.icon}</Text>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[styles.toolName, { fontSize: fontSizes.lg }]}>{item.name}</Text>
                <Text style={[styles.toolDescription, { fontSize: fontSizes.md }]}>
                  {item.description}
                </Text>
              </View>
              <Text style={[styles.arrow, { fontSize: fontSizes.lg }]}>→</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontWeight: '700',
    color: '#212121',
  },
  subtitle: {
    color: '#666',
    lineHeight: 22,
  },
  toolCard: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toolContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolIcon: {
    textAlign: 'center',
  },
  toolName: {
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  toolDescription: {
    color: '#666',
  },
  arrow: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
