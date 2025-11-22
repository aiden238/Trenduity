import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Typography, Card, Button, Spinner, EmptyState, ErrorState } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';
import { useInsightList, useFollowingTopics } from '../../hooks/useInsights';
import { useNavigation } from '@react-navigation/native';

/**
 * 주제 목록
 */
const TOPICS = [
  { key: undefined, label: '전체', icon: '📚' },
  { key: 'ai_tools', label: 'AI 활용', icon: '🤖' },
  { key: 'digital_safety', label: '디지털 안전', icon: '🛡️' },
  { key: 'health', label: '건강', icon: '💊' },
  { key: 'finance', label: '금융', icon: '💰' },
];

/**
 * 인사이트 목록 화면
 */
export const InsightListScreen = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
  
  const { data: insights, isLoading, error } = useInsightList(selectedTopic, range);
  const { data: followingTopics } = useFollowingTopics();
  const { mode, spacing, fontSizes } = useA11y();
  const navigation = useNavigation();
  
  const handleInsightPress = (insightId: string) => {
    navigation.navigate('InsightDetail' as never, { insightId } as never);
  };
  
  // 로딩 상태
  if (isLoading) {
    return <Spinner size="large" color="#2196F3" />;
  }
  
  // 에러 상태
  if (error) {
    return (
      <ErrorState
        message="인사이트를 불러올 수 없어요. 잠시 후 다시 시도해 주세요."
      />
    );
  }
  
  return (
    <View style={styles.container}>
      {/* 주제 필터 */}
      <View style={[styles.topicFilter, { paddingVertical: spacing }]}>
        <FlatList
          horizontal
          data={TOPICS}
          keyExtractor={(item) => item.key || 'all'}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = item.key === selectedTopic;
            
            return (
              <TouchableOpacity
                onPress={() => setSelectedTopic(item.key)}
                style={[
                  styles.topicChip,
                  { marginHorizontal: spacing / 2 },
                  isSelected && styles.topicChipSelected
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${item.label} 주제 필터`}
                accessibilityHint="버튼을 누르면 해당 주제의 인사이트만 표시됩니다"
                accessibilityState={{ selected: isSelected }}
              >
                <Typography
                  variant="body"
                  mode={mode}
                  style={{
                    fontSize: fontSizes.body,
                    color: isSelected ? '#FFFFFF' : '#666666'
                  }}
                >
                  {item.icon} {item.label}
                </Typography>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      
      {/* 기간 필터 */}
      <View style={[styles.rangeFilter, { padding: spacing }]}>
        <Button
          mode={mode}
          onPress={() => setRange('weekly')}
          variant={range === 'weekly' ? 'primary' : 'outline'}
          style={{ flex: 1, marginRight: spacing / 2 }}
          accessibilityRole="button"
          accessibilityLabel="최근 7일 인사이트 보기"
          accessibilityHint="버튼을 누르면 최근 일주일 인사이트를 표시합니다"
        >
          최근 7일
        </Button>
        <Button
          mode={mode}
          onPress={() => setRange('monthly')}
          variant={range === 'monthly' ? 'primary' : 'outline'}
          style={{ flex: 1, marginLeft: spacing / 2 }}
          accessibilityRole="button"
          accessibilityLabel="최근 30일 인사이트 보기"
          accessibilityHint="버튼을 누르면 최근 한 달 인사이트를 표시합니다"
        >
          최근 30일
        </Button>
      </View>
      
      {/* 인사이트 목록 */}
      <FlatList
        data={insights}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing }}
        renderItem={({ item }) => {
          // 주제 정보
          const topicInfo = TOPICS.find(t => t.key === item.topic);
          
          return (
            <TouchableOpacity
              onPress={() => handleInsightPress(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`인사이트: ${item.title}`}
              accessibilityHint="버튼을 누르면 인사이트 전체 내용을 볼 수 있습니다"
            >
              <Card mode={mode} style={{ marginBottom: spacing }}>
                {/* 주제 태그 */}
                <View style={styles.topicTag}>
                  <Typography
                    variant="caption"
                    mode={mode}
                    style={{ fontSize: fontSizes.caption, color: '#666666' }}
                  >
                    {topicInfo?.icon} {topicInfo?.label || item.topic}
                  </Typography>
                </View>
                
                {/* 제목 */}
                <Typography
                  variant="heading"
                  mode={mode}
                  style={{ fontSize: fontSizes.heading2, marginTop: spacing / 2 }}
                >
                  {item.title}
                </Typography>
                
                {/* 요약 */}
                <Typography
                  variant="body"
                  mode={mode}
                  style={{
                    fontSize: fontSizes.body,
                    color: '#666666',
                    marginTop: spacing / 2
                  }}
                  numberOfLines={2}
                >
                  {item.summary}
                </Typography>
                
                {/* 날짜 & 출처 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing }}>
                  <Typography
                    variant="caption"
                    mode={mode}
                    style={{ fontSize: fontSizes.caption, color: '#999999' }}
                  >
                    {item.date}
                  </Typography>
                  {item.source && (
                    <Typography
                      variant="caption"
                      mode={mode}
                      style={{ fontSize: fontSizes.caption, color: '#999999' }}
                    >
                      출처: {item.source}
                    </Typography>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Typography variant="body" mode={mode} style={{ color: '#999999' }}>
              인사이트가 없어요.
            </Typography>
          </View>
        }
      />
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
    padding: 32,
  },
  topicFilter: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  topicChipSelected: {
    backgroundColor: '#2196F3',
  },
  rangeFilter: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  topicTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F8FF',
    borderRadius: 4,
  },
});
