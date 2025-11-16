# 04. Web Console - Next.js 웹 콘솔 스켈레톤

> 가족/기관 관리자용 대시보드 구조 생성

---

## 📋 목표

- Next.js (App Router) 앱 초기화
- 주요 라우트 생성 (대시보드, 회원, 알림)
- Supabase 브라우저 클라이언트 설정
- packages/ui 컴포넌트 통합

---

## 🗂️ 폴더 구조

```
apps/web-next/
├── app/
│   ├── layout.tsx                   # 루트 레이아웃
│   ├── page.tsx                     # 메인 대시보드
│   ├── members/
│   │   ├── page.tsx                 # 회원 목록
│   │   └── [id]/
│   │       └── page.tsx             # 회원 상세
│   ├── alerts/
│   │   └── page.tsx                 # 알림 목록
│   └── encourage/
│       └── page.tsx                 # 응원 보내기
├── components/
│   ├── dashboard/
│   │   ├── MemberCard.tsx           # 회원 카드
│   │   ├── ActivityChart.tsx        # 활동 차트
│   │   └── AlertList.tsx            # 알림 리스트
│   └── layout/
│       ├── Header.tsx               # 헤더
│       └── Sidebar.tsx              # 사이드바 (선택)
├── lib/
│   ├── supabase.ts                  # Supabase 클라이언트
│   └── utils.ts                     # 유틸리티
├── styles/
│   └── globals.css                  # 글로벌 스타일
├── public/
├── next.config.js
├── package.json
├── tsconfig.json
└── .env.local.example
```

---

## 📄 파일별 상세 내용

### package.json

```json
{
  "name": "web-next",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "@repo/ui": "*",
    "@repo/types": "*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "14.0.0"
  }
}
```

---

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/types'],
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
```

---

### tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./app/*"],
      "@repo/ui": ["../../packages/ui/src"],
      "@repo/types": ["../../packages/types/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### .env.local.example

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# BFF API
NEXT_PUBLIC_BFF_API_URL=http://localhost:8000
```

---

### app/layout.tsx

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '시니어학습앱 - 가족 대시보드',
  description: '50-70대를 위한 AI 학습 플랫폼 관리 콘솔',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                시니어학습앱 관리
              </h1>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
```

---

### app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
```

---

### app/page.tsx

```typescript
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
```

---

### app/members/page.tsx

```typescript
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
```

---

### app/members/[id]/page.tsx

```typescript
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
```

---

### app/alerts/page.tsx

```typescript
/**
 * 알림 목록 페이지
 * 
 * TODO(IMPLEMENT): alerts 테이블 조회
 * TODO(IMPLEMENT): 읽음 처리
 */
export default function AlertsPage() {
  const alerts = [
    {
      id: '1',
      type: 'med_check',
      message: '김어머니님이 아침 약을 체크했습니다',
      timestamp: '2시간 전',
      isRead: false,
    },
    {
      id: '2',
      type: 'card_completed',
      message: '박아버지님이 오늘의 카드를 완료했습니다',
      timestamp: '1일 전',
      isRead: true,
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">알림</h2>

      <div className="bg-white rounded-lg shadow divide-y">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-6 ${!alert.isRead ? 'bg-blue-50' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold">{alert.message}</p>
                <p className="text-sm text-gray-500 mt-1">{alert.timestamp}</p>
              </div>
              {!alert.isRead && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  새로운
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### app/encourage/page.tsx

```typescript
'use client';

import { useState } from 'react';

/**
 * 응원 보내기 페이지
 * 
 * TODO(IMPLEMENT): BFF API 호출
 */
export default function EncouragePage() {
  const [message, setMessage] = useState('');
  const [member, setMember] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[TODO] Send encouragement:', { member, message });
    alert('응원 메시지를 보냈습니다!');
    setMessage('');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">응원 보내기</h2>

      <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              받는 사람
            </label>
            <select
              value={member}
              onChange={(e) => setMember(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="1">김어머니</option>
              <option value="2">박아버지</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              메시지
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 h-32"
              placeholder="응원 메시지를 입력하세요..."
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            보내기
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

### lib/supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Supabase 브라우저 클라이언트
 * 
 * TODO(IMPLEMENT): 환경변수 검증
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## ✅ 작업 체크리스트

### 초기 설정
- [ ] Next.js 앱 초기화
- [ ] package.json 설정
- [ ] next.config.js 설정
- [ ] tsconfig.json 설정
- [ ] Tailwind CSS 설정 (선택)

### 레이아웃
- [ ] app/layout.tsx (루트 레이아웃)
- [ ] Header 컴포넌트

### 라우트 (5개)
- [ ] app/page.tsx (대시보드)
- [ ] app/members/page.tsx
- [ ] app/members/[id]/page.tsx
- [ ] app/alerts/page.tsx
- [ ] app/encourage/page.tsx

### 설정
- [ ] lib/supabase.ts 스텁
- [ ] .env.local.example

### 통합 테스트
- [ ] `npm run dev` 실행 성공
- [ ] 브라우저에서 모든 페이지 접근 가능

---

## 🔗 다음 단계

웹 콘솔 스켈레톤이 완료되면 **[05-bff-service.md](./05-bff-service.md)**로 이동하여 BFF 서비스를 구성합니다.

---

**작성일**: 2025년 11월 13일  
**작성자**: AI Scaffolding Assistant
