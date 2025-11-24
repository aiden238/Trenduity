/**
 * 이미지 최적화 유틸리티
 * blur placeholder, 이미지 크기 계산, WebP 변환 등
 */

/**
 * 이미지 blur placeholder 생성
 * 실제 프로덕션에서는 sharp나 plaiceholder 라이브러리 사용 권장
 */
export async function generateImageBlurDataURL(
  imagePath: string,
  width = 10,
  height = 10
): Promise<string> {
  // 개발 환경에서는 간단한 SVG placeholder
  if (process.env.NODE_ENV === 'development') {
    return generateSVGBlurDataURL(width, height, '#e5e7eb');
  }

  // 프로덕션: sharp 사용 (설치 필요)
  try {
    const sharp = require('sharp');
    const buffer = await sharp(imagePath)
      .resize(width, height, { fit: 'inside' })
      .blur()
      .toBuffer();
    
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.warn('Sharp not available, using SVG placeholder');
    return generateSVGBlurDataURL(width, height, '#e5e7eb');
  }
}

/**
 * SVG blur placeholder 생성
 */
export function generateSVGBlurDataURL(
  width: number,
  height: number,
  color: string
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * 이미지 크기 계산 (aspect ratio 유지)
 */
export function calculateImageDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    };
  }

  if (targetHeight && !targetWidth) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
    };
  }

  if (targetWidth && targetHeight) {
    return {
      width: targetWidth,
      height: targetHeight,
    };
  }

  return {
    width: originalWidth,
    height: originalHeight,
  };
}

/**
 * 반응형 이미지 sizes 속성 생성
 */
export function generateResponsiveSizes(
  layout: 'responsive' | 'fixed' | 'fill' | 'intrinsic',
  breakpoints?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  }
): string {
  if (layout === 'fill') {
    return '100vw';
  }

  if (layout === 'fixed') {
    return '1x';
  }

  // 반응형 breakpoints
  const defaults = {
    sm: '100vw',    // 모바일
    md: '50vw',     // 태블릿
    lg: '33vw',     // 데스크톱
    xl: '25vw',     // 큰 화면
  };

  const sizes = { ...defaults, ...breakpoints };

  return `
    (max-width: 640px) ${sizes.sm},
    (max-width: 1024px) ${sizes.md},
    (max-width: 1280px) ${sizes.lg},
    ${sizes.xl}
  `.trim().replace(/\s+/g, ' ');
}

/**
 * 이미지 URL이 외부 도메인인지 확인
 */
export function isExternalImage(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://');
}

/**
 * 이미지 포맷 확인
 */
export function getImageFormat(src: string): 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'svg' | 'unknown' {
  const lowerSrc = src.toLowerCase();
  
  if (lowerSrc.endsWith('.jpg') || lowerSrc.endsWith('.jpeg')) return 'jpeg';
  if (lowerSrc.endsWith('.png')) return 'png';
  if (lowerSrc.endsWith('.webp')) return 'webp';
  if (lowerSrc.endsWith('.avif')) return 'avif';
  if (lowerSrc.endsWith('.gif')) return 'gif';
  if (lowerSrc.endsWith('.svg')) return 'svg';
  
  return 'unknown';
}

/**
 * WebP 지원 여부 확인 (클라이언트)
 */
export function checkWebPSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
}

/**
 * AVIF 지원 여부 확인 (클라이언트)
 */
export function checkAVIFSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
  });
}

/**
 * 이미지 lazy loading 옵저버 (Intersection Observer)
 */
export function createLazyLoadObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px', // viewport 50px 전에 로드 시작
    threshold: 0.01,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
}

/**
 * 이미지 프리로드 (우선순위 높은 이미지)
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 여러 이미지 프리로드
 */
export async function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

/**
 * 이미지 URL을 Supabase Storage URL로 변환
 */
export function getSupabaseImageURL(
  bucket: string,
  path: string,
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'origin' | 'webp' | 'avif';
  }
): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL not set');
    return path;
  }

  let url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;

  // Transform 파라미터 추가
  if (transform) {
    const params = new URLSearchParams();
    if (transform.width) params.set('width', transform.width.toString());
    if (transform.height) params.set('height', transform.height.toString());
    if (transform.quality) params.set('quality', transform.quality.toString());
    if (transform.format) params.set('format', transform.format);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }

  return url;
}

/**
 * 이미지 크기 제한 (너무 큰 이미지 방지)
 */
export const IMAGE_SIZE_LIMITS = {
  avatar: { width: 256, height: 256 },
  thumbnail: { width: 400, height: 300 },
  card: { width: 800, height: 600 },
  hero: { width: 1920, height: 1080 },
  full: { width: 2560, height: 1440 },
} as const;

/**
 * 이미지 품질 설정 (용도별)
 */
export const IMAGE_QUALITY = {
  low: 60,
  medium: 75,
  high: 90,
  max: 100,
} as const;
