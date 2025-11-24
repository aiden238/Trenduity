/**
 * 이미지 최적화 데모 페이지
 * OptimizedImage 컴포넌트 사용 예시 및 성능 비교
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  OptimizedImage, 
  OptimizedAvatar, 
  OptimizedCardImage,
  OptimizedBackground 
} from '@/components/OptimizedImage';
import { Button } from '@/components/Button';
import { 
  checkWebPSupport, 
  checkAVIFSupport,
  preloadImages,
  generateResponsiveSizes,
  IMAGE_SIZE_LIMITS,
  IMAGE_QUALITY
} from '@/utils/imageOptimization';

export default function ImageOptimizationDemo() {
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  const [avifSupported, setAvifSupported] = useState<boolean | null>(null);
  const [loadTimes, setLoadTimes] = useState<Record<string, number>>({});

  useEffect(() => {
    // 브라우저 지원 확인
    checkWebPSupport().then(setWebpSupported);
    checkAVIFSupport().then(setAvifSupported);

    // 중요 이미지 프리로드
    preloadImages([
      'https://via.placeholder.com/800x600.png',
    ]);
  }, []);

  // 이미지 로드 시간 측정
  const measureLoadTime = (name: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = Math.round(endTime - startTime);
      setLoadTimes(prev => ({ ...prev, [name]: loadTime }));
    };
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          이미지 최적화 데모
        </h1>
        <p className="text-gray-800 dark:text-slate-300 mb-8">
          Next.js Image, WebP/AVIF, lazy loading, blur placeholder 비교
        </p>

        {/* 브라우저 지원 정보 */}
        <section className="mb-12 bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            브라우저 지원
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg">
              <span className="text-gray-900 dark:text-white font-semibold">WebP</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                webpSupported 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {webpSupported === null ? '확인 중...' : webpSupported ? '지원됨 ✓' : '미지원 ✗'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg">
              <span className="text-gray-900 dark:text-white font-semibold">AVIF</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                avifSupported 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {avifSupported === null ? '확인 중...' : avifSupported ? '지원됨 ✓' : '미지원 ✗'}
              </span>
            </div>
          </div>
        </section>

        {/* 1. 기본 사용법 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            1. 기본 OptimizedImage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                일반 &lt;img&gt; 태그
              </h3>
              <img
                src="https://via.placeholder.com/800x600.png"
                alt="일반 이미지"
                className="w-full rounded-lg"
                onLoad={measureLoadTime('regular-img')}
              />
              {loadTimes['regular-img'] && (
                <p className="mt-2 text-sm text-gray-700 dark:text-slate-300">
                  로드 시간: {loadTimes['regular-img']}ms
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                OptimizedImage (WebP/AVIF + Lazy)
              </h3>
              <OptimizedImage
                src="https://via.placeholder.com/800x600.png"
                alt="최적화된 이미지"
                width={800}
                height={600}
                useBlur
                onLoadingComplete={measureLoadTime('optimized-img')}
              />
              {loadTimes['optimized-img'] && (
                <p className="mt-2 text-sm text-gray-700 dark:text-slate-300">
                  로드 시간: {loadTimes['optimized-img']}ms
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 2. Aspect Ratio 예시 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            2. Aspect Ratio 변형
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">1:1 (정사각형)</p>
              <OptimizedImage
                src="https://via.placeholder.com/400x400.png"
                alt="1:1"
                width={400}
                height={400}
                aspectRatio="1:1"
              />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">4:3 (전통)</p>
              <OptimizedImage
                src="https://via.placeholder.com/400x300.png"
                alt="4:3"
                width={400}
                height={300}
                aspectRatio="4:3"
              />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">16:9 (와이드)</p>
              <OptimizedImage
                src="https://via.placeholder.com/1600x900.png"
                alt="16:9"
                width={1600}
                height={900}
                aspectRatio="16:9"
              />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">21:9 (울트라와이드)</p>
              <OptimizedImage
                src="https://via.placeholder.com/2100x900.png"
                alt="21:9"
                width={2100}
                height={900}
                aspectRatio="21:9"
              />
            </div>
          </div>
        </section>

        {/* 3. 스타일 변형 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            3. 스타일 변형 (rounded, bordered, shadow)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">기본</p>
              <OptimizedImage
                src="https://via.placeholder.com/300x300.png"
                alt="기본"
                width={300}
                height={300}
                rounded="none"
              />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">Rounded + Border</p>
              <OptimizedImage
                src="https://via.placeholder.com/300x300.png"
                alt="둥근 모서리"
                width={300}
                height={300}
                rounded="lg"
                bordered
              />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">그림자</p>
              <OptimizedImage
                src="https://via.placeholder.com/300x300.png"
                alt="그림자"
                width={300}
                height={300}
                rounded="md"
                shadow="xl"
              />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">전체 조합</p>
              <OptimizedImage
                src="https://via.placeholder.com/300x300.png"
                alt="전체 조합"
                width={300}
                height={300}
                rounded="full"
                bordered
                shadow="lg"
              />
            </div>
          </div>
        </section>

        {/* 4. 전용 컴포넌트 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            4. 전용 컴포넌트
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Avatar */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                OptimizedAvatar
              </h3>
              <div className="flex items-center gap-4">
                <OptimizedAvatar
                  src="https://via.placeholder.com/128x128.png"
                  alt="아바타 1"
                  width={64}
                  height={64}
                />
                <OptimizedAvatar
                  src="https://via.placeholder.com/128x128.png"
                  alt="아바타 2"
                  width={96}
                  height={96}
                />
                <OptimizedAvatar
                  src="https://via.placeholder.com/128x128.png"
                  alt="아바타 3"
                  width={128}
                  height={128}
                />
              </div>
              <p className="mt-3 text-sm text-gray-700 dark:text-slate-300">
                1:1 비율, 둥근 모서리, 테두리 자동 적용
              </p>
            </div>

            {/* Card Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                OptimizedCardImage
              </h3>
              <OptimizedCardImage
                src="https://via.placeholder.com/800x450.png"
                alt="카드 이미지"
                width={800}
                height={450}
              />
              <p className="mt-3 text-sm text-gray-700 dark:text-slate-300">
                16:9 비율, 둥근 모서리, 그림자 자동 적용
              </p>
            </div>

            {/* Background */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                OptimizedBackground
              </h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <OptimizedBackground
                  src="https://via.placeholder.com/1200x800.png"
                  alt="배경 이미지"
                  width={1200}
                  height={800}
                  overlay
                  overlayOpacity={0.4}
                >
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white text-2xl font-bold">콘텐츠</p>
                  </div>
                </OptimizedBackground>
              </div>
              <p className="mt-3 text-sm text-gray-700 dark:text-slate-300">
                fill 모드, 오버레이, 콘텐츠 레이어 지원
              </p>
            </div>
          </div>
        </section>

        {/* 5. 성능 최적화 설정 */}
        <section className="mb-12 bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            5. 성능 최적화 설정
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                이미지 크기 제한
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-slate-600">
                    <th className="text-left py-2 text-gray-900 dark:text-white">용도</th>
                    <th className="text-right py-2 text-gray-900 dark:text-white">크기</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-slate-300">
                  <tr>
                    <td className="py-2">Avatar</td>
                    <td className="text-right">256x256</td>
                  </tr>
                  <tr>
                    <td className="py-2">Thumbnail</td>
                    <td className="text-right">400x300</td>
                  </tr>
                  <tr>
                    <td className="py-2">Card</td>
                    <td className="text-right">800x600</td>
                  </tr>
                  <tr>
                    <td className="py-2">Hero</td>
                    <td className="text-right">1920x1080</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                이미지 품질
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-slate-600">
                    <th className="text-left py-2 text-gray-900 dark:text-white">레벨</th>
                    <th className="text-right py-2 text-gray-900 dark:text-white">품질 (%)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-slate-300">
                  <tr>
                    <td className="py-2">Low</td>
                    <td className="text-right">60</td>
                  </tr>
                  <tr>
                    <td className="py-2">Medium</td>
                    <td className="text-right">75</td>
                  </tr>
                  <tr>
                    <td className="py-2">High</td>
                    <td className="text-right">90</td>
                  </tr>
                  <tr>
                    <td className="py-2">Max</td>
                    <td className="text-right">100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 6. Lazy Loading 테스트 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            6. Lazy Loading (스크롤 다운하여 확인)
          </h2>
          <div className="space-y-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  이미지 {i + 1} (viewport 진입 시 로드)
                </h3>
                <OptimizedImage
                  src={`https://via.placeholder.com/800x400.png?text=Image+${i + 1}`}
                  alt={`Lazy 이미지 ${i + 1}`}
                  width={800}
                  height={400}
                  useBlur
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
