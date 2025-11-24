/**
 * WCAG AAA 준수 테스트 페이지
 * 색상 대비, 터치 영역, 포커스 인디케이터 검증
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { 
  checkContrast, 
  validateColorPalette, 
  AAA_COLOR_PALETTE,
  type ColorPair 
} from '@/utils/colorContrast';

export default function WCAGTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);

  // 색상 대비 테스트
  const runContrastTests = () => {
    const colorPairs: ColorPair[] = [
      // 라이트 모드
      { name: '라이트 - Primary Text', foreground: '#000000', background: '#FFFFFF' },
      { name: '라이트 - Secondary Text', foreground: '#2D3748', background: '#FFFFFF' },
      { name: '라이트 - Tertiary Text', foreground: '#4A5568', background: '#FFFFFF' },
      { name: '라이트 - Primary Button', foreground: '#FFFFFF', background: '#1E40AF' },
      { name: '라이트 - Danger Button', foreground: '#FFFFFF', background: '#B91C1C' },
      { name: '라이트 - Success', foreground: '#047857', background: '#FFFFFF' },
      { name: '라이트 - Warning', foreground: '#92400E', background: '#FFFFFF' },
      
      // 다크 모드
      { name: '다크 - Primary Text', foreground: '#FFFFFF', background: '#0F172A' },
      { name: '다크 - Secondary Text', foreground: '#CBD5E1', background: '#0F172A' },
      { name: '다크 - Tertiary Text', foreground: '#94A3B8', background: '#0F172A' },
      { name: '다크 - Primary Button', foreground: '#FFFFFF', background: '#60A5FA' },
      { name: '다크 - Danger Button', foreground: '#FFFFFF', background: '#F87171' },
      { name: '다크 - Success', foreground: '#34D399', background: '#0F172A' },
      { name: '다크 - Warning', foreground: '#FCD34D', background: '#0F172A' },
    ];

    const results = validateColorPalette(colorPairs);
    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          WCAG AAA 준수 테스트
        </h1>
        <p className="text-gray-700 dark:text-slate-300 mb-8">
          색상 대비 (7:1), 터치 영역 (44px+), 포커스 인디케이터 검증
        </p>

        {/* 색상 대비 테스트 */}
        <section className="mb-12" aria-labelledby="contrast-heading">
          <h2 id="contrast-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            1. 색상 대비 테스트 (7:1 AAA)
          </h2>
          
          <Button onClick={runContrastTests} className="mb-4">
            색상 대비 검증 실행
          </Button>

          {testResults.length > 0 && (
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-slate-600">
                    <th className="text-left py-2 text-gray-900 dark:text-white">색상 조합</th>
                    <th className="text-left py-2 text-gray-900 dark:text-white">대비율</th>
                    <th className="text-left py-2 text-gray-900 dark:text-white">AA</th>
                    <th className="text-left py-2 text-gray-900 dark:text-white">AAA</th>
                    <th className="text-left py-2 text-gray-900 dark:text-white">레벨</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((test, idx) => (
                    <tr key={idx} className="border-b border-gray-200 dark:border-slate-700">
                      <td className="py-3 text-gray-800 dark:text-slate-200">
                        {test.pair.name}
                      </td>
                      <td className="py-3 text-gray-800 dark:text-slate-200">
                        {test.result.ratio}:1
                      </td>
                      <td className="py-3">
                        <span className={test.result.passAA ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                          {test.result.passAA ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={test.result.passAAA ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                          {test.result.passAAA ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${
                          test.result.level === 'AAA' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : test.result.level === 'AA'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {test.result.level.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 터치 영역 테스트 */}
        <section className="mb-12" aria-labelledby="touch-heading">
          <h2 id="touch-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            2. 터치 영역 테스트 (최소 44x44px)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Small (44px)</h3>
              <Button size="sm" fullWidth>
                Small Button
              </Button>
              <p className="text-sm text-gray-700 dark:text-slate-300 mt-2">min-h-[44px]</p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Medium (48px)</h3>
              <Button size="md" fullWidth>
                Medium Button
              </Button>
              <p className="text-sm text-gray-700 dark:text-slate-300 mt-2">min-h-[48px]</p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Large (56px)</h3>
              <Button size="lg" fullWidth>
                Large Button
              </Button>
              <p className="text-sm text-gray-700 dark:text-slate-300 mt-2">min-h-[56px]</p>
            </div>
          </div>
        </section>

        {/* 포커스 인디케이터 테스트 */}
        <section className="mb-12" aria-labelledby="focus-heading">
          <h2 id="focus-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            3. 포커스 인디케이터 테스트 (3px outline)
          </h2>
          
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <p className="text-gray-800 dark:text-slate-200 mb-4">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-slate-700 rounded">Tab</kbd> 키로 포커스를 이동하고 
              outline이 명확히 보이는지 확인하세요.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Input 포커스 테스트"
                className="px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-3 focus:ring-blue-800 dark:focus:ring-blue-400"
              />
            </div>

            <div className="mt-4">
              <a 
                href="#" 
                className="text-blue-800 dark:text-blue-400 underline focus:outline-none focus:ring-3 focus:ring-blue-800 dark:focus:ring-blue-400 rounded px-1"
              >
                Link 포커스 테스트
              </a>
            </div>
          </div>
        </section>

        {/* 색상 팔레트 미리보기 */}
        <section aria-labelledby="palette-heading">
          <h2 id="palette-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            4. AAA 색상 팔레트
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 라이트 모드 */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">라이트 모드</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">Primary Text</span>
                  <div className="w-20 h-10 bg-black rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.light.text.primary }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">Secondary Text</span>
                  <div className="w-20 h-10 rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.light.text.secondary }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">Primary Button</span>
                  <div className="w-20 h-10 rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.light.primary.DEFAULT }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">Success</span>
                  <div className="w-20 h-10 rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.light.success.DEFAULT }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">Danger</span>
                  <div className="w-20 h-10 rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.light.danger.DEFAULT }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">Warning</span>
                  <div className="w-20 h-10 rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.light.warning.DEFAULT }} />
                </div>
              </div>
            </div>

            {/* 다크 모드 */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">다크 모드</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white">Primary Text</span>
                  <div className="w-20 h-10 bg-white rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.dark.text.primary }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Secondary Text</span>
                  <div className="w-20 h-10 rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.dark.text.secondary }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Primary Button</span>
                  <div className="w-20 h-10 rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.dark.primary.DEFAULT }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Success</span>
                  <div className="w-20 h-10 rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.dark.success.DEFAULT }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Danger</span>
                  <div className="w-20 h-10 rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.dark.danger.DEFAULT }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Warning</span>
                  <div className="w-20 h-10 rounded" style={{ backgroundColor: AAA_COLOR_PALETTE.dark.warning.DEFAULT }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
