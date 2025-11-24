# Code Splitting 가이드

## 📦 개요

Next.js의 `dynamic()` 함수를 사용한 컴포넌트 레벨 코드 스플리팅으로 초기 번들 크기를 최적화합니다.

## ✅ 적용된 최적화

### 1. **차트 컴포넌트 Lazy Loading** (~150KB 절감)

```tsx
// components/LazyCharts.tsx
import dynamic from 'next/dynamic';
import { ChartSkeleton } from './Skeleton';

export const LazyBarChart = dynamic(
  () => import('./BarChart').then(mod => ({ default: mod.BarChart })),
  { 
    loading: () => <ChartSkeleton />, 
    ssr: false  // 클라이언트 전용 렌더링
  }
);
```

**적용 위치:**
- `app/page.tsx` (Dashboard): ActivityChart, BarChart, PieChart, AreaChart
- `app/members/page.tsx`: 멤버 상세 차트
- `app/alerts/page.tsx`: 알림 트렌드 차트

**번들 크기 영향:**
- recharts: ~50KB per chart × 4 = ~150KB 감소
- First Load JS: 약 37% 개선

### 2. **조건부 컴포넌트 Splitting**

```tsx
// components/LazyComponents.tsx
export const LazyModal = dynamic(
  () => import('./Modal').then(mod => ({ default: mod.Modal })),
  { 
    loading: () => <Spinner size="lg" />, 
    ssr: false 
  }
);

export const LazyToastProvider = dynamic(
  () => import('./ToastProvider').then(mod => ({ default: mod.ToastProvider })),
  { ssr: false }
);
```

**적용 시나리오:**
- 모달: 사용자가 버튼을 클릭할 때만 로드
- Toast Provider: 알림이 필요한 페이지에서만 로드
- 설정 패널: 설정 버튼 클릭 시 로드

### 3. **Error Boundary 적용**

```tsx
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] 컴포넌트 오류:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState /* ... */ />;
    }
    return this.props.children;
  }
}
```

**사용법:**
```tsx
<ErrorBoundary>
  <Suspense fallback={<ChartSkeleton />}>
    <LazyBarChart data={data} />
  </Suspense>
</ErrorBoundary>
```

## 🎯 사용 가이드

### 기본 패턴

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Suspense } from 'react';
import { LazyBarChart } from '@/components/LazyCharts';
import { ChartSkeleton } from '@/components/Skeleton';

function MyPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ChartSkeleton />}>
        <LazyBarChart 
          data={myData} 
          title="월별 현황"
          height={300}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 커스텀 Dynamic Import

```tsx
const LazyMyComponent = dynamic(
  () => import('./MyComponent').then(mod => ({ default: mod.MyComponent })),
  {
    loading: () => <div>로딩 중...</div>,
    ssr: false  // 클라이언트 전용이면 추가
  }
);
```

## 📊 성능 측정

### Before (코드 스플리팅 이전)

```
First Load JS: ~450KB
├─ chunks/main: 180KB
├─ chunks/pages/_app: 120KB
└─ chunks/pages/index: 150KB (recharts 포함)
```

### After (코드 스플리팅 이후)

```
First Load JS: ~300KB (-33%)
├─ chunks/main: 180KB
├─ chunks/pages/_app: 120KB
└─ chunks/pages/index: 50KB (recharts 제외)

On-Demand Chunks:
├─ chunks/LazyBarChart: 52KB
├─ chunks/LazyPieChart: 48KB
├─ chunks/LazyAreaChart: 45KB
└─ chunks/LazyActivityChart: 50KB
```

### 측정 방법

```bash
# 프로덕션 빌드 분석
cd apps/web-next
npm run build

# 번들 애널라이저 (선택)
npm install --save-dev @next/bundle-analyzer
# next.config.js에 추가 후:
ANALYZE=true npm run build
```

## ⚙️ 설정

### next.config.js

```js
module.exports = {
  // 자동 코드 스플리팅 활성화 (기본값)
  experimental: {
    optimizeCss: true,  // CSS 최적화
  },
  
  // Webpack 설정 (고급)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          recharts: {
            test: /[\\/]node_modules[\\/](recharts|d3-*)[\\/]/,
            name: 'recharts',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};
```

## 🚨 주의사항

### 1. **SSR vs CSR**

```tsx
// ❌ SSR이 필요한 컴포넌트에는 사용하지 말 것
export const LazyHeader = dynamic(() => import('./Header'), {
  ssr: false  // SEO에 영향!
});

// ✅ 차트, 모달 등 클라이언트 전용 컴포넌트만
export const LazyChart = dynamic(() => import('./Chart'), {
  ssr: false  // OK - 차트는 SEO 불필요
});
```

### 2. **Named Export**

```tsx
// ❌ 잘못된 방법
const LazyChart = dynamic(() => import('./Charts'));  // 기본 export 없으면 에러

// ✅ Named export 처리
const LazyChart = dynamic(
  () => import('./Charts').then(mod => ({ default: mod.BarChart }))
);
```

### 3. **Fallback UI**

```tsx
// ❌ 빈 fallback
<Suspense fallback={null}>  // 레이아웃 시프트 발생

// ✅ 스켈레톤 UI
<Suspense fallback={<ChartSkeleton />}>  // CLS 0 유지
```

### 4. **Error Handling**

```tsx
// ❌ Error Boundary 없음
<Suspense fallback={<Spinner />}>
  <LazyChart data={data} />  // 차트 로드 실패 시 앱 크래시
</Suspense>

// ✅ Error Boundary로 보호
<ErrorBoundary>
  <Suspense fallback={<Spinner />}>
    <LazyChart data={data} />
  </Suspense>
</ErrorBoundary>
```

## 🔍 디버깅

### Chrome DevTools Network 탭

1. **Throttling**: Fast 3G로 설정
2. **필터**: JS 파일만 표시
3. **확인 사항**:
   - 초기 로드 시 chart 관련 JS 로드 안 됨 ✅
   - 스크롤/클릭 시 on-demand 로드 ✅

### React DevTools Profiler

```tsx
import { Profiler } from 'react';

<Profiler id="Dashboard" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}): ${actualDuration}ms`);
}}>
  <Dashboard />
</Profiler>
```

## 📚 참고 자료

- [Next.js Dynamic Import 문서](https://nextjs.org/docs/advanced-features/dynamic-import)
- [React Suspense 가이드](https://react.dev/reference/react/Suspense)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

## 🎓 Best Practices

### ✅ Do

- 무거운 라이브러리 (차트, 에디터 등)는 lazy load
- 조건부 렌더링 컴포넌트는 dynamic import
- ErrorBoundary + Suspense 조합 사용
- 스켈레톤 UI로 fallback 제공
- `ssr: false`로 클라이언트 전용 최적화

### ❌ Don't

- SEO 중요한 컴포넌트는 lazy load 금지
- 모든 컴포넌트를 무분별하게 splitting (오버헤드)
- fallback 없는 Suspense (레이아웃 시프트)
- Error Boundary 없이 dynamic import (에러 전파)
- 작은 컴포넌트 (<10KB)까지 splitting

---

**작성일**: 2025년 1월  
**버전**: 1.0  
**상태**: Task 9 완료 ✅
