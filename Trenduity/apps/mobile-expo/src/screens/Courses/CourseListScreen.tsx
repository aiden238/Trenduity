import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';

interface Course {
  id: string;
  title: string;
  steps: number;
  icon: string;
}

// 더미 데이터
const COURSES: Course[] = [
  { id: '1', title: '미리캔버스로 카드 만들기', steps: 5, icon: '🎨' },
  { id: '2', title: '캔바 기초 배우기', steps: 4, icon: '✨' },
  { id: '3', title: '소라로 영상 만들기', steps: 6, icon: '🎬' },
];

/**
 * 코스(도구 트랙) 목록 화면
 * 
 * TODO(IMPLEMENT): 실제 데이터 로드
 * TODO(IMPLEMENT): 트랙 상세 네비게이션
 */
export const CourseListScreen = () => {
  const { spacing, fontSizes } = useA11y();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { fontSize: fontSizes.heading1, marginBottom: spacing.lg, marginTop: spacing.lg }]}>
        📚 도구 배우기
      </Text>

      <FlatList
        data={COURSES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('CourseTask', { courseId: item.id })}
            style={[styles.card, { 
              padding: spacing.md, 
              marginBottom: spacing.md,
              borderRadius: RADIUS.lg,
            }]}
            accessibilityRole="button"
            accessibilityLabel={`${item.title} 코스 시작하기`}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[styles.cardTitle, { fontSize: fontSizes.body }]}>
                  {item.title}
                </Text>
                <Text style={[styles.cardSteps, { fontSize: fontSizes.small, marginTop: spacing.xs }]}>
                  {item.steps}단계
                </Text>
              </View>
              <Text style={[styles.arrow, { fontSize: fontSizes.body }]}>→</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  heading: {
    color: COLORS.neutral.text.primary,
    fontWeight: '700',
    paddingHorizontal: SPACING.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 32,
  },
  cardTitle: {
    color: COLORS.neutral.text.primary,
    fontWeight: '600',
  },
  cardSteps: {
    color: COLORS.neutral.text.secondary,
  },
  arrow: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
});
