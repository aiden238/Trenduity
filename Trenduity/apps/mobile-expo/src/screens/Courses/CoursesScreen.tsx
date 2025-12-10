/**
 * 강좌 목록 화면
 * EBSI 스타일 강좌 목록
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useA11y } from '@/contexts/A11yContext';
import { useCourses } from '@/hooks/useCourses';

export const CoursesScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { fontSizes, spacing } = useA11y();
  const { courses, loading, error } = useCourses();

  const { background, cardBg, textPrimary, textSecondary, primary } = colors;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, { fontSize: fontSizes.body, color: textSecondary }]}>
            강좌를 불러오는 중...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { fontSize: fontSizes.body, color: textSecondary }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }]}
      contentContainerStyle={{ padding: spacing.md }}
    >
      <Text
        style={[
          styles.title,
          { fontSize: fontSizes.heading1, color: textPrimary, marginBottom: spacing.md },
        ]}
      >
        📚 AI 학습 강좌
      </Text>

      <Text
        style={[
          styles.subtitle,
          { fontSize: fontSizes.body, color: textSecondary, marginBottom: spacing.lg },
        ]}
      >
        원하는 강좌를 선택하고 순서대로 학습해보세요
      </Text>

      {courses.map((course) => {
        const progress = course.user_completed_lectures || 0;
        const total = course.total_lectures;
        const progressPercent = total > 0 ? (progress / total) * 100 : 0;

        return (
          <TouchableOpacity
            key={course.id}
            style={[
              styles.courseCard,
              { backgroundColor: cardBg, marginBottom: spacing.md, borderRadius: 12 },
            ]}
            onPress={() =>
              navigation.navigate('CourseDetail' as never, { courseId: course.id } as never)
            }
            accessibilityLabel={`${course.title} 강좌, ${progress}강 중 ${total}강 완료`}
          >
            <View style={styles.courseHeader}>
              <Text style={[styles.courseThumbnail, { fontSize: fontSizes.heading1 * 1.5 }]}>
                {course.thumbnail}
              </Text>
              <View style={styles.courseInfo}>
                <Text
                  style={[styles.courseTitle, { fontSize: fontSizes.heading2, color: textPrimary }]}
                  numberOfLines={2}
                >
                  {course.title}
                </Text>
                <Text
                  style={[
                    styles.courseDesc,
                    { fontSize: fontSizes.small, color: textSecondary, marginTop: spacing.xs },
                  ]}
                  numberOfLines={2}
                >
                  {course.description}
                </Text>
              </View>
            </View>

            <View style={[styles.progressContainer, { marginTop: spacing.sm }]}>
              <View style={[styles.progressBarBg, { backgroundColor: background }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: primary, width: `${progressPercent}%` },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.progressText,
                  { fontSize: fontSizes.caption, color: textSecondary, marginTop: spacing.xs },
                ]}
              >
                {progress}/{total}강 완료
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {courses.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary }]}>
            아직 강좌가 없어요
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    lineHeight: 24,
  },
  courseCard: {
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  courseThumbnail: {
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontWeight: 'bold',
  },
  courseDesc: {
    lineHeight: 20,
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});
