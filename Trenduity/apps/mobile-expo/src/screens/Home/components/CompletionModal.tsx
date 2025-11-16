import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { Typography, Button } from '@repo/ui';
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
  
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      {/* 오버레이 */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.modal, { padding: spacing * 2 }]} onPress={(e) => e.stopPropagation()}>
          {/* 축하 메시지 */}
          <Typography
            variant="heading"
            mode={mode}
            style={{ fontSize: fontSizes.heading1, textAlign: 'center' }}
          >
            🎉 완료!
          </Typography>
          
          {/* 결과 정보 */}
          <View style={{ marginTop: spacing * 2 }}>
            {/* 포인트 */}
            <Typography variant="body" mode={mode} style={{ fontSize: fontSizes.body }}>
              ⭐ 포인트: +{data.points_added} (총 {data.total_points})
            </Typography>
            
            {/* 스트릭 */}
            <Typography
              variant="body"
              mode={mode}
              style={{ fontSize: fontSizes.body, marginTop: spacing }}
            >
              🔥 연속 학습: {data.streak_days}일
            </Typography>
            
            {/* 퀴즈 결과 */}
            {data.quiz_result && (
              <Typography
                variant="body"
                mode={mode}
                style={{ fontSize: fontSizes.body, marginTop: spacing }}
              >
                📝 퀴즈 결과: {data.quiz_result.correct}/{data.quiz_result.total} 정답
              </Typography>
            )}
            
            {/* 새 배지 */}
            {data.new_badges.length > 0 && (
              <View
                style={[
                  styles.badgeContainer,
                  {
                    marginTop: spacing,
                    padding: spacing,
                    backgroundColor: '#FFF4E6'
                  }
                ]}
              >
                <Typography variant="body" mode={mode} style={{ fontSize: fontSizes.body }}>
                  🏆 새 배지: {data.new_badges.join(', ')}
                </Typography>
              </View>
            )}
          </View>
          
          {/* 닫기 버튼 */}
          <Button
            mode={mode}
            variant="primary"
            onPress={onClose}
            style={{ marginTop: spacing * 2, height: buttonHeight }}
            accessibilityLabel="완료 모달 닫기"
          >
            확인
          </Button>
        </Pressable>
      </Pressable>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeContainer: {
    borderRadius: 8,
  },
});
