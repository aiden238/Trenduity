'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * 다크 모드 토글 버튼
 * 라이트/다크/시스템 모드 전환
 */
export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 마운트 후에만 렌더링 (hydration 불일치 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
    );
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        relative w-12 h-12 rounded-lg
        bg-white dark:bg-slate-800
        border-2 border-gray-200 dark:border-slate-600
        shadow-md hover:shadow-lg
        transition-all duration-300
        flex items-center justify-center
        group
      "
      aria-label={`현재 테마: ${theme === 'system' ? '시스템' : theme === 'dark' ? '다크' : '라이트'}. 클릭하여 전환`}
      title={`테마 전환 (현재: ${theme === 'system' ? '시스템' : theme === 'dark' ? '다크' : '라이트'})`}
    >
      {/* 라이트 모드 아이콘 */}
      {currentTheme === 'light' && (
        <svg
          className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      )}

      {/* 다크 모드 아이콘 */}
      {currentTheme === 'dark' && (
        <svg
          className="w-6 h-6 text-slate-300 group-hover:scale-110 transition-transform"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}

      {/* 시스템 모드 표시 (작은 점) */}
      {theme === 'system' && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
      )}
    </button>
  );
}
