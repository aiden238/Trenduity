'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

const MOCK_INSIGHTS = {
  'insight-1': {
    id: 'insight-1',
    title: 'ChatGPT 완전 정복 가이드',
    emoji: '🤖',
    topic: 'ai_tools',
    published_at: '2024-12-05',
    read_time_min: 5,
    view_count: 1247,
    content: `# ChatGPT 완전 정복 가이드 🤖

## 1. ChatGPT란?
ChatGPT는 OpenAI가 만든 대화형 AI입니다. 마치 똑똑한 비서처럼 질문에 답하고, 글을 써주고, 아이디어를 제안해줘요.

## 2. 시작하기
1. **chat.openai.com** 에 접속하세요
2. 구글 계정으로 쉽게 가입할 수 있어요
3. 대화창에 궁금한 것을 입력하세요!

## 3. 활용 팁
- **명확하게 물어보세요**: "요리법 알려줘" 보다 "된장찌개 끓이는 법 단계별로 알려줘"가 좋아요
- **대화하듯 질문하세요**: 추가 질문도 자유롭게!
- **다시 물어보세요**: 답변이 마음에 안 들면 "다시 설명해줘" 하면 돼요

> 💡 팁: 한국어로 물어보면 한국어로 답해줘요!

## 4. 실제 활용 예시

### 요리 도움
"저녁 메뉴 추천해줘. 냉장고에 계란, 양파, 당근이 있어"

### 건강 정보
"무릎이 아픈데 집에서 할 수 있는 가벼운 운동 알려줘"

### 글쓰기 도움
"손자 생일 축하 문자 작성해줘. 따뜻하고 감동적인 느낌으로"

## 5. 주의사항
⚠️ **개인정보는 입력하지 마세요** (주민번호, 계좌번호 등)
⚠️ **의료/법률 문제는 전문가에게** 상담하세요
⚠️ **정보 확인하기**: 중요한 내용은 꼭 다시 검색해보세요

## 6. 자주 묻는 질문

**Q. 무료인가요?**
A. 기본 버전은 무료입니다! 더 빠른 속도를 원하면 유료 버전도 있어요.

**Q. 안전한가요?**
A. 네! 하지만 개인정보는 절대 입력하지 마세요.

**Q. 한국어 지원되나요?**
A. 완벽하게 지원됩니다!

---

오늘부터 ChatGPT와 함께 더 편리한 디지털 생활을 시작해보세요! 🎉`,
  },
  'insight-2': {
    id: 'insight-2',
    title: '스미싱 문자 100% 구별하는 방법',
    emoji: '🛡️',
    topic: 'digital_safety',
    published_at: '2024-12-04',
    read_time_min: 3,
    view_count: 2891,
    content: `# 스미싱 문자 100% 구별하는 방법 🛡️

## 스미싱이란?
문자(SMS)를 통해 개인정보를 빼가는 사기 수법이에요.

## 이런 문자는 100% 사기!

### 1. "정부 지원금 신청하세요" + 이상한 링크
❌ "코로나 지원금 300만원 신청하세요 👉 http://bit.ly/xxx"

정부는 문자로 지원금을 알리지 않아요!

### 2. "택배 배송 실패" + 주소 확인 링크
❌ "택배가 도착했으나 주소 불명확. 확인: http://xxx"

진짜 택배회사는 전화로 연락해요!

### 3. "계좌가 정지되었습니다" + 확인 요청
❌ "고객님 계좌 정지. 즉시 확인 필요: http://xxx"

은행은 절대 문자로 계좌 정지를 알리지 않아요!

### 4. "경찰/검찰입니다" + 앱 설치 요청
❌ "귀하는 사건 관련자입니다. 앱 설치: http://xxx"

경찰은 문자로 사건 조사를 하지 않아요!

### 5. 모르는 번호로 온 급한 송금 요청
❌ "엄마 휴대폰 고장났어. 급하게 돈 좀 보내줘"

항상 전화로 직접 확인하세요!

## 안전하게 대처하는 방법

### ❌ 절대 하지 마세요
- 링크를 누르지 마세요
- 앱을 설치하지 마세요
- 개인정보를 입력하지 마세요
- 돈을 보내지 마세요

### ✅ 이렇게 하세요
1. **가족에게 전화**로 먼저 확인하세요
2. **경찰(112)**에 신고하세요
3. **의심되면 삭제**하세요
4. **주변 사람들**에게 알려주세요

## 진짜와 가짜 구별법

### 진짜 정부/은행 문자는:
✅ 공식 번호로 옴 (예: 1588-xxxx)
✅ 링크 없이 전화번호만 있음
✅ 개인정보를 요구하지 않음
✅ 급하게 서두르지 않음

### 가짜 사기 문자는:
❌ 이상한 번호로 옴 (예: 010-xxxx-xxxx)
❌ 수상한 링크가 있음
❌ 개인정보/돈을 요구함
❌ "긴급", "즉시" 같은 단어 사용

## 만약 링크를 눌렀다면?

1. **즉시 휴대폰을 끄세요**
2. **은행 앱 비밀번호를 바꾸세요**
3. **은행에 신고하세요** (각 은행 고객센터)
4. **경찰에 신고하세요** (112)

> ⚠️ 기억하세요: 정부, 은행, 택배회사는 문자로 개인정보를 요구하지 않아요!

---

의심스러운 문자는 **바로 삭제**하고 **주변에 알려주세요**! 🛡️`,
  },
};

export default function InsightDetailPage() {
  const params = useParams();
  const insightId = params.id as string;
  const insight = MOCK_INSIGHTS[insightId as keyof typeof MOCK_INSIGHTS];

  if (!insight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">😕</div>
          <p className="text-2xl text-gray-600 font-semibold mb-4">
            콘텐츠를 찾을 수 없어요
          </p>
          <Link
            href="/senior/insights"
            className="text-xl text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 마크다운 스타일 파싱 (간단한 버전)
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // 제목
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-5xl font-bold text-gray-900 mb-6 mt-8">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-4xl font-bold text-gray-900 mb-4 mt-8">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-3xl font-bold text-gray-800 mb-3 mt-6">{line.substring(4)}</h3>;
      }
      
      // 인용구
      if (line.startsWith('> ')) {
        return (
          <div key={index} className="bg-blue-50 border-l-4 border-blue-600 p-6 my-6 rounded-r-xl">
            <p className="text-xl text-gray-800 font-semibold">{line.substring(2)}</p>
          </div>
        );
      }
      
      // 리스트
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={index} className="text-2xl text-gray-800 mb-3 ml-8 leading-relaxed">
            {line.substring(2)}
          </li>
        );
      }
      
      // 번호 리스트
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={index} className="text-2xl text-gray-800 mb-3 ml-8 leading-relaxed list-decimal">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      
      // 구분선
      if (line.trim() === '---') {
        return <hr key={index} className="my-8 border-t-2 border-gray-200" />;
      }
      
      // 빈 줄
      if (line.trim() === '') {
        return <div key={index} className="h-4" />;
      }
      
      // 일반 텍스트
      return <p key={index} className="text-2xl text-gray-800 mb-4 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/senior/insights" className="flex items-center space-x-3 text-blue-600 hover:text-blue-700">
            <span className="text-2xl">←</span>
            <span className="text-xl font-semibold">뒤로 가기</span>
          </Link>
        </div>
      </header>

      {/* 콘텐츠 */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 제목 영역 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start space-x-6 mb-6">
            <div className="text-7xl">{insight.emoji}</div>
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                {insight.title}
              </h1>
              <div className="flex items-center space-x-6 text-gray-600">
                <span className="flex items-center space-x-2 text-xl">
                  <span>⏱️</span>
                  <span>{insight.read_time_min}분</span>
                </span>
                <span className="flex items-center space-x-2 text-xl">
                  <span>👁️</span>
                  <span>{insight.view_count.toLocaleString()}</span>
                </span>
                <span className="flex items-center space-x-2 text-xl">
                  <span>📅</span>
                  <span>{new Date(insight.published_at).toLocaleDateString('ko-KR')}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <article className="prose prose-lg max-w-none">
            {parseMarkdown(insight.content)}
          </article>
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex justify-center">
          <Link
            href="/senior/insights"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-2xl font-bold shadow-lg transition-all hover:shadow-xl"
          >
            다른 콘텐츠 보기 →
          </Link>
        </div>
      </main>
    </div>
  );
}
