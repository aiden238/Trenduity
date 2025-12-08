import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS, SHADOWS, RADIUS } from '../../tokens/colors';

/**
 * 이용약관 화면
 */
export const TermsScreen = () => {
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
          📜 이용약관
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ padding: spacing.lg }}
      >
        <View style={[styles.card, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: RADIUS.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            제1조 (목적)
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: textSecondary, lineHeight: fontSizes.body * 1.6 }]}>
            이 약관은 트렌듀이티(이하 "회사")가 제공하는 시니어 AI 학습 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: RADIUS.lg, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            제2조 (서비스의 제공)
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: textSecondary, lineHeight: fontSizes.body * 1.6 }]}>
            회사는 다음과 같은 서비스를 제공합니다:{'\n\n'}
            1. AI 기반 디지털 리터러시 학습 콘텐츠{'\n'}
            2. 맞춤형 학습 카드 및 퀴즈{'\n'}
            3. 음성 안내 서비스{'\n'}
            4. 사기 문자 검사 기능{'\n'}
            5. 커뮤니티 Q&A 서비스{'\n'}
            6. 가족 연동 대시보드
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: RADIUS.lg, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            제3조 (이용자의 의무)
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: textSecondary, lineHeight: fontSizes.body * 1.6 }]}>
            이용자는 다음 행위를 하여서는 안 됩니다:{'\n\n'}
            1. 타인의 개인정보 도용{'\n'}
            2. 서비스의 정상적인 운영을 방해하는 행위{'\n'}
            3. 불법적인 목적으로 서비스를 이용하는 행위{'\n'}
            4. 타인에게 불쾌감을 주는 콘텐츠 게시
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: RADIUS.lg, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            제4조 (면책조항)
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: textSecondary, lineHeight: fontSizes.body * 1.6 }]}>
            회사는 다음과 같은 경우 책임을 지지 않습니다:{'\n\n'}
            1. 천재지변 또는 불가항력적인 사유로 서비스를 제공할 수 없는 경우{'\n'}
            2. 이용자의 귀책사유로 인한 서비스 이용 장애{'\n'}
            3. 이용자가 서비스를 통해 얻은 정보로 인한 손해
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: RADIUS.lg, marginTop: spacing.md, marginBottom: spacing.xl }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            제5조 (약관의 변경)
          </Text>
          <Text style={[styles.bodyText, { fontSize: fontSizes.body, color: textSecondary, lineHeight: fontSizes.body * 1.6 }]}>
            회사는 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다. 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.
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
  lastUpdate: {
    textAlign: 'center',
  },
});
