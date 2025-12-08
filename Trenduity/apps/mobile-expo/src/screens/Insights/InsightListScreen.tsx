import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
 * 목업 인사이트 데이터 (노션/블로그 스타일)
 */
const MOCK_INSIGHTS = [
  {
    id: 'insight-1',
    title: 'ChatGPT 완전 정복 가이드',
    summary: 'ChatGPT를 처음 사용하시는 분들을 위한 완벽 가이드입니다. 회원가입부터 실제 활용까지 단계별로 알려드려요.',
    topic: 'ai_tools',
    published_at: '2024-12-05',
    read_time_min: 5,
    view_count: 1247,
    content: `# ChatGPT 완전 정복 가이드 🤖

## 1. ChatGPT란?
ChatGPT는 OpenAI가 만든 대화형 AI입니다. 마치 똑똑한 비서처럼 질문에 답하고, 글을 써주고, 아이디어를 제안해줘요.

## 2. 시작하기
1. **chat.openai.com** 에 접속하세요
2. 구글 계정으로 쉽게 가입할 수 있어요
3. 대화창에 궁금한 것을 입력하세요!

## 3. 활용 팁
- **명확하게 물어보세요**: "요리법 알려줘" 보다 "된장찌개 끓이는 법 단계별로 알려줘"가 좋아요
- **대화하듯 질문하세요**: 추가 질문도 자유롭게!
- **다시 물어보세요**: 답변이 마음에 안 들면 "다시 설명해줘" 하면 돼요

> 💡 팁: 한국어로 물어보면 한국어로 답해줘요!`,
  },
  {
    id: 'insight-2',
    title: '스미싱 문자 100% 구별하는 방법',
    summary: '최근 급증하는 스미싱 사기! 가짜 문자를 구별하는 5가지 핵심 포인트를 알려드립니다.',
    topic: 'digital_safety',
    published_at: '2024-12-04',
    read_time_min: 3,
    view_count: 2891,
    content: `# 스미싱 문자 100% 구별하는 방법 🛡️

## 스미싱이란?
문자(SMS)를 통해 개인정보를 빼가는 사기 수법이에요.

## 이런 문자는 100% 사기!
1. **"정부 지원금 신청하세요"** + 이상한 링크
2. **"택배 배송 실패"** + 주소 확인 링크
3. **"계좌가 정지되었습니다"** + 확인 요청
4. **"경찰/검찰입니다"** + 앱 설치 요청
5. **모르는 번호**로 온 급한 송금 요청

## 안전하게 대처하는 방법
- ❌ 링크 절대 누르지 마세요
- ❌ 앱 설치하지 마세요
- ✅ 가족이나 경찰(112)에 먼저 확인하세요
- ✅ 의심되면 그냥 삭제하세요

> ⚠️ 기억하세요: 정부, 은행, 택배회사는 문자로 개인정보를 요구하지 않아요!`,
  },
  {
    id: 'insight-3',
    title: '하루 30분 걷기의 놀라운 효과',
    summary: '매일 30분 걷기만 해도 건강이 확 좋아집니다. 과학적으로 증명된 걷기의 효과를 알아보세요.',
    topic: 'health',
    published_at: '2024-12-03',
    read_time_min: 4,
    view_count: 1823,
    content: `# 하루 30분 걷기의 놀라운 효과 🚶

## 걷기가 좋은 이유
걷기는 가장 안전하고 효과적인 운동이에요. 나이에 상관없이 누구나 할 수 있죠!

## 과학적으로 증명된 효과
1. **심장 건강** - 심장병 위험 30% 감소
2. **당뇨 예방** - 혈당 조절에 효과적
3. **뇌 건강** - 치매 예방에 도움
4. **기분 개선** - 우울감 감소, 활력 증가
5. **뼈 건강** - 골다공증 예방

## 올바른 걷기 방법
- 👟 편한 운동화를 신으세요
- 🧘 바른 자세로 걸으세요 (허리 펴고!)
- ⏰ 아침이나 저녁 선선한 시간이 좋아요
- 💧 물을 꼭 챙기세요

> 💪 오늘부터 30분 걷기 시작해보세요!`,
  },
  {
    id: 'insight-4',
    title: '은행 앱으로 이체하는 방법',
    summary: '은행 앱을 처음 사용하시나요? 계좌이체하는 방법을 쉽게 알려드려요.',
    topic: 'finance',
    published_at: '2024-12-02',
    read_time_min: 4,
    view_count: 956,
    content: `# 은행 앱으로 이체하는 방법 💰

## 준비물
- 스마트폰
- 은행 앱 (국민은행, 신한은행 등)
- 공동인증서 또는 간편비밀번호

## 이체하는 순서
1. 은행 앱을 열어요
2. '이체' 버튼을 눌러요
3. 보낼 계좌번호를 입력해요
4. 금액을 입력해요
5. 비밀번호를 입력해요
6. '이체' 버튼을 눌러요

## 주의사항
- ⚠️ 계좌번호를 꼭 다시 확인하세요
- ⚠️ 모르는 사람에게 이체하지 마세요
- ⚠️ 비밀번호를 다른 사람에게 알려주지 마세요

> 💡 처음에는 가족에게 도움을 받아보세요!`,
  },
  {
    id: 'insight-5',
    title: '카카오톡 영상통화 완전 정복',
    summary: '가족과 무료로 얼굴 보며 통화하세요! 카카오톡 영상통화 방법을 알려드려요.',
    topic: 'ai_tools',
    published_at: '2024-12-01',
    read_time_min: 3,
    view_count: 3102,
    content: `# 카카오톡 영상통화 완전 정복 📱

## 영상통화란?
전화하면서 상대방 얼굴을 볼 수 있어요. 멀리 사는 가족 얼굴도 볼 수 있죠!

## 영상통화 하는 방법
1. 카카오톡을 열어요
2. 통화할 사람의 대화방에 들어가요
3. 오른쪽 위 **전화 버튼**을 눌러요
4. **'영상통화'**를 선택해요
5. 상대방이 받으면 연결돼요!

## 영상통화 중 할 수 있는 것
- 📷 카메라 끄기/켜기
- 🔇 마이크 끄기/켜기
- 🔄 전면/후면 카메라 전환

> 🎉 손주 얼굴도 보면서 통화해보세요!`,
  },
];

// 조회수 저장 키
const VIEW_COUNT_KEY = '@insight_view_counts';

/**
 * 인사이트 목록 화면
 */
export const InsightListScreen = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
  const [refreshing, setRefreshing] = useState(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [localInsights, setLocalInsights] = useState(MOCK_INSIGHTS);
  
  const { data: apiInsights, isLoading, error, refetch } = useInsightList(selectedTopic, range);
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();
  const navigation = useNavigation<any>();
  
  // 다크 모드 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  // 조회수 로드
  useEffect(() => {
    loadViewCounts();
  }, []);

  // API 데이터와 목업 데이터 병합
  useEffect(() => {
    const mergedInsights = MOCK_INSIGHTS.map(insight => ({
      ...insight,
      view_count: (insight.view_count || 0) + (viewCounts[insight.id] || 0),
    }));
    setLocalInsights(mergedInsights);
  }, [viewCounts]);

  const loadViewCounts = async () => {
    try {
      const stored = await AsyncStorage.getItem(VIEW_COUNT_KEY);
      if (stored) {
        setViewCounts(JSON.parse(stored));
      }
    } catch (e) {
      console.log('조회수 로드 실패:', e);
    }
  };

  const incrementViewCount = async (insightId: string) => {
    try {
      const newCounts = { ...viewCounts, [insightId]: (viewCounts[insightId] || 0) + 1 };
      setViewCounts(newCounts);
      await AsyncStorage.setItem(VIEW_COUNT_KEY, JSON.stringify(newCounts));
    } catch (e) {
      console.log('조회수 저장 실패:', e);
    }
  };

  const handleInsightPress = async (insightId: string) => {
    // 조회수 증가
    await incrementViewCount(insightId);
    
    // 목업 인사이트 찾기
    const insight = MOCK_INSIGHTS.find(i => i.id === insightId);
    
    // InsightDetail로 이동 (목업 데이터 전달)
    navigation.navigate('InsightDetail', { 
      insightId,
      mockData: insight, // 목업 데이터 전달
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadViewCounts();
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
          data={selectedTopic 
            ? localInsights.filter(i => i.topic === selectedTopic) 
            : localInsights}
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
                이 주제의 인사이트가 아직 없어요.{'\n'}다른 주제를 선택해보세요! 📚
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
