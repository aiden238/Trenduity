'use client';

import { useState } from 'react';
import Link from 'next/link';

interface IncomeCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  items: IncomeItem[];
}

interface IncomeItem {
  id: string;
  title: string;
  description: string;
  difficulty: '쉬움' | '보통' | '어려움';
  income: string;
  timeRequired: string;
}

const INCOME_CATEGORIES: IncomeCategory[] = [
  {
    id: 'online',
    title: '온라인 부업',
    icon: '💻',
    description: '집에서 할 수 있는 온라인 활동',
    color: '#3B82F6',
    items: [
      {
        id: 'survey',
        title: '설문조사 참여',
        description: '간단한 설문에 답하고 포인트를 모아요',
        difficulty: '쉬움',
        income: '월 2~5만원',
        timeRequired: '하루 30분',
      },
      {
        id: 'review',
        title: '제품 리뷰 작성',
        description: '구매한 제품의 후기를 작성해요',
        difficulty: '쉬움',
        income: '건당 1천~5천원',
        timeRequired: '30분~1시간',
      },
      {
        id: 'data_entry',
        title: '단순 데이터 입력',
        description: '엑셀, 문서 작업을 해요',
        difficulty: '보통',
        income: '건당 1~3만원',
        timeRequired: '2~3시간',
      },
    ],
  },
  {
    id: 'craft',
    title: '수공예/제작',
    icon: '🎨',
    description: '손재주를 활용한 부업',
    color: '#EC4899',
    items: [
      {
        id: 'knitting',
        title: '뜨개질/바느질',
        description: '손뜨개 제품을 만들어 판매해요',
        difficulty: '보통',
        income: '제품당 1~5만원',
        timeRequired: '제품별 다름',
      },
      {
        id: 'cooking',
        title: '반찬/떡 판매',
        description: '집밥 솜씨를 살려 판매해요',
        difficulty: '보통',
        income: '월 30~100만원',
        timeRequired: '주 3~4일',
      },
      {
        id: 'gardening',
        title: '화분/식물 분양',
        description: '키운 식물을 분양해요',
        difficulty: '쉬움',
        income: '화분당 5천~3만원',
        timeRequired: '평소 관리',
      },
    ],
  },
  {
    id: 'local',
    title: '동네 부업',
    icon: '🏘️',
    description: '근처에서 할 수 있는 활동',
    color: '#10B981',
    items: [
      {
        id: 'delivery',
        title: '전단지 배달',
        description: '동네 전단지를 배달해요',
        difficulty: '쉬움',
        income: '건당 3~5만원',
        timeRequired: '3~4시간',
      },
      {
        id: 'cleaning',
        title: '가사도우미',
        description: '청소, 정리정돈을 도와드려요',
        difficulty: '보통',
        income: '시간당 1.5~2만원',
        timeRequired: '2~4시간',
      },
      {
        id: 'pet_sitting',
        title: '반려동물 돌봄',
        description: '이웃의 반려동물을 돌봐요',
        difficulty: '보통',
        income: '일당 3~5만원',
        timeRequired: '하루',
      },
    ],
  },
  {
    id: 'gov_support',
    title: '정부 지원금',
    icon: '🏛️',
    description: '받을 수 있는 정부 혜택',
    color: '#8B5CF6',
    items: [
      {
        id: 'senior_job',
        title: '노인 일자리 사업',
        description: '정부 지원 시니어 일자리',
        difficulty: '쉬움',
        income: '월 27~50만원',
        timeRequired: '주 3~5일',
      },
      {
        id: 'basic_pension',
        title: '기초연금',
        description: '65세 이상 소득하위 70%',
        difficulty: '쉬움',
        income: '월 최대 32만원',
        timeRequired: '신청만',
      },
      {
        id: 'energy_voucher',
        title: '에너지 바우처',
        description: '난방비/전기료 지원',
        difficulty: '쉬움',
        income: '연간 최대 19만원',
        timeRequired: '신청만',
      },
    ],
  },
];

export default function FinancePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '쉬움': return 'bg-green-100 text-green-700';
      case '보통': return 'bg-yellow-100 text-yellow-700';
      case '어려움': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">💰 재테크 정보</h1>
        <p className="text-lg text-green-100">시니어를 위한 부업 & 지원금 정보</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 안내 배너 */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-4xl">💡</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">안전하게 부업하세요!</h3>
              <ul className="space-y-1 text-base text-gray-700">
                <li>• 선입금 요구하는 곳은 피하세요</li>
                <li>• 정부 지원금은 무료로 신청 가능해요</li>
                <li>• 의심스러우면 가족에게 먼저 물어보세요</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 카테고리 목록 */}
        <div className="space-y-4">
          {INCOME_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className={`bg-white rounded-2xl shadow-md border-2 transition-all ${
                selectedCategory === category.id
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}
            >
              <button
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-5xl">{category.icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                      <p className="text-base text-gray-600 mt-1">{category.description}</p>
                    </div>
                  </div>
                  <span className="text-3xl text-gray-400">
                    {selectedCategory === category.id ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* 확장된 아이템 목록 */}
              {selectedCategory === category.id && (
                <div className="px-6 pb-6 space-y-3">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-base text-gray-700 mb-3">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getDifficultyColor(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                        <span className="text-base font-semibold text-blue-600">
                          💰 {item.income}
                        </span>
                        <span className="text-base text-gray-600">
                          ⏰ {item.timeRequired}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 추가 정보 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mt-6">
          <h3 className="text-xl font-bold text-blue-900 mb-3">📞 도움이 필요하신가요?</h3>
          <div className="space-y-2 text-base text-gray-700">
            <p>• <strong>노인 일자리 지원기관:</strong> ☎ 1577-1389</p>
            <p>• <strong>기초연금 문의:</strong> ☎ 129 (보건복지상담센터)</p>
            <p>• <strong>에너지 바우처:</strong> ☎ 1661-4232</p>
          </div>
        </div>
      </div>
    </div>
  );
}
