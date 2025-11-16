import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Button } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';

/**
 * 초간단 홈 화면 (ultra 모드)
 * 버튼 3개만: 카드, 복약, 음성
 * 
 * TODO(IMPLEMENT): 버튼 액션 구현
 */
export const HomeCScreen = () => {
  const { mode } = useA11y();

  return (
    <View style={styles.container}>
      <Typography variant="heading" mode={mode} style={styles.title}>
        오늘 할 일
      </Typography>

      <Button mode={mode} onPress={() => console.log('[TODO] 카드 읽기')}>
        오늘의 카드
      </Button>

      <Button
        mode={mode}
        onPress={() => console.log('[TODO] 복약 체크')}
        style={styles.button}
      >
        약 먹기 체크
      </Button>

      <Button
        mode={mode}
        variant="secondary"
        onPress={() => console.log('[TODO] 음성 기능')}
        style={styles.button}
      >
        말하기
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    marginTop: 16,
  },
});
