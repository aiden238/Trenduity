import Link from 'next/link';

/**
 * 회원 목록 페이지
 * 
 * TODO(IMPLEMENT): Supabase에서 family_links 조회
 * TODO(IMPLEMENT): 필터 및 검색
 */
export default function MembersPage() {
  const members = [
    { id: '1', name: '김어머니', age: 65, cardCount: 15, medStreak: 7 },
    { id: '2', name: '박아버지', age: 72, cardCount: 8, medStreak: 3 },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">관리 회원</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {members.map((member) => (
          <Link
            key={member.id}
            href={`/members/${member.id}`}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold mb-2">{member.name}</h3>
            <p className="text-gray-600 mb-4">{member.age}세</p>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-gray-500">완료한 카드</p>
                <p className="font-semibold">{member.cardCount}개</p>
              </div>
              <div>
                <p className="text-gray-500">복약 연속</p>
                <p className="font-semibold">{member.medStreak}일</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
