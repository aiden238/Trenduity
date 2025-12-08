import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useA11y } from '../../contexts/A11yContext';
import { useTTS } from '../../hooks/useTTS';
import { useInsightDetail, useFollowTopic, useFollowingTopics } from '../../hooks/useInsights';
import { useRoute } from '@react-navigation/native';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';

/**
 * 인사이트 상세 화면
 */
export const InsightDetailScreen = () => {
  const route = useRoute();
  const { insightId } = route.params as { insightId: string };
  
  const { data: insight, isLoading, error } = useInsightDetail(insightId);
  const { data: followingTopics } = useFollowingTopics();
  const followTopic = useFollowTopic();
  const { speak, stop, isSpeaking } = useTTS();
  const { spacing, buttonHeight, fontSizes } = useA11y();
  
  // 로딩 상태
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <Text style={[styles.loadingText, { fontSize: fontSizes.body, marginTop: spacing.md }]}>
          인사이트를 불러오는 중이에요...
        </Text>
      </View>
    );
  }
  
  // 에러 상태
  if (error || !insight) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.errorText, { fontSize: fontSizes.body }]}>
          인사이트를 불러올 수 없어요. 😢
        </Text>
      </View>
    );
  }
  
  const isFollowing = followingTopics?.includes(insight.topic);
  
  // TTS 핸들러
  const handleTTS = () => {
    if (isSpeaking) {
      stop();
    } else {
      const fullText = `${insight.title}. ${insight.summary}. ${insight.body}. ${insight.impact}`;
      speak(fullText);
    }
  };
  
  // 팔로우 핸들러
  const handleFollow = async () => {
    try {
      await followTopic.mutateAsync(insight.topic);
    } catch (err) {
      console.error('Follow error:', err);
    }
  };
  
  // 참고 링크 핸들러
  const handleReferencePress = (url: string) => {
    Linking.openURL(url);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing.md }}>
        {/* 제목 */}
        <Text
          style={[styles.title, { fontSize: fontSizes.heading1 }]}
        >
          {insight.title}
        </Text>
        
        {/* 요약 */}
        <View style={[styles.summaryCard, { marginTop: spacing.md, padding: spacing.md, borderRadius: RADIUS.md }]}>
          <Text style={[styles.summaryText, { fontSize: fontSizes.body }]}>
            💡 {insight.summary}
          </Text>
        </View>
        
        {/* 본문 */}
        <Text
          style={[styles.body, {
            marginTop: spacing.md,
            fontSize: fontSizes.body,
            lineHeight: fontSizes.body * 1.6
          }]}
        >
          {insight.body}
        </Text>
        
        {/* 영향/의미 */}
        {insight.impact && (
          <View style={[styles.impactCard, { marginTop: spacing.md, padding: spacing.md, borderRadius: RADIUS.md }]}>
            <Text style={[styles.impactTitle, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}>
              📌 이게 왜 중요해요?
            </Text>
            <Text style={[styles.impactText, { fontSize: fontSizes.body }]}>
              {insight.impact}
            </Text>
          </View>
        )}
        
        {/* 액션 버튼들 */}
        <View style={[styles.actions, { marginTop: spacing.lg }]}>
          {/* TTS 버튼 */}
          <TouchableOpacity
            style={[styles.actionButton, { 
              height: buttonHeight, 
              backgroundColor: isSpeaking ? COLORS.status.warning : COLORS.primary.main,
              borderRadius: RADIUS.lg,
              marginBottom: spacing.sm,
            }]}
            onPress={handleTTS}
            accessibilityRole="button"
            accessibilityLabel={isSpeaking ? "읽기 멈추기" : "글 읽어주기"}
          >
            <Text style={[styles.actionButtonText, { fontSize: fontSizes.body }]}>
              {isSpeaking ? '⏹️ 읽기 멈추기' : '🔊 읽어주기'}
            </Text>
          </TouchableOpacity>
          
          {/* 팔로우 버튼 */}
          <TouchableOpacity
            style={[styles.actionButton, { 
              height: buttonHeight, 
              backgroundColor: isFollowing ? COLORS.neutral.border : COLORS.secondary.main,
              borderRadius: RADIUS.lg,
            }]}
            onPress={handleFollow}
            accessibilityRole="button"
            accessibilityLabel={isFollowing ? "팔로우 취소" : "이 주제 팔로우하기"}
          >
            <Text style={[styles.actionButtonText, { fontSize: fontSizes.body }]}>
              {isFollowing ? '✓ 팔로우 중' : '+ 팔로우'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* 참고 링크 */}
        {insight.references && insight.references.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={[styles.sectionTitle, { fontSize: fontSizes.body, marginBottom: spacing.sm }]}>
              📚 참고 자료
            </Text>
            {insight.references.map((ref: any, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleReferencePress(ref.url)}
                style={[styles.referenceItem, { padding: spacing.sm, marginBottom: spacing.xs }]}
                accessibilityRole="link"
              >
                <Text style={[styles.referenceText, { fontSize: fontSizes.small }]}>
                  🔗 {ref.title || ref.url}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
  summaryCard: {
    backgroundColor: '#E0F2FE',
  },
  summaryText: {
    color: COLORS.primary.main,
    fontWeight: '500',
  },
  body: {
    color: COLORS.neutral.text.primary,
  },
  impactCard: {
    backgroundColor: '#FEF3C7',
  },
  impactTitle: {
    color: COLORS.status.warning,
    fontWeight: '700',
  },
  impactText: {
    color: COLORS.neutral.text.primary,
  },
  actions: {},
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionTitle: {
    color: COLORS.neutral.text.primary,
    fontWeight: '600',
  },
  referenceItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: RADIUS.sm,
  },
  referenceText: {
    color: COLORS.primary.main,
  },
});
