/**
 * AI 맞춤 상담 화면
 * 시니어가 고민이나 질문을 입력하면 AI가 친절하게 상담해주는 화면
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../tokens/colors';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Suggestion {
  text: string;
  icon: string;
  category: 'health' | 'tech' | 'family' | 'daily';
}

// 상담 주제별 추천 질문
const CONSULT_SUGGESTIONS: Suggestion[] = [
  { text: "혈압이 높게 나왔는데 어떻게 해야 하나요?", icon: "🩺", category: "health" },
  { text: "스마트폰 사용이 어려워요", icon: "📱", category: "tech" },
  { text: "손주와 대화가 잘 안 통해요", icon: "👨‍👩‍👧", category: "family" },
  { text: "요즘 기분이 우울해요", icon: "😔", category: "health" },
  { text: "카카오톡 사용법을 모르겠어요", icon: "💬", category: "tech" },
  { text: "은퇴 후 무엇을 해야 할지 모르겠어요", icon: "🤔", category: "daily" },
];

const BFF_URL = process.env.EXPO_PUBLIC_BFF_API_URL || 'https://trenduity-bff.onrender.com';

export const AIConsultScreen = () => {
  const navigation = useNavigation<any>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();
  const { accessToken } = useAuth();
  
  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  // 환영 메시지
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '안녕하세요! 😊 저는 AI 상담 비서예요.\n\n건강, 기술, 가족, 일상생활 등 무엇이든 편하게 물어보세요. 친구처럼 이야기 나눠요!',
        timestamp: new Date(),
      }]);
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BFF_URL}/v1/ai/consult`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: text.trim(),
          conversation_history: messages
            .filter(m => m.id !== 'welcome')
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (data.ok && data.data?.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error?.message || '응답을 받을 수 없어요');
      }
    } catch (error) {
      console.error('AI Consult Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송해요, 지금은 응답할 수 없어요. 잠시 후 다시 시도해주세요. 😔',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (text: string) => {
    sendMessage(text);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarIcon}>🤖</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? COLORS.primary.main : cardBg,
              maxWidth: '75%',
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                fontSize: fontSizes.body,
                color: isUser ? '#FFFFFF' : textPrimary,
              },
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              {
                fontSize: fontSizes.caption,
                color: isUser ? 'rgba(255,255,255,0.7)' : textSecondary,
              },
            ]}
          >
            {item.timestamp.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: '#E5E7EB' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="뒤로 가기"
        >
          <Text style={[styles.backButtonText, { fontSize: fontSizes.heading2, color: textPrimary }]}>
            ←
          </Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { fontSize: fontSizes.heading2, color: textPrimary }]}>
            AI 맞춤 상담
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: fontSizes.small, color: textSecondary }]}>
            무엇이든 편하게 물어보세요
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* 메시지 목록 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={
          <>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary.main} />
                <Text style={[styles.loadingText, { fontSize: fontSizes.small, color: textSecondary }]}>
                  답변을 생성하고 있어요...
                </Text>
              </View>
            )}
            
            {/* 추천 질문 (첫 메시지일 때만) */}
            {messages.length === 1 && !isLoading && (
              <View style={styles.suggestionsContainer}>
                <Text style={[styles.suggestionsTitle, { fontSize: fontSizes.body, color: textSecondary }]}>
                  💡 이런 것들을 물어보세요
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CONSULT_SUGGESTIONS.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.suggestionChip, { backgroundColor: cardBg }]}
                      onPress={() => handleSuggestionPress(suggestion.text)}
                    >
                      <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                      <Text style={[styles.suggestionText, { fontSize: fontSizes.small, color: textPrimary }]}>
                        {suggestion.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        }
      />

      {/* 입력창 */}
      <View style={[styles.inputContainer, { backgroundColor: cardBg, borderTopColor: '#E5E7EB' }]}>
        <TextInput
          style={[
            styles.input,
            {
              fontSize: fontSizes.body,
              color: textPrimary,
              backgroundColor: bgColor,
            },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="궁금한 것을 물어보세요..."
          placeholderTextColor={textSecondary}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() && !isLoading ? COLORS.primary.main : '#E5E7EB',
            },
          ]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim() || isLoading}
          accessibilityLabel="메시지 보내기"
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  headerSubtitle: {
    marginTop: 2,
  },
  messageContainer: {
    marginVertical: 8,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarIcon: {
    fontSize: 20,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    lineHeight: 22,
  },
  messageTime: {
    marginTop: 4,
    textAlign: 'right',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  suggestionsTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  suggestionText: {
    maxWidth: 200,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});
