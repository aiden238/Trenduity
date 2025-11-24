import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Typography, StatCard, GradientCard, COLORS, SPACING, SHADOWS, RADIUS } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';
import { useInsightStats } from '../../hooks/useInsights';

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
        <Typography variant="body" style={{ color: COLORS.neutral.text.secondary }}>
          통계를 불러오는 중...
        </Typography>
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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing }}>
      {/* 헤더 */}
      <Typography
        variant="heading1"
        style={{
          fontSize: fontSizes.heading1,
          marginBottom: spacing * 2,
          color: COLORS.neutral.text.primary,
          fontWeight: '700',
        }}
      >
        📊 나의 통계
      </Typography>

      {/* 월간 통계 카드 - 3개 행 */}
      <View style={{ marginBottom: spacing * 2 }}>
        <View style={styles.statsRow}>
          <View style={{ flex: 1, marginRight: spacing }}>
            <StatCard
              icon="⭐"
              value={stats.total_points || 0}
              label="총 포인트"
              unit="pt"
              colors={COLORS.gradients.primary}
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing }}>
            <StatCard
              icon="🔥"
              value={stats.current_streak || 0}
              label="연속 스트릭"
              unit="일"
              colors={[COLORS.accent.orange, COLORS.accent.pink]}
            />
          </View>
        </View>

        <View style={[styles.statsRow, { marginTop: spacing * 1.5 }]}>
          <View style={{ flex: 1, marginRight: spacing }}>
            <StatCard
              icon="🏆"
              value={stats.level || 1}
              label="현재 레벨"
              colors={[COLORS.accent.purple, COLORS.accent.pink]}
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing }}>
            <StatCard
              icon="🎯"
              value={stats.completed_cards || 0}
              label="완료한 카드"
              unit="개"
              colors={COLORS.gradients.cool}
            />
          </View>
        </View>
      </View>

      {/* 주간 활동 차트 */}
      <GradientCard
        colors={['#FFFFFF', COLORS.neutral.background]}
        size="large"
        shadow="lg"
        radius="lg"
      >
        <Typography
          variant="heading2"
          style={{
            fontSize: fontSizes.heading2,
            marginBottom: spacing,
            color: COLORS.neutral.text.primary,
            fontWeight: '600',
          }}
        >
          📈 주간 활동
        </Typography>

        <LineChart
          data={weeklyData}
          width={screenWidth - spacing * 4}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{
            borderRadius: RADIUS.md,
          }}
          withInnerLines
          withOuterLines
          withVerticalLabels
          withHorizontalLabels
          withDots
          withShadow={false}
          fromZero
        />

        <Typography
          variant="caption"
          style={{
            fontSize: fontSizes.caption,
            marginTop: spacing,
            color: COLORS.neutral.text.secondary,
            textAlign: 'center',
          }}
        >
          최근 7일간 완료한 카드 수
        </Typography>
      </GradientCard>

      {/* 배지 컬렉션 */}
      <View style={{ marginTop: spacing * 2 }}>
        <Typography
          variant="heading2"
          style={{
            fontSize: fontSizes.heading2,
            marginBottom: spacing,
            color: COLORS.neutral.text.primary,
            fontWeight: '600',
          }}
        >
          🏅 획득한 배지
        </Typography>

        <View style={styles.badgeGrid}>
          {stats.badges?.map((badge: string, index: number) => (
            <GradientCard
              key={index}
              colors={[COLORS.accent.yellow, COLORS.accent.orange]}
              size="small"
              shadow="md"
              radius="lg"
            >
              <View style={styles.badgeCard}>
                <Typography
                  variant="heading2"
                  style={{
                    fontSize: fontSizes.heading1 * 1.5,
                    textAlign: 'center',
                  }}
                >
                  🏆
                </Typography>
                <Typography
                  variant="caption"
                  style={{
                    fontSize: fontSizes.caption,
                    color: '#FFFFFF',
                    fontWeight: '600',
                    textAlign: 'center',
                    marginTop: spacing / 2,
                  }}
                >
                  {badge}
                </Typography>
              </View>
            </GradientCard>
          ))}

          {/* 빈 배지 슬롯 (잠김 상태) */}
          {[...Array(6 - (stats.badges?.length || 0))].map((_, index) => (
            <View
              key={`empty-${index}`}
              style={[
                styles.emptyBadge,
                {
                  borderRadius: RADIUS.lg,
                  padding: spacing,
                },
              ]}
            >
              <Typography
                variant="heading2"
                style={{
                  fontSize: fontSizes.heading1 * 1.5,
                  textAlign: 'center',
                  opacity: 0.3,
                }}
              >
                🔒
              </Typography>
              <Typography
                variant="caption"
                style={{
                  fontSize: fontSizes.caption,
                  color: COLORS.neutral.text.tertiary,
                  textAlign: 'center',
                  marginTop: spacing / 2,
                }}
              >
                잠김
              </Typography>
            </View>
          ))}
        </View>
      </View>

      {/* 하단 여백 */}
      <View style={{ height: spacing * 3 }} />
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
  },
  statsRow: {
    flexDirection: 'row',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  badgeCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  emptyBadge: {
    width: (screenWidth - SPACING.md * 5) / 3,
    backgroundColor: COLORS.neutral.surface,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
});
