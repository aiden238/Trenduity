import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Typography } from '../../components/shared/Typography';
import { COLORS, SPACING, RADIUS } from '../../tokens/colors';
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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing * 2 }]}
      >
        <Typography
          variant="heading"
          mode={mode}
          style={[styles.title, { fontSize: fontSizes.heading1, marginBottom: spacing * 2 }]}
        >
          개인정보 처리방침
        </Typography>

        <Typography
          variant="caption"
          mode={mode}
          style={[styles.date, { fontSize: fontSizes.caption, marginBottom: spacing * 3 }]}
        >
          최종 수정일: 2025년 11월 29일
        </Typography>

        <View style={{ marginBottom: spacing * 2 }}>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.intro, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6, marginBottom: spacing * 2 }]}
          >
            Trenduity(이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </Typography>
        </View>

        <View style={{ marginBottom: spacing * 2 }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing }]}
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
            - 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지{'\n\n'}
            ② 서비스 제공{'\n'}
            - 학습 콘텐츠 제공, 학습 진도 관리, 맞춤형 서비스 제공, 본인인증{'\n\n'}
            ③ 서비스 개선{'\n'}
            - 서비스 이용 통계 분석, 신규 서비스 개발 및 맞춤 서비스 제공
          </Typography>
        </View>

        <View style={{ marginBottom: spacing * 2 }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing }]}
          >
            2. 개인정보의 처리 및 보유 기간
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            ① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.{'\n\n'}
            ② 구체적인 개인정보 처리 및 보유 기간은 다음과 같습니다:{'\n'}
            - 회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지){'\n'}
            - 서비스 제공: 서비스 이용계약 체결 시부터 서비스 제공 종료 시까지
          </Typography>
        </View>

        <View style={{ marginBottom: spacing * 2 }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing }]}
          >
            3. 처리하는 개인정보의 항목
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            회사는 다음의 개인정보 항목을 처리하고 있습니다:{'\n\n'}
            ① 회원가입 및 관리{'\n'}
            - 필수항목: 이메일 주소, 비밀번호{'\n'}
            - 선택항목: 이름, 연령대, 관심 분야{'\n\n'}
            ② 서비스 이용 과정에서 자동 수집되는 정보{'\n'}
            - IP 주소, 쿠키, 서비스 이용 기록, 기기 정보
          </Typography>
        </View>

        <View style={{ marginBottom: spacing * 2 }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing }]}
          >
            4. 개인정보의 제3자 제공
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
          </Typography>
        </View>

        <View style={{ marginBottom: spacing * 2 }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing }]}
          >
            5. 개인정보의 파기
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            ① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.{'\n\n'}
            ② 파기 절차 및 방법은 다음과 같습니다:{'\n'}
            - 파기절차: 불필요한 개인정보는 개인정보 보호책임자의 승인 후 파기{'\n'}
            - 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제
          </Typography>
        </View>

        <View style={{ marginBottom: spacing * 2 }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing }]}
          >
            6. 정보주체의 권리·의무 및 행사방법
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:{'\n\n'}
            1. 개인정보 열람 요구{'\n'}
            2. 오류 등이 있을 경우 정정 요구{'\n'}
            3. 삭제 요구{'\n'}
            4. 처리정지 요구
          </Typography>
        </View>

        <View style={{ marginBottom: spacing * 2 }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing }]}
          >
            7. 개인정보의 안전성 확보 조치
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:{'\n\n'}
            1. 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육{'\n'}
            2. 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 개인정보의 암호화{'\n'}
            3. 물리적 조치: 전산실, 자료보관실 등의 접근통제
          </Typography>
        </View>

        <View style={{ marginBottom: spacing * 4 }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing }]}
          >
            8. 개인정보 보호책임자
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.{'\n\n'}
            ▶ 개인정보 보호책임자{'\n'}
            - 성명: Trenduity 운영팀{'\n'}
            - 이메일: privacy@trenduity.com{'\n\n'}
            ※ 개인정보 보호 담당부서로 연결됩니다.
          </Typography>
        </View>

        <TouchableOpacity
          onPress={onClose}
          style={[
            styles.closeButton,
            { 
              padding: spacing * 1.5,
              backgroundColor: COLORS.primary.main,
              borderRadius: RADIUS.lg,
            }
          ]}
          accessibilityLabel="닫기"
          accessibilityHint="개인정보 처리방침 화면을 닫습니다"
        >
          <Typography
            variant="body"
            mode={mode}
            style={[styles.closeButtonText, { fontSize: fontSizes.body, color: '#FFFFFF' }]}
          >
            확인
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    color: COLORS.neutral.text.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  date: {
    color: COLORS.neutral.text.tertiary,
    textAlign: 'center',
  },
  intro: {
    color: COLORS.neutral.text.secondary,
  },
  sectionTitle: {
    color: COLORS.neutral.text.primary,
    fontWeight: '600',
  },
  content: {
    color: COLORS.neutral.text.secondary,
  },
  closeButton: {
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: '600',
  },
});
