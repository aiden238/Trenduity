# 웹 대시보드 UI 고도화 계획서 (Web Dashboard Enhancement)

> **목표**: 가족 구성원을 위한 데이터 중심의 직관적인 웹 대시보드 구현  
> **원칙**: 반응형 디자인, 실시간 업데이트, 차트/그래프 시각화, 접근성

---

## 📋 목차

1. [디자인 시스템 (웹 버전)](#1-디자인-시스템-웹-버전)
2. [페이지별 개선 계획](#2-페이지별-개선-계획)
3. [차트 및 데이터 시각화](#3-차트-및-데이터-시각화)
4. [컴포넌트 개선 목록](#4-컴포넌트-개선-목록)
5. [구현 우선순위](#5-구현-우선순위)

---

## 1. 디자인 시스템 (웹 버전)

### 1.1 색상 팔레트

```typescript
// Tailwind CSS 기반 (Next.js 14)
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // 메인 블루
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',  // 녹색
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',  // 주황색
    700: '#c2410c',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    500: '#6b7280',
    700: '#374151',
    900: '#111827',
  },
};
```

### 1.2 타이포그래피 (웹)

```css
/* Tailwind Typography Plugin */
.heading-1 {
  @apply text-4xl font-bold text-gray-900;
}
.heading-2 {
  @apply text-3xl font-semibold text-gray-800;
}
.heading-3 {
  @apply text-2xl font-semibold text-gray-700;
}
.body {
  @apply text-base text-gray-600;
}
.caption {
  @apply text-sm text-gray-500;
}
```

### 1.3 간격 및 그리드

```typescript
// Container max-width
const layout = {
  maxWidth: '1280px',  // xl breakpoint
  padding: {
    mobile: '1rem',    // 16px
    tablet: '2rem',    // 32px
    desktop: '3rem',   // 48px
  },
  gridGap: '1.5rem',   // 24px
};
```

### 1.4 그림자 (Shadow)

```css
.shadow-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}
.shadow-card-hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}
```

---

## 2. 페이지별 개선 계획

### 2.1 대시보드 메인 페이지 (/) - 최우선 🔥

**현재 상태**: 기본 멤버 리스트만 표시  
**개선 목표**: 종합 모니터링 대시보드

#### 개선 요소

1. **헤더 영역**
   - 페이지 제목 + 날짜
   - 새로고침 버튼
   - 알림 아이콘 (빨간 점 배지)

2. **주요 지표 카드 (4개)**
   - **총 가족 구성원 수**
     - 큰 숫자 + 아이콘
     - 전월 대비 증감 표시 (↑ +2)
   
   - **오늘 활동 중인 멤버**
     - 현재 활동 중인 수 / 전체
     - 프로그레스 바
   
   - **이번 주 완료한 카드**
     - 총 카드 완료 수
     - 전주 대비 증감
   
   - **평균 완료율**
     - 백분율 (%)
     - 도넛 차트

3. **주간 활동 차트** (recharts)
   - 선 그래프 (Line Chart)
   - X축: 최근 7일
   - Y축: 카드 완료 수
   - 멤버별 색상 구분
   - 툴팁 (마우스 오버 시 상세 정보)

4. **멤버 활동 카드 리스트**
   - 카드 형태 (그리드 2-3열)
   - 각 멤버:
     - 아바타 + 이름 + 레벨
     - 오늘 완료한 카드 수
     - 현재 스트릭 (연속 일수)
     - "격려하기" 버튼
   - 카드 호버 시 그림자 강조

5. **최근 알림 타임라인**
   - 시간 순 정렬
   - 알림 타입별 아이콘
   - 최대 5개 표시
   - "모두 보기" 링크

#### 레이아웃 (반응형)

```
Desktop (1280px+)
┌────────────────────────────────────────────┐
│ Header (Title + Actions)                   │
├────────────────────────────────────────────┤
│ [지표1] [지표2] [지표3] [지표4]  (4열)      │
├────────────────────────────────────────────┤
│ 주간 활동 차트 (전체 너비)                   │
├────────────────────────────────────────────┤
│ [멤버1] [멤버2] [멤버3]  (3열)               │
│ [멤버4] [멤버5] [멤버6]                      │
├────────────────────────────────────────────┤
│ 최근 알림 (좌측 70%) | 빠른 액션 (우측 30%) │
└────────────────────────────────────────────┘

Tablet (768px-1279px)
┌────────────────────────────┐
│ Header                     │
├────────────────────────────┤
│ [지표1] [지표2]  (2열)      │
│ [지표3] [지표4]             │
├────────────────────────────┤
│ 주간 활동 차트              │
├────────────────────────────┤
│ [멤버1] [멤버2]  (2열)      │
│ [멤버3] [멤버4]             │
├────────────────────────────┤
│ 최근 알림 (전체)            │
└────────────────────────────┘

Mobile (0-767px)
┌──────────────┐
│ Header       │
├──────────────┤
│ [지표1]      │
│ [지표2]      │
│ [지표3]      │
│ [지표4]      │
├──────────────┤
│ 차트 (세로)  │
├──────────────┤
│ [멤버1]      │
│ [멤버2]      │
├──────────────┤
│ 알림         │
└──────────────┘
```

---

### 2.2 멤버 상세 페이지 (/members/[id])

**개선 목표**: 개별 멤버 심층 분석

#### 개선 요소

1. **멤버 프로필 헤더**
   - 큰 아바타 (중앙)
   - 이름 + 레벨 배지
   - 현재 포인트 + 스트릭
   - "격려 메시지 보내기" 버튼

2. **통계 탭**
   - 탭 네비게이션 (활동, 배지, 기록)
   - **활동 탭**:
     - 월간 히트맵 (GitHub처럼)
     - 카테고리별 완료 카드 수 (파이 차트)
     - 주간 평균 완료 시간 (막대 그래프)
   
   - **배지 탭**:
     - 획득한 배지 그리드
     - 진행 중인 배지 (프로그레스 바)
   
   - **기록 탭**:
     - 타임라인 (카드 완료, 복약 체크 등)
     - 날짜별 필터링

3. **알림 설정**
   - 토글 스위치
   - 알림 빈도 설정 (즉시, 일일, 주간)

---

### 2.3 알림 페이지 (/alerts)

**개선 목표**: 모든 알림 중앙 관리

#### 개선 요소

1. **필터링**
   - 전체 / 미읽음 / 중요
   - 날짜 범위 선택

2. **알림 카드**
   - 타입별 아이콘 + 색상
   - 제목 + 설명 + 시간
   - 미읽음: 배경색 강조

3. **일괄 작업**
   - 전체 읽음 처리
   - 선택 삭제

---

### 2.4 격려 페이지 (/encourage)

**개선 목표**: 가족 소통 강화

#### 개선 요소

1. **격려 메시지 작성**
   - 큰 텍스트 영역
   - 이모티콘 선택기
   - 템플릿 제안 ("잘하고 있어요!", "오늘도 화이팅!")

2. **보낸 메시지 히스토리**
   - 타임라인
   - 멤버별 필터링

---

## 3. 차트 및 데이터 시각화

### 3.1 Recharts 라이브러리 활용

```bash
npm install recharts
```

### 3.2 차트 종류

#### 3.2.1 선 그래프 (Line Chart) - 주간 활동

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

<LineChart width={800} height={300} data={weeklyData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="엄마" stroke="#3b82f6" strokeWidth={2} />
  <Line type="monotone" dataKey="아빠" stroke="#22c55e" strokeWidth={2} />
</LineChart>
```

#### 3.2.2 막대 그래프 (Bar Chart) - 카테고리별 완료

```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

<BarChart width={600} height={300} data={categoryData}>
  <XAxis dataKey="category" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="completed" fill="#3b82f6" radius={[8, 8, 0, 0]} />
</BarChart>
```

#### 3.2.3 도넛 차트 (Pie Chart) - 완료율

```typescript
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#e5e7eb'];

<PieChart width={200} height={200}>
  <Pie
    data={[{ value: 75 }, { value: 25 }]}
    cx={100}
    cy={100}
    innerRadius={60}
    outerRadius={80}
    paddingAngle={5}
    dataKey="value"
  >
    {data.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index]} />
    ))}
  </Pie>
  <Tooltip />
</PieChart>
```

#### 3.2.4 영역 차트 (Area Chart) - 누적 포인트

```typescript
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

<AreaChart width={800} height={300} data={pointsData}>
  <defs>
    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Area type="monotone" dataKey="points" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPoints)" />
</AreaChart>
```

### 3.3 차트 공통 스타일

```typescript
const chartTheme = {
  axis: {
    stroke: '#d1d5db',  // gray-300
    fontSize: 12,
    fontFamily: 'system-ui',
  },
  grid: {
    stroke: '#e5e7eb',  // gray-200
    strokeDasharray: '3 3',
  },
  tooltip: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
};
```

---

## 4. 컴포넌트 개선 목록

### 4.1 신규 컴포넌트 (웹)

| 컴포넌트 | 용도 | 우선순위 |
|---------|------|---------|
| `StatCard` | 주요 지표 카드 | 🔥 높음 |
| `ChartCard` | 차트 래퍼 카드 | 🔥 높음 |
| `MemberCard` | 멤버 활동 카드 | 🔥 높음 |
| `AlertItem` | 알림 리스트 아이템 | 🔴 중간 |
| `BadgeGrid` | 배지 그리드 | 🔴 중간 |
| `TimelineItem` | 타임라인 아이템 | 🟡 낮음 |
| `ProgressRing` | 원형 프로그레스 | 🟡 낮음 |

### 4.2 기존 컴포넌트 개선

| 컴포넌트 | 현재 상태 | 개선 사항 |
|---------|----------|----------|
| `Card` | 기본 흰색 | 호버 효과, 그림자 강화 |
| `Button` | 단순 버튼 | 로딩 상태, 아이콘 지원 |
| `Avatar` | 원형 이미지 | 레벨 배지 오버레이 |
| `Badge` | 텍스트 배지 | 색상 변형 (primary, success 등) |

---

## 5. 구현 우선순위

### Phase 1: 대시보드 메인 (2일) 🔥

1. ✅ `StatCard` 컴포넌트 구현
2. ✅ recharts 설치 및 기본 설정
3. ✅ 주간 활동 LineChart 구현
4. ✅ `MemberCard` 컴포넌트 구현
5. ✅ 대시보드 레이아웃 리팩토링
   - 4개 지표 카드
   - 주간 차트
   - 멤버 그리드
   - 알림 섹션

### Phase 2: 멤버 상세 (1일) 🔴

6. ✅ 멤버 프로필 헤더
7. ✅ 탭 네비게이션
8. ✅ 활동 탭 차트 (히트맵, 파이, 막대)
9. ✅ 배지 그리드

### Phase 3: 알림 및 격려 (0.5일) 🟡

10. ✅ 알림 페이지 레이아웃
11. ✅ 알림 필터링
12. ✅ 격려 메시지 작성 폼

### Phase 4: 반응형 및 폴리싱 (1일) 🟢

13. ✅ 모바일/태블릿 반응형 테스트
14. ✅ 다크 모드 지원 (선택)
15. ✅ 로딩 스켈레톤
16. ✅ 에러 상태 처리

---

## 6. 기술 스택

### 6.1 새로 추가할 라이브러리

```json
{
  "recharts": "^2.10.3",                  // 차트
  "react-hot-toast": "^2.4.1",            // 토스트 알림
  "date-fns": "^3.0.6",                   // 날짜 포맷팅
  "react-datepicker": "^4.25.0"           // 날짜 선택기 (선택)
}
```

### 6.2 기존 라이브러리

- ✅ Next.js 14 (App Router)
- ✅ Tailwind CSS
- ✅ SWR (데이터 페칭)
- ✅ TypeScript

---

## 7. 반응형 디자인

### 7.1 Breakpoints

```css
/* Tailwind 기본 Breakpoints */
sm: 640px   /* 작은 태블릿 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 작은 데스크톱 */
xl: 1280px  /* 데스크톱 */
2xl: 1536px /* 큰 데스크톱 */
```

### 7.2 반응형 전략

```typescript
// 그리드 열 조정
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 4열 */}
</div>

// 패딩 조정
<div className="px-4 md:px-8 xl:px-12">
  {/* 모바일: 16px, 태블릿: 32px, 데스크톱: 48px */}
</div>

// 폰트 크기 조정
<h1 className="text-2xl md:text-3xl xl:text-4xl">
  {/* 모바일: 24px, 태블릿: 30px, 데스크톱: 36px */}
</h1>
```

---

## 8. 애니메이션 및 인터랙션

### 8.1 Tailwind Transition

```typescript
// 호버 애니메이션
<div className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
  {/* 카드 */}
</div>

// 버튼 클릭
<button className="transition-transform active:scale-95">
  클릭
</button>
```

### 8.2 Framer Motion (선택)

```bash
npm install framer-motion
```

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {/* 페이드 인 */}
</motion.div>
```

---

## 9. 접근성 (웹 A11y)

### 9.1 체크리스트

- [ ] 시맨틱 HTML 사용 (`<header>`, `<nav>`, `<main>`, `<article>`)
- [ ] 모든 이미지에 `alt` 속성
- [ ] 버튼에 명확한 레이블
- [ ] 키보드 네비게이션 지원 (Tab, Enter, Esc)
- [ ] ARIA 레이블 (`aria-label`, `aria-describedby`)
- [ ] 색상 대비 WCAG AA (4.5:1)
- [ ] 포커스 스타일 (`:focus-visible`)

### 9.2 스크린리더 지원

```typescript
// 시각적으로 숨기고 스크린리더만
<span className="sr-only">새 알림 3개</span>

// ARIA 라이브 리전
<div aria-live="polite" aria-atomic="true">
  격려 메시지가 전송되었습니다.
</div>
```

---

## 10. 성능 최적화

### 10.1 Next.js 최적화

```typescript
// 이미지 최적화
import Image from 'next/image';
<Image src="/avatar.jpg" width={64} height={64} alt="아바타" />

// 동적 임포트 (차트는 클라이언트 전용)
const LineChart = dynamic(() => import('./LineChart'), { ssr: false });

// 메모이제이션
const MemberCard = React.memo(({ member }) => { ... });
```

### 10.2 SWR 캐싱

```typescript
// 주기적 재검증 (실시간 업데이트)
const { data } = useSWR('/api/members', fetcher, {
  refreshInterval: 30000,  // 30초마다
  revalidateOnFocus: true,
});
```

---

## 11. 다음 단계

1. ✅ `StatCard`, `MemberCard` 컴포넌트 구현
2. ✅ recharts 차트 4종 구현
3. ✅ 대시보드 메인 페이지 리팩토링
4. → 멤버 상세 페이지
5. → 반응형 테스트

---

**문서 작성일**: 2025년 11월 23일  
**작성자**: AI Development Agent  
**버전**: 1.0  
**이전 문서**: `01-mobile-ui-enhancement-plan.md` (모바일)
