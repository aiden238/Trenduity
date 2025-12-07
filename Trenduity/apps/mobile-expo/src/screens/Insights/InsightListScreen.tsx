import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useInsightList } from '../../hooks/useInsights';
import { COLORS } from '../../tokens/colors';

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
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: insights, isLoading, error, refetch } = useInsightList(selectedTopic, range);
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();
  const navigation = useNavigation<any>();
  
  // 다크 모드 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  const handleInsightPress = (insightId: string) => {
    navigation.navigate('InsightDetail', { insightId });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderTopicFilter = () => (
    <View style={[styles.topicFilter, { paddingVertical: spacing.sm }]}>
      <FlatList
        horizontal
        data={TOPICS}
        keyExtractor={(item) => item.key || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item }) => {
          const isSelected = item.key === selectedTopic;
          return (
            <TouchableOpacity
              onPress={() => setSelectedTopic(item.key)}
              style={[
                styles.topicChip,
                { 
                  backgroundColor: isSelected ? COLORS.primary.main : cardBg,
                  marginRight: spacing.sm,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} 주제 필터`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.topicChipText,
                  {
                    fontSize: fontSizes.body,
                    color: isSelected ? '#FFFFFF' : textPrimary,
                  },
                ]}
              >
                {item.icon} {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderInsightItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.insightCard, { backgroundColor: cardBg, marginHorizontal: spacing.md }]}
      onPress={() => handleInsightPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} 인사이트 보기`}
    >
      <View style={styles.insightHeader}>
        <Text style={[styles.insightCategory, { fontSize: fontSizes.caption, color: COLORS.primary.main }]}>
          {item.topic === 'ai_tools' ? '🤖 AI 활용' :
           item.topic === 'digital_safety' ? '🛡️ 디지털 안전' :
           item.topic === 'health' ? '💊 건강' :
           item.topic === 'finance' ? '💰 금융' : '📚 기타'}
        </Text>
        <Text style={[styles.insightDate, { fontSize: fontSizes.caption, color: textSecondary }]}>
          {item.published_at ? new Date(item.published_at).toLocaleDateString('ko-KR') : ''}
        </Text>
      </View>
      <Text style={[styles.insightTitle, { fontSize: fontSizes.heading2, color: textPrimary }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.insightSummary, { fontSize: fontSizes.body, color: textSecondary }]} numberOfLines={2}>
        {item.summary}
      </Text>
      <View style={styles.insightFooter}>
        <Text style={[styles.insightReadTime, { fontSize: fontSizes.caption, color: textSecondary }]}>
          📖 {item.read_time_min || 3}분 읽기
        </Text>
        <Text style={[styles.insightViews, { fontSize: fontSizes.caption, color: textSecondary }]}>
          👁️ {item.view_count || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: COLORS.primary.main, padding: spacing.lg }]}>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
          💡 인사이트
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)' }]}>
          최신 디지털 정보를 확인하세요
        </Text>
      </View>

      {/* 주제 필터 */}
      {renderTopicFilter()}

      {/* 인사이트 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
          <Text style={[styles.loadingText, { fontSize: fontSizes.body, color: textSecondary }]}>
            인사이트를 불러오는 중...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { fontSize: fontSizes.heading2, color: textPrimary }]}>
            😢 오류가 발생했어요
          </Text>
          <Text style={[styles.errorDetail, { fontSize: fontSizes.body, color: textSecondary }]}>
            인사이트를 불러올 수 없어요.{'\n'}잠시 후 다시 시도해 주세요.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: COLORS.primary.main, height: buttonHeight }]}
            onPress={() => refetch()}
          >
            <Text style={[styles.retryButtonText, { fontSize: fontSizes.body }]}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={insights || []}
          keyExtractor={(item) => item.id}
          renderItem={renderInsightItem}
          contentContainerStyle={{ paddingVertical: spacing.md }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary }]}>
                아직 인사이트가 없어요.{'\n'}곧 새로운 정보가 업데이트됩니다! 📚
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  topicFilter: {},
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topicChipText: {
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontWeight: '600',
    marginBottom: 8,
  },
  errorDetail: {
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightCategory: {
    fontWeight: '600',
  },
  insightDate: {},
  insightTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  insightSummary: {
    lineHeight: 22,
    marginBottom: 12,
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightReadTime: {},
  insightViews: {},
});
