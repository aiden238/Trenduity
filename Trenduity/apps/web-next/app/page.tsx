import Link from 'next/link';

/**
 * 메인 대시보드
 * 
 * TODO(IMPLEMENT): 실제 회원 데이터 로드
 * TODO(IMPLEMENT): 최근 알림 표시
 * TODO(IMPLEMENT): 요약 통계
 */
export default function DashboardPage() {
  // Dummy data
  const members = [
    { id: '1', name: '김어머니', age: 65, lastActivity: '2시간 전' },
    { id: '2', name: '박아버지', age: 72, lastActivity: '1일 전' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">대시보드</h2>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">관리 중인 회원</h3>
          <p className="text-4xl font-bold text-blue-600">{members.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">오늘 학습 완료</h3>
          <p className="text-4xl font-bold text-green-600">1</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">미확인 알림</h3>
          <p className="text-4xl font-bold text-orange-600">3</p>
        </div>
      </div>

      {/* 회원 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">회원 목록</h3>
        </div>
        <div className="divide-y">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/members/${member.id}`}
              className="block p-6 hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-semibold">{member.name}</h4>
                  <p className="text-gray-600">{member.age}세</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">마지막 활동</p>
                  <p className="text-sm font-medium">{member.lastActivity}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
