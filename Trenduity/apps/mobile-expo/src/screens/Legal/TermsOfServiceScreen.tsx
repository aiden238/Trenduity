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
 * 이용약관 화면
 */
export const TermsOfServiceScreen = ({ onClose }: Props) => {
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
          이용약관
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

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            제1조 (목적)
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            본 약관은 Trenduity(이하 "서비스")가 제공하는 디지털 리터러시 학습 플랫폼 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            제2조 (정의)
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            1. "서비스"란 Trenduity가 제공하는 모든 온라인 교육 콘텐츠 및 관련 기능을 의미합니다.{'\n'}
            2. "이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.{'\n'}
            3. "회원"이란 서비스에 가입하여 아이디와 비밀번호를 부여받은 자를 의미합니다.
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            제3조 (약관의 효력 및 변경)
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.{'\n'}
            2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.{'\n'}
            3. 변경된 약관은 공지 후 7일이 경과한 날로부터 효력이 발생합니다.
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            제4조 (회원가입)
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.{'\n'}
            2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:{'\n'}
            - 타인의 명의를 이용한 경우{'\n'}
            - 허위 정보를 기재한 경우
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            제5조 (서비스의 제공)
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            1. 회사는 다음과 같은 서비스를 제공합니다:{'\n'}
            - 디지털 리터러시 학습 콘텐츠{'\n'}
            - 학습 진도 관리 및 피드백{'\n'}
            - 커뮤니티 기능{'\n\n'}
            2. 회사는 서비스의 내용을 변경할 수 있으며, 변경 시 사전에 공지합니다.
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            제6조 (이용자의 의무)
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            이용자는 다음 행위를 하여서는 안 됩니다:{'\n'}
            1. 허위 내용의 등록{'\n'}
            2. 타인의 정보 도용{'\n'}
            3. 저작권 침해{'\n'}
            4. 명예 손상 또는 업무 방해 행위
          </Typography>
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <Typography
            variant="heading"
            mode={mode}
            style={[styles.sectionTitle, { fontSize: fontSizes.heading3, marginBottom: spacing.sm }]}
          >
            제7조 (분쟁해결)
          </Typography>
          <Typography
            variant="body"
            mode={mode}
            style={[styles.content, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.6 }]}
          >
            1. 회사와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법을 준거법으로 합니다.{'\n'}
            2. 서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.
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
          accessibilityHint="이용약관 화면을 닫습니다"
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
