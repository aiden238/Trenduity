import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useA11y } from '../../contexts/A11yContext';
import { useTTS } from '../../hooks/useTTS';
import { useInsightDetail, useFollowTopic, useFollowingTopics } from '../../hooks/useInsights';
import { useRoute } from '@react-navigation/native';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';

/**
 * 마크다운 스타일 텍스트 렌더링 (간단 버전)
 */
const renderMarkdownContent = (content: string, fontSizes: any, textColor: string) => {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  
  lines.forEach((line, index) => {
    // 제목 (##)
    if (line.startsWith('## ')) {
      elements.push(
        <Text 
          key={index} 
          style={{ 
            fontSize: fontSizes.heading2, 
            fontWeight: '700', 
            color: textColor,
            marginTop: index > 0 ? 20 : 0,
            marginBottom: 8,
          }}
        >
          {line.replace('## ', '')}
        </Text>
      );
    }
    // 대제목 (#)
    else if (line.startsWith('# ')) {
      elements.push(
        <Text 
          key={index} 
          style={{ 
            fontSize: fontSizes.heading1, 
            fontWeight: '700', 
            color: textColor,
            marginBottom: 12,
          }}
        >
          {line.replace('# ', '')}
        </Text>
      );
    }
    // 인용문 (>)
    else if (line.startsWith('> ')) {
      elements.push(
        <View 
          key={index} 
          style={{
            backgroundColor: '#FEF3C7',
            borderLeftWidth: 4,
            borderLeftColor: COLORS.status.warning,
            padding: 12,
            marginVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: fontSizes.body, color: '#92400E', fontWeight: '500' }}>
            {line.replace('> ', '')}
          </Text>
        </View>
      );
    }
    // 번호 목록 (1. 2. 등)
    else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <Text 
          key={index} 
          style={{ 
            fontSize: fontSizes.body, 
            color: textColor, 
            marginVertical: 4,
            paddingLeft: 8,
            lineHeight: fontSizes.body * 1.6,
          }}
        >
          {line}
        </Text>
      );
    }
    // 불릿 목록 (- 또는 *)
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <Text 
          key={index} 
          style={{ 
            fontSize: fontSizes.body, 
            color: textColor, 
            marginVertical: 4,
            paddingLeft: 8,
            lineHeight: fontSizes.body * 1.6,
          }}
        >
          • {line.replace(/^[-*]\s/, '')}
        </Text>
      );
    }
    // 빈 줄
    else if (line.trim() === '') {
      elements.push(<View key={index} style={{ height: 8 }} />);
    }
    // 일반 텍스트
    else {
      elements.push(
        <Text 
          key={index} 
          style={{ 
            fontSize: fontSizes.body, 
            color: textColor, 
            lineHeight: fontSizes.body * 1.6,
            marginVertical: 2,
          }}
        >
          {line}
        </Text>
      );
    }
  });
  
  return elements;
};

/**
 * 인사이트 상세 화면
 */
export const InsightDetailScreen = () => {
  const route = useRoute();
  const { insightId, mockData } = route.params as { insightId: string; mockData?: any };
  
  const { data: apiInsight, isLoading, error } = useInsightDetail(insightId);
  const { data: followingTopics } = useFollowingTopics();
  const followTopic = useFollowTopic();
  const { speak, stop, isSpeaking } = useTTS();
  const { spacing, buttonHeight, fontSizes } = useA11y();
  
  // 목업 데이터 우선 사용
  const insight = mockData || apiInsight;
  
  // 로딩 상태 (API 호출 중이고 목업 데이터도 없을 때)
  if (isLoading && !mockData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <Text style={[styles.loadingText, { fontSize: fontSizes.body, marginTop: spacing.md }]}>
          인사이트를 불러오는 중이에요...
        </Text>
      </View>
    );
  }
  
  // 에러 상태 (데이터 없음)
  if (!insight) {
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
      // 목업 데이터는 content 필드 사용, API 데이터는 body 사용
      const textContent = insight.content || insight.body || '';
      // 마크다운 기호 제거
      const cleanText = textContent
        .replace(/^#+\s/gm, '')
        .replace(/^[-*]\s/gm, '')
        .replace(/^>\s/gm, '')
        .replace(/\*\*/g, '');
      const fullText = `${insight.title}. ${insight.summary}. ${cleanText}`;
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

  // 본문 내용 (목업은 content, API는 body)
  const bodyContent = insight.content || insight.body;
  
  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing.md }}>
        {/* 카테고리 및 읽기 시간 */}
        <View style={styles.metaRow}>
          <Text style={[styles.categoryBadge, { fontSize: fontSizes.caption }]}>
            {insight.topic === 'ai_tools' ? '🤖 AI 활용' :
             insight.topic === 'digital_safety' ? '🛡️ 디지털 안전' :
             insight.topic === 'health' ? '💊 건강' :
             insight.topic === 'finance' ? '💰 금융' : '📚 기타'}
          </Text>
          <Text style={[styles.readTime, { fontSize: fontSizes.caption }]}>
            📖 {insight.read_time_min || 3}분 읽기
          </Text>
        </View>

        {/* 제목 */}
        <Text style={[styles.title, { fontSize: fontSizes.heading1 + 4, marginTop: spacing.sm }]}>
          {insight.title}
        </Text>
        
        {/* 날짜 */}
        {insight.published_at && (
          <Text style={[styles.dateText, { fontSize: fontSizes.caption, marginTop: spacing.xs }]}>
            {new Date(insight.published_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        )}
        
        {/* 요약 */}
        <View style={[styles.summaryCard, { marginTop: spacing.md, padding: spacing.md, borderRadius: RADIUS.md }]}>
          <Text style={[styles.summaryText, { fontSize: fontSizes.body }]}>
            💡 {insight.summary}
          </Text>
        </View>
        
        {/* 본문 (마크다운 렌더링) */}
        <View style={{ marginTop: spacing.lg }}>
          {bodyContent ? (
            renderMarkdownContent(bodyContent, fontSizes, COLORS.neutral.text.primary)
          ) : (
            <Text style={[styles.body, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}>
              {insight.body}
            </Text>
          )}
        </View>
        
        {/* 영향/의미 (API 데이터용) */}
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  readTime: {
    color: COLORS.neutral.text.secondary,
  },
  dateText: {
    color: COLORS.neutral.text.secondary,
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
