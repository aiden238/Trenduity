'use client';

import React from 'react';
import { useToast } from '@/components/ToastProvider';

export default function ToastDemoPage() {
  const toast = useToast();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-slate-100">
          🎉 Toast 알림 시스템 데모
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mb-8">
          4가지 타입의 토스트 알림을 테스트해보세요. 최대 3개까지 표시되며 자동으로 사라집니다.
        </p>

        {/* 기본 토스트 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-slate-200">
            기본 토스트
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => toast.success('카드를 완료했어요!')}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              ✅ Success
            </button>
            <button
              onClick={() => toast.error('오류가 발생했어요.')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              ❌ Error
            </button>
            <button
              onClick={() => toast.warning('이 작업은 되돌릴 수 없어요.')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              ⚠️ Warning
            </button>
            <button
              onClick={() => toast.info('새로운 인사이트가 있어요.')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              ℹ️ Info
            </button>
          </div>
        </section>

        {/* 설명 포함 토스트 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-slate-200">
            설명 포함 토스트
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() =>
                toast.success('포인트 획득!', {
                  description: '오늘의 카드 완료로 +5 포인트를 받았어요.',
                })
              }
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              포인트 획득
            </button>
            <button
              onClick={() =>
                toast.error('네트워크 오류', {
                  description: '인터넷 연결을 확인해 주세요.',
                })
              }
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              네트워크 오류
            </button>
          </div>
        </section>

        {/* 액션 버튼 포함 토스트 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-slate-200">
            액션 버튼 포함
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() =>
                toast.success('배지 획득!', {
                  description: '7일 연속 학습 달성!',
                  action: {
                    label: '확인하기',
                    onPress: () => alert('배지 페이지로 이동'),
                  },
                })
              }
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              배지 획득
            </button>
            <button
              onClick={() =>
                toast.warning('데이터 삭제', {
                  description: '정말로 삭제하시겠어요?',
                  action: {
                    label: '취소',
                    onPress: () => console.log('취소됨'),
                  },
                  duration: 5000,
                })
              }
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              삭제 확인
            </button>
          </div>
        </section>

        {/* 커스텀 지속 시간 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-slate-200">
            커스텀 지속 시간
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() =>
                toast.info('1초 후 사라져요', { duration: 1000 })
              }
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              1초
            </button>
            <button
              onClick={() =>
                toast.info('5초 후 사라져요', { duration: 5000 })
              }
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              5초
            </button>
            <button
              onClick={() =>
                toast.info('10초 후 사라져요', { duration: 10000 })
              }
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              10초
            </button>
          </div>
        </section>

        {/* 스택 테스트 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-slate-200">
            스택 테스트 (최대 3개)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                toast.success('첫 번째 알림');
                setTimeout(() => toast.info('두 번째 알림'), 100);
                setTimeout(() => toast.warning('세 번째 알림'), 200);
                setTimeout(() => toast.error('네 번째 알림 (첫 번째 교체)'), 300);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              4개 연속 표시
            </button>
            <button
              onClick={() => toast.clearAll()}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              모두 닫기
            </button>
          </div>
        </section>

        {/* 다크 모드 안내 */}
        <div className="p-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 다크 모드 테스트
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            우측 상단의 테마 토글 버튼을 눌러 다크 모드에서 토스트 색상을 확인해보세요.
            각 타입별로 다크 모드 전용 색상이 적용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
