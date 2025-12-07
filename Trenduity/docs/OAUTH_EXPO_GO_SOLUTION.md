# OAuth 소셜 로그인 - Expo Go 호환 솔루션

> **작성일**: 2025-12-08  
> **상태**: 구현 완료 (테스트 필요)  
> **관련 파일**: `apps/mobile-expo/src/contexts/AuthContext.tsx`

## 🔴 문제 상황

### 원인
- `expo-web-browser`는 **네이티브 모듈**이 필요함
- Expo Go 앱은 네이티브 모듈을 포함할 수 없음
- 결과: `Cannot find native module 'ExpoWebBrowser'` 에러 발생

### 에러 메시지
```
Uncaught Error
Cannot find native module 'ExpoWebBrowser'
  at requireNativeModule
  at <global> ExpoWebBrowser.js
  at AuthContext.tsx
```

## ✅ 해결 방법

### 변경 전 (Development Build 전용)
```typescript
import * as WebBrowser from 'expo-web-browser';

// WebBrowser.openAuthSessionAsync 사용
const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
```

### 변경 후 (Expo Go 호환)
```typescript
import { Linking } from 'react-native';
import * as AuthSession from 'expo-auth-session';

// Linking.openURL + 딥링크 리스너 사용
const redirectUrl = AuthSession.makeRedirectUri({
  scheme: 'trenduity',
  path: 'auth/callback',
});

Linking.addEventListener('url', handleUrl);
Linking.openURL(authUrl);
```

## 🔧 주요 변경사항

### 1. Import 변경
```diff
- import * as WebBrowser from 'expo-web-browser';
+ import { Alert, Linking } from 'react-native';
```

### 2. Redirect URL 생성
```typescript
// AuthSession.makeRedirectUri로 Expo Go 호환 URL 생성
const redirectUrl = AuthSession.makeRedirectUri({
  scheme: 'trenduity',
  path: 'auth/callback',
});
// Expo Go: exp://192.168.x.x:8081/--/auth/callback
// Dev Build: trenduity://auth/callback
```

### 3. OAuth 플로우 변경
```typescript
// Promise 기반 딥링크 리스너 패턴
return new Promise((resolve, reject) => {
  const handleUrl = async (event: { url: string }) => {
    Linking.removeEventListener('url', handleUrl);
    // URL에서 토큰 추출 및 처리
  };
  
  Linking.addEventListener('url', handleUrl);
  Linking.openURL(authUrl);
  
  // 타임아웃 (2분)
  setTimeout(() => {
    Linking.removeEventListener('url', handleUrl);
    reject(new Error('로그인 시간이 초과되었습니다.'));
  }, 120000);
});
```

## 📋 지원 환경 비교

| 기능 | Expo Go | Development Build |
|------|---------|-------------------|
| 이메일 로그인 | ✅ | ✅ |
| 회원가입 | ✅ | ✅ |
| 카카오 로그인 | ✅ (Linking) | ✅ (WebBrowser) |
| 네이버 로그인 | ✅ (Linking) | ✅ (WebBrowser) |
| 구글 로그인 | ✅ (Linking) | ✅ (WebBrowser) |

## ⚠️ 주의사항

### 1. Supabase Site URL 설정
Supabase 대시보드에서 **Site URL**을 설정해야 OAuth redirect가 정상 작동:
- Expo Go: `exp://192.168.x.x:8081` (개발 환경)
- Production: `trenduity://auth/callback`

### 2. OAuth Provider 설정
각 OAuth provider (카카오, 네이버, 구글)에서 **Redirect URI** 등록 필요:
- 카카오: 카카오 개발자 콘솔 → 앱 설정 → 플랫폼
- 네이버: 네이버 개발자 센터 → 애플리케이션 → API 설정
- 구글: Google Cloud Console → OAuth 2.0 클라이언트

### 3. 딥링크 타임아웃
- 현재 2분(120초) 타임아웃 설정
- 사용자가 브라우저에서 오래 머무르면 타임아웃 발생 가능

## 🔄 롤백 방법

Development Build로 전환 시 원래 코드로 복원:

```typescript
// 1. Import 복원
import * as WebBrowser from 'expo-web-browser';

// 2. socialLogin 함수에서 WebBrowser 사용
const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
if (result.type === 'success') {
  // 토큰 처리
}
```

## 📁 관련 파일

- `apps/mobile-expo/src/contexts/AuthContext.tsx` - 인증 컨텍스트
- `apps/mobile-expo/src/screens/Auth/LoginScreen.tsx` - 로그인 화면
- `apps/mobile-expo/app.json` - scheme 설정 (`trenduity`)

## 🧪 테스트 체크리스트

- [ ] Metro 시작 시 에러 없음
- [ ] 앱 로드 시 검은 화면 없음
- [ ] 이메일 로그인 동작
- [ ] 카카오 로그인 버튼 → 브라우저 열림
- [ ] 네이버 로그인 버튼 → 브라우저 열림
- [ ] 구글 로그인 버튼 → 브라우저 열림
- [ ] OAuth 완료 후 앱으로 돌아옴
- [ ] 로그인 성공 시 메인 화면 이동

## 📝 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2025-12-08 | `expo-web-browser` 제거, `Linking` 기반 OAuth로 변경 |
| 2025-12-08 | `expo-linear-gradient` 제거, 단색 배경으로 변경 |
| 2025-12-08 | `spacing` 객체 연산 오류 수정 (spacing.md, spacing.lg 등) |

---

## 📦 의존성 현황 (2025-12-08 기준)

### 핵심 프레임워크

| 패키지 | 버전 | 용도 | 상태 |
|--------|------|------|------|
| `expo` | ~54.0.0 | Expo SDK 코어 | ✅ 사용 중 |
| `react` | 19.1.0 | UI 프레임워크 | ✅ 사용 중 |
| `react-native` | 0.81.5 | 네이티브 런타임 | ✅ 사용 중 |

### Expo 모듈

| 패키지 | 버전 | 용도 | 상태 |
|--------|------|------|------|
| `expo-auth-session` | ^7.0.10 | OAuth 세션 관리 | ⚠️ 설치됨, **미사용** (Expo Go 호환 위해) |
| `expo-web-browser` | ^15.0.10 | 인앱 브라우저 | ⚠️ 설치됨, **미사용** (네이티브 모듈) |
| `expo-linking` | ~7.0.5 | 딥링크 처리 | ✅ 사용 중 |
| `expo-router` | ~5.0.6 | 파일 기반 라우팅 | ✅ 사용 중 |
| `expo-status-bar` | ~2.2.3 | 상태바 제어 | ✅ 사용 중 |
| `expo-secure-store` | ~14.2.3 | 보안 저장소 | ✅ 사용 중 |
| `expo-font` | ~13.3.1 | 커스텀 폰트 | ✅ 사용 중 |
| `expo-splash-screen` | ~0.30.8 | 스플래시 화면 | ✅ 사용 중 |
| `expo-system-ui` | ~4.0.9 | 시스템 UI 설정 | ✅ 사용 중 |
| `expo-speech` | ~13.1.0 | TTS 음성 출력 | ✅ 사용 중 |
| `expo-haptics` | ~14.1.0 | 햅틱 피드백 | ✅ 사용 중 |
| `expo-image` | ~2.2.1 | 이미지 최적화 | ✅ 사용 중 |

### 네비게이션

| 패키지 | 버전 | 용도 | 상태 |
|--------|------|------|------|
| `@react-navigation/native` | ^6.1.7 | 네비게이션 코어 | ✅ 사용 중 |
| `@react-navigation/native-stack` | ^6.9.13 | 스택 네비게이션 | ✅ 사용 중 |
| `@react-navigation/bottom-tabs` | ^6.5.8 | 하단 탭 | ✅ 사용 중 |
| `react-native-screens` | ~4.10.0 | 네이티브 스크린 | ✅ 사용 중 |
| `react-native-safe-area-context` | 5.4.0 | 안전 영역 처리 | ✅ 사용 중 |

### 백엔드 연동

| 패키지 | 버전 | 용도 | 상태 |
|--------|------|------|------|
| `@supabase/supabase-js` | ^2.47.12 | Supabase 클라이언트 | ✅ 사용 중 |
| `@tanstack/react-query` | ^5.64.2 | 서버 상태 관리 | ✅ 사용 중 |
| `react-native-url-polyfill` | ^2.0.0 | URL API 폴리필 | ✅ 사용 중 |

### UI/UX

| 패키지 | 버전 | 용도 | 상태 |
|--------|------|------|------|
| `react-native-gesture-handler` | ~2.24.0 | 제스처 처리 | ✅ 사용 중 |
| `react-native-reanimated` | ~3.17.4 | 애니메이션 | ✅ 사용 중 |
| `react-native-linear-gradient` | ^2.8.3 | 그라데이션 | ⚠️ 설치됨, **미사용** (View로 대체) |

### 개발 도구

| 패키지 | 버전 | 용도 | 상태 |
|--------|------|------|------|
| `typescript` | ~5.8.3 | 타입 체크 | ✅ 사용 중 |
| `@babel/core` | ^7.25.2 | JS 컴파일러 | ✅ 사용 중 |

---

### ⚠️ 미사용 패키지 (정리 권장)

다음 패키지들은 설치되어 있지만 **현재 사용되지 않습니다**:

```bash
# 선택적 정리 (Development Build 전환 시 다시 필요할 수 있음)
npm uninstall expo-auth-session expo-web-browser react-native-linear-gradient
```

| 패키지 | 미사용 이유 | 정리 권장 |
|--------|------------|----------|
| `expo-auth-session` | Expo Go 네이티브 모듈 미지원 | 🟡 보류 (Dev Build 대비) |
| `expo-web-browser` | Expo Go 네이티브 모듈 미지원 | 🟡 보류 (Dev Build 대비) |
| `react-native-linear-gradient` | Expo Go에서 동작 불안정 | 🟢 삭제 가능 |

---

### 📊 의존성 상태 요약

```
┌─────────────────────────────────────────────────────────┐
│           Mobile App 의존성 상태 (2025-12-08)            │
├─────────────────────────────────────────────────────────┤
│  ✅ 정상 사용: 25개                                      │
│  ⚠️ 설치됨/미사용: 3개                                   │
│  ❌ 문제: 0개                                            │
├─────────────────────────────────────────────────────────┤
│  Expo SDK: 54.0.0 (최신)                                │
│  React: 19.1.0 (최신)                                   │
│  React Native: 0.81.5 (최신)                            │
└─────────────────────────────────────────────────────────┘
```

---

**다음 세션 참고**: 이 문서는 OAuth 관련 문제 및 의존성 현황 참고용입니다.  
**관련 문서**: `docs/DEPENDENCY_DETAILS.md` (추가 상세 정보)
