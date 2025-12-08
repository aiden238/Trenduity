import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Animated, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useA11y } from '../../../contexts/A11yContext';
import { CompleteCardResult } from '../../../hooks/useTodayCard';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../../tokens/colors';

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
        <Pressable style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={handleClose}>
          <Animated.View 
            style={[
              styles.modal, 
              { 
                padding: spacing.xl,
                transform: [{ scale: scaleAnim }],
                backgroundColor: COLORS.primary.main,
                borderRadius: RADIUS.xl,
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* 축하 메시지 */}
            <Text
              style={[styles.heading, { 
                fontSize: fontSizes.heading1, 
              }]}
            >
              🎉 완료!
            </Text>
        
            {/* 결과 정보 */}
            <View style={{ marginTop: spacing.lg }}>
              {/* 포인트 */}
              <View style={styles.statRow}>
                <Text 
                  style={[styles.statText, { fontSize: fontSizes.body }]}
                >
                  ⭐ 포인트: +{data.points_added} (총 {data.total_points.toLocaleString()})
                </Text>
              </View>
              
              {/* 스트릭 */}
              <View style={[styles.statRow, { marginTop: spacing.sm }]}>
                <Text
                  style={[styles.statText, { fontSize: fontSizes.body }]}
                >
                  🔥 연속 학습: {data.streak_days}일
                </Text>
              </View>

              {/* 퀴즈 점수 */}
              {data.quiz_score !== undefined && (
                <View style={[styles.statRow, { marginTop: spacing.sm }]}>
                  <Text
                    style={[styles.statText, { fontSize: fontSizes.body }]}
                  >
                    📝 퀴즈 점수: {data.quiz_score}점
                  </Text>
                </View>
              )}

              {/* 새 배지 */}
              {data.new_badges && data.new_badges.length > 0 && (
                <View style={[styles.badgeSection, { marginTop: spacing.md }]}>
                  <Text style={[styles.badgeTitle, { fontSize: fontSizes.body }]}>
                    🏆 새 배지 획득!
                  </Text>
                  {data.new_badges.map((badge, index) => (
                    <Text key={index} style={[styles.badgeName, { fontSize: fontSizes.small, marginTop: spacing.xs }]}>
                      {badge.name}
                    </Text>
                  ))}
                </View>
              )}
            </View>
            
            {/* 닫기 버튼 */}
            <TouchableOpacity
              style={[styles.closeButton, { 
                marginTop: spacing.xl,
                height: buttonHeight,
                borderRadius: RADIUS.lg,
              }]}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="확인하고 닫기"
            >
              <Text style={[styles.closeButtonText, { fontSize: fontSizes.body }]}>
                확인
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    maxWidth: 360,
    ...SHADOWS.xl,
  },
  heading: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statRow: {},
  statText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  badgeSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  badgeTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgeName: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.primary.main,
    fontWeight: '700',
  },
});
