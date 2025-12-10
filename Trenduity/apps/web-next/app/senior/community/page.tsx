'use client';

import Link from 'next/link';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/senior" className="text-blue-600 hover:text-blue-700 text-2xl">
                ← 뒤로
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">🤝 배움의 나눔터</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* 안내 */}
        <div className="bg-blue-50 rounded-2xl p-8 mb-8 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">💬 질문하고 답변해보세요!</h2>
          <p className="text-xl text-blue-800">
            궁금한 것을 물어보고, 알고 계신 것을 나눠주세요. 함께 배우면 더 즐거워요!
          </p>
        </div>

        {/* 질문하기 버튼 */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl text-2xl font-bold shadow-lg mb-8 transition-all hover:shadow-xl">
          ✍️ 질문하기
        </button>

        {/* 질문 목록 (목업) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex-1">
                카카오톡 사진은 어떻게 보내나요?
              </h3>
              <span className="text-2xl ml-4">📱</span>
            </div>
            <p className="text-xl text-gray-600 mb-4">
              손자에게 사진을 보내고 싶은데 방법을 모르겠어요...
            </p>
            <div className="flex items-center justify-between text-lg text-gray-500">
              <span>👤 김영희 · 2시간 전</span>
              <span>💬 답변 3개</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex-1">
                스마트폰 배터리를 오래 쓰려면?
              </h3>
              <span className="text-2xl ml-4">🔋</span>
            </div>
            <p className="text-xl text-gray-600 mb-4">
              배터리가 금방 닳아요. 절약하는 방법 알려주세요.
            </p>
            <div className="flex items-center justify-between text-lg text-gray-500">
              <span>👤 박철수 · 5시간 전</span>
              <span>💬 답변 7개</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex-1">
                유튜브 광고 건너뛰기
              </h3>
              <span className="text-2xl ml-4">📺</span>
            </div>
            <p className="text-xl text-gray-600 mb-4">
              유튜브 볼 때마다 광고가 너무 많아요. 건너뛸 수 있나요?
            </p>
            <div className="flex items-center justify-between text-lg text-gray-500">
              <span>👤 이순자 · 1일 전</span>
              <span>💬 답변 12개</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border-2 border-green-200 bg-green-50">
            <div className="flex items-center space-x-2 mb-3">
              <span className="bg-green-600 text-white px-4 py-1 rounded-full text-lg font-bold">해결됨</span>
            </div>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex-1">
                네이버 페이 사용법
              </h3>
              <span className="text-2xl ml-4">💳</span>
            </div>
            <p className="text-xl text-gray-600 mb-4">
              네이버 페이로 결제하는 방법 알려주세요.
            </p>
            <div className="flex items-center justify-between text-lg text-gray-500">
              <span>👤 최민수 · 2일 전</span>
              <span>💬 답변 5개</span>
            </div>
          </div>
        </div>

        {/* 더보기 */}
        <div className="mt-8 text-center">
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-xl font-bold shadow-lg transition-all hover:shadow-xl">
            더 많은 질문 보기 →
          </button>
        </div>
      </main>
    </div>
  );
}
