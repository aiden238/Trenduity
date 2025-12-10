'use client';

import Link from 'next/link';

export default function SeniorSettingsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">⚙️ 설정</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* 프로필 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
              👤
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">홍길동님</p>
              <p className="text-xl text-gray-600 mt-1">hong@example.com</p>
            </div>
          </div>
        </div>

        {/* 설정 메뉴 */}
        <div className="space-y-4">
          {/* 접근성 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-900 px-8 py-6 border-b-2 border-gray-100">
              👁️ 화면 설정
            </h2>
            <div className="divide-y divide-gray-100">
              <button className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="text-left">
                  <p className="text-xl font-semibold text-gray-900">글자 크기</p>
                  <p className="text-lg text-gray-600 mt-1">현재: 보통</p>
                </div>
                <span className="text-3xl text-gray-400">→</span>
              </button>
              
              <button className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="text-left">
                  <p className="text-xl font-semibold text-gray-900">다크 모드</p>
                  <p className="text-lg text-gray-600 mt-1">눈이 편한 어두운 화면</p>
                </div>
                <div className="w-16 h-9 bg-gray-300 rounded-full relative">
                  <div className="absolute left-1 top-1 w-7 h-7 bg-white rounded-full"></div>
                </div>
              </button>
            </div>
          </div>

          {/* 알림 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-900 px-8 py-6 border-b-2 border-gray-100">
              🔔 알림 설정
            </h2>
            <div className="divide-y divide-gray-100">
              <button className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="text-left">
                  <p className="text-xl font-semibold text-gray-900">학습 알림</p>
                  <p className="text-lg text-gray-600 mt-1">매일 오전 9시</p>
                </div>
                <div className="w-16 h-9 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-7 h-7 bg-white rounded-full"></div>
                </div>
              </button>
              
              <button className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="text-left">
                  <p className="text-xl font-semibold text-gray-900">복약 알림</p>
                  <p className="text-lg text-gray-600 mt-1">약 먹을 시간 알림</p>
                </div>
                <div className="w-16 h-9 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-7 h-7 bg-white rounded-full"></div>
                </div>
              </button>
            </div>
          </div>

          {/* 가족 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-900 px-8 py-6 border-b-2 border-gray-100">
              👨‍👩‍👧‍👦 가족 연결
            </h2>
            <button className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="text-left">
                <p className="text-xl font-semibold text-gray-900">가족 초대</p>
                <p className="text-lg text-gray-600 mt-1">가족과 학습 현황 공유</p>
              </div>
              <span className="text-3xl text-gray-400">→</span>
            </button>
          </div>

          {/* 도움말 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-900 px-8 py-6 border-b-2 border-gray-100">
              ❓ 도움말
            </h2>
            <div className="divide-y divide-gray-100">
              <button className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="text-left">
                  <p className="text-xl font-semibold text-gray-900">사용 방법</p>
                  <p className="text-lg text-gray-600 mt-1">앱 사용법 배우기</p>
                </div>
                <span className="text-3xl text-gray-400">→</span>
              </button>
              
              <button className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="text-left">
                  <p className="text-xl font-semibold text-gray-900">고객 지원</p>
                  <p className="text-lg text-gray-600 mt-1">문의하기</p>
                </div>
                <span className="text-3xl text-gray-400">→</span>
              </button>
            </div>
          </div>

          {/* 약관 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-100">
              <button className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <p className="text-xl font-semibold text-gray-700">서비스 이용약관</p>
                <span className="text-3xl text-gray-400">→</span>
              </button>
              
              <button className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <p className="text-xl font-semibold text-gray-700">개인정보 처리방침</p>
                <span className="text-3xl text-gray-400">→</span>
              </button>
            </div>
          </div>

          {/* 로그아웃 */}
          <button className="w-full bg-red-500 hover:bg-red-600 text-white py-6 rounded-2xl text-2xl font-bold shadow-lg transition-all hover:shadow-xl">
            로그아웃
          </button>

          {/* 버전 정보 */}
          <div className="text-center py-6">
            <p className="text-xl text-gray-500">버전 2.0.0</p>
            <p className="text-lg text-gray-400 mt-2">© 2024 Trenduity</p>
          </div>
        </div>
      </main>
    </div>
  );
}
