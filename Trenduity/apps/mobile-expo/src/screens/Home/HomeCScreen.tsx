import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useA11y } from '../../contexts/A11yContext';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';

/**
 * 초간단 홈 화면 (ultra 모드)
 * 버튼 3개만: 카드, 복약, 음성
 * 
 * TODO(IMPLEMENT): 버튼 액션 구현
 */
export const HomeCScreen = () => {
  const { spacing, buttonHeight, fontSizes } = useA11y();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: fontSizes.heading1, marginBottom: spacing.xl }]}>
        오늘 할 일
      </Text>

      <TouchableOpacity
        style={[styles.button, { 
          height: buttonHeight * 1.5, 
          backgroundColor: COLORS.primary.main,
          borderRadius: RADIUS.xl,
          marginBottom: spacing.md,
        }]}
        onPress={() => console.log('[TODO] 카드 읽기')}
        accessibilityRole="button"
        accessibilityLabel="오늘의 카드 보기"
      >
        <Text style={[styles.buttonText, { fontSize: fontSizes.heading2 }]}>
          📖 오늘의 카드
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { 
          height: buttonHeight * 1.5, 
          backgroundColor: COLORS.secondary.main,
          borderRadius: RADIUS.xl,
          marginBottom: spacing.md,
        }]}
        onPress={() => console.log('[TODO] 복약 체크')}
        accessibilityRole="button"
        accessibilityLabel="약 먹기 체크하기"
      >
        <Text style={[styles.buttonText, { fontSize: fontSizes.heading2 }]}>
          💊 약 먹기 체크
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { 
          height: buttonHeight * 1.5, 
          backgroundColor: COLORS.accent.orange,
          borderRadius: RADIUS.xl,
        }]}
        onPress={() => console.log('[TODO] 음성 기능')}
        accessibilityRole="button"
        accessibilityLabel="음성으로 말하기"
      >
        <Text style={[styles.buttonText, { fontSize: fontSizes.heading2 }]}>
          🎤 말하기
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    color: COLORS.neutral.text.primary,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
