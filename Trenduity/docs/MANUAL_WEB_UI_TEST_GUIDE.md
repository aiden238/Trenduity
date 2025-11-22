# 웹 UI E2E 테스트 수동 실행 가이드

> **작성일**: 2025년 11월 21일  
> **목적**: Family Link 웹 UI E2E 테스트를 수동으로 실행하는 방법 안내  
> **이유**: PowerShell 터미널 환경에서 Playwright가 Next.js 서버를 종료시키는 제약 회피

---

## 🎯 테스트 목표

**테스트 대상**: `e2e/scenarios/family-link.spec.ts` 웹 UI 테스트 (2개)
- ✅ 7. 대시보드 렌더링 확인 (웹)
- ✅ 8. 멤버 목록 표시 확인 (웹)

**현재 상태**: API 테스트 6/6 통과, UI 테스트 0/2 (환경 제약으로 스킵)

---

## 📋 방법 1: Playwright E2E 테스트 (권장)

### 사전 조건 확인

```powershell
# BFF 서버 상태 확인
curl http://localhost:8002/health
# 예상: {"status":"healthy","version":"0.1.0","env":"development"}

# Next.js 서버 상태 확인
curl http://localhost:3000/members
# 예상: HTTP 200 OK (페이지 내용 반환)
```

### 1단계: 웹 서버 시작

**터미널 1** (또는 현재 터미널):
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\web-next
npm run dev
```

**확인 사항**:
- ✅ `Ready in XXXXms` 메시지 표시
- ✅ `Local: http://localhost:3000` 출력
- ⚠️ **이 터미널은 닫지 말고 실행 상태 유지**

```
> web-next@0.1.0 dev
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000

 ✓ Ready in 1234ms
```

### 2단계: 새 터미널 열기

**VS Code에서**:
- **방법 A**: `Ctrl + Shift + ` ` (백틱 키)
- **방법 B**: 상단 메뉴 `터미널` → `새 터미널`
- **방법 C**: 터미널 패널 우측 상단 `+` 버튼 클릭

**Windows Terminal 사용 시**:
- `Ctrl + Shift + T` (새 탭)

### 3단계: E2E 테스트 실행

**터미널 2** (새로 연 터미널):
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
npx playwright test family-link.spec.ts --grep "웹 UI" --reporter=list
```

### 예상 결과

```
Running 2 tests using 1 worker

  ✓ 가족 연동 플로우 › 웹 UI 테스트 › 7. 대시보드 렌더링 확인 (웹) (1523ms)
  ✓ 가족 연동 플로우 › 웹 UI 테스트 › 8. 멤버 목록 표시 확인 (웹) (876ms)

  2 passed (3s)
```

### 4단계: 테스트 완료 후 정리

```powershell
# 터미널 1 (웹 서버)로 돌아가서
Ctrl + C  # 서버 중지

# 터미널 2는 이미 종료됨 (테스트 완료 후 자동 종료)
```

---

## 📋 방법 2: 브라우저 수동 검증 (간편)

Playwright 없이 브라우저에서 직접 확인하는 방법입니다.

### 1단계: 웹 서버 시작

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\web-next
npm run dev
```

### 2단계: 브라우저에서 확인

**Chrome/Edge/Firefox 열기**:
- URL: http://localhost:3000/members

### 3단계: 시각적 검증 체크리스트

#### ✅ 대시보드 렌더링 (테스트 7번)
- [ ] **3-column 대시보드** 표시됨
  - 전체 회원
  - 활동 중인 회원 (최근 7일 활동)
  - 읽기 권한 있는 회원
- [ ] 각 카드에 **숫자**가 표시됨
- [ ] 레이아웃이 **반응형**으로 작동 (창 크기 조절 시)

#### ✅ 멤버 목록 표시 (테스트 8번)
- [ ] **멤버 카드** 목록이 표시됨
- [ ] 각 카드에 **이름**이 표시됨
- [ ] 각 카드에 **활동 상태** 표시
  - 🟢 활동 중 (최근 7일)
  - ⚪ 비활동
- [ ] 각 카드에 **권한 배지** 표시
  - 📖 읽기 권한
  - 🔔 알림 권한
- [ ] **마지막 활동 시간** 표시 (예: "3일 전")
- [ ] 카드가 **grid 레이아웃**으로 정렬됨

#### ✅ 사용 팁 섹션
- [ ] **파란색 배경** 섹션 표시
- [ ] 💡 아이콘과 "사용 팁" 제목
- [ ] 3개의 팁 항목 (✓ 체크 마크)

### 4단계: 반응형 테스트 (선택)

**브라우저 개발자 도구**:
- `F12` 키 → Device Toolbar (`Ctrl+Shift+M`)
- 또는 우클릭 → 검사 → Device Toolbar 아이콘

**테스트할 화면 크기**:
- **Mobile S (320px)**: 1-column grid
- **Tablet (768px)**: 2-column grid
- **Desktop (1024px+)**: 3-column grid

### 5단계: 서버 종료

```powershell
# 웹 서버 터미널에서
Ctrl + C
```

---

## 🚨 문제 해결

### ❌ 서버가 시작 안 됨

```powershell
# 포트 3000이 이미 사용 중일 수 있음
netstat -ano | findstr ":3000"

# 프로세스 종료 (PID 확인 후)
taskkill /F /PID <PID번호>

# 다시 시도
npm run dev
```

### ❌ "Cannot find module" 에러

```powershell
# 의존성 재설치
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\web-next
npm install

# 다시 시도
npm run dev
```

### ❌ Playwright 테스트 실패: "ERR_CONNECTION_REFUSED"

**원인**: 웹 서버가 시작되지 않았거나 포트가 다름

**해결**:
1. 터미널 1에서 `npm run dev` 실행 확인
2. 브라우저에서 http://localhost:3000/members 접속 테스트
3. 접속 가능하면 터미널 2에서 Playwright 재실행

### ❌ Playwright 테스트 실패: "Timeout"

**원인**: 페이지 로딩이 느림

**해결**:
```powershell
# 타임아웃 증가 (60초)
npx playwright test family-link.spec.ts --grep "웹 UI" --timeout=60000
```

---

## 📊 테스트 결과 기록

### 수동 테스트 결과표

| 테스트 항목 | 상태 | 실행 시간 | 비고 |
|-----------|------|----------|------|
| 7. 대시보드 렌더링 확인 | ⬜ | - | - |
| 8. 멤버 목록 표시 확인 | ⬜ | - | - |

**체크 기호**:
- ✅ 통과
- ❌ 실패
- ⚠️ 부분 통과
- ⬜ 미실행

### 실행 예시 (작성 완료 후)

```
✅ 테스트 7: 대시보드 렌더링 확인 - 2025-11-21 14:30 (성공)
   - 3-column 대시보드 표시됨
   - 숫자 데이터 정상 표시
   - 반응형 레이아웃 작동 확인

✅ 테스트 8: 멤버 목록 표시 확인 - 2025-11-21 14:32 (성공)
   - 멤버 카드 3개 표시
   - 활동 상태 배지 정상 (🟢, ⚪)
   - 권한 배지 정상 (📖, 🔔)
   - 마지막 활동 시간 표시
```

---

## 🔍 추가 검증 (선택)

### 네트워크 탭 확인

**브라우저 개발자 도구** (`F12`):
- Network 탭 열기
- 페이지 새로고침 (`F5`)

**확인 사항**:
- ✅ `http://localhost:3000/members` - 200 OK
- ✅ JavaScript/CSS 파일 로드 성공
- ⚠️ API 호출 에러 없음

### 콘솔 에러 확인

**Console 탭**:
- 에러 메시지 없어야 함
- Warning은 무시 가능 (React 개발 모드)

---

## 📝 CI/CD 통합 (향후)

GitHub Actions에서는 자동화 가능합니다:

```yaml
# .github/workflows/e2e-web-ui.yml
name: Web UI E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start Next.js server
        run: |
          cd apps/web-next
          npm run dev &
          npx wait-on http://localhost:3000
        
      - name: Run Playwright tests
        run: npx playwright test family-link.spec.ts --grep "웹 UI"
```

**Unix 쉘**에서는 `&` 백그라운드 실행이 정상 작동합니다.

---

## 🎓 참고 문서

- **프로젝트 문서**: `docs/WORK_PROGRESS_TRACKER.md`
- **구현 상세**: `docs/OPTION_AB_COMPLETION_REPORT.md`
- **E2E 테스트**: `e2e/scenarios/family-link.spec.ts`
- **Members 페이지**: `apps/web-next/app/members/page.tsx`

---

**최종 업데이트**: 2025년 11월 21일  
**작성자**: AI Agent (GitHub Copilot)  
**버전**: 1.0
