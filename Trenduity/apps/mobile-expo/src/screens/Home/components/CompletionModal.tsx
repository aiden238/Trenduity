import React from 'react';
import { Modal, View, StyleSheet, Pressable, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Typography, AnimatedNumber, numberFormatters, COLORS, SPACING, SHADOWS, RADIUS } from '@repo/ui';
import { useA11y } from '../../../contexts/A11yContext';
import { CompleteCardResult } from '../../../hooks/useTodayCard';

interface Props {
  data: CompleteCardResult;
  onClose: () => void;
  mode: 'normal' | 'easy' | 'ultra';
}

/**
 * 완료 모달 컴포넌트
 * 
 * 기능:
 * - 포인트/스트릭 표시
 * - 퀴즈 결과 표시
 * - 새 배지 표시
 */
export const CompletionModal = ({ data, onClose, mode }: Props) => {
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const [scaleAnim] = React.useState(new Animated.Value(0.8));
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    // 입장 애니메이션
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    // 퇴장 애니메이션
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };
  
  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      {/* 오버레이 */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={handleClose}>
          <Animated.View 
            style={[
              styles.modal, 
              { 
                padding: spacing * 2,
                transform: [{ scale: scaleAnim }]
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <LinearGradient
              colors={COLORS.gradients.sunset}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                borderRadius: RADIUS.xl
              }}
            />
            
            <View style={{ position: 'relative', zIndex: 1 }}>
              {/* 축하 메시지 */}
              <Typography
                variant="heading"
                mode={mode}
                style={{ 
                  fontSize: fontSizes.heading1, 
                  textAlign: 'center',
                  color: '#FFFFFF',
                  fontWeight: '700'
                }}
              >
                🎉 완료!
              </Typography>
          
              {/* 결과 정보 */}
              <View style={{ marginTop: spacing * 2 }}>
                {/* 포인트 */}
                <View style={styles.statRow}>
                  <Typography 
                    variant="body" 
                    mode={mode} 
                    style={{ 
                      fontSize: fontSizes.body,
                      color: '#FFFFFF',
                      fontWeight: '600'
                    }}
                  >
                    ⭐ 포인트: +{data.points_added} (총{' '}
                    <AnimatedNumber
                      value={data.total_points}
                      duration={1000}
                      formatter={numberFormatters.withCommas}
                      style={{ 
                        fontSize: fontSizes.body,
                        color: '#FFFFFF',
                        fontWeight: '700'
                      }}
                    />
                    )
                  </Typography>
                </View>
                
                {/* 스트릭 */}
                <View style={[styles.statRow, { marginTop: spacing }]}>
                  <Typography
                    variant="body"
                    mode={mode}
                    style={{ 
                      fontSize: fontSizes.body,
                      color: '#FFFFFF',
                      fontWeight: '600'
                    }}
                  >
                    🔥 연속 학습:{' '}
                    <AnimatedNumber
                      value={data.streak_days}
                      duration={1000}
                      formatter={numberFormatters.integer}
                      style={{ 
                        fontSize: fontSizes.body,
                        color: '#FFFFFF',
                        fontWeight: '700'
                      }}
                    />
                    일
                  </Typography>
                </View>
                
                {/* 퀴즈 결과 */}
                {data.quiz_result && (
                  <View style={[styles.statRow, { marginTop: spacing }]}>
                    <Typography
                      variant="body"
                      mode={mode}
                      style={{ 
                        fontSize: fontSizes.body,
                        color: '#FFFFFF',
                        fontWeight: '600'
                      }}
                    >
                      📝 퀴즈 결과:{' '}
                      <AnimatedNumber
                        value={data.quiz_result.correct}
                        duration={800}
                        formatter={numberFormatters.integer}
                        style={{ 
                          fontSize: fontSizes.body,
                          color: '#FFFFFF',
                          fontWeight: '700'
                        }}
                      />
                      /{data.quiz_result.total} 정답
                    </Typography>
                  </View>
                )}
                
                {/* 새 배지 */}
                {data.new_badges.length > 0 && (
                  <View
                    style={{
                      marginTop: spacing * 1.5,
                      padding: spacing * 1.5,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: RADIUS.md,
                      borderWidth: 2,
                      borderColor: '#FFFFFF'
                    }}
                  >
                    <Typography 
                      variant="body" 
                      mode={mode} 
                      style={{ 
                        fontSize: fontSizes.body,
                        color: '#FFFFFF',
                        fontWeight: '700',
                        textAlign: 'center'
                      }}
                    >
                      🏆 새 배지: {data.new_badges.join(', ')}
                    </Typography>
                  </View>
                )}
              </View>
          
              {/* 닫기 버튼 */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleClose();
                }}
                activeOpacity={0.8}
                style={{ 
                  marginTop: spacing * 2,
                  minHeight: buttonHeight * 1.2,
                  borderRadius: RADIUS.lg,
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF'
                }}
                accessibilityRole="button"
                accessibilityLabel="완료 모달 닫기"
                accessibilityHint="버튼을 누르면 홈 화면으로 돌아갑니다"
              >
                <View
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
                      color: COLORS.primary.main,
                      fontWeight: '700',
                    }}
                  >
                    확인
                  </Typography>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: RADIUS.xl,
    ...SHADOWS.xl,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
