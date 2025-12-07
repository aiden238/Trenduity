import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../tokens/colors';

const TOPICS = [
  { key: undefined, label: '전체', icon: '📚' },
  { key: 'ai_tools', label: 'AI 활용', icon: '🤖' },
  { key: 'digital_safety', label: '디지털 안전', icon: '🛡️' },
  { key: 'health', label: '건강', icon: '💊' },
  { key: 'general', label: '일반', icon: '💬' },
];

// 더미 데이터
const DUMMY_POSTS = [
  {
    id: '1',
    title: 'ChatGPT 사용법이 궁금해요',
    ai_summary: 'ChatGPT를 처음 사용하는데 어떻게 시작하면 좋을지 알려주세요.',
    author_name: '김영희',
    vote_count: 12,
    topic: 'ai_tools',
  },
  {
    id: '2',
    title: '모르는 전화번호 조심해야 하나요?',
    ai_summary: '요즘 모르는 번호로 전화가 많이 와서 걱정이에요. 어떻게 대처하면 좋을까요?',
    author_name: '이철수',
    vote_count: 8,
    topic: 'digital_safety',
  },
  {
    id: '3',
    title: '혈압 기록 앱 추천해주세요',
    ai_summary: '매일 혈압을 기록하고 싶은데 좋은 앱이 있을까요?',
    author_name: '박순자',
    vote_count: 15,
    topic: 'health',
  },
  {
    id: '4',
    title: '스마트폰 글씨 크게 하는 방법',
    ai_summary: '눈이 침침해서 글씨가 잘 안 보여요. 글씨 크기 조절하는 방법 알려주세요.',
    author_name: '정미숙',
    vote_count: 20,
    topic: 'general',
  },
];

export const QnaListScreen = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const { spacing, fontSizes } = useA11y();
  const { activeTheme, colors } = useTheme();
  const navigation = useNavigation<any>();
  
  // 다크 모드 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#1F2937';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  // 필터된 게시물
  const filteredPosts = selectedTopic 
    ? DUMMY_POSTS.filter(post => post.topic === selectedTopic)
    : DUMMY_POSTS;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 그라디언트 헤더 */}
      <LinearGradient
        colors={[COLORS.primary.main, COLORS.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: spacing.lg + 40, paddingBottom: spacing.xl }]}
      >
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1 }]}>
            💬 커뮤니티 Q&A
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, marginTop: spacing.xs }]}>
            궁금한 점을 물어보고 답변을 공유하세요
          </Text>
        </View>
      </LinearGradient>

      {/* 주제 필터 */}
      <View style={[styles.filterContainer, { padding: spacing.md, backgroundColor: cardBg }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic.key;
              return (
                <TouchableOpacity
                  key={topic.label}
                  onPress={() => setSelectedTopic(topic.key)}
                  style={[
                    styles.filterButton,
                    isSelected && styles.filterButtonActive,
                    { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${topic.label} 주제 필터`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[
                    styles.filterText,
                    { fontSize: fontSizes.body },
                    isSelected && styles.filterTextActive
                  ]}>
                    {topic.icon} {topic.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 질문 목록 */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.postCard, { backgroundColor: cardBg, marginBottom: spacing.md }]}
            onPress={() => console.log('질문 상세:', item.id)}
            accessibilityRole="button"
            accessibilityLabel={`질문: ${item.title}`}
          >
            <Text style={[styles.postTitle, { fontSize: fontSizes.heading3, color: textPrimary }]}>
              {item.title}
            </Text>
            <Text
              style={[styles.postSummary, { fontSize: fontSizes.body, color: textSecondary, marginTop: spacing.xs }]}
              numberOfLines={2}
            >
              {item.ai_summary}
            </Text>
            <View style={[styles.postMeta, { marginTop: spacing.sm }]}>
              <Text style={[styles.postAuthor, { fontSize: fontSizes.caption, color: textSecondary }]}>
                {item.author_name}
              </Text>
              <Text style={[styles.postVotes, { fontSize: fontSizes.caption, color: COLORS.primary.main }]}>
                💡 {item.vote_count}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>💭</Text>
            <Text style={[styles.emptyTitle, { fontSize: fontSizes.heading2, color: textPrimary }]}>
              아직 질문이 없어요
            </Text>
            <Text style={[styles.emptyDesc, { fontSize: fontSizes.body, color: textSecondary }]}>
              첫 질문을 남겨보세요!
            </Text>
          </View>
        }
      />

      {/* 질문 작성 버튼 (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => console.log('질문 작성')}
        accessibilityLabel="질문 작성하기"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[COLORS.primary.main, COLORS.primary.dark]}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>✏️</Text>
          <Text style={[styles.fabText, { fontSize: fontSizes.body }]}>질문하기</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary.main,
  },
  filterText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  postCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postTitle: {
    fontWeight: '600',
  },
  postSummary: {
    lineHeight: 22,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postAuthor: {},
  postVotes: {
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDesc: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  fabIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
