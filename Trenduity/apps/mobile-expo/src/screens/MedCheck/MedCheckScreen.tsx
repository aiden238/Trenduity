import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../tokens/colors';

// 로컬 목업 상태
interface DayStatus {
  date: string;
  checked: boolean;
}

export const MedCheckScreen = () => {
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const { activeTheme, colors } = useTheme();
  const { accessToken } = useAuth();
  
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#FFFFFF';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#F5F5F5';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#212121';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#666666';
  
  const BFF_URL = process.env.EXPO_PUBLIC_BFF_API_URL || 'https://trenduity-bff.onrender.com';

  // 로컬 목업 상태 (실제 API 연동 전까지 사용)
  const [todayChecked, setTodayChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalThisMonth, setTotalThisMonth] = useState(5);
  
  // 최근 7일 목업 데이터
  const [last7Days, setLast7Days] = useState<DayStatus[]>(() => {
    const days: DayStatus[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        checked: i > 0 ? Math.random() > 0.3 : false, // 오늘은 체크 안 함
      });
    }
    return days;
  });

  const handleCheck = async () => {
    setIsLoading(true);
    
    try {
      // 실제 API 호출 시도
      const response = await fetch(`${BFF_URL}/v1/med/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setTodayChecked(true);
        setTotalThisMonth(prev => prev + 1);
        
        // 오늘 날짜 업데이트
        setLast7Days(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1].checked = true;
          }
          return updated;
        });
        
        const points = data.data?.points_added || 10;
        Alert.alert(
          '복약 체크 완료! 💊',
          `${points}점을 획득했어요!`
        );
      } else {
        // API 실패 시 로컬에서만 처리
        throw new Error(data.error?.message);
      }
    } catch (error) {
      // 네트워크 오류 시 로컬 목업으로 처리
      console.log('Using local mock for med check');
      setTodayChecked(true);
      setTotalThisMonth(prev => prev + 1);
      
      setLast7Days(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].checked = true;
        }
        return updated;
      });
      
      Alert.alert(
        '복약 체크 완료! 💊',
        '10점을 획득했어요! (오프라인 모드)'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: '#4CAF50', padding: spacing.lg, paddingTop: spacing.lg + 40 }]}>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
          💊 복약 체크
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)' }]}>
          매일 약을 먹었는지 기록하세요
        </Text>
      </View>

      <View style={{ padding: spacing.lg }}>
        {/* 오늘 체크 카드 */}
        <View
          style={[
            styles.todayCard,
            {
              backgroundColor: todayChecked ? '#E8F5E9' : cardBg,
              padding: spacing.lg,
              borderRadius: 16,
              marginBottom: spacing.lg,
              borderWidth: 2,
              borderColor: todayChecked ? '#4CAF50' : '#E0E0E0',
            },
          ]}
        >
          {todayChecked ? (
            <>
              <Text style={[styles.todayEmoji, { fontSize: fontSizes.heading1 * 2, textAlign: 'center' }]}>
                ✅
              </Text>
              <Text
                style={[
                  styles.todayTitle,
                  { fontSize: fontSizes.heading1, color: '#4CAF50', textAlign: 'center', marginTop: spacing.sm },
                ]}
              >
                오늘 약을 먹었어요!
              </Text>
              <Text
                style={[
                  styles.todayMessage,
                  { fontSize: fontSizes.body, color: textSecondary, marginTop: spacing.sm, textAlign: 'center' },
                ]}
              >
                잘하셨어요. 내일도 잊지 마세요! 💪
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.todayEmoji, { fontSize: fontSizes.heading1 * 2, textAlign: 'center' }]}>
                💊
              </Text>
              <Text
                style={[
                  styles.todayTitle,
                  { fontSize: fontSizes.heading1, color: textPrimary, textAlign: 'center', marginTop: spacing.sm },
                ]}
              >
                오늘 약 먹으셨나요?
              </Text>
              <Pressable
                style={[
                  styles.checkButton,
                  {
                    backgroundColor: '#4CAF50',
                    height: buttonHeight * 1.3,
                    borderRadius: 12,
                    marginTop: spacing.lg,
                  },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleCheck}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="오늘 약 먹기 체크하기"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={[styles.checkButtonText, { fontSize: fontSizes.body }]}>
                    네, 먹었어요!
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </View>

        {/* 최근 7일 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
          📅 최근 7일
        </Text>

        <View style={[styles.daysContainer, { backgroundColor: cardBg, padding: spacing.md, borderRadius: 12 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {last7Days.map((day, index) => {
              const date = new Date(day.date);
              const dayOfMonth = date.getDate();
              const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
              const dayName = dayNames[date.getDay()];
              const isToday = index === last7Days.length - 1;
              
              return (
                <View
                  key={day.date}
                  style={[
                    styles.dayBox,
                    {
                      padding: spacing.sm,
                      borderRadius: 8,
                      alignItems: 'center',
                      backgroundColor: isToday ? (todayChecked ? '#E8F5E9' : '#FFF3E0') : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.dayName, { fontSize: fontSizes.caption, color: textSecondary }]}>
                    {dayName}
                  </Text>
                  <Text style={[styles.dayDate, { fontSize: fontSizes.small, color: textPrimary, fontWeight: '600' }]}>
                    {dayOfMonth}
                  </Text>
                  <Text style={[styles.dayIcon, { fontSize: fontSizes.heading2, marginTop: 4 }]}>
                    {day.checked ? '✅' : '⭕'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 이번 달 통계 */}
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: '#E8F5E9',
              padding: spacing.lg,
              borderRadius: 12,
              marginTop: spacing.lg,
            },
          ]}
        >
          <Text style={[styles.statsTitle, { fontSize: fontSizes.body, color: '#2E7D32', textAlign: 'center' }]}>
            🗓️ 이번 달 복약 현황
          </Text>
          <Text style={[styles.statsValue, { fontSize: fontSizes.heading1 * 1.5, color: '#1B5E20', textAlign: 'center', fontWeight: '700', marginTop: spacing.sm }]}>
            {totalThisMonth}일
          </Text>
          <Text style={[styles.statsSubtext, { fontSize: fontSizes.small, color: '#388E3C', textAlign: 'center', marginTop: spacing.xs }]}>
            꾸준히 잘하고 계세요! 👏
          </Text>
        </View>

        {/* 팁 */}
        <View style={[styles.tipBox, { backgroundColor: '#FFF8E1', padding: spacing.md, borderRadius: 12, marginTop: spacing.lg }]}>
          <Text style={[styles.tipText, { fontSize: fontSizes.body, color: '#F57C00' }]}>
            💡 팁: 매일 같은 시간에 약을 먹으면 잊어버리지 않아요!
          </Text>
        </View>

        {/* AI 맞춤 상담 */}
        <TouchableOpacity
          style={[styles.aiHelpButton, { backgroundColor: COLORS.accent.purple, padding: spacing.lg, borderRadius: 16, marginTop: spacing.md, marginBottom: spacing.xl }]}
          onPress={() => navigation.navigate('AIConsult')}
          accessibilityLabel="AI 맞춤 상담받기"
          accessibilityHint="AI와 대화하며 궁금한 점을 물어볼 수 있어요"
        >
          <Text style={{ fontSize: 32, marginBottom: spacing.sm }}>🤖</Text>
          <Text style={{ fontSize: fontSizes.heading2, color: '#FFFFFF', fontWeight: '700', marginBottom: 4 }}>
            AI 맞춤 상담
          </Text>
          <Text style={{ fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
            궁금한 것이 있으신가요? AI가 친절하게 답변해드려요!
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  todayCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayEmoji: {},
  todayTitle: {
    fontWeight: '700',
  },
  todayMessage: {},
  checkButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  checkButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  sectionTitle: {
    fontWeight: '600',
  },
  daysContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dayBox: {},
  dayName: {},
  dayDate: {},
  dayIcon: {},
  statsCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statsTitle: {},
  statsValue: {},
  statsSubtext: {},
  tipBox: {},
  tipText: {
    lineHeight: 22,
  },
});
