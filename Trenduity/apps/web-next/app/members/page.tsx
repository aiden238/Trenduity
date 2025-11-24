'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { apiGet } from '../utils/apiClient';
import { ListSkeleton } from '../../components/Skeleton';

/**
 * 회원 목록 페이지
 * 
 * BFF API 연동 완료 ✅
 * - GET /v1/family/members
 * - SWR로 데이터 페칭 및 캐싱
 */

interface FamilyMember {
  user_id: string;
  name: string;
  last_activity?: string;
  perms: Record<string, boolean>;
}

interface MembersResponse {
  members: FamilyMember[];
}

const fetcher = (url: string) => apiGet<MembersResponse>(url);

export default function MembersPage() {
  const { data, error, isLoading } = useSWR<MembersResponse>(
    '/v1/family/members',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-2">가족 멤버</h1>
          <p className="text-gray-600 dark:text-slate-400">등록된 가족 구성원을 관리하세요</p>
        </div>
        <ListSkeleton items={5} avatar={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">⚠️ 회원 목록을 불러올 수 없어요</p>
        <p className="text-red-600 text-sm">{error.message || '네트워크 연결을 확인해 주세요.'}</p>
      </div>
    );
  }

  const members = data?.members || [];

  if (members.length === 0) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">관리 회원</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">아직 연동된 회원이 없어요</p>
          <p className="text-gray-500 text-sm">가족 초대를 통해 시니어 회원을 추가해 보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">👨‍👩‍👧‍👦 관리 회원</h2>
        <span className="text-gray-600 font-semibold">총 {members.length}명</span>
      </div>

      {/* 활동 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-1">전체 회원</p>
              <p className="text-3xl font-bold text-blue-900">{members.length}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-semibold mb-1">활동 중인 회원</p>
              <p className="text-3xl font-bold text-green-900">
                {members.filter(m => m.last_activity).length}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-semibold mb-1">읽기 권한</p>
              <p className="text-3xl font-bold text-purple-900">
                {members.filter(m => m.perms.read).length}
              </p>
            </div>
            <div className="text-4xl">📖</div>
          </div>
        </div>
      </div>

      {/* 회원 카드 */}
      <h3 className="text-xl font-bold mb-4">회원 목록</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Link
            key={member.user_id}
            href={`/members/${member.user_id}`}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-[1.02] border border-gray-200"
          >
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">👤</span>
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                </div>
                {member.last_activity ? (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>🕐</span>
                    <span>
                      {new Date(member.last_activity).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">활동 기록 없음</p>
                )}
              </div>
            </div>

            {/* 권한 배지 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {member.perms.read && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  <span>📖</span>
                  <span>읽기</span>
                </span>
              )}
              {member.perms.alerts && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                  <span>🔔</span>
                  <span>알림</span>
                </span>
              )}
            </div>

            {/* 활동 상태 */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">활동 상태</span>
                {member.last_activity ? (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>활동 중</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-400">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>대기 중</span>
                  </span>
                )}
              </div>
            </div>

            {/* 링크 표시 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 font-semibold">상세 정보 보기</span>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 도움말 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-2">💡 사용 팁</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>회원 카드를 클릭하면 상세한 학습 활동과 진척도를 확인할 수 있어요.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>마지막 활동 시간으로 회원의 참여도를 파악할 수 있어요.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>권한 설정은 개별 회원 상세 페이지에서 변경할 수 있어요.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
