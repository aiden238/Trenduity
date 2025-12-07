# 🚨 복구 가이드 (Recovery Guide)

> 의존성 문제나 코드 꼬임 발생 시 이전 안정 상태로 복구하는 방법

## 📍 안정 분기점 (Stable Checkpoints)

| 날짜 | 브랜치명 | 커밋 해시 | 설명 |
|------|----------|-----------|------|
| 2024-12-08 | `stable-2024-12-08` | `8360ad1` | React 중복 문제 해결, 앱 정상 작동 |

---

## 🔧 복구 절차

### 1. 코드 복구
```powershell
# 현재 변경 사항 임시 저장 (필요시)
git stash

# 안정 브랜치로 복구
git checkout stable-2024-12-08

# 또는 main에서 특정 커밋으로 리셋
git reset --hard 8360ad1
```

### 2. 의존성 완전 재설치
```powershell
# 루트 디렉토리에서
cd c:\AIDEN_PROJECT\Trenduity\Trenduity

# node_modules 삭제
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# 재설치
npm install

# Metro 캐시 클리어 후 시작
cd apps\mobile-expo
npx expo start --dev-client --clear
```

### 3. 디바이스 재연결
```powershell
adb -s R3CW4000P4W reverse --remove-all
adb -s R3CW4000P4W reverse tcp:8081 tcp:8081
```

---

## ⚠️ 알려진 리스크 패키지/의존성

| 패키지 | 버전 | 문제 | 해결 방법 |
|--------|------|------|----------|
| `react` | 중복 설치 | "Invalid hook call" 에러, 검은 화면 | node_modules 완전 삭제 후 재설치 |
| `react-native-safe-area-context` | - | 네이티브 모듈 이슈로 검은 화면 (dev-client 빌드 필요) | 새 dev-client 빌드 필요 |
| `use-latest-callback` | - | esm.mjs 파일 없음 경고 | 무시 가능 (fallback 작동) |
| `@react-navigation/*` | 중첩 node_modules | React 중복 인스턴스 발생 가능 | 루트에서 npm install로 호이스팅 |

---

## 🔴 증상별 빠른 진단

### 검은 화면 (Black Screen)
1. **React 중복**: `Invalid hook call` 에러 → node_modules 재설치
2. **SafeAreaProvider 문제**: SafeAreaProvider 없이 테스트 → 새 빌드 필요
3. **네이티브 모듈 누락**: dev-client 빌드에 포함 안 됨 → EAS 재빌드

### NaN 에러 (스타일 관련)
- `spacing` 객체를 숫자로 사용 → `spacing.md`, `spacing.sm` 등으로 수정

### Metro 연결 안 됨
```powershell
# Port forwarding 확인
adb -s R3CW4000P4W reverse --list

# 없으면 재설정
adb -s R3CW4000P4W reverse tcp:8081 tcp:8081
```

---

## 📝 복구 로그

### 2024-12-08
- **문제**: 검은 화면, "Invalid hook call" 에러
- **원인**: 모노레포에서 React 중복 설치 (루트 + apps/mobile-expo)
- **해결**: 
  1. 루트 node_modules 삭제 후 재설치
  2. AppHeader.tsx에서 `spacing` → `spacing.md` 수정
- **결과**: 앱 정상 작동

---

## 🔄 복구 체크리스트

복구 후 확인할 항목:

- [ ] Metro 시작됨 (`npx expo start --dev-client`)
- [ ] 디바이스 연결됨 (`adb devices`)
- [ ] Port forwarding 설정됨
- [ ] Splash 화면 표시됨 (파란 배경 + 🎓)
- [ ] Login 화면으로 전환됨
- [ ] 터미널에 에러 없음

---

**최종 업데이트**: 2024-12-08  
**안정 버전**: `stable-2024-12-08` (커밋: `8360ad1`)
