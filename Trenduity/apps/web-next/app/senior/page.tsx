'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 시니어용 홈 화면
export default function SeniorHomePage() {
  const [stats, setStats] = useState({
    totalPoints: 0,
    currentStreak: 0,
    cardsCompleted: 0,
  });
  const [todayCard, setTodayCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bffUrl = process.env.NEXT_PUBLIC_BFF_URL || 'https://trenduity-bff.onrender.com';
    
    // 임시 목업 데이터 (BFF 연동 전)
    setStats({
      totalPoints: 450,
      currentStreak: 7,
      cardsCompleted: 15,
    });
    
    setTodayCard({
      id: '1',
      title: 'ChatGPT란 무엇인가요?',
      tldr: 'AI 챗봇의 기본 개념과 일상에서 활용하는 방법을 알아봅니다.',
      category: 'ai_tools',
      duration: 3,
      emoji: '🤖',
    });
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-4 pb-24">
        {/* 인사말 */}
        <div className="mb-4">
          <p className="text-xl text-gray-600 mb-1">안녕하세요 👋</p>
          <h2 className="text-2xl font-bold text-gray-900">오늘도 화이팅!</h2>
        </div>

        {/* 학습 통계 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white mb-4 shadow-lg">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-blue-200 text-sm mb-1">포인트</p>
              <p className="text-3xl font-bold">{stats.totalPoints}</p>
            </div>
            <div className="text-center border-x border-blue-400">
              <p className="text-blue-200 text-sm mb-1">연속 학습</p>
              <p className="text-3xl font-bold">{stats.currentStreak}일</p>
            </div>
            <div className="text-center">
              <p className="text-blue-200 text-sm mb-1">완료 카드</p>
              <p className="text-3xl font-bold">{stats.cardsCompleted}개</p>
            </div>
          </div>
        </div>

        {/* 오늘의 학습 카드 */}
        {todayCard && (
          <div className="bg-white rounded-2xl p-5 shadow-lg mb-4 border-2 border-blue-100">
            <div className="flex items-center mb-3">
              <span className="text-5xl mr-3">{todayCard.emoji}</span>
              <div>
                <p className="text-blue-600 text-base font-semibold mb-1">🎯 오늘의 학습</p>
                <h3 className="text-2xl font-bold text-gray-900">{todayCard.title}</h3>
              </div>
            </div>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">{todayCard.tldr}</p>
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-600">⏱️ 약 {todayCard.duration}분 소요</span>
              <Link
                href={`/senior/card/${todayCard.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xl font-bold shadow-lg transition-all hover:shadow-xl"
              >
                학습 시작하기 →
              </Link>
            </div>
          </div>
        )}

        {/* 주요 기능 메뉴 */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-3">📱 편리한 도구들</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

            <Link
              href="/senior/tools/scam-check"
              className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-300"
            >
              <div className="text-4xl mb-2">🛡️</div>
              <p className="text-lg font-bold text-gray-900">사기 확인</p>
              <p className="text-xs text-gray-600 mt-1">스미싱 검사</p>
            </Link>

            <Link
              href="/senior/tools/expense"
              className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-300"
            >
              <div className="text-4xl mb-2">💰</div>
              <p className="text-lg font-bold text-gray-900">가계부</p>
              <p className="text-xs text-gray-600 mt-1">지출 관리</p>
            </Link>

            <Link
              href="/senior/tools/map"
              className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-300"
            >
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-lg font-bold text-gray-900">길 찾기</p>
              <p className="text-xs text-gray-600 mt-1">지도 안내</p>
            </Link>

            <Link
              href="/senior/tools/gov-support"
              className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-300"
            >
              <div className="text-4xl mb-2">🏛️</div>
              <p className="text-lg font-bold text-gray-900">복지 혜택</p>
              <p className="text-xs text-gray-600 mt-1">정부 지원</p>
            </Link>

            <Link
              href="/senior/tools/todo"
              className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-300"
            >
              <div className="text-4xl mb-2">📝</div>
              <p className="text-lg font-bold text-gray-900">할 일</p>
              <p className="text-xs text-gray-600 mt-1">메모장</p>
            </Link>

            <Link
              href="/senior/medcheck"
              className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-300"
            >
              <div className="text-4xl mb-2">💊</div>
              <p className="text-lg font-bold text-gray-900">복약 체크</p>
              <p className="text-xs text-gray-600 mt-1">약 먹은 시간</p>
            </Link>
          </div>
        </div>

        {/* 긴급 지원 - 주석 처리됨 */}
        {/* 
        <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-3">🚨 긴급 연락처</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="tel:119" className="bg-white rounded-xl p-3 text-center shadow hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-1">🚑</div>
              <p className="text-base font-bold text-gray-900">119</p>
              <p className="text-xs text-gray-600">응급</p>
            </a>
            <a href="tel:112" className="bg-white rounded-xl p-3 text-center shadow hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-1">👮</div>
              <p className="text-base font-bold text-gray-900">112</p>
              <p className="text-xs text-gray-600">경찰</p>
            </a>
            <a href="tel:182" className="bg-white rounded-xl p-3 text-center shadow hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-1">🛡️</div>
              <p className="text-base font-bold text-gray-900">182</p>
              <p className="text-xs text-gray-600">사기 신고</p>
            </a>
            <a href="tel:1577-1389" className="bg-white rounded-xl p-3 text-center shadow hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-1">💬</div>
              <p className="text-base font-bold text-gray-900">1577-1389</p>
              <p className="text-xs text-gray-600">노인학대</p>
            </a>
          </div>
        </div>
        */}
      </main>
    </div>
  );
}
