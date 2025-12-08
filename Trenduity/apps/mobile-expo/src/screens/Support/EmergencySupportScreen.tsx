import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';

// 자주 묻는 질문 데이터
const FAQ_DATA = [
  { id: '1', question: 'AI를 처음 사용하는데 어떻게 하나요?', category: 'ai' },
  { id: '2', question: '개인정보는 안전한가요?', category: 'safety' },
  { id: '3', question: '전화 상담 시간은 언제인가요?', category: 'support' },
  { id: '4', question: '오프라인 강좌는 어디서 하나요?', category: 'offline' },
  { id: '5', question: '사기 문자를 받았어요. 어떻게 하나요?', category: 'scam' },
];

// 최근 문의 기록 (더미 데이터)
const RECENT_INQUIRIES = [
  { id: '1', title: '챗GPT 사용법 문의', date: '2일 전', status: '완료', type: 'phone' },
  { id: '2', title: '스미싱 의심 문자', date: '5일 전', status: '완료', type: 'chat' },
];

export const EmergencySupportScreen = () => {
  const navigation = useNavigation();
  const { spacing, fontSizes, buttonHeight } = useA11y();
  const { colors, activeTheme } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // 다크 모드 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#1F2937';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  // 전화 상담
  const handlePhoneCall = async () => {
    const phoneNumber = 'tel:1588-0000';
    try {
      const supported = await Linking.canOpenURL(phoneNumber);
      if (supported) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert('전화 걸기 실패', '전화 앱을 열 수 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '전화를 걸 수 없습니다.');
    }
  };

  // 채팅 상담
  const handleChatSupport = () => {
    // TODO: 채팅 상담 화면으로 이동
    Alert.alert('채팅 상담', '채팅 상담 기능은 준비 중입니다.');
  };

  // 이메일 문의
  const handleEmail = () => {
    Linking.openURL('mailto:help@ailearning.kr');
  };

  // FAQ 토글
  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* 헤더 */}
      <View style={[styles.header, { 
        backgroundColor: cardBg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          accessibilityLabel="뒤로 가기"
          style={styles.backButton}
        >
          <Text style={[styles.backIcon, { color: textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading2, color: textPrimary }]}>
          AI 배움터
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.small, color: textSecondary }]}>
          오늘도 한 가지 배워볼까요?
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 상담 옵션 카드 */}
        <View style={[styles.supportCardsContainer, { padding: spacing.lg }]}>
          {/* 상담원에게 전화 */}
          <TouchableOpacity
            style={[styles.supportCard, { 
              backgroundColor: '#EBF5FF',
              borderColor: COLORS.primary.main,
              padding: spacing.lg,
              marginRight: spacing.md,
            }]}
            onPress={handlePhoneCall}
            accessibilityLabel="상담원에게 전화하기"
            accessibilityHint="1588-0000으로 전화를 겁니다"
          >
            <View style={[styles.iconCircle, { backgroundColor: COLORS.primary.main }]}>
              <Text style={styles.iconEmoji}>📞</Text>
            </View>
            <Text style={[styles.supportCardTitle, { fontSize: fontSizes.body, color: textPrimary }]}>
              상담원에게 전화
            </Text>
            <Text style={[styles.supportCardDesc, { fontSize: fontSizes.small, color: textSecondary }]}>
              친절한 상담원이 바로 도와드려요
            </Text>
            <View style={styles.timeTag}>
              <Text style={styles.timeTagText}>⏰ 평일 9-18시</Text>
            </View>
          </TouchableOpacity>

          {/* 채팅 상담 */}
          <TouchableOpacity
            style={[styles.supportCard, { 
              backgroundColor: '#E8FFF3',
              borderColor: COLORS.secondary.main,
              padding: spacing.lg,
            }]}
            onPress={handleChatSupport}
            accessibilityLabel="채팅 상담하기"
            accessibilityHint="채팅으로 상담을 시작합니다"
          >
            <View style={[styles.iconCircle, { backgroundColor: COLORS.secondary.main }]}>
              <Text style={styles.iconEmoji}>💬</Text>
            </View>
            <Text style={[styles.supportCardTitle, { fontSize: fontSizes.body, color: textPrimary }]}>
              채팅 상담
            </Text>
            <Text style={[styles.supportCardDesc, { fontSize: fontSizes.small, color: textSecondary }]}>
              문자로 편하게 상담하세요
            </Text>
            <View style={[styles.timeTag, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.timeTagText, { color: COLORS.secondary.main }]}>⏰ 실시간 응답</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 자주 묻는 질문 */}
        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>❓</Text>
            <Text style={[styles.sectionTitle, { fontSize: fontSizes.body, color: textPrimary }]}>
              자주 묻는 질문
            </Text>
          </View>
          <Text style={[styles.sectionSubtitle, { fontSize: fontSizes.small, color: textSecondary }]}>
            궁금한 내용을 먼저 찾아보세요
          </Text>

          <View style={[styles.faqContainer, { backgroundColor: cardBg, marginTop: spacing.md }]}>
            {FAQ_DATA.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={[styles.faqItem, { 
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.md,
                  borderBottomColor: activeTheme === 'dark' ? '#374151' : '#E5E7EB',
                }]}
                onPress={() => toggleFaq(faq.id)}
                accessibilityLabel={faq.question}
              >
                <Text style={[styles.faqQuestion, { fontSize: fontSizes.body, color: textPrimary }]}>
                  {faq.question}
                </Text>
                <Text style={[styles.faqArrow, { color: textSecondary }]}>
                  {expandedFaq === faq.id ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 최근 문의 기록 */}
        <View style={[styles.section, { paddingHorizontal: spacing.lg, marginTop: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.body, color: textPrimary }]}>
            최근 문의 기록
          </Text>

          <View style={[styles.recentContainer, { backgroundColor: cardBg, marginTop: spacing.md }]}>
            {RECENT_INQUIRIES.map((inquiry) => (
              <View
                key={inquiry.id}
                style={[styles.recentItem, { 
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.md,
                  borderBottomColor: activeTheme === 'dark' ? '#374151' : '#E5E7EB',
                }]}
              >
                <View style={styles.recentLeft}>
                  <Text style={styles.recentIcon}>
                    {inquiry.type === 'phone' ? '📞' : '💬'}
                  </Text>
                  <View>
                    <Text style={[styles.recentTitle, { fontSize: fontSizes.body, color: textPrimary }]}>
                      {inquiry.title}
                    </Text>
                    <Text style={[styles.recentDate, { fontSize: fontSizes.small, color: textSecondary }]}>
                      {inquiry.date}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={[styles.statusText, { color: COLORS.status.success }]}>
                    {inquiry.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 고객센터 정보 */}
        <View style={[styles.footer, { 
          backgroundColor: cardBg, 
          padding: spacing.lg,
          marginTop: spacing.lg,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.xl,
          borderRadius: RADIUS.lg,
        }]}>
          <Text style={[styles.footerItem, { fontSize: fontSizes.body, color: textPrimary }]}>
            📞 고객센터: 1588-0000
          </Text>
          <Text style={[styles.footerItem, { fontSize: fontSizes.small, color: textSecondary }]}>
            ⏰ 평일 09:00-18:00 (점심시간 운영)
          </Text>
          <TouchableOpacity onPress={handleEmail}>
            <Text style={[styles.footerEmail, { fontSize: fontSizes.small, color: COLORS.primary.main }]}>
              📧 help@ailearning.kr
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    position: 'absolute',
    left: SPACING.md,
    top: SPACING.md,
    padding: SPACING.sm,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    marginTop: 4,
  },
  supportCardsContainer: {
    flexDirection: 'row',
  },
  supportCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  iconEmoji: {
    fontSize: 28,
  },
  supportCardTitle: {
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  supportCardDesc: {
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  timeTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  timeTagText: {
    fontSize: 12,
    color: COLORS.primary.main,
    fontWeight: '500',
  },
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  sectionSubtitle: {
    marginTop: 4,
  },
  faqContainer: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  faqQuestion: {
    flex: 1,
  },
  faqArrow: {
    fontSize: 12,
    marginLeft: SPACING.sm,
  },
  recentContainer: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  recentTitle: {
    fontWeight: '500',
  },
  recentDate: {},
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerItem: {
    marginBottom: 8,
  },
  footerEmail: {
    fontWeight: '500',
  },
});
