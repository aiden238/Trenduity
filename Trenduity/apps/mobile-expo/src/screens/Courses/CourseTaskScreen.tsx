import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useA11y } from '../../contexts/A11yContext';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';

/**
 * 코스 작업 화면 (단계별)
 * 
 * TODO(IMPLEMENT): 실제 작업 콘텐츠
 * TODO(IMPLEMENT): 진행도 저장
 */
export const CourseTaskScreen = () => {
  const { spacing, buttonHeight, fontSizes } = useA11y();

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { fontSize: fontSizes.heading1, marginBottom: spacing.lg }]}>
        📝 1단계: 미리캔버스 접속하기
      </Text>

      <View style={[styles.stepCard, { padding: spacing.md, borderRadius: RADIUS.lg, marginBottom: spacing.lg }]}>
        <Text style={[styles.stepText, { fontSize: fontSizes.body, lineHeight: fontSizes.body * 1.8 }]}>
          1. 크롬 브라우저를 엽니다{'\n'}
          2. 주소창에 miricanvas.com을 입력합니다{'\n'}
          3. 로그인 버튼을 클릭합니다
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { 
          height: buttonHeight, 
          backgroundColor: COLORS.primary.main,
          borderRadius: RADIUS.lg,
        }]}
        onPress={() => console.log('[TODO] 다음 단계')}
        accessibilityRole="button"
        accessibilityLabel="완료하고 다음 단계로 이동"
      >
        <Text style={[styles.buttonText, { fontSize: fontSizes.body }]}>
          완료하고 다음 단계 →
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    color: COLORS.neutral.text.primary,
    fontWeight: '700',
  },
  stepCard: {
    backgroundColor: '#F3F4F6',
  },
  stepText: {
    color: COLORS.neutral.text.primary,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
