'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getFocusClass } from '../utils/focusUtils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, icon }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-lg transition-colors
        ${isActive 
          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-white font-semibold' 
          : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-slate-700'
        }
        ${getFocusClass('default')}
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span>{children}</span>
    </Link>
  );
};

/**
 * Skip to main content 링크
 */
const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        bg-blue-900 text-white px-4 py-3 min-h-[44px] rounded-lg z-50 font-semibold
        ${getFocusClass('visible')}
      `}
    >
      본문으로 건너뛰기
    </a>
  );
};

/**
 * 메인 내비게이션 컴포넌트
 * 키보드 접근성 포함
 */
export const Navigation: React.FC = () => {
  return (
    <>
      <SkipLink />
      <nav
        className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700"
        role="navigation"
        aria-label="주 메뉴"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3">
            <NavLink
              href="/"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              }
            >
              대시보드
            </NavLink>

            <NavLink
              href="/members"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
            >
              가족 멤버
            </NavLink>

            <NavLink
              href="/alerts"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              }
            >
              알림
            </NavLink>

            <NavLink
              href="/encourage"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              }
            >
              응원
            </NavLink>
          </div>
        </div>
      </nav>
    </>
  );
};
