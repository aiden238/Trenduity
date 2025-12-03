import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useA11y } from '../../contexts/A11yContext';
import { useMedStatus, useCreateMedCheck } from '../../hooks/useMedCheck';

export const MedCheckScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>복약체크 화면</Text>
    </View>
  );
};

const oldMedCheckScreen = () => {
  const { spacing, buttonHeight, fontSizes } = useA11y();

  const { data: status, isLoading, error } = useMedStatus();
  const checkMutation = useCreateMedCheck();

  const handleCheck = async () => {
    try {
      const result = await checkMutation.mutateAsync();

      if (result.points_added > 0) {
        Alert.alert(
          '복약 체크 완료! 💊',
          `${result.points_added}점을 획득했어요!\n현재 총 포인트: ${result.total_points}점`
        );
      } else {
        Alert.alert('완료', result.message);
      }
    } catch (err: any) {
      Alert.alert('오류', err.message || '복약 체크에 실패했어요.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { padding: spacing.lg }]}>
        <Text style={[styles.errorText, { fontSize: fontSizes.md }]}>
          복약 상태를 불러올 수 없어요. 다시 시도해 주세요.
        </Text>
      </View>
    );
  }

  const todayChecked = status?.last_7_days?.[0]?.checked || false;

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing.lg }}>
        <Text style={[styles.title, { fontSize: fontSizes.xl }]}>💊 복약 체크</Text>

        <Text
          style={[
            styles.subtitle,
            { fontSize: fontSizes.md, marginTop: spacing.sm, marginBottom: spacing.lg },
          ]}
        >
          매일 약을 먹었는지 기록하세요.
        </Text>

        {/* 오늘 체크 */}
        <View
          style={[
            styles.todayCard,
            {
              padding: spacing.lg,
              borderRadius: spacing.md,
              marginBottom: spacing.lg,
            },
            todayChecked && styles.todayCardChecked,
          ]}
        >
          {todayChecked ? (
            <>
              <Text
                style={[
                  styles.todayTitle,
                  { fontSize: fontSizes.xl, color: '#4CAF50', textAlign: 'center' },
                ]}
              >
                ✅ 오늘 약을 먹었어요!
              </Text>
              <Text
                style={[
                  styles.todayMessage,
                  { fontSize: fontSizes.md, marginTop: spacing.sm, textAlign: 'center' },
                ]}
              >
                잘하셨어요. 내일도 잊지 마세요!
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.todayTitle,
                  { fontSize: fontSizes.xl, textAlign: 'center', marginBottom: spacing.md },
                ]}
              >
                오늘 약 먹으셨나요?
              </Text>
              <Pressable
                style={[
                  styles.checkButton,
                  {
                    height: buttonHeight * 1.5,
                    borderRadius: spacing.sm,
                  },
                  checkMutation.isPending && styles.buttonDisabled,
                ]}
                onPress={handleCheck}
                disabled={checkMutation.isPending}
                accessibilityRole="button"
                accessibilityLabel="오늘 약 먹기 체크하기"
              >
                {checkMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={[styles.checkButtonText, { fontSize: fontSizes.lg }]}>
                    네, 먹었어요!
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </View>

        {/* 최근 7일 */}
        <Text style={[styles.sectionTitle, { fontSize: fontSizes.lg, marginBottom: spacing.md }]}>
          📅 최근 7일
        </Text>

        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          {status?.last_7_days?.map((day) => {
            const dayOfMonth = new Date(day.date).getDate();
            return (
              <View
                key={day.date}
                style={[
                  styles.dayBox,
                  {
                    flex: 1,
                    padding: spacing.sm,
                    borderRadius: spacing.sm,
                  },
                ]}
              >
                <Text style={[styles.dayDate, { fontSize: fontSizes.sm }]}>{dayOfMonth}일</Text>
                <Text style={[styles.dayIcon, { fontSize: fontSizes.xl }]}>
                  {day.checked ? '✅' : '⭕'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* 이번 달 통계 */}
        {status?.total_this_month !== undefined && (
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: '#E8F5E9',
                padding: spacing.md,
                borderRadius: spacing.sm,
                marginTop: spacing.lg,
              },
            ]}
          >
            <Text style={[styles.statsText, { fontSize: fontSizes.md, textAlign: 'center' }]}>
              🗓️ 이번 달: {status.total_this_month}일 체크했어요!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#212121',
  },
  subtitle: {
    color: '#666',
    lineHeight: 22,
  },
  todayCard: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  todayCardChecked: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  todayTitle: {
    fontWeight: '700',
  },
  todayMessage: {
    color: '#424242',
  },
  checkButton: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#212121',
  },
  dayBox: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  dayDate: {
    color: '#666',
    marginBottom: 4,
  },
  dayIcon: {
    textAlign: 'center',
  },
  statsCard: {
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  statsText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
});
