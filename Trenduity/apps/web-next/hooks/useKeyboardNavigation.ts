import { useEffect, useCallback, useRef } from 'react';

/**
 * 키보드 내비게이션 타입
 */
export type KeyboardKey = 
  | 'Tab' 
  | 'Enter' 
  | 'Escape' 
  | 'Space' 
  | 'ArrowUp' 
  | 'ArrowDown' 
  | 'ArrowLeft' 
  | 'ArrowRight'
  | 'Home'
  | 'End';

interface KeyboardShortcut {
  key: KeyboardKey;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: (event: KeyboardEvent) => void;
}

/**
 * 키보드 단축키 훅
 * 글로벌 또는 로컬 키보드 이벤트 처리
 * 
 * @example
 * useKeyboardShortcut({
 *   key: 'Escape',
 *   callback: () => closeModal()
 * });
 */
export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  const { key, ctrlKey = false, shiftKey = false, altKey = false, callback } = shortcut;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 키 매칭
      if (
        event.key === key &&
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey
      ) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, ctrlKey, shiftKey, altKey, callback]);
}

/**
 * 포커스 트랩 훅
 * 모달, 드로어 등에서 포커스를 내부에 가두기
 * 
 * @example
 * const trapRef = useFocusTrap<HTMLDivElement>(isModalOpen);
 * <div ref={trapRef}>...</div>
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 초기 포커스
    firstElement?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      // Shift + Tab: 역방향
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } 
      // Tab: 정방향
      else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return ref;
}

/**
 * 화살표 키 내비게이션 훅
 * 리스트, 그리드 등에서 방향키로 항목 이동
 * 
 * @example
 * const { focusedIndex, setFocusedIndex } = useArrowNavigation(items.length);
 */
export function useArrowNavigation(itemCount: number, options?: {
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'grid';
  gridColumns?: number;
}) {
  const {
    loop = true,
    orientation = 'vertical',
    gridColumns = 1,
  } = options || {};

  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (orientation === 'vertical' || orientation === 'grid') {
          setFocusedIndex((prev) => {
            const next = orientation === 'grid' ? prev - gridColumns : prev - 1;
            if (next < 0) return loop ? itemCount - 1 : prev;
            return next;
          });
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (orientation === 'vertical' || orientation === 'grid') {
          setFocusedIndex((prev) => {
            const next = orientation === 'grid' ? prev + gridColumns : prev + 1;
            if (next >= itemCount) return loop ? 0 : prev;
            return next;
          });
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (orientation === 'horizontal' || orientation === 'grid') {
          setFocusedIndex((prev) => {
            const next = prev - 1;
            if (next < 0) return loop ? itemCount - 1 : prev;
            return next;
          });
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (orientation === 'horizontal' || orientation === 'grid') {
          setFocusedIndex((prev) => {
            const next = prev + 1;
            if (next >= itemCount) return loop ? 0 : prev;
            return next;
          });
        }
        break;

      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        event.preventDefault();
        setFocusedIndex(itemCount - 1);
        break;
    }
  }, [itemCount, loop, orientation, gridColumns]);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
}

/**
 * Skip to main content 링크 표시 훅
 * Tab 키 누르면 "본문으로 건너뛰기" 링크 노출
 */
export function useSkipLink() {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsVisible(true);
      }
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return isVisible;
}

// React import for useState
import React from 'react';
