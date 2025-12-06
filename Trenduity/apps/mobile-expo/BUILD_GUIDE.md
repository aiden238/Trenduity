# 📱 Mobile App 빌드 가이드

> **⚠️ 중요: 항상 EAS Build를 사용하세요!**

## 🚨 절대 하지 말 것

```powershell
# ❌ 로컬 Gradle 빌드 금지 - 서명 불일치 발생!
.\gradlew.bat assembleDebug
.\gradlew.bat installDebug
npx expo run:android

# ❌ 왜 금지인가?
# - 로컬 빌드는 프로젝트의 debug.keystore 사용
# - EAS 빌드는 Expo 서버의 키스토어 사용
# - 서명이 다르면 기존 앱 위에 업데이트 불가능!
```

## ✅ 올바른 빌드 방법

### 개발용 빌드 (Development)
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
eas build --profile development --platform android
```

### 프리뷰 빌드 (Preview/Internal Testing)
```powershell
eas build --profile preview --platform android
```

### 프로덕션 빌드 (Production/Release)
```powershell
eas build --profile production --platform android
```

## 📋 빌드 전 체크리스트

1. **변경사항 커밋 및 푸시**
   ```powershell
   git add .
   git commit -m "feat: 변경 내용"
   git push
   ```

2. **EAS 로그인 확인**
   ```powershell
   eas whoami
   # 로그인 안 되어 있으면: eas login
   ```

3. **package.json 확인**
   - `@legendapp/motion` 없어야 함 (react-native-reanimated 충돌)
   - `react-native-reanimated` 직접 설치 없어야 함

4. **gradle.properties 확인**
   ```properties
   newArchEnabled=false  # 반드시 false
   ```

## 🔧 빌드 후 설치

### 방법 1: QR 코드 (권장)
EAS 빌드 완료 후 터미널에 표시되는 QR 코드 스캔

### 방법 2: 링크에서 직접 다운로드
```
https://expo.dev/accounts/[계정]/projects/[프로젝트]/builds/[빌드ID]
```

### 방법 3: ADB로 설치
```powershell
# APK 다운로드 후
adb -s R3CW4000P4W install path/to/app.apk
```

## 🐛 문제 해결

### "서명 불일치" 오류가 발생하면
```powershell
# 디바이스에서 기존 앱 삭제
adb -s R3CW4000P4W uninstall com.seniorlearning.app

# 그 후 EAS 빌드로 재설치
```

### "react-native-reanimated New Architecture" 오류
```powershell
# @legendapp/motion이 설치되어 있는지 확인
npm list react-native-reanimated

# 의존성 체인에 있으면 해당 패키지 제거
```

## 📁 관련 파일

| 파일 | 용도 |
|------|------|
| `eas.json` | EAS 빌드 프로필 설정 |
| `app.json` | Expo 앱 설정 |
| `android/gradle.properties` | Android 빌드 설정 |

## 🔑 키스토어 관리

```powershell
# EAS 키스토어 정보 확인
eas credentials --platform android

# 키스토어 다운로드 (백업용)
eas credentials --platform android
# → "Download Keystore" 선택
```

---

**마지막 업데이트**: 2025-12-06
**작성 이유**: 로컬 Gradle 빌드로 인한 서명 불일치 문제 방지
