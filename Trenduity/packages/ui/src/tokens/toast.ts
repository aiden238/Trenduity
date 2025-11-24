/**
 * Toast 알림 디자인 토큰
 * 4가지 타입: success, error, warning, info
 */

import { COLORS } from './colors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  icon: string;
  colors: {
    light: {
      background: string;
      border: string;
      text: string;
      icon: string;
    };
    dark: {
      background: string;
      border: string;
      text: string;
      icon: string;
    };
  };
  gradient: string[];
}

/**
 * Toast 타입별 설정
 */
export const TOAST_CONFIGS: Record<ToastType, ToastConfig> = {
  success: {
    icon: '✅',
    colors: {
      light: {
        background: '#F0FDF4', // green-50
        border: '#86EFAC',     // green-300
        text: '#166534',       // green-800
        icon: '#22C55E',       // green-500
      },
      dark: {
        background: '#14532D', // green-950
        border: '#15803D',     // green-700
        text: '#BBF7D0',       // green-200
        icon: '#4ADE80',       // green-400
      },
    },
    gradient: ['#22C55E', '#16A34A'], // green-500 → green-600
  },

  error: {
    icon: '❌',
    colors: {
      light: {
        background: '#FEF2F2', // red-50
        border: '#FCA5A5',     // red-300
        text: '#991B1B',       // red-800
        icon: '#EF4444',       // red-500
      },
      dark: {
        background: '#450A0A', // red-950
        border: '#B91C1C',     // red-700
        text: '#FECACA',       // red-200
        icon: '#F87171',       // red-400
      },
    },
    gradient: ['#EF4444', '#DC2626'], // red-500 → red-600
  },

  warning: {
    icon: '⚠️',
    colors: {
      light: {
        background: '#FFFBEB', // amber-50
        border: '#FCD34D',     // amber-300
        text: '#92400E',       // amber-800
        icon: '#F59E0B',       // amber-500
      },
      dark: {
        background: '#451A03', // amber-950
        border: '#B45309',     // amber-700
        text: '#FDE68A',       // amber-200
        icon: '#FBBF24',       // amber-400
      },
    },
    gradient: ['#F59E0B', '#D97706'], // amber-500 → amber-600
  },

  info: {
    icon: 'ℹ️',
    colors: {
      light: {
        background: '#EFF6FF', // blue-50
        border: '#93C5FD',     // blue-300
        text: '#1E40AF',       // blue-800
        icon: '#3B82F6',       // blue-500
      },
      dark: {
        background: '#172554', // blue-950
        border: '#1D4ED8',     // blue-700
        text: '#BFDBFE',       // blue-200
        icon: '#60A5FA',       // blue-400
      },
    },
    gradient: ['#3B82F6', '#2563EB'], // blue-500 → blue-600
  },
};

/**
 * Toast 애니메이션 설정
 */
export const TOAST_ANIMATION = {
  // 진입 애니메이션
  enter: {
    duration: 300, // ms
    easing: 'ease-out',
    transform: {
      from: { translateX: '100%', opacity: 0 },
      to: { translateX: '0%', opacity: 1 },
    },
  },

  // 퇴장 애니메이션
  exit: {
    duration: 250, // ms
    easing: 'ease-in',
    transform: {
      from: { translateX: '0%', opacity: 1 },
      to: { translateX: '100%', opacity: 0 },
    },
  },

  // 모바일 (하단에서 올라옴)
  enterMobile: {
    duration: 300,
    easing: 'ease-out',
    transform: {
      from: { translateY: '100%', opacity: 0 },
      to: { translateY: '0%', opacity: 1 },
    },
  },

  exitMobile: {
    duration: 250,
    easing: 'ease-in',
    transform: {
      from: { translateY: '0%', opacity: 1 },
      to: { translateY: '100%', opacity: 0 },
    },
  },
};

/**
 * Toast 기본 옵션
 */
export const TOAST_DEFAULTS = {
  duration: 3000,        // 3초 자동 닫기
  maxToasts: 3,          // 최대 3개까지 표시
  position: {
    web: 'top-right' as const,
    mobile: 'bottom' as const,
  },
  offset: {
    web: { top: 24, right: 24 },    // px
    mobile: { bottom: 80 },          // px (탭 바 위)
  },
  spacing: 12,           // 토스트 간 간격 (px)
  width: {
    web: 400,            // px
    mobile: '90%',       // 화면 너비의 90%
  },
};

/**
 * Toast 메시지 인터페이스
 */
export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  onClose?: () => void;
}
