# Android 빌드 트러블슈팅 가이드

> **작성일**: 2025년 12월 10일  
> **환경**: Windows 11, Expo SDK 54, React Native 0.81.5, Gradle 8.14.3

## 📋 목차

1. [문제 요약](#문제-요약)
2. [근본 원인 분석](#근본-원인-분석)
3. [해결된 문제들](#해결된-문제들)
4. [적용된 수정사항](#적용된-수정사항)
5. [향후 빌드 가이드](#향후-빌드-가이드)
6. [자주 발생하는 에러와 해결법](#자주-발생하는-에러와-해결법)

---

## 문제 요약

### 초기 증상
- Android 빌드 시 Kotlin 컴파일 에러 (`Unresolved reference 'expo'`)
- 빌드 성공 후 런타임 크래시 (`SplashScreenManager ClassNotFoundException`)
- Gradle 설정 단계에서 반복적인 `metadata.bin` 읽기 실패

### 핵심 에러 메시지
```
Error resolving plugin [id: 'com.facebook.react.settings']
> Could not read workspace metadata from C:\Users\<username>\.gradle\caches\8.14.3\transforms\...\metadata.bin
```

---

## 근본 원인 분석

### 1. Gradle 캐시 손상 (Windows 특이 현상)

**현상**:
- `.gradle/caches/8.14.3/transforms/` 내 `metadata.bin` 파일 손상
- 캐시 삭제 시도해도 Java 프로세스가 파일을 점유하여 삭제 불가
- 재부팅 없이는 기존 캐시 디렉토리 정리 불가능

**원인**:
- Gradle 데몬이 백그라운드에서 캐시 파일을 지속적으로 점유
- Windows 파일 시스템의 락킹 메커니즘
- VS Code Java 확장 또는 Android Studio가 프로세스 유지

### 2. 모노레포 node_modules 경로 충돌

**현상**:
- Metro 번들러가 루트 `node_modules` 참조
- `UnableToResolveError: metro-runtime/src/modules/empty-module.js`

**원인**:
- `metro.config.js`가 워크스페이스 루트의 `node_modules` 포함
- npm workspaces에서 `apps/*` 제거 후 설정 불일치

### 3. React Native 0.81.x Gradle 플러그인 구조 변경

**현상**:
- `react-native/gradle/plugin` 디렉토리 없음
- `settings.gradle`의 `providers.exec` 실패

**원인**:
- RN 0.79+에서 Gradle 플러그인이 `@react-native/gradle-plugin`으로 분리됨
- Expo prebuild가 생성한 settings.gradle이 node 명령으로 경로 resolve 시도

---

## 해결된 문제들

### ✅ 문제 1: Gradle 캐시 손상

**해결법**: 새로운 Gradle 캐시 디렉토리 사용

```powershell
# 환경 변수로 새 캐시 디렉토리 지정
$env:GRADLE_USER_HOME = "C:\gradle_cache_new"

# 빌드 실행
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo\android
.\gradlew.bat assembleDebug --no-daemon
```

**영구 적용 (선택사항)**:
```powershell
# 시스템 환경 변수로 등록
[System.Environment]::SetEnvironmentVariable("GRADLE_USER_HOME", "C:\gradle_cache_new", "User")
```

### ✅ 문제 2: settings.gradle 플러그인 경로

**해결법**: `providers.exec` 대신 상대 경로 하드코딩

**수정된 `android/settings.gradle`**:
```gradle
pluginManagement {
  // providers.exec 대신 상대 경로 직접 지정 (Windows Gradle 호환성)
  def reactNativeGradlePlugin = new File(rootDir, "../node_modules/@react-native/gradle-plugin").absolutePath
  includeBuild(reactNativeGradlePlugin)
  
  def expoPluginsPath = new File(rootDir, "../node_modules/expo-modules-autolinking/android/expo-gradle-plugin").absolutePath
  includeBuild(expoPluginsPath)
}
```

### ✅ 문제 3: Metro 모노레포 경로 충돌

**해결법**: `metro.config.js`에서 루트 node_modules 참조 제거

**수정된 `metro.config.js`**:
```javascript
const path = require('path');
const projectRoot = __dirname;
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(projectRoot);

// mobile-expo의 node_modules만 사용
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 워크스페이스 루트 참조 제거
config.watchFolders = [];

module.exports = config;
```

### ✅ 문제 4: gradle.properties 최적화

**추가된 설정**:
```properties
# Configuration cache 비활성화 (metadata.bin 문제 방지)
org.gradle.configuration-cache=false
org.gradle.unsafe.isolated-projects=false
```

---

## 적용된 수정사항

### 파일 변경 목록

| 파일 | 변경 내용 |
|------|----------|
| `android/settings.gradle` | `providers.exec` → 상대 경로 |
| `android/gradle.properties` | configuration-cache 비활성화 |
| `metro.config.js` | 루트 node_modules 참조 제거 |
| `.npmrc` (루트) | `legacy-peer-deps=true` 추가 |

### 환경 변수

| 변수 | 값 | 용도 |
|------|-----|------|
| `GRADLE_USER_HOME` | `C:\gradle_cache_new` | 손상된 캐시 우회 |

---

## 향후 빌드 가이드

### 일반 빌드 명령어

```powershell
# 1. 환경 변수 설정 (매 세션마다)
$env:GRADLE_USER_HOME = "C:\gradle_cache_new"

# 2. mobile-expo 디렉토리로 이동
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo

# 3. Android 빌드
cd android
.\gradlew.bat assembleDebug --no-daemon

# 4. APK 설치
adb install -r .\app\build\outputs\apk\debug\app-debug.apk

# 5. Metro 시작 (다른 터미널에서)
cd ..
npx expo start --dev-client
```

### APK 파일 위치
```
c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo\android\app\build\outputs\apk\debug\app-debug.apk
```

### 클린 빌드 (문제 발생 시)

```powershell
# 1. 모든 Java 프로세스 종료
taskkill /F /IM java.exe /T
taskkill /F /IM javaw.exe /T

# 2. 빌드 캐시 삭제
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo\android
Remove-Item -Recurse -Force build, app\build, .gradle -ErrorAction SilentlyContinue

# 3. Metro 캐시 삭제
cd ..
Remove-Item -Recurse -Force .expo, node_modules\.cache -ErrorAction SilentlyContinue

# 4. 새 캐시로 빌드
$env:GRADLE_USER_HOME = "C:\gradle_cache_new"
cd android
.\gradlew.bat clean assembleDebug --no-daemon
```

---

## 자주 발생하는 에러와 해결법

### 에러 1: `metadata.bin` 읽기 실패

```
Could not read workspace metadata from ...\metadata.bin
```

**해결법**:
```powershell
# 새 캐시 디렉토리 사용
$env:GRADLE_USER_HOME = "C:\gradle_cache_new"
.\gradlew.bat clean assembleDebug --no-daemon
```

### 에러 2: `Port 8081 is being used`

```
Port 8081 is being used by another process
```

**해결법**:
```powershell
# Node 프로세스 종료
Get-Process -Name "node" | Stop-Process -Force

# 또는 다른 포트 사용
npx expo start --dev-client --port 8082
```

### 에러 3: `UnableToResolveError`

```
Unable to resolve "...\node_modules\metro-runtime\..."
```

**해결법**:
```powershell
# Metro 캐시 초기화
npx expo start --dev-client --clear
```

### 에러 4: `Unresolved reference 'expo'`

```
Unresolved reference: expo
```

**해결법**:
```powershell
# android 폴더 재생성
npx expo prebuild --platform android --clean
```

### 에러 5: ADB 연결 실패

```
error: no devices/emulators found
```

**해결법**:
```powershell
# USB 디버깅 활성화 확인
adb devices

# ADB 서버 재시작
adb kill-server
adb start-server
adb devices
```

---

## 예방 조치

### 1. Gradle 데몬 비활성화 (권장)

`android/gradle.properties`에 추가:
```properties
org.gradle.daemon=false
```

### 2. 빌드 전 프로세스 정리 습관화

```powershell
# 빌드 전 항상 실행
taskkill /F /IM java.exe /T 2>$null
$env:GRADLE_USER_HOME = "C:\gradle_cache_new"
```

### 3. 기존 캐시 정리 (PC 재부팅 후)

```powershell
# PC 재부팅 후 손상된 캐시 삭제
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches\8.14.3"
```

---

## 버전 정보

| 구성 요소 | 버전 |
|----------|------|
| Expo SDK | 54.0.0 |
| React Native | 0.81.5 |
| React | 19.1.0 |
| Gradle | 8.14.3 |
| Kotlin | 2.1.20 |
| compileSdk | 36 |
| minSdk | 24 |
| targetSdk | 36 |
| JDK | 17 |

---

## 참고 링크

- [Expo Prebuild 문서](https://docs.expo.dev/workflow/prebuild/)
- [React Native Gradle Plugin](https://reactnative.dev/docs/build-speed)
- [Gradle 캐시 관리](https://docs.gradle.org/current/userguide/build_cache.html)

---

**문서 작성**: GitHub Copilot  
**최종 업데이트**: 2025년 12월 10일
