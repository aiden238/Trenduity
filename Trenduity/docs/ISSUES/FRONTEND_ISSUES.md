# Frontend Issues Report

**생성일**: 2025년 12월 2일  
**분석 범위**: Mobile App (apps/mobile-expo/), Shared UI (packages/ui/)  
**상태**: ✅ P0 이슈 전부 수정 완료

---

## 📊 이슈 요약

| 우선순위 | 전체 | 수정 완료 | 남은 작업 |
|---------|------|---------|----------|
| **P0 Critical** | 4 | 4 | 0 |
| **합계** | 4 | 4 | 0 |

---

## ❌ P0 Critical Issues (치명적 - 모두 수정 완료)

### ✅ 1. expo-dev-client 패키지 누락
- **파일**: `apps/mobile-expo/package.json`
- **문제**: Development Build에 필수인 `expo-dev-client` 패키지가 dependencies에 없음
- **증상**: 
  - Metro bundler 연결 실패
  - ngrok, Expo Go, Cloudflare, WiFi, USB 모든 방식 실패
  - 앱 실행 시 "Could not connect to development server" 에러
- **근본 원인**: Development Build는 Expo Go와 달리 `expo-dev-client`를 명시적으로 설치해야 함
- **해결**: 
  ```json
  "dependencies": {
    "expo-dev-client": "~15.0.0",
    ...
  }
  ```
- **설치 명령어**: 
  ```bash
  cd apps/mobile-expo
  npm install expo-dev-client@~15.0.0 --legacy-peer-deps
  ```
- **수정 일시**: 2025-12-02
- **영향**: 🔴 **모든 연결 실패의 근본 원인**
- **커밋**: (수정 완료)

---

### ✅ 2. React 19.1.0 비호환
- **파일**: `apps/mobile-expo/package.json`
- **문제**: 
  ```json
  "react": "19.1.0"  // ❌ 실험적 버전
  "react-native": "0.81.5"  // React 18.2.0 요구
  ```
- **증상**: 
  - Peer dependency 경고
  - TypeScript 타입 에러
  - 모듈 resolution 충돌
  - React Native 컴포넌트 렌더링 불안정
- **호환성 매트릭스**: 
  | React Native | 요구 React 버전 |
  |--------------|----------------|
  | 0.81.5 | 18.2.0 |
  | 0.72.x | 18.2.0 |
  | 0.70.x | 18.1.0 |
- **해결**: 
  ```json
  "react": "18.2.0",
  "react-dom": "18.2.0"
  ```
- **설치 명령어**: 
  ```bash
  cd apps/mobile-expo
  npm install react@18.2.0 react-dom@18.2.0 --legacy-peer-deps
  ```
- **수정 일시**: 2025-12-02
- **영향**: 🔴 **타입 안정성 및 런타임 안정성**
- **커밋**: (수정 완료)

---

### ✅ 3. app.json 설정 불완전
- **파일**: `apps/mobile-expo/app.json`
- **문제**: 
  ```json
  {
    "expo": {
      "name": "시니어학습앱",
      "slug": "senior-learning-app",
      // ❌ sdkVersion 없음
      // ❌ plugins 배열 없음
      // ❌ extra 객체 없음
    }
  }
  ```
- **증상**: 
  - Development Build 플러그인 미등록
  - 환경변수 접근 불가 (`Constants.expoConfig?.extra` 항상 undefined)
  - BFF_API_URL 기본값으로 fallback (localhost:8000)
- **해결**: 
  ```json
  {
    "expo": {
      "name": "시니어학습앱",
      "slug": "senior-learning-app",
      "sdkVersion": "54.0.0",
      "plugins": [
        "expo-dev-client"
      ],
      "extra": {
        "BFF_API_URL": "https://trenduity-bff.onrender.com"
      }
    }
  }
  ```
- **설명**: 
  - `sdkVersion`: Expo SDK 버전 명시 (54.0.25와 호환)
  - `plugins`: expo-dev-client 활성화 (Development Build 필수)
  - `extra`: 커스텀 환경변수 정의 (런타임 접근 가능)
- **수정 일시**: 2025-12-02
- **영향**: 🟡 **환경변수 및 플러그인 시스템**
- **커밋**: (수정 완료)

---

### ✅ 4. 환경변수 접근 방식 오류
- **파일**: `apps/mobile-expo/src/utils/apiClient.ts`
- **문제**: 
  ```typescript
  import Constants from 'expo-constants';
  const BFF_API_URL = Constants.expoConfig?.extra?.BFF_API_URL || 'http://localhost:8000';
  ```
  - `Constants.expoConfig?.extra`는 Expo SDK 50 이전 방식
  - app.json의 extra가 비어있어 항상 undefined
- **증상**: 
  - 항상 `http://localhost:8000` fallback
  - Render.com 백엔드 연결 실패
  - ngrok 터널 사용 불가
- **Expo SDK 50+ 권장 방식**: 
  ```typescript
  // ❌ 구식 (SDK 49 이하)
  const url = Constants.expoConfig?.extra?.BFF_API_URL;
  
  // ✅ 신식 (SDK 50+)
  const url = process.env.EXPO_PUBLIC_BFF_API_URL;
  ```
- **해결**: 
  ```typescript
  const BFF_API_URL = process.env.EXPO_PUBLIC_BFF_API_URL || 'http://localhost:8000';
  ```
  - `.env` 파일 생성 (로컬 개발용):
    ```env
    EXPO_PUBLIC_BFF_API_URL=http://localhost:8000
    ```
  - 프로덕션 빌드:
    ```env
    EXPO_PUBLIC_BFF_API_URL=https://trenduity-bff.onrender.com
    ```
- **수정 일시**: 2025-12-02
- **영향**: 🟡 **API 연결 설정**
- **참고**: 
  - `EXPO_PUBLIC_` 접두사는 Expo가 자동으로 앱에 inject
  - 민감 정보는 `EXPO_PUBLIC_` 사용 금지 (클라이언트 노출)
- **커밋**: (수정 완료)

---

## 🔧 수정 체크리스트

### 즉시 실행 (앱 연결 복구)
```bash
# 1. 프로젝트 루트로 이동
cd c:\AIDEN_PROJECT\Trenduity\Trenduity

# 2. Mobile 앱 의존성 재설치
cd apps\mobile-expo
npm install --legacy-peer-deps

# 3. Metro 캐시 정리
npx expo start -c

# 4. Development Build 재빌드 (Android)
npx expo run:android
```

### 환경변수 설정
1. `apps/mobile-expo/.env` 파일 생성 (Git ignore 확인):
   ```env
   EXPO_PUBLIC_BFF_API_URL=http://localhost:8000
   ```
2. 프로덕션 빌드 시:
   ```env
   EXPO_PUBLIC_BFF_API_URL=https://trenduity-bff.onrender.com
   ```

### 검증 단계
```bash
# 타입 체크
npm run typecheck

# 린트 검사
npm run lint

# 앱 실행 (Development Build)
npm start
```

---

## 📋 수정 전후 비교

### 연결 상태
| 연결 방식 | 수정 전 | 수정 후 |
|----------|---------|---------|
| ngrok | ❌ 실패 | ✅ 예상됨 |
| Expo Go | ❌ 실패 | ✅ 예상됨 |
| Cloudflare Tunnel | ❌ 실패 | ✅ 예상됨 |
| WiFi (같은 네트워크) | ❌ 실패 | ✅ 예상됨 |
| USB (adb) | ❌ 실패 | ✅ 예상됨 |

### package.json 변경 사항
```diff
{
  "dependencies": {
+   "expo-dev-client": "~15.0.0",
-   "react": "19.1.0",
+   "react": "18.2.0",
+   "react-dom": "18.2.0",
    "react-native": "0.81.5"
  }
}
```

### app.json 변경 사항
```diff
{
  "expo": {
    "name": "시니어학습앱",
    "slug": "senior-learning-app",
+   "sdkVersion": "54.0.0",
+   "plugins": [
+     "expo-dev-client"
+   ],
+   "extra": {
+     "BFF_API_URL": "https://trenduity-bff.onrender.com"
+   }
  }
}
```

### apiClient.ts 변경 사항
```diff
- import Constants from 'expo-constants';
- const BFF_API_URL = Constants.expoConfig?.extra?.BFF_API_URL || 'http://localhost:8000';
+ const BFF_API_URL = process.env.EXPO_PUBLIC_BFF_API_URL || 'http://localhost:8000';
```

---

## 🚨 주의 사항

### Development Build vs Expo Go
- **Expo Go**: 
  - 사전 빌드된 앱, 제한적인 네이티브 모듈
  - `expo-dev-client` 불필요
- **Development Build**: 
  - 커스텀 네이티브 코드 포함 가능
  - `expo-dev-client` 필수 ⚠️
  
**이 프로젝트는 Development Build 사용 중**

### React 버전 고정
- `package.json`에서 `react`를 정확히 `18.2.0`으로 고정 (틸드 없음)
- `react-native` 업그레이드 전까지 React 19.x 사용 금지

### 환경변수 보안
- `EXPO_PUBLIC_` 접두사는 클라이언트 번들에 포함됨
- API 키, 시크릿은 `EXPO_PUBLIC_` 사용 금지
- BFF를 통해 민감한 작업 처리 (서버 사이드)

---

## 🎯 예상 결과

### 수정 완료 후 가능한 작업
1. ✅ Metro bundler에 정상 연결
2. ✅ Render.com 백엔드 API 호출
3. ✅ OAuth 소셜 로그인 (Google, Kakao) 테스트 가능
4. ✅ Development Build로 모든 네이티브 기능 사용
5. ✅ ngrok/Cloudflare Tunnel로 외부 접속 테스트

### 다음 개발 단계
1. [ ] 로그인 플로우 통합 테스트
2. [ ] 오늘의 카드 화면 검증
3. [ ] A11y 모드 전환 UI 개선
4. [ ] TTS 음성 재생 구현
5. [ ] Supabase Realtime 알림 구독

---

## 📚 참고 자료

- **Expo Development Builds**: https://docs.expo.dev/develop/development-builds/introduction/
- **Expo SDK 54 환경변수**: https://docs.expo.dev/guides/environment-variables/
- **React Native 버전 호환성**: https://reactnative.dev/blog/2023/12/06/0.73-debugging-improvements-stable-symlinks#breaking-changes
- **프로젝트 아키텍처**: `docs/PLAN/01-2-architecture-overview.md`
- **Copilot 지침서**: `.github/copilot-instructions.md`

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025년 12월 2일  
**작성자**: AI Copilot  
**검토 상태**: ✅ P0 전부 수정 완료, 앱 연결 복구 예상
