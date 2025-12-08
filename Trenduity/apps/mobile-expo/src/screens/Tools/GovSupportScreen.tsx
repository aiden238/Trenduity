import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../tokens/colors';

// 지원금 목업 데이터
interface SupportProgram {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  summary: string;
  eligibility: string;
  amount: string;
  deadline?: string;
  link: string;
  isPopular?: boolean;
}

const SUPPORT_CATEGORIES = [
  { id: 'all', name: '전체', icon: '📋' },
  { id: 'senior', name: '어르신', icon: '👴' },
  { id: 'health', name: '건강', icon: '🏥' },
  { id: 'housing', name: '주거', icon: '🏠' },
  { id: 'finance', name: '금융', icon: '💰' },
  { id: 'culture', name: '문화', icon: '🎭' },
];

const MOCK_PROGRAMS: SupportProgram[] = [
  {
    id: '1',
    title: '기초연금',
    category: 'senior',
    categoryIcon: '👴',
    summary: '만 65세 이상 어르신에게 매월 지급되는 연금',
    eligibility: '만 65세 이상, 소득인정액 기준 하위 70%',
    amount: '최대 월 32만원',
    link: 'https://www.bokjiro.go.kr',
    isPopular: true,
  },
  {
    id: '2',
    title: '노인돌봄서비스',
    category: 'senior',
    categoryIcon: '👴',
    summary: '혼자 사시는 어르신을 위한 돌봄 서비스',
    eligibility: '만 65세 이상 독거노인, 조손가정',
    amount: '안전확인, 생활교육 등 무료',
    link: 'https://www.bokjiro.go.kr',
    isPopular: true,
  },
  {
    id: '3',
    title: '노인 일자리',
    category: 'senior',
    categoryIcon: '👴',
    summary: '어르신에게 일자리를 제공하는 사업',
    eligibility: '만 65세 이상',
    amount: '월 27~50만원',
    deadline: '매년 1~2월 모집',
    link: 'https://www.bokjiro.go.kr',
  },
  {
    id: '4',
    title: '건강보험 본인부담 경감',
    category: 'health',
    categoryIcon: '🏥',
    summary: '저소득층 의료비 부담 완화 제도',
    eligibility: '차상위 본인부담 경감 대상자',
    amount: '외래비 1,000원, 입원비 10%',
    link: 'https://www.nhis.or.kr',
  },
  {
    id: '5',
    title: '치매검진 무료지원',
    category: 'health',
    categoryIcon: '🏥',
    summary: '만 60세 이상 치매 조기검진 지원',
    eligibility: '만 60세 이상',
    amount: '검진비 전액 무료',
    link: 'https://www.nid.or.kr',
  },
  {
    id: '6',
    title: '주거급여',
    category: 'housing',
    categoryIcon: '🏠',
    summary: '저소득 가구의 주거비 지원',
    eligibility: '소득인정액 기준 중위소득 47% 이하',
    amount: '지역별 월 16~51만원',
    link: 'https://www.bokjiro.go.kr',
    isPopular: true,
  },
  {
    id: '7',
    title: '긴급복지지원',
    category: 'finance',
    categoryIcon: '💰',
    summary: '갑작스러운 위기상황 시 긴급 지원',
    eligibility: '위기 상황 발생 가구',
    amount: '생계비 최대 163만원',
    link: 'https://www.129.go.kr',
  },
  {
    id: '8',
    title: '문화누리카드',
    category: 'culture',
    categoryIcon: '🎭',
    summary: '문화생활 비용 지원',
    eligibility: '기초생활수급자, 차상위계층',
    amount: '1인당 연 13만원',
    deadline: '2025년 12월까지',
    link: 'https://www.mnuri.kr',
  },
];

export const GovSupportScreen = () => {
  const navigation = useNavigation<any>();
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState('all');

  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  // 필터링된 프로그램
  const filteredPrograms = selectedCategory === 'all'
    ? MOCK_PROGRAMS
    : MOCK_PROGRAMS.filter(p => p.category === selectedCategory);

  // 인기 프로그램
  const popularPrograms = MOCK_PROGRAMS.filter(p => p.isPopular);

  // 링크 열기
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      alert('링크를 열 수 없어요.');
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: '#6366F1', padding: spacing.lg, paddingTop: spacing.lg + 40 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="뒤로 가기"
        >
          <Text style={{ fontSize: 24, color: '#FFFFFF' }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
          🏛️ 정부·지자체 지원금
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)' }]}>
          받을 수 있는 지원금을 찾아보세요
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 카테고리 필터 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={{ padding: spacing.md }}
        >
          {SUPPORT_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === cat.id ? COLORS.primary.main : cardBg,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 20,
                  marginRight: spacing.sm,
                },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
              accessibilityLabel={`${cat.name} 카테고리`}
            >
              <Text style={{ fontSize: fontSizes.body }}>
                {cat.icon} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 인기 지원금 */}
        {selectedCategory === 'all' && (
          <View style={[styles.popularSection, { paddingHorizontal: spacing.md }]}>
            <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
              ⭐ 인기 지원금
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {popularPrograms.map(program => (
                <TouchableOpacity
                  key={program.id}
                  style={[
                    styles.popularCard,
                    {
                      backgroundColor: '#EEF2FF',
                      padding: spacing.md,
                      borderRadius: 16,
                      marginRight: spacing.md,
                      width: 200,
                    },
                  ]}
                  onPress={() => openLink(program.link)}
                  accessibilityLabel={program.title}
                >
                  <Text style={{ fontSize: 28, marginBottom: spacing.xs }}>{program.categoryIcon}</Text>
                  <Text style={[styles.popularTitle, { fontSize: fontSizes.body, color: '#4338CA', fontWeight: '700' }]}>
                    {program.title}
                  </Text>
                  <Text style={[styles.popularAmount, { fontSize: fontSizes.small, color: '#6366F1', marginTop: 4 }]}>
                    {program.amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 지원금 목록 */}
        <View style={[styles.listSection, { padding: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            📋 {selectedCategory === 'all' ? '전체' : SUPPORT_CATEGORIES.find(c => c.id === selectedCategory)?.name} 지원금
          </Text>
          
          {filteredPrograms.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: cardBg, padding: spacing.xl, borderRadius: 16 }]}>
              <Text style={{ fontSize: 40, marginBottom: spacing.sm }}>📭</Text>
              <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary }]}>
                해당 카테고리의 지원금이 없어요.
              </Text>
            </View>
          ) : (
            filteredPrograms.map(program => (
              <TouchableOpacity
                key={program.id}
                style={[
                  styles.programCard,
                  { backgroundColor: cardBg, padding: spacing.lg, borderRadius: 16, marginBottom: spacing.md },
                ]}
                onPress={() => openLink(program.link)}
                accessibilityLabel={`${program.title} 상세 보기`}
              >
                <View style={styles.programHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: '#EEF2FF', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8 }]}>
                    <Text style={{ fontSize: fontSizes.small, color: '#4338CA' }}>
                      {program.categoryIcon} {SUPPORT_CATEGORIES.find(c => c.id === program.category)?.name}
                    </Text>
                  </View>
                  {program.isPopular && (
                    <View style={[styles.popularBadge, { backgroundColor: '#FEF3C7', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8, marginLeft: spacing.xs }]}>
                      <Text style={{ fontSize: fontSizes.small, color: '#B45309' }}>⭐ 인기</Text>
                    </View>
                  )}
                </View>
                
                <Text style={[styles.programTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginTop: spacing.sm }]}>
                  {program.title}
                </Text>
                
                <Text style={[styles.programSummary, { fontSize: fontSizes.body, color: textSecondary, marginTop: spacing.xs }]}>
                  {program.summary}
                </Text>
                
                <View style={[styles.programDetails, { marginTop: spacing.md }]}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { fontSize: fontSizes.small, color: textSecondary }]}>
                      👤 대상:
                    </Text>
                    <Text style={[styles.detailValue, { fontSize: fontSizes.small, color: textPrimary, flex: 1, marginLeft: 8 }]}>
                      {program.eligibility}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { fontSize: fontSizes.small, color: textSecondary }]}>
                      💵 지원금:
                    </Text>
                    <Text style={[styles.detailValue, { fontSize: fontSizes.small, color: '#059669', fontWeight: '600', marginLeft: 8 }]}>
                      {program.amount}
                    </Text>
                  </View>
                  {program.deadline && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { fontSize: fontSizes.small, color: textSecondary }]}>
                        📅 마감:
                      </Text>
                      <Text style={[styles.detailValue, { fontSize: fontSizes.small, color: '#DC2626', marginLeft: 8 }]}>
                        {program.deadline}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={[styles.programFooter, { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: '#E5E7EB' }]}>
                  <Text style={{ fontSize: fontSizes.small, color: COLORS.primary.main, fontWeight: '600' }}>
                    자세히 보기 →
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* 안내 */}
        <View style={[styles.infoCard, { backgroundColor: '#FEF3C7', padding: spacing.lg, marginHorizontal: spacing.md, borderRadius: 16 }]}>
          <Text style={{ fontSize: fontSizes.body, color: '#92400E', fontWeight: '600', marginBottom: spacing.sm }}>
            💡 알려드려요
          </Text>
          <Text style={{ fontSize: fontSizes.small, color: '#B45309', lineHeight: 20 }}>
            • 이 페이지는 참고용입니다. 정확한 내용은 복지로(www.bokjiro.go.kr)를 확인하세요.{'\n'}
            • 지원금 신청은 주민센터를 방문하거나 온라인으로 가능해요.{'\n'}
            • 궁금한 점은 ☎ 129 (정부민원안내)로 전화하세요.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginBottom: 8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  categoryScroll: {},
  categoryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  popularSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  popularCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularTitle: {},
  popularAmount: {},
  listSection: {},
  emptyContainer: {
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  programCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {},
  popularBadge: {},
  programTitle: {
    fontWeight: '700',
  },
  programSummary: {},
  programDetails: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  detailLabel: {},
  detailValue: {},
  programFooter: {
    alignItems: 'flex-end',
  },
  infoCard: {},
});
