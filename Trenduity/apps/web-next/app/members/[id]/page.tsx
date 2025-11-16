import { notFound } from 'next/navigation';

/**
 * 회원 상세 페이지
 * 
 * TODO(IMPLEMENT): Supabase에서 사용자 데이터 조회
 * TODO(IMPLEMENT): 주간 활동 차트
 * TODO(IMPLEMENT): 복약 히스토리
 */
export default function MemberDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Dummy data
  const member = {
    id: params.id,
    name: '김어머니',
    age: 65,
    mode: 'easy',
    weeklyCards: [1, 1, 0, 1, 1, 1, 0],
    recentActivity: [
      { type: 'card', title: 'AI 기초', completedAt: '2시간 전' },
      { type: 'med', title: '아침 약 체크', completedAt: '3시간 전' },
    ],
  };

  if (!member) {
    notFound();
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">{member.name}님 상세</h2>

      {/* 기본 정보 */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4">기본 정보</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">나이</p>
            <p className="font-semibold">{member.age}세</p>
          </div>
          <div>
            <p className="text-gray-600">접근성 모드</p>
            <p className="font-semibold">{member.mode}</p>
          </div>
        </div>
      </div>

      {/* 주간 카드 완료 */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4">주간 카드 완료</h3>
        <div className="flex gap-2">
          {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
            <div key={day} className="flex-1 text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  member.weeklyCards[idx]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {day}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">최근 활동</h3>
        <div className="space-y-4">
          {member.recentActivity.map((activity, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.type}</p>
              </div>
              <p className="text-sm text-gray-600">{activity.completedAt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
