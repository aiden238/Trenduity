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
  Modal,
  ScrollView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
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
}

// AI 비서 모델 타입
interface AIModel {
  id: string;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
  color: string;
}

// 4개 AI 비서 모델
const AI_MODELS: AIModel[] = [
  {
    id: 'writer',
    name: '글쓰기 비서',
    icon: '✍️',
    description: '편지, 문자, 이메일 등 글쓰기를 도와드려요',
    systemPrompt: '당신은 시니어를 위한 친절한 글쓰기 도우미입니다. 사용자가 편지, 문자, 이메일, 축하 메시지 등을 작성할 때 쉽고 정중한 표현으로 도와주세요. 어려운 표현은 피하고, 따뜻하고 정감 있는 한국어를 사용하세요.',
    color: '#8B5CF6',
  },
  {
    id: 'expert',
    name: '척척박사 비서',
    icon: '🎓',
    description: '건강, 생활 정보 등 궁금한 것을 알려드려요',
    systemPrompt: '당신은 시니어를 위한 박식한 정보 도우미입니다. 건강, 생활 상식, 역사, 문화 등 다양한 분야의 질문에 쉽고 정확하게 답변해주세요. 전문 용어는 쉽게 풀어서 설명하고, 필요하면 예시를 들어주세요.',
    color: '#10B981',
  },
  {
    id: 'allround',
    name: '만능 비서',
    icon: '🌟',
    description: '무엇이든 도와드리는 똑똑한 비서예요',
    systemPrompt: '당신은 시니어를 위한 만능 AI 도우미입니다. 디지털 기기 사용법, 앱 활용, 일상 생활의 모든 궁금증에 친절하고 자세하게 답변해주세요. 어르신이 이해하기 쉽게 단계별로 설명하고, 이모지를 적절히 사용해 친근하게 소통하세요.',
    color: '#F59E0B',
  },
  {
    id: 'quick',
    name: '빠른 일반 비서',
    icon: '⚡',
    description: '간단한 질문에 빠르게 답해드려요',
    systemPrompt: '당신은 빠르고 간결한 답변을 제공하는 AI 도우미입니다. 사용자의 질문에 핵심만 짧고 명확하게 답변하세요. 불필요한 설명은 생략하고, 꼭 필요한 정보만 전달하세요.',
    color: '#EF4444',
  },
];

const SUGGESTIONS: Suggestion[] = [
  { text: "ChatGPT가 뭐예요?", icon: "🤖" },
  { text: "카카오톡 사용법 알려주세요", icon: "💬" },
  { text: "유튜브에서 영상 찾는 법", icon: "🎬" },
  { text: "안전한 비밀번호 만드는 법", icon: "🔐" },
  { text: "스마트폰 글씨 크게 하는 법", icon: "📱" },
  { text: "보이스피싱 구별하는 법", icon: "⚠️" },
];

// 라우트 파라미터 타입
type AIChatRouteParams = {
  initialPrompt?: string;
  modelId?: string;
};

export const AIChatScreen = () => {
  const route = useRoute<RouteProp<{ params: AIChatRouteParams }, 'params'>>();
  const initialPrompt = route.params?.initialPrompt;
  const initialModelId = route.params?.modelId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(
    AI_MODELS.find(m => m.id === initialModelId) || AI_MODELS[2] // 기본: 만능 비서
  );
  const [showModelPicker, setShowModelPicker] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();
  const { accessToken } = useAuth();
  
  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  const BFF_URL = process.env.EXPO_PUBLIC_BFF_API_URL || 'https://trenduity-bff.onrender.com';

  // 환영 메시지
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `안녕하세요! 😊 저는 ${selectedModel.name}예요.\n\n${selectedModel.description}. 궁금한 것이 있으시면 편하게 물어보세요!`,
        timestamp: new Date(),
      }]);
    }
  }, []);

  // 초기 프롬프트가 있으면 자동 전송
  useEffect(() => {
    if (initialPrompt && messages.length === 1) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, messages.length]);

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
      // 이전 대화 기록 준비 (환영 메시지 제외)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${BFF_URL}/v1/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: text.trim(),
          history,
          model_id: selectedModel.id,
          system_prompt: selectedModel.systemPrompt,
        }),
      });

      const data = await response.json();

      if (data.ok && data.data?.reply) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.reply,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // 에러 응답
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.error?.message || '죄송해요, 답변을 생성하지 못했어요. 다시 시도해 주세요.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '네트워크 연결이 불안정해요. 잠시 후 다시 시도해 주세요.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: Suggestion) => {
    sendMessage(suggestion.text);
  };

  // 모델 변경 핸들러
  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
    setShowModelPicker(false);
    // 모델 변경 시 환영 메시지 업데이트
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `안녕하세요! 😊 저는 ${model.name}예요.\n\n${model.description}. 궁금한 것이 있으시면 편하게 물어보세요!`,
      timestamp: new Date(),
    }]);
  };

  // 모델 선택 모달 렌더링
  const renderModelPicker = () => (
    <Modal
      visible={showModelPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowModelPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { fontSize: fontSizes.heading1, color: textPrimary }]}>
              🤖 AI 비서 선택
            </Text>
            <TouchableOpacity
              onPress={() => setShowModelPicker(false)}
              style={styles.closeButton}
              accessibilityLabel="닫기"
            >
              <Text style={{ fontSize: 24, color: textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.modalSubtitle, { fontSize: fontSizes.body, color: textSecondary, marginBottom: spacing.lg }]}>
            원하는 도우미를 선택하세요
          </Text>
          
          <ScrollView style={{ maxHeight: 400 }}>
            {AI_MODELS.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelOption,
                  {
                    backgroundColor: selectedModel.id === model.id ? `${model.color}15` : bgColor,
                    borderColor: selectedModel.id === model.id ? model.color : '#E5E7EB',
                    borderWidth: selectedModel.id === model.id ? 2 : 1,
                    padding: spacing.md,
                    borderRadius: 16,
                    marginBottom: spacing.sm,
                  },
                ]}
                onPress={() => handleModelChange(model)}
                accessibilityLabel={`${model.name} 선택`}
              >
                <View style={styles.modelOptionHeader}>
                  <View style={[styles.modelIconContainer, { backgroundColor: model.color }]}>
                    <Text style={{ fontSize: 24 }}>{model.icon}</Text>
                  </View>
                  <View style={styles.modelInfo}>
                    <Text style={[styles.modelName, { fontSize: fontSizes.body, color: textPrimary }]}>
                      {model.name}
                    </Text>
                    <Text style={[styles.modelDesc, { fontSize: fontSizes.small, color: textSecondary }]}>
                      {model.description}
                    </Text>
                  </View>
                  {selectedModel.id === model.id && (
                    <Text style={{ fontSize: 20, color: model.color }}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? COLORS.primary.main : cardBg,
              borderRadius: 16,
              padding: spacing.md,
              maxWidth: '85%',
            },
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                fontSize: fontSizes.body,
                color: isUser ? '#FFFFFF' : textPrimary,
                lineHeight: fontSizes.body * 1.5,
              },
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  const renderSuggestions = () => {
    if (messages.length > 1) return null;

    return (
      <View style={[styles.suggestionsContainer, { padding: spacing.md }]}>
        <Text style={[styles.suggestionsTitle, { fontSize: fontSizes.body, color: textSecondary, marginBottom: spacing.sm }]}>
          💡 이런 것도 물어보세요
        </Text>
        <View style={styles.suggestionsGrid}>
          {SUGGESTIONS.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestionButton,
                {
                  backgroundColor: cardBg,
                  padding: spacing.sm,
                  borderRadius: 12,
                  marginBottom: spacing.xs,
                },
              ]}
              onPress={() => handleSuggestionPress(suggestion)}
              accessibilityRole="button"
              accessibilityLabel={suggestion.text}
            >
              <Text style={[styles.suggestionText, { fontSize: fontSizes.small, color: textPrimary }]}>
                {suggestion.icon} {suggestion.text}
              </Text>
            </TouchableOpacity>
          ))}
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
      {/* 모델 선택 모달 */}
      {renderModelPicker()}

      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: selectedModel.color, padding: spacing.lg, paddingTop: spacing.lg + 40 }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
            {selectedModel.icon} AI 도우미
          </Text>
          <TouchableOpacity
            style={[styles.modelSwitchButton, { backgroundColor: 'rgba(255,255,255,0.2)', padding: spacing.sm, borderRadius: 20 }]}
            onPress={() => setShowModelPicker(true)}
            accessibilityLabel="AI 비서 변경"
          >
            <Text style={{ color: '#FFFFFF', fontSize: fontSizes.small, fontWeight: '600' }}>
              {selectedModel.name} ▼
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)' }]}>
          {selectedModel.description}
        </Text>
      </View>

      {/* 메시지 목록 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={renderSuggestions}
      />

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <View style={[styles.loadingContainer, { backgroundColor: cardBg, padding: spacing.md, marginHorizontal: spacing.md, borderRadius: 12 }]}>
          <ActivityIndicator size="small" color={COLORS.primary.main} />
          <Text style={[styles.loadingText, { fontSize: fontSizes.small, color: textSecondary, marginLeft: spacing.sm }]}>
            답변을 생성하고 있어요...
          </Text>
        </View>
      )}

      {/* 입력 영역 */}
      <View style={[styles.inputContainer, { backgroundColor: cardBg, padding: spacing.md, borderTopWidth: 1, borderTopColor: '#E5E7EB' }]}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: bgColor,
              fontSize: fontSizes.body,
              color: textPrimary,
              padding: spacing.md,
              borderRadius: 12,
              flex: 1,
              minHeight: buttonHeight,
            },
          ]}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor={textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          accessibilityLabel="메시지 입력"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() ? COLORS.primary.main : '#E5E7EB',
              width: buttonHeight,
              height: buttonHeight,
              borderRadius: buttonHeight / 2,
              marginLeft: spacing.sm,
            },
          ]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim() || isLoading}
          accessibilityRole="button"
          accessibilityLabel="메시지 보내기"
        >
          <Text style={{ fontSize: 20, color: inputText.trim() ? '#FFFFFF' : '#9CA3AF' }}>
            ➤
          </Text>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  modelSwitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontWeight: '700',
  },
  modalSubtitle: {},
  closeButton: {
    padding: 8,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  modelDesc: {},
  // 메시지 스타일
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {},
  suggestionsContainer: {},
  suggestionsTitle: {
    fontWeight: '600',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionButton: {
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionText: {},
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingText: {},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
