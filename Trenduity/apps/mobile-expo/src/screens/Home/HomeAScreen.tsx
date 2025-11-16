import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Typography, Button, Card } from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';
import { useTTS } from '../../hooks/useTTS';
import { useTodayCard, useCompleteCard } from '../../hooks/useTodayCard';
import { QuizSection } from './components/QuizSection';
import { CompletionModal } from './components/CompletionModal';
import VoiceOverlay from '../../components/VoiceOverlay';

/**
 * 오늘의 카드 화면 (normal/easy 모드)
 * 
 * 기능:
 * - 오늘의 학습 카드 표시
 * - TTS로 카드 내용 읽기
 * - 퀴즈 풀기
 * - 완료 처리 및 게임화
 * - 음성 명령 (플로팅 버튼)
 */
export const HomeAScreen = () => {
  const { mode, spacing, buttonHeight, fontSizes } = useA11y();
  const { speak } = useTTS();
  const { data: card, isLoading, error } = useTodayCard();
  const completeCard = useCompleteCard();
  
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [showVoice, setShowVoice] = useState(false);
  
  // 로딩 상태
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Typography variant="body" mode={mode} style={{ marginTop: spacing }}>
          카드를 불러오는 중이에요...
        </Typography>
      </View>
    );
  }
  
  // 에러 상태
  if (error || !card) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Typography variant="body" mode={mode}>
          카드를 불러올 수 없어요. 😢
        </Typography>
        <Typography variant="caption" mode={mode} style={{ marginTop: spacing }}>
          {error?.message || '잠시 후 다시 시도해 주세요.'}
        </Typography>
      </View>
    );
  }
  
  const { payload, status, type } = card;
  const hasQuiz = payload.quiz && payload.quiz.length > 0;
  const isCompleted = status === 'completed';
  const allQuizAnswered = hasQuiz ? Object.keys(quizAnswers).length >= payload.quiz.length : true;
  
  // 카드 타입 태그
  const typeLabel = type === 'ai_tools' ? '🤖 AI 활용법' 
                  : type === 'digital_safety' ? '🛡️ 디지털 안전'
                  : '💊 건강 정보';
  
  // TTS 핸들러
  const handleTTS = () => {
    const fullText = `${payload.title}. ${payload.tldr}. ${payload.body}. ${payload.impact}`;
    speak(fullText);
  };
  
  // 완료 핸들러
  const handleComplete = async () => {
    try {
      const result = await completeCard.mutateAsync({
        cardId: card.id,
        quizAnswers: hasQuiz ? quizAnswers : undefined,
      });
      
      setCompletionData(result);
      setShowCompletion(true);
    } catch (err) {
      console.error('Card completion error:', err);
      // 에러는 useMutation에서 처리
    }
  };
  
  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing }}>
        {/* 타이틀 */}
        <Typography variant="heading" mode={mode}>
          오늘의 한 가지
        </Typography>
        
        {/* 카드 타입 태그 */}
        <View style={[styles.tagContainer, { marginTop: spacing }]}>
          <Typography variant="caption" mode={mode} style={styles.tagText}>
            {typeLabel}
          </Typography>
        </View>
        
        {/* 제목 */}
        <Typography
          variant="heading"
          mode={mode}
          style={{ marginTop: spacing, fontSize: fontSizes.heading1 }}
        >
          {payload.title}
        </Typography>
        
        {/* TL;DR */}
        <Card mode={mode} style={[styles.infoCard, { marginTop: spacing, backgroundColor: '#F0F8FF' }]}>
          <Typography variant="body" mode={mode} style={{ fontSize: fontSizes.body }}>
            💡 {payload.tldr}
          </Typography>
        </Card>
        
        {/* 본문 */}
        <Typography
          variant="body"
          mode={mode}
          style={{
            marginTop: spacing,
            fontSize: fontSizes.body,
            lineHeight: fontSizes.body * 1.6
          }}
        >
          {payload.body}
        </Typography>
        
        {/* 영향 */}
        <Card mode={mode} style={[styles.infoCard, { marginTop: spacing, backgroundColor: '#FFF4E6' }]}>
          <Typography variant="body" mode={mode} style={{ fontSize: fontSizes.body }}>
            ✨ {payload.impact}
          </Typography>
        </Card>
        
        {/* 읽어주기 버튼 */}
        <Button
          mode={mode}
          variant="secondary"
          onPress={handleTTS}
          style={{ marginTop: spacing, height: buttonHeight }}
          accessibilityLabel="카드 내용 읽어주기"
        >
          🎤 읽어주기
        </Button>
        
        {/* 퀴즈 섹션 */}
        {hasQuiz && (
          <QuizSection
            quiz={payload.quiz}
            answers={quizAnswers}
            onAnswerChange={setQuizAnswers}
            mode={mode}
          />
        )}
        
        {/* 완료 버튼 */}
        <Button
          mode={mode}
          variant="primary"
          onPress={handleComplete}
          style={{
            marginTop: spacing * 2,
            height: buttonHeight * 1.2,
            opacity: isCompleted || !allQuizAnswered ? 0.5 : 1
          }}
          disabled={isCompleted || !allQuizAnswered || completeCard.isPending}
          accessibilityLabel={isCompleted ? '이미 완료된 카드예요' : '오늘의 카드 완료하기'}
        >
          {completeCard.isPending ? '처리 중...' : isCompleted ? '✅ 완료됨' : '완료하기'}
        </Button>
        
        {/* 안내 메시지 */}
        {!allQuizAnswered && !isCompleted && (
          <Typography variant="caption" mode={mode} style={{ marginTop: spacing / 2, textAlign: 'center' }}>
            퀴즈를 모두 풀어주세요.
          </Typography>
        )}
      </ScrollView>
      
      {/* 플로팅 음성 버튼 */}
      <View style={styles.fab}>
        <Button
          mode={mode}
          onPress={() => setShowVoice(true)}
          variant="primary"
          style={{
            height: buttonHeight * 1.2,
            borderRadius: buttonHeight * 0.6,
            paddingHorizontal: spacing * 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
          accessibilityLabel="음성 명령 시작"
        >
          🎤 말하기
        </Button>
      </View>
      
      {/* 완료 모달 */}
      {showCompletion && completionData && (
        <CompletionModal
          data={completionData}
          onClose={() => setShowCompletion(false)}
          mode={mode}
        />
      )}
      
      {/* 음성 명령 오버레이 */}
      <VoiceOverlay
        visible={showVoice}
        onClose={() => setShowVoice(false)}
      />
    </>
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
  tagContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  tagText: {
    color: '#1976D2',
  },
  infoCard: {
    borderRadius: 12,
  },
});
