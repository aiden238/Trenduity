import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useInsightList } from '../../hooks/useInsights';
import { COLORS } from '../../tokens/colors';

/**
 * 주제 목록
 */
const TOPICS = [
  { key: undefined, label: '전체', icon: '📚' },
  { key: 'ai_tools', label: 'AI 활용', icon: '🤖' },
  { key: 'digital_safety', label: '디지털 안전', icon: '🛡️' },
  { key: 'health', label: '건강', icon: '💊' },
  { key: 'finance', label: '금융', icon: '💰' },
];

/**
 * 목업 인사이트 데이터 (노션/블로그 스타일)
 */
const MOCK_INSIGHTS = [
  {
    id: 'insight-1',
    title: 'LLM이 뭔가요? 쉽게 알아보기',
    summary: '요즘 자주 듣는 LLM이 대체 뭘까요? ChatGPT, Gemini 같은 AI의 원리를 쉽게 설명해드려요.',
    topic: 'ai_tools',
    published_at: '2024-12-05',
    read_time_min: 5,
    view_count: 1247,
    content: `# LLM이 뭔가요? 쉽게 알아보기 🤖

## LLM이란?
**LLM**은 "Large Language Model"의 줄임말이에요. 한글로 하면 **"대형 언어 모델"** 입니다.

쉽게 말해서 **엄청나게 많은 글을 읽고 학습한 AI**예요. 마치 평생 책만 읽은 똑똑한 학자 같은 거죠!

## 우리가 쓰는 LLM들
### ChatGPT (OpenAI)
- 가장 유명한 LLM
- 대화하듯 질문하고 답변 받기
- 글쓰기, 번역, 요약 등 다양한 일

### Gemini (구글)
- 구글이 만든 LLM
- 구글 검색과 연결됨
- 최신 정보 찾기에 강함

### 클로바X (네이버)
- 한국어에 특화된 LLM
- 네이버 서비스와 연동
- 한국 문화 이해도가 높음

## LLM이 하는 일
1. **대화하기** - 사람처럼 자연스럽게 대화
2. **글쓰기** - 편지, 이메일, 문서 작성
3. **번역하기** - 여러 나라 언어 번역
4. **요약하기** - 긴 글을 짧게 정리
5. **설명하기** - 어려운 개념을 쉽게 설명

## 왜 "대형"일까요?
- 📚 **수십억 개**의 글을 학습했어요
- 🧠 **수천억 개**의 연결고리(파라미터)가 있어요
- 💾 **엄청난 컴퓨터**가 필요해요

마치 도서관 전체를 통째로 외운 것 같아요!

## 일상에서 LLM 활용하기
- ✉️ 손자에게 보낼 문자 다듬기
- 📋 병원 서류 쉽게 설명 듣기
- 🍳 냉장고 재료로 요리법 찾기
- 📰 어려운 뉴스 쉽게 이해하기

> 💡 LLM은 모든 걸 아는 건 아니에요. 틀릴 수도 있으니 중요한 건 꼭 다시 확인하세요!`,
  },
  {
    id: 'insight-2',
    title: '스미싱 문자 100% 구별하는 방법',
    summary: '최근 급증하는 스미싱 사기! 가짜 문자를 구별하는 5가지 핵심 포인트를 알려드립니다.',
    topic: 'digital_safety',
    published_at: '2024-12-04',
    read_time_min: 3,
    view_count: 2891,
    content: `# 스미싱 문자 100% 구별하는 방법 🛡️

## 스미싱이란?
문자(SMS)를 통해 개인정보를 빼가는 사기 수법이에요.

## 이런 문자는 100% 사기!
1. **"정부 지원금 신청하세요"** + 이상한 링크
2. **"택배 배송 실패"** + 주소 확인 링크
3. **"계좌가 정지되었습니다"** + 확인 요청
4. **"경찰/검찰입니다"** + 앱 설치 요청
5. **모르는 번호**로 온 급한 송금 요청

## 안전하게 대처하는 방법
- ❌ 링크 절대 누르지 마세요
- ❌ 앱 설치하지 마세요
- ✅ 가족이나 경찰(112)에 먼저 확인하세요
- ✅ 의심되면 그냥 삭제하세요

> ⚠️ 기억하세요: 정부, 은행, 택배회사는 문자로 개인정보를 요구하지 않아요!`,
  },
  {
    id: 'insight-3',
    title: '하루 30분 걷기의 놀라운 효과',
    summary: '매일 30분 걷기만 해도 건강이 확 좋아집니다. 과학적으로 증명된 걷기의 효과를 알아보세요.',
    topic: 'health',
    published_at: '2024-12-03',
    read_time_min: 4,
    view_count: 1823,
    content: `# 하루 30분 걷기의 놀라운 효과 🚶

## 걷기가 좋은 이유
걷기는 가장 안전하고 효과적인 운동이에요. 나이에 상관없이 누구나 할 수 있죠!

## 과학적으로 증명된 효과
1. **심장 건강** - 심장병 위험 30% 감소
2. **당뇨 예방** - 혈당 조절에 효과적
3. **뇌 건강** - 치매 예방에 도움
4. **기분 개선** - 우울감 감소, 활력 증가
5. **뼈 건강** - 골다공증 예방

## 올바른 걷기 방법
- 👟 편한 운동화를 신으세요
- 🧘 바른 자세로 걸으세요 (허리 펴고!)
- ⏰ 아침이나 저녁 선선한 시간이 좋아요
- 💧 물을 꼭 챙기세요

> 💪 오늘부터 30분 걷기 시작해보세요!`,
  },
  {
    id: 'insight-4',
    title: '은행 앱으로 이체하는 방법',
    summary: '은행 앱을 처음 사용하시나요? 계좌이체하는 방법을 쉽게 알려드려요.',
    topic: 'finance',
    published_at: '2024-12-02',
    read_time_min: 4,
    view_count: 956,
    content: `# 은행 앱으로 이체하는 방법 💰

## 준비물
- 스마트폰
- 은행 앱 (국민은행, 신한은행 등)
- 공동인증서 또는 간편비밀번호

## 이체하는 순서
1. 은행 앱을 열어요
2. '이체' 버튼을 눌러요
3. 보낼 계좌번호를 입력해요
4. 금액을 입력해요
5. 비밀번호를 입력해요
6. '이체' 버튼을 눌러요

## 주의사항
- ⚠️ 계좌번호를 꼭 다시 확인하세요
- ⚠️ 모르는 사람에게 이체하지 마세요
- ⚠️ 비밀번호를 다른 사람에게 알려주지 마세요

> 💡 처음에는 가족에게 도움을 받아보세요!`,
  },
  {
    id: 'insight-5',
    title: '카카오톡 영상통화 완전 정복',
    summary: '가족과 무료로 얼굴 보며 통화하세요! 카카오톡 영상통화 방법을 알려드려요.',
    topic: 'ai_tools',
    published_at: '2024-12-01',
    read_time_min: 3,
    view_count: 3102,
    content: `# 카카오톡 영상통화 완전 정복 📱

## 영상통화란?
전화하면서 상대방 얼굴을 볼 수 있어요. 멀리 사는 가족 얼굴도 볼 수 있죠!

## 영상통화 하는 방법
1. 카카오톡을 열어요
2. 통화할 사람의 대화방에 들어가요
3. 오른쪽 위 **전화 버튼**을 눌러요
4. **'영상통화'**를 선택해요
5. 상대방이 받으면 연결돼요!

## 영상통화 중 할 수 있는 것
- 📷 카메라 끄기/켜기
- 🔇 마이크 끄기/켜기
- 🔄 전면/후면 카메라 전환

> 🎉 손주 얼굴도 보면서 통화해보세요!`,
  },
  {
    id: 'insight-6',
    title: 'ChatGPT vs Gemini, 뭐가 다른가요?',
    summary: '둘 다 AI인데 뭐가 다를까요? ChatGPT와 Gemini의 차이점을 쉽게 비교해드려요.',
    topic: 'ai_tools',
    published_at: '2024-11-30',
    read_time_min: 4,
    view_count: 1456,
    content: `# ChatGPT vs Gemini, 뭐가 다른가요? 🤔

## 간단 요약
- **ChatGPT**: OpenAI가 만든 AI (미국 회사)
- **Gemini**: Google이 만든 AI (구글)

둘 다 LLM(대형 언어 모델)이지만 특징이 달라요!

## ChatGPT의 특징
### 장점 ✅
- 💬 **대화가 자연스러워요** - 사람처럼 말해요
- ✍️ **글쓰기가 좋아요** - 편지, 이메일 작성에 강함
- 🎨 **창의적이에요** - 시, 이야기 만들기 잘함
- 📱 **앱이 편해요** - 스마트폰 앱 사용하기 쉬움

### 단점 ❌
- 📅 **최신 정보 약해요** - 2023년까지만 학습
- 💰 **유료 기능 많아요** - 좋은 기능은 돈 내야 함

## Gemini의 특징
### 장점 ✅
- 🔍 **최신 정보 강해요** - 구글 검색 연결됨
- 🆓 **무료로 많이 써요** - 기본 기능 충분함
- 🌐 **언어 능력 좋아요** - 여러 나라 말 잘함
- 📊 **사실 확인 정확해요** - 구글 데이터 활용

### 단점 ❌
- 🤖 **좀 딱딱해요** - ChatGPT보다 덜 자연스러움
- 🎨 **창의성은 약해요** - 글쓰기는 ChatGPT가 나음

## 어떤 걸 써야 할까요?

### ChatGPT를 쓰세요
- ✉️ 편지나 문자 작성할 때
- 📝 긴 글을 요약할 때
- 💭 아이디어가 필요할 때
- 🗣️ 친구처럼 대화하고 싶을 때

### Gemini를 쓰세요
- 🔎 최신 뉴스 찾을 때
- 📍 가게나 병원 정보 알고 싶을 때
- 🌍 여행 정보 검색할 때
- 📊 사실을 정확히 확인할 때

## 접속 방법
### ChatGPT
- 웹: **chat.openai.com**
- 앱: 플레이스토어/앱스토어에서 "ChatGPT" 검색

### Gemini
- 웹: **gemini.google.com**
- 앱: 플레이스토어/앱스토어에서 "Gemini" 검색
- 또는 구글 앱에서도 사용 가능!

## 사용 팁
1. **둘 다 써보세요** - 무료니까 부담 없어요
2. **목적에 맞게 골라요** - 글쓰기면 ChatGPT, 검색이면 Gemini
3. **같은 질문 해보세요** - 답변 비교하면 재밌어요

> 💡 둘 다 무료로 충분히 쓸 수 있어요. 편한 걸 고르세요!`,
  },
  {
    id: 'insight-7',
    title: 'AI에게 뭐라고 말해야 좋을까요?',
    summary: 'AI와 대화할 때 어떻게 물어봐야 좋은 답을 받을까요? 효과적인 질문법을 알려드려요.',
    topic: 'ai_tools',
    published_at: '2024-11-29',
    read_time_min: 5,
    view_count: 2134,
    content: `# AI에게 뭐라고 말해야 좋을까요? 💬

## AI와 대화하는 기본 원칙
AI는 사람처럼 대화할 수 있어요. 하지만 **명확하고 구체적**으로 말할수록 좋은 답을 얻을 수 있어요!

## ❌ 이렇게 물으면 안 돼요
### 너무 짧게
- "요리법 알려줘" → 뭐에 대한 요리법?
- "병원 어디 있어?" → 어느 지역? 무슨 병원?
- "날씨 어때?" → 어느 지역? 언제?

### 너무 애매하게
- "좋은 방법 알려줘" → 뭐에 대한 방법?
- "그거 어떻게 해?" → 무슨 '그거'?

## ✅ 이렇게 물어보세요

### 1단계: 구체적으로
❌ "요리법 알려줘"
✅ "된장찌개 끓이는 법 알려줘"
✅✅ "된장찌개 끓이는 법을 단계별로 쉽게 알려줘"

### 2단계: 배경 설명하기
❌ "운동 방법 알려줘"
✅ "70대 무릎이 안 좋은 사람도 할 수 있는 운동 방법 알려줘"

### 3단계: 원하는 형식 말하기
❌ "스마트폰 사용법 알려줘"
✅ "갤럭시 스마트폰으로 사진 찍는 법을 3단계로 쉽게 설명해줘"

## 실전 예시 모음

### 건강 관련
✅ "혈압약을 먹고 있는데, 같이 먹으면 안 되는 음식이 뭐가 있을까요?"
✅ "무릎 관절염이 있어요. 집에서 할 수 있는 스트레칭 5가지 알려주세요."

### 디지털 기기
✅ "카카오톡에서 사진을 보내는 방법을 순서대로 알려주세요."
✅ "유튜브에서 자막을 켜는 방법을 단계별로 설명해주세요."

### 생활 정보
✅ "서울 강남구에 있는 정형외과 병원 3곳 추천해주세요."
✅ "냉장고에 달걀, 양파, 당근이 있어요. 이걸로 만들 수 있는 요리 알려주세요."

### 금융·행정
✅ "70세 이상 어르신이 받을 수 있는 정부 지원금에 대해 쉽게 설명해주세요."
✅ "국민연금 수령액을 인터넷으로 확인하는 방법을 알려주세요."

## 꿀팁 5가지

### 1. 역할 주기
"당신은 친절한 스마트폰 선생님이에요. 70대도 이해할 수 있게 설명해주세요."

### 2. 단계별 요청
"5단계로 나눠서 설명해주세요"

### 3. 예시 요청
"구체적인 예시를 들어서 설명해주세요"

### 4. 재질문하기
"더 쉽게 다시 설명해주세요"
"이해가 안 돼요. 다른 방법으로 설명해주세요"

### 5. 확인하기
"제가 이해한 게 맞나요? 요약해주세요"

## 추가 질문도 자유롭게!
AI는 이전 대화를 기억해요. 계속 물어봐도 괜찮아요!

예시:
- 첫 질문: "카카오톡 사용법 알려줘"
- 추가 질문: "사진은 어떻게 보내?"
- 추가 질문: "동영상도 보낼 수 있어?"

## 주의사항
- ⚠️ 개인정보(주민번호, 계좌번호)는 절대 말하지 마세요
- ⚠️ 의료 조언은 참고만 하고 꼭 병원에서 확인하세요
- ⚠️ 금융 투자 조언은 전문가와 상담하세요

> 💡 처음엔 어색해도 괜찮아요. 자꾸 써보면 금방 익숙해져요!`,
  },
  {
    id: 'insight-8',
    title: 'ChatGPT 유료 vs 무료, 뭐가 다를까요?',
    summary: 'ChatGPT 무료로도 충분한가요? 유료 버전은 뭐가 더 좋은가요? 차이점을 알려드려요.',
    topic: 'ai_tools',
    published_at: '2024-11-28',
    read_time_min: 4,
    view_count: 1823,
    content: `# ChatGPT 유료 vs 무료, 뭐가 다를까요? 💰

## 버전 종류
1. **무료 버전** (GPT-3.5) - 0원
2. **유료 버전** (ChatGPT Plus) - 월 20달러 (약 26,000원)
3. **프로 버전** (ChatGPT Pro) - 월 200달러 (약 260,000원)

대부분 **무료 버전**으로 충분해요!

## 무료 버전 (GPT-3.5)

### 할 수 있는 것 ✅
- 💬 기본 대화 - 질문하고 답변 받기
- ✍️ 글쓰기 - 편지, 이메일 작성
- 📝 요약하기 - 긴 글 짧게 정리
- 🌍 번역하기 - 여러 나라 언어
- 💡 아이디어 - 간단한 조언과 팁
- 📚 설명하기 - 어려운 개념 쉽게

### 제한 사항 ❌
- ⏱️ **응답이 조금 느려요** - 유료보다 1-2초 더 걸림
- 🧠 **덜 똑똑해요** - 복잡한 질문은 약함
- 📅 **최신 정보 없어요** - 2023년까지만 알고 있음
- 🚫 **피크 시간 제한** - 사용자 많으면 느려짐

## 유료 버전 (ChatGPT Plus)

### 추가 기능 ✨
- ⚡ **더 빠른 응답** - 즉각 답변
- 🧠 **더 똑똑한 AI** (GPT-4) - 복잡한 질문도 잘 이해
- 📊 **더 긴 대화** - 한 번에 더 많이 물어봐도 됨
- 🎨 **이미지 생성** - DALL-E로 그림 만들기
- 📈 **분석 기능** - 데이터 분석, 차트 만들기
- 🔍 **인터넷 검색** - 최신 정보 찾기 (베타)
- 📎 **파일 업로드** - PDF, 이미지 분석

## 어느 걸 써야 할까요?

### 무료로 충분한 경우 ✅
- 📱 가끔 궁금한 거 물어볼 때
- ✉️ 간단한 문자나 편지 쓸 때
- 📖 짧은 글 요약할 때
- 🗣️ 대화 연습할 때
- 🍳 요리법 같은 일상 정보

**→ 대부분의 시니어분들은 무료로 충분해요!**

### 유료가 필요한 경우 💰
- 💼 일로 자주 써야 할 때
- 📚 긴 문서를 분석할 때
- 🎨 이미지를 만들고 싶을 때
- 📊 복잡한 데이터 정리할 때
- ⚡ 빠른 응답이 꼭 필요할 때

## 가격 비교

| 구분 | 무료 | Plus | Pro |
|------|------|------|-----|
| 가격 | 0원 | 26,000원/월 | 260,000원/월 |
| AI 모델 | GPT-3.5 | GPT-4 | GPT-4 + 무제한 |
| 응답 속도 | 보통 | 빠름 | 매우 빠름 |
| 사용 제한 | 가끔 제한 | 거의 없음 | 없음 |

## 유료 전환 고려사항

### 이런 분은 유료 추천 👍
- 매일 여러 번 사용하는 분
- 길고 복잡한 질문이 많은 분
- 이미지나 차트가 필요한 분
- 최신 정보가 중요한 분

### 이런 분은 무료로 충분 ✋
- 가끔 궁금한 거 물어보는 분
- 간단한 질문만 하는 분
- 예산이 부담되는 분
- 일상 용도로만 쓰는 분

## 무료로 시작하세요!
1. **무료로 1-2주 써보세요**
2. **부족함을 느끼는지 확인하세요**
3. **정말 필요하면 그때 유료 전환하세요**

무료에서 유료로 바꾸는 건 언제든 가능해요!

## 할인 팁 💡
- 🎓 **학생 할인** 없음
- 👴 **시니어 할인** 없음
- 💳 **연간 결제** 할인 없음

안타깝게도 ChatGPT는 할인이 거의 없어요.
대신 **무료 버전만으로도 충분**하니 걱정 마세요!

> 🎯 결론: 일단 무료로 써보세요. 대부분은 무료로 충분해요!`,
  },
  {
    id: 'insight-9',
    title: 'AI로 사진 쉽게 편집하기',
    summary: '손주 사진 더 예쁘게 만들고 싶으신가요? AI가 자동으로 보정해주는 사진 앱을 알려드려요.',
    topic: 'ai_tools',
    published_at: '2024-11-27',
    read_time_min: 5,
    view_count: 1678,
    content: `# AI로 사진 쉽게 편집하기 📸

## AI 사진 편집이란?
인공지능이 자동으로 사진을 분석해서 더 예쁘게 만들어줘요. 전문가 없이도 멋진 사진 완성!

## 추천 AI 사진 앱
1. **Remini** - 흐릿한 사진 선명하게
2. **Photo Enhancer** - 자동 색보정
3. **갤러리 앱 기본 편집** - 삼성/LG 기본 앱도 AI 기능 있음

## 쉬운 편집 3단계
### 1단계: 자동 보정
- 앱에서 사진 선택
- '자동 보정' 버튼 클릭
- AI가 밝기, 색감 자동 조정!

### 2단계: 배경 흐리게 (인물 강조)
- '인물 모드' 선택
- AI가 자동으로 사람 인식
- 배경만 흐리게 처리

### 3단계: 불필요한 물체 지우기
- '지우기' 도구 선택
- 지우고 싶은 부분 터치
- AI가 자연스럽게 채워넣음

## 활용 예시
- 👨‍👩‍👧‍👦 가족 사진 보정
- 🎂 생일 파티 사진 꾸미기
- 🌄 여행 사진 색감 높이기
- 📷 오래된 흑백사진 컬러로 복원

## 꿀팁
- 💾 원본은 꼭 따로 저장하세요
- 🔍 확대해서 세부 확인
- 🎨 '자동 보정' 후 미세 조정
- 📤 카톡으로 가족에게 자랑하기

> ⚡ Remini는 흐릿한 옛날 사진도 선명하게 복원해줘요!`,
  },
];

// 조회수 저장 키
const VIEW_COUNT_KEY = '@insight_view_counts';

/**
 * 인사이트 목록 화면
 */
export const InsightListScreen = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
  const [refreshing, setRefreshing] = useState(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [localInsights, setLocalInsights] = useState(MOCK_INSIGHTS);
  
  const { data: apiInsights, isLoading, error, refetch } = useInsightList(selectedTopic, range);
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();
  const navigation = useNavigation<any>();
  
  // 다크 모드 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  // 조회수 로드
  useEffect(() => {
    loadViewCounts();
  }, []);

  // API 데이터와 목업 데이터 병합
  useEffect(() => {
    const mergedInsights = MOCK_INSIGHTS.map(insight => ({
      ...insight,
      view_count: (insight.view_count || 0) + (viewCounts[insight.id] || 0),
    }));
    setLocalInsights(mergedInsights);
  }, [viewCounts]);

  const loadViewCounts = async () => {
    try {
      const stored = await AsyncStorage.getItem(VIEW_COUNT_KEY);
      if (stored) {
        setViewCounts(JSON.parse(stored));
      }
    } catch (e) {
      console.log('조회수 로드 실패:', e);
    }
  };

  const incrementViewCount = async (insightId: string) => {
    try {
      const newCounts = { ...viewCounts, [insightId]: (viewCounts[insightId] || 0) + 1 };
      setViewCounts(newCounts);
      await AsyncStorage.setItem(VIEW_COUNT_KEY, JSON.stringify(newCounts));
    } catch (e) {
      console.log('조회수 저장 실패:', e);
    }
  };

  const handleInsightPress = async (insightId: string) => {
    // 조회수 증가
    await incrementViewCount(insightId);
    
    // 목업 인사이트 찾기
    const insight = MOCK_INSIGHTS.find(i => i.id === insightId);
    
    // InsightDetail로 이동 (목업 데이터 전달)
    navigation.navigate('InsightDetail', { 
      insightId,
      mockData: insight, // 목업 데이터 전달
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadViewCounts();
    await refetch();
    setRefreshing(false);
  };

  const renderTopicFilter = () => (
    <View style={[styles.topicFilter, { paddingVertical: spacing.sm }]}>
      <FlatList
        horizontal
        data={TOPICS}
        keyExtractor={(item) => item.key || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item }) => {
          const isSelected = item.key === selectedTopic;
          return (
            <TouchableOpacity
              onPress={() => setSelectedTopic(item.key)}
              style={[
                styles.topicChip,
                { 
                  backgroundColor: isSelected ? COLORS.primary.main : cardBg,
                  marginRight: spacing.sm,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} 주제 필터`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.topicChipText,
                  {
                    fontSize: fontSizes.body,
                    color: isSelected ? '#FFFFFF' : textPrimary,
                  },
                ]}
              >
                {item.icon} {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderInsightItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.insightCard, { backgroundColor: cardBg, marginHorizontal: spacing.md }]}
      onPress={() => handleInsightPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} 인사이트 보기`}
    >
      <View style={styles.insightHeader}>
        <Text style={[styles.insightCategory, { fontSize: fontSizes.caption, color: COLORS.primary.main }]}>
          {item.topic === 'ai_tools' ? '🤖 AI 활용' :
           item.topic === 'digital_safety' ? '🛡️ 디지털 안전' :
           item.topic === 'health' ? '💊 건강' :
           item.topic === 'finance' ? '💰 금융' : '📚 기타'}
        </Text>
        <Text style={[styles.insightDate, { fontSize: fontSizes.caption, color: textSecondary }]}>
          {item.published_at ? new Date(item.published_at).toLocaleDateString('ko-KR') : ''}
        </Text>
      </View>
      <Text style={[styles.insightTitle, { fontSize: fontSizes.heading2, color: textPrimary }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.insightSummary, { fontSize: fontSizes.body, color: textSecondary }]} numberOfLines={2}>
        {item.summary}
      </Text>
      <View style={styles.insightFooter}>
        <Text style={[styles.insightReadTime, { fontSize: fontSizes.caption, color: textSecondary }]}>
          📖 {item.read_time_min || 3}분 읽기
        </Text>
        <Text style={[styles.insightViews, { fontSize: fontSizes.caption, color: textSecondary }]}>
          👁️ {item.view_count || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 - 청록색 계열 */}
      <View style={[styles.header, { backgroundColor: '#0F766E', padding: spacing.lg }]}>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
          📚 오늘의 배움
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)' }]}>
          하루 3분, 새로운 지식을 배워보세요
        </Text>
      </View>

      {/* 주제 필터 */}
      {renderTopicFilter()}

      {/* 인사이트 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
          <Text style={[styles.loadingText, { fontSize: fontSizes.body, color: textSecondary }]}>
            인사이트를 불러오는 중...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { fontSize: fontSizes.heading2, color: textPrimary }]}>
            😢 오류가 발생했어요
          </Text>
          <Text style={[styles.errorDetail, { fontSize: fontSizes.body, color: textSecondary }]}>
            인사이트를 불러올 수 없어요.{'\n'}잠시 후 다시 시도해 주세요.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: COLORS.primary.main, height: buttonHeight }]}
            onPress={() => refetch()}
          >
            <Text style={[styles.retryButtonText, { fontSize: fontSizes.body }]}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={selectedTopic 
            ? localInsights.filter(i => i.topic === selectedTopic) 
            : localInsights}
          keyExtractor={(item) => item.id}
          renderItem={renderInsightItem}
          contentContainerStyle={{ paddingVertical: spacing.md }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { fontSize: fontSizes.body, color: textSecondary }]}>
                이 주제의 인사이트가 아직 없어요.{'\n'}다른 주제를 선택해보세요! 📚
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  topicFilter: {},
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topicChipText: {
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontWeight: '600',
    marginBottom: 8,
  },
  errorDetail: {
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightCategory: {
    fontWeight: '600',
  },
  insightDate: {},
  insightTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  insightSummary: {
    lineHeight: 22,
    marginBottom: 12,
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightReadTime: {},
  insightViews: {},
});
