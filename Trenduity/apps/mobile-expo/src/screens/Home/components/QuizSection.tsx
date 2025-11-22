import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Button } from '@repo/ui';
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
  
  const handleSelect = (questionId: string, optionIndex: number) => {
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
                
                return (
                  <Button
                    key={index}
                    mode={mode}
                    variant={isSelected ? 'primary' : 'outline'}
                    onPress={() => handleSelect(q.id, index)}
                    style={{
                      marginTop: spacing / 2,
                      height: buttonHeight,
                      justifyContent: 'center'
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${qIndex + 1}번 문제 ${index + 1}번 선택지: ${option}`}
                    accessibilityHint="버튼을 누르면 이 답을 선택합니다"
                    accessibilityState={{ selected: isSelected }}
                  >
                    {option}
                  </Button>
                );
              })}
            </View>
            
            {/* 즉시 피드백 */}
            {hasAnswered && (
              <View
                style={[
                  styles.feedback,
                  {
                    marginTop: spacing,
                    padding: spacing,
                    backgroundColor: isCorrect ? '#E8F5E9' : '#FFEBEE'
                  }
                ]}
              >
                <Typography variant="caption" mode={mode} style={{ fontSize: fontSizes.caption }}>
                  {isCorrect ? '✅ 정답이에요!' : '❌ 다시 생각해 보세요'}
                </Typography>
              </View>
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
