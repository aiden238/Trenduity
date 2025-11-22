'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { apiGet, apiPost } from '../utils/apiClient';

/**
 * 응원 보내기 페이지
 * 
 * BFF API 연동 완료 ✅
 * - POST /v1/family/encourage
 * - 가족 멤버 목록 조회
 */

interface FamilyMember {
  user_id: string;
  name: string;
  last_activity?: string;
  perms: Record<string, boolean>;
}

const fetcher = (url: string) => apiGet<any>(url);

export default function EncouragePage() {
  const [message, setMessage] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 가족 멤버 목록 조회
  const { data: membersData, error } = useSWR<{ members: FamilyMember[] }>(
    '/v1/family/members',
    fetcher
  );

  const members = membersData?.members || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMember || !message.trim()) {
      setFeedback({ type: 'error', message: '받는 사람과 메시지를 모두 입력해 주세요.' });
      return;
    }

    setIsSending(true);
    setFeedback(null);

    try {
      const response = await apiPost<{ success: boolean; message: string }>('/v1/family/encourage', {
        user_id: selectedMember,
        message: message.trim(),
      });

      if (response.success) {
        setFeedback({ type: 'success', message: '응원 메시지를 보냈어요! 💖' });
        setMessage('');
      } else {
        setFeedback({ 
          type: 'error', 
          message: response.message || '메시지 전송에 실패했어요.' 
        });
      }
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        message: err instanceof Error ? err.message : '메시지 전송에 실패했어요.' 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">응원 보내기</h2>

      {/* 멤버 로딩 에러 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">가족 목록을 불러올 수 없어요.</p>
        </div>
      )}

      {/* 멤버 없음 */}
      {!error && members.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">연동된 가족 멤버가 없어요.</p>
        </div>
      )}

      {/* 격려 메시지 폼 */}
      {members.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
          {/* 피드백 메시지 */}
          {feedback && (
            <div 
              className={`mb-4 p-4 rounded-lg ${
                feedback.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                받는 사람
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
                required
              >
                <option value="">선택하세요</option>
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                메시지
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 h-32"
                placeholder="응원 메시지를 입력하세요..."
                required
                disabled={isSending}
              />
              <p className="text-sm text-gray-500 mt-1">
                💡 따뜻한 응원 메시지를 보내주세요!
              </p>
            </div>

            <button
              type="submit"
              disabled={isSending || !selectedMember || !message.trim()}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSending ? '보내는 중...' : '보내기'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
