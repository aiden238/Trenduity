/**
 * Modal 컴포넌트 - 동적 로드
 * 조건부 렌더링 최적화
 */

'use client';

import dynamic from 'next/dynamic';
import { Spinner } from './Spinner';

/**
 * Modal 컴포넌트 Lazy Loading
 * 모달이 열릴 때만 로드 (초기 번들 크기 절감)
 */
export const LazyModal = dynamic(
  () => import('./Modal').then(mod => ({ default: mod.Modal })),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8">
          <Spinner />
        </div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Toast Provider - 동적 로드
 * 앱 최상단이지만 초기 로드 시 불필요
 */
export const LazyToastProvider = dynamic(
  () => import('./ToastProvider').then(mod => ({ default: mod.ToastProvider })),
  {
    loading: () => null, // Provider는 UI 없음
    ssr: false,
  }
);
