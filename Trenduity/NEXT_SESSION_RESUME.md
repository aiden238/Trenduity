# 다음 세션 재개 가이드 (2025년 12월 10일)

##  현재 상태 요약

###  완료된 작업 (2025-12-10)

#### Android 빌드 환경 복구
- **Gradle 캐시 손상 문제 해결**
  - 원인: Windows에서 `.gradle/caches/8.14.3/transforms/metadata.bin` 파일 손상
  - 해결: 새 캐시 디렉토리 `C:\gradle_cache_new` 사용
  - 환경변수: `\$env:GRADLE_USER_HOME = "C:\gradle_cache_new"`

- **settings.gradle 플러그인 경로 수정**
  - 원인: `providers.exec`가 Windows/Gradle 8.14.3에서 실패
  - 해결: 상대 경로 하드코딩으로 변경

- **Metro 모노레포 경로 충돌 해결**
  - 원인: `metro.config.js`가 루트 node_modules 참조
  - 해결: mobile-expo의 node_modules만 사용하도록 수정

- **APK 빌드 및 설치 성공**
  - APK 위치: `apps/mobile-expo/android/app/build/outputs/apk/debug/app-debug.apk`
  - 휴대폰: Galaxy S23 Ultra에 설치 완료
  - JS 번들 로드 완료 (1095 modules)
  - 앱 실행 성공 (로그인 화면 표시)
  - **OAuth 로그인 성공 확인** (Google 로그인  BFF 토큰 교환 완료)

###  수정된 파일 (2025-12-10)

| 파일 | 변경 내용 |
|------|----------|
| `apps/mobile-expo/android/settings.gradle` | 플러그인 경로 하드코딩 |
| `apps/mobile-expo/android/gradle.properties` | config-cache 비활성화 |
| `apps/mobile-expo/metro.config.js` | 모노레포 경로 제거 |
| `.npmrc` | legacy-peer-deps 추가 |
| `docs/TROUBLESHOOTING_ANDROID_BUILD.md` | 트러블슈팅 문서 생성 |

---

##  다음 세션 시작 시 명령어

### 1. 환경 확인

```powershell
# 브랜치 확인
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
git branch --show-current  # feature/v2-major-updates 여야 함

# 변경사항 확인
git status --short

# Docker 상태 확인 (BFF 필요 시)
docker ps
```

### 2. 앱 실행 (개발 모드)

```powershell
# 터미널 1: Metro 시작
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
npx expo start --dev-client

# 터미널 2: 앱 실행 (이미 설치된 경우)
adb shell am start -n com.seniorlearning.app/.MainActivity
```

### 3. 앱 재빌드 (코드 변경 시)

```powershell
# Gradle 환경 설정 (필수!)
\$env:GRADLE_USER_HOME = "C:\gradle_cache_new"

# 빌드
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo\android
.\gradlew.bat assembleDebug --no-daemon

# 설치
adb install -r .\app\build\outputs\apk\debug\app-debug.apk
```

---

##  다음 작업 후보

### 우선순위 높음
1. **홈 화면 기능 테스트** - OAuth 로그인 이미 성공, 메인 화면 동작 확인
2. **BFF 연동 확인** - `https://trenduity-bff.onrender.com` 연결 상태 확인
3. **오늘의 카드 플로우** - 카드 조회/완료 기능 테스트

### 우선순위 중간
4. **A11y 모드 테스트** - Normal/Easy/Ultra 모드 전환 확인
5. **TTS 기능 테스트** - expo-speech 모듈 동작 확인
6. **오프라인 동작** - AsyncStorage 캐싱 확인

### 우선순위 낮음
7. **Release 빌드** - 배포용 APK 생성
8. **iOS 빌드** - macOS 환경에서 iOS 빌드 테스트
9. **E2E 테스트** - Detox 또는 Maestro 설정

---

##  알려진 이슈

### 1. Legacy Architecture 경고
```
WARN: The app is running using the Legacy Architecture.
```
- **상태**: 무시 가능 (New Architecture는 Expo SDK 55+에서 안정화 예정)
- **해결**: `app.json`의 `newArchEnabled: false` 유지

### 2. Gradle 캐시 디렉토리
- **현재**: `C:\gradle_cache_new` 사용 중
- **주의**: 매 세션마다 `\$env:GRADLE_USER_HOME` 설정 필요
- **영구 해결**: 시스템 환경 변수로 등록하거나 PC 재부팅 후 기존 캐시 삭제

### 3. 포트 충돌
- Metro 기본 포트 8081
- 충돌 시 `--port 8082` 옵션 사용

---

##  기술 스택 (2025년 12월 10일 기준)

### Core Dependencies
```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-constants": "~18.0.0"
}
```

### Android Build
```
Gradle: 8.14.3
Kotlin: 2.1.20
compileSdk: 36
minSdk: 24
targetSdk: 36
JDK: 17
```

---

##  참고 문서

- **트러블슈팅**: `docs/TROUBLESHOOTING_ANDROID_BUILD.md` (신규)
- **아키텍처**: `docs/PLAN/01-2-architecture-overview.md`
- **구현 규칙**: `docs/IMPLEMENT/01-implementation-rules.md`
- **Copilot 지침**: `.github/copilot-instructions.md`

---

##  다음 세션 프롬프트 예시

```
이전 세션에서 Android 빌드 환경 복구를 완료했습니다.

현재 상태:
- 브랜치: feature/v2-major-updates
- APK 빌드 및 설치 완료
- Metro 번들러로 앱 실행 성공
- Google OAuth 로그인 성공 (BFF 토큰 교환 완료)

다음 작업을 진행해주세요:
1. [원하는 작업 내용]

참고 문서:
- docs/TROUBLESHOOTING_ANDROID_BUILD.md (빌드 트러블슈팅)
- NEXT_SESSION_RESUME.md (현재 상태)
```

---

##  이전 세션 히스토리

### 2025-12-04: PlatformConstants 에러 해결
- `expo-linear-gradient`  `react-native-linear-gradient` 교체
- Expo SDK 54 호환 패키지 버전 업데이트

### 2025-12-10: Android 빌드 환경 복구
- Gradle 캐시 손상  새 캐시 디렉토리 해결
- Metro 모노레포 경로 충돌 해결
- APK 빌드/설치/실행 성공

---

**마지막 업데이트**: 2025년 12월 10일 07:15
**작성자**: GitHub Copilot
