/**
 * 강의 플레이어 화면
 * TTS 스크립트 + 패널 표시
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useA11y } from '@/contexts/A11yContext';
import { useLecture, useUpdateProgress } from '@/hooks/useCourses';

export default function LecturePlayerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId, lectureNumber } = route.params as { courseId: string; lectureNumber: number };

  const { colors } = useTheme();
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { lecture, loading, error } = useLecture(courseId, lectureNumber);
  const { updateProgress, updating } = useUpdateProgress();

  const [isPlaying, setIsPlaying] = useState(false);

  const { background, cardBg, textPrimary, textSecondary, primary, success } = colors;

  useEffect(() => {
    // 강의 진입 시 자동으로 진행 상황 업데이트
    if (lecture && !updating) {
      updateProgress(courseId, lectureNumber);
    }
  }, [lecture]);

  const handleComplete = async () => {
    const result = await updateProgress(courseId, lectureNumber);
    if (result.ok) {
      Alert.alert(
        '완료! 🎉',
        `${lectureNumber}강을 완료했어요!`,
        [
          {
            text: '다음 강의',
            onPress: () => {
              navigation.replace('LecturePlayer' as never, {
                courseId,
                lectureNumber: lectureNumber + 1,
              } as never);
            },
          },
          {
            text: '목록으로',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const renderPanel = (panel: any, index: number) => {
    const panelBg = cardBg;
    const panelPadding = spacing.md;
    const panelMargin = spacing.sm;

    switch (panel.type) {
      case 'image':
        return (
          <View
            key={index}
            style={[styles.panel, { backgroundColor: panelBg, padding: panelPadding, marginBottom: panelMargin, borderRadius: 8 }]}
          >
            <Text style={[styles.panelText, { fontSize: fontSizes.body, color: textSecondary }]}>
              🖼️ 이미지: {panel.content}
            </Text>
          </View>
        );

      case 'step':
        return (
          <View
            key={index}
            style={[styles.panel, { backgroundColor: panelBg, padding: panelPadding, marginBottom: panelMargin, borderRadius: 8 }]}
          >
            <Text style={[styles.stepNumber, { fontSize: fontSizes.heading3, color: primary }]}>
              {panel.number}단계
            </Text>
            <Text style={[styles.panelText, { fontSize: fontSizes.body, color: textPrimary, marginTop: spacing.xs }]}>
              {panel.content}
            </Text>
          </View>
        );

      case 'tip':
        return (
          <View
            key={index}
            style={[styles.panel, { backgroundColor: primary + '20', padding: panelPadding, marginBottom: panelMargin, borderRadius: 8 }]}
          >
            <Text style={[styles.tipIcon, { fontSize: fontSizes.heading2 }]}>💡</Text>
            <Text style={[styles.panelText, { fontSize: fontSizes.body, color: textPrimary, marginTop: spacing.xs }]}>
              {panel.content}
            </Text>
          </View>
        );

      case 'warning':
        return (
          <View
            key={index}
            style={[styles.panel, { backgroundColor: '#FFF3CD', padding: panelPadding, marginBottom: panelMargin, borderRadius: 8 }]}
          >
            <Text style={[styles.warningIcon, { fontSize: fontSizes.heading2 }]}>⚠️</Text>
            <Text style={[styles.panelText, { fontSize: fontSizes.body, color: '#856404', marginTop: spacing.xs }]}>
              {panel.content}
            </Text>
          </View>
        );

      case 'prompt_example':
      case 'good_example':
        return (
          <View
            key={index}
            style={[styles.panel, { backgroundColor: success + '20', padding: panelPadding, marginBottom: panelMargin, borderRadius: 8 }]}
          >
            <Text style={[styles.exampleLabel, { fontSize: fontSizes.small, color: success, fontWeight: 'bold' }]}>
              ✅ 좋은 예시
            </Text>
            <Text style={[styles.panelText, { fontSize: fontSizes.body, color: textPrimary, marginTop: spacing.xs }]}>
              {panel.content}
            </Text>
          </View>
        );

      case 'bad_example':
        return (
          <View
            key={index}
            style={[styles.panel, { backgroundColor: '#F8D7DA', padding: panelPadding, marginBottom: panelMargin, borderRadius: 8 }]}
          >
            <Text style={[styles.exampleLabel, { fontSize: fontSizes.small, color: '#721C24', fontWeight: 'bold' }]}>
              ❌ 나쁜 예시
            </Text>
            <Text style={[styles.panelText, { fontSize: fontSizes.body, color: '#721C24', marginTop: spacing.xs }]}>
              {panel.content}
            </Text>
          </View>
        );

      case 'celebration':
        return (
          <View
            key={index}
            style={[styles.panel, { backgroundColor: success + '30', padding: panelPadding, marginBottom: panelMargin, borderRadius: 8, alignItems: 'center' }]}
          >
            <Text style={[styles.celebrationIcon, { fontSize: fontSizes.heading1 * 2 }]}>🎉</Text>
            <Text style={[styles.panelText, { fontSize: fontSizes.heading3, color: textPrimary, marginTop: spacing.sm, textAlign: 'center' }]}>
              {panel.content}
            </Text>
          </View>
        );

      default:
        return (
          <View
            key={index}
            style={[styles.panel, { backgroundColor: panelBg, padding: panelPadding, marginBottom: panelMargin, borderRadius: 8 }]}
          >
            <Text style={[styles.panelText, { fontSize: fontSizes.body, color: textPrimary }]}>
              {panel.content}
            </Text>
            {panel.items && (
              <View style={{ marginTop: spacing.sm }}>
                {panel.items.map((item: string, idx: number) => (
                  <Text
                    key={idx}
                    style={[styles.listItem, { fontSize: fontSizes.body, color: textPrimary, marginTop: spacing.xs }]}
                  >
                    • {item}
                  </Text>
                ))}
              </View>
            )}
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, { fontSize: fontSizes.body, color: textSecondary }]}>
            강의를 불러오는 중...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !lecture) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { fontSize: fontSizes.body, color: textSecondary }]}>
            {error || '강의를 찾을 수 없어요'}
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: primary, height: buttonHeight, marginTop: spacing.md }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { fontSize: fontSizes.body, color: '#fff' }]}>
              돌아가기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {/* 강의 헤더 */}
        <Text style={[styles.lectureNumber, { fontSize: fontSizes.body, color: textSecondary }]}>
          {lecture.lecture_number}강
        </Text>
        <Text style={[styles.title, { fontSize: fontSizes.heading1, color: textPrimary, marginTop: spacing.xs }]}>
          {lecture.title}
        </Text>
        <Text style={[styles.duration, { fontSize: fontSizes.small, color: textSecondary, marginTop: spacing.xs }]}>
          ⏱️ 약 {lecture.duration}분
        </Text>

        {/* TTS 스크립트 */}
        <View style={[styles.scriptContainer, { backgroundColor: cardBg, padding: spacing.md, marginTop: spacing.lg, borderRadius: 8 }]}>
          <Text style={[styles.scriptLabel, { fontSize: fontSizes.heading3, color: primary, marginBottom: spacing.sm }]}>
            📖 강의 내용
          </Text>
          <Text style={[styles.scriptText, { fontSize: fontSizes.body, color: textPrimary, lineHeight: fontSizes.body * 1.6 }]}>
            {lecture.script}
          </Text>
        </View>

        {/* 패널들 */}
        {lecture.panels && lecture.panels.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            {lecture.panels.map((panel, index) => renderPanel(panel, index))}
          </View>
        )}
      </ScrollView>

      {/* 완료 버튼 */}
      <View style={[styles.footer, { padding: spacing.md, backgroundColor: background }]}>
        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: success, height: buttonHeight, borderRadius: 8 }]}
          onPress={handleComplete}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.completeButtonText, { fontSize: fontSizes.body, color: '#fff', fontWeight: 'bold' }]}>
              ✅ 강의 완료하기
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontWeight: 'bold',
  },
  lectureNumber: {},
  title: {
    fontWeight: 'bold',
  },
  duration: {},
  scriptContainer: {},
  scriptLabel: {
    fontWeight: 'bold',
  },
  scriptText: {},
  panel: {},
  panelText: {},
  stepNumber: {
    fontWeight: 'bold',
  },
  tipIcon: {},
  warningIcon: {},
  exampleLabel: {},
  celebrationIcon: {},
  listItem: {},
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  completeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {},
});
