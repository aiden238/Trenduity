import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Button } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';

/**
 * 코스 작업 화면 (단계별)
 * 
 * TODO(IMPLEMENT): 실제 작업 콘텐츠
 * TODO(IMPLEMENT): 진행도 저장
 */
export const CourseTaskScreen = () => {
  const { mode } = useA11y();

  return (
    <View style={styles.container}>
      <Typography variant="heading" mode={mode}>
        1단계: 미리캔버스 접속하기
      </Typography>

      <Typography variant="body" mode={mode} style={styles.body}>
        1. 크롬 브라우저를 엽니다{'\n'}
        2. 주소창에 miricanvas.com을 입력합니다{'\n'}
        3. 로그인 버튼을 클릭합니다
      </Typography>

      <Button
        mode={mode}
        onPress={() => console.log('[TODO] 다음 단계')}
        style={styles.button}
      >
        완료하고 다음 단계
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
  body: {
    marginVertical: 16,
  },
  button: {
    marginTop: 16,
  },
});
