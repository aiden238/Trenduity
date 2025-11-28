/**
 * 접근성 모드 타입
 */
export type A11yMode = 'normal' | 'easy' | 'ultra';

/**
 * 접근성 토큰 정의 (IMPLEMENT-09 스펙)
 */
export const A11Y_TOKENS = {
  normal: {
    // 폰트 크기
    fontSizes: {
      caption: 14,
      body: 16,
      heading2: 20,
      heading1: 24,
    },
    // 간격
    spacing: 16,
    // 버튼 높이
    buttonHeight: 48,
    // 아이콘 크기
    iconSize: 24,
  },
  easy: {
    fontSizes: {
      caption: 16,
      body: 20,
      heading2: 24,
      heading1: 28,
    },
    spacing: 20,
    buttonHeight: 56,
    iconSize: 28,
  },
  ultra: {
    fontSizes: {
      caption: 18,
      body: 24,
      heading2: 28,
      heading1: 32,
    },
    spacing: 24,
    buttonHeight: 64,
    iconSize: 32,
  },
};

export function getA11yTokens(mode: A11yMode) {
  return A11Y_TOKENS[mode];
}
