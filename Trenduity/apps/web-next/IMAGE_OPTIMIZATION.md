# 이미지 최적화 가이드

## 개요

Next.js Image 컴포넌트를 활용한 자동 이미지 최적화 시스템입니다.

## 주요 기능

### 1. 자동 포맷 변환
- **AVIF 우선**: 최신 브라우저에서 AVIF 포맷 제공 (WebP 대비 20% 작음)
- **WebP 폴백**: AVIF 미지원 시 WebP 제공 (JPEG 대비 30% 작음)
- **원본 폴백**: 모두 미지원 시 원본 포맷

### 2. Lazy Loading
- Viewport 진입 50px 전에 로드 시작
- 초기 페이지 로드 속도 개선
- 네트워크 대역폭 절약

### 3. Blur Placeholder
- 이미지 로드 중 흐린 placeholder 표시
- Layout Shift 방지 (CLS 개선)
- 로딩 스피너 옵션 제공

### 4. 반응형 이미지
- 디바이스별 최적 크기 자동 선택
- srcset 자동 생성
- 반다운로드 방지

## 사용법

### 기본 사용

\`\`\`tsx
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage
  src="/images/hero.jpg"
  alt="히어로 이미지"
  width={1920}
  height={1080}
  useBlur
/>
\`\`\`

### Avatar 이미지

\`\`\`tsx
import { OptimizedAvatar } from '@/components/OptimizedImage';

<OptimizedAvatar
  src={user.avatar}
  alt={user.name}
  width={128}
  height={128}
/>
\`\`\`

### Card 이미지

\`\`\`tsx
import { OptimizedCardImage } from '@/components/OptimizedImage';

<OptimizedCardImage
  src={card.image}
  alt={card.title}
  width={800}
  height={450}
/>
\`\`\`

### Background 이미지

\`\`\`tsx
import { OptimizedBackground } from '@/components/OptimizedImage';

<OptimizedBackground
  src="/images/bg.jpg"
  alt="배경"
  width={1920}
  height={1080}
  overlay
  overlayOpacity={0.5}
>
  <h1>콘텐츠</h1>
</OptimizedBackground>
\`\`\`

## Props

### OptimizedImage

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | 이미지 URL (필수) |
| `alt` | `string` | - | 대체 텍스트 (필수) |
| `width` | `number` | - | 이미지 너비 |
| `height` | `number` | - | 이미지 높이 |
| `useBlur` | `boolean` | `true` | Blur placeholder 사용 |
| `fallbackSrc` | `string` | - | 로드 실패 시 폴백 이미지 |
| `showSpinner` | `boolean` | `true` | 로딩 스피너 표시 |
| `aspectRatio` | `'1:1' \| '4:3' \| '16:9' \| '21:9' \| 'auto'` | `'auto'` | 종횡비 |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | 둥근 모서리 |
| `bordered` | `boolean` | `false` | 테두리 표시 |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'none'` | 그림자 |

## 성능 최적화 팁

### 1. 이미지 크기 지정
항상 `width`와 `height`를 지정하여 Layout Shift 방지:

\`\`\`tsx
<OptimizedImage
  src="/image.jpg"
  alt="설명"
  width={800}  // ✅
  height={600} // ✅
/>
\`\`\`

### 2. 적절한 품질 설정
용도에 맞는 품질 사용:
- 썸네일: `quality={60}`
- 일반: `quality={75}` (기본)
- 고품질: `quality={90}`

### 3. 적절한 크기
디바이스 최대 크기보다 크게 제공하지 않기:
- 모바일: 최대 640px
- 태블릿: 최대 1024px
- 데스크톱: 최대 1920px

### 4. 중요 이미지 프리로드

\`\`\`tsx
import { preloadImages } from '@/utils/imageOptimization';

useEffect(() => {
  preloadImages([
    '/images/hero.jpg',
    '/images/logo.png',
  ]);
}, []);
\`\`\`

### 5. Lazy Loading 비활성화 (Above the Fold)

화면 상단의 중요 이미지는 즉시 로드:

\`\`\`tsx
<OptimizedImage
  src="/hero.jpg"
  alt="히어로"
  width={1920}
  height={1080}
  priority // lazy loading 비활성화
/>
\`\`\`

## Supabase Storage 연동

\`\`\`tsx
import { getSupabaseImageURL } from '@/utils/imageOptimization';

const imageUrl = getSupabaseImageURL(
  'avatars', // bucket
  'user123.jpg', // path
  {
    width: 256,
    height: 256,
    quality: 80,
    format: 'webp',
  }
);

<OptimizedImage src={imageUrl} alt="아바타" width={256} height={256} />
\`\`\`

## 브라우저 지원 확인

\`\`\`tsx
import { checkWebPSupport, checkAVIFSupport } from '@/utils/imageOptimization';

const webpSupported = await checkWebPSupport();
const avifSupported = await checkAVIFSupport();
\`\`\`

## 데모 페이지

이미지 최적화 기능을 확인하려면:

\`\`\`bash
npm run dev
# http://localhost:3000/image-demo
\`\`\`

## 성능 측정

### Lighthouse 점수 개선
- **LCP (Largest Contentful Paint)**: 2.5초 이하
- **CLS (Cumulative Layout Shift)**: 0.1 이하
- **FID (First Input Delay)**: 100ms 이하

### Bundle 크기 절감
- 일반 이미지 대비 30-50% 크기 감소
- Lazy loading으로 초기 로드 속도 개선

## 주의사항

### 1. 외부 이미지 도메인 설정

`next.config.js`에 허용된 도메인 추가:

\`\`\`javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-domain.com',
    },
  ],
}
\`\`\`

### 2. SVG 보안

SVG 사용 시 CSP 설정:

\`\`\`javascript
images: {
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
}
\`\`\`

### 3. 캐시 관리

이미지는 7일간 캐시됨 (`minimumCacheTTL: 604800`). 즉시 업데이트 필요 시 쿼리 파라미터 추가:

\`\`\`tsx
<OptimizedImage src={`/image.jpg?v=${version}`} ... />
\`\`\`

## 문제 해결

### 이미지가 로드되지 않음
1. `next.config.js`의 `remotePatterns` 확인
2. 이미지 URL 접근 가능 확인
3. 브라우저 콘솔 에러 확인

### Blur placeholder가 작동하지 않음
1. `useBlur={true}` 설정 확인
2. `width`와 `height` 지정 확인
3. Static import 사용 시 자동 blur 생성됨

### 이미지가 너무 느림
1. 적절한 크기로 리사이징
2. `priority` prop 사용 고려
3. 불필요한 `quality` 낮추기

## 참고 자료

- [Next.js Image 공식 문서](https://nextjs.org/docs/app/api-reference/components/image)
- [Web.dev 이미지 최적화 가이드](https://web.dev/fast/#optimize-your-images)
- [AVIF vs WebP 비교](https://avif.io/)
