# 세션 재개 문서 - 2025-12-08 인증 수정

> **상태**: 🔴 진행 중 (외출로 중단)  
> **재개 시**: USB 디버깅 연결 후 프롬프트 입력

---

## 🎯 현재 문제점

### 1. ❌ Network Request Failed (일반 로그인)
- **증상**: 이메일/비밀번호 로그인 시 "Network Request Failed" 에러
- **원인 추정**: BFF 서버 연결 문제 또는 타임아웃
- **확인 필요**: 
  - BFF 서버 상태 (Render 슬립 모드?)
  - `EXPO_PUBLIC_BFF_API_URL` 환경변수 로드 확인

### 2. ❌ 구글 로그인 무한 로딩
- **증상**: 계정 선택 → 본인인증 → 앱으로 돌아오지만 무한 "로그인중..."
- **원인 추정**: 딥링크 콜백이 앱으로 전달되지 않거나, 처리 실패
- **확인 필요**:
  - `trenduity://auth/callback` 딥링크 설정
  - Supabase OAuth redirect URL 설정

---

## ✅ 완료된 수정사항

### AuthContext.tsx 변경 (Linking API 수정)
```typescript
// 변경 전 (deprecated)
Linking.removeEventListener('url', handleUrl);

// 변경 후 (새 API)
const subscription = Linking.addEventListener('url', handleUrl);
subscription.remove(); // cleanup
```

### BFF URL 설정 개선
```typescript
// 환경변수 우선순위 명확화
const getBffUrl = (): string => {
  if (process.env.EXPO_PUBLIC_BFF_API_URL) return process.env.EXPO_PUBLIC_BFF_API_URL;
  // ... fallback
};
```

---

## 📋 재개 시 작업 순서

### 1단계: 환경 확인
```powershell
# USB 디버깅 연결
adb devices

# BFF 서버 상태 확인
curl https://trenduity-bff.onrender.com/health

# Metro 시작
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
npx expo start --clear
```

### 2단계: Network Request Failed 디버깅
- Metro 로그에서 BFF URL 확인 (`[AuthContext] 🔐 Attempting login to:`)
- BFF 서버가 슬립 상태면 깨우기 (첫 요청은 느림)
- 타임아웃 늘리기 검토

### 3단계: 구글 로그인 디버깅
- 딥링크 수신 로그 확인 (`[AuthContext] 📥 OAuth redirect URL received:`)
- Supabase 대시보드에서 Redirect URL 설정 확인
- app.json의 `scheme: "trenduity"` 확인

---

## 📁 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `apps/mobile-expo/src/contexts/AuthContext.tsx` | Linking API 수정, BFF URL 설정 개선, 로깅 추가 |

---

## 🔧 환경 정보

- **Expo SDK**: ~54.0.0
- **React Native**: 0.81.5
- **BFF URL**: `https://trenduity-bff.onrender.com`
- **Supabase URL**: `https://onnthandrqutdmvwnilf.supabase.co`

---

**다음 프롬프트 예시**:
> "돌아왔어. USB 디버깅 연결하고 인증 문제 계속 수정하자"

