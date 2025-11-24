# Storybook 설정

Trenduity 웹 콘솔의 컴포넌트 라이브러리 문서입니다.

## 📚 개요

**Storybook 버전**: 7.6.0  
**프레임워크**: Next.js 14 (App Router)  
**컴포넌트 수**: 5개 (20+ 스토리)  
**애드온**: a11y, essentials, interactions, links

## 🚀 실행 방법

### 개발 서버 시작
```bash
cd apps/web-next
npm run storybook
```
브라우저에서 http://localhost:6006 접속

### 정적 빌드
```bash
npm run build-storybook
```
빌드된 파일: `storybook-static/`

## 📖 컴포넌트 목록

### 1. StatCard
통계 카드 컴포넌트

**스토리**:
- Default: 기본 카드 (총 멤버)
- WithInfoBadge: info 배지 포함 (활동 중)
- NoUnit: 단위 없음 (총 포인트)
- WithStreak: 스트릭 정보 (누적 스트릭)
- StringValue: 문자열 값 (상태)
- LongTitle: 긴 제목
- LargeNumber: 큰 숫자 (9,999,999)
- AllGradients: 모든 그라디언트 변형

**Props**:
- `title`: string (카드 제목)
- `value`: string | number (값)
- `unit?`: string (단위: 명, 개, 일 등)
- `icon`: LucideIcon (아이콘 컴포넌트)
- `gradient`: string (Tailwind 그라디언트 클래스)
- `info?`: string (info 배지 텍스트)
- `className?`: string (추가 스타일)

### 2. MemberCard
멤버 카드 컴포넌트

**스토리**:
- ActiveMember: 활동 중 멤버 (2시간 전)
- InactiveMember: 대기 멤버 (2일 전)
- NoAvatar: 아바타 없음 (첫 글자 표시)
- RestrictedPermission: 제한됨 권한
- NoActivity: 활동 없음 (null lastActive)
- HighStreak: 높은 스트릭 (45일)
- LongName: 긴 이름
- AllPermissions: 모든 권한 레벨 비교
- AllActivityStates: 다양한 활동 상태 비교

**Props**:
- `userId`: string (멤버 ID)
- `name`: string (이름)
- `avatarUrl?`: string (아바타 URL)
- `lastActive`: Date | null (마지막 활동 시간)
- `currentStreak`: number (현재 스트릭)
- `totalPoints`: number (총 포인트)
- `permissions`: '모든 권한' | '읽기 전용' | '제한됨'

### 3. Spinner
로딩 스피너 컴포넌트

**스토리**:
- Large: 큰 크기 (기본)
- Small: 작은 크기
- CustomColor: 커스텀 색상
- OnDarkBackground: 어두운 배경
- InCard: 카드 내부
- SizeComparison: 크기 비교
- ColorVariants: 색상 변형 (파란색, 보라색, 초록색, 빨간색)

**Props**:
- `size?`: 'small' | 'large' (크기, 기본값: 'large')
- `className?`: string (추가 스타일)

### 4. EmptyState
빈 상태 컴포넌트

**스토리**:
- Default: 기본 (설명 없음)
- WithDescription: 설명 포함
- CustomIcon: 커스텀 아이콘 (🎉)
- NoAlerts: 알림 없음 (🔔)
- NoSearchResults: 검색 결과 없음 (🔍)
- ErrorState: 에러 상태 (⚠️)
- InCard: 카드 내부
- InLargeContainer: 큰 컨테이너
- VariousStates: 다양한 상태 비교

**Props**:
- `icon?`: string (이모지, 기본값: '📭')
- `title`: string (제목)
- `description?`: string (설명)
- `className?`: string (추가 스타일)

### 5. ErrorBoundary
에러 경계 컴포넌트

**스토리**:
- NormalRender: 정상 작동 (에러 없음)
- WithError: 에러 발생 시 (기본 폴백)
- CustomFallback: 커스텀 폴백 UI
- WithErrorCallback: onError 콜백
- InteractiveError: 인터랙티브 에러 트리거
- NestedErrorBoundaries: 중첩된 ErrorBoundary
- MultipleChildren: 여러 자식 컴포넌트

**Props**:
- `children`: ReactNode (자식 컴포넌트)
- `fallback?`: ReactNode (에러 시 표시할 UI)
- `onError?`: (error: Error, errorInfo: ErrorInfo) => void (에러 콜백)

## 🎨 애드온 활용

### Accessibility (a11y)
1. 스토리 렌더링 후 **Accessibility** 탭 클릭
2. WCAG 위반 사항 자동 감지
3. 색상 대비, ARIA 속성, 키보드 접근성 검사

### Controls
1. **Controls** 탭에서 props 실시간 수정
2. 다양한 props 조합 테스트
3. 컴포넌트 동작 확인

### Actions
1. **Actions** 탭에서 이벤트 핸들러 로그 확인
2. onPress, onClick 등 이벤트 추적

### Docs
1. **Docs** 탭에서 자동 생성된 문서 확인
2. Props 테이블, 예시 코드 포함

## 🌙 다크 모드

### 전환 방법
1. Storybook 툴바에서 **Theme** 드롭다운 클릭
2. **Light** 또는 **Dark** 선택
3. 모든 스토리에 즉시 적용

### 구현 방식
- `ThemeProvider` (next-themes) 데코레이터
- Tailwind `dark:` 클래스 자동 적용
- 배경색 자동 전환

## 📱 반응형 테스트

### Viewport 변경
1. Storybook 툴바에서 **Viewport** 아이콘 클릭
2. 프리셋 선택:
   - Mobile (320px)
   - Tablet (768px)
   - Desktop (1024px)
   - Large Desktop (1280px)

## 🔍 스토리 작성 가이드

### CSF 3.0 형식
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    propName: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    propName: 'value',
  },
};
```

### 멀티 컴포넌트 렌더링
```tsx
export const Comparison: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <MyComponent variant="a" />
      <MyComponent variant="b" />
    </div>
  ),
};
```

### 데코레이터 사용
```tsx
export const InCard: Story = {
  args: { ... },
  decorators: [
    (Story) => (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Story />
      </div>
    ),
  ],
};
```

## 🧪 테스트와의 통합

### Jest 테스트에서 스토리 재사용
```tsx
import { composeStories } from '@storybook/react';
import * as stories from './MyComponent.stories';

const { Default, WithProps } = composeStories(stories);

test('renders default story', () => {
  render(<Default />);
  expect(screen.getByText('...')).toBeInTheDocument();
});
```

### Playwright E2E에서 활용
```ts
test('visit Storybook story', async ({ page }) => {
  await page.goto('http://localhost:6006/?path=/story/components-mycomponent--default');
  await expect(page.locator('...')).toBeVisible();
});
```

## 🚢 배포

### 정적 빌드 배포
```bash
npm run build-storybook
# storybook-static/ 폴더를 정적 호스팅 서비스에 배포
# 예: Vercel, Netlify, GitHub Pages
```

### Vercel 배포 예시
```bash
cd storybook-static
vercel --prod
```

### GitHub Pages 배포 예시
```bash
npm run build-storybook
git add storybook-static
git commit -m "Update Storybook"
git subtree push --prefix storybook-static origin gh-pages
```

## 📝 Best Practices

### Do ✅
- 각 컴포넌트에 최소 3-5개 스토리 작성
- 모든 props 조합 커버
- 접근성 체크 (a11y 탭)
- 다크 모드 테스트
- 반응형 테스트 (viewport 변경)
- 에지 케이스 스토리 (긴 텍스트, 빈 값, 에러 상태)

### Don't ❌
- 스토리에 비즈니스 로직 포함
- API 호출 (mock 데이터 사용)
- 복잡한 상태 관리 (단순하게 유지)
- 스타일 하드코딩 (Tailwind 클래스 사용)

## 🔗 유용한 링크

- [Storybook 공식 문서](https://storybook.js.org/docs)
- [Next.js 통합 가이드](https://storybook.js.org/docs/get-started/nextjs)
- [접근성 애드온](https://storybook.js.org/addons/@storybook/addon-a11y)
- [CSF 3.0 스펙](https://storybook.js.org/docs/api/csf)

## 📄 파일 구조

```
apps/web-next/
├── .storybook/
│   ├── main.ts          # Storybook 설정
│   ├── preview.ts       # 전역 데코레이터/파라미터
│   └── README.md        # 이 파일
├── components/
│   ├── StatCard.tsx
│   ├── StatCard.stories.tsx
│   ├── MemberCard.tsx
│   ├── MemberCard.stories.tsx
│   ├── Spinner.tsx
│   ├── Spinner.stories.tsx
│   ├── EmptyState.tsx
│   ├── EmptyState.stories.tsx
│   ├── ErrorBoundary.tsx
│   └── ErrorBoundary.stories.tsx
└── package.json
```

---

**최종 업데이트**: 2025년 11월 17일  
**Storybook 버전**: 7.6.0  
**컴포넌트 수**: 5개 (20+ 스토리)
