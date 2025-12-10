'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DrawerProvider, useDrawer } from '../contexts/DrawerContext';
import Drawer from '../components/Drawer';

function SeniorContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toggleDrawer } = useDrawer();
  
  // AI 채팅 페이지는 별도 레이아웃
  const isFullScreen = pathname === '/senior/chat';

  return (
    <React.Fragment>
      <Drawer />
      
      {!isFullScreen && (
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDrawer}
                  className="text-gray-600 hover:text-gray-900 text-5xl"
                  aria-label="메뉴 열기"
                >
                  ☰
                </button>
                <div>
                  <h1 className="text-4xl font-bold text-blue-600">🎓 Trenduity</h1>
                  <p className="text-sm text-gray-500 mt-1">디지털/AI 세상을 쉽게</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/senior/chat"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-2xl font-bold shadow-lg transition-all hover:shadow-xl flex items-center space-x-2"
                >
                  <span>🤖</span>
                  <span>AI 도우미</span>
                </Link>
                <Link
                  href="/senior/settings"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-md transition-all hover:shadow-lg flex items-center space-x-2"
                >
                  <span>⚙️</span>
                  <span>설정</span>
                </Link>
              </div>
            </div>
          </div>
        </header>
      )}
      
      {children}
      
      {!isFullScreen && (
        <>
          {/* 하단 네비게이션 (모바일 스타일) */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-2">
              <div className="flex justify-around items-center py-3">
                <Link
                  href="/senior"
                  className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-colors ${
                    pathname === '/senior' ? 'bg-blue-100' : 'hover:bg-blue-50'
                  }`}
                >
                  <span className="text-3xl">🏠</span>
                  <span className={`text-sm font-semibold ${
                    pathname === '/senior' ? 'text-blue-600' : 'text-gray-700'
                  }`}>홈</span>
                </Link>
                
                <Link
                  href="/senior/insights"
                  className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-colors ${
                    pathname?.startsWith('/senior/insights') ? 'bg-blue-100' : 'hover:bg-blue-50'
                  }`}
                >
                  <span className="text-3xl">📚</span>
                  <span className={`text-sm font-semibold ${
                    pathname?.startsWith('/senior/insights') ? 'text-blue-600' : 'text-gray-700'
                  }`}>배움</span>
                </Link>
                
                <Link
                  href="/senior/community"
                  className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-colors ${
                    pathname === '/senior/community' ? 'bg-blue-100' : 'hover:bg-blue-50'
                  }`}
                >
                  <span className="text-3xl">🤝</span>
                  <span className={`text-sm font-semibold ${
                    pathname === '/senior/community' ? 'text-blue-600' : 'text-gray-700'
                  }`}>나눔터</span>
                </Link>
                
                <Link
                  href="/senior/finance"
                  className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-colors ${
                    pathname === '/senior/finance' ? 'bg-blue-100' : 'hover:bg-blue-50'
                  }`}
                >
                  <span className="text-3xl">💰</span>
                  <span className={`text-sm font-semibold ${
                    pathname === '/senior/finance' ? 'text-blue-600' : 'text-gray-700'
                  }`}>재테크</span>
                </Link>
                
                <Link
                  href="/senior/settings"
                  className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-colors ${
                    pathname?.startsWith('/senior/settings') ? 'bg-blue-100' : 'hover:bg-blue-50'
                  }`}
                >
                  <span className="text-3xl">👤</span>
                  <span className={`text-sm font-semibold ${
                    pathname?.startsWith('/senior/settings') ? 'text-blue-600' : 'text-gray-700'
                  }`}>마이페이지</span>
                </Link>
              </div>
            </div>
          </nav>
          
          {/* 하단 네비게이션 공간 확보 */}
          <div className="h-20"></div>
        </>
      )}
    </React.Fragment>
  );
}

export default function SeniorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DrawerProvider>
      <SeniorContent>{children}</SeniorContent>
    </DrawerProvider>
  );
}
