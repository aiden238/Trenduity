# 다음 세션 재개 가이드 (2025년 12월 4일)

## 📍 현재 상태 요약

### ✅ 완료된 작업
- **PlatformConstants 에러 해결 완료**
  - 원인: `expo-linear-gradient@14.0.2` → `expo@49.0.23` → `expo-constants@14.4.2` (SDK 54와 충돌)
  - 해결: `react-native-linear-gradient@2.8.3`로 교체 (Expo 의존성 제거)
  - 검증: `npm list expo-constants` → 18.0.10만 존재 (14.4.2 완전 제거)

- **Expo SDK 54 버전 호환성 수정 완료**
  - `expo-haptics`: 14.0.1 → **15.0.7** (SDK 54 호환)
  - `expo-speech`: 13.0.1 → **14.0.7** (SDK 54 호환)
  - `expo-status-bar`: 2.0.1 → **3.0.8** (SDK 54 호환)
  - `npx expo install --fix` 명령어로 자동 수정됨

- **UI 컴포넌트 업데이트 완료**
  - `packages/ui/src/components/FloatingActionButton.tsx`
  - `packages/ui/src/components/EmptyState.tsx`
  - `packages/ui/src/components/ErrorState.tsx`
  - `packages/ui/src/components/Spinner.tsx`
  - `packages/ui/src/components/GradientCard.tsx`
  - 모두 `expo-linear-gradient` → `react-native-linear-gradient`로 import 변경

- **의존성 정리 완료**
  - 전체 `node_modules` 재설치 (root, mobile-expo, packages/ui)
  - Metro 번들러 캐시 완전 삭제 (`.expo`, `node_modules/.cache`)
  - 취약점 감소: 29개 → **5개** (83% 개선)
  - 남은 5개 취약점: `ip` 패키지 (개발 도구 전용, 프로덕션 영향 없음)

---

## 🔧 현재 기술 스택 (2025년 12월 4일 기준)

### Core Dependencies
```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-constants": "~18.0.0"
}
```

### Expo SDK 54 호환 패키지
```json
{
  "expo-haptics": "~15.0.7",
  "expo-speech": "~14.0.7",
  "expo-status-bar": "~3.0.8"
}
```

### Gradient 라이브러리
```json
{
  "react-native-linear-gradient": "^2.8.3"
}
```
> ⚠️ **중요**: `expo-linear-gradient`는 제거됨. 절대 재설치하지 말 것!

---

## ⚠️ 다음 세션 시작 시 필수 확인 사항

### 1️⃣ Expo 서버 재시작 필요 (최우선!)
```powershell
# 기존 Node 프로세스 종료
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep 3

# 깨끗한 캐시로 Expo 시작
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
npx expo start --clear --reset-cache
```

**이유**: `npx expo install --fix`로 3개 패키지 버전이 업데이트되었으므로, 새 버전을 적용하려면 서버 재시작 필수.

### 2️⃣ 실제 디바이스 테스트 필요
```
현재 상태: 코드 수정 완료, 의존성 수정 완료, 서버 재시작 대기 중
다음 단계: Expo Go 앱에서 QR 코드 스캔 후 PlatformConstants 에러 해결 여부 확인
```

**예상 결과**:
- ✅ 성공 시: 앱이 정상적으로 로드되며 에러 없음
- ❌ 실패 시: Metro 번들러 로그 확인 필요 (`npx expo start` 터미널 출력)

### 3️⃣ 버전 최종 검증 (선택적)
```powershell
# expo-constants 단일 버전 확인
npm list expo-constants --all

# 업데이트된 패키지 확인
npm list expo-haptics expo-speech expo-status-bar react-native-linear-gradient --depth=0
```

**예상 출력**:
```
mobile-expo@0.1.0
├── expo-constants@18.0.10
├── expo-haptics@15.0.7
├── expo-speech@14.0.7
├── expo-status-bar@3.0.8
└── react-native-linear-gradient@2.8.3
```

---

## 🚫 주의사항 (절대 하지 말 것!)

### ❌ expo-linear-gradient 재설치 금지
```powershell
# 이 명령어 절대 실행 금지!
npm install expo-linear-gradient
npx expo install expo-linear-gradient
```
**이유**: 다시 `expo@49.0.23` → `expo-constants@14.4.2` 충돌 발생

### ❌ Expo SDK 버전 수동 변경 금지
```json
// package.json에서 이 버전들을 절대 수동 수정하지 말 것!
{
  "expo-haptics": "~14.0.0",  // 잘못된 버전!
  "expo-speech": "~13.0.0",   // 잘못된 버전!
  "expo-status-bar": "~2.0.0" // 잘못된 버전!
}
```
**이유**: SDK 54와 호환되지 않음. Expo CLI의 `--fix` 플래그 사용 권장.

### ❌ 선택적 node_modules 삭제 금지
```powershell
# 이렇게 특정 패키지만 삭제하면 의존성 트리 깨짐
Remove-Item -Recurse -Force node_modules/expo-constants
```
**올바른 방법**: 전체 재설치 (`Remove-Item -Recurse node_modules; npm install`)

---

## 🔍 문제 발생 시 디버깅 체크리스트

### Case 1: PlatformConstants 에러 재발 시
```powershell
# 1. expo-constants 버전 확인 (18.0.10만 있어야 함)
npm list expo-constants --all

# 2. expo@49 의존성 존재 여부 확인 (아무것도 없어야 함)
npm list expo --all | Select-String "49.0"

# 3. Metro 캐시 완전 삭제
Remove-Item -Recurse -Force .expo, node_modules\.cache
npx expo start --clear --reset-cache
```

### Case 2: LinearGradient 컴포넌트 에러 시
```typescript
// 올바른 import (default export)
import LinearGradient from 'react-native-linear-gradient';

// ❌ 잘못된 import (named export)
import { LinearGradient } from 'expo-linear-gradient';
```

**수정한 파일 목록**:
- `packages/ui/src/components/FloatingActionButton.tsx`
- `packages/ui/src/components/EmptyState.tsx`
- `packages/ui/src/components/ErrorState.tsx`
- `packages/ui/src/components/Spinner.tsx`
- `packages/ui/src/components/GradientCard.tsx`

### Case 3: Expo 버전 경고 발생 시
```powershell
# Expo CLI가 자동으로 올바른 버전 설치
npx expo install --fix
```

---

## 📋 다음 세션 작업 순서 (권장)

### Step 1: 환경 확인 (2분)
```powershell
# 1. 현재 디렉토리 확인
Get-Location

# 2. Git 상태 확인
git status --short

# 3. Expo 서버 상태 확인 (실행 중이면 종료)
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### Step 2: Expo 서버 재시작 (3분)
```powershell
# 1. 기존 프로세스 종료
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep 3

# 2. mobile-expo 디렉토리로 이동
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo

# 3. 깨끗한 캐시로 시작
npx expo start --clear --reset-cache
```

**예상 출력**:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Step 3: 실제 디바이스 테스트 (5분)
1. 휴대폰에서 Expo Go 앱 열기
2. QR 코드 스캔
3. 앱 로딩 확인
4. **PlatformConstants 에러 없이 정상 작동하는지 확인**

**성공 기준**:
- ✅ 홈 화면 정상 표시
- ✅ 그라디언트 효과 정상 표시 (FloatingActionButton, GradientCard 등)
- ✅ TurboModuleRegistry 에러 없음

### Step 4: 최종 검증 (2분)
```powershell
# 1. 버전 확인
npm list expo-constants expo-haptics expo-speech expo-status-bar --depth=0

# 2. 취약점 확인 (5개여야 함)
npm audit --production
```

---

## 📊 완료 여부 체크리스트

다음 세션에서 아래 항목들을 확인하세요:

- [ ] Expo 서버 재시작 완료 (`npx expo start --clear --reset-cache`)
- [ ] 실제 디바이스에서 앱 정상 작동 확인
- [ ] PlatformConstants 에러 없음 확인
- [ ] LinearGradient 컴포넌트 정상 렌더링 확인
- [ ] `expo-constants@18.0.10` 단일 버전 확인
- [ ] `expo-haptics@15.0.7` 버전 확인
- [ ] `expo-speech@14.0.7` 버전 확인
- [ ] `expo-status-bar@3.0.8` 버전 확인
- [ ] 취약점 5개 (dev-only) 확인

---

## 🎯 작업 완료 시 다음 단계

현재 **SCAFFOLD 단계** 완료, **IMPLEMENT 단계** 진행 중 (65%)

### 우선순위 작업:
1. **GamificationService 포인트 로직 구현** (`services/bff-fastapi/app/services/gamification_service.py`)
2. **카드 완료 플로우 통합 테스트** (BFF → Supabase 쓰기 검증)
3. **A11y 모드 전환 UI/UX 개선** (`apps/mobile-expo/src/contexts/A11yContext.tsx`)
4. **시드 데이터로 전체 플로우 검증** (`scripts/seed_data.py`)

### 참고 문서:
- 구현 규칙: `docs/IMPLEMENT/01-implementation-rules.md`
- 아키텍처 개요: `docs/PLAN/01-2-architecture-overview.md`
- 일일 카드 게임화: `docs/IMPLEMENT/02-daily-card-gamification.md`

---

## 📞 긴급 문제 발생 시

### 문제: PlatformConstants 에러 재발
```powershell
# 해결: expo-constants 버전 충돌 재확인
npm list expo-constants --all

# 14.4.2 발견 시 → 의존성 트리 추적
npm list --all | Select-String "expo@49"
```

### 문제: LinearGradient 렌더링 안 됨
```powershell
# 해결: react-native-linear-gradient 재설치
cd apps/mobile-expo
npm uninstall react-native-linear-gradient
npm install react-native-linear-gradient@^2.8.3
```

### 문제: Metro 번들러 충돌
```powershell
# 해결: 완전 초기화
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo, node_modules\.cache
npx expo start --clear --reset-cache
```

---

## 🔗 관련 문서

- **Copilot 지침서**: `.github/copilot-instructions.md`
- **ADR (아키텍처 결정 기록)**: `.github/ADR.md`
- **빠른 명령어**: `.github/QUICK_COMMANDS.md`
- **코드 템플릿**: `.github/CODE_TEMPLATES.md`

---

**최종 업데이트**: 2025년 12월 4일  
**작성자**: GitHub Copilot  
**다음 세션 담당자**: 위 체크리스트 따라 Expo 서버 재시작 후 실제 디바이스 테스트 진행 필수!
