import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// TODO: DateTimePicker는 Development Build에서만 동작
// import DateTimePicker from '@react-native-community/datetimepicker';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../tokens/colors';
import {
  useTodos,
  useCreateTodo,
  useToggleTodo,
  useDeleteTodo,
  useUpdateReminder,
  TodoFilter,
  TodoItem as ApiTodoItem,
} from '../../hooks/useTodos';

// TODO: expo-notifications는 Development Build에서만 동작
// 현재는 알림 기능 비활성화 (추후 EAS Build로 활성화 예정)
const NOTIFICATIONS_ENABLED = false;

// 로컬 할일 타입 (Date 객체 사용)
interface LocalTodoItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  reminderTime?: Date;
  isCompleted: boolean;
  createdAt: Date;
  notificationId?: string;
}

// API 응답을 로컬 타입으로 변환
const toLocalTodo = (apiTodo: ApiTodoItem): LocalTodoItem => ({
  id: apiTodo.id,
  title: apiTodo.title,
  description: apiTodo.description,
  dueDate: apiTodo.due_date ? new Date(apiTodo.due_date) : undefined,
  reminderTime: apiTodo.reminder_time ? new Date(apiTodo.reminder_time) : undefined,
  isCompleted: apiTodo.is_completed,
  createdAt: new Date(apiTodo.created_at),
  notificationId: apiTodo.notification_id,
});

export const TodoMemoScreen = () => {
  const navigation = useNavigation<any>();
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();

  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  // 필터 상태
  const [filter, setFilter] = useState<TodoFilter>('all');
  
  // BFF 연동 훅
  const { data: todoData, isLoading, error, refetch } = useTodos(filter);
  const createTodoMutation = useCreateTodo();
  const toggleTodoMutation = useToggleTodo();
  const deleteTodoMutation = useDeleteTodo();
  const updateReminderMutation = useUpdateReminder();
  
  // 새로고침 상태
  const [refreshing, setRefreshing] = useState(false);
  
  // 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState<Date | undefined>();
  const [newReminderTime, setNewReminderTime] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // 알림 권한 요청
  useEffect(() => {
    registerForPushNotifications();
  }, []);
  
  // 새로고침 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // TODO: 알림 기능은 Development Build에서 활성화 예정
  const registerForPushNotifications = async () => {
    // 현재 비활성화 - EAS Build 후 활성화
    console.log('알림 기능은 Development Build에서 사용 가능합니다');
  };

  // 알림 예약 (Development Build에서 활성화 예정)
  const scheduleNotification = async (title: string, reminderTime: Date): Promise<string | undefined> => {
    // 현재 비활성화 - 알림 ID 없이 undefined 반환
    console.log(`알림 예약 예정: ${title} at ${reminderTime}`);
    return undefined;
  };

  // 알림 취소 (Development Build에서 활성화 예정)
  const cancelNotification = async (notificationId?: string) => {
    // 현재 비활성화
    if (notificationId) {
      console.log(`알림 취소 예정: ${notificationId}`);
    }
  };

  // 할일 추가 (BFF 연동)
  const handleAddTodo = async () => {
    if (!newTitle.trim()) {
      Alert.alert('알림', '할일을 입력해주세요.');
      return;
    }

    try {
      // 로컬 알림 예약
      let notificationId: string | undefined;
      if (newReminderTime) {
        notificationId = await scheduleNotification(newTitle.trim(), newReminderTime);
        if (notificationId) {
          Alert.alert('알림 설정 완료! ⏰', formatDateTime(newReminderTime) + '에 알려드릴게요.');
        }
      }
      
      // BFF에 저장
      await createTodoMutation.mutateAsync({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        due_date: newDueDate?.toISOString(),
        reminder_time: newReminderTime?.toISOString(),
      });
      
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('오류', '할일을 추가하지 못했어요. 다시 시도해주세요.');
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewDueDate(undefined);
    setNewReminderTime(undefined);
  };

  // 할일 완료 토글 (BFF 연동)
  const toggleComplete = async (id: string, currentCompleted: boolean) => {
    try {
      // 완료로 바꾸면 알림 취소
      const todo = todoData?.todos.find(t => t.id === id);
      if (!currentCompleted && todo?.notification_id) {
        await cancelNotification(todo.notification_id);
      }
      
      await toggleTodoMutation.mutateAsync({
        todoId: id,
        is_completed: !currentCompleted,
      });
    } catch (error) {
      Alert.alert('오류', '상태를 변경하지 못했어요.');
    }
  };

  // 할일 삭제 (BFF 연동)
  const handleDeleteTodo = async (id: string) => {
    try {
      const todo = todoData?.todos.find(t => t.id === id);
      if (todo?.notification_id) {
        await cancelNotification(todo.notification_id);
      }
      
      await deleteTodoMutation.mutateAsync(id);
    } catch (error) {
      Alert.alert('오류', '삭제하지 못했어요.');
    }
  };

  // 날짜/시간 포맷
  const formatDate = (date?: Date | string) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  const formatTime = (date?: Date | string) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (date?: Date | string) => {
    if (!date) return '';
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  // 서버에서 받은 할일 목록
  const todos = todoData?.todos || [];

  // 통계 (서버에서 받은 데이터 사용)
  const stats = {
    total: todoData?.total_count || 0,
    completed: todoData?.completed_count || 0,
    active: todoData?.pending_count || 0,
  };

  // 로딩 상태
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={{ marginTop: 16, fontSize: fontSizes.body, color: textSecondary }}>
          할일 목록을 불러오는 중...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: '#F59E0B', padding: spacing.lg, paddingTop: spacing.lg + 40 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="뒤로 가기"
        >
          <Text style={{ fontSize: 24, color: '#FFFFFF' }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
          📝 할일 메모장
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)' }]}>
          잊지 않도록 알림을 설정하세요
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F59E0B']} />
        }
      >
        {/* 통계 카드 */}
        <View style={[styles.statsCard, { backgroundColor: cardBg, padding: spacing.md, borderRadius: 16, marginBottom: spacing.md }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { fontSize: fontSizes.heading1, color: textPrimary }]}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, { fontSize: fontSizes.small, color: textSecondary }]}>
                전체
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: '#E5E7EB' }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { fontSize: fontSizes.heading1, color: '#F59E0B' }]}>
                {stats.active}
              </Text>
              <Text style={[styles.statLabel, { fontSize: fontSizes.small, color: textSecondary }]}>
                진행중
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: '#E5E7EB' }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { fontSize: fontSizes.heading1, color: '#10B981' }]}>
                {stats.completed}
              </Text>
              <Text style={[styles.statLabel, { fontSize: fontSizes.small, color: textSecondary }]}>
                완료
              </Text>
            </View>
          </View>
        </View>

        {/* 필터 버튼 */}
        <View style={[styles.filterRow, { marginBottom: spacing.md }]}>
          {[
            { id: 'all' as TodoFilter, label: '전체' },
            { id: 'pending' as TodoFilter, label: '진행중' },
            { id: 'completed' as TodoFilter, label: '완료' },
          ].map(f => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterButton,
                {
                  backgroundColor: filter === f.id ? '#F59E0B' : cardBg,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 20,
                  marginRight: spacing.sm,
                },
              ]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={{ fontSize: fontSizes.body, color: filter === f.id ? '#FFFFFF' : textPrimary, fontWeight: '600' }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 할일 목록 */}
        {todos.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: cardBg, padding: spacing.xl, borderRadius: 16 }]}>
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>📋</Text>
            <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary, textAlign: 'center' }]}>
              {filter === 'completed' ? '완료된 할일이 없어요.' : filter === 'pending' ? '진행중인 할일이 없어요.' : '할일을 추가해보세요!'}
            </Text>
          </View>
        ) : (
          todos.map(todo => (
            <TouchableOpacity
              key={todo.id}
              style={[
                styles.todoItem,
                {
                  backgroundColor: cardBg,
                  padding: spacing.md,
                  borderRadius: 16,
                  marginBottom: spacing.sm,
                  opacity: todo.is_completed ? 0.7 : 1,
                  borderLeftWidth: 4,
                  borderLeftColor: todo.is_completed ? '#10B981' : '#F59E0B',
                },
              ]}
              onPress={() => toggleComplete(todo.id, todo.is_completed)}
              onLongPress={() => {
                Alert.alert(
                  '할일 삭제',
                  '이 할일을 삭제할까요?',
                  [
                    { text: '취소', style: 'cancel' },
                    { text: '삭제', style: 'destructive', onPress: () => handleDeleteTodo(todo.id) },
                  ]
                );
              }}
              accessibilityLabel={`${todo.title} ${todo.is_completed ? '완료됨' : '진행중'}`}
            >
              <View style={styles.todoHeader}>
                <View style={[
                  styles.checkbox,
                  {
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: todo.is_completed ? '#10B981' : '#D1D5DB',
                    backgroundColor: todo.is_completed ? '#10B981' : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.sm,
                  },
                ]}>
                  {todo.is_completed && (
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>✓</Text>
                  )}
                </View>
                <View style={styles.todoContent}>
                  <Text
                    style={[
                      styles.todoTitle,
                      {
                        fontSize: fontSizes.body,
                        color: textPrimary,
                        textDecorationLine: todo.is_completed ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {todo.title}
                  </Text>
                  {todo.description && (
                    <Text style={[styles.todoDescription, { fontSize: fontSizes.small, color: textSecondary, marginTop: 4 }]}>
                      {todo.description}
                    </Text>
                  )}
                  <View style={styles.todoMeta}>
                    {todo.due_date && (
                      <Text style={[styles.todoDate, { fontSize: fontSizes.small, color: '#F59E0B', marginTop: spacing.xs }]}>
                        📅 {formatDate(todo.due_date)}
                      </Text>
                    )}
                    {todo.reminder_time && (
                      <Text style={[styles.todoReminder, { fontSize: fontSizes.small, color: '#6366F1', marginTop: spacing.xs, marginLeft: spacing.sm }]}>
                        ⏰ {formatTime(todo.reminder_time)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* 도움말 */}
        <View style={[styles.helpCard, { backgroundColor: '#FEF3C7', padding: spacing.md, borderRadius: 12, marginTop: spacing.md }]}>
          <Text style={{ fontSize: fontSizes.small, color: '#92400E' }}>
            💡 팁: 할일을 탭하면 완료/미완료를 바꿀 수 있어요. 길게 누르면 삭제할 수 있어요.
          </Text>
        </View>
      </ScrollView>

      {/* 추가 버튼 (FAB) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#F59E0B' }]}
        onPress={() => setShowAddModal(true)}
        accessibilityLabel="할일 추가"
      >
        <Text style={{ fontSize: 32, color: '#FFFFFF' }}>+</Text>
      </TouchableOpacity>

      {/* 할일 추가 모달 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg, padding: spacing.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: fontSizes.heading2, color: textPrimary }]}>
                📝 새 할일 추가
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={{ fontSize: 24, color: textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {/* 제목 */}
              <Text style={[styles.inputLabel, { fontSize: fontSizes.body, color: textSecondary, marginTop: spacing.md }]}>
                할일 *
              </Text>
              <TextInput
                style={[styles.textInput, { fontSize: fontSizes.body, color: textPrimary, backgroundColor: bgColor, padding: spacing.md, borderRadius: 12, marginTop: spacing.xs }]}
                placeholder="무엇을 해야 하나요?"
                placeholderTextColor={textSecondary}
                value={newTitle}
                onChangeText={setNewTitle}
                accessibilityLabel="할일 제목 입력"
              />

              {/* 메모 */}
              <Text style={[styles.inputLabel, { fontSize: fontSizes.body, color: textSecondary, marginTop: spacing.md }]}>
                메모 (선택)
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea, { fontSize: fontSizes.body, color: textPrimary, backgroundColor: bgColor, padding: spacing.md, borderRadius: 12, marginTop: spacing.xs }]}
                placeholder="추가 메모를 입력하세요"
                placeholderTextColor={textSecondary}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={3}
              />

              {/* 마감일 */}
              <Text style={[styles.inputLabel, { fontSize: fontSizes.body, color: textSecondary, marginTop: spacing.md }]}>
                📅 마감일 (선택)
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: bgColor, padding: spacing.md, borderRadius: 12, marginTop: spacing.xs }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ fontSize: fontSizes.body, color: newDueDate ? textPrimary : textSecondary }}>
                  {newDueDate ? formatDate(newDueDate) : '날짜 선택하기'}
                </Text>
              </TouchableOpacity>

              {/* 알림 시간 */}
              <Text style={[styles.inputLabel, { fontSize: fontSizes.body, color: textSecondary, marginTop: spacing.md }]}>
                ⏰ 알림 시간 (선택)
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: bgColor, padding: spacing.md, borderRadius: 12, marginTop: spacing.xs }]}
                onPress={() => {
                  if (!newDueDate) {
                    setNewDueDate(new Date());
                  }
                  setShowTimePicker(true);
                }}
              >
                <Text style={{ fontSize: fontSizes.body, color: newReminderTime ? textPrimary : textSecondary }}>
                  {newReminderTime ? formatDateTime(newReminderTime) : '알림 시간 설정하기'}
                </Text>
              </TouchableOpacity>

              {newReminderTime && (
                <View style={[styles.reminderNote, { backgroundColor: '#EEF2FF', padding: spacing.sm, borderRadius: 8, marginTop: spacing.sm }]}>
                  <Text style={{ fontSize: fontSizes.small, color: '#4338CA' }}>
                    📱 이 시간에 휴대폰에 알림이 갈 거예요!
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* 버튼 */}
            <View style={[styles.modalButtons, { marginTop: spacing.lg }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: '#E5E7EB', padding: spacing.md, borderRadius: 12, flex: 1, marginRight: spacing.sm }]}
                onPress={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
              >
                <Text style={{ fontSize: fontSizes.body, color: textPrimary, textAlign: 'center', fontWeight: '600' }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: '#F59E0B', padding: spacing.md, borderRadius: 12, flex: 1 }]}
                onPress={handleAddTodo}
              >
                <Text style={{ fontSize: fontSizes.body, color: '#FFFFFF', textAlign: 'center', fontWeight: '600' }}>추가하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 날짜 선택기 - Development Build에서 활성화 예정 */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '80%' }}>
              <Text style={{ fontSize: fontSizes.heading2, fontWeight: '600', marginBottom: 16 }}>📅 마감일 설정</Text>
              <Text style={{ fontSize: fontSizes.body, color: '#666', marginBottom: 16 }}>
                날짜 선택 기능은 앱 출시 버전에서 지원됩니다.
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8 }}
                onPress={() => {
                  // 기본값: 내일
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(18, 0, 0, 0);
                  setNewDueDate(tomorrow);
                  setShowDatePicker(false);
                  Alert.alert('마감일 설정', '내일 오후 6시로 설정되었습니다.');
                }}
              >
                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '600' }}>내일로 설정</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* 시간 선택기 - Development Build에서 활성화 예정 */}
      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setShowTimePicker(false)}
          >
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '80%' }}>
              <Text style={{ fontSize: fontSizes.heading2, fontWeight: '600', marginBottom: 16 }}>⏰ 알림 시간 설정</Text>
              <Text style={{ fontSize: fontSizes.body, color: '#666', marginBottom: 16 }}>
                시간 선택 기능은 앱 출시 버전에서 지원됩니다.
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8 }}
                onPress={() => {
                  // 기본값: 오늘 저녁 7시 또는 내일 아침 9시
                  const now = new Date();
                  const reminder = new Date();
                  if (now.getHours() >= 19) {
                    reminder.setDate(reminder.getDate() + 1);
                    reminder.setHours(9, 0, 0, 0);
                  } else {
                    reminder.setHours(19, 0, 0, 0);
                  }
                  setNewReminderTime(reminder);
                  if (!newDueDate) {
                    setNewDueDate(reminder);
                  }
                  setShowTimePicker(false);
                  Alert.alert('알림 설정', `${formatDateTime(reminder)}에 알려드릴게요.`);
                }}
              >
                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '600' }}>기본 시간으로 설정</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
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
  backButton: {
    marginBottom: 8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: '700',
  },
  statLabel: {},
  statDivider: {
    width: 1,
    height: 40,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {},
  todoItem: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {},
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontWeight: '600',
  },
  todoDescription: {},
  todoMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  todoDate: {},
  todoReminder: {},
  helpCard: {},
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: '700',
  },
  inputLabel: {},
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reminderNote: {},
  modalButtons: {
    flexDirection: 'row',
  },
  cancelButton: {},
  addButton: {},
});
