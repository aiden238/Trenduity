import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Typography, Button } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';

/**
 * Q&A 작성 화면
 * 
 * TODO(IMPLEMENT): 실제 글 작성 저장
 * TODO(IMPLEMENT): AI 요약 생성
 */
export const QnaCreateScreen = () => {
  const { mode } = useA11y();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = () => {
    console.log('[TODO] Q&A 작성 저장', { title, body });
  };

  return (
    <View style={styles.container}>
      <Typography variant="heading" mode={mode}>
        질문하기
      </Typography>

      <TextInput
        style={styles.input}
        placeholder="제목"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="질문 내용"
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={6}
      />

      <Button mode={mode} onPress={handleSubmit} style={styles.button}>
        질문 등록
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  input: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 16,
  },
});
