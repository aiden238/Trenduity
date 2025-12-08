import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';

/**
 * Q&A 작성 화면
 * 
 * TODO(IMPLEMENT): 실제 글 작성 저장
 * TODO(IMPLEMENT): AI 요약 생성
 */
export const QnaCreateScreen = () => {
  const { spacing, fontSizes, buttonHeight } = useA11y();
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }
    console.log('[TODO] Q&A 작성 저장', { title, body });
    Alert.alert('알림', '질문이 등록되었습니다!', [
      { text: '확인', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { fontSize: fontSizes.heading1, marginBottom: spacing.lg }]}>
        ✏️ 질문하기
      </Text>

      <Text style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}>
        제목
      </Text>
      <TextInput
        style={[styles.input, { 
          fontSize: fontSizes.body, 
          padding: spacing.md,
          marginBottom: spacing.md,
        }]}
        placeholder="궁금한 점을 간단히 적어주세요"
        placeholderTextColor={COLORS.neutral.text.tertiary}
        value={title}
        onChangeText={setTitle}
        accessibilityLabel="질문 제목 입력"
      />

      <Text style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}>
        내용
      </Text>
      <TextInput
        style={[styles.input, styles.textArea, { 
          fontSize: fontSizes.body, 
          padding: spacing.md,
          marginBottom: spacing.lg,
        }]}
        placeholder="자세한 내용을 작성해주세요"
        placeholderTextColor={COLORS.neutral.text.tertiary}
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        accessibilityLabel="질문 내용 입력"
      />

      <TouchableOpacity
        style={[styles.button, { 
          height: buttonHeight, 
          backgroundColor: COLORS.primary.main,
          borderRadius: RADIUS.lg,
        }]}
        onPress={handleSubmit}
        accessibilityRole="button"
        accessibilityLabel="질문 등록하기"
      >
        <Text style={[styles.buttonText, { fontSize: fontSizes.body }]}>
          질문 등록
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
  label: {
    color: COLORS.neutral.text.primary,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    color: COLORS.neutral.text.primary,
  },
  textArea: {
    height: 150,
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
