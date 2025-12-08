import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';

const TOPICS = [
  { key: undefined, label: '전체', icon: '📚' },
  { key: 'ai_tools', label: 'AI 활용', icon: '🤖' },
  { key: 'digital_safety', label: '디지털 안전', icon: '🛡️' },
  { key: 'health', label: '건강', icon: '💊' },
  { key: 'general', label: '일반', icon: '💬' },
];

// 좋아요 저장 키
const LIKES_STORAGE_KEY = '@qna_likes';

// 더미 데이터
const DUMMY_POSTS = [
  {
    id: '1',
    title: 'ChatGPT 사용법이 궁금해요',
    ai_summary: 'ChatGPT를 처음 사용하는데 어떻게 시작하면 좋을지 알려주세요.',
    author_name: '김영희',
    vote_count: 12,
    topic: 'ai_tools',
    created_at: '2024-12-05',
  },
  {
    id: '2',
    title: '모르는 전화번호 조심해야 하나요?',
    ai_summary: '요즘 모르는 번호로 전화가 많이 와서 걱정이에요. 어떻게 대처하면 좋을까요?',
    author_name: '이철수',
    vote_count: 8,
    topic: 'digital_safety',
    created_at: '2024-12-04',
  },
  {
    id: '3',
    title: '혈압 기록 앱 추천해주세요',
    ai_summary: '매일 혈압을 기록하고 싶은데 좋은 앱이 있을까요?',
    author_name: '박순자',
    vote_count: 15,
    topic: 'health',
    created_at: '2024-12-03',
  },
  {
    id: '4',
    title: '스마트폰 글씨 크게 하는 방법',
    ai_summary: '눈이 침침해서 글씨가 잘 안 보여요. 글씨 크기 조절하는 방법 알려주세요.',
    author_name: '정미숙',
    vote_count: 20,
    topic: 'general',
    created_at: '2024-12-02',
  },
  {
    id: '5',
    title: '카카오톡 프로필 사진 바꾸는 법',
    ai_summary: '손주 사진으로 프로필을 바꾸고 싶어요. 어떻게 하나요?',
    author_name: '홍길동',
    vote_count: 25,
    topic: 'general',
    created_at: '2024-12-01',
  },
];

export const QnaListScreen = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [localVoteCounts, setLocalVoteCounts] = useState<Record<string, number>>({});
  const { spacing, fontSizes } = useA11y();
  const { activeTheme, colors } = useTheme();
  const navigation = useNavigation<any>();
  
  // 다크 모드 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#1F2937';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  // 좋아요 상태 로드
  useEffect(() => {
    loadLikes();
  }, []);

  const loadLikes = async () => {
    try {
      const stored = await AsyncStorage.getItem(LIKES_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setLikedPosts(new Set(data.likedPosts || []));
        setLocalVoteCounts(data.voteCounts || {});
      }
    } catch (e) {
      console.log('좋아요 로드 실패:', e);
    }
  };

  const saveLikes = async (newLikedPosts: Set<string>, newVoteCounts: Record<string, number>) => {
    try {
      await AsyncStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify({
        likedPosts: Array.from(newLikedPosts),
        voteCounts: newVoteCounts,
      }));
    } catch (e) {
      console.log('좋아요 저장 실패:', e);
    }
  };

  const handleLikeToggle = async (postId: string, e: any) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    const newLikedPosts = new Set(likedPosts);
    const newVoteCounts = { ...localVoteCounts };
    
    if (likedPosts.has(postId)) {
      // 좋아요 취소
      newLikedPosts.delete(postId);
      newVoteCounts[postId] = (newVoteCounts[postId] || 0) - 1;
    } else {
      // 좋아요 추가
      newLikedPosts.add(postId);
      newVoteCounts[postId] = (newVoteCounts[postId] || 0) + 1;
    }
    
    setLikedPosts(newLikedPosts);
    setLocalVoteCounts(newVoteCounts);
    await saveLikes(newLikedPosts, newVoteCounts);
  };

  const getVoteCount = (post: typeof DUMMY_POSTS[0]) => {
    return post.vote_count + (localVoteCounts[post.id] || 0);
  };

  // 필터된 게시물
  const filteredPosts = selectedTopic 
    ? DUMMY_POSTS.filter(post => post.topic === selectedTopic)
    : DUMMY_POSTS;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 - 붉은 노랑 계열 */}
      <View
        style={[styles.header, { 
          paddingTop: spacing.lg + 40, 
          paddingBottom: spacing.xl,
          backgroundColor: '#D97706'
        }]}
      >
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1 }]}>
            🤝 배움의 나눔터
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, marginTop: spacing.xs }]}>
            궁금한 점을 물어보고 답변을 공유하세요
          </Text>
        </View>
      </View>

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

      {/* 게시물 목록 */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('QnaDetail', { postId: item.id })}
            style={[
              styles.postCard,
              { 
                backgroundColor: cardBg, 
                marginBottom: spacing.md,
                padding: spacing.md,
                borderRadius: RADIUS.lg,
              }
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${item.title} - ${item.author_name}님의 질문`}
          >
            <Text style={[styles.postTitle, { fontSize: fontSizes.body, color: textPrimary }]}>
              {item.title}
            </Text>
            <Text 
              style={[
                styles.postSummary, 
                { fontSize: fontSizes.small, color: textSecondary, marginTop: spacing.xs }
              ]}
              numberOfLines={2}
            >
              {item.ai_summary}
            </Text>
            <View style={[styles.postMeta, { marginTop: spacing.sm }]}>
              <View style={styles.authorRow}>
                <Text style={[styles.postAuthor, { fontSize: fontSizes.small, color: textSecondary }]}>
                  {item.author_name}
                </Text>
                {item.created_at && (
                  <Text style={[styles.postDate, { fontSize: fontSizes.small, color: textSecondary }]}>
                    · {new Date(item.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={(e) => handleLikeToggle(item.id, e)}
                style={[
                  styles.likeButton,
                  likedPosts.has(item.id) && styles.likeButtonActive,
                  { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm }
                ]}
                accessibilityRole="button"
                accessibilityLabel={likedPosts.has(item.id) ? '좋아요 취소' : '좋아요'}
                accessibilityState={{ selected: likedPosts.has(item.id) }}
              >
                <Text style={[
                  styles.postVotes, 
                  { fontSize: fontSizes.small },
                  likedPosts.has(item.id) ? styles.likeTextActive : { color: textSecondary }
                ]}>
                  {likedPosts.has(item.id) ? '❤️' : '🤍'} {getVoteCount(item)}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary }]}>
              아직 질문이 없어요. 첫 번째 질문을 올려보세요! 🙋
            </Text>
          </View>
        }
      />

      {/* FAB - 질문하기 버튼 */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: COLORS.primary.main }]}
        onPress={() => navigation.navigate('QnaCreate')}
        accessibilityRole="button"
        accessibilityLabel="새 질문 작성하기"
      >
        <Text style={styles.fabText}>✏️</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  filterContainer: {
    ...SHADOWS.sm,
  },
  filterButton: {
    borderRadius: RADIUS.lg,
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
    ...SHADOWS.md,
  },
  postTitle: {
    fontWeight: '600',
  },
  postSummary: {
    lineHeight: 20,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthor: {},
  postDate: {
    marginLeft: 4,
  },
  likeButton: {
    borderRadius: RADIUS.md,
    backgroundColor: '#F3F4F6',
  },
  likeButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  postVotes: {
    fontWeight: '600',
  },
  likeTextActive: {
    color: '#EF4444',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  fabText: {
    fontSize: 24,
  },
});
