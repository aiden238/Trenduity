'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ScamCheckPage() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    if (!message.trim()) {
      alert('문자 내용을 입력해주세요');
      return;
    }

    setIsChecking(true);
    
    // 간단한 키워드 기반 검사 (실제로는 BFF API 호출)
    const dangerousKeywords = [
      '지원금', '환급', '계좌', '정지', '경찰', '검찰', '택배', '링크', 'http', 
      '긴급', '즉시', '확인', '클릭', '설치', '앱', '카톡', '금액', '송금'
    ];
    
    const foundKeywords = dangerousKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    setTimeout(() => {
      const isSuspicious = foundKeywords.length >= 2;
      
      setResult({
        is_suspicious: isSuspicious,
        risk_level: isSuspicious ? 'high' : foundKeywords.length > 0 ? 'medium' : 'low',
        matched_keywords: foundKeywords,
        recommendations: isSuspicious 
          ? [
              '❌ 이 문자는 사기일 가능성이 매우 높습니다',
              '링크를 절대 누르지 마세요',
              '개인정보를 입력하지 마세요',
              '경찰(112)에 신고하세요',
              '가족에게 알려주세요'
            ]
          : foundKeywords.length > 0
          ? [
              '⚠️ 의심스러운 내용이 포함되어 있어요',
              '신중하게 확인해보세요',
              '발신 번호를 검색해보세요',
              '의심되면 무시하세요'
            ]
          : [
              '✅ 안전한 문자로 보입니다',
              '하지만 항상 주의하세요',
              '개인정보는 절대 알려주지 마세요'
            ]
      });
      
      setIsChecking(false);
    }, 1500);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getRiskEmoji = (level: string) => {
    switch (level) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '✅';
      default: return '❓';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'high': return '위험';
      case 'medium': return '주의';
      case 'low': return '안전';
      default: return '확인 필요';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/senior" className="text-blue-600 hover:text-blue-700 text-2xl">
                ← 뒤로
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">🛡️ 사기 문자 확인</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 안내 */}
        <div className="bg-blue-50 rounded-2xl p-8 mb-8 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">📱 어떻게 사용하나요?</h2>
          <ol className="space-y-3 text-xl text-blue-800">
            <li>1. 의심스러운 문자 내용을 복사하세요</li>
            <li>2. 아래 입력창에 붙여넣기 하세요</li>
            <li>3. "확인하기" 버튼을 누르세요</li>
            <li>4. 결과를 확인하고 안전하게 대처하세요</li>
          </ol>
        </div>

        {/* 입력 영역 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <label className="block text-2xl font-bold text-gray-900 mb-4">
            의심스러운 문자 내용
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="예시:&#10;&#10;[Web발신]&#10;정부 코로나 지원금 300만원 신청하세요&#10;👉 http://bit.ly/xxxxx&#10;&#10;문자 내용을 여기에 입력하세요..."
            className="w-full h-64 px-6 py-4 text-2xl border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            style={{ lineHeight: '1.6' }}
          />
          
          <button
            onClick={handleCheck}
            disabled={isChecking || !message.trim()}
            className={`w-full mt-6 py-6 rounded-xl text-2xl font-bold transition-all ${
              isChecking || !message.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isChecking ? '확인 중...' : '🛡️ 사기 확인하기'}
          </button>
        </div>

        {/* 결과 영역 */}
        {result && (
          <div className="space-y-6">
            {/* 위험도 표시 */}
            <div className={`rounded-2xl p-8 border-2 ${getRiskColor(result.risk_level)}`}>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-6xl">{getRiskEmoji(result.risk_level)}</span>
                <div>
                  <p className="text-xl font-semibold mb-1">위험도</p>
                  <p className="text-4xl font-bold">{getRiskText(result.risk_level)}</p>
                </div>
              </div>
            </div>

            {/* 발견된 키워드 */}
            {result.matched_keywords.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🔍 발견된 의심 키워드
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.matched_keywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-xl font-semibold"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 추천 행동 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                💡 이렇게 대처하세요
              </h3>
              <ul className="space-y-4">
                {result.recommendations.map((rec: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start space-x-3 text-xl text-gray-800 bg-gray-50 p-4 rounded-xl"
                  >
                    <span className="flex-shrink-0 mt-1 text-2xl">
                      {rec.startsWith('❌') ? '❌' : rec.startsWith('⚠️') ? '⚠️' : '✅'}
                    </span>
                    <span className="flex-1 leading-relaxed">{rec.replace(/^[❌⚠️✅]\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 긴급 연락처 */}
            <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-200">
              <h3 className="text-2xl font-bold text-red-900 mb-6">
                🚨 긴급 신고 전화
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="tel:112"
                  className="bg-white rounded-xl p-6 text-center shadow hover:shadow-lg transition-shadow"
                >
                  <div className="text-5xl mb-2">👮</div>
                  <p className="text-2xl font-bold text-gray-900">112</p>
                  <p className="text-lg text-gray-600">경찰 신고</p>
                </a>
                <a
                  href="tel:182"
                  className="bg-white rounded-xl p-6 text-center shadow hover:shadow-lg transition-shadow"
                >
                  <div className="text-5xl mb-2">🛡️</div>
                  <p className="text-2xl font-bold text-gray-900">182</p>
                  <p className="text-lg text-gray-600">사기 신고</p>
                </a>
              </div>
            </div>

            {/* 다시 확인 */}
            <button
              onClick={() => {
                setMessage('');
                setResult(null);
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-6 rounded-xl text-2xl font-bold shadow-lg transition-all hover:shadow-xl"
            >
              다른 문자 확인하기
            </button>
          </div>
        )}

        {/* 팁 */}
        <div className="mt-8 bg-yellow-50 rounded-2xl p-8 border-2 border-yellow-200">
          <h3 className="text-2xl font-bold text-yellow-900 mb-4">💡 기억하세요!</h3>
          <ul className="space-y-3 text-xl text-yellow-800">
            <li>✅ 정부/은행은 문자로 개인정보를 요구하지 않아요</li>
            <li>✅ 의심스러운 링크는 절대 누르지 마세요</li>
            <li>✅ 급하다고 서두르게 하면 사기일 확률이 높아요</li>
            <li>✅ 가족이나 경찰에게 먼저 확인하세요</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
