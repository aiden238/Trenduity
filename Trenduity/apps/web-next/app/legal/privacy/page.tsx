'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 text-xl font-semibold">
              ← 뒤로 가기
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">개인정보 처리방침</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-800">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. 개인정보의 수집 및 이용 목적</h2>
              <p className="text-xl leading-relaxed">
                Trenduity(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 
                처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
                이용 목적이 변경되는 경우에는 관련 법령에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc list-inside space-y-3 text-xl mt-4">
                <li>회원 가입 및 관리</li>
                <li>서비스 제공 및 향상</li>
                <li>학습 진도 관리 및 맞춤형 콘텐츠 추천</li>
                <li>고객 문의 응대 및 민원 처리</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. 수집하는 개인정보의 항목</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">필수 항목</h3>
                  <ul className="list-disc list-inside space-y-2 text-xl">
                    <li>이메일 주소</li>
                    <li>이름</li>
                    <li>비밀번호 (암호화 저장)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">선택 항목</h3>
                  <ul className="list-disc list-inside space-y-2 text-xl">
                    <li>프로필 사진</li>
                    <li>생년월일</li>
                    <li>관심 분야</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">자동 수집 항목</h3>
                  <ul className="list-disc list-inside space-y-2 text-xl">
                    <li>서비스 이용 기록</li>
                    <li>접속 로그</li>
                    <li>쿠키</li>
                    <li>접속 IP 정보</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. 개인정보의 보유 및 이용 기간</h2>
              <p className="text-xl leading-relaxed">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 
                동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc list-inside space-y-3 text-xl mt-4">
                <li>회원 탈퇴 시: 즉시 삭제 (단, 관련 법령에 따라 보존 필요 시 별도 보관)</li>
                <li>서비스 미이용 기간이 1년 이상인 경우: 별도 분리 보관 후 파기</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. 개인정보의 제3자 제공</h2>
              <p className="text-xl leading-relaxed">
                회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 
                다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside space-y-3 text-xl mt-4">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. 개인정보의 파기</h2>
              <p className="text-xl leading-relaxed">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 
                지체없이 해당 개인정보를 파기합니다.
              </p>
              <div className="mt-4 space-y-3 text-xl">
                <p><strong>파기 절차:</strong> 불필요한 개인정보는 내부 방침 및 관련 법령에 따라 파기합니다.</p>
                <p><strong>파기 방법:</strong> 전자적 파일은 복구 불가능한 방법으로 영구 삭제하며, 
                종이 문서는 분쇄기로 분쇄하거나 소각합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. 정보주체의 권리·의무 및 행사방법</h2>
              <p className="text-xl leading-relaxed">
                이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-3 text-xl mt-4">
                <li>개인정보 열람 요구</li>
                <li>개인정보 정정·삭제 요구</li>
                <li>개인정보 처리정지 요구</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. 개인정보 보호책임자</h2>
              <div className="bg-gray-50 rounded-xl p-6 text-xl">
                <p className="mb-2"><strong>성명:</strong> 개인정보보호팀장</p>
                <p className="mb-2"><strong>이메일:</strong> privacy@trenduity.com</p>
                <p><strong>전화:</strong> 02-1234-5678</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. 개인정보의 안전성 확보 조치</h2>
              <p className="text-xl leading-relaxed">
                회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-3 text-xl mt-4">
                <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육</li>
                <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 
                개인정보의 암호화, 보안프로그램 설치</li>
                <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </section>

            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <p className="text-xl text-gray-600">
                <strong>시행일:</strong> 2024년 12월 1일
              </p>
              <p className="text-xl text-gray-600 mt-2">
                본 방침에 대한 문의사항이 있으시면 개인정보보호책임자에게 연락주시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
