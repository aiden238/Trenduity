/**
 * OptimizedImage 컴포넌트
 * Next.js Image를 래핑하여 자동 최적화, WebP 변환, blur placeholder 제공
 */

'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Spinner } from './Spinner';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  /** 이미지 소스 (URL 또는 import) */
  src: string | StaticImageData;
  /** 대체 텍스트 (접근성 필수) */
  alt: string;
  /** 블러 placeholder 사용 여부 */
  useBlur?: boolean;
  /** 폴백 이미지 (로드 실패 시) */
  fallbackSrc?: string;
  /** 로딩 상태 표시 */
  showSpinner?: boolean;
  /** 이미지 비율 유지 (aspect-ratio) */
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | 'auto';
  /** 둥근 모서리 */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** 테두리 */
  bordered?: boolean;
  /** 그림자 */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

// StaticImageData 타입 정의 (Next.js Image import)
type StaticImageData = {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
};

/**
 * 이미지 최적화 컴포넌트
 * - WebP/AVIF 자동 변환
 * - Lazy loading (viewport 진입 시 로드)
 * - Blur placeholder (로딩 중 흐린 이미지 표시)
 * - 반응형 sizes 자동 계산
 * - 오류 처리 및 폴백
 */
export const OptimizedImage = React.forwardRef<HTMLDivElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      useBlur = true,
      fallbackSrc = '/images/placeholder.png',
      showSpinner = true,
      aspectRatio = 'auto',
      rounded = 'md',
      bordered = false,
      shadow = 'none',
      className = '',
      onLoadingComplete,
      onError,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imgSrc, setImgSrc] = useState(src);

    // Aspect ratio CSS 클래스
    const aspectRatioClasses: Record<string, string> = {
      '1:1': 'aspect-square',
      '4:3': 'aspect-[4/3]',
      '16:9': 'aspect-video',
      '21:9': 'aspect-[21/9]',
      'auto': '',
    };

    // 둥근 모서리 클래스
    const roundedClasses: Record<string, string> = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };

    // 그림자 클래스
    const shadowClasses: Record<string, string> = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    };

    // 이미지 로드 완료 핸들러
    const handleLoadingComplete = (result: any) => {
      setIsLoading(false);
      onLoadingComplete?.(result);
    };

    // 이미지 로드 오류 핸들러
    const handleError = () => {
      console.warn(`Image failed to load: ${src}, using fallback`);
      setHasError(true);
      setImgSrc(fallbackSrc);
      setIsLoading(false);
      onError?.();
    };

    // 컨테이너 클래스
    const containerClasses = [
      'relative overflow-hidden',
      aspectRatioClasses[aspectRatio],
      roundedClasses[rounded],
      shadowClasses[shadow],
      bordered ? 'border-2 border-gray-200 dark:border-slate-700' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={containerClasses}>
        {/* 로딩 스피너 */}
        {isLoading && showSpinner && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-slate-800">
            <Spinner size="sm" />
          </div>
        )}

        {/* 최적화된 이미지 */}
        <Image
          src={imgSrc}
          alt={alt}
          fill={!props.width && !props.height} // width/height 없으면 fill 모드
          sizes={
            props.sizes ||
            '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          } // 반응형 sizes
          placeholder={useBlur ? 'blur' : 'empty'} // blur placeholder
          blurDataURL={
            useBlur && typeof imgSrc === 'string'
              ? generateBlurDataURL(imgSrc)
              : undefined
          }
          quality={hasError ? 75 : 90} // 폴백 이미지는 품질 낮춤
          loading="lazy" // Lazy loading
          onLoadingComplete={handleLoadingComplete}
          onError={handleError}
          className={`
            transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${!props.width && !props.height ? 'object-cover' : ''}
          `}
          {...props}
        />

        {/* 오류 표시 (개발 모드) */}
        {hasError && process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            Image failed
          </div>
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

/**
 * 간단한 blur data URL 생성 (placeholder용)
 * 실제로는 서버에서 생성하거나 빌드 타임에 생성하는 것이 좋음
 */
function generateBlurDataURL(src: string): string {
  // SVG placeholder (10x10 회색 사각형)
  const svg = `
    <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
      <rect width="10" height="10" fill="#e5e7eb"/>
    </svg>
  `;
  
  // Base64 인코딩
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Avatar 전용 최적화 이미지
 * 1:1 비율, 둥근 모서리
 */
export const OptimizedAvatar: React.FC<
  Omit<OptimizedImageProps, 'aspectRatio' | 'rounded'>
> = (props) => {
  return (
    <OptimizedImage
      {...props}
      aspectRatio="1:1"
      rounded="full"
      bordered
      shadow="sm"
    />
  );
};

/**
 * 카드 이미지 전용 최적화 이미지
 * 16:9 비율, 약간 둥근 모서리
 */
export const OptimizedCardImage: React.FC<
  Omit<OptimizedImageProps, 'aspectRatio'>
> = (props) => {
  return (
    <OptimizedImage
      {...props}
      aspectRatio="16:9"
      rounded="lg"
      shadow="md"
    />
  );
};

/**
 * 배경 이미지 전용 최적화 이미지
 * fill 모드, cover 스타일
 */
interface OptimizedBackgroundProps extends Omit<OptimizedImageProps, 'fill'> {
  overlay?: boolean;
  overlayOpacity?: number;
}

export const OptimizedBackground: React.FC<OptimizedBackgroundProps> = ({
  overlay = false,
  overlayOpacity = 0.5,
  children,
  ...props
}) => {
  return (
    <div className="relative w-full h-full">
      <OptimizedImage
        {...props}
        className={`${props.className || ''}`}
      />
      
      {/* 오버레이 */}
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {/* 콘텐츠 */}
      {children && (
        <div className="absolute inset-0 z-10">
          {children}
        </div>
      )}
    </div>
  );
};
