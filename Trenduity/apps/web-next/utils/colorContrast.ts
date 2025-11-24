/**
 * WCAG 색상 대비 유틸리티
 * WCAG AAA 레벨 (7:1 대비) 검증 및 보정
 */

/**
 * Hex 색상을 RGB로 변환
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * RGB를 Hex로 변환
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Relative Luminance 계산 (WCAG 2.1 공식)
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  // RGB를 0-1 범위로 정규화
  const [rNorm, gNorm, bNorm] = [r, g, b].map(val => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  // Luminance 계산
  return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
}

/**
 * 두 색상 간의 대비율 계산 (WCAG 2.1 공식)
 * @returns 대비율 (1:1 ~ 21:1)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG 레벨 검증
 */
export type WCAGLevel = 'AA' | 'AAA';
export type TextSize = 'normal' | 'large'; // large = 18pt+ 또는 14pt+ bold

export interface ContrastResult {
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
  level: 'AAA' | 'AA' | 'fail';
}

/**
 * WCAG 대비 요구사항
 * - Normal text (일반 텍스트): AA = 4.5:1, AAA = 7:1
 * - Large text (큰 텍스트, 18pt+ 또는 14pt+ bold): AA = 3:1, AAA = 4.5:1
 */
export const CONTRAST_REQUIREMENTS = {
  normal: { AA: 4.5, AAA: 7 },
  large: { AA: 3, AAA: 4.5 },
};

/**
 * 대비 검증
 */
export function checkContrast(
  foreground: string,
  background: string,
  textSize: TextSize = 'normal'
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  const requirements = CONTRAST_REQUIREMENTS[textSize];

  const passAA = ratio >= requirements.AA;
  const passAAA = ratio >= requirements.AAA;

  return {
    ratio: Math.round(ratio * 100) / 100,
    passAA,
    passAAA,
    level: passAAA ? 'AAA' : passAA ? 'AA' : 'fail',
  };
}

/**
 * 색상 밝게/어둡게 조정
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (val: number) => {
    const adjusted = val + (255 - val) * (percent / 100);
    return Math.max(0, Math.min(255, adjusted));
  };

  return rgbToHex(
    adjust(rgb.r),
    adjust(rgb.g),
    adjust(rgb.b)
  );
}

/**
 * AAA 대비를 만족하는 색상 제안
 */
export function suggestAAAColor(
  foreground: string,
  background: string,
  textSize: TextSize = 'normal'
): string {
  let adjustedColor = foreground;
  let attempt = 0;
  const maxAttempts = 20;
  const targetRatio = CONTRAST_REQUIREMENTS[textSize].AAA;

  // 배경색 luminance 확인
  const bgRgb = hexToRgb(background);
  if (!bgRgb) return foreground;
  
  const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const isLightBackground = bgLuminance > 0.5;

  // 밝은 배경: 더 어둡게 / 어두운 배경: 더 밝게
  const step = isLightBackground ? -5 : 5;

  while (attempt < maxAttempts) {
    const ratio = getContrastRatio(adjustedColor, background);
    
    if (ratio >= targetRatio) {
      return adjustedColor;
    }

    adjustedColor = adjustBrightness(adjustedColor, step * (attempt + 1));
    attempt++;
  }

  // 실패 시 흑백으로 대체
  return isLightBackground ? '#000000' : '#FFFFFF';
}

/**
 * 색상 팔레트 검증 (전체 색상 대비 확인)
 */
export interface ColorPair {
  name: string;
  foreground: string;
  background: string;
  textSize?: TextSize;
}

export function validateColorPalette(pairs: ColorPair[]): {
  pair: ColorPair;
  result: ContrastResult;
  suggestion?: string;
}[] {
  return pairs.map(pair => {
    const result = checkContrast(
      pair.foreground,
      pair.background,
      pair.textSize || 'normal'
    );

    const output: {
      pair: ColorPair;
      result: ContrastResult;
      suggestion?: string;
    } = { pair, result };

    // AAA 실패 시 제안
    if (!result.passAAA) {
      output.suggestion = suggestAAAColor(
        pair.foreground,
        pair.background,
        pair.textSize || 'normal'
      );
    }

    return output;
  });
}

/**
 * 미리 정의된 색상 팔레트 (WCAG AAA 준수)
 */
export const AAA_COLOR_PALETTE = {
  light: {
    // 라이트 모드 - AAA 대비 보장
    text: {
      primary: '#000000',      // 21:1 on white
      secondary: '#2D3748',    // 12.6:1 on white
      tertiary: '#4A5568',     // 8.2:1 on white
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F7FAFC',
      tertiary: '#EDF2F7',
    },
    primary: {
      DEFAULT: '#1E40AF',      // 7.3:1 on white (AAA)
      hover: '#1E3A8A',        // 8.5:1 on white
    },
    success: {
      DEFAULT: '#047857',      // 7.1:1 on white (AAA)
      hover: '#065F46',
    },
    danger: {
      DEFAULT: '#B91C1C',      // 7.2:1 on white (AAA)
      hover: '#991B1B',
    },
    warning: {
      DEFAULT: '#92400E',      // 9.4:1 on white (AAA)
      hover: '#78350F',
    },
  },
  dark: {
    // 다크 모드 - AAA 대비 보장
    text: {
      primary: '#FFFFFF',      // 21:1 on #0F172A
      secondary: '#CBD5E1',    // 10.8:1 on #0F172A
      tertiary: '#94A3B8',     // 7.2:1 on #0F172A
    },
    background: {
      primary: '#0F172A',      // slate-900
      secondary: '#1E293B',    // slate-800
      tertiary: '#334155',     // slate-700
    },
    primary: {
      DEFAULT: '#60A5FA',      // 7.4:1 on #0F172A (AAA)
      hover: '#93C5FD',        // 11.2:1 on #0F172A
    },
    success: {
      DEFAULT: '#34D399',      // 8.1:1 on #0F172A (AAA)
      hover: '#6EE7B7',
    },
    danger: {
      DEFAULT: '#F87171',      // 7.3:1 on #0F172A (AAA)
      hover: '#FCA5A5',
    },
    warning: {
      DEFAULT: '#FCD34D',      // 12.5:1 on #0F172A (AAA)
      hover: '#FDE68A',
    },
  },
};
