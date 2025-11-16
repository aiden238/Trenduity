'use client';

import { useState } from 'react';

/**
 * 응원 보내기 페이지
 * 
 * TODO(IMPLEMENT): BFF API 호출
 */
export default function EncouragePage() {
  const [message, setMessage] = useState('');
  const [member, setMember] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[TODO] Send encouragement:', { member, message });
    alert('응원 메시지를 보냈습니다!');
    setMessage('');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">응원 보내기</h2>

      <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              받는 사람
            </label>
            <select
              value={member}
              onChange={(e) => setMember(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="1">김어머니</option>
              <option value="2">박아버지</option>
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
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            보내기
          </button>
        </form>
      </div>
    </div>
  );
}
