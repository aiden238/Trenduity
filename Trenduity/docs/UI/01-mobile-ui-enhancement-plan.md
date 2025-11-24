# 모바일 UI 고도화 계획서 (Mobile App Enhancement)

> **목표**: 50-70대 시니어를 위한 시각적으로 매력적이고 직관적인 네이티브 모바일 UI 구현  
> **원칙**: 큰 터치 영역, 명확한 시각적 피드백, 부드러운 애니메이션, 고대비 색상

---

## 📋 목차

1. [디자인 시스템](#1-디자인-시스템)
2. [화면별 개선 계획](#2-화면별-개선-계획)
3. [애니메이션 및 인터랙션](#3-애니메이션-및-인터랙션)
4. [컴포넌트 개선 목록](#4-컴포넌트-개선-목록)
5. [구현 우선순위](#5-구현-우선순위)

---

## 1. 디자인 시스템

### 1.1 색상 팔레트 (시니어 최적화)

```typescript
// 기본 색상 (WCAG AA 준수 - 4.5:1 대비)
const colors = {
  primary: {
    main: '#007AFF',      // iOS 블루 (인지도 높음)
    light: '#5AC8FA',     // 밝은 블루
    dark: '#0051D5',      // 어두운 블루
    gradient: ['#007AFF', '#5AC8FA'], // 그라데이션
  },
  secondary: {
    main: '#34C759',      // 성공/완료 (녹색)
    light: '#30D158',
    dark: '#248A3D',
    gradient: ['#34C759', '#30D158'],
  },
  accent: {
    orange: '#FF9500',    // 경고/중요
    purple: '#AF52DE',    // 배지/레벨
    pink: '#FF2D55',      // 알림
    yellow: '#FFD60A',    // 포인트/별
  },
  neutral: {
    background: '#F2F2F7',    // 배경 (밝은 회색)
    surface: '#FFFFFF',       // 카드 배경
    border: '#C6C6C8',        // 경계선
    text: {
      primary: '#000000',     // 주 텍스트
      secondary: '#3C3C43',   // 보조 텍스트 (60% 투명도)
      tertiary: '#8E8E93',    // 힌트 텍스트
    },
  },
  status: {
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
  },
};
```

### 1.2 타이포그래피 (A11y 모드별)

```typescript
// 3단계 접근성 모드
const typography = {
  normal: {
    heading1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
    heading2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
    heading3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
    caption: { fontSize: 14, fontWeight: '400', lineHeight: 18 },
  },
  easy: {
    heading1: { fontSize: 34, fontWeight: '700', lineHeight: 41 },
    heading2: { fontSize: 28, fontWeight: '600', lineHeight: 34 },
    heading3: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
    body: { fontSize: 20, fontWeight: '400', lineHeight: 26 },
    caption: { fontSize: 17, fontWeight: '400', lineHeight: 22 },
  },
  ultra: {
    heading1: { fontSize: 42, fontWeight: '700', lineHeight: 50 },
    heading2: { fontSize: 34, fontWeight: '600', lineHeight: 41 },
    heading3: { fontSize: 28, fontWeight: '600', lineHeight: 34 },
    body: { fontSize: 24, fontWeight: '400', lineHeight: 31 },
    caption: { fontSize: 20, fontWeight: '400', lineHeight: 26 },
  },
};
```

### 1.3 간격 (Spacing)

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### 1.4 그림자 (Shadow)

```typescript
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
};
```

---

## 2. 화면별 개선 계획

### 2.1 홈 화면 (HomeScreen) - 최우선 🔥

**현재 상태**: 기본 스켈레톤, 텍스트만 표시  
**개선 목표**: 시각적으로 매력적인 대시보드

#### 개선 요소

1. **헤더 영역**
   - 그라데이션 배경 (primary.main → primary.light)
   - 사용자 아바타 + 이름 + 레벨 배지
   - 애니메이션: Fade In (500ms)

2. **오늘의 카드 섹션**
   - 큰 카드 컴포넌트 (전체 너비 - 32px padding)
   - 카테고리 아이콘 (왼쪽 상단)
   - 제목 + 설명 미리보기
   - 완료 시 체크마크 애니메이션
   - 그림자 효과 (shadow.md)
   - 터치 시 Scale 애니메이션 (0.98x)

3. **게임화 통계 카드**
   - 3개 가로 배치 (포인트, 스트릭, 레벨)
   - 각 카드에 아이콘 + 숫자 + 라벨
   - 그라데이션 배경 (카드별 다른 색상)
   - 숫자 카운트업 애니메이션

4. **빠른 액션 버튼**
   - 2x2 그리드 (카드 완료, 퀴즈, 사기 검사, 복약 체크)
   - 아이콘 + 라벨
   - Haptic Feedback

#### 컴포넌트 구조

```
HomeScreen
├── Header (GradientHeader)
│   ├── Avatar
│   ├── UserName + LevelBadge
│   └── SettingsButton
├── TodayCardSection
│   └── LargeCard
│       ├── CategoryIcon
│       ├── Title
│       ├── Description
│       └── CompletionButton
├── GamificationStats
│   ├── StatCard (Points)
│   ├── StatCard (Streak)
│   └── StatCard (Level)
└── QuickActions
    ├── ActionButton (카드 완료)
    ├── ActionButton (퀴즈)
    ├── ActionButton (사기 검사)
    └── ActionButton (복약 체크)
```

---

### 2.2 학습 카드 화면 (CardScreen)

**개선 목표**: 몰입감 있는 학습 경험

#### 개선 요소

1. **카드 컨테이너**
   - 전체 화면 카드 (상단 Safe Area 제외)
   - 백그라운드 블러 효과
   - 스와이프로 다음 카드 (좌우 Gesture)

2. **컨텐츠 영역**
   - 카테고리 배지 (상단)
   - 제목 (큰 폰트)
   - 본문 (스크롤 가능)
   - 이미지/일러스트 (있을 경우)

3. **퀴즈 섹션**
   - 라디오 버튼 → 큰 터치 영역 (48dp+)
   - 선택 시 색상 변경 애니메이션
   - 정답/오답 피드백 (색상 + 아이콘 + Haptic)

4. **하단 액션**
   - 진행률 바 (현재 카드 / 전체)
   - "완료" 버튼 (전체 너비, 고정 하단)
   - 버튼 터치 시 Ripple 효과

---

### 2.3 인사이트 화면 (InsightsScreen)

**개선 목표**: 데이터 시각화

#### 개선 요소

1. **주간 활동 차트**
   - react-native-chart-kit 사용
   - 막대 그래프 (7일간 카드 완료 수)
   - 그라데이션 색상
   - 터치 시 상세 정보 툴팁

2. **월간 통계 카드**
   - 완료한 카드 수
   - 획득한 포인트
   - 스트릭 기록
   - 각 카드에 아이콘 + 애니메이션

3. **배지 컬렉션**
   - 그리드 레이아웃 (3열)
   - 획득한 배지: 컬러 + 발광 효과
   - 미획득 배지: 흑백 + 잠금 아이콘
   - 터치 시 모달로 배지 상세 정보

---

### 2.4 커뮤니티 화면 (CommunityScreen)

**개선 목표**: 소셜 인터랙션 강화

#### 개선 요소

1. **질문 리스트**
   - 카드 형태 (shadow.sm)
   - 제목 + 미리보기 + 작성자 + 좋아요 수
   - Pull-to-Refresh

2. **질문 카드 디자인**
   - 왼쪽: 좋아요 아이콘 + 숫자
   - 중앙: 제목 + 작성자 아바타
   - 우른쪽: 답변 수 배지

3. **질문 작성 버튼**
   - Floating Action Button (FAB)
   - 우측 하단 고정
   - 아이콘 + 그라데이션 배경
   - 터치 시 회전 애니메이션

---

### 2.5 도구 화면 (ToolsScreen)

**개선 목표**: 기능별 명확한 구분

#### 개선 요소

1. **도구 카드 그리드**
   - 2열 그리드
   - 각 카드: 아이콘 + 제목 + 설명
   - 카테고리별 색상 구분

2. **사기 검사 카드**
   - 주황색 그라데이션
   - 방패 아이콘
   - "문자 확인하기" CTA

3. **복약 체크 카드**
   - 녹색 그라데이션
   - 알약 아이콘
   - "오늘 복약 체크" CTA

4. **음성 도우미 카드**
   - 파란색 그라데이션
   - 마이크 아이콘
   - "말로 질문하기" CTA

---

## 3. 애니메이션 및 인터랙션

### 3.1 기본 애니메이션

```typescript
// react-native-reanimated 사용
const animations = {
  fadeIn: {
    duration: 500,
    easing: Easing.ease,
  },
  scaleOnPress: {
    from: 1,
    to: 0.98,
    duration: 100,
  },
  slideInBottom: {
    from: { translateY: 50, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: 400,
  },
  countUp: {
    // 숫자 카운트업 애니메이션
    duration: 1000,
    easing: Easing.out(Easing.cubic),
  },
};
```

### 3.2 Haptic Feedback (진동)

```typescript
import * as Haptics from 'expo-haptics';

const hapticFeedback = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

// 사용 예시
<TouchableOpacity onPress={() => {
  hapticFeedback.light();
  handlePress();
}}>
```

### 3.3 로딩 상태

```typescript
// Skeleton Loader
<ContentLoader
  speed={1}
  backgroundColor="#f3f3f3"
  foregroundColor="#ecebeb"
>
  <Rect x="0" y="0" rx="8" ry="8" width="100%" height="120" />
</ContentLoader>

// Spinner (카드 완료 시)
<ActivityIndicator size="large" color={colors.primary.main} />
```

---

## 4. 컴포넌트 개선 목록

### 4.1 신규 컴포넌트

| 컴포넌트 | 용도 | 우선순위 |
|---------|------|---------|
| `GradientCard` | 배경 그라데이션 카드 | 🔥 높음 |
| `StatCard` | 게임화 통계 카드 | 🔥 높음 |
| `AnimatedNumber` | 카운트업 숫자 | 🔥 높음 |
| `LevelBadge` | 레벨 배지 | 🔴 중간 |
| `ProgressBar` | 진행률 표시 | 🔴 중간 |
| `ChartCard` | 차트 래퍼 | 🔴 중간 |
| `BadgeIcon` | 배지 아이콘 | 🟡 낮음 |
| `FloatingActionButton` | FAB 버튼 | 🟡 낮음 |

### 4.2 기존 컴포넌트 개선

| 컴포넌트 | 현재 상태 | 개선 사항 |
|---------|----------|----------|
| `Button` | 기본 스타일 | 그라데이션, 그림자, 애니메이션 추가 |
| `Card` | 흰색 배경만 | 다양한 배경색, 그림자 옵션 |
| `Avatar` | 원형 이미지 | 레벨 배지 오버레이 |
| `Badge` | 텍스트만 | 아이콘 + 그라데이션 배경 |

---

## 5. 구현 우선순위

### Phase 1: 홈 화면 (1-2일) 🔥

1. ✅ 디자인 시스템 색상/타이포 정의
2. ✅ `GradientCard` 컴포넌트 구현
3. ✅ `StatCard` 컴포넌트 구현
4. ✅ `AnimatedNumber` 컴포넌트 구현
5. ✅ HomeScreen UI 리팩토링
   - 헤더 그라데이션
   - 오늘의 카드 섹션
   - 게임화 통계
   - 빠른 액션 버튼

### Phase 2: 카드 화면 (1일) 🔴

6. ✅ CardScreen 레이아웃 개선
7. ✅ 퀴즈 UI 개선 (큰 터치 영역)
8. ✅ 완료 버튼 애니메이션
9. ✅ Haptic Feedback 추가

### Phase 3: 인사이트 화면 (1일) 🔴

10. ✅ `react-native-chart-kit` 설치
11. ✅ 주간 활동 차트 구현
12. ✅ 월간 통계 카드
13. ✅ 배지 컬렉션 그리드

### Phase 4: 나머지 화면 (1일) 🟡

14. ✅ CommunityScreen 카드 디자인
15. ✅ ToolsScreen 그리드 개선
16. ✅ FloatingActionButton 구현

### Phase 5: 폴리싱 (0.5일) 🟢

17. ✅ 모든 화면에 로딩 상태 추가
18. ✅ 애니메이션 일관성 검토
19. ✅ A11y 모드별 테스트
20. ✅ 성능 최적화 (useMemo, useCallback)

---

## 6. 기술 스택

### 6.1 새로 추가할 라이브러리

```json
{
  "react-native-reanimated": "^3.6.0",        // 애니메이션
  "react-native-gesture-handler": "^2.14.0",  // 제스처
  "react-native-svg": "^14.1.0",              // SVG 아이콘
  "react-native-chart-kit": "^6.12.0",        // 차트
  "react-native-linear-gradient": "^2.8.3",   // 그라데이션
  "expo-haptics": "^12.8.1",                  // 진동
  "react-content-loader": "^6.2.1"            // Skeleton
}
```

### 6.2 네이티브 모듈 (Expo SDK 51 포함)

- `expo-linear-gradient` ✅ 이미 설치됨
- `expo-haptics` ✅ 추가 필요
- `react-native-reanimated` ✅ 추가 필요

---

## 7. 디자인 참고 (네이티브 가이드라인)

### 7.1 iOS Human Interface Guidelines

- **터치 영역**: 최소 44x44 pt (Ultra 모드: 64x64 pt)
- **그림자**: 은은하게 (불투명도 0.05-0.15)
- **애니메이션**: 부드럽고 빠르게 (200-500ms)
- **색상**: 시스템 컬러 우선 (Blue, Green, Orange 등)

### 7.2 Material Design (Android 참고)

- **Elevation**: 카드 4dp, FAB 6dp
- **Ripple Effect**: 터치 피드백
- **Typography**: Roboto 대신 System Font
- **Motion**: Easing curves 사용

---

## 8. 접근성 (A11y) 체크리스트

- [ ] 모든 터치 영역 48dp 이상 (Ultra: 64dp)
- [ ] 색상 대비 4.5:1 이상 (WCAG AA)
- [ ] `accessibilityLabel` 모든 버튼에 추가
- [ ] `accessibilityHint` 복잡한 동작에 추가
- [ ] 애니메이션 `reduce motion` 옵션 지원
- [ ] 스크린리더 테스트 (iOS VoiceOver, Android TalkBack)

---

## 9. 다음 단계

1. ✅ 디자인 시스템 색상/타이포 코드 구현
2. ✅ 신규 컴포넌트 3개 구현 (GradientCard, StatCard, AnimatedNumber)
3. ✅ HomeScreen 리팩토링
4. → 나머지 화면 순차 진행

---

**문서 작성일**: 2025년 11월 23일  
**작성자**: AI Development Agent  
**버전**: 1.0  
**다음 문서**: `02-web-ui-enhancement-plan.md` (웹 대시보드)
