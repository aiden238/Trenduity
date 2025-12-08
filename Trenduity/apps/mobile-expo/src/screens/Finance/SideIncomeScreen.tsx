import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../tokens/colors';

interface IncomeCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  items: IncomeItem[];
}

interface IncomeItem {
  id: string;
  title: string;
  description: string;
  difficulty: '쉬움' | '보통' | '어려움';
  income: string;
  timeRequired: string;
}

// 재테크/부업 카테고리 데이터
const INCOME_CATEGORIES: IncomeCategory[] = [
  {
    id: 'online',
    title: '온라인 부업',
    icon: '💻',
    description: '집에서 할 수 있는 온라인 활동',
    color: '#3B82F6',
    items: [
      {
        id: 'survey',
        title: '설문조사 참여',
        description: '간단한 설문에 답하고 포인트를 모아요',
        difficulty: '쉬움',
        income: '월 2~5만원',
        timeRequired: '하루 30분',
      },
      {
        id: 'review',
        title: '제품 리뷰 작성',
        description: '구매한 제품의 후기를 작성해요',
        difficulty: '쉬움',
        income: '건당 1천~5천원',
        timeRequired: '30분~1시간',
      },
      {
        id: 'data_entry',
        title: '단순 데이터 입력',
        description: '엑셀, 문서 작업을 해요',
        difficulty: '보통',
        income: '건당 1~3만원',
        timeRequired: '2~3시간',
      },
    ],
  },
  {
    id: 'craft',
    title: '수공예/제작',
    icon: '🎨',
    description: '손재주를 활용한 부업',
    color: '#EC4899',
    items: [
      {
        id: 'knitting',
        title: '뜨개질/바느질',
        description: '손뜨개 제품을 만들어 판매해요',
        difficulty: '보통',
        income: '제품당 1~5만원',
        timeRequired: '제품별 다름',
      },
      {
        id: 'cooking',
        title: '반찬/떡 판매',
        description: '집밥 솜씨를 살려 판매해요',
        difficulty: '보통',
        income: '월 30~100만원',
        timeRequired: '주 3~4일',
      },
      {
        id: 'gardening',
        title: '화분/식물 분양',
        description: '키운 식물을 분양해요',
        difficulty: '쉬움',
        income: '화분당 5천~3만원',
        timeRequired: '평소 관리',
      },
    ],
  },
  {
    id: 'local',
    title: '동네 부업',
    icon: '🏘️',
    description: '근처에서 할 수 있는 활동',
    color: '#10B981',
    items: [
      {
        id: 'delivery',
        title: '전단지 배달',
        description: '동네 전단지를 배달해요',
        difficulty: '쉬움',
        income: '건당 3~5만원',
        timeRequired: '3~4시간',
      },
      {
        id: 'cleaning',
        title: '가사도우미',
        description: '청소, 정리정돈을 도와드려요',
        difficulty: '보통',
        income: '시간당 1.5~2만원',
        timeRequired: '2~4시간',
      },
      {
        id: 'pet_sitting',
        title: '반려동물 돌봄',
        description: '이웃의 반려동물을 돌봐요',
        difficulty: '보통',
        income: '일당 3~5만원',
        timeRequired: '하루',
      },
    ],
  },
  {
    id: 'gov_support',
    title: '정부 지원금',
    icon: '🏛️',
    description: '받을 수 있는 정부 혜택',
    color: '#8B5CF6',
    items: [
      {
        id: 'senior_job',
        title: '노인 일자리 사업',
        description: '정부 지원 시니어 일자리',
        difficulty: '쉬움',
        income: '월 27~50만원',
        timeRequired: '주 3~5일',
      },
      {
        id: 'basic_pension',
        title: '기초연금',
        description: '65세 이상 소득하위 70%',
        difficulty: '쉬움',
        income: '월 최대 32만원',
        timeRequired: '신청만',
      },
      {
        id: 'energy_voucher',
        title: '에너지 바우처',
        description: '난방비/전기료 지원',
        difficulty: '쉬움',
        income: '연간 최대 19만원',
        timeRequired: '신청만',
      },
    ],
  },
];

/**
 * 재테크 화면 (SideIncomeScreen)
 * 
 * 시니어를 위한 부업, 재테크, 정부 지원금 정보
 */
export const SideIncomeScreen = () => {
  const navigation = useNavigation<any>();
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  const onRefresh = async () => {
    setRefreshing(true);
    // 데이터 새로고침 (API 연동 시)
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '쉬움': return '#10B981';
      case '보통': return '#F59E0B';
      case '어려움': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderCategoryCard = (category: IncomeCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        {
          backgroundColor: selectedCategory === category.id ? category.color + '20' : cardBg,
          borderColor: selectedCategory === category.id ? category.color : 'transparent',
          borderWidth: 2,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
      onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
      accessibilityLabel={`${category.title} 카테고리`}
      accessibilityHint="눌러서 상세 정보를 확인하세요"
    >
      <View style={styles.categoryHeader}>
        <Text style={[styles.categoryIcon, { fontSize: 32 }]}>{category.icon}</Text>
        <View style={styles.categoryTitleArea}>
          <Text style={[styles.categoryTitle, { fontSize: fontSizes.heading2, color: textPrimary }]}>
            {category.title}
          </Text>
          <Text style={[styles.categoryDesc, { fontSize: fontSizes.body, color: textSecondary }]}>
            {category.description}
          </Text>
        </View>
        <Text style={[styles.expandIcon, { color: textSecondary }]}>
          {selectedCategory === category.id ? '▲' : '▼'}
        </Text>
      </View>

      {/* 확장된 아이템 목록 */}
      {selectedCategory === category.id && (
        <View style={[styles.itemsContainer, { marginTop: spacing.md }]}>
          {category.items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: activeTheme === 'dark' ? colors.dark.background.tertiary : '#F5F5F5',
                  padding: spacing.sm,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <Text style={[styles.itemTitle, { fontSize: fontSizes.body, color: textPrimary }]}>
                {item.title}
              </Text>
              <Text style={[styles.itemDesc, { fontSize: fontSizes.caption, color: textSecondary }]}>
                {item.description}
              </Text>
              <View style={styles.itemMeta}>
                <View style={[styles.badge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
                  <Text style={[styles.badgeText, { color: getDifficultyColor(item.difficulty), fontSize: fontSizes.caption }]}>
                    {item.difficulty}
                  </Text>
                </View>
                <Text style={[styles.itemIncome, { fontSize: fontSizes.caption, color: COLORS.primary.main }]}>
                  💰 {item.income}
                </Text>
                <Text style={[styles.itemTime, { fontSize: fontSizes.caption, color: textSecondary }]}>
                  ⏰ {item.timeRequired}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: '#059669', paddingTop: 48 }]}>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1 }]}>
          💰 재테크 정보
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body }]}>
          시니어를 위한 부업 & 지원금 정보
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 안내 배너 */}
        <View
          style={[
            styles.banner,
            {
              backgroundColor: '#FEF3C7',
              padding: spacing.md,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <Text style={[styles.bannerText, { fontSize: fontSizes.body, color: '#92400E' }]}>
            💡 아래 카테고리를 눌러서 자세한 정보를 확인하세요!
          </Text>
        </View>

        {/* 카테고리 목록 */}
        {INCOME_CATEGORIES.map(renderCategoryCard)}

        {/* AI 상담 버튼 */}
        <TouchableOpacity
          style={[
            styles.aiButton,
            {
              backgroundColor: COLORS.primary.main,
              height: buttonHeight,
              marginTop: spacing.lg,
              marginBottom: spacing.xl,
            },
          ]}
          onPress={() => navigation.navigate('AIChat', { 
            initialPrompt: '시니어가 할 수 있는 부업을 추천해주세요',
            modelId: 'expert'
          })}
          accessibilityLabel="AI에게 재테크 상담받기"
        >
          <Text style={[styles.aiButtonText, { fontSize: fontSizes.body }]}>
            🤖 AI에게 맞춤 상담받기
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  banner: {
    borderRadius: 12,
  },
  bannerText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 12,
  },
  categoryTitleArea: {
    flex: 1,
  },
  categoryTitle: {
    fontWeight: '700',
  },
  categoryDesc: {
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  itemCard: {
    borderRadius: 12,
  },
  itemTitle: {
    fontWeight: '600',
  },
  itemDesc: {
    marginTop: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: '600',
  },
  itemIncome: {
    fontWeight: '600',
  },
  itemTime: {},
  aiButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
