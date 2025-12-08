import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS, SHADOWS, RADIUS } from '../../tokens/colors';

/**
 * 개인정보 처리방침 화면
 */
export const PrivacyScreen = () => {
  const { spacing, fontSizes } = useA11y();
  const { activeTheme, colors } = useTheme();
  const navigation = useNavigation();

  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#1F2937';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: COLORS.primary.main, padding: spacing.lg, paddingTop: 48 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="뒤로 가기"
        >
          <Text style={[styles.backText, { fontSize: fontSizes.body }]}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1 }]}>
          🔒 개인정보 처리방침
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ padding: spacing.lg }}
      >
        <View style={[styles.card, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: RADIUS.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            1. 수집하는 개인정보
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: textSecondary, lineHeight: fontSizes.body * 1.6 }]}>
            트렌듀이티는 서비스 제공을 위해 다음 정보를 수집합니다:{'\n\n'}
            <Text style={styles.highlight}>필수 정보:</Text>{'\n'}
            • 이메일 주소{'\n'}
            • 닉네임 (실명 아님){'\n'}
            • 생년월일 (연령대 확인용){'\n\n'}
            <Text style={styles.highlight}>선택 정보:</Text>{'\n'}
            • 프로필 사진{'\n'}
            • 관심 주제{'\n'}
            • 가족 연동 정보
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: RADIUS.lg, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            2. 개인정보의 이용 목적
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: textSecondary, lineHeight: fontSizes.body * 1.6 }]}>
            수집된 개인정보는 다음 목적으로 이용됩니다:{'\n\n'}
            • 서비스 제공 및 운영{'\n'}
            • 맞춤형 학습 콘텐츠 추천{'\n'}
            • 학습 진도 저장 및 복원{'\n'}
            • 가족 대시보드 연동{'\n'}
            • 서비스 개선 및 통계 분석{'\n'}
            • 고객 지원 및 문의 응대
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: RADIUS.lg, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            3. 개인정보의 보관 기간
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: textSecondary, lineHeight: fontSizes.body * 1.6 }]}>
            개인정보는 다음 기간 동안 보관됩니다:{'\n\n'}
            • 회원 정보: 회원 탈퇴 시까지{'\n'}
            • 학습 기록: 회원 탈퇴 후 30일{'\n'}
            • 결제 기록: 관련 법령에 따라 5년{'\n\n'}
            회원 탈퇴 요청 시 개인정보는 즉시 삭제되며, 법령에 의해 보관이 필요한 정보는 별도 분리하여 보관합니다.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: RADIUS.lg, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            4. 개인정보의 제3자 제공
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: textSecondary, lineHeight: fontSizes.body * 1.6 }]}>
            트렌듀이티는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.{'\n\n'}
            다만, 다음의 경우에는 예외로 합니다:{'\n\n'}
            • 이용자가 사전에 동의한 경우{'\n'}
            • 법령에 의해 요구되는 경우{'\n'}
            • 가족 연동 기능 사용 시 연동된 가족에게 학습 현황 공유
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: RADIUS.lg, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            5. 이용자의 권리
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: textSecondary, lineHeight: fontSizes.body * 1.6 }]}>
            이용자는 언제든지 다음 권리를 행사할 수 있습니다:{'\n\n'}
            ✅ 개인정보 열람 요청{'\n'}
            ✅ 개인정보 정정 요청{'\n'}
            ✅ 개인정보 삭제 요청{'\n'}
            ✅ 개인정보 처리 정지 요청{'\n'}
            ✅ 회원 탈퇴{'\n\n'}
            위 요청은 앱 내 설정 메뉴 또는 고객센터를 통해 처리할 수 있습니다.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: RADIUS.lg, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            6. 개인정보 보호 책임자
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: textSecondary, lineHeight: fontSizes.body * 1.6 }]}>
            개인정보 보호 관련 문의는 아래로 연락주세요:{'\n\n'}
            📧 이메일: privacy@trenduity.com{'\n'}
            📞 전화: 1588-0000{'\n'}
            🏢 주소: 서울시 강남구 테헤란로 123
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: '#FEF3C7', padding: spacing.lg, borderRadius: RADIUS.lg, marginTop: spacing.md, marginBottom: spacing.xl }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: '#92400E', marginBottom: spacing.md }]}>
            🔐 안심하세요!
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: '#92400E', lineHeight: fontSizes.body * 1.6 }]}>
            트렌듀이티는 시니어 이용자의 개인정보 보호를 최우선으로 생각합니다.{'\n\n'}
            • 모든 데이터는 암호화되어 저장됩니다{'\n'}
            • 외부 업체와 정보를 공유하지 않습니다{'\n'}
            • 원하실 때 언제든 탈퇴할 수 있습니다
          </Text>
        </View>

        <Text style={[styles.lastUpdate, { fontSize: fontSizes.caption, color: textSecondary, marginBottom: spacing.xl }]}>
          마지막 업데이트: 2024년 12월 1일
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
  backButton: {
    marginBottom: 12,
  },
  backText: {
    color: 'rgba(255,255,255,0.9)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  card: {
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  bodyText: {},
  highlight: {
    fontWeight: '700',
  },
  lastUpdate: {
    textAlign: 'center',
  },
});
