/**
 * 접근성 모드 타입
 */
export type A11yMode = 'normal' | 'easy' | 'ultra';

/**
 * 색상 참조를 위한 간단한 타입
 * 실제 colors는 colors.ts에서 import
 */
const COLORS_REF = {
  background: {
    primary: '#F2F2F7',
  },
  neutral: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    border: '#C6C6C8',
  },
  text: {
    primary: '#000000',
    secondary: '#3C3C43',
  },
  border: '#C6C6C8',
};

/**
 * 접근성 토큰 정의 (IMPLEMENT-09 스펙)
 */
export const A11Y_TOKENS = {
  normal: {
    // 폰트 크기 (객체 형태 - 컴포넌트 호환)
    fontSizes: {
      small: 14,
      caption: 14,
      body: 16,
      title: 20,
      heading: 24,
      heading2: 20,
      heading1: 24,
    },
    // fontSize 별칭 (tokens.fontSize.body 형태 지원)
    fontSize: {
      small: 14,
      caption: 14,
      body: 16,
      title: 20,
      heading: 24,
      heading2: 20,
      heading1: 24,
    },
    // 간격 (객체 형태 - tokens.spacing.md 지원)
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    // 터치 타겟
    touchTarget: {
      minWidth: 44,
      minHeight: 48,
    },
    // 버튼 높이
    buttonHeight: 48,
    // 아이콘 크기
    iconSize: 24,
    // 색상 참조
    colors: COLORS_REF,
  },
  easy: {
    fontSizes: {
      small: 16,
      caption: 16,
      body: 20,
      title: 24,
      heading: 28,
      heading2: 24,
      heading1: 28,
    },
    fontSize: {
      small: 16,
      caption: 16,
      body: 20,
      title: 24,
      heading: 28,
      heading2: 24,
      heading1: 28,
    },
    spacing: {
      xs: 6,
      sm: 12,
      md: 20,
      lg: 28,
      xl: 36,
    },
    touchTarget: {
      minWidth: 48,
      minHeight: 56,
    },
    buttonHeight: 56,
    iconSize: 28,
    colors: COLORS_REF,
  },
  ultra: {
    fontSizes: {
      small: 18,
      caption: 18,
      body: 24,
      title: 28,
      heading: 32,
      heading2: 28,
      heading1: 32,
    },
    fontSize: {
      small: 18,
      caption: 18,
      body: 24,
      title: 28,
      heading: 32,
      heading2: 28,
      heading1: 32,
    },
    spacing: {
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 40,
    },
    touchTarget: {
      minWidth: 52,
      minHeight: 64,
    },
    buttonHeight: 64,
    iconSize: 32,
    colors: COLORS_REF,
  },
};

export function getA11yTokens(mode: A11yMode) {
  return A11Y_TOKENS[mode];
}
