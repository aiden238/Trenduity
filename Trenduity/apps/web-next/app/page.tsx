'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeToday: 0,
    totalPoints: 0,
    currentStreak: 0
  });
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // BFF API에서 데이터 가져오기
    fetch('http://localhost:8002/v1/family/members')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data) {
          const membersData = data.data.members || [];
          setMembers(membersData);
          
          // 통계 계산
          const activeToday = membersData.filter(m => {
            if (!m.last_activity) return false;
            const daysDiff = Math.floor((Date.now() - new Date(m.last_activity).getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= 1;
          }).length;
          
          setStats({
            totalMembers: membersData.length,
            activeToday,
            totalPoints: membersData.reduce((sum, m) => sum + (m.total_points || 0), 0),
            currentStreak: membersData.reduce((sum, m) => sum + (m.current_streak || 0), 0)
          });
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch members:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white rounded-lg shadow p-6">
        <h1 className="text-4xl font-bold text-gray-900">가족 대시보드</h1>
        <p className="text-gray-600 mt-2">가족 멤버들의 학습 현황을 한눈에 확인하세요</p>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 멤버</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalMembers}</p>
            </div>
            <div className="text-4xl"></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">오늘 활동</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeToday}</p>
            </div>
            <div className="text-4xl"></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 포인트</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalPoints}</p>
            </div>
            <div className="text-4xl"></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">연속 일수</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.currentStreak}</p>
            </div>
            <div className="text-4xl"></div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">가족 멤버</h2>
        </div>
        <div className="p-6">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4"></div>
              <p className="text-gray-600 text-lg">아직 등록된 멤버가 없습니다</p>
              <p className="text-gray-500 mt-2">가족을 초대하여 함께 학습을 시작하세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member.user_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {member.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name || '이름 없음'}</h3>
                      <p className="text-sm text-gray-500">{member.total_points || 0} 포인트</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">완료 카드</span>
                      <span className="font-semibold">{member.cards_completed || 0}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">연속 일수</span>
                      <span className="font-semibold">{member.current_streak || 0}일</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">마지막 활동</span>
                      <span className="font-semibold">
                        {member.last_activity 
                          ? new Date(member.last_activity).toLocaleDateString('ko-KR')
                          : '활동 없음'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Server Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">서버 상태</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-gray-700">BFF 서버 정상 작동 중 (http://localhost:8002)</p>
        </div>
      </div>
    </div>
  );
}
