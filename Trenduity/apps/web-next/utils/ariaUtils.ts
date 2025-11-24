/**
 * ARIA 유틸리티
 * 스크린 리더 접근성을 위한 ARIA 속성 헬퍼 함수
 */

/**
 * ARIA 레이블 생성 (중복 방지)
 */
export function generateAriaLabel(
  baseLabel: string,
  context?: Record<string, string | number>
): string {
  if (!context) return baseLabel;
  
  const contextParts = Object.entries(context)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  
  return `${baseLabel} (${contextParts})`;
}

/**
 * ARIA 설명 생성
 */
export function generateAriaDescription(
  action: string,
  result: string,
  additionalInfo?: string
): string {
  const base = `${action}을 하면 ${result}`;
  return additionalInfo ? `${base}. ${additionalInfo}` : base;
}

/**
 * 상태 기반 ARIA 속성
 */
export interface AriaStateProps {
  /** 확장 가능한 요소의 확장 상태 */
  'aria-expanded'?: boolean;
  /** 요소의 숨김 상태 */
  'aria-hidden'?: boolean;
  /** 요소의 비활성 상태 */
  'aria-disabled'?: boolean;
  /** 선택 상태 */
  'aria-selected'?: boolean;
  /** 체크 상태 */
  'aria-checked'?: boolean | 'mixed';
  /** 눌림 상태 (토글 버튼) */
  'aria-pressed'?: boolean | 'mixed';
  /** 현재 항목 표시 */
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
  /** 로딩 상태 */
  'aria-busy'?: boolean;
  /** 유효성 상태 */
  'aria-invalid'?: boolean;
}

/**
 * 관계 기반 ARIA 속성
 */
export interface AriaRelationProps {
  /** 라벨 연결 */
  'aria-labelledby'?: string;
  /** 설명 연결 */
  'aria-describedby'?: string;
  /** 에러 메시지 연결 */
  'aria-errormessage'?: string;
  /** 컨트롤 대상 */
  'aria-controls'?: string;
  /** 소유 관계 */
  'aria-owns'?: string;
}

/**
 * 위젯 ARIA 속성
 */
export interface AriaWidgetProps {
  /** 역할 */
  role?: string;
  /** 레이블 */
  'aria-label'?: string;
  /** 설명 (힌트) */
  'aria-description'?: string;
  /** 필수 필드 */
  'aria-required'?: boolean;
  /** 읽기 전용 */
  'aria-readonly'?: boolean;
  /** 다중 선택 */
  'aria-multiselectable'?: boolean;
  /** 자동 완성 타입 */
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
}

/**
 * Live Region 타입
 */
export type AriaLive = 'off' | 'polite' | 'assertive';

/**
 * Live Region 속성
 */
export interface AriaLiveProps {
  /** Live region 타입 */
  'aria-live'?: AriaLive;
  /** 원자성 (전체 읽기) */
  'aria-atomic'?: boolean;
  /** 관련성 (변경 사항만) */
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
}

/**
 * 전체 ARIA 속성 조합
 */
export type AriaProps = AriaStateProps & 
  AriaRelationProps & 
  AriaWidgetProps & 
  AriaLiveProps;

/**
 * 일반적인 ARIA 패턴
 */
export const ARIA_PATTERNS = {
  /** 버튼 */
  button: (label: string, description?: string): AriaProps => ({
    role: 'button',
    'aria-label': label,
    'aria-description': description,
  }),

  /** 링크 */
  link: (label: string, external?: boolean): AriaProps => ({
    role: 'link',
    'aria-label': external ? `${label} (새 창)` : label,
  }),

  /** 토글 버튼 */
  toggle: (label: string, pressed: boolean): AriaProps => ({
    role: 'button',
    'aria-label': label,
    'aria-pressed': pressed,
  }),

  /** 탭 */
  tab: (label: string, selected: boolean, controls: string): AriaProps => ({
    role: 'tab',
    'aria-label': label,
    'aria-selected': selected,
    'aria-controls': controls,
  }),

  /** 대화상자 */
  dialog: (title: string, describedBy?: string): AriaProps => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': title,
    'aria-describedby': describedBy,
  }),

  /** 경고 */
  alert: (live: AriaLive = 'polite'): AriaProps => ({
    role: 'alert',
    'aria-live': live,
    'aria-atomic': true,
  }),

  /** 상태 표시 */
  status: (live: AriaLive = 'polite'): AriaProps => ({
    role: 'status',
    'aria-live': live,
    'aria-atomic': true,
  }),

  /** 진행 상태 */
  progressbar: (value: number, max: number = 100, label?: string): AriaProps => ({
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-label': label,
  }),

  /** 폼 필드 */
  input: (
    label: string,
    required?: boolean,
    invalid?: boolean,
    errorId?: string
  ): AriaProps => ({
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': invalid,
    'aria-errormessage': invalid ? errorId : undefined,
  }),

  /** 네비게이션 */
  navigation: (label: string): AriaProps => ({
    role: 'navigation',
    'aria-label': label,
  }),

  /** 메인 컨텐츠 */
  main: (): AriaProps => ({
    role: 'main',
  }),

  /** 보조 컨텐츠 */
  complementary: (label?: string): AriaProps => ({
    role: 'complementary',
    'aria-label': label,
  }),
} as const;

/**
 * 조건부 ARIA 속성 (undefined 제거)
 */
export function cleanAriaProps(props: Partial<AriaProps>): AriaProps {
  return Object.fromEntries(
    Object.entries(props).filter(([_, value]) => value !== undefined)
  ) as AriaProps;
}

/**
 * ARIA 레이블 포맷터 (숫자, 날짜 등)
 */
export const ARIA_FORMATTERS = {
  /** 숫자 포맷 */
  number: (value: number, unit?: string): string => {
    const formatted = new Intl.NumberFormat('ko-KR').format(value);
    return unit ? `${formatted} ${unit}` : formatted;
  },

  /** 날짜 포맷 */
  date: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  },

  /** 상대 시간 */
  relativeTime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    return '방금 전';
  },

  /** 퍼센트 */
  percent: (value: number): string => {
    return `${Math.round(value)}퍼센트`;
  },
};
