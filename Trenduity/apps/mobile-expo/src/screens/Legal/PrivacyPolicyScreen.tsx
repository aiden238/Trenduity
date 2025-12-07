import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Typography } from '../../components/shared/Typography';
import { COLORS, RADIUS } from '../../tokens/colors';
import { useA11y } from '../../contexts/A11yContext';

interface Props {
  onClose: () => void;
}

/**
 * 개인정보 처리방침 화면
 */
export const PrivacyPolicyScreen = ({ onClose }: Props) => {
  const { mode, spacing, fontSizes } = useA11y();

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessibilityLabel="닫기"
        >
          <Typography variant="body" mode={mode} style={{ fontSize: fontSizes.heading2 }}>
            ✕
          </Typography>
        </TouchableOpacity>
        <Typography
          variant="heading"
          mode={mode}
          style={[styles.headerTitle, { fontSize: fontSizes.heading2 }]}
        >
          개인정보 처리방침
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
      >
        <Typography
          variant="caption"
          mode={mode}
          style={[styles.date, { fontSize: fontSizes.caption, marginBottom: spacing.lg }]}
        >
          최종 수정일: 2025년 11월 29일
        </Typography>

        <Typography
          variant="body"
          mode={mode}
          style={[styles.intro, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6, marginBottom: spacing.lg }]}
        >
          Trenduity(이하 "회사")는 「개인정보 보호법」에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
        </Typography>

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            1. 개인정보의 처리 목적
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            회사는 다음의 목적을 위하여 개인정보를 처리합니다:{'\n\n'}
            ① 회원가입 및 관리{'\n'}
            - 회원 가입의사 확인, 본인 식별·인증, 회원자격 유지·관리{'\n\n'}
            ② 서비스 제공{'\n'}
            - 학습 콘텐츠 제공, 학습 진도 관리, 맞춤형 서비스 제공{'\n\n'}
            ③ 서비스 개선{'\n'}
            - 서비스 이용 통계 분석, 신규 서비스 개발
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            2. 개인정보의 처리 및 보유 기간
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            ① 회사는 법령에 따른 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.{'\n\n'}
            ② 구체적인 보유 기간:{'\n'}
            - 회원 가입 및 관리: 회원 탈퇴 시까지{'\n'}
            - 서비스 제공: 서비스 이용계약 종료 시까지
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            3. 처리하는 개인정보의 항목
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            회사는 다음의 개인정보 항목을 처리하고 있습니다:{'\n\n'}
            ① 회원가입{'\n'}
            - 필수항목: 이메일 주소, 비밀번호{'\n'}
            - 선택항목: 이름, 연령대, 관심 분야{'\n\n'}
            ② 자동 수집 정보{'\n'}
            - IP 주소, 서비스 이용 기록, 기기 정보
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            4. 개인정보의 제3자 제공
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            회사는 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            5. 개인정보의 파기
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            ① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.{'\n\n'}
            ② 파기 방법:{'\n'}
            - 전자적 파일: 기록을 재생할 수 없는 기술적 방법으로 삭제
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            6. 정보주체의 권리
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            정보주체는 회사에 대해 언제든지 다음의 권리를 행사할 수 있습니다:{'\n\n'}
            1. 개인정보 열람 요구{'\n'}
            2. 오류 등이 있을 경우 정정 요구{'\n'}
            3. 삭제 요구{'\n'}
            4. 처리정지 요구
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            7. 개인정보 보호책임자
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            ▶ 개인정보 보호책임자{'\n'}
            - 담당: Trenduity 운영팀{'\n'}
            - 이메일: privacy@trenduity.com
          </Typography>
        </View>

        <TouchableOpacity
          onPress={onClose}
          style={[
            styles.confirmButton,
            { 
              padding: spacing.md,
              backgroundColor: COLORS.primary.main,
              borderRadius: RADIUS.lg,
            }
          ]}
          accessibilityLabel="확인"
          accessibilityHint="개인정보 처리방침 화면을 닫습니다"
        >
          <Typography
            variant="body"
            mode={mode}
            style={[styles.confirmButtonText, { fontSize: fontSizes.body, color: '#FFFFFF' }]}
          >
            확인
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollContent: {
    flexGrow: 1,
  },
  date: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  intro: {
    color: '#4B5563',
  },
  sectionTitle: {
    color: '#1F2937',
    fontWeight: '600',
  },
  content: {
    color: '#4B5563',
  },
  confirmButton: {
    alignItems: 'center',
  },
  confirmButtonText: {
    fontWeight: '600',
  },
});
