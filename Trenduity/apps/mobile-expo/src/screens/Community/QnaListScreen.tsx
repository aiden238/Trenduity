import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useQnaPosts } from '../../hooks/useQna';

const TOPICS = [
  { key: undefined, label: '전체' },
  { key: 'ai_tools', label: 'AI 활용' },
  { key: 'digital_safety', label: '디지털 안전' },
  { key: 'health', label: '건강' },
  { key: 'general', label: '일반' },
];

export const QnaListScreen = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const { data, isLoading, error } = useQnaPosts(selectedTopic);
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* 주제 필터 */}
      <View style={{ padding: spacing.md }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {TOPICS.map((topic) => (
              <Pressable
                key={topic.label}
                style={[
                  styles.topicChip,
                  {
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: spacing.md,
                  },
                  selectedTopic === topic.key && styles.topicChipActive,
                ]}
                onPress={() => setSelectedTopic(topic.key)}
                accessibilityRole="button"
                accessibilityLabel={`${topic.label} 주제 필터`}
              >
                <Text
                  style={[
                    styles.topicChipText,
                    { fontSize: fontSizes.md },
                    selectedTopic === topic.key && styles.topicChipTextActive,
                  ]}
                >
                  {topic.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 질문 목록 */}
      {isLoading ? (
        <View style={[styles.centered, { padding: spacing.lg }]}>
          <Text style={{ fontSize: fontSizes.md, color: '#666' }}>불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={[styles.centered, { padding: spacing.lg }]}>
          <Text style={{ fontSize: fontSizes.md, color: '#F44336' }}>
            목록을 불러올 수 없어요.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data?.posts || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.postCard,
                { padding: spacing.md, marginBottom: spacing.md, borderRadius: spacing.sm },
              ]}
              onPress={() => navigation.navigate('QnaDetail', { postId: item.id })}
              accessibilityRole="button"
              accessibilityLabel={`질문: ${item.title}`}
            >
              <Text style={[styles.postTitle, { fontSize: fontSizes.lg }]}>{item.title}</Text>
              <Text
                style={[styles.postSummary, { fontSize: fontSizes.md, marginTop: spacing.xs }]}
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
                <Text style={[styles.postAuthor, { fontSize: fontSizes.sm }]}>
                  {item.author_name}
                </Text>
                <Text style={[styles.postVotes, { fontSize: fontSizes.sm }]}>
                  💡 {item.vote_count}명이 유용하다고 했어요
                </Text>
              </View>
            </Pressable>
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
      <View
        style={[
          styles.fab,
          {
            padding: spacing.md,
            paddingBottom: spacing.lg,
          },
        ]}
      >
        <Pressable
          style={[
            styles.fabButton,
            {
              height: buttonHeight,
              borderRadius: spacing.sm,
            },
          ]}
          onPress={() => navigation.navigate('CreateQna')}
          accessibilityRole="button"
          accessibilityLabel="질문 작성하기"
        >
          <Text style={[styles.fabButtonText, { fontSize: fontSizes.md }]}>✏️ 질문하기</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicChip: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  topicChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  topicChipText: {
    color: '#666',
    fontWeight: '500',
  },
  topicChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  postTitle: {
    fontWeight: '600',
    color: '#212121',
  },
  postSummary: {
    color: '#666',
    lineHeight: 22,
  },
  postMeta: {},
  postAuthor: {
    color: '#999',
  },
  postVotes: {
    color: '#2196F3',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  fabButton: {
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
