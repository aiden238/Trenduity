import React from 'react';
import { View, StyleSheet, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { Typography, Button, Card } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';
import { useTTS } from '../../hooks/useTTS';
import { useInsightDetail, useFollowTopic, useFollowingTopics } from '../../hooks/useInsights';
import { useRoute } from '@react-navigation/native';

/**
 * 인사이트 상세 화면
 */
export const InsightDetailScreen = () => {
  const route = useRoute();
  const { insightId } = route.params as { insightId: string };
  
  const { data: insight, isLoading, error } = useInsightDetail(insightId);
  const { data: followingTopics } = useFollowingTopics();
  const followTopic = useFollowTopic();
  const { speak, stop } = useTTS();
  const { mode, spacing, buttonHeight, fontSizes } = useA11y();
  
  // 로딩 상태
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Typography variant="body" mode={mode} style={{ marginTop: spacing }}>
          인사이트를 불러오는 중이에요...
        </Typography>
      </View>
    );
  }
  
  // 에러 상태
  if (error || !insight) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Typography variant="body" mode={mode}>
          인사이트를 불러올 수 없어요. 😢
        </Typography>
      </View>
    );
  }
  
  const isFollowing = followingTopics?.includes(insight.topic);
  
  // TTS 핸들러
  const handleTTS = () => {
    const fullText = `${insight.title}. ${insight.summary}. ${insight.body}. ${insight.impact}`;
    speak(fullText);
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
      <View style={{ padding: spacing }}>
        {/* 제목 */}
        <Typography
          variant="heading"
          mode={mode}
          style={{ fontSize: fontSizes.heading1 }}
        >
          {insight.title}
        </Typography>
        
        {/* 요약 */}
        <Card mode={mode} style={{ marginTop: spacing, backgroundColor: '#F0F8FF' }}>
          <Typography variant="body" mode={mode} style={{ fontSize: fontSizes.body }}>
            💡 {insight.summary}
          </Typography>
        </Card>
        
        {/* 본문 */}
        <Typography
          variant="body"
          mode={mode}
          style={{
            marginTop: spacing,
            fontSize: fontSizes.body,
            lineHeight: fontSizes.body * 1.6
          }}
        >
          {insight.body}
        </Typography>
        
        {/* 영향 */}
        {insight.impact && (
          <Card mode={mode} style={{ marginTop: spacing, backgroundColor: '#FFF4E6' }}>
            <Typography variant="body" mode={mode} style={{ fontSize: fontSizes.body }}>
              ✨ {insight.impact}
            </Typography>
          </Card>
        )}
        
        {/* 참고 링크 */}
        {insight.references && insight.references.length > 0 && (
          <View style={{ marginTop: spacing * 2 }}>
            <Typography
              variant="heading"
              mode={mode}
              style={{ fontSize: fontSizes.heading2 }}
            >
              🔗 참고 자료
            </Typography>
            {insight.references.map((ref, index) => (
              <Button
                key={index}
                mode={mode}
                onPress={() => handleReferencePress(ref.url)}
                variant="outline"
                style={{ marginTop: spacing / 2, height: buttonHeight }}
                accessibilityLabel={`참고 링크: ${ref.title}`}
              >
                {ref.title}
              </Button>
            ))}
          </View>
        )}
        
        {/* 액션 버튼 */}
        <View style={{ marginTop: spacing * 2 }}>
          {/* 읽어주기 버튼 */}
          <Button
            mode={mode}
            onPress={handleTTS}
            variant="secondary"
            style={{ height: buttonHeight }}
            accessibilityLabel="인사이트 읽어주기"
          >
            🎤 읽어주기
          </Button>
          
          {/* 팔로우 버튼 */}
          <Button
            mode={mode}
            onPress={handleFollow}
            variant={isFollowing ? 'outline' : 'primary'}
            style={{ marginTop: spacing, height: buttonHeight }}
            disabled={followTopic.isPending}
            accessibilityLabel={isFollowing ? '주제 팔로우 해제' : '주제 팔로우'}
          >
            {followTopic.isPending
              ? '처리 중...'
              : isFollowing
              ? '⭐ 팔로우 중'
              : '⭐ 주제 팔로우'}
          </Button>
        </View>
        
        {/* 출처 */}
        {insight.source && (
          <Typography
            variant="caption"
            mode={mode}
            style={{
              fontSize: fontSizes.caption,
              color: '#999999',
              marginTop: spacing * 2,
              textAlign: 'center'
            }}
          >
            출처: {insight.source}
          </Typography>
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
    padding: 32,
  },
});
