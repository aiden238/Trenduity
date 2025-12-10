import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

const TOPICS = [
  { key: 'ai_tools', label: 'AI 활용', icon: '🤖' },
  { key: 'digital_safety', label: '디지털 안전', icon: '🛡️' },
  { key: 'health', label: '건강', icon: '💊' },
  { key: 'general', label: '일반', icon: '💬' },
];

const POSTS_STORAGE_KEY = '@qna_posts';

/**
 * Q&A 작성 화면
 * 
 * 기능:
 * - 주제 선택 (AI활용, 디지털 안전, 건강, 일반)
 * - 제목/내용 작성
 * - AsyncStorage에 저장
 */
export const QnaCreateScreen = () => {
  const { spacing, fontSizes, buttonHeight } = useA11y();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0].key);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const stored = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
      const posts = stored ? JSON.parse(stored) : [];

      const newPost = {
        id: Date.now().toString(),
        title: title.trim(),
        ai_summary: body.trim().substring(0, 100) + (body.length > 100 ? '...' : ''),
        body: body.trim(),
        author_name: user?.name || '익명',
        author_id: user?.id || 'anonymous',
        vote_count: 0,
        topic: selectedTopic,
        created_at: new Date().toISOString(),
      };

      posts.unshift(newPost);
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));

      Alert.alert('완료! 🎉', '질문이 등록되었습니다!', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('글 저장 실패:', error);
      Alert.alert('오류', '글 저장에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
        <Text style={[styles.heading, { fontSize: fontSizes.heading1, marginBottom: spacing.lg }]}>
          ✏️ 질문하기
        </Text>

      {/* 주제 선택 */}
      <Text style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}>
        주제
      </Text>
      <View style={[styles.topicContainer, { marginBottom: spacing.md }]}>
        {TOPICS.map((topic) => {
          const isSelected = selectedTopic === topic.key;
          return (
            <TouchableOpacity
              key={topic.key}
              onPress={() => setSelectedTopic(topic.key)}
              style={[
                styles.topicButton,
                isSelected && styles.topicButtonActive,
                { padding: spacing.sm, marginRight: spacing.sm, marginBottom: spacing.sm }
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${topic.label} 주제 선택`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[
                styles.topicText,
                { fontSize: fontSizes.body },
                isSelected && styles.topicTextActive
              ]}>
                {topic.icon} {topic.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}>
        제목
      </Text>
      <TextInput
        style={[styles.input, { 
          fontSize: fontSizes.body, 
          padding: spacing.md,
          marginBottom: spacing.md,
        }]}
        placeholder="궁금한 점을 간단히 적어주세요"
        placeholderTextColor={COLORS.neutral.text.tertiary}
        value={title}
        onChangeText={setTitle}
        accessibilityLabel="질문 제목 입력"
      />

      <Text style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}>
        내용
      </Text>
      <TextInput
        style={[styles.input, styles.textArea, { 
          fontSize: fontSizes.body, 
          padding: spacing.md,
          marginBottom: spacing.lg,
        }]}
        placeholder="자세한 내용을 작성해주세요"
        placeholderTextColor={COLORS.neutral.text.tertiary}
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        accessibilityLabel="질문 내용 입력"
      />

      <TouchableOpacity
        style={[styles.button, { 
          height: buttonHeight, 
          backgroundColor: COLORS.primary.main,
          borderRadius: RADIUS.lg,
        }]}
        onPress={handleSubmit}
        accessibilityRole="button"
        accessibilityLabel="질문 등록하기"
      >
        <Text style={[styles.buttonText, { fontSize: fontSizes.body }]}>
          질문 등록
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    color: COLORS.neutral.text.primary,
    fontWeight: '700',
  },
  label: {
    color: COLORS.neutral.text.primary,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    color: COLORS.neutral.text.primary,
  },
  textArea: {
    height: 150,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  topicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicButton: {
    borderRadius: RADIUS.lg,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  topicButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: COLORS.primary.main,
  },
  topicText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  topicTextActive: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
});
