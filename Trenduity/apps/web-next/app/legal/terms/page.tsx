'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 text-xl font-semibold">
              ← 뒤로 가기
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">서비스 이용약관</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-800">
            <section>
              <h2 className="text-2xl font-bold mb-4">제1조 (목적)</h2>
              <p className="text-xl leading-relaxed">
                본 약관은 Trenduity(이하 "회사")가 제공하는 디지털 학습 서비스(이하 "서비스")의 이용과 관련하여
                회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">제2조 (용어의 정의)</h2>
              <ul className="list-disc list-inside space-y-3 text-xl">
                <li>"서비스"란 회사가 제공하는 모든 디지털 학습 콘텐츠 및 관련 서비스를 의미합니다.</li>
                <li>"이용자"란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                <li>"회원"이란 회사와 서비스 이용계약을 체결하고 아이디를 부여받은 자를 말합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">제3조 (약관의 효력 및 변경)</h2>
              <p className="text-xl leading-relaxed">
                본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.
                회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">제4조 (서비스의 제공 및 변경)</h2>
              <p className="text-xl leading-relaxed">
                회사는 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className="list-disc list-inside space-y-3 text-xl">
                <li>디지털 리터러시 학습 콘텐츠</li>
                <li>AI 기반 맞춤형 학습 추천</li>
                <li>커뮤니티 기능 (Q&A, 경험 공유)</li>
                <li>학습 진도 관리 및 통계</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">제5조 (이용자의 의무)</h2>
              <p className="text-xl leading-relaxed">
                이용자는 다음 행위를 하여서는 안 됩니다:
              </p>
              <ul className="list-disc list-inside space-y-3 text-xl">
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">제6조 (개인정보보호)</h2>
              <p className="text-xl leading-relaxed">
                회사는 이용자의 개인정보를 보호하기 위하여 개인정보처리방침을 운영합니다.
                자세한 내용은 개인정보 처리방침을 참고하시기 바랍니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">제7조 (책임제한)</h2>
              <p className="text-xl leading-relaxed">
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 
                서비스 제공에 관한 책임이 면제됩니다.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <p className="text-xl text-gray-600">
                <strong>시행일:</strong> 2024년 12월 1일
              </p>
              <p className="text-xl text-gray-600 mt-2">
                본 약관에 대한 문의사항이 있으시면 고객센터로 연락주시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
