import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Spinner, EmptyState, ErrorState, GradientCard, FloatingActionButton, Typography, COLORS, SPACING, SHADOWS, RADIUS } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useQnaPosts } from '../../hooks/useQna';

const TOPICS = [
  { key: undefined, label: '전체', icon: '📚' },
  { key: 'ai_tools', label: 'AI 활용', icon: '🤖' },
  { key: 'digital_safety', label: '디지털 안전', icon: '🛡️' },
  { key: 'health', label: '건강', icon: '💊' },
  { key: 'general', label: '일반', icon: '💬' },
];

export const QnaListScreen = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const { data, isLoading, error } = useQnaPosts(selectedTopic);
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const { activeTheme, colors } = useTheme();
  const navigation = useNavigation();
  
  // 다크 모드 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : colors.neutral.background;
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : colors.neutral.surface;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 그라디언트 헤더 */}
      <LinearGradient
        colors={COLORS.gradients.cool}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: spacing.lg, paddingBottom: spacing.xl }}
      >
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Typography
            variant="heading1"
            style={{
              fontSize: fontSizes.xl,
              color: '#FFFFFF',
              fontWeight: '700',
            }}
          >
            💬 커뮤니티 Q&A
          </Typography>
          <Typography
            variant="body"
            style={{
              fontSize: fontSizes.md,
              color: 'rgba(255, 255, 255, 0.9)',
              marginTop: spacing.xs,
            }}
          >
            궁금한 점을 물어보고 답변을 공유하세요
          </Typography>
        </View>
      </LinearGradient>

      {/* 주제 필터 */}
      <View style={{ padding: spacing.md, backgroundColor: COLORS.neutral.surface, ...SHADOWS.sm }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic.key;
              return (
                <TouchableOpacity
                  key={topic.label}
                  onPress={() => setSelectedTopic(topic.key)}
                  style={[
                    { borderRadius: RADIUS.full, overflow: 'hidden' },
                    !isSelected && SHADOWS.sm
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${topic.label} 주제 필터`}
                  accessibilityHint="버튼을 누르면 해당 주제의 질문만 표시됩니다"
                  accessibilityState={{ selected: isSelected }}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={COLORS.gradients.cool}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
                    >
                      <Text style={{ fontSize: fontSizes.md, color: '#FFFFFF', fontWeight: '600' }}>
                        {topic.icon} {topic.label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: COLORS.neutral.surface }}>
                      <Text style={{ fontSize: fontSizes.md, color: COLORS.neutral.text.secondary }}>
                        {topic.icon} {topic.label}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 질문 목록 */}
      {isLoading ? (
        <Spinner size="large" />
      ) : error ? (
        <ErrorState message="목록을 불러올 수 없어요. 잠시 후 다시 시도해 주세요." />
      ) : (data?.posts || []).length === 0 ? (
        <EmptyState
          icon="💭"
          title="아직 질문이 없어요"
          description="첫 질문을 남겨보세요!"
        />
      ) : (
        <FlatList
          data={data?.posts || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('QnaDetail', { postId: item.id })}
              accessibilityRole="button"
              accessibilityLabel={`질문: ${item.title}`}
              accessibilityHint="버튼을 누르면 질문 상세 내용과 답변을 볼 수 있습니다"
            >
              <GradientCard
                colors={[cardBg, bgColor]}
                size="medium"
                shadow="md"
                radius="lg"
              >
                <View style={{ padding: spacing.md }}>
                  <Text style={[styles.postTitle, { fontSize: fontSizes.lg, color: COLORS.neutral.text.primary, fontWeight: '600' }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[styles.postSummary, { fontSize: fontSizes.md, marginTop: spacing.xs, color: COLORS.neutral.text.secondary }]}
                    numberOfLines={2}
                  >
                    {item.ai_summary}
                  </Text>
                  <View
                    style={[
                      styles.postMeta,
                      { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
                    ]}
                  >
                    <Text style={[styles.postAuthor, { fontSize: fontSizes.sm, color: COLORS.neutral.text.tertiary }]}>
                      {item.author_name}
                    </Text>
                    <Text style={[styles.postVotes, { fontSize: fontSizes.sm, color: COLORS.primary.main, fontWeight: '600' }]}>
                      💡 {item.vote_count}
                    </Text>
                  </View>
                </View>
              </GradientCard>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={[styles.centered, { padding: spacing.lg }]}>
              <Text style={{ fontSize: fontSizes.md, color: '#666', textAlign: 'center' }}>
                아직 질문이 없어요.{'\n'}첫 질문을 남겨보세요!
              </Text>
            </View>
          }
        />
      )}

      {/* 질문 작성 버튼 (FAB) */}
      <FloatingActionButton
        label="질문하기"
        icon="✏️"
        onPress={() => navigation.navigate('CreateQna')}
        colors={COLORS.gradients.cool}
        accessibilityLabel="질문 작성하기"
        accessibilityHint="버튼을 누르면 새 질문을 작성할 수 있는 화면으로 이동합니다"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  postTitle: {},
  postSummary: {
    lineHeight: 22,
  },
  postMeta: {},
  postAuthor: {},
  postVotes: {},
});
