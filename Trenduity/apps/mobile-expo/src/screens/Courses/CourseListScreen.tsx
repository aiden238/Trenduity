import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Typography, Card } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';

/**
 * 코스(도구 트랙) 목록 화면
 * 
 * TODO(IMPLEMENT): 실제 데이터 로드
 * TODO(IMPLEMENT): 트랙 상세 네비게이션
 */
export const CourseListScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>코스 화면</Text>
    </View>
  );
};

const oldCourseListScreen = () => {
  const { mode } = useA11y();

  // Dummy data
  const courses = [
    { id: '1', title: '미리캔버스로 카드 만들기', steps: 5 },
    { id: '2', title: '캔바 기초 배우기', steps: 4 },
    { id: '3', title: '소라로 영상 만들기', steps: 6 },
  ];

  return (
    <View style={styles.container}>
      <Typography variant="heading" mode={mode}>
        도구 배우기
      </Typography>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card mode={mode} style={styles.card}>
            <Typography variant="title" mode={mode}>
              {item.title}
            </Typography>
            <Typography variant="small" mode={mode} style={styles.steps}>
              {item.steps}단계
            </Typography>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  card: {
    marginTop: 12,
  },
  steps: {
    marginTop: 4,
  },
});
