import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useA11y } from '../../contexts/A11yContext';
import { useInsightStats } from '../../hooks/useInsights';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';

const screenWidth = Dimensions.get('window').width;

/**
 * 인사이트 통계 화면
 * 
 * 기능:
 * - 주간 활동 차트 (카드 완료 횟수)
 * - 월간 통계 카드 (총 포인트, 스트릭, 레벨)
 * - 배지 컬렉션 그리드
 */
export const InsightStatsScreen = () => {
  const { spacing, fontSizes } = useA11y();
  const { data: stats, isLoading } = useInsightStats();

  if (isLoading || !stats) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <Text style={[styles.loadingText, { fontSize: fontSizes.body, marginTop: spacing.md }]}>
          통계를 불러오는 중...
        </Text>
      </View>
    );
  }

  // 주간 활동 데이터 (최근 7일)
  const weeklyData = {
    labels: ['월', '화', '수', '목', '금', '토', '일'],
    datasets: [
      {
        data: stats.weekly_activity || [3, 5, 2, 8, 6, 4, 7],
        color: (opacity = 1) => COLORS.primary.main,
        strokeWidth: 3,
      },
    ],
  };

  // 차트 설정
  const chartConfig = {
    backgroundColor: COLORS.neutral.background,
    backgroundGradientFrom: COLORS.primary.light,
    backgroundGradientTo: COLORS.primary.main,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: RADIUS.lg,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.primary.main,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(255, 255, 255, 0.2)',
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      {/* 헤더 */}
      <Text
        style={[styles.heading, {
          fontSize: fontSizes.heading1,
          marginBottom: spacing.lg,
        }]}
      >
        📊 나의 통계
      </Text>

      {/* 월간 통계 카드 - 3개 행 */}
      <View style={{ marginBottom: spacing.lg }}>
        <View style={styles.statsRow}>
          {/* 총 포인트 */}
          <View style={[styles.statCard, { 
            flex: 1, 
            marginRight: spacing.sm,
            backgroundColor: COLORS.primary.main,
            padding: spacing.md,
            borderRadius: RADIUS.lg,
          }]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={[styles.statValue, { fontSize: fontSizes.heading1 }]}>
              {(stats.total_points || 0).toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { fontSize: fontSizes.small }]}>총 포인트</Text>
          </View>

          {/* 연속 스트릭 */}
          <View style={[styles.statCard, { 
            flex: 1, 
            marginLeft: spacing.sm,
            backgroundColor: COLORS.accent.orange,
            padding: spacing.md,
            borderRadius: RADIUS.lg,
          }]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statValue, { fontSize: fontSizes.heading1 }]}>
              {stats.current_streak || 0}
            </Text>
            <Text style={[styles.statLabel, { fontSize: fontSizes.small }]}>연속 스트릭</Text>
          </View>
        </View>

        {/* 레벨 */}
        <View style={[styles.statCard, { 
          marginTop: spacing.md,
          backgroundColor: COLORS.secondary.main,
          padding: spacing.md,
          borderRadius: RADIUS.lg,
        }]}>
          <Text style={styles.statIcon}>🎖️</Text>
          <Text style={[styles.statValue, { fontSize: fontSizes.heading1 }]}>
            Lv.{stats.level || 1}
          </Text>
          <Text style={[styles.statLabel, { fontSize: fontSizes.small }]}>현재 레벨</Text>
        </View>
      </View>

      {/* 주간 활동 차트 */}
      <Text style={[styles.sectionTitle, { fontSize: fontSizes.body, marginBottom: spacing.sm }]}>
        📈 이번 주 활동
      </Text>
      <LineChart
        data={weeklyData}
        width={screenWidth - spacing.md * 2}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: spacing.sm,
          borderRadius: RADIUS.lg,
        }}
      />

      {/* 배지 컬렉션 */}
      <Text style={[styles.sectionTitle, { fontSize: fontSizes.body, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
        🏆 획득한 배지
      </Text>
      <View style={styles.badgeGrid}>
        {(stats.badges || []).map((badge: any, index: number) => (
          <View key={index} style={[styles.badgeItem, { padding: spacing.sm, margin: spacing.xs }]}>
            <Text style={styles.badgeEmoji}>{badge.icon || '🏅'}</Text>
            <Text style={[styles.badgeName, { fontSize: fontSizes.small }]}>{badge.name}</Text>
          </View>
        ))}
        {(!stats.badges || stats.badges.length === 0) && (
          <Text style={[styles.emptyText, { fontSize: fontSizes.body }]}>
            아직 획득한 배지가 없어요. 학습을 시작해보세요! 🎯
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.background,
  },
  loadingText: {
    color: COLORS.neutral.text.secondary,
  },
  heading: {
    color: COLORS.neutral.text.primary,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statCard: {
    alignItems: 'center',
    ...SHADOWS.md,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  sectionTitle: {
    color: COLORS.neutral.text.primary,
    fontWeight: '600',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeItem: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeName: {
    color: COLORS.neutral.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.neutral.text.secondary,
    textAlign: 'center',
    flex: 1,
    paddingVertical: 20,
  },
});
