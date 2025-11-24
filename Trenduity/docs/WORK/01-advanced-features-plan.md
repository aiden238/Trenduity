# 고급 기능 추가 작업 계획서

**작성일**: 2025년 11월 23일  
**최종 업데이트**: 2025년 11월 23일 18:00  
**상태**: Task 1-2 완료 ✅ (2/12 작업, 16.7%)  
**우선순위**: 1번부터 순차 진행  
**다음 작업**: Task 3 - 고급 차트 타입 (BarChart, PieChart, AreaChart)

---

## 📋 작업 목록 (12개)

### **1. 다크 모드 구현** ✅ 완료
**우선순위**: P0 (최우선)  
**예상 소요**: 2-3시간 → **실제 소요**: 2.5시간  
**파일 영향**:
- `packages/ui/src/tokens/colors.ts` - 다크 모드 색상 팔레트 추가 ✅
- `apps/mobile-expo/src/contexts/ThemeContext.tsx` - 테마 컨텍스트 생성 ✅
- `apps/web-next/app/layout.tsx` - next-themes 통합 ✅
- `apps/web-next/tailwind.config.js` - darkMode 설정 ✅

**요구사항**:
- [x] prefers-color-scheme 자동 감지 ✅
- [x] 수동 토글 버튼 (라이트/다크/시스템) ✅
- [x] 로컬스토리지 저장 (AsyncStorage for RN) ✅
- [x] COLORS 토큰 dark variants 추가 ✅
- [x] 모든 그라디언트 다크 버전 정의 ✅
- [x] 그림자/테두리 색상 조정 ✅

**디자인 가이드**:
- 라이트 모드: 기존 그라디언트 유지
- 다크 모드: 배경 `#0f172a` (slate-900), 카드 `#1e293b` (slate-800)
- 텍스트: 라이트 `gray-900` → 다크 `gray-100`
- 그라디언트: 채도 낮추고 밝기 조정

---

### **2. 실시간 알림 토스트 시스템** ✅ 완료
**우선순위**: P1  
**예상 소요**: 1-2시간 → **실제 소요**: 1.5시간  
**파일 영향**:
- `apps/mobile-expo/src/components/Toast.tsx` - 모바일 토스트 ✅
- `apps/mobile-expo/src/contexts/ToastContext.tsx` - 모바일 컨텍스트 ✅
- `apps/web-next/components/Toast.tsx` - 웹 토스트 ✅
- `apps/web-next/components/ToastProvider.tsx` - 웹 프로바이더 ✅
- `packages/ui/src/tokens/toast.ts` - 토스트 디자인 토큰 ✅
- `apps/web-next/app/toast-demo/page.tsx` - 테스트 페이지 ✅

**요구사항**:
- [x] 4가지 타입: success (녹색), error (빨간색), warning (노란색), info (파란색) ✅
- [x] 자동 dismiss (3초 기본, 설정 가능) ✅
- [x] 슬라이드 인/아웃 애니메이션 ✅
- [x] 최대 3개 스택 제한 ✅
- [x] 닫기 버튼 ✅
- [x] 아이콘 + 메시지 + 액션 버튼 (선택) ✅
- [x] 햅틱 피드백 (모바일) ✅
- [x] 다크 모드 전용 색상 ✅
- [x] 진행 바 (자동 닫기 표시) ✅

**디자인 가이드**:
- 위치: 우측 상단 (웹), 하단 (모바일)
- 크기: 최대 400px 너비
- 그라디언트 배경 + 백드롭 블러
- 햅틱 피드백 (모바일)

---

### **3. 고급 차트 타입**
**우선순위**: P1  
**예상 소요**: 2시간  
**파일 영향**:
- `apps/web-next/components/BarChart.tsx` - 막대 차트
- `apps/web-next/components/PieChart.tsx` - 파이 차트
- `apps/web-next/components/AreaChart.tsx` - 영역 차트
- `apps/mobile-expo/src/components/charts/` - 모바일 차트 3종

**요구사항**:
- **BarChart**: 월별 카드 완료 횟수 (12개월)
- **PieChart**: 카테고리별 카드 분포 (건강/금융/디지털/안전)
- **AreaChart**: 누적 포인트 그래프 (30일)
- 호버 툴팁 (웹), 터치 인터랙션 (모바일)
- 애니메이션 (progress bar fill, fade-in)
- 그라디언트 fill

**디자인 가이드**:
- 색상: COLORS 토큰 재사용
- 크기: 반응형 (ResponsiveContainer)
- 범례: 하단 배치, 아이콘 포함

---

### **4. Skeleton 로더**
**우선순위**: P2  
**예상 소요**: 1-2시간  
**파일 영향**:
- `packages/ui/src/components/Skeleton.tsx` - 기본 스켈레톤
- `apps/mobile-expo/src/components/SkeletonCard.tsx` - 카드 스켈레톤
- `apps/web-next/components/SkeletonDashboard.tsx` - 대시보드 스켈레톤

**요구사항**:
- 모든 주요 화면에 skeleton UI
- Shimmer 효과 (그라디언트 애니메이션)
- 실제 컴포넌트 레이아웃과 동일한 구조
- 로딩 상태 자동 전환

**디자인 가이드**:
- 배경: gray-200 (라이트), gray-700 (다크)
- Shimmer: 45도 그라디언트 (gray-100 → gray-200 → gray-100)
- 애니메이션: 1.5초 무한 반복
- Border radius: 실제 컴포넌트와 동일

---

### **5. 키보드 내비게이션 테스트**
**우선순위**: P2  
**예상 소요**: 2시간  
**파일 영향**:
- 모든 인터랙티브 컴포넌트 (버튼, 링크, 폼)
- `apps/web-next/styles/focus-visible.css` - 포커스 스타일

**요구사항**:
- Tab 순서 논리적 흐름
- Focus visible 스타일 (파란색 링, 2px)
- Escape로 모달/드로어 닫기
- Enter로 버튼 활성화
- Arrow keys로 탭/슬라이더 이동
- ARIA 속성 추가 (role, aria-label, aria-current)

**테스트 시나리오**:
1. 대시보드 → 멤버 카드 → 상세 페이지 (Tab 순서)
2. 알림 페이지 필터 전환 (Arrow keys)
3. 모달 열기/닫기 (Enter/Escape)

---

### **6. 스크린 리더 검증**
**우선순위**: P2  
**예상 소요**: 2-3시간  
**파일 영향**:
- 모든 컴포넌트 (accessibilityLabel 추가)
- `apps/mobile-expo/src/utils/a11y.ts` - A11y 헬퍼

**요구사항**:
- NVDA (Windows), JAWS 테스트
- TalkBack (Android), VoiceOver (iOS) 테스트
- alt text 모든 이미지/아이콘
- aria-label 모든 버튼/링크
- aria-live regions (알림, 에러)
- 한국어 음성 지원 확인

**테스트 시나리오**:
1. 카드 완료 플로우 (음성 피드백)
2. 대시보드 통계 읽기
3. 알림 목록 내비게이션

---

### **7. 색상 대비 WCAG AAA 달성**
**우선순위**: P3  
**예상 소요**: 1-2시간  
**파일 영향**:
- `packages/ui/src/tokens/colors.ts` - 색상 조정
- 모든 텍스트/배경 조합 검증

**요구사항**:
- 대비 비율 7:1 이상 (AAA 기준)
- 그라디언트 배경 + 텍스트 조합 검증
- 색맹 시뮬레이션 (Protanopia, Deuteranopia, Tritanopia)
- WebAIM Contrast Checker 통과

**검증 도구**:
- Chrome DevTools Lighthouse
- axe DevTools
- Contrast Checker

---

### **8. 이미지 최적화**
**우선순위**: P3  
**예상 소요**: 1시간  
**파일 영향**:
- `apps/web-next/next.config.js` - 이미지 설정
- 모든 `<img>` → `<Image>` 변환

**요구사항**:
- next/image 적용
- WebP 자동 변환
- lazy loading (viewport 진입 시)
- responsive images (srcset)
- blur placeholder (LQIP)
- 외부 이미지 도메인 허용

**최적화 목표**:
- 이미지 용량 50% 감소
- LCP (Largest Contentful Paint) 개선

---

### **9. Code splitting**
**우선순위**: P3  
**예상 소요**: 1-2시간  
**파일 영향**:
- `apps/web-next/app/**/*.tsx` - Dynamic imports
- `apps/mobile-expo/App.tsx` - 초기 로딩 최적화

**요구사항**:
- Route-based splitting (자동, Next.js)
- Component lazy loading (React.lazy)
- 차트 라이브러리 dynamic import
- Bundle 분석 (@next/bundle-analyzer)

**최적화 목표**:
- 초기 번들 크기 30% 감소
- TTI (Time to Interactive) 개선

---

### **10. 컴포넌트 단위 테스트**
**우선순위**: P1  
**예상 소요**: 3-4시간  
**파일 영향**:
- `apps/web-next/**/*.test.tsx` - 컴포넌트 테스트
- `packages/ui/src/**/*.test.tsx` - UI 컴포넌트 테스트
- `jest.config.js` - Jest 설정

**요구사항**:
- Jest + React Testing Library
- 주요 컴포넌트 커버리지 80% 이상
- Snapshot tests (UI 컴포넌트)
- Interaction tests (버튼 클릭, 폼 제출)
- Mock data/API

**테스트 대상**:
- StatCard, MemberCard, ActivityChart
- TabNavigation, BadgeGrid
- Toast, Skeleton
- 모든 공유 UI 컴포넌트

---

### **11. E2E 테스트**
**우선순위**: P1  
**예상 소요**: 3-4시간  
**파일 영향**:
- `e2e/**/*.spec.ts` - E2E 테스트
- `playwright.config.ts` - Playwright 설정

**요구사항**:
- Playwright로 주요 플로우 테스트
- 3가지 시나리오:
  1. 카드 완료 플로우 (모바일)
  2. 가족 대시보드 조회 (웹)
  3. 알림 확인 및 응답 (웹)
- 스크린샷 비교 (visual regression)
- CI/CD 통합

**테스트 환경**:
- Chromium, Firefox, WebKit (웹)
- Android, iOS 시뮬레이터 (모바일)

---

### **12. Storybook 컴포넌트 라이브러리**
**우선순위**: P2  
**예상 소요**: 4-5시간  
**파일 영향**:
- `.storybook/**/*` - Storybook 설정
- `**/*.stories.tsx` - 컴포넌트 stories
- `packages/ui/src/**/*.stories.tsx` - UI 컴포넌트 stories

**요구사항**:
- Storybook 7.x 설정
- 모든 UI 컴포넌트 stories (30+ 컴포넌트)
- Controls (props 조작)
- Actions (이벤트 로깅)
- Docs (자동 생성)
- 다크 모드 토글
- 배포 (Chromatic 또는 GitHub Pages)

**문서 포함**:
- 컴포넌트 사용법
- Props 설명
- 접근성 가이드
- 그라디언트 팔레트 참조

---

## 🎯 1번 작업: 다크 모드 구현

### ✅ **완료된 단계**

#### **Step 1: COLORS 토큰 확장** ✅
파일: `packages/ui/src/tokens/colors.ts`
- dark 섹션 추가 (배경, 텍스트, 그라디언트, 상태, 게임화 색상)
- 다크 모드 그라디언트 6종 정의
- v2.0 업데이트 완료

#### **Step 2: 웹 다크 모드 기본 설정** ✅
1. Tailwind CSS + next-themes 설치 ✅
2. `tailwind.config.js` 생성 (darkMode: 'class') ✅
3. `postcss.config.js` 생성 ✅
4. `globals.css`에 CSS 변수 및 다크 스타일 추가 ✅
5. `ThemeProvider.tsx` 생성 (next-themes 래핑) ✅
6. `ThemeToggle.tsx` 생성 (라이트/다크/시스템 토글) ✅
7. `layout.tsx`에 ThemeProvider 통합 ✅

#### **Step 3: 웹 컴포넌트 다크 모드 적용** ✅
적용 완료된 컴포넌트 (9개):
1. `StatCard.tsx` - 그라디언트 다크 버전 자동 매핑 ✅
2. `MemberCard.tsx` - 배경, 텍스트, 아바타, 통계, 상태 ✅
3. `ActivityChart.tsx` - 차트 배경, 텍스트, 범례 ✅
4. `TabNavigation.tsx` - 탭 버튼, 보더 ✅
5. `BadgeGrid.tsx` - 배지 카드, 텍스트, 획득/미획득 상태 ✅
6. `Spinner.tsx` - 로딩 스피너 색상 ✅
7. `EmptyState.tsx` - 빈 상태 텍스트 ✅
8. `ErrorState.tsx` - 에러 텍스트, 버튼 ✅
9. `layout.tsx` - 헤더, 배경, ThemeToggle ✅

#### **Step 4: 웹 페이지 다크 모드 적용** ✅
적용 완료된 페이지 (4개):
1. `app/page.tsx` - 대시보드 (헤더, 알림, 통계, 차트, 멤버, 액션) ✅
2. `app/alerts/page.tsx` - 알림 (헤더, 필터, 카드, 버튼) ✅
3. `app/encourage/page.tsx` - 격려 (헤더, 폼, 입력, 버튼) ✅
4. `app/members/[id]/page.tsx` - 멤버 상세 (이미 적용됨) ✅

#### **Step 5: 모바일 다크 모드 구현** ✅
파일: `apps/mobile-expo/src/contexts/ThemeContext.tsx`, `App.tsx`, `screens/Settings/SettingsScreen.tsx`

1. ThemeContext 생성 ✅
   - `useColorScheme()` 훅으로 시스템 설정 감지
   - `themeMode` 상태 (system/light/dark)
   - `activeTheme` 계산 (실제 적용되는 테마)
   - AsyncStorage로 저장/로드
   - StatusBar 스타일 자동 변경 (light/dark-content)

2. App.tsx에 ThemeProvider 통합 ✅
   - A11yProvider 외부에 ThemeProvider 배치
   - StatusBar 자동 관리

3. Settings 화면에 테마 선택 UI 추가 ✅
   - 3가지 모드 선택: 시스템/라이트/다크
   - 아이콘 표시 (⚙️/☀️/🌙)
   - 선택된 모드 하이라이트 (그라디언트 배경)
   - 모든 카드/버튼에 다크 모드 색상 적용

4. 주요 화면에 다크 모드 적용 ✅
   - `HomeAScreen.tsx` - 오늘의 카드 화면 (배경, 카드, 텍스트)
   - `InsightListScreen.tsx` - 인사이트 목록 (배경, 카드)
   - `QnaListScreen.tsx` - 커뮤니티 Q&A (배경, 카드)
   - 동적 색상: `activeTheme === 'dark' ? colors.dark.* : colors.neutral.*`

### ✅ **Task 1: 다크 모드 100% 완료**

**완료 항목**:
- ✅ COLORS 토큰 dark 섹션 추가 (6종 그라디언트)
- ✅ 웹: Tailwind + next-themes 설정
- ✅ 웹: ThemeProvider, ThemeToggle 컴포넌트
- ✅ 웹: 9개 컴포넌트 dark: 클래스 적용
- ✅ 웹: 4개 페이지 dark: 클래스 적용
- ✅ 모바일: ThemeContext + StatusBar 연동
- ✅ 모바일: Settings 화면 테마 선택 UI
- ✅ 모바일: 3개 화면 다크 모드 적용 (Home, Insights, Community)

**진행률**:
```
웹 다크 모드: ███████████████████████ 100%
모바일 다크 모드: ███████████████████████ 100%
전체: ███████████████████████ 100%
```

### 🚧 **남은 작업 없음 - Task 1 완료!**

#### **Step 5: 모바일 다크 모드 구현**

```typescript
// 기존 COLORS에 dark variants 추가
export const COLORS = {
  // 라이트 모드 (기존)
  background: {
    light: '#F9FAFB',  // gray-50
    card: '#FFFFFF',
  },
  text: {
    primary: '#111827',  // gray-900
    secondary: '#6B7280', // gray-500
  },
  
  // 다크 모드 추가
  dark: {
    background: {
      main: '#0F172A',   // slate-900
      card: '#1E293B',   // slate-800
      elevated: '#334155', // slate-700
    },
    text: {
      primary: '#F1F5F9',   // slate-100
      secondary: '#94A3B8', // slate-400
    },
    border: '#475569',     // slate-600
  },
  
  // 그라디언트 다크 버전
  gradients: {
    light: {
      blue: ['#3B82F6', '#2563EB'],
      purple: ['#8B5CF6', '#6366F1'],
      pink: ['#EC4899', '#F43F5E'],
      // ...
    },
    dark: {
      blue: ['#1E40AF', '#1E3A8A'],     // 채도 낮춤
      purple: ['#6D28D9', '#5B21B6'],
      pink: ['#BE185D', '#9F1239'],
      // ...
    }
  }
};
```

#### **Step 2: 웹 다크 모드 (next-themes)**
1. next-themes 설치
2. layout.tsx에 ThemeProvider 추가
3. tailwind.config.js darkMode 설정
4. 토글 버튼 컴포넌트 생성

#### **Step 3: 모바일 다크 모드 (Appearance API)**
1. ThemeContext 생성
2. useColorScheme 훅 사용
3. StatusBar 스타일 동기화
4. 토글 버튼 컴포넌트 생성

#### **Step 4: 모든 컴포넌트 다크 모드 대응**
- className에 dark: prefix 추가
- 조건부 스타일 적용
- 그라디언트 색상 전환

---

## 📊 진행 현황

- **전체 진행률**: 1/12 (8%) - 웹 100% 완료!
- **현재 작업**: 1번 다크 모드 구현 (웹 완료, 모바일 대기)
- **예상 완료**: 2025년 11월 23일 (당일 완료 가능)

### **1번 작업 세부 진행률**
```
웹 기본 설정: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% (Tailwind, Theme, COLORS)
웹 컴포넌트:  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% (9개 컴포넌트)
웹 페이지:    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% (4개 페이지)
모바일:       ░░░░░░░░░░░░░░░░ 0% (아직 시작 전)
```

**1번 작업 전체**: 90/100 (90% - 웹 완료!)

---

## 🔗 참고 문서

- UI 개선 완료 보고서: `docs/UI/00-progress-tracker.md`
- 접근성 가이드: `docs/IMPLEMENT/09-a11y-wiring.md`
- 아키텍처 개요: `docs/PLAN/01-2-architecture-overview.md`
