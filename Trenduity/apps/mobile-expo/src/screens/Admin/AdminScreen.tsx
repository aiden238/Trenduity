import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdminStats, useAdminAIUsage, useAdminUsers } from '../../hooks/useAdmin';
import { COLORS } from '../../tokens/colors';

type TabType = 'stats' | 'users' | 'ai';

/**
 * 관리자 화면 (AdminScreen)
 * 
 * 관리자 전용 - 통계, 사용자 관리, AI 사용량
 */
export const AdminScreen = () => {
  const navigation = useNavigation<any>();
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [refreshing, setRefreshing] = useState(false);

  // 데이터 조회
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: aiUsage, isLoading: aiLoading, refetch: refetchAI } = useAdminAIUsage(7);
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useAdminUsers(1, 10);

  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F3F4F6';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#111827';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchAI(), refetchUsers()]);
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(num);
  };

  // 통계 카드 컴포넌트
  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <View style={[styles.statCard, { backgroundColor: cardBg, padding: spacing.md }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, { fontSize: fontSizes.heading1, color: textPrimary }]}>
        {typeof value === 'number' ? formatNumber(value) : value}
      </Text>
      <Text style={[styles.statTitle, { fontSize: fontSizes.caption, color: textSecondary }]}>
        {title}
      </Text>
    </View>
  );

  // 탭 버튼
  const TabButton = ({ tab, label, icon }: { tab: TabType; label: string; icon: string }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: activeTab === tab ? COLORS.primary.main : 'transparent',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        },
      ]}
      onPress={() => setActiveTab(tab)}
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.tabButtonText,
          {
            fontSize: fontSizes.body,
            color: activeTab === tab ? '#FFFFFF' : textSecondary,
          },
        ]}
      >
        {icon} {label}
      </Text>
    </TouchableOpacity>
  );

  // 통계 탭
  const renderStatsTab = () => {
    if (statsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
        </View>
      );
    }

    if (!stats) return null;

    return (
      <View>
        {/* 주요 지표 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.sm }]}>
          📊 주요 지표
        </Text>
        <View style={styles.statsGrid}>
          <StatCard title="총 사용자" value={stats.total_users} icon="👥" color="#3B82F6" />
          <StatCard title="오늘 활성" value={stats.active_users_today} icon="🟢" color="#10B981" />
          <StatCard title="주간 활성" value={stats.active_users_week} icon="📈" color="#8B5CF6" />
          <StatCard title="신규 가입 (오늘)" value={stats.new_users_today} icon="🆕" color="#F59E0B" />
        </View>

        {/* AI 요청 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          🤖 AI 요청
        </Text>
        <View style={styles.statsGrid}>
          <StatCard title="오늘 요청" value={stats.total_ai_requests_today} icon="💬" color="#EC4899" />
          <StatCard title="주간 요청" value={stats.total_ai_requests_week} icon="📊" color="#6366F1" />
        </View>

        {/* 구독 현황 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          💳 구독 현황
        </Text>
        <View style={[styles.subscriptionCard, { backgroundColor: cardBg, padding: spacing.md }]}>
          {Object.entries(stats.subscription_stats).map(([plan, count]) => (
            <View key={plan} style={styles.subscriptionRow}>
              <Text style={[styles.subscriptionPlan, { fontSize: fontSizes.body, color: textPrimary }]}>
                {plan === 'FREE' ? '기본' : plan === 'BUDGET' ? '알뜰' : plan === 'SAFE' ? '안심' : '든든'}
              </Text>
              <Text style={[styles.subscriptionCount, { fontSize: fontSizes.body, color: COLORS.primary.main }]}>
                {formatNumber(count)}명
              </Text>
            </View>
          ))}
        </View>

        {/* 매출 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          💰 이번 달 매출
        </Text>
        <View style={[styles.revenueCard, { backgroundColor: '#10B981', padding: spacing.lg }]}>
          <Text style={[styles.revenueValue, { fontSize: fontSizes.heading1 * 1.5 }]}>
            {formatCurrency(stats.revenue_this_month)}
          </Text>
        </View>
      </View>
    );
  };

  // 사용자 탭
  const renderUsersTab = () => {
    if (usersLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
        </View>
      );
    }

    if (!usersData) return null;

    return (
      <View>
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.sm }]}>
          👥 최근 사용자 ({usersData.total}명)
        </Text>
        {usersData.users.map((user) => (
          <View
            key={user.id}
            style={[styles.userCard, { backgroundColor: cardBg, padding: spacing.md, marginBottom: spacing.sm }]}
          >
            <View style={styles.userHeader}>
              <Text style={[styles.userName, { fontSize: fontSizes.body, color: textPrimary }]}>
                {user.name || '이름 없음'}
              </Text>
              <View style={[styles.planBadge, { backgroundColor: getPlanColor(user.subscription_plan) + '20' }]}>
                <Text style={[styles.planBadgeText, { color: getPlanColor(user.subscription_plan), fontSize: fontSizes.caption }]}>
                  {getPlanName(user.subscription_plan)}
                </Text>
              </View>
            </View>
            <Text style={[styles.userEmail, { fontSize: fontSizes.caption, color: textSecondary }]}>
              {user.email}
            </Text>
            <View style={styles.userMeta}>
              <Text style={[styles.userMetaText, { fontSize: fontSizes.caption, color: textSecondary }]}>
                AI 사용: {user.total_ai_usage}회
              </Text>
              <Text style={[styles.userMetaText, { fontSize: fontSizes.caption, color: user.is_active ? '#10B981' : '#EF4444' }]}>
                {user.is_active ? '● 활성' : '○ 비활성'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // AI 사용량 탭
  const renderAITab = () => {
    if (aiLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
        </View>
      );
    }

    if (!aiUsage) return null;

    return (
      <View>
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.sm }]}>
          🤖 AI 모델별 사용량 (최근 {aiUsage.period_days}일)
        </Text>
        {aiUsage.stats.map((stat) => (
          <View
            key={stat.model_id}
            style={[styles.aiCard, { backgroundColor: cardBg, padding: spacing.md, marginBottom: spacing.sm }]}
          >
            <Text style={[styles.aiModelName, { fontSize: fontSizes.body, color: textPrimary }]}>
              {stat.model_name}
            </Text>
            <View style={styles.aiStats}>
              <View style={styles.aiStatItem}>
                <Text style={[styles.aiStatValue, { fontSize: fontSizes.heading2, color: COLORS.primary.main }]}>
                  {formatNumber(stat.total_requests)}
                </Text>
                <Text style={[styles.aiStatLabel, { fontSize: fontSizes.caption, color: textSecondary }]}>
                  총 요청
                </Text>
              </View>
              <View style={styles.aiStatItem}>
                <Text style={[styles.aiStatValue, { fontSize: fontSizes.heading2, color: '#10B981' }]}>
                  {formatNumber(stat.unique_users)}
                </Text>
                <Text style={[styles.aiStatLabel, { fontSize: fontSizes.caption, color: textSecondary }]}>
                  사용자
                </Text>
              </View>
              <View style={styles.aiStatItem}>
                <Text style={[styles.aiStatValue, { fontSize: fontSizes.heading2, color: '#8B5CF6' }]}>
                  {stat.avg_requests_per_user.toFixed(1)}
                </Text>
                <Text style={[styles.aiStatLabel, { fontSize: fontSizes.caption, color: textSecondary }]}>
                  평균/인
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return '#6B7280';
      case 'BUDGET': return '#3B82F6';
      case 'SAFE': return '#8B5CF6';
      case 'STRONG': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'FREE': return '기본';
      case 'BUDGET': return '알뜰';
      case 'SAFE': return '안심';
      case 'STRONG': return '든든';
      default: return plan;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: '#1F2937', paddingTop: 48 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="뒤로 가기"
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1 }]}>
          ⚙️ 관리자
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body }]}>
          서비스 운영 현황
        </Text>
      </View>

      {/* 탭 바 */}
      <View style={[styles.tabBar, { backgroundColor: cardBg, padding: spacing.sm }]}>
        <TabButton tab="stats" label="통계" icon="📊" />
        <TabButton tab="users" label="사용자" icon="👥" />
        <TabButton tab="ai" label="AI 사용량" icon="🤖" />
      </View>

      {/* 콘텐츠 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl * 2 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'ai' && renderAITab()}
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
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  headerTitle: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    borderRadius: 8,
  },
  tabButtonText: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontWeight: '700',
  },
  statTitle: {
    marginTop: 4,
    textAlign: 'center',
  },
  subscriptionCard: {
    borderRadius: 12,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subscriptionPlan: {
    fontWeight: '500',
  },
  subscriptionCount: {
    fontWeight: '700',
  },
  revenueCard: {
    borderRadius: 12,
    alignItems: 'center',
  },
  revenueValue: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  userCard: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontWeight: '600',
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  planBadgeText: {
    fontWeight: '600',
  },
  userEmail: {
    marginTop: 4,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  userMetaText: {},
  aiCard: {
    borderRadius: 12,
  },
  aiModelName: {
    fontWeight: '600',
    marginBottom: 12,
  },
  aiStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  aiStatItem: {
    alignItems: 'center',
  },
  aiStatValue: {
    fontWeight: '700',
  },
  aiStatLabel: {},
});
