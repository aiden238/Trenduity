import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Typography, COLORS, SPACING, SHADOWS, RADIUS } from '@repo/ui';
import { useA11y } from '../../../contexts/A11yContext';
import { QuizQuestion } from '../../../hooks/useTodayCard';

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
    <View style={{ marginTop: spacing * 2 }}>
      <Typography variant="heading" mode={mode} style={{ fontSize: fontSizes.heading2 }}>
        📝 이해도 확인
      </Typography>
      
      {quiz.map((q, qIndex) => {
        const userAnswer = answers[q.id];
        const hasAnswered = userAnswer !== undefined;
        const isCorrect = hasAnswered && userAnswer === q.correctIndex;
        
        return (
          <View key={q.id} style={{ marginTop: spacing * 1.5 }}>
            {/* 질문 */}
            <Typography variant="body" mode={mode} style={{ fontSize: fontSizes.body }}>
              {qIndex + 1}. {q.question}
            </Typography>
            
            {/* 선택지 */}
            <View style={{ marginTop: spacing }}>
              {q.options.map((option, index) => {
                const isSelected = userAnswer === index;
                const isCorrectOption = index === q.correctIndex;
                
                // 답변 후 시각적 피드백 색상
                let gradientColors = ['#F5F5F5', '#E8E8E8'];
                if (hasAnswered) {
                  if (isSelected && isCorrect) {
                    gradientColors = [COLORS.secondary.main, COLORS.secondary.light];
                  } else if (isSelected && !isCorrect) {
                    gradientColors = [COLORS.accent.orange, '#FF6B35'];
                  }
                } else if (isSelected) {
                  gradientColors = COLORS.gradients.primary;
                }
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelect(q.id, index, isCorrectOption)}
                    disabled={hasAnswered}
                    activeOpacity={0.7}
                    style={{ 
                      marginTop: spacing / 2,
                      minHeight: buttonHeight * 1.2,
                      borderRadius: RADIUS.lg,
                      overflow: 'hidden',
                      ...SHADOWS.md
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${qIndex + 1}번 문제 ${index + 1}번 선택지: ${option}`}
                    accessibilityHint="버튼을 누르면 이 답을 선택합니다"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <LinearGradient
                      colors={gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: SPACING.lg,
                        paddingVertical: SPACING.md,
                      }}
                    >
                      <Typography
                        variant="body"
                        mode={mode}
                        style={{
                          fontSize: fontSizes.body,
                          color: isSelected || (hasAnswered && isCorrectOption)
                            ? '#FFFFFF' 
                            : COLORS.neutral.text.primary,
                          fontWeight: isSelected ? '600' : '400',
                          textAlign: 'center'
                        }}
                      >
                        {hasAnswered && isSelected && (isCorrect ? '✅ ' : '❌ ')}
                        {option}
                      </Typography>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* 즉시 피드백 */}
            {hasAnswered && (
              <Animated.View
                style={{
                  marginTop: spacing,
                  padding: spacing * 1.5,
                  borderRadius: RADIUS.md,
                  ...SHADOWS.sm,
                  transform: [{ scale: scaleAnim }]
                }}
              >
                <LinearGradient
                  colors={
                    isCorrect 
                      ? [COLORS.secondary.light, COLORS.secondary.main]
                      : [COLORS.accent.orange, '#FF6B35']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    borderRadius: RADIUS.md
                  }}
                />
                <Typography 
                  variant="body" 
                  mode={mode} 
                  style={{ 
                    fontSize: fontSizes.body,
                    color: '#FFFFFF',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}
                >
                  {isCorrect ? '✅ 정답이에요!' : '❌ 다시 생각해 보세요'}
                </Typography>
              </Animated.View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  feedback: {
    borderRadius: 8,
  },
});
