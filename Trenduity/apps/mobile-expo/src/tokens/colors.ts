/**
 * 색상 팔레트 (WCAG AA 준수 - 4.5:1 대비)
 * iOS 시스템 컬러 기반으로 시니어 인지도 최적화
 * 
 * v2.0 업데이트: 다크 모드 지원 추가
 */

export const COLORS = {
  /**
   * 주요 색상 (Primary)
   * iOS 블루 계열 - 높은 인지도와 친숙함
   */
  primary: {
    main: '#007AFF',      // iOS 기본 블루
    light: '#5AC8FA',     // 밝은 블루
    dark: '#0051D5',      // 어두운 블루
    gradient: ['#007AFF', '#5AC8FA'], // 그라데이션
  },

  /**
   * 보조 색상 (Secondary)
   * 성공/완료 표시용 녹색
   */
  secondary: {
    main: '#34C759',      // 성공 녹색
    light: '#30D158',     // 밝은 녹색
    dark: '#248A3D',      // 어두운 녹색
    gradient: ['#34C759', '#30D158'],
  },

  /**
   * 강조 색상 (Accent)
   * 특정 기능/상태 표시용
   */
  accent: {
    orange: '#FF9500',    // 경고/중요 (복약 체크)
    purple: '#AF52DE',    // 배지/레벨
    pink: '#FF2D55',      // 알림/강조
    yellow: '#FFD60A',    // 포인트/별
    teal: '#5AC8FA',      // 인사이트
  },

  /**
   * 중립 색상 (Neutral)
   * 배경, 텍스트, 경계선
   */
  neutral: {
    background: '#F2F2F7',    // 앱 배경 (밝은 회색)
    surface: '#FFFFFF',       // 카드 배경 (흰색)
    border: '#C6C6C8',        // 경계선 (중간 회색)
    divider: '#E5E5EA',       // 구분선 (연한 회색)
    text: {
      primary: '#000000',     // 주 텍스트 (검정)
      secondary: '#3C3C43',   // 보조 텍스트 (60% 투명도)
      tertiary: '#8E8E93',    // 힌트/비활성 텍스트
      inverse: '#FFFFFF',     // 역전 텍스트 (어두운 배경용)
    },
  },

  /**
   * 상태 색상 (Status)
   * 피드백 및 알림용
   */
  status: {
    success: '#34C759',   // 성공 (녹색)
    warning: '#FF9500',   // 경고 (주황)
    error: '#FF3B30',     // 오류 (빨강)
    info: '#007AFF',      // 정보 (블루)
  },

  /**
   * 게임화 색상
   * 포인트, 배지, 레벨 표시용
   */
  gamification: {
    points: '#FFD60A',       // 포인트 (금색)
    streak: '#FF9500',       // 스트릭 (주황)
    level: '#AF52DE',        // 레벨 (보라)
    badge: '#5AC8FA',        // 배지 (청록)
  },

  /**
   * 그라데이션 프리셋
   */
  gradients: {
    primary: ['#007AFF', '#5AC8FA'],
    secondary: ['#34C759', '#30D158'],
    warm: ['#FF9500', '#FF2D55'],
    cool: ['#5AC8FA', '#AF52DE'],
    sunset: ['#FF9500', '#FF2D55', '#AF52DE'],
  },

  /**
   * 다크 모드 색상
   * 배경, 텍스트, 그라디언트 다크 버전
   */
  dark: {
    /**
     * 배경 색상
     */
    background: {
      primary: '#0F172A',    // slate-900 - 메인 배경
      secondary: '#1E293B',  // slate-800 - 카드 배경
      tertiary: '#334155',   // slate-700 - 상승된 요소
      elevated: '#475569',   // slate-600 - 호버 상태
    },

    /**
     * 텍스트 색상
     */
    text: {
      primary: '#F1F5F9',    // slate-100 - 주 텍스트
      secondary: '#CBD5E1',  // slate-300 - 보조 텍스트
      tertiary: '#94A3B8',   // slate-400 - 힌트/비활성
      inverse: '#0F172A',    // slate-900 - 역전 텍스트 (밝은 배경용)
    },

    /**
     * 경계선 및 구분선
     */
    border: '#475569',       // slate-600
    divider: '#334155',      // slate-700

    /**
     * 다크 모드 그라디언트 (채도 낮추고 밝기 조정)
     */
    gradients: {
      blue: ['#1E40AF', '#1E3A8A'],      // blue-800 → blue-900
      purple: ['#6D28D9', '#5B21B6'],    // purple-700 → purple-800
      pink: ['#BE185D', '#9F1239'],      // pink-700 → pink-800
      green: ['#047857', '#065F46'],     // emerald-700 → emerald-800
      yellow: ['#B45309', '#92400E'],    // amber-700 → amber-800
      orange: ['#C2410C', '#B91C1C'],    // orange-700 → red-700
      teal: ['#0F766E', '#115E59'],      // teal-700 → teal-800
    },

    /**
     * 상태 색상 (다크 모드용)
     */
    status: {
      success: '#10B981',   // emerald-500
      warning: '#F59E0B',   // amber-500
      error: '#EF4444',     // red-500
      info: '#3B82F6',      // blue-500
    },

    /**
     * 게임화 색상 (다크 모드용)
     */
    gamification: {
      points: '#F59E0B',    // amber-500
      streak: '#F97316',    // orange-500
      level: '#8B5CF6',     // violet-500
      badge: '#14B8A6',     // teal-500
    },
  },
};

/**
 * 그림자 스타일
 * React Native용 shadow 속성
 */
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
};

/**
 * 간격 시스템 (Spacing)
 * 일관된 레이아웃을 위한 간격 값
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * 보더 반경 (Border Radius)
 */
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999, // 완전한 원형
};

/**
 * 불투명도 (Opacity)
 */
export const OPACITY = {
  disabled: 0.4,
  loading: 0.6,
  overlay: 0.8,
};
