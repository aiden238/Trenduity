import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../tokens/colors';
import { 
  useMonthlyExpenses, 
  useAddExpense, 
  useUpdateExpense, 
  useDeleteExpense,
  useAnalyzeExpenses,
  ExpenseCategory,
  CATEGORY_LABELS,
} from '../../hooks/useExpenses';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 현재 월 가져오기 (YYYY-MM 형식)
const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// 기본 지출 항목
interface ExpenseCategoryUI {
  id: ExpenseCategory;
  name: string;
  icon: string;
  color: string;
}

interface LocalExpenseRecord {
  categoryId: string;
  amount: number;
  note?: string;
}

const EXPENSE_CATEGORIES: ExpenseCategoryUI[] = [
  { id: 'rent', name: '월세', icon: '🏠', color: '#EF4444' },
  { id: 'mortgage', name: '담보이자', icon: '🏦', color: '#F59E0B' },
  { id: 'maintenance', name: '관리비', icon: '🔧', color: '#10B981' },
  { id: 'electricity', name: '전기비', icon: '⚡', color: '#3B82F6' },
  { id: 'gas', name: '가스비', icon: '🔥', color: '#8B5CF6' },
  { id: 'water', name: '수도비', icon: '💧', color: '#06B6D4' },
  { id: 'telecom', name: '통신비', icon: '📱', color: '#EC4899' },
  { id: 'tv', name: 'TV요금', icon: '📺', color: '#6366F1' },
  { id: 'insurance', name: '보험비', icon: '🛡️', color: '#14B8A6' },
  { id: 'loan', name: '대출금', icon: '💳', color: '#F97316' },
  { id: 'transport', name: '교통비', icon: '🚌', color: '#84CC16' },
  { id: 'food', name: '식비', icon: '🍚', color: '#A855F7' },
];

export const ExpenseTrackerScreen = () => {
  const navigation = useNavigation<any>();
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();

  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  // 현재 월
  const [currentMonth] = useState(getCurrentMonth());
  
  // BFF 연동 훅
  const { data: expenseData, isLoading, error, refetch } = useMonthlyExpenses(currentMonth);
  const addExpenseMutation = useAddExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();
  const analyzeExpensesMutation = useAnalyzeExpenses();

  // 로컬 상태 (UI용)
  const [localExpenses, setLocalExpenses] = useState<LocalExpenseRecord[]>([]);
  const [otherExpenses, setOtherExpenses] = useState<{ name: string; amount: number }[]>([]);
  const [showAddOther, setShowAddOther] = useState(false);
  const [newOtherName, setNewOtherName] = useState('');
  const [newOtherAmount, setNewOtherAmount] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ analysis: string; tips: string[] } | null>(null);
  
  // 서버 데이터 -> 로컬 상태 동기화
  useEffect(() => {
    if (expenseData?.expenses) {
      const mapped = expenseData.expenses.map(e => ({
        categoryId: e.category,
        amount: e.amount,
        note: e.note,
      }));
      setLocalExpenses(mapped);
      
      // 기타 항목 분리
      const others = expenseData.expenses
        .filter(e => e.category === 'other' && e.note)
        .map(e => ({ name: e.note!, amount: e.amount }));
      setOtherExpenses(others);
    }
  }, [expenseData]);

  // 이전 달 데이터
  const lastMonthTotal = expenseData?.summary?.previous_month_total || 0;

  // 현재 달 총액 계산
  const currentTotal = useMemo(() => {
    const categoryTotal = localExpenses.reduce((sum, e) => sum + e.amount, 0);
    const otherTotal = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
    return categoryTotal + otherTotal;
  }, [localExpenses, otherExpenses]);

  // 증감률 계산
  const changePercent = useMemo(() => {
    if (lastMonthTotal === 0) return 0;
    return Math.round(((currentTotal - lastMonthTotal) / lastMonthTotal) * 100);
  }, [currentTotal, lastMonthTotal]);

  // 금액 포맷
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  // 카테고리 금액 업데이트 (BFF 연동)
  const handleUpdateCategory = async (categoryId: string, amount: number) => {
    try {
      await addExpenseMutation.mutateAsync({
        month: currentMonth,
        category: categoryId as ExpenseCategory,
        amount,
      });
      
      // 로컬 상태 업데이트
      setLocalExpenses(prev => {
        const existing = prev.find(e => e.categoryId === categoryId);
        if (existing) {
          return prev.map(e => e.categoryId === categoryId ? { ...e, amount } : e);
        }
        return [...prev, { categoryId, amount }];
      });
    } catch (error) {
      Alert.alert('오류', '저장하지 못했어요. 다시 시도해주세요.');
    }
    setEditingCategory(null);
    setEditingAmount('');
  };

  // 기타 항목 추가 (BFF 연동)
  const handleAddOther = async () => {
    if (!newOtherName.trim() || !newOtherAmount.trim()) {
      Alert.alert('알림', '항목 이름과 금액을 모두 입력해주세요.');
      return;
    }
    
    try {
      await addExpenseMutation.mutateAsync({
        month: currentMonth,
        category: 'other' as ExpenseCategory,
        amount: parseInt(newOtherAmount) || 0,
        note: newOtherName.trim(),
      });
      
      setOtherExpenses(prev => [...prev, {
        name: newOtherName.trim(),
        amount: parseInt(newOtherAmount) || 0,
      }]);
    } catch (error) {
      Alert.alert('오류', '저장하지 못했어요. 다시 시도해주세요.');
    }
    
    setNewOtherName('');
    setNewOtherAmount('');
    setShowAddOther(false);
  };

  // AI 분석 요청 (BFF 연동)
  const handleAnalyzeExpenses = async () => {
    try {
      const result = await analyzeExpensesMutation.mutateAsync(currentMonth);
      setAnalysisResult({ analysis: result.analysis, tips: result.tips });
      setShowAnalysis(true);
    } catch (error) {
      Alert.alert('오류', '분석을 완료하지 못했어요. 다시 시도해주세요.');
    }
  };

  // AI 도움 요청 (채팅으로 이동)
  const handleAskAI = () => {
    const prompt = `저의 이번 달 생활요금 현황입니다:\n\n${
      localExpenses.map(e => {
        const cat = EXPENSE_CATEGORIES.find(c => c.id === e.categoryId);
        return `- ${cat?.name || '항목'}: ${formatAmount(e.amount)}`;
      }).join('\n')
    }\n${
      otherExpenses.map(e => `- ${e.name}: ${formatAmount(e.amount)}`).join('\n')
    }\n\n총 ${formatAmount(currentTotal)}이고, 저번 달보다 ${Math.abs(changePercent)}% ${changePercent > 0 ? '증가' : '감소'}했어요.\n\n생활요금을 줄이는 방법을 알려주세요. 특히 ${
      localExpenses.length > 0 
        ? EXPENSE_CATEGORIES.find(c => c.id === localExpenses.sort((a, b) => b.amount - a.amount)[0]?.categoryId)?.name || '가장 비싼 항목'
        : '전반적인'
    }에 대해 조언해주세요.`;

    navigation.navigate('AIChat', { 
      initialPrompt: prompt,
      modelId: 'expert' // 척척박사 비서
    });
  };

  // 그래프 바 렌더링
  const renderExpenseBar = (category: ExpenseCategoryUI, amount: number, maxAmount: number) => {
    const barWidth = maxAmount > 0 ? (amount / maxAmount) * (SCREEN_WIDTH - 140) : 0;
    
    return (
      <View key={category.id} style={styles.barContainer}>
        <View style={styles.barLabelContainer}>
          <Text style={{ fontSize: 20 }}>{category.icon}</Text>
          <Text style={[styles.barLabel, { fontSize: fontSizes.small, color: textPrimary }]} numberOfLines={1}>
            {category.name}
          </Text>
        </View>
        <View style={styles.barWrapper}>
          <View
            style={[
              styles.bar,
              {
                width: Math.max(barWidth, 4),
                backgroundColor: category.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.barAmount, { fontSize: fontSizes.small, color: textSecondary }]}>
          {amount > 0 ? formatAmount(amount) : '-'}
        </Text>
      </View>
    );
  };

  // 최대 금액 계산 (그래프 스케일용)
  const maxExpenseAmount = useMemo(() => {
    const amounts = localExpenses.map(e => e.amount);
    return Math.max(...amounts, 100000);
  }, [localExpenses]);

  // 로딩 상태
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <Text style={{ marginTop: 16, fontSize: fontSizes.body, color: textSecondary }}>
          지출 내역을 불러오는 중...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: COLORS.primary.main, padding: spacing.lg, paddingTop: spacing.lg + 40 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="뒤로 가기"
        >
          <Text style={{ fontSize: 24, color: '#FFFFFF' }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
          💰 생활요금 체크
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)' }]}>
          이번 달 지출을 한눈에 확인해요
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
      >
        {/* 총액 카드 */}
        <View style={[styles.totalCard, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: 16 }]}>
          <Text style={[styles.totalLabel, { fontSize: fontSizes.body, color: textSecondary }]}>
            📊 이번 달 총 지출
          </Text>
          <Text style={[styles.totalAmount, { fontSize: fontSizes.heading1 * 1.5, color: textPrimary }]}>
            {formatAmount(currentTotal)}
          </Text>
          
          {/* 증감 표시 */}
          {currentTotal > 0 && (
            <View style={[
              styles.changeContainer,
              { backgroundColor: changePercent > 0 ? '#FEE2E2' : '#D1FAE5', padding: spacing.sm, borderRadius: 8, marginTop: spacing.md }
            ]}>
              <Text style={{ fontSize: fontSizes.body, color: changePercent > 0 ? '#DC2626' : '#059669' }}>
                {changePercent > 0 ? '📈' : '📉'} 저번 달보다 {Math.abs(changePercent)}% {changePercent > 0 ? '증가했어요!' : '줄었어요!'}
              </Text>
            </View>
          )}
          
          {/* 생활요금 줄이기 팁 버튼 */}
          {changePercent > 10 && (
            <TouchableOpacity
              style={[styles.tipButton, { backgroundColor: '#FEF3C7', padding: spacing.md, borderRadius: 12, marginTop: spacing.md }]}
              onPress={handleAskAI}
              accessibilityLabel="생활요금 줄이기 팁"
            >
              <Text style={{ fontSize: fontSizes.body, color: '#92400E', fontWeight: '600' }}>
                💡 생활요금 줄이는 Tip 받기
              </Text>
              <Text style={{ fontSize: fontSizes.small, color: '#B45309', marginTop: 4 }}>
                AI 도우미가 절약 방법을 알려드려요!
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 그래프 영역 */}
        <View style={[styles.graphCard, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: 16, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            📊 지출 현황 그래프
          </Text>
          
          {localExpenses.length === 0 ? (
            <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary, textAlign: 'center', padding: spacing.lg }]}>
              아래에서 항목별 금액을 입력하면{'\n'}그래프가 표시됩니다 📝
            </Text>
          ) : (
            <View>
              {EXPENSE_CATEGORIES.map(cat => {
                const expense = localExpenses.find(e => e.categoryId === cat.id);
                return renderExpenseBar(cat, expense?.amount || 0, maxExpenseAmount);
              })}
              {/* 기타 항목 */}
              {otherExpenses.map((other, idx) => (
                <View key={`other-${idx}`} style={styles.barContainer}>
                  <View style={styles.barLabelContainer}>
                    <Text style={{ fontSize: 20 }}>📝</Text>
                    <Text style={[styles.barLabel, { fontSize: fontSizes.small, color: textPrimary }]} numberOfLines={1}>
                      {other.name}
                    </Text>
                  </View>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: Math.max((other.amount / maxExpenseAmount) * (SCREEN_WIDTH - 140), 4),
                          backgroundColor: '#9CA3AF',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barAmount, { fontSize: fontSizes.small, color: textSecondary }]}>
                    {formatAmount(other.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 항목별 입력 */}
        <View style={[styles.inputSection, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: 16, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            ✏️ 항목별 금액 입력
          </Text>
          
          {EXPENSE_CATEGORIES.map(cat => {
            const expense = localExpenses.find(e => e.categoryId === cat.id);
            const isEditing = editingCategory === cat.id;
            
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.inputItem,
                  {
                    backgroundColor: isEditing ? `${cat.color}10` : bgColor,
                    padding: spacing.md,
                    borderRadius: 12,
                    marginBottom: spacing.sm,
                    borderWidth: isEditing ? 2 : 1,
                    borderColor: isEditing ? cat.color : '#E5E7EB',
                  },
                ]}
                onPress={() => {
                  setEditingCategory(cat.id);
                  setEditingAmount(expense?.amount?.toString() || '');
                }}
                accessibilityLabel={`${cat.name} 금액 입력`}
              >
                <View style={styles.inputItemLeft}>
                  <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                  <Text style={[styles.inputItemName, { fontSize: fontSizes.body, color: textPrimary, marginLeft: spacing.sm }]}>
                    {cat.name}
                  </Text>
                </View>
                
                {isEditing ? (
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[
                        styles.amountInput,
                        {
                          fontSize: fontSizes.body,
                          color: textPrimary,
                          borderColor: cat.color,
                          padding: spacing.sm,
                        },
                      ]}
                      keyboardType="numeric"
                      placeholder="금액"
                      placeholderTextColor={textSecondary}
                      value={editingAmount}
                      onChangeText={setEditingAmount}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={[styles.saveButton, { backgroundColor: cat.color, padding: spacing.sm, borderRadius: 8, marginLeft: spacing.sm }]}
                      onPress={() => handleUpdateCategory(cat.id, parseInt(editingAmount) || 0)}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>저장</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={[styles.inputItemAmount, { fontSize: fontSizes.body, color: expense?.amount ? textPrimary : textSecondary }]}>
                    {expense?.amount ? formatAmount(expense.amount) : '입력하기 →'}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}

          {/* 기타 항목들 */}
          {otherExpenses.map((other, idx) => (
            <View
              key={`other-input-${idx}`}
              style={[styles.inputItem, { backgroundColor: bgColor, padding: spacing.md, borderRadius: 12, marginBottom: spacing.sm }]}
            >
              <View style={styles.inputItemLeft}>
                <Text style={{ fontSize: 24 }}>📝</Text>
                <Text style={[styles.inputItemName, { fontSize: fontSizes.body, color: textPrimary, marginLeft: spacing.sm }]}>
                  {other.name}
                </Text>
              </View>
              <Text style={[styles.inputItemAmount, { fontSize: fontSizes.body, color: textPrimary }]}>
                {formatAmount(other.amount)}
              </Text>
            </View>
          ))}

          {/* 기타 항목 추가 버튼 */}
          <TouchableOpacity
            style={[styles.addOtherButton, { backgroundColor: bgColor, padding: spacing.md, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.primary.main }]}
            onPress={() => setShowAddOther(true)}
            accessibilityLabel="기타 항목 추가"
          >
            <Text style={{ fontSize: fontSizes.body, color: COLORS.primary.main, fontWeight: '600' }}>
              ➕ 기타 항목 추가하기
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI 도움 버튼 */}
        {currentTotal > 0 && (
          <TouchableOpacity
            style={[styles.aiHelpButton, { backgroundColor: COLORS.secondary.main, padding: spacing.lg, borderRadius: 16, marginTop: spacing.md }]}
            onPress={handleAskAI}
            accessibilityLabel="AI 도우미에게 물어보기"
          >
            <Text style={{ fontSize: 32, marginBottom: spacing.sm }}>🤖</Text>
            <Text style={{ fontSize: fontSizes.heading2, color: '#FFFFFF', fontWeight: '700' }}>
              생활요금 줄이는 방법 물어보기
            </Text>
            <Text style={{ fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
              AI 도우미가 맞춤 절약 팁을 알려드려요!
            </Text>
          </TouchableOpacity>
        )}

        {/* AI 맞춤 상담 버튼 */}
        <TouchableOpacity
          style={[styles.aiHelpButton, { backgroundColor: COLORS.accent.purple, padding: spacing.lg, borderRadius: 16, marginTop: spacing.md, marginBottom: spacing.xl }]}
          onPress={() => navigation.navigate('AIConsult')}
          accessibilityLabel="AI 맞춤 상담받기"
        >
          <Text style={{ fontSize: 32, marginBottom: spacing.sm }}>🤖</Text>
          <Text style={{ fontSize: fontSizes.heading2, color: '#FFFFFF', fontWeight: '700' }}>
            AI 맞춤 상담
          </Text>
          <Text style={{ fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
            궁금한 것이 있으신가요? AI가 친절하게 답변해드려요!
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 기타 항목 추가 모달 */}
      <Modal
        visible={showAddOther}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddOther(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg, padding: spacing.lg }]}>
            <Text style={[styles.modalTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.lg }]}>
              📝 기타 항목 추가
            </Text>
            
            <Text style={[styles.inputLabel, { fontSize: fontSizes.body, color: textSecondary, marginBottom: spacing.xs }]}>
              항목 이름
            </Text>
            <TextInput
              style={[styles.modalInput, { fontSize: fontSizes.body, color: textPrimary, backgroundColor: bgColor, padding: spacing.md, borderRadius: 12, marginBottom: spacing.md }]}
              placeholder="예: 약값, 용돈"
              placeholderTextColor={textSecondary}
              value={newOtherName}
              onChangeText={setNewOtherName}
            />
            
            <Text style={[styles.inputLabel, { fontSize: fontSizes.body, color: textSecondary, marginBottom: spacing.xs }]}>
              금액
            </Text>
            <TextInput
              style={[styles.modalInput, { fontSize: fontSizes.body, color: textPrimary, backgroundColor: bgColor, padding: spacing.md, borderRadius: 12, marginBottom: spacing.lg }]}
              placeholder="금액을 입력하세요"
              placeholderTextColor={textSecondary}
              keyboardType="numeric"
              value={newOtherAmount}
              onChangeText={setNewOtherAmount}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#E5E7EB', padding: spacing.md, borderRadius: 12, flex: 1, marginRight: spacing.sm }]}
                onPress={() => setShowAddOther(false)}
              >
                <Text style={{ fontSize: fontSizes.body, color: textPrimary, textAlign: 'center', fontWeight: '600' }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.primary.main, padding: spacing.md, borderRadius: 12, flex: 1 }]}
                onPress={handleAddOther}
              >
                <Text style={{ fontSize: fontSizes.body, color: '#FFFFFF', textAlign: 'center', fontWeight: '600' }}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  totalCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalLabel: {},
  totalAmount: {
    fontWeight: '700',
    marginTop: 8,
  },
  changeContainer: {},
  tipButton: {},
  graphCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  emptyText: {},
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  barLabel: {
    marginLeft: 4,
    flex: 1,
  },
  barWrapper: {
    flex: 1,
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  barAmount: {
    width: 80,
    textAlign: 'right',
  },
  inputSection: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputItemName: {
    fontWeight: '500',
  },
  inputItemAmount: {},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    borderWidth: 1,
    borderRadius: 8,
    width: 100,
    textAlign: 'right',
  },
  saveButton: {},
  addOtherButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  aiHelpButton: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  inputLabel: {},
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalButton: {},
});
