import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../tokens/colors';
import {
  useMySubscription,
  usePlans,
  useUpgradePlan,
  usePurchaseAddon,
} from '../../hooks/useSubscription';

// 모델 이름 매핑
const MODEL_NAMES: Record<string, string> = {
  quick: '⚡ 빠른 비서',
  allround: '🌟 만능 비서',
  writer: '✍️ 글쓰기 비서',
  expert: '🎓 척척박사 비서',
  genius: '🧠 천재 비서',
};

// 플랜 아이콘
const PLAN_ICONS: Record<string, string> = {
  free: '🆓',
  economy: '💡',
  standard: '🛡️',
  premium: '👑',
};

export const SubscriptionScreen = () => {
  const navigation = useNavigation<any>();
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: subscription, isLoading, refetch } = useMySubscription();
  const { data: plansData } = usePlans();
  const upgradeMutation = useUpgradePlan();
  const addonMutation = usePurchaseAddon();
  
  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleUpgrade = (planType: string, planName: string, price: number) => {
    Alert.alert(
      `${planName} 구독`,
      `월 ${price.toLocaleString()}원이 결제됩니다.\n\n결제를 진행하시겠어요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '결제하기',
          onPress: async () => {
            try {
              const result = await upgradeMutation.mutateAsync(planType);
              Alert.alert('구독 완료! 🎉', result.message);
            } catch (error: any) {
              Alert.alert('오류', error.message);
            }
          },
        },
      ]
    );
  };

  const handlePurchaseAddon = () => {
    Alert.alert(
      '추가 도우미 구매',
      '14,900원이 결제됩니다.\n기존 플랜에 추가 사용량이 더해져요.\n\n결제를 진행하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '결제하기',
          onPress: async () => {
            try {
              const result = await addonMutation.mutateAsync();
              Alert.alert('구매 완료! 🎉', result.message);
            } catch (error: any) {
              Alert.alert('오류', error.message);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <Text style={[styles.loadingText, { fontSize: fontSizes.body, color: textSecondary }]}>
          구독 정보를 불러오는 중...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: COLORS.primary.main, padding: spacing.lg }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="뒤로 가기"
        >
          <Text style={{ fontSize: fontSizes.heading1, color: '#FFFFFF' }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
          🤖 도우미 관리
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)' }]}>
          플랜 업그레이드 및 구독 관리
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 현재 플랜 카드 */}
        {subscription && (
          <View style={[styles.currentPlanCard, { backgroundColor: cardBg, padding: spacing.lg, marginBottom: spacing.lg }]}>
            <View style={styles.planHeader}>
              <Text style={{ fontSize: 48 }}>
                {PLAN_ICONS[subscription.plan_type] || '📦'}
              </Text>
              <View style={styles.planInfo}>
                <Text style={[styles.planName, { fontSize: fontSizes.heading1, color: textPrimary }]}>
                  {subscription.plan_name}
                </Text>
                <Text style={[styles.planPrice, { fontSize: fontSizes.body, color: COLORS.primary.main }]}>
                  {subscription.plan_price === 0 ? '무료' : `월 ${subscription.plan_price.toLocaleString()}원`}
                </Text>
              </View>
            </View>
            
            {subscription.expires_at && (
              <Text style={[styles.expiresText, { fontSize: fontSizes.caption, color: textSecondary, marginTop: spacing.sm }]}>
                📅 {new Date(subscription.expires_at).toLocaleDateString('ko-KR')}까지
              </Text>
            )}
            
            {/* 특수 기능 뱃지 */}
            <View style={[styles.badgeContainer, { marginTop: spacing.md }]}>
              {subscription.can_use_fintech && (
                <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.badgeText}>💰 재테크 활성화</Text>
                </View>
              )}
              {subscription.can_use_coaching && (
                <View style={[styles.badge, { backgroundColor: '#8B5CF6' }]}>
                  <Text style={styles.badgeText}>👨‍💼 코칭 우선권</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 오늘의 사용량 */}
        {subscription && (
          <View style={[styles.usageCard, { backgroundColor: cardBg, padding: spacing.lg, marginBottom: spacing.lg }]}>
            <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
              📊 오늘의 사용량
            </Text>
            
            {Object.entries(subscription.usage).map(([modelId, usage]) => (
              <View key={modelId} style={[styles.usageItem, { marginBottom: spacing.sm }]}>
                <View style={styles.usageHeader}>
                  <Text style={[styles.usageModelName, { fontSize: fontSizes.body, color: textPrimary }]}>
                    {MODEL_NAMES[modelId] || modelId}
                  </Text>
                  <Text style={[styles.usageCount, { fontSize: fontSizes.body, color: usage.remaining === 0 ? '#EF4444' : '#10B981' }]}>
                    {usage.used_count}/{usage.limit}
                  </Text>
                </View>
                <View style={styles.usageBarContainer}>
                  <View 
                    style={[
                      styles.usageBar, 
                      { 
                        width: `${usage.limit > 0 ? Math.min(100, (usage.used_count / usage.limit) * 100) : 0}%`,
                        backgroundColor: usage.remaining === 0 ? '#EF4444' : COLORS.primary.main,
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 추가 도우미 버튼 */}
        <TouchableOpacity
          style={[styles.addonButton, { backgroundColor: '#F59E0B', padding: spacing.md, marginBottom: spacing.lg }]}
          onPress={handlePurchaseAddon}
          disabled={addonMutation.isPending}
        >
          {addonMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={[styles.addonButtonText, { fontSize: fontSizes.body }]}>
                ➕ 추가 도우미 구매 (14,900원)
              </Text>
              <Text style={[styles.addonButtonSubtext, { fontSize: fontSizes.caption }]}>
                일반+15, 만능+10, 글쓰기+5, 척척박사+1
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* 플랜 목록 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
          💎 구독 플랜
        </Text>
        
        {plansData?.plans.map((plan) => {
          const isCurrentPlan = subscription?.plan_type === plan.plan_type;
          return (
            <View
              key={plan.plan_type}
              style={[
                styles.planCard,
                { 
                  backgroundColor: cardBg, 
                  padding: spacing.lg, 
                  marginBottom: spacing.md,
                  borderWidth: isCurrentPlan ? 2 : 0,
                  borderColor: COLORS.primary.main,
                }
              ]}
            >
              <View style={styles.planCardHeader}>
                <Text style={{ fontSize: 32 }}>{PLAN_ICONS[plan.plan_type] || '📦'}</Text>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.planCardName, { fontSize: fontSizes.heading2, color: textPrimary }]}>
                    {plan.name}
                  </Text>
                  <Text style={[styles.planCardPrice, { fontSize: fontSizes.body, color: COLORS.primary.main }]}>
                    {plan.price === 0 ? '무료' : `월 ${plan.price.toLocaleString()}원`}
                  </Text>
                </View>
                {isCurrentPlan && (
                  <View style={[styles.currentBadge, { backgroundColor: COLORS.primary.main }]}>
                    <Text style={styles.currentBadgeText}>현재</Text>
                  </View>
                )}
              </View>
              
              <Text style={[styles.planCardDesc, { fontSize: fontSizes.caption, color: textSecondary, marginTop: spacing.sm }]}>
                {plan.description}
              </Text>
              
              <View style={[styles.featureList, { marginTop: spacing.md }]}>
                {plan.features.map((feature, idx) => (
                  <Text key={idx} style={[styles.featureItem, { fontSize: fontSizes.caption, color: textPrimary }]}>
                    ✓ {feature}
                  </Text>
                ))}
              </View>
              
              {!isCurrentPlan && plan.price > 0 && (
                <TouchableOpacity
                  style={[styles.upgradeButton, { backgroundColor: COLORS.primary.main, marginTop: spacing.md }]}
                  onPress={() => handleUpgrade(plan.plan_type, plan.name, plan.price)}
                  disabled={upgradeMutation.isPending}
                >
                  <Text style={styles.upgradeButtonText}>
                    {upgradeMutation.isPending ? '처리 중...' : '구독하기'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        
        {/* 하단 여백 */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
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
  currentPlanCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planInfo: {
    marginLeft: 16,
  },
  planName: {
    fontWeight: '700',
  },
  planPrice: {
    fontWeight: '600',
    marginTop: 4,
  },
  expiresText: {},
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  usageCard: {
    borderRadius: 16,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  usageItem: {},
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  usageModelName: {},
  usageCount: {
    fontWeight: '600',
  },
  usageBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  usageBar: {
    height: '100%',
    borderRadius: 4,
  },
  addonButton: {
    borderRadius: 12,
    alignItems: 'center',
  },
  addonButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  addonButtonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  planCard: {
    borderRadius: 16,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planCardName: {
    fontWeight: '700',
  },
  planCardPrice: {
    fontWeight: '600',
  },
  planCardDesc: {},
  currentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  featureList: {},
  featureItem: {
    marginBottom: 4,
  },
  upgradeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SubscriptionScreen;
