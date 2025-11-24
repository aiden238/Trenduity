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
    <div className="max-w-4xl mx-auto">
      {/* 헤더 (그라디언트) */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 dark:from-pink-800 dark:to-rose-900 rounded-2xl shadow-xl p-8 mb-8 text-white dark:text-slate-100">
        <h1 className="text-4xl font-bold mb-2">💌 응원 보내기</h1>
        <p className="text-pink-100">가족에게 따뜻한 응원 메시지를 전달하세요</p>
      </div>

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
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
          {/* 피드백 메시지 */}
          {feedback && (
            <div 
              className={`mb-6 p-5 rounded-xl font-medium ${
                feedback.type === 'success' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-800' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-800 dark:text-slate-100 font-bold mb-3 text-lg">
                👤 받는 사람
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-xl px-5 py-3.5 focus:border-pink-500 dark:focus:border-pink-400 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-800 transition-all text-lg"
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

            <div>
              <label className="block text-gray-800 dark:text-slate-100 font-bold mb-3 text-lg">
                💬 메시지
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-xl px-5 py-4 h-40 focus:border-pink-500 dark:focus:border-pink-400 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-800 transition-all text-lg placeholder:text-gray-400 dark:placeholder:text-slate-500"
                placeholder="따뜻한 응원 메시지를 입력하세요..."
                required
                disabled={isSending}
              />
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                <span>💡</span>
                <span>가족에게 힘이 되는 메시지를 전해보세요!</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isSending || !selectedMember || !message.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 dark:from-pink-800 dark:to-rose-900 text-white dark:text-slate-100 px-8 py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-rose-700 dark:hover:from-pink-900 dark:hover:to-rose-950 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSending ? '보내는 중... ✉️' : '보내기 💌'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
