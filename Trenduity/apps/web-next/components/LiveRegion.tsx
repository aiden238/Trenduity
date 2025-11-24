'use client';

import React, { useEffect, useRef } from 'react';
import type { AriaLive } from '../utils/ariaUtils';

interface LiveRegionProps {
  /** Live region 타입 */
  live?: AriaLive;
  /** 메시지 */
  message: string;
  /** 원자성 (전체 읽기) */
  atomic?: boolean;
  /** 자동 초기화 시간 (ms) */
  clearAfter?: number;
}

/**
 * Live Region 컴포넌트
 * 스크린 리더에게 동적 컨텐츠 변경 알림
 * 
 * @example
 * <LiveRegion 
 *   live="polite" 
 *   message="카드를 완료했습니다"
 *   clearAfter={3000}
 * />
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  live = 'polite',
  message,
  atomic = true,
  clearAfter,
}) => {
  const [currentMessage, setCurrentMessage] = React.useState(message);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setCurrentMessage(message);

    // 자동 초기화
    if (clearAfter && message) {
      timeoutRef.current = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  if (!currentMessage) return null;

  return (
    <div
      role="status"
      aria-live={live}
      aria-atomic={atomic}
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
};

interface AnnouncementContextValue {
  announce: (message: string, live?: AriaLive, clearAfter?: number) => void;
}

const AnnouncementContext = React.createContext<AnnouncementContextValue | null>(null);

/**
 * Announcement Provider
 * 전역 Live Region 관리
 */
export const AnnouncementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [announcement, setAnnouncement] = React.useState<{
    message: string;
    live: AriaLive;
    clearAfter?: number;
  }>({
    message: '',
    live: 'polite',
  });

  const announce = React.useCallback(
    (message: string, live: AriaLive = 'polite', clearAfter?: number) => {
      setAnnouncement({ message, live, clearAfter });
    },
    []
  );

  return (
    <AnnouncementContext.Provider value={{ announce }}>
      {children}
      <LiveRegion
        live={announcement.live}
        message={announcement.message}
        clearAfter={announcement.clearAfter}
      />
    </AnnouncementContext.Provider>
  );
};

/**
 * useAnnouncement 훅
 * 스크린 리더에게 메시지 알림
 * 
 * @example
 * const { announce } = useAnnouncement();
 * announce('저장되었습니다', 'polite');
 */
export function useAnnouncement() {
  const context = React.useContext(AnnouncementContext);
  
  if (!context) {
    throw new Error('useAnnouncement must be used within AnnouncementProvider');
  }
  
  return context;
}

/**
 * 일반적인 알림 메시지
 */
export const ANNOUNCEMENT_MESSAGES = {
  // 성공
  saved: '저장되었습니다',
  deleted: '삭제되었습니다',
  updated: '업데이트되었습니다',
  completed: '완료되었습니다',
  sent: '전송되었습니다',

  // 로딩
  loading: '로딩 중입니다',
  loadingComplete: '로딩이 완료되었습니다',

  // 에러
  error: '오류가 발생했습니다',
  networkError: '네트워크 오류가 발생했습니다',
  validationError: '입력값을 확인해주세요',

  // 네비게이션
  navigatedTo: (page: string) => `${page} 페이지로 이동했습니다`,
  
  // 상태 변경
  expanded: '확장되었습니다',
  collapsed: '축소되었습니다',
  opened: '열렸습니다',
  closed: '닫혔습니다',

  // 카운트
  itemsFound: (count: number) => `${count}개의 항목을 찾았습니다`,
  itemsSelected: (count: number) => `${count}개의 항목이 선택되었습니다`,
} as const;
