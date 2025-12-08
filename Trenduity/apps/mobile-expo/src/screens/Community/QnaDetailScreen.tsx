import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useQnaPostDetail, useAnswers, useCreateAnswer } from '../../hooks/useQna';
import { ReactionButtons } from '../../components/ReactionButtons';
import { useQnaAnswersSubscription } from '../../hooks/useRealtimeSubscription';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';

type QnaDetailRouteParams = {
  postId: string;
};

export function QnaDetailScreen() {
  const route = useRoute<RouteProp<{ params: QnaDetailRouteParams }, 'params'>>();
  const { postId } = route.params;

  const { data: post, isLoading, error } = useQnaPostDetail(postId);
  const { data: answersData, isLoading: answersLoading, refetch: refetchAnswers } = useAnswers(postId);
  const createAnswer = useCreateAnswer();
  const { spacing, fontSizes, buttonHeight } = useA11y();

  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Realtime 구독: 새 답변이 추가되면 실시간으로 목록 새로고침
  useQnaAnswersSubscription(postId, (newAnswer) => {
    console.log('[Realtime] New answer received:', newAnswer);
    refetchAnswers();
    setToastMessage('새 답변이 달렸어요!');
    setToastType('success');
    setShowToast(true);
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <Text style={[styles.loadingText, { fontSize: fontSizes.body, marginTop: spacing.md }]}>
          질문을 불러오는 중...
        </Text>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.errorText, { fontSize: fontSizes.body }]}>
          질문을 불러올 수 없어요. 잠시 후 다시 시도해 주세요. 😢
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing.lg }}>
        {/* 제목 */}
        <Text style={[styles.title, { fontSize: fontSizes.heading1 }]}>{post.title}</Text>

        {/* 메타 정보 */}
        <View
          style={[
            styles.meta,
            { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
          ]}
        >
          <Text style={[styles.author, { fontSize: fontSizes.small }]}>{post.author_name}</Text>
          <Text style={[styles.date, { fontSize: fontSizes.small }]}>
            {new Date(post.created_at).toLocaleDateString('ko-KR')}
          </Text>
        </View>

        <View style={[styles.divider, { marginVertical: spacing.md }]} />

        {/* 본문 */}
        <Text style={[styles.body, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}>
          {post.body}
        </Text>

        <View style={[styles.divider, { marginVertical: spacing.lg }]} />

        {/* 리액션 버튼 */}
        <Text style={[styles.reactionLabel, { fontSize: fontSizes.body, marginBottom: spacing.sm }]}>
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
              borderRadius: RADIUS.md,
              marginTop: spacing.lg,
            },
          ]}
        >
          <Text style={[styles.voteText, { fontSize: fontSizes.body, textAlign: 'center' }]}>
            💡 {post.vote_count || 0}명이 이 질문을 유용하다고 했어요
          </Text>
        </View>

        {/* 토스트 메시지 */}
        {showToast && (
          <View style={[styles.toast, { 
            backgroundColor: toastType === 'success' ? COLORS.status.success : COLORS.status.error,
            padding: spacing.md,
            borderRadius: RADIUS.md,
            marginTop: spacing.md,
          }]}>
            <Text style={[styles.toastText, { fontSize: fontSizes.body, color: '#FFFFFF' }]}>
              {toastMessage}
            </Text>
          </View>
        )}
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
  loadingText: {
    color: COLORS.neutral.text.secondary,
  },
  errorText: {
    color: COLORS.status.error,
    textAlign: 'center',
  },
  title: {
    color: COLORS.neutral.text.primary,
    fontWeight: '700',
  },
  meta: {},
  author: {
    color: COLORS.neutral.text.secondary,
  },
  date: {
    color: COLORS.neutral.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral.divider,
  },
  body: {
    color: COLORS.neutral.text.primary,
  },
  reactionLabel: {
    color: COLORS.neutral.text.primary,
    fontWeight: '500',
  },
  voteCard: {},
  voteText: {
    color: COLORS.primary.main,
  },
  toast: {},
  toastText: {},
});
