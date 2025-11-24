/**
 * Skeleton 토큰
 * 로딩 상태를 위한 스켈레톤 디자인 토큰
 */

export const SKELETON = {
  // 색상 (라이트/다크 모드)
  colors: {
    light: {
      base: '#E2E8F0', // slate-200
      highlight: '#F1F5F9', // slate-100 (shimmer 효과용)
    },
    dark: {
      base: '#334155', // slate-700
      highlight: '#475569', // slate-600 (shimmer 효과용)
    },
  },

  // 애니메이션 설정
  animation: {
    duration: 1.5, // 초
    ease: 'ease-in-out',
    direction: 'normal',
    iterationCount: 'infinite',
  },

  // 크기 프리셋
  sizes: {
    text: {
      height: '1rem', // 16px
      width: '100%',
    },
    title: {
      height: '1.5rem', // 24px
      width: '60%',
    },
    avatar: {
      height: '3rem', // 48px
      width: '3rem', // 48px
      borderRadius: '50%',
    },
    card: {
      height: '12rem', // 192px
      width: '100%',
      borderRadius: '0.75rem', // 12px
    },
    button: {
      height: '2.5rem', // 40px
      width: '8rem', // 128px
      borderRadius: '0.5rem', // 8px
    },
    chart: {
      height: '20rem', // 320px
      width: '100%',
      borderRadius: '0.75rem', // 12px
    },
  },

  // Shimmer 그라디언트
  shimmer: {
    light: 'linear-gradient(90deg, #E2E8F0 0%, #F1F5F9 50%, #E2E8F0 100%)',
    dark: 'linear-gradient(90deg, #334155 0%, #475569 50%, #334155 100%)',
  },

  // 애니메이션 키프레임 (CSS-in-JS용)
  keyframes: `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `,
} as const;

export type SkeletonSize = keyof typeof SKELETON.sizes;
