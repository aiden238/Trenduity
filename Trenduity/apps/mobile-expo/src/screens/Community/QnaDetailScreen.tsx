import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useQnaPostDetail } from '../../hooks/useQna';
import { ReactionButtons } from '../../components/ReactionButtons';

type QnaDetailRouteParams = {
  postId: string;
};

export function QnaDetailScreen() {
  const route = useRoute<RouteProp<{ params: QnaDetailRouteParams }, 'params'>>();
  const { postId } = route.params;

  const { data: post, isLoading, error } = useQnaPostDetail(postId);
  const { spacing, fontSizes } = useA11y();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={[styles.container, styles.centered, { padding: spacing.lg }]}>
        <Text style={[styles.errorText, { fontSize: fontSizes.md }]}>
          질문을 불러올 수 없어요. 다시 시도해 주세요.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing.lg }}>
        {/* 제목 */}
        <Text style={[styles.title, { fontSize: fontSizes.xl }]}>{post.title}</Text>

        {/* 메타 정보 */}
        <View
          style={[
            styles.meta,
            { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
          ]}
        >
          <Text style={[styles.author, { fontSize: fontSizes.sm }]}>{post.author_name}</Text>
          <Text style={[styles.date, { fontSize: fontSizes.sm }]}>
            {new Date(post.created_at).toLocaleDateString('ko-KR')}
          </Text>
        </View>

        <View style={[styles.divider, { marginVertical: spacing.md }]} />

        {/* 본문 */}
        <Text style={[styles.body, { fontSize: fontSizes.md, lineHeight: fontSizes.md * 1.6 }]}>
          {post.body}
        </Text>

        <View style={[styles.divider, { marginVertical: spacing.lg }]} />

        {/* 리액션 버튼 */}
        <Text style={[styles.reactionLabel, { fontSize: fontSizes.md, marginBottom: spacing.sm }]}>
          이 질문이 도움이 되었나요?
        </Text>
        <ReactionButtons targetType="qna_post" targetId={postId} />

        {/* 투표 수 표시 */}
        <View
          style={[
            styles.voteCard,
            {
              backgroundColor: '#E3F2FD',
              padding: spacing.md,
              borderRadius: spacing.sm,
              marginTop: spacing.lg,
            },
          ]}
        >
          <Text style={[styles.voteText, { fontSize: fontSizes.md, textAlign: 'center' }]}>
            💡 {post.vote_count}명이 이 질문을 유용하다고 했어요
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#212121',
    lineHeight: 32,
  },
  meta: {},
  author: {
    color: '#999',
  },
  date: {
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  body: {
    color: '#424242',
  },
  reactionLabel: {
    fontWeight: '600',
    color: '#212121',
  },
  voteCard: {
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  voteText: {
    color: '#1976D2',
    fontWeight: '500',
  },
});
