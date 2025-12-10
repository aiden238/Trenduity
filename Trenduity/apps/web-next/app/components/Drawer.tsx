'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDrawer } from '../contexts/DrawerContext';

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  category?: string;
}

const MENU_ITEMS: MenuItem[] = [
  // 메인 메뉴
  { icon: '🏠', label: '홈', href: '/senior' },
  { icon: '📚', label: '오늘의 배움', href: '/senior/insights' },
  { icon: '🤝', label: '배움의 나눔터', href: '/senior/community' },
  { icon: '💰', label: '재테크', href: '/senior/finance' },
  { icon: '⚙️', label: '마이페이지', href: '/senior/settings' },
  
  // AI 도구
  { icon: '🤖', label: 'AI 도우미', href: '/senior/chat', category: 'AI 도구' },
  
  // 편리한 도구들
  { icon: '🛡️', label: '사기 확인', href: '/senior/tools/scam-check', category: '편리한 도구' },
  { icon: '💊', label: '복약 체크', href: '/senior/tools/med-check', category: '편리한 도구' },
  { icon: '💰', label: '생활요금 체크', href: '/senior/tools/expense', category: '편리한 도구' },
  { icon: '🗺️', label: '길찾기 도우미', href: '/senior/tools/map', category: '편리한 도구' },
  { icon: '🏛️', label: '정부 지원금', href: '/senior/tools/gov-support', category: '편리한 도구' },
  { icon: '📝', label: '메모장', href: '/senior/tools/todo', category: '편리한 도구' },
  
  // 설정
  { icon: '👨‍👩‍👧', label: '가족 연결', href: '/senior/settings/family', category: '설정' },
  { icon: '📱', label: '구독 관리', href: '/senior/settings/subscription', category: '설정' },
];

export default function Drawer() {
  const { isOpen, toggleDrawer } = useDrawer();
  const pathname = usePathname();

  // 카테고리별로 그룹화
  const mainItems = MENU_ITEMS.filter(item => !item.category);
  const aiItems = MENU_ITEMS.filter(item => item.category === 'AI 도구');
  const toolItems = MENU_ITEMS.filter(item => item.category === '편리한 도구');
  const settingItems = MENU_ITEMS.filter(item => item.category === '설정');

  const renderMenuItems = (items: MenuItem[]) => (
    items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={toggleDrawer}
        className={`flex items-center space-x-4 px-6 py-4 rounded-xl transition-all ${
          pathname === item.href
            ? 'bg-blue-100 border-l-4 border-blue-600'
            : 'hover:bg-gray-100'
        }`}
      >
        <span className="text-3xl">{item.icon}</span>
        <span className={`text-xl font-semibold ${
          pathname === item.href ? 'text-blue-600' : 'text-gray-900'
        }`}>
          {item.label}
        </span>
      </Link>
    ))
  );

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleDrawer}
        />
      )}

      {/* 드로어 사이드바 */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">🎓 AI 배움터</h2>
              <button
                onClick={toggleDrawer}
                className="text-white text-3xl hover:bg-blue-500 rounded-lg p-2 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-blue-100 text-lg">모든 메뉴를 한눈에</p>
          </div>

          {/* 메뉴 목록 */}
          <div className="p-4 space-y-6">
            {/* 메인 메뉴 */}
            <div>
              <p className="text-sm font-bold text-gray-500 px-6 mb-2">메인 메뉴</p>
              <div className="space-y-1">
                {renderMenuItems(mainItems)}
              </div>
            </div>

            {/* AI 도구 */}
            <div>
              <p className="text-sm font-bold text-gray-500 px-6 mb-2">AI 도구</p>
              <div className="space-y-1">
                {renderMenuItems(aiItems)}
              </div>
            </div>

            {/* 편리한 도구 */}
            <div>
              <p className="text-sm font-bold text-gray-500 px-6 mb-2">편리한 도구</p>
              <div className="space-y-1">
                {renderMenuItems(toolItems)}
              </div>
            </div>

            {/* 설정 */}
            <div>
              <p className="text-sm font-bold text-gray-500 px-6 mb-2">설정</p>
              <div className="space-y-1">
                {renderMenuItems(settingItems)}
              </div>
            </div>
          </div>

          {/* 하단 정보 */}
          <div className="p-6 border-t-2 border-gray-200 bg-gray-50">
            <p className="text-center text-gray-600 text-sm">
              Trenduity v2.0<br />
              50-70대를 위한 AI 학습 플랫폼
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
