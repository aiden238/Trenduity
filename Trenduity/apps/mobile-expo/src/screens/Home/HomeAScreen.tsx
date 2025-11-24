import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Typography, 
  Button, 
  Card, 
  Spinner, 
  ErrorState,
  GradientCard,
  StatCard,
  COLORS,
  SPACING,
  SHADOWS,
} from '@repo/ui';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTTS } from '../../hooks/useTTS';
import { useTodayCard, useCompleteCard } from '../../hooks/useTodayCard';
import { useGamification } from '../../hooks/useGamification';
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
  const { activeTheme, colors } = useTheme();
  const { speak, stop, isSpeaking } = useTTS();
  const { data: card, isLoading, error } = useTodayCard();
  const completeCard = useCompleteCard();
  const { data: gamification } = useGamification();
  
  // 다크 모드 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : colors.neutral.background;
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : colors.neutral.text.primary;
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : colors.neutral.surface;
  
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [showVoice, setShowVoice] = useState(false);
  
  // 로딩 상태
  if (isLoading) {
    return <Spinner size="large" color="#1976D2" />;
  }
  
  // 에러 상태
  if (error || !card) {
    return (
      <ErrorState
        message={error?.message || '카드를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.'}
      />
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
    if (isSpeaking) {
      stop();
    } else {
      const fullText = `${payload.title}. ${payload.tldr}. ${payload.body}. ${payload.impact}`;
      speak(fullText);
    }
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
      <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={{ paddingBottom: spacing * 6 }}>
        {/* 헤더 - 그라데이션 배경 */}
        <LinearGradient
          colors={COLORS.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { padding: spacing * 1.5 }]}
        >
          <View style={styles.headerContent}>
            <View>
              <Typography variant="caption" mode={mode} style={styles.headerLabel}>
                안녕하세요 👋
              </Typography>
              <Typography variant="heading" mode={mode} style={styles.headerTitle}>
                오늘의 학습
              </Typography>
            </View>
          </View>
        </LinearGradient>
        
        {/* 게임화 통계 카드 (3개 가로 배치) */}
        {gamification && (
          <View style={[styles.statsContainer, { padding: spacing, marginTop: -spacing * 2 }]}>
            <StatCard
              icon="⭐"
              value={gamification.total_points || 0}
              label="포인트"
              unit="pt"
              colors={COLORS.gradients.primary}
              a11yMode={mode}
              style={styles.statCard}
            />
            <StatCard
              icon="🔥"
              value={gamification.current_streak || 0}
              label="스트릭"
              unit="일"
              colors={[COLORS.accent.orange, COLORS.accent.pink]}
              a11yMode={mode}
              style={styles.statCard}
            />
            <StatCard
              icon="🏆"
              value={gamification.level || 1}
              label="레벨"
              colors={[COLORS.accent.purple, COLORS.accent.pink]}
              a11yMode={mode}
              style={styles.statCard}
            />
          </View>
        )}
        
        {/* 오늘의 카드 섹션 */}
        <View style={{ padding: spacing }}>
          <Typography variant="heading" mode={mode} style={{ marginBottom: spacing }}>
            오늘의 카드
          </Typography>
          
          {/* 카드 타입 태그 */}
          <View style={[styles.tagContainer, { marginBottom: spacing }]}>
            <Typography variant="caption" mode={mode} style={styles.tagText}>
              {typeLabel}
            </Typography>
          </View>
        
          {/* 카드 메인 컨텐츠 - 그라데이션 카드 */}
          <GradientCard
            colors={[cardBg, bgColor]}
            size="large"
            shadow="lg"
            radius="xl"
            style={{ marginBottom: spacing }}
          >
            {/* 제목 */}
            <Typography
              variant="heading"
              mode={mode}
              style={{ fontSize: fontSizes.heading1, color: COLORS.primary.main }}
            >
              {payload.title}
            </Typography>
            
            {/* TL;DR */}
            <View style={[styles.infoBox, { marginTop: spacing, backgroundColor: COLORS.primary.light + '20' }]}>
              <Typography variant="body" mode={mode} style={{ fontSize: fontSizes.body }}>
                💡 {payload.tldr}
              </Typography>
            </View>
            
            {/* 본문 */}
            <Typography
              variant="body"
              mode={mode}
              style={{
                marginTop: spacing,
                fontSize: fontSizes.body,
                lineHeight: fontSizes.body * 1.6,
                color: COLORS.neutral.text.secondary,
              }}
            >
              {payload.body}
            </Typography>
            
            {/* 영향 */}
            <View style={[styles.infoBox, { marginTop: spacing, backgroundColor: COLORS.accent.yellow + '20' }]}>
              <Typography variant="body" mode={mode} style={{ fontSize: fontSizes.body }}>
                ✨ {payload.impact}
              </Typography>
            </View>
          </GradientCard>
          
          {/* TTS 버튼 */}
          <TouchableOpacity
            onPress={handleTTS}
            style={[
              styles.ttsButton,
              { height: buttonHeight, marginBottom: spacing },
              SHADOWS.md,
            ]}
            accessibilityRole="button"
            accessibilityLabel={isSpeaking ? "읽기 중지" : "카드 내용 읽어주기"}
            accessibilityHint={isSpeaking ? "버튼을 누르면 읽기가 멈춥니다" : "버튼을 누르면 카드 내용을 소리내어 읽어줍니다"}
          >
            <LinearGradient
              colors={isSpeaking ? [COLORS.accent.orange, COLORS.accent.pink] : COLORS.gradients.secondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.ttsButtonGradient, { height: buttonHeight }]}
            >
              <Typography variant="body" mode={mode} style={styles.ttsButtonText}>
                {isSpeaking ? '⏸️ 중지' : '🎤 읽어주기'}
              </Typography>
            </LinearGradient>
          </TouchableOpacity>
          
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
          <TouchableOpacity
            onPress={handleComplete}
            disabled={isCompleted || !allQuizAnswered || completeCard.isPending}
            style={[
              styles.completeButton,
              { height: buttonHeight * 1.2, marginTop: spacing * 2 },
              SHADOWS.lg,
              (isCompleted || !allQuizAnswered) && styles.buttonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={isCompleted ? '이미 완료된 카드예요' : '오늘의 카드 완료하기'}
            accessibilityHint={isCompleted ? "" : "버튼을 누르면 포인트를 받고 스트릭이 올라갑니다"}
            accessibilityState={{ disabled: isCompleted || !allQuizAnswered }}
          >
            <LinearGradient
              colors={isCompleted ? [COLORS.neutral.border, COLORS.neutral.divider] : COLORS.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.completeButtonGradient, { height: buttonHeight * 1.2 }]}
            >
              <Typography variant="body" mode={mode} style={styles.completeButtonText}>
                {completeCard.isPending ? '⏳ 처리 중...' : isCompleted ? '✅ 완료됨' : '🎉 완료하기'}
              </Typography>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* 안내 메시지 */}
          {!allQuizAnswered && !isCompleted && (
            <Typography 
              variant="caption" 
              mode={mode} 
              style={{ 
                marginTop: spacing / 2, 
                textAlign: 'center',
                color: COLORS.neutral.text.tertiary,
              }}
            >
              ⬆️ 퀴즈를 모두 풀어주세요
            </Typography>
          )}
        </View>
      </ScrollView>
      
      {/* 플로팅 음성 버튼 (FAB) */}
      <TouchableOpacity
        onPress={() => setShowVoice(true)}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="음성 명령 시작"
        accessibilityHint="버튼을 누르면 음성으로 명령을 말할 수 있습니다"
      >
        <LinearGradient
          colors={COLORS.gradients.cool}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: buttonHeight * 1.2,
            paddingHorizontal: spacing * 2,
            borderRadius: buttonHeight * 0.6,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="body" mode={mode} style={{ color: COLORS.neutral.text.inverse, fontWeight: '600' }}>
            🎤 말하기
          </Typography>
        </LinearGradient>
      </TouchableOpacity>
      
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
    backgroundColor: COLORS.neutral.background,
  },
  header: {
    paddingTop: 60, // Safe Area
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    color: COLORS.neutral.text.inverse,
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.neutral.text.inverse,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary.light + '30',
    borderRadius: 8,
  },
  tagText: {
    color: COLORS.primary.dark,
    fontWeight: '600',
  },
  infoBox: {
    padding: SPACING.md,
    borderRadius: 12,
  },
  ttsButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ttsButtonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  ttsButtonText: {
    color: COLORS.neutral.text.inverse,
    fontWeight: '600',
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  completeButtonText: {
    color: COLORS.neutral.text.inverse,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 60,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
});
