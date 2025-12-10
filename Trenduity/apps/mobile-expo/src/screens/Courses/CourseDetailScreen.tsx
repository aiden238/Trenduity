/**
 * 강좌 상세 화면
 * 강의 목록 (1강, 2강, 3강...)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useA11y } from '@/contexts/A11yContext';
import { useCourseDetail } from '@/hooks/useCourses';

const ACTIVE_COURSE_KEY = '@active_course';

export const CourseDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params as { courseId: string };
  
  const { colors } = useTheme();
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { course, loading, error } = useCourseDetail(courseId);

  const { background, cardBg, textPrimary, textSecondary, primary, success } = colors;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, { fontSize: fontSizes.body, color: textSecondary }]}>
            강좌 정보를 불러오는 중...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { fontSize: fontSizes.body, color: textSecondary }]}>
            {error || '강좌를 찾을 수 없어요'}
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: primary, height: buttonHeight, marginTop: spacing.md }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { fontSize: fontSizes.body, color: '#fff' }]}>
              돌아가기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const lastWatched = course.user_progress?.last_watched_lecture || 0;
  const completed = course.user_progress?.completed_lectures || 0;

  const handleStartLearning = async () => {
    try {
      // 현재 강좌를 활성 강좌로 저장
      const activeCourse = {
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        description: course.description,
        total_lectures: course.total_lectures,
        completed_lectures: completed,
        last_watched_lecture: lastWatched,
        started_at: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(ACTIVE_COURSE_KEY, JSON.stringify(activeCourse));
      
      // 다음 강의로 이동 (마지막 본 강의 + 1 또는 1강)
      const nextLecture = lastWatched + 1;
      if (nextLecture <= course.total_lectures) {
        navigation.navigate('LecturePlayer' as never, {
          courseId: course.id,
          lectureNumber: nextLecture,
        } as never);
      } else {
        Alert.alert('완료', '모든 강의를 수강하셨습니다! 🎉');
      }
    } catch (error) {
      console.error('Failed to start learning:', error);
      Alert.alert('오류', '학습을 시작할 수 없어요. 다시 시도해주세요.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }]}
      contentContainerStyle={{ padding: spacing.md }}
    >
      {/* 강좌 헤더 */}
      <View style={[styles.header, { backgroundColor: cardBg, padding: spacing.md, borderRadius: 12 }]}>
        <Text style={[styles.thumbnail, { fontSize: fontSizes.heading1 * 2 }]}>
          {course.thumbnail}
        </Text>
        <Text style={[styles.title, { fontSize: fontSizes.heading1, color: textPrimary, marginTop: spacing.sm }]}>
          {course.title}
        </Text>
        <Text style={[styles.description, { fontSize: fontSizes.body, color: textSecondary, marginTop: spacing.xs }]}>
          {course.description}
        </Text>
        <Text style={[styles.progress, { fontSize: fontSizes.small, color: primary, marginTop: spacing.sm }]}>
          📊 {completed}/{course.total_lectures}강 완료
        </Text>
      </View>

      {/* 학습 시작하기 버튼 */}
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: primary, height: buttonHeight, marginTop: spacing.lg, marginBottom: spacing.md }]}
        onPress={handleStartLearning}
        accessibilityLabel="학습 시작하기"
        accessibilityRole="button"
      >
        <Text style={[styles.startButtonText, { fontSize: fontSizes.body, color: '#fff' }]}>
          {completed === course.total_lectures ? '🎉 다시 학습하기' : lastWatched === 0 ? '📖 학습 시작하기' : '📖 이어서 학습하기'}
        </Text>
      </TouchableOpacity>

      {/* 강의 목록 */}
      <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
        강의 목록
      </Text>

      {course.lectures.map((lecture) => {
        const isCompleted = lecture.lecture_number <= completed;
        const isCurrent = lecture.lecture_number === lastWatched + 1;
        const isLocked = lecture.lecture_number > lastWatched + 1;

        return (
          <TouchableOpacity
            key={lecture.id}
            style={[
              styles.lectureCard,
              { 
                backgroundColor: isCompleted ? success + '20' : cardBg,
                borderColor: isCurrent ? primary : 'transparent',
                borderWidth: isCurrent ? 2 : 0,
                marginBottom: spacing.sm,
                padding: spacing.md,
                borderRadius: 8,
                opacity: isLocked ? 0.5 : 1
              },
            ]}
            onPress={() => {
              if (!isLocked) {
                navigation.navigate('LecturePlayer' as never, {
                  courseId,
                  lectureNumber: lecture.lecture_number,
                } as never);
              }
            }}
            disabled={isLocked}
            accessibilityLabel={`${lecture.lecture_number}강. ${lecture.title}, ${lecture.duration}분${isCompleted ? ', 완료됨' : ''}${isLocked ? ', 잠김' : ''}`}
          >
            <View style={styles.lectureHeader}>
              <Text style={[styles.lectureNumber, { fontSize: fontSizes.body, color: textSecondary }]}>
                {lecture.lecture_number}강
              </Text>
              {isCompleted && <Text style={styles.checkmark}>✅</Text>}
              {isCurrent && <Text style={styles.playIcon}>▶️</Text>}
              {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
            </View>
            <Text style={[styles.lectureTitle, { fontSize: fontSizes.heading3, color: textPrimary, marginTop: spacing.xs }]}>
              {lecture.title}
            </Text>
            <Text style={[styles.lectureDuration, { fontSize: fontSizes.small, color: textSecondary, marginTop: spacing.xs }]}>
              ⏱️ {lecture.duration}분
            </Text>
          </TouchableOpacity>
        );
      })}
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
  backButton: {
    paddingHorizontal: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
  },
  thumbnail: {
    textAlign: 'center',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  progress: {
    fontWeight: '600',
  },
  startButton: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  lectureCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lectureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lectureNumber: {
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
  },
  playIcon: {
    fontSize: 16,
  },
  lockIcon: {
    fontSize: 16,
  },
  lectureTitle: {
    fontWeight: 'bold',
  },
  lectureDuration: {},
});
