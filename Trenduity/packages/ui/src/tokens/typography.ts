import { TextStyle } from 'react-native';
import { A11yMode } from './a11y';

/**
 * 타이포그래피 시스템
 * 3단계 접근성 모드별 폰트 크기 및 스타일 정의
 */

/**
 * 기본 폰트 패밀리
 * iOS: SF Pro, Android: Roboto
 */
export const FONT_FAMILY = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

/**
 * 폰트 두께 (Font Weight)
 */
export const FONT_WEIGHT = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

/**
 * 타이포그래피 스타일 (A11y 모드별)
 */
export const TYPOGRAPHY = {
  normal: {
    heading1: {
      fontSize: 28,
      fontWeight: FONT_WEIGHT.bold,
      lineHeight: 34,
      letterSpacing: 0.5,
    } as TextStyle,
    heading2: {
      fontSize: 22,
      fontWeight: FONT_WEIGHT.semibold,
      lineHeight: 28,
      letterSpacing: 0.5,
    } as TextStyle,
    heading3: {
      fontSize: 18,
      fontWeight: FONT_WEIGHT.semibold,
      lineHeight: 24,
      letterSpacing: 0.5,
    } as TextStyle,
    body: {
      fontSize: 16,
      fontWeight: FONT_WEIGHT.regular,
      lineHeight: 22,
      letterSpacing: 0,
    } as TextStyle,
    bodyBold: {
      fontSize: 16,
      fontWeight: FONT_WEIGHT.semibold,
      lineHeight: 22,
      letterSpacing: 0,
    } as TextStyle,
    caption: {
      fontSize: 14,
      fontWeight: FONT_WEIGHT.regular,
      lineHeight: 18,
      letterSpacing: 0,
    } as TextStyle,
    small: {
      fontSize: 12,
      fontWeight: FONT_WEIGHT.regular,
      lineHeight: 16,
      letterSpacing: 0,
    } as TextStyle,
  },
  easy: {
    heading1: {
      fontSize: 34,
      fontWeight: FONT_WEIGHT.bold,
      lineHeight: 41,
      letterSpacing: 0.5,
    } as TextStyle,
    heading2: {
      fontSize: 28,
      fontWeight: FONT_WEIGHT.semibold,
      lineHeight: 34,
      letterSpacing: 0.5,
    } as TextStyle,
    heading3: {
      fontSize: 22,
      fontWeight: FONT_WEIGHT.semibold,
      lineHeight: 28,
      letterSpacing: 0.5,
    } as TextStyle,
    body: {
      fontSize: 20,
      fontWeight: FONT_WEIGHT.regular,
      lineHeight: 26,
      letterSpacing: 0,
    } as TextStyle,
    bodyBold: {
      fontSize: 20,
      fontWeight: FONT_WEIGHT.semibold,
      lineHeight: 26,
      letterSpacing: 0,
    } as TextStyle,
    caption: {
      fontSize: 17,
      fontWeight: FONT_WEIGHT.regular,
      lineHeight: 22,
      letterSpacing: 0,
    } as TextStyle,
    small: {
      fontSize: 15,
      fontWeight: FONT_WEIGHT.regular,
      lineHeight: 20,
      letterSpacing: 0,
    } as TextStyle,
  },
  ultra: {
    heading1: {
      fontSize: 42,
      fontWeight: FONT_WEIGHT.bold,
      lineHeight: 50,
      letterSpacing: 0.5,
    } as TextStyle,
    heading2: {
      fontSize: 34,
      fontWeight: FONT_WEIGHT.semibold,
      lineHeight: 41,
      letterSpacing: 0.5,
    } as TextStyle,
    heading3: {
      fontSize: 28,
      fontWeight: FONT_WEIGHT.semibold,
      lineHeight: 34,
      letterSpacing: 0.5,
    } as TextStyle,
    body: {
      fontSize: 24,
      fontWeight: FONT_WEIGHT.regular,
      lineHeight: 31,
      letterSpacing: 0,
    } as TextStyle,
    bodyBold: {
      fontSize: 24,
      fontWeight: FONT_WEIGHT.semibold,
      lineHeight: 31,
      letterSpacing: 0,
    } as TextStyle,
    caption: {
      fontSize: 20,
      fontWeight: FONT_WEIGHT.regular,
      lineHeight: 26,
      letterSpacing: 0,
    } as TextStyle,
    small: {
      fontSize: 18,
      fontWeight: FONT_WEIGHT.regular,
      lineHeight: 24,
      letterSpacing: 0,
    } as TextStyle,
  },
};

/**
 * A11y 모드에 따른 타이포그래피 스타일 가져오기
 */
export function getTypography(mode: A11yMode) {
  return TYPOGRAPHY[mode];
}

/**
 * 타이포그래피 유틸리티
 */
export const typographyUtils = {
  /**
   * 특정 모드의 특정 스타일 가져오기
   */
  getStyle: (mode: A11yMode, style: keyof typeof TYPOGRAPHY.normal) => {
    return TYPOGRAPHY[mode][style];
  },

  /**
   * 텍스트 스타일 병합
   */
  merge: (...styles: (TextStyle | undefined)[]) => {
    return Object.assign({}, ...styles.filter(Boolean));
  },
};
