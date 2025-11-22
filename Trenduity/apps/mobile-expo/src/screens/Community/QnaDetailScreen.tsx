import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Spinner, EmptyState, ErrorState, Toast } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';
import { useQnaPostDetail, useAnswers, useCreateAnswer } from '../../hooks/useQna';
import { ReactionButtons } from '../../components/ReactionButtons';
import { useQnaAnswersSubscription } from '../../hooks/useRealtimeSubscription';

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

  // ✅ Realtime 구독: 새 답변이 추가되면 실시간으로 목록 새로고침
  useQnaAnswersSubscription(postId, (newAnswer) => {
    console.log('[Realtime] New answer received:', newAnswer);
    refetchAnswers(); // 답변 목록 새로고침
    setToastMessage('새 답변이 달렸어요!');
    setToastType('success');
    setShowToast(true);
  });

  if (isLoading) {
    return <Spinner size="large" color="#2196F3" />;
  }

  if (error || !post) {
    return (
      <ErrorState
        message="질문을 불러올 수 없어요. 잠시 후 다시 시도해 주세요."
      />
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
            💡 {post.vote_count || 0}명이 이 질문을 유용하다고 했어요
          </Text>
        </View>

        {/* 답변 섹션 */}
        <View style={[styles.divider, { marginVertical: spacing.lg }]} />

        <Text style={[styles.answersTitle, { fontSize: fontSizes.lg, marginBottom: spacing.md }]}>
          💬 답변 {answersData?.total || 0}개
        </Text>

        {answersLoading ? (
          <Spinner size="small" color="#2196F3" style={{ marginVertical: spacing.md }} />
        ) : answersData && answersData.answers.length > 0 ? (
          <View style={{ marginBottom: spacing.lg }}>
            {answersData.answers.map((answer) => (
              <View
                key={answer.id}
                style={[
                  styles.answerCard,
                  {
                    backgroundColor: '#F9F9F9',
                    padding: spacing.md,
                    marginBottom: spacing.md,
                    borderRadius: spacing.sm,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                  },
                ]}
              >
                <View
                  style={[
                    styles.answerMeta,
                    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
                  ]}
                >
                  <Text style={[styles.answerAuthor, { fontSize: fontSizes.sm }]}>
                    {answer.author_name || '(익명)'}
                  </Text>
                  <Text style={[styles.answerDate, { fontSize: fontSizes.sm }]}>
                    {new Date(answer.created_at).toLocaleDateString('ko-KR')}
                  </Text>
                </View>
                <Text style={[styles.answerBody, { fontSize: fontSizes.md, lineHeight: fontSizes.md * 1.5 }]}>
                  {answer.body}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="💬"
            title="아직 답변이 없어요"
            description="첫 답변을 남겨보세요!"
            style={{ marginBottom: spacing.lg }}
          />
        )}

        {/* 답변 작성 폼 */}
        <View
          style={[
            styles.answerForm,
            {
              backgroundColor: '#F5F5F5',
              padding: spacing.md,
              borderRadius: spacing.sm,
              marginBottom: spacing.xl,
            },
          ]}
        >
          <Text style={[styles.answerFormTitle, { fontSize: fontSizes.md, marginBottom: spacing.sm }]}>
            답변 작성하기
          </Text>
          <TextInput
            style={[
              styles.answerInput,
              {
                fontSize: fontSizes.md,
                padding: spacing.md,
                borderRadius: spacing.sm,
                minHeight: 100,
              },
            ]}
            placeholder="도움이 되는 답변을 남겨주세요..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={answerText}
            onChangeText={setAnswerText}
            editable={!isSubmitting}
            textAlignVertical="top"
          />
          <Pressable
            style={[
              styles.submitButton,
              {
                backgroundColor: answerText.trim().length >= 10 && !isSubmitting ? '#2196F3' : '#CCCCCC',
                height: buttonHeight,
                borderRadius: spacing.sm,
                marginTop: spacing.md,
              },
            ]}
            onPress={async () => {
              if (answerText.trim().length < 10) {
                setToastMessage('답변은 최소 10자 이상 입력해주세요.');
                setToastType('error');
                setShowToast(true);
                return;
              }

              setIsSubmitting(true);
              try {
                await createAnswer.mutateAsync({
                  postId,
                  body: answerText.trim(),
                  is_anon: false,
                });
                setAnswerText('');
                setToastMessage('답변을 올렸어요! 감사합니다.');
                setToastType('success');
                setShowToast(true);
              } catch (error) {
                setToastMessage('답변을 올릴 수 없어요. 다시 시도해 주세요.');
                setToastType('error');
                setShowToast(true);
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={answerText.trim().length < 10 || isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="답변 작성 완료"
            accessibilityHint="버튼을 누르면 작성한 답변이 질문에 등록됩니다"
            accessibilityState={{ disabled: answerText.trim().length < 10 || isSubmitting }}
          >
            <Text
              style={[
                styles.submitButtonText,
                {
                  fontSize: fontSizes.md,
                  color: answerText.trim().length >= 10 && !isSubmitting ? '#FFF' : '#999',
                },
              ]}
            >
              {isSubmitting ? '올리는 중...' : '답변 올리기'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Toast 알림 */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
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
  answersTitle: {
    fontWeight: '700',
    color: '#212121',
  },
  answerCard: {},
  answerMeta: {},
  answerAuthor: {
    color: '#666',
    fontWeight: '500',
  },
  answerDate: {
    color: '#999',
  },
  answerBody: {
    color: '#424242',
  },
  noAnswers: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  answerForm: {},
  answerFormTitle: {
    fontWeight: '600',
    color: '#212121',
  },
  answerInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontWeight: '600',
  },
});
