/**
 * 색상 팔레트 (WCAG AA 준수 - 4.5:1 대비)
 * Trenduity 브랜드 컬러 시스템
 * 
 * v3.0 업데이트: 브랜드 팔레트 적용 (신뢰감 있는 네이비 + 틸 + 오렌지)
 * 타깃: 50-70대 시니어 - 높은 대비, 신뢰감 있는 색상
 */

export const COLORS = {
  /**
   * 주요 색상 (Primary)
   * 브랜드 메인 네이비 - 신뢰, 안정감, 정부/금융 서비스 느낌
   */
  primary: {
    main: '#1E3A8A',      // 브랜드 네이비 (메인 버튼, 헤더)
    light: '#3B82F6',     // 밝은 블루 (호버 상태)
    dark: '#1E40AF',      // 어두운 네이비 (액티브 상태)
    gradient: ['#1E3A8A', '#3B82F6'], // 그라데이션
  },

  /**
   * 보조 색상 (Secondary)
   * 다크 틸 - 디지털/기술 느낌, 카테고리 태그용
   */
  secondary: {
    main: '#0F766E',      // 다크 틸 (보조 버튼, 카테고리)
    light: '#14B8A6',     // 밝은 틸
    dark: '#115E59',      // 어두운 틸
    gradient: ['#0F766E', '#14B8A6'],
  },

  /**
   * 강조 색상 (Accent)
   * 따뜻한 오렌지 - 포인트, 배지, 중요 강조
   */
  accent: {
    main: '#F97316',      // 브랜드 오렌지 (배지, 진행률, 포인트)
    orange: '#F97316',    // 동일 (하위 호환)
    purple: '#AF52DE',    // 배지/레벨 (보조)
    pink: '#FF2D55',      // 알림/강조 (보조)
    yellow: '#FFD60A',    // 포인트/별 (보조)
    teal: '#14B8A6',      // 인사이트 (보조)
  },

  /**
   * 중립 색상 (Neutral)
   * 배경, 텍스트, 경계선 - 시니어 친화적 대비
   */
  neutral: {
    background: '#F9FAFB',    // 앱 배경 (아주 연한 회색, 눈부심 방지)
    surface: '#FFFFFF',       // 카드 배경 (흰색)
    border: '#E5E7EB',        // 경계선/구분선
    divider: '#E5E7EB',       // 구분선 (동일)
    text: {
      primary: '#111827',     // 주 텍스트 (딥 그레이, 거의 블랙)
      secondary: '#6B7280',   // 보조 텍스트 (그레이)
      tertiary: '#9CA3AF',    // 힌트/비활성 텍스트
      inverse: '#FFFFFF',     // 역전 텍스트 (어두운 배경용)
    },
  },

  /**
   * 상태 색상 (Status)
   * 피드백 및 알림용 - 명확한 구분
   */
  status: {
    success: '#16A34A',   // 성공/완료 (그린)
    warning: '#D97706',   // 주의/사기 위험 (오렌지 브라운)
    error: '#B91C1C',     // 위험/강한 경고 (레드)
    info: '#1E3A8A',      // 정보 (브랜드 네이비)
  },

  /**
   * 게임화 색상
   * 포인트, 배지, 레벨 표시용
   */
  gamification: {
    points: '#FFD60A',       // 포인트 (금색)
    streak: '#F97316',       // 스트릭 (브랜드 오렌지)
    level: '#AF52DE',        // 레벨 (보라)
    badge: '#14B8A6',        // 배지 (틸)
  },

  /**
   * 그라데이션 프리셋 - 브랜드 컬러 기반
   */
  gradients: {
    primary: ['#1E3A8A', '#3B82F6'],         // 네이비 그라데이션
    secondary: ['#0F766E', '#14B8A6'],       // 틸 그라데이션
    accent: ['#F97316', '#FB923C'],          // 오렌지 그라데이션
    warm: ['#F97316', '#FB923C'],            // 따뜻한 (오렌지)
    cool: ['#1E3A8A', '#0F766E'],            // 차가운 (네이비→틸)
    sunset: ['#1E3A8A', '#0F766E', '#F97316'], // 브랜드 풀 그라데이션
    hero: ['#1E3A8A', '#3B82F6', '#14B8A6'],   // 히어로 섹션용
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
