import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useCreateQna } from '../../hooks/useQna';

const TOPICS = [
  { key: 'ai_tools', label: 'AI 활용', icon: '🤖' },
  { key: 'digital_safety', label: '디지털 안전', icon: '🛡️' },
  { key: 'health', label: '건강', icon: '💊' },
  { key: 'general', label: '일반', icon: '💬' },
];

export function CreateQnaScreen() {
  const [selectedTopic, setSelectedTopic] = useState<
    'ai_tools' | 'digital_safety' | 'health' | 'general'
  >('general');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isAnon, setIsAnon] = useState(false);

  const createMutation = useCreateQna();
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (title.trim().length < 5) {
      Alert.alert('알림', '제목을 5자 이상 입력해 주세요.');
      return;
    }

    if (body.trim().length < 10) {
      Alert.alert('알림', '내용을 10자 이상 입력해 주세요.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        topic: selectedTopic,
        title: title.trim(),
        body: body.trim(),
        is_anon: isAnon,
      });

      Alert.alert('완료', '질문이 등록되었어요!', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '질문을 등록할 수 없어요.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing.lg }}>
        {/* 주제 선택 */}
        <Text style={[styles.label, { fontSize: fontSizes.md, marginBottom: spacing.sm }]}>
          주제 선택
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
          {TOPICS.map((topic) => (
            <Pressable
              key={topic.key}
              style={[
                styles.topicButton,
                {
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: spacing.sm,
                },
                selectedTopic === topic.key && styles.topicButtonActive,
              ]}
              onPress={() => setSelectedTopic(topic.key as any)}
              accessibilityRole="button"
              accessibilityLabel={`${topic.label} 주제 선택`}
            >
              <Text
                style={[
                  styles.topicButtonText,
                  { fontSize: fontSizes.md },
                  selectedTopic === topic.key && styles.topicButtonTextActive,
                ]}
              >
                {topic.icon} {topic.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 제목 */}
        <Text style={[styles.label, { fontSize: fontSizes.md, marginBottom: spacing.sm }]}>
          제목
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              fontSize: fontSizes.md,
              padding: spacing.md,
              borderRadius: spacing.sm,
              marginBottom: spacing.sm,
              minHeight: buttonHeight,
            },
          ]}
          placeholder="궁금한 내용을 간단히 적어주세요 (5자 이상)"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
          accessibilityLabel="질문 제목 입력"
        />
        <Text style={[styles.charCount, { fontSize: fontSizes.sm, marginBottom: spacing.lg }]}>
          {title.length} / 200자
        </Text>

        {/* 본문 */}
        <Text style={[styles.label, { fontSize: fontSizes.md, marginBottom: spacing.sm }]}>
          내용
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              fontSize: fontSizes.md,
              padding: spacing.md,
              borderRadius: spacing.sm,
              marginBottom: spacing.sm,
              minHeight: buttonHeight * 4,
            },
          ]}
          placeholder="구체적으로 설명해 주세요 (10자 이상)"
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
          value={body}
          onChangeText={setBody}
          maxLength={2000}
          accessibilityLabel="질문 내용 입력"
        />
        <Text style={[styles.charCount, { fontSize: fontSizes.sm, marginBottom: spacing.lg }]}>
          {body.length} / 2000자
        </Text>

        {/* 익명 옵션 */}
        <Pressable
          style={[
            styles.anonToggle,
            { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
          ]}
          onPress={() => setIsAnon(!isAnon)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isAnon }}
          accessibilityLabel="익명으로 작성"
        >
          <View
            style={[
              styles.checkbox,
              { width: 24, height: 24, borderRadius: 4, marginRight: spacing.sm },
              isAnon && styles.checkboxActive,
            ]}
          >
            {isAnon && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.anonLabel, { fontSize: fontSizes.md }]}>익명으로 작성</Text>
        </Pressable>

        {/* 등록 버튼 */}
        <Pressable
          style={[
            styles.submitButton,
            {
              height: buttonHeight,
              borderRadius: spacing.sm,
            },
            createMutation.isPending && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel="질문 등록하기"
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[styles.submitButtonText, { fontSize: fontSizes.md }]}>
              질문 등록하기
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontWeight: '600',
    color: '#212121',
  },
  topicButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  topicButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  topicButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  topicButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#999',
    textAlign: 'right',
  },
  anonToggle: {},
  checkbox: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  anonLabel: {
    color: '#424242',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
