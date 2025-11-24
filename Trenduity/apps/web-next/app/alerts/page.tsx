'use client';

import { useEffect, useState } from 'react';

/**
 * 알림 목록 페이지
 * 
 * Priority 1.3 구현:
 * - BFF API로 알림 목록 조회
 * - 읽음/안 읽음 필터링
 * - 알림 타입별 아이콘 표시
 * - 읽음 처리 기능
 */

interface Alert {
  id: string;
  type: 'med_check' | 'card_completed' | 'tool_completed';
  message: string;
  timestamp: string;
  is_read: boolean;
  family_member_name: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BFF_API_URL = process.env.NEXT_PUBLIC_BFF_API_URL || 'http://localhost:8000';

  // 알림 목록 조회
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const unreadOnly = filter === 'unread';
      const response = await fetch(
        `${BFF_API_URL}/v1/alerts?family_id=test-family&unread_only=${unreadOnly}&limit=20`
      );
      
      if (!response.ok) {
        throw new Error('알림을 불러오는데 실패했습니다');
      }
      
      const data = await response.json();
      
      if (data.ok) {
        setAlerts(data.data.alerts);
        setUnreadCount(data.data.unread_count);
      } else {
        throw new Error(data.error?.message || '알림을 불러오는데 실패했습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  // 알림 읽음 처리
  const markAsRead = async (alertIds: string[]) => {
    try {
      const response = await fetch(`${BFF_API_URL}/v1/alerts/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alert_ids: alertIds }),
      });
      
      if (!response.ok) {
        throw new Error('읽음 처리 실패');
      }
      
      // 성공 시 목록 새로고침
      fetchAlerts();
    } catch (err) {
      console.error('읽음 처리 오류:', err);
    }
  };

  // 알림 타입별 아이콘
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'med_check':
        return '💊';
      case 'card_completed':
        return '📚';
      case 'tool_completed':
        return '🎨';
      default:
        return '🔔';
    }
  };

  // 타임스탬프 포맷팅 (간단한 상대 시간)
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-100">알림</h2>
        <p className="text-gray-500 dark:text-slate-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 헤더 (그라디언트) */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-800 dark:to-indigo-900 rounded-2xl shadow-xl p-8 mb-8 text-white dark:text-slate-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">🔔 알림</h1>
            {unreadCount > 0 ? (
              <p className="text-purple-100">
                읽지 않은 알림 <span className="font-bold text-2xl">{unreadCount}</span>개
              </p>
            ) : (
              <p className="text-purple-100">모든 알림을 확인했어요!</p>
            )}
          </div>

          {/* 필터 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-lg'
                  : 'bg-white/20 dark:bg-white/10 text-white hover:bg-white/30 dark:hover:bg-white/20'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              안 읽음
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-12 text-center border border-gray-100 dark:border-slate-700">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500 dark:text-slate-400 text-lg">
            {filter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 dark:border-slate-700 ${
                !alert.is_read ? 'border-l-4 border-blue-500 dark:border-blue-400' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    <div className="text-3xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-slate-100 text-lg">{alert.message}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                        <span>🕒</span>
                        <span>{formatTimestamp(alert.timestamp)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    {!alert.is_read && (
                      <>
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                          새로운 ✨
                        </span>
                        <button
                          onClick={() => markAsRead([alert.id])}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline"
                        >
                          읽음 처리
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 모두 읽음 처리 버튼 */}
      {unreadCount > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              const unreadIds = alerts
                .filter((a) => !a.is_read)
                .map((a) => a.id);
              if (unreadIds.length > 0) {
                markAsRead(unreadIds);
              }
            }}
            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white dark:text-slate-100 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-900 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ✅ 모두 읽음 처리
          </button>
        </div>
      )}
    </div>
  );
}
