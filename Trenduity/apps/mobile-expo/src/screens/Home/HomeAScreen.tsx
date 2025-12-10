import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/AppHeader';
import { COLORS } from '../../tokens/colors';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTodayCard } from '../../hooks/useTodayCard';
import { useGamification } from '../../hooks/useGamification';
import { useCourses } from '../../hooks/useCourses';

// AI 활용 추천 배움 카드
const MOCK_LEARNING_CARDS = [
  {
    id: '1',
    title: 'AI로 손주에게 보낼 생일 메시지 만들기',
    tldr: 'ChatGPT를 활용해 따뜻하고 감동적인 생일 축하 메시지를 작성하는 방법을 배워요.',
    category: 'ai_creative',
    duration: 4,
    emoji: '🎂',
    completed: false,
  },
  {
    id: '2',
    title: 'AI와 함께 여행 계획 세우기',
    tldr: 'AI의 도움을 받아 가족 여행지 추천부터 일정 계획까지 쉽게 만들어요.',
    category: 'ai_lifestyle',
    duration: 5,
    emoji: '✈️',
    completed: false,
  },
  {
    id: '3',
    title: 'AI로 건강 증상 미리 확인하기',
    tldr: '병원 가기 전 AI에게 증상을 물어보고 어느 과에 가야 할지 알아봐요.',
    category: 'ai_health',
    duration: 3,
    emoji: '🏥',
    completed: false,
  },
  {
    id: '4',
    title: '우울할 때 AI와 대화하기',
    tldr: '마음이 힘들 때 AI 도우미와 대화하며 위로받는 방법을 배워요.',
    category: 'ai_wellness',
    duration: 4,
    emoji: '😊',
    completed: false,
  },
  {
    id: '5',
    title: 'AI로 재미있는 소설 만들기',
    tldr: 'AI와 함께 나만의 이야기를 창작하고 가족에게 들려주는 방법을 알아봐요.',
    category: 'ai_creative',
    duration: 5,
    emoji: '📖',
    completed: false,
  },
];

const ACTIVE_COURSE_KEY = '@active_course';

export const HomeAScreen = () => {
  const navigation = useNavigation<any>();
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  // 오늘의 카드 데이터
  const { data: todayCard, isLoading: cardLoading, error: cardError, refetch: refetchCard } = useTodayCard();
  
  // 게임화 통계
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGamification();

  // 강좌 목록
  const { courses, isLoading: coursesLoading, error: coursesError } = useCourses();

  // 활성 강좌 로드
  const loadActiveCourse = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(ACTIVE_COURSE_KEY);
      if (stored) {
        setActiveCourse(JSON.parse(stored));
      } else {
        setActiveCourse(null);
      }
    } catch (error) {
      console.error('Failed to load active course:', error);
    } finally {
      setLoadingCourse(false);
    }
  }, []);

  useEffect(() => {
    loadActiveCourse();
  }, [loadActiveCourse]);

  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCard(), refetchStats(), loadActiveCourse()]);
    setRefreshing(false);
  }, [refetchCard, refetchStats, loadActiveCourse]);

  const handleStartLearning = async () => {
    // 활성 강좌가 있으면 해당 강좌로, 없으면 랜덤 선택
    if (activeCourse) {
      navigation.navigate('CourseDetail', { courseId: activeCourse.id });
    } else if (courses && courses.length > 0) {
      // 랜덤 강좌 선택
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      const newActiveCourse = {
        id: randomCourse.id,
        title: randomCourse.title,
        thumbnail: randomCourse.thumbnail,
        description: randomCourse.description,
        total_lectures: randomCourse.total_lectures,
        completed_lectures: 0,
        last_watched_lecture: 0,
        started_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem(ACTIVE_COURSE_KEY, JSON.stringify(newActiveCourse));
      setActiveCourse(newActiveCourse);
      navigation.navigate('CourseDetail', { courseId: randomCourse.id });
    } else {
      console.log('학습 시작:', todayCard?.id);
    }
  };

  const handleExpenseTracker = () => {
    navigation.navigate('ExpenseTracker');
  };

  const handleMapNavigator = () => {
    navigation.navigate('MapNavigator');
  };

  const handleGovSupport = () => {
    navigation.navigate('GovSupport');
  };

  const handleTodoMemo = () => {
    navigation.navigate('TodoMemo');
  };

  const handleScamCheck = () => {
    navigation.navigate('ScamCheck');
  };

  const handleMedCheck = () => {
    navigation.navigate('MedCheck');
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <AppHeader title="AI 배움터" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.md }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 인사말 섹션 */}
        <View style={styles.greetingSection}>
          <Text style={[styles.headerLabel, { fontSize: fontSizes.body, color: textSecondary }]}>
            안녕하세요 👋
          </Text>
          <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: textPrimary }]}>
            {user?.name || '회원'}님, 오늘도 화이팅!
          </Text>
        </View>

        {/* 학습 통계 카드 */}
        <View style={[styles.statsContainer, { backgroundColor: COLORS.primary.main }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { fontSize: fontSizes.caption, color: 'rgba(255,255,255,0.8)' }]}>
              포인트
            </Text>
            <Text style={[styles.statValue, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
              {statsLoading ? '...' : (stats?.points || 0)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { fontSize: fontSizes.caption, color: 'rgba(255,255,255,0.8)' }]}>
              연속 학습
            </Text>
            <Text style={[styles.statValue, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
              {statsLoading ? '...' : (stats?.streak || 0)}일
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { fontSize: fontSizes.caption, color: 'rgba(255,255,255,0.8)' }]}>
              레벨
            </Text>
            <Text style={[styles.statValue, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
              Lv.{statsLoading ? '.' : (stats?.level || 1)}
            </Text>
          </View>
        </View>

        {/* 오늘의 학습 카드 */}
        <View style={[styles.cardContainer, { backgroundColor: cardBg }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardCategory, { fontSize: fontSizes.caption, color: COLORS.primary.main }]}>
              📚 오늘의 학습
            </Text>
            <Text style={[styles.cardDuration, { fontSize: fontSizes.caption, color: textSecondary }]}>
              약 3분
            </Text>
          </View>

          {cardLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary.main} style={{ marginVertical: 40 }} />
          ) : cardError ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary }]}>
                오늘의 카드를 불러올 수 없어요.{'\n'}새로고침 해주세요.
              </Text>
            </View>
          ) : todayCard ? (
            <>
              <Text style={[styles.cardTitle, { fontSize: fontSizes.heading1, color: textPrimary }]}>
                {todayCard.payload?.title || '오늘의 학습'}
              </Text>
              <Text style={[styles.cardDescription, { fontSize: fontSizes.body, color: textSecondary }]} numberOfLines={3}>
                {todayCard.payload?.tldr || 'AI와 디지털 세상에 대해 배워보세요.'}
              </Text>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary }]}>
                오늘의 학습 카드가 준비되지 않았어요.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, { backgroundColor: COLORS.primary.main, height: buttonHeight }]}
            onPress={handleStartLearning}
            accessibilityLabel={activeCourse ? "이어서 학습하기" : "학습 시작하기"}
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { fontSize: fontSizes.body }]}>
              {activeCourse ? '📖 이어서 학습' : '📝 학습 시작'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 강좌 섹션 */}
        <View style={styles.coursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary }]}>
              🎓 강좌 더보기
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
              <Text style={[styles.seeAllText, { fontSize: fontSizes.body, color: COLORS.primary.main }]}>
                전체보기 →
              </Text>
            </TouchableOpacity>
          </View>
          
          {coursesLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary.main} style={{ marginVertical: 20 }} />
          ) : coursesError ? (
            <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary, textAlign: 'center' }]}>
              강좌를 불러올 수 없어요
            </Text>
          ) : courses && courses.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: spacing.md }}
            >
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseCard,
                    {
                      backgroundColor: cardBg,
                      width: 180,
                      marginRight: spacing.md,
                      padding: spacing.md,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                    },
                  ]}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                  accessibilityLabel={`${course.title} 강좌 보기`}
                >
                  <Text style={{ fontSize: 40, marginBottom: spacing.sm }}>{course.thumbnail}</Text>
                  <Text 
                    style={[styles.courseTitle, { fontSize: fontSizes.body, color: textPrimary, fontWeight: '600' }]}
                    numberOfLines={2}
                  >
                    {course.title}
                  </Text>
                  <Text 
                    style={[styles.courseDesc, { fontSize: fontSizes.small, color: textSecondary, marginTop: spacing.xs }]}
                    numberOfLines={2}
                  >
                    {course.description}
                  </Text>
                  <Text style={[styles.courseLectures, { fontSize: fontSizes.caption, color: COLORS.primary.main, marginTop: spacing.sm }]}>
                    📚 총 {course.total_lectures}강
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary, textAlign: 'center' }]}>
              준비된 강좌가 없어요
            </Text>
          )}
        </View>

        {/* 추천 배움 카드 목록 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginTop: spacing.lg }]}>
          💡 추천 배움
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: spacing.md }}
        >
          {MOCK_LEARNING_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.learningCard,
                {
                  backgroundColor: cardBg,
                  width: 200,
                  marginRight: spacing.md,
                  padding: spacing.md,
                  borderRadius: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: card.completed ? '#10B981' : COLORS.primary.main,
                },
              ]}
              onPress={() => console.log('학습 카드:', card.id)}
              accessibilityLabel={`${card.title} 학습하기`}
            >
              <View style={styles.learningCardHeader}>
                <Text style={{ fontSize: fontSizes.heading1 }}>{card.emoji}</Text>
                {card.completed && (
                  <Text style={[styles.completedBadge, { fontSize: fontSizes.caption }]}>✅ 완료</Text>
                )}
              </View>
              <Text 
                style={[styles.learningCardTitle, { fontSize: fontSizes.body, color: textPrimary, marginTop: spacing.sm }]}
                numberOfLines={2}
              >
                {card.title}
              </Text>
              <Text 
                style={[styles.learningCardDesc, { fontSize: fontSizes.small, color: textSecondary, marginTop: spacing.xs }]}
                numberOfLines={2}
              >
                {card.tldr}
              </Text>
              <Text style={[styles.learningCardDuration, { fontSize: fontSizes.caption, color: textSecondary, marginTop: spacing.sm }]}>
                ⏱️ {card.duration}분
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 빠른 메뉴 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginTop: spacing.lg }]}>
          빠른 메뉴
        </Text>
        <View style={styles.quickMenu}>
          <TouchableOpacity
            style={[styles.quickMenuItem, { backgroundColor: cardBg }]}
            onPress={handleExpenseTracker}
            accessibilityLabel="생활요금 체크"
          >
            <Text style={styles.quickMenuIcon}>💰</Text>
            <Text style={[styles.quickMenuText, { fontSize: fontSizes.body, color: textPrimary }]}>생활요금 체크</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickMenuItem, { backgroundColor: cardBg }]}
            onPress={handleMapNavigator}
            accessibilityLabel="길찾기 도우미"
          >
            <Text style={styles.quickMenuIcon}>🗺️</Text>
            <Text style={[styles.quickMenuText, { fontSize: fontSizes.body, color: textPrimary }]}>길찾기 도우미</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickMenuItem, { backgroundColor: cardBg }]}
            onPress={handleGovSupport}
            accessibilityLabel="정부 지원금"
          >
            <Text style={styles.quickMenuIcon}>🏛️</Text>
            <Text style={[styles.quickMenuText, { fontSize: fontSizes.body, color: textPrimary }]}>정부 지원금</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickMenuItem, { backgroundColor: cardBg }]}
            onPress={handleTodoMemo}
            accessibilityLabel="할일 메모장"
          >
            <Text style={styles.quickMenuIcon}>📝</Text>
            <Text style={[styles.quickMenuText, { fontSize: fontSizes.body, color: textPrimary }]}>할일 메모장</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickMenuItem, { backgroundColor: cardBg }]}
            onPress={handleScamCheck}
            accessibilityLabel="사기 검사"
          >
            <Text style={styles.quickMenuIcon}>🛡️</Text>
            <Text style={[styles.quickMenuText, { fontSize: fontSizes.body, color: textPrimary }]}>사기 검사</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickMenuItem, { backgroundColor: cardBg }]}
            onPress={handleMedCheck}
            accessibilityLabel="복약 체크"
          >
            <Text style={styles.quickMenuIcon}>💊</Text>
            <Text style={[styles.quickMenuText, { fontSize: fontSizes.body, color: textPrimary }]}>복약 체크</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickMenuItem, { backgroundColor: cardBg }]}
            onPress={() => navigation.navigate('AIConsult')}
            accessibilityLabel="AI에게 맞춤 상담 받기"
          >
            <Text style={styles.quickMenuIcon}>🤖</Text>
            <Text style={[styles.quickMenuText, { fontSize: fontSizes.body, color: textPrimary }]}>AI 맞춤 상담</Text>
          </TouchableOpacity>
        </View>

        {/* 최근 활동 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginTop: spacing.lg }]}>
          최근 활동
        </Text>
        <View style={[styles.recentActivity, { backgroundColor: cardBg }]}>
          {stats?.badges && stats.badges.length > 0 ? (
            stats.badges.slice(0, 3).map((badge, index) => (
              <View key={index} style={styles.activityItem}>
                <Text style={styles.activityIcon}>🏆</Text>
                <Text style={[styles.activityText, { fontSize: fontSizes.body, color: textPrimary }]}>
                  {badge} 배지 획득!
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary, textAlign: 'center', padding: 20 }]}>
              아직 활동 기록이 없어요.{'\n'}학습을 시작해 보세요! 🎯
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  greetingSection: {
    marginBottom: 20,
  },
  headerLabel: {
    marginBottom: 4,
  },
  headerTitle: {
    fontWeight: '700',
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontWeight: '600',
  },
  coursesSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  courseCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  courseTitle: {
    marginBottom: 8,
  },
  courseDesc: {
    lineHeight: 18,
  },
  courseLectures: {
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '700',
  },
  cardContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardCategory: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardDuration: {
    fontWeight: '500',
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  cardDescription: {
    lineHeight: 24,
    marginBottom: 16,
  },
  cardProgress: {
    fontWeight: '600',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  quickMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickMenuItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickMenuIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickMenuText: {
    fontWeight: '600',
  },
  recentActivity: {
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
  },
  learningCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  learningCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedBadge: {
    color: '#10B981',
    fontWeight: '600',
  },
  learningCardTitle: {
    fontWeight: '600',
    lineHeight: 22,
  },
  learningCardDesc: {
    lineHeight: 18,
  },
  learningCardDuration: {},
});
