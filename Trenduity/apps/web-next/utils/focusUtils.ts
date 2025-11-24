/**
 * 포커스 관리 유틸리티
 */

/**
 * 포커스 가능한 요소 선택자
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * 요소 내 포커스 가능한 요소들 가져오기
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/**
 * 첫 번째 포커스 가능한 요소에 포커스
 */
export function focusFirst(container: HTMLElement): boolean {
  const elements = getFocusableElements(container);
  if (elements.length === 0) return false;
  
  elements[0].focus();
  return true;
}

/**
 * 마지막 포커스 가능한 요소에 포커스
 */
export function focusLast(container: HTMLElement): boolean {
  const elements = getFocusableElements(container);
  if (elements.length === 0) return false;
  
  elements[elements.length - 1].focus();
  return true;
}

/**
 * 특정 인덱스의 요소에 포커스
 */
export function focusAt(container: HTMLElement, index: number): boolean {
  const elements = getFocusableElements(container);
  if (index < 0 || index >= elements.length) return false;
  
  elements[index].focus();
  return true;
}

/**
 * 다음 포커스 가능한 요소로 이동
 */
export function focusNext(container: HTMLElement, currentElement: HTMLElement, loop: boolean = true): boolean {
  const elements = getFocusableElements(container);
  const currentIndex = elements.indexOf(currentElement);
  
  if (currentIndex === -1) return false;
  
  const nextIndex = currentIndex + 1;
  
  if (nextIndex >= elements.length) {
    if (loop) {
      elements[0]?.focus();
      return true;
    }
    return false;
  }
  
  elements[nextIndex].focus();
  return true;
}

/**
 * 이전 포커스 가능한 요소로 이동
 */
export function focusPrevious(container: HTMLElement, currentElement: HTMLElement, loop: boolean = true): boolean {
  const elements = getFocusableElements(container);
  const currentIndex = elements.indexOf(currentElement);
  
  if (currentIndex === -1) return false;
  
  const prevIndex = currentIndex - 1;
  
  if (prevIndex < 0) {
    if (loop) {
      elements[elements.length - 1]?.focus();
      return true;
    }
    return false;
  }
  
  elements[prevIndex].focus();
  return true;
}

/**
 * 요소가 포커스 가능한지 확인
 */
export function isFocusable(element: HTMLElement): boolean {
  return element.matches(FOCUSABLE_SELECTOR);
}

/**
 * 포커스 저장 및 복원
 */
export class FocusManager {
  private savedElement: HTMLElement | null = null;

  /**
   * 현재 포커스된 요소 저장
   */
  save(): void {
    this.savedElement = document.activeElement as HTMLElement;
  }

  /**
   * 저장된 요소로 포커스 복원
   */
  restore(): boolean {
    if (!this.savedElement) return false;
    
    this.savedElement.focus();
    this.savedElement = null;
    return true;
  }

  /**
   * 저장된 포커스 초기화
   */
  clear(): void {
    this.savedElement = null;
  }
}

/**
 * 포커스 스타일 Tailwind 클래스
 */
export const FOCUS_CLASSES = {
  // 기본 포커스 (파란 외곽선)
  default: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-slate-900',
  
  // 인셋 포커스 (내부 외곽선)
  inset: 'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400',
  
  // 눈에 잘 띄는 포커스 (두꺼운 외곽선)
  visible: 'focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-slate-900',
  
  // 카드/컨테이너용 포커스
  card: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-4 dark:focus:ring-blue-400 dark:focus:ring-offset-slate-900',
  
  // 링크용 포커스 (언더라인)
  link: 'focus:outline-none focus:underline focus:underline-offset-4',
  
  // 투명한 포커스 (커스텀 스타일용)
  none: 'focus:outline-none',
} as const;

export type FocusStyle = keyof typeof FOCUS_CLASSES;

/**
 * 포커스 스타일 가져오기
 */
export function getFocusClass(style: FocusStyle = 'default'): string {
  return FOCUS_CLASSES[style];
}
