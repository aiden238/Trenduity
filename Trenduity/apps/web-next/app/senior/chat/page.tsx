'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIModel {
  id: string;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
  color: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'writer',
    name: '글쓰기 비서',
    icon: '✍️',
    description: '편지, 문자, 이메일 등 글쓰기를 도와드려요',
    systemPrompt: '당신은 시니어를 위한 친절한 글쓰기 도우미입니다.',
    color: '#8B5CF6',
  },
  {
    id: 'expert',
    name: '척척박사 비서',
    icon: '🎓',
    description: '건강, 생활 정보 등 궁금한 것을 알려드려요',
    systemPrompt: '당신은 시니어를 위한 박식한 정보 도우미입니다.',
    color: '#10B981',
  },
  {
    id: 'allround',
    name: '만능 비서',
    icon: '🌟',
    description: '무엇이든 도와드리는 똑똑한 비서예요',
    systemPrompt: '당신은 시니어를 위한 만능 AI 도우미입니다.',
    color: '#F59E0B',
  },
  {
    id: 'quick',
    name: '빠른 일반 비서',
    icon: '⚡',
    description: '간단한 질문에 빠르게 답해드려요',
    systemPrompt: '당신은 빠르고 간결한 답변을 제공하는 AI 도우미입니다.',
    color: '#EF4444',
  },
];

const SUGGESTIONS = [
  { text: "ChatGPT가 뭐예요?", icon: "🤖" },
  { text: "카카오톡 사용법 알려주세요", icon: "💬" },
  { text: "유튜브에서 영상 찾는 법", icon: "🎬" },
  { text: "안전한 비밀번호 만드는 법", icon: "🔐" },
  { text: "스마트폰 글씨 크게 하는 법", icon: "📱" },
  { text: "보이스피싱 구별하는 법", icon: "⚠️" },
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[2]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const bffUrl = process.env.NEXT_PUBLIC_BFF_URL || 'https://trenduity-bff.onrender.com';
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${bffUrl}/v1/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '죄송해요, 답변을 생성하지 못했어요. 다시 시도해 주세요.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('AI 채팅 에러:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '네트워크 오류가 발생했어요. 인터넷 연결을 확인해주세요.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/senior" className="text-blue-600 hover:text-blue-700">
                <span className="text-3xl">←</span>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">🤖 AI 도우미</h1>
            </div>
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors"
            >
              <span className="text-2xl">{selectedModel.icon}</span>
              <span className="text-lg font-semibold">{selectedModel.name}</span>
              <span className="text-lg">▼</span>
            </button>
          </div>
        </div>
      </header>

      {/* AI 모델 선택 드롭다운 */}
      {showModelPicker && (
        <div className="absolute top-20 right-4 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-4 z-30 w-80">
          <p className="text-lg font-bold text-gray-900 mb-3">🎯 AI 비서 선택</p>
          {AI_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model);
                setShowModelPicker(false);
                setMessages([{
                  id: 'welcome',
                  role: 'assistant',
                  content: `안녕하세요! 😊 저는 ${model.name}예요.\n\n${model.description}. 궁금한 것이 있으시면 편하게 물어보세요!`,
                  timestamp: new Date(),
                }]);
              }}
              className={`w-full text-left p-4 rounded-xl mb-2 transition-all ${
                selectedModel.id === model.id
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3 mb-1">
                <span className="text-3xl">{model.icon}</span>
                <span className="text-xl font-bold">{model.name}</span>
              </div>
              <p className="text-sm text-gray-600 ml-12">{model.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6" style={{ paddingBottom: '200px' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl p-6 rounded-2xl shadow-md ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border-2 border-gray-200'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">{selectedModel.icon}</span>
                  <span className="text-lg font-bold">{selectedModel.name}</span>
                </div>
              )}
              <p className="text-xl leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-lg text-gray-600">생각 중...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 추천 질문 (메시지가 1개일 때만) */}
      {messages.length === 1 && (
        <div className="px-4 pb-4">
          <p className="text-lg font-bold text-gray-900 mb-3">💡 이런 것을 물어보세요</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="bg-white hover:bg-gray-50 p-4 rounded-xl shadow-md border-2 border-gray-200 transition-colors text-left"
              >
                <span className="text-2xl mb-2 block">{suggestion.icon}</span>
                <span className="text-base text-gray-900">{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
              placeholder="궁금한 것을 물어보세요..."
              className="flex-1 px-6 py-4 text-xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(inputText)}
              disabled={isLoading || !inputText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              보내기 📤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
