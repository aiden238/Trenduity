import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { COLORS } from '../../tokens/colors';

export const HomeAScreen = () => {
  // 임시로 간단한 구현
  const spacing = 16;
  const fontSizes = { caption: 12, body: 16, heading1: 24, heading2: 20 };
  const buttonHeight = 48;

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <AppHeader title="AI 배움터" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { padding: spacing }]}
      >
        {/* 인사말 섹션 */}
        <View style={styles.greetingSection}>
          <Text style={[styles.headerLabel, { fontSize: fontSizes.body, color: '#6B7280' }]}>
            안녕하세요 👋
          </Text>
          <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: '#000000' }]}>
            오늘의 학습
          </Text>
        </View>

        {/* 테스트 카드 */}
        <View style={[styles.cardContainer, { backgroundColor: '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { fontSize: fontSizes.heading1, color: '#000000' }]}>
            환영합니다! 👋
          </Text>
          
          <Text style={[styles.cardDescription, { fontSize: fontSizes.body, color: '#6B7280' }]}>
            AI 배움터에서 새로운 것을 배워보세요.
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryButton,
              { backgroundColor: COLORS.primary.main, height: buttonHeight },
            ]}
            accessibilityLabel="학습 시작하기"
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { fontSize: fontSizes.body }]}>
              📝 학습 시작
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#D1D5DB',
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
  cardImagePlaceholder: {
    height: 200,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePlaceholderText: {
    color: '#6B7280',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
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
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: COLORS.neutral.text.inverse,
    fontWeight: '600',
  },
});
