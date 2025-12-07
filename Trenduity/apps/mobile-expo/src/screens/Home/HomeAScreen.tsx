import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/AppHeader';
import { COLORS } from '../../tokens/colors';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTodayCard } from '../../hooks/useTodayCard';
import { useGamification } from '../../hooks/useGamification';

export const HomeAScreen = () => {
  const navigation = useNavigation<any>();
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // 오늘의 카드 데이터
  const { data: todayCard, isLoading: cardLoading, error: cardError, refetch: refetchCard } = useTodayCard();
  
  // 게임화 통계
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGamification();

  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCard(), refetchStats()]);
    setRefreshing(false);
  }, [refetchCard, refetchStats]);

  const handleStartLearning = () => {
    // TODO: 학습 카드 상세 화면으로 이동
    console.log('학습 시작:', todayCard?.id);
  };

  const handleAIChat = () => {
    navigation.navigate('AIChat');
  };

  const handleScamCheck = () => {
    // TODO: 사기 검사 화면으로 이동
    console.log('사기 검사');
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <AppHeader title="AI 배움터" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.md }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 인사말 섹션 */}
        <View style={styles.greetingSection}>
          <Text style={[styles.headerLabel, { fontSize: fontSizes.body, color: textSecondary }]}>
            안녕하세요 👋
          </Text>
          <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: textPrimary }]}>
            {user?.name || '회원'}님, 오늘도 화이팅!
          </Text>
        </View>

        {/* 학습 통계 카드 */}
        <View style={[styles.statsContainer, { backgroundColor: COLORS.primary.main }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { fontSize: fontSizes.caption, color: 'rgba(255,255,255,0.8)' }]}>
              포인트
            </Text>
            <Text style={[styles.statValue, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
              {statsLoading ? '...' : (stats?.points || 0)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { fontSize: fontSizes.caption, color: 'rgba(255,255,255,0.8)' }]}>
              연속 학습
            </Text>
            <Text style={[styles.statValue, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
              {statsLoading ? '...' : (stats?.streak || 0)}일
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { fontSize: fontSizes.caption, color: 'rgba(255,255,255,0.8)' }]}>
              레벨
            </Text>
            <Text style={[styles.statValue, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
              Lv.{statsLoading ? '.' : (stats?.level || 1)}
            </Text>
          </View>
        </View>

        {/* 오늘의 학습 카드 */}
        <View style={[styles.cardContainer, { backgroundColor: cardBg }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardCategory, { fontSize: fontSizes.caption, color: COLORS.primary.main }]}>
              📚 오늘의 학습
            </Text>
            <Text style={[styles.cardDuration, { fontSize: fontSizes.caption, color: textSecondary }]}>
              약 3분
            </Text>
          </View>

          {cardLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary.main} style={{ marginVertical: 40 }} />
          ) : cardError ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary }]}>
                오늘의 카드를 불러올 수 없어요.{'\n'}새로고침 해주세요.
              </Text>
            </View>
          ) : todayCard ? (
            <>
              <Text style={[styles.cardTitle, { fontSize: fontSizes.heading1, color: textPrimary }]}>
                {todayCard.payload?.title || '오늘의 학습'}
              </Text>
              <Text style={[styles.cardDescription, { fontSize: fontSizes.body, color: textSecondary }]} numberOfLines={3}>
                {todayCard.payload?.tldr || 'AI와 디지털 세상에 대해 배워보세요.'}
              </Text>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary }]}>
                오늘의 학습 카드가 준비되지 않았어요.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, { backgroundColor: COLORS.primary.main, height: buttonHeight }]}
            onPress={handleStartLearning}
            accessibilityLabel="학습 시작하기"
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { fontSize: fontSizes.body }]}>
              📝 학습 시작
            </Text>
          </TouchableOpacity>
        </View>

        {/* 빠른 메뉴 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginTop: spacing.lg }]}>
          빠른 메뉴
        </Text>
        <View style={styles.quickMenu}>
          <TouchableOpacity
            style={[styles.quickMenuItem, { backgroundColor: cardBg }]}
            onPress={handleAIChat}
            accessibilityLabel="AI 채팅"
          >
            <Text style={styles.quickMenuIcon}>🤖</Text>
            <Text style={[styles.quickMenuText, { fontSize: fontSizes.body, color: textPrimary }]}>AI 채팅</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickMenuItem, { backgroundColor: cardBg }]}
            onPress={handleScamCheck}
            accessibilityLabel="사기 검사"
          >
            <Text style={styles.quickMenuIcon}>🛡️</Text>
            <Text style={[styles.quickMenuText, { fontSize: fontSizes.body, color: textPrimary }]}>사기 검사</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickMenuItem, { backgroundColor: cardBg }]}
            accessibilityLabel="복약 체크"
          >
            <Text style={styles.quickMenuIcon}>💊</Text>
            <Text style={[styles.quickMenuText, { fontSize: fontSizes.body, color: textPrimary }]}>복약 체크</Text>
          </TouchableOpacity>
        </View>

        {/* 최근 활동 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginTop: spacing.lg }]}>
          최근 활동
        </Text>
        <View style={[styles.recentActivity, { backgroundColor: cardBg }]}>
          {stats?.badges && stats.badges.length > 0 ? (
            stats.badges.slice(0, 3).map((badge, index) => (
              <View key={index} style={styles.activityItem}>
                <Text style={styles.activityIcon}>🏆</Text>
                <Text style={[styles.activityText, { fontSize: fontSizes.body, color: textPrimary }]}>
                  {badge} 배지 획득!
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary, textAlign: 'center', padding: 20 }]}>
              아직 활동 기록이 없어요.{'\n'}학습을 시작해 보세요! 🎯
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  greetingSection: {
    marginBottom: 20,
  },
  headerLabel: {
    marginBottom: 4,
  },
  headerTitle: {
    fontWeight: '700',
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '700',
  },
  cardContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardCategory: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardDuration: {
    fontWeight: '500',
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  cardDescription: {
    lineHeight: 24,
    marginBottom: 16,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  quickMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickMenuItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickMenuIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickMenuText: {
    fontWeight: '600',
  },
  recentActivity: {
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
  },
});
