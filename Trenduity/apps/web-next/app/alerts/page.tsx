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
        <h2 className="text-3xl font-bold mb-6">알림</h2>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">알림</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              읽지 않은 알림 {unreadCount}개
            </p>
          )}
        </div>

        {/* 필터 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            안 읽음
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">
            {filter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 ${!alert.is_read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3 flex-1">
                  <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  {!alert.is_read && (
                    <>
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        새로운
                      </span>
                      <button
                        onClick={() => markAsRead([alert.id])}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        읽음 처리
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 모두 읽음 처리 버튼 */}
      {unreadCount > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              const unreadIds = alerts
                .filter((a) => !a.is_read)
                .map((a) => a.id);
              if (unreadIds.length > 0) {
                markAsRead(unreadIds);
              }
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            모두 읽음 처리
          </button>
        </div>
      )}
    </div>
  );
}
