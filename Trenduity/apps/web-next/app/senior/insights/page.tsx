'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const TOPICS = [
  { key: undefined, label: '전체', icon: '📚' },
  { key: 'ai_tools', label: 'AI 활용', icon: '🤖' },
  { key: 'digital_safety', label: '디지털 안전', icon: '🛡️' },
  { key: 'health', label: '건강', icon: '💊' },
  { key: 'finance', label: '금융', icon: '💰' },
];

const MOCK_INSIGHTS = [
  {
    id: 'insight-1',
    title: 'ChatGPT 완전 정복 가이드',
    summary: 'ChatGPT를 처음 사용하시는 분들을 위한 완벽 가이드입니다. 회원가입부터 실제 활용까지 단계별로 알려드려요.',
    topic: 'ai_tools',
    published_at: '2024-12-05',
    read_time_min: 5,
    view_count: 1247,
    emoji: '🤖',
  },
  {
    id: 'insight-2',
    title: '스미싱 문자 100% 구별하는 방법',
    summary: '최근 급증하는 스미싱 사기! 가짜 문자를 구별하는 5가지 핵심 포인트를 알려드립니다.',
    topic: 'digital_safety',
    published_at: '2024-12-04',
    read_time_min: 3,
    view_count: 2891,
    emoji: '🛡️',
  },
  {
    id: 'insight-3',
    title: '하루 30분 걷기의 놀라운 효과',
    summary: '매일 30분 걷기만 해도 건강이 확 좋아집니다. 과학적으로 증명된 걷기의 효과를 알아보세요.',
    topic: 'health',
    published_at: '2024-12-03',
    read_time_min: 4,
    view_count: 1823,
    emoji: '💊',
  },
  {
    id: 'insight-4',
    title: '은행 앱으로 이체하는 방법',
    summary: '은행 앱을 처음 사용하시나요? 계좌이체하는 방법을 쉽게 알려드려요.',
    topic: 'finance',
    published_at: '2024-12-02',
    read_time_min: 4,
    view_count: 956,
    emoji: '💰',
  },
  {
    id: 'insight-5',
    title: '카카오톡 영상통화 완전 정복',
    summary: '가족과 무료로 얼굴 보며 통화하세요! 카카오톡 영상통화 방법을 알려드려요.',
    topic: 'ai_tools',
    published_at: '2024-12-01',
    read_time_min: 3,
    view_count: 3102,
    emoji: '📱',
  },
];

export default function InsightsPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);
  const [insights, setInsights] = useState(MOCK_INSIGHTS);

  const filteredInsights = selectedTopic
    ? insights.filter(insight => insight.topic === selectedTopic)
    : insights;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/senior" className="text-blue-600 hover:text-blue-700 text-2xl">
                ← 뒤로
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">📚 오늘의 배움</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 주제 필터 */}
      <div className="bg-white border-b sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.key || 'all'}
                onClick={() => setSelectedTopic(topic.key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-lg whitespace-nowrap transition-all ${
                  selectedTopic === topic.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-2xl">{topic.icon}</span>
                <span>{topic.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 인사이트 목록 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {filteredInsights.map((insight) => (
            <Link
              key={insight.id}
              href={`/senior/insights/${insight.id}`}
              className="block bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300"
            >
              <div className="flex items-start space-x-6">
                {/* 이모지 아이콘 */}
                <div className="text-6xl flex-shrink-0">{insight.emoji}</div>
                
                {/* 콘텐츠 */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {insight.title}
                  </h2>
                  <p className="text-xl text-gray-700 mb-4 leading-relaxed">
                    {insight.summary}
                  </p>
                  
                  {/* 메타 정보 */}
                  <div className="flex items-center space-x-6 text-gray-600">
                    <span className="flex items-center space-x-2 text-lg">
                      <span>⏱️</span>
                      <span>{insight.read_time_min}분</span>
                    </span>
                    <span className="flex items-center space-x-2 text-lg">
                      <span>👁️</span>
                      <span>{insight.view_count.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-2 text-lg">
                      <span>📅</span>
                      <span>{new Date(insight.published_at).toLocaleDateString('ko-KR')}</span>
                    </span>
                  </div>
                </div>

                {/* 화살표 */}
                <div className="text-4xl text-blue-600 flex-shrink-0">→</div>
              </div>
            </Link>
          ))}
        </div>

        {filteredInsights.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📚</div>
            <p className="text-2xl text-gray-600 font-semibold">
              아직 이 주제의 콘텐츠가 없어요
            </p>
            <p className="text-xl text-gray-500 mt-2">
              곧 다양한 학습 자료를 준비할게요!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
