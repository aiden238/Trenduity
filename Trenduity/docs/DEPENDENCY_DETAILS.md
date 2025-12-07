# Mobile App 의존성 상세 정보

> **작성일**: 2025-12-08  
> **참조**: `docs/OAUTH_EXPO_GO_SOLUTION.md` (요약본)  
> **대상**: `apps/mobile-expo/package.json`

## 📦 전체 의존성 목록

### Production Dependencies

```json
{
  "@babel/core": "^7.25.2",
  "@expo/metro-runtime": "~5.0.4",
  "@react-navigation/bottom-tabs": "^6.5.8",
  "@react-navigation/native": "^6.1.7",
  "@react-navigation/native-stack": "^6.9.13",
  "@supabase/supabase-js": "^2.47.12",
  "@tanstack/react-query": "^5.64.2",
  "expo": "~54.0.0",
  "expo-auth-session": "^7.0.10",        // ⚠️ 미사용
  "expo-font": "~13.3.1",
  "expo-haptics": "~14.1.0",
  "expo-image": "~2.2.1",
  "expo-linking": "~7.0.5",
  "expo-router": "~5.0.6",
  "expo-secure-store": "~14.2.3",
  "expo-speech": "~13.1.0",
  "expo-splash-screen": "~0.30.8",
  "expo-status-bar": "~2.2.3",
  "expo-system-ui": "~4.0.9",
  "expo-web-browser": "^15.0.10",        // ⚠️ 미사용
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-gesture-handler": "~2.24.0",
  "react-native-linear-gradient": "^2.8.3",  // ⚠️ 미사용
  "react-native-reanimated": "~3.17.4",
  "react-native-safe-area-context": "5.4.0",
  "react-native-screens": "~4.10.0",
  "react-native-url-polyfill": "^2.0.0"
}
```

### Dev Dependencies

```json
{
  "@babel/core": "^7.25.2",
  "@types/react": "~19.0.10",
  "typescript": "~5.8.3"
}
```

---

## 🔍 패키지별 상세 설명

### 핵심 런타임

#### `expo` (~54.0.0)
- **용도**: Expo SDK 코어 - 모든 Expo 기능의 기반
- **필수 여부**: ✅ 필수
- **참고**: SDK 버전 업그레이드 시 모든 expo-* 패키지 호환성 확인 필요

#### `react` (19.1.0)
- **용도**: React UI 프레임워크
- **필수 여부**: ✅ 필수
- **참고**: React 19는 최신 버전, RSC(React Server Components) 지원

#### `react-native` (0.81.5)
- **용도**: React Native 런타임
- **필수 여부**: ✅ 필수
- **참고**: New Architecture 지원

---

### 인증 관련

#### `expo-auth-session` (^7.0.10)
- **용도**: OAuth 세션 관리, redirect URL 생성
- **현재 상태**: ⚠️ 설치됨, **미사용**
- **미사용 이유**: `makeRedirectUri`가 내부적으로 `expo-web-browser` 로드 시도
- **대체 방안**: 하드코딩된 redirect URL 사용 (`trenduity://auth/callback`)
- **복원 시점**: Development Build 전환 시

#### `expo-web-browser` (^15.0.10)
- **용도**: 인앱 브라우저로 OAuth 창 열기
- **현재 상태**: ⚠️ 설치됨, **미사용**
- **미사용 이유**: Expo Go에서 네이티브 모듈 미지원
- **에러**: `Cannot find native module 'ExpoWebBrowser'`
- **대체 방안**: `Linking.openURL()` 사용 (외부 브라우저)
- **복원 시점**: Development Build 전환 시

#### `expo-linking` (~7.0.5)
- **용도**: 딥링크 처리, URL 스킴 관리
- **현재 상태**: ✅ 사용 중
- **사용 위치**: `AuthContext.tsx` - OAuth 콜백 처리
- **중요**: Expo Go에서 OAuth 플로우의 핵심

#### `expo-secure-store` (~14.2.3)
- **용도**: 보안 키-값 저장소 (토큰 저장)
- **현재 상태**: ✅ 사용 중
- **사용 위치**: `AuthContext.tsx` - 인증 토큰 저장

---

### 네비게이션

#### `@react-navigation/native` (^6.1.7)
- **용도**: React Navigation 코어
- **현재 상태**: ✅ 사용 중
- **의존성**: `react-native-screens`, `react-native-safe-area-context`

#### `@react-navigation/native-stack` (^6.9.13)
- **용도**: 네이티브 스택 네비게이터
- **현재 상태**: ✅ 사용 중
- **사용 위치**: 인증 플로우, 설정 화면 등

#### `@react-navigation/bottom-tabs` (^6.5.8)
- **용도**: 하단 탭 네비게이터
- **현재 상태**: ✅ 사용 중
- **사용 위치**: 메인 탭 네비게이션 (홈, 인사이트, 커뮤니티, 도구, 설정)

#### `react-native-screens` (~4.10.0)
- **용도**: 네이티브 화면 관리 (성능 최적화)
- **현재 상태**: ✅ 사용 중
- **참고**: React Navigation 필수 의존성

#### `react-native-safe-area-context` (5.4.0)
- **용도**: 노치/홈바 등 안전 영역 처리
- **현재 상태**: ✅ 사용 중
- **참고**: React Navigation 필수 의존성

---

### 백엔드 연동

#### `@supabase/supabase-js` (^2.47.12)
- **용도**: Supabase 클라이언트 (인증, DB, Storage)
- **현재 상태**: ✅ 사용 중
- **사용 위치**: `supabase.ts`, `AuthContext.tsx`
- **환경변수**: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

#### `@tanstack/react-query` (^5.64.2)
- **용도**: 서버 상태 관리, 캐싱, 자동 리페치
- **현재 상태**: ✅ 사용 중
- **사용 위치**: 훅들 (`useTodayCard`, `useInsights` 등)
- **참고**: v5 버전은 더 간결한 API 제공

#### `react-native-url-polyfill` (^2.0.0)
- **용도**: URL API 폴리필 (Supabase 의존성)
- **현재 상태**: ✅ 사용 중
- **사용 위치**: 앱 진입점 (`App.tsx` 또는 `index.ts`)

---

### UI/UX

#### `react-native-gesture-handler` (~2.24.0)
- **용도**: 고급 제스처 처리
- **현재 상태**: ✅ 사용 중
- **참고**: React Navigation, 스와이프 기능에 필수

#### `react-native-reanimated` (~3.17.4)
- **용도**: 고성능 애니메이션
- **현재 상태**: ✅ 사용 중
- **참고**: babel 플러그인 설정 필요 (`babel.config.js`)

#### `react-native-linear-gradient` (^2.8.3)
- **용도**: 그라데이션 배경
- **현재 상태**: ⚠️ 설치됨, **미사용**
- **미사용 이유**: Expo Go에서 동작 불안정
- **대체 방안**: `View` + 단색 배경 (`COLORS.primary.main`)
- **복원 시점**: Development Build 또는 Production

---

### Expo 유틸리티

#### `expo-font` (~13.3.1)
- **용도**: 커스텀 폰트 로딩
- **현재 상태**: ✅ 사용 중
- **사용 위치**: 앱 초기화 시 폰트 로드

#### `expo-splash-screen` (~0.30.8)
- **용도**: 스플래시 화면 제어
- **현재 상태**: ✅ 사용 중
- **참고**: 폰트/데이터 로딩 완료까지 스플래시 유지

#### `expo-status-bar` (~2.2.3)
- **용도**: 상태바 스타일 제어
- **현재 상태**: ✅ 사용 중

#### `expo-system-ui` (~4.0.9)
- **용도**: 시스템 UI 설정 (루트 배경색 등)
- **현재 상태**: ✅ 사용 중

#### `expo-speech` (~13.1.0)
- **용도**: TTS(Text-to-Speech) 음성 출력
- **현재 상태**: ✅ 사용 중
- **사용 위치**: `useTTS` 훅, 시니어 접근성 기능

#### `expo-haptics` (~14.1.0)
- **용도**: 햅틱 피드백 (진동)
- **현재 상태**: ✅ 사용 중
- **사용 위치**: 버튼 터치, 완료 알림 등

#### `expo-image` (~2.2.1)
- **용도**: 최적화된 이미지 컴포넌트
- **현재 상태**: ✅ 사용 중
- **장점**: 캐싱, 플레이스홀더, 블러 해시 지원

#### `expo-router` (~5.0.6)
- **용도**: 파일 기반 라우팅
- **현재 상태**: ✅ 사용 중
- **참고**: Next.js 스타일 라우팅

---

## 🔧 의존성 관리 가이드

### 버전 업그레이드 시 주의사항

1. **Expo SDK 업그레이드**
   ```bash
   # 권장: expo upgrade 명령어 사용
   npx expo upgrade
   ```
   - 모든 expo-* 패키지가 자동으로 호환 버전으로 업데이트됨

2. **개별 패키지 업데이트**
   ```bash
   # 특정 패키지만 업데이트
   npm update @supabase/supabase-js
   
   # 호환성 확인
   npx expo doctor
   ```

3. **React/React Native 업그레이드**
   - Expo SDK에 포함된 버전 사용 권장
   - 독립적 업그레이드 시 호환성 문제 발생 가능

### 불필요 패키지 정리

```bash
# Development Build 전환 전까지 보류 권장
# npm uninstall expo-auth-session expo-web-browser

# 그라데이션 미사용 확정 시
npm uninstall react-native-linear-gradient
```

---

## 📊 의존성 트리

```
mobile-expo
├── expo (~54.0.0)
│   ├── expo-linking (~7.0.5)
│   ├── expo-font (~13.3.1)
│   ├── expo-splash-screen (~0.30.8)
│   ├── expo-status-bar (~2.2.3)
│   ├── expo-system-ui (~4.0.9)
│   ├── expo-speech (~13.1.0)
│   ├── expo-haptics (~14.1.0)
│   ├── expo-image (~2.2.1)
│   ├── expo-secure-store (~14.2.3)
│   └── expo-router (~5.0.6)
│
├── react (19.1.0)
│   └── react-native (0.81.5)
│       ├── react-native-gesture-handler (~2.24.0)
│       ├── react-native-reanimated (~3.17.4)
│       ├── react-native-screens (~4.10.0)
│       └── react-native-safe-area-context (5.4.0)
│
├── @react-navigation/native (^6.1.7)
│   ├── @react-navigation/native-stack (^6.9.13)
│   └── @react-navigation/bottom-tabs (^6.5.8)
│
├── @supabase/supabase-js (^2.47.12)
│   └── react-native-url-polyfill (^2.0.0)
│
├── @tanstack/react-query (^5.64.2)
│
└── ⚠️ 미사용
    ├── expo-auth-session (^7.0.10)
    ├── expo-web-browser (^15.0.10)
    └── react-native-linear-gradient (^2.8.3)
```

---

## 🔗 관련 문서

- **요약본**: `docs/OAUTH_EXPO_GO_SOLUTION.md`
- **아키텍처**: `docs/PLAN/01-2-architecture-overview.md`
- **구현 규칙**: `docs/IMPLEMENT/01-implementation-rules.md`

---

**최종 업데이트**: 2025-12-08
