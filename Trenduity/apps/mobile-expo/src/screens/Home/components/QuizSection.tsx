import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useA11y } from '../../../contexts/A11yContext';
import { QuizQuestion } from '../../../hooks/useTodayCard';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../../tokens/colors';

interface Props {
  quiz: QuizQuestion[];
  answers: Record<string, number>;
  onAnswerChange: (answers: Record<string, number>) => void;
  mode: 'normal' | 'easy' | 'ultra';
}

/**
 * 퀴즈 섹션 컴포넌트
 * 
 * 기능:
 * - 퀴즈 질문 표시
 * - 선택지 버튼 (큰 터치 영역)
 * - 선택 후 즉시 피드백
 */
export const QuizSection = ({ quiz, answers, onAnswerChange, mode }: Props) => {
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const [scaleAnim] = React.useState(new Animated.Value(1));
  
  const handleSelect = (questionId: string, optionIndex: number, isCorrect: boolean) => {
    // Haptic Feedback
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    // Scale 애니메이션
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onAnswerChange({
      ...answers,
      [questionId]: optionIndex,
    });
  };
  
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={[styles.heading, { fontSize: fontSizes.heading2 }]}>
        📝 이해도 확인
      </Text>
      
      {quiz.map((q, qIndex) => {
        const userAnswer = answers[q.id];
        const hasAnswered = userAnswer !== undefined;
        const isCorrect = hasAnswered && userAnswer === q.correctIndex;
        
        return (
          <View key={q.id} style={{ marginTop: spacing.md }}>
            {/* 질문 */}
            <Text style={[styles.question, { fontSize: fontSizes.body }]}>
              {qIndex + 1}. {q.question}
            </Text>
            
            {/* 선택지 */}
            <View style={{ marginTop: spacing.sm }}>
              {q.options.map((option, index) => {
                const isSelected = userAnswer === index;
                const isCorrectOption = index === q.correctIndex;
                
                // 답변 후 시각적 피드백 색상
                let bgColor = '#F5F5F5';
                let textColor = COLORS.neutral.text.primary;
                if (hasAnswered) {
                  if (isSelected && isCorrect) {
                    bgColor = COLORS.secondary.main;
                    textColor = '#FFFFFF';
                  } else if (isSelected && !isCorrect) {
                    bgColor = COLORS.accent.orange;
                    textColor = '#FFFFFF';
                  }
                } else if (isSelected) {
                  bgColor = COLORS.primary.main;
                  textColor = '#FFFFFF';
                }
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelect(q.id, index, isCorrectOption)}
                    disabled={hasAnswered}
                    activeOpacity={0.7}
                    style={[
                      styles.optionButton,
                      { 
                        marginTop: spacing.xs,
                        minHeight: buttonHeight * 1.2,
                        borderRadius: RADIUS.lg,
                        backgroundColor: bgColor,
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                      }
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${qIndex + 1}번 문제 ${index + 1}번 선택지: ${option}`}
                    accessibilityHint="버튼을 누르면 이 답을 선택합니다"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { fontSize: fontSizes.body, color: textColor }
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* 정답 피드백 */}
            {hasAnswered && (
              <View style={[styles.feedback, { marginTop: spacing.sm, padding: spacing.sm }]}>
                <Text style={[styles.feedbackText, { 
                  fontSize: fontSizes.small,
                  color: isCorrect ? COLORS.status.success : COLORS.status.error,
                }]}>
                  {isCorrect ? '✅ 정답이에요!' : `❌ 정답은 ${q.options[q.correctIndex]}이에요.`}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    color: COLORS.neutral.text.primary,
    fontWeight: '700',
  },
  question: {
    color: COLORS.neutral.text.primary,
    fontWeight: '500',
  },
  optionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  optionText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  feedback: {
    borderRadius: RADIUS.sm,
    backgroundColor: '#F9FAFB',
  },
  feedbackText: {
    fontWeight: '500',
  },
});
