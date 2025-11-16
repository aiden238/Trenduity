import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useToolProgress, useUpdateToolProgress } from '../../hooks/useToolTracks';

type ToolTrackRouteParams = {
  tool: string;
};

const TOOL_INFO: Record<
  string,
  { name: string; icon: string; appUrl: string; description: string }
> = {
  canva: {
    name: 'Canva (디자인 도구)',
    icon: '🎨',
    appUrl: 'https://www.canva.com',
    description: '포스터, 카드, 초대장 등을 쉽게 만들 수 있어요.',
  },
  miri: {
    name: 'Miri (AI 비서)',
    icon: '🤖',
    appUrl: 'https://www.example.com/miri',
    description: '음성으로 질문하고 답변을 들을 수 있어요.',
  },
  sora: {
    name: 'Sora (AI 영상)',
    icon: '🎬',
    appUrl: 'https://openai.com/sora',
    description: '글로 설명하면 영상을 만들어 줘요.',
  },
};

export function ToolTrackScreen() {
  const route = useRoute<RouteProp<{ params: ToolTrackRouteParams }, 'params'>>();
  const { tool } = route.params;

  const { data, isLoading, error } = useToolProgress(tool);
  const updateProgress = useUpdateToolProgress();
  const { spacing, buttonHeight, fontSizes } = useA11y();

  const handleStepComplete = async (step: number) => {
    try {
      const result = await updateProgress.mutateAsync({ tool, step, status: 'done' });

      if (result.points_added > 0) {
        Alert.alert(
          '단계 완료! 🎉',
          `${result.points_added}점을 획득했어요!\n현재 총 포인트: ${result.total_points}점`
        );
      }
    } catch (err: any) {
      Alert.alert('오류', err.message || '업데이트에 실패했어요.');
    }
  };

  const handleOpenApp = () => {
    const toolInfo = TOOL_INFO[tool];
    if (toolInfo) {
      Linking.openURL(toolInfo.appUrl).catch(() => {
        Alert.alert('오류', '앱을 열 수 없어요. 나중에 다시 시도해 주세요.');
      });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, styles.centered, { padding: spacing.lg }]}>
        <Text style={[styles.errorText, { fontSize: fontSizes.md }]}>
          진행 상황을 불러올 수 없어요. 다시 시도해 주세요.
        </Text>
      </View>
    );
  }

  const toolInfo = TOOL_INFO[tool];
  const completedCount = data.steps.filter((s) => s.status === 'done').length;
  const totalCount = data.steps.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing.lg }}>
        {/* 도구 정보 */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: '#F0F8FF', padding: spacing.lg, borderRadius: spacing.md, marginBottom: spacing.lg },
          ]}
        >
          <Text style={[styles.toolTitle, { fontSize: fontSizes.xl }]}>
            {toolInfo.icon} {toolInfo.name}
          </Text>
          <Text style={[styles.toolDescription, { fontSize: fontSizes.md, marginTop: spacing.sm }]}>
            {toolInfo.description}
          </Text>
        </View>

        {/* 진행률 */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[styles.progressTitle, { fontSize: fontSizes.lg, marginBottom: spacing.sm }]}>
            📊 진행률: {progress}%
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress}%`, backgroundColor: '#4CAF50' },
              ]}
            />
          </View>
          <Text style={[styles.progressCount, { fontSize: fontSizes.sm, marginTop: spacing.xs }]}>
            {completedCount}/{totalCount} 단계 완료
          </Text>
        </View>

        {/* 단계 목록 */}
        <View>
          {data.steps.map((step) => (
            <View
              key={step.step}
              style={[
                styles.stepCard,
                { padding: spacing.md, borderRadius: spacing.sm, marginBottom: spacing.md },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                {/* 상태 아이콘 */}
                <Text style={[styles.statusIcon, { fontSize: fontSizes.xl }]}>
                  {step.status === 'done' ? '✅' : '⭕'}
                </Text>

                {/* 내용 */}
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.stepTitle, { fontSize: fontSizes.lg }]}>
                    Step {step.step}. {step.title}
                  </Text>
                  <Text
                    style={[
                      styles.stepDescription,
                      { fontSize: fontSizes.md, marginTop: spacing.xs },
                    ]}
                  >
                    {step.description}
                  </Text>

                  {step.status !== 'done' && (
                    <Pressable
                      style={[
                        styles.completeButton,
                        {
                          height: buttonHeight,
                          borderRadius: spacing.sm,
                          marginTop: spacing.sm,
                        },
                        updateProgress.isPending && styles.buttonDisabled,
                      ]}
                      onPress={() => handleStepComplete(step.step)}
                      disabled={updateProgress.isPending}
                      accessibilityRole="button"
                      accessibilityLabel={`Step ${step.step} 완료하기`}
                    >
                      {updateProgress.isPending ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <Text style={[styles.completeButtonText, { fontSize: fontSizes.md }]}>
                          완료
                        </Text>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 앱 열기 버튼 */}
        <Pressable
          style={[
            styles.openAppButton,
            {
              height: buttonHeight * 1.2,
              borderRadius: spacing.sm,
              marginTop: spacing.md,
            },
          ]}
          onPress={handleOpenApp}
          accessibilityRole="button"
          accessibilityLabel={`${toolInfo.name} 앱 열기`}
        >
          <Text style={[styles.openAppButtonText, { fontSize: fontSizes.md }]}>
            🔗 {toolInfo.name} 앱 열기
          </Text>
        </Pressable>

        {/* 완료 메시지 */}
        {progress === 100 && (
          <View
            style={[
              styles.completionCard,
              {
                backgroundColor: '#E8F5E9',
                padding: spacing.lg,
                borderRadius: spacing.md,
                marginTop: spacing.lg,
              },
            ]}
          >
            <Text
              style={[
                styles.completionTitle,
                { fontSize: fontSizes.lg, color: '#4CAF50', textAlign: 'center' },
              ]}
            >
              🎉 모든 단계 완료!
            </Text>
            <Text
              style={[
                styles.completionMessage,
                { fontSize: fontSizes.md, marginTop: spacing.sm, textAlign: 'center' },
              ]}
            >
              축하드려요! {toolInfo.name}을(를) 마스터하셨어요.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  toolTitle: {
    fontWeight: '700',
    color: '#212121',
  },
  toolDescription: {
    color: '#666',
    lineHeight: 22,
  },
  progressTitle: {
    fontWeight: '600',
    color: '#212121',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressCount: {
    color: '#999',
  },
  stepCard: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusIcon: {
    textAlign: 'center',
  },
  stepTitle: {
    fontWeight: '600',
    color: '#212121',
  },
  stepDescription: {
    color: '#666',
    lineHeight: 22,
  },
  completeButton: {
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  openAppButton: {
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openAppButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  completionCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  completionTitle: {
    fontWeight: '700',
  },
  completionMessage: {
    color: '#212121',
  },
});
