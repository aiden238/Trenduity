# TEST - Testing Strategy & Implementation

> **목적**: MVP 앱의 **품질 보증 및 회귀 방지**를 위한 테스트 전략  
> **대상 독자**: 개발자, QA, DevOps  
> **전제**: PLAN/SCAFFOLD/IMPLEMENT/SEED 단계 완료, 빌드 가능한 상태

---

## 📋 개요

TEST 단계는 **핵심 기능의 정확성 및 시니어 친화적 제약사항**을 검증합니다.

**핵심 목표**:
- ✅ **Unit Tests**: 순수 로직 (Voice Parser, Scam Checker, Gamification)
- 🔌 **Integration Tests**: BFF API 엔드포인트
- 🎨 **Component Tests**: React Native/Next.js 컴포넌트
- 🌐 **E2E Smoke Tests**: 전체 플로우 (선택사항)
- ♿ **A11y Checks**: 접근성 모드 검증
- 🤖 **CI Integration**: 자동화된 테스트 실행

**원칙**:
- 외부 API 의존 없음 (mocking 사용)
- Deterministic (재실행 시 동일 결과)
- Flakiness 최소화

---

## 📚 문서 구조

### [01. BFF Unit Tests](./01-bff-unit-tests.md)
**Python/FastAPI 테스트 (Pytest)**

- Voice Intent Parser 테스트
  - 한국어 문장 → intent/slots 매핑
  - Edge cases (불명확한 문장)
- Scam Checker 테스트
  - 사기 패턴 탐지 (danger/warn/safe)
- Gamification Rules 테스트
  - 포인트/스트릭 계산 로직
- API Endpoint 테스트
  - `/v1/cards/*`, `/v1/scam/check`, `/v1/insights`, `/v1/qna`
  - TestClient 사용, 200 응답 및 JSON 검증

**실행**:
```bash
cd apps/bff-fastapi
pytest
```

### [02. DTO/Schema Tests](./02-dto-schema-tests.md)
**TypeScript Zod Schema 테스트 (Vitest/Jest)**

- Zod 스키마 검증
  - 유효한 payload → parse 성공
  - 필수 필드 누락 → parse 실패
- BFF 응답 형태 일치성 검증
- Type safety 보장

**실행**:
```bash
cd packages/types
npm test
```

### [03. Component Tests](./03-component-tests.md)
**React Testing Library 테스트**

- Mobile (React Native)
  - Daily Card 컴포넌트 렌더링
  - Quiz 상호작용
  - VoiceOverlay intent 확인
- Web (Next.js)
  - Dashboard 컴포넌트 렌더링
  - 통계 표시

**실행**:
```bash
# Mobile
cd apps/mobile-rn
npm test

# Web
cd apps/web-next
npm test
```

### [04. E2E Smoke Tests](./04-e2e-smoke-tests.md)
**Playwright 엔드투엔드 테스트 (선택사항)**

- Web 대시보드 접속 테스트
- 주요 화면 렌더링 확인
- Mobile 시뮬레이터 홈 스크린 (선택)

**실행**:
```bash
npx playwright test
```

### [05. A11y Checks](./05-a11y-checks.md)
**접근성 검증**

- Web: axe/Lighthouse CI
- Mobile: A11y Context 모드 테스트 (normal/easy/ultra)
- 폰트 크기/라인 높이 검증

**실행**:
```bash
# Web
npm run test:a11y

# Mobile
npm test -- A11yContext.test.tsx
```

### [06. CI Integration](./06-ci-integration.md)
**GitHub Actions 워크플로**

- `.github/workflows/ci.yml` 설정
- Lint (ESLint/Prettier)
- Test (JS/TS + Python)
- PR 머지 전 필수 통과

**자동 실행**: PR 생성/업데이트 시

---

## 🎯 테스트 실행 순서

### 로컬 개발 시

```bash
# 1. 린트 검사
pnpm lint

# 2. TypeScript 타입 체크
pnpm typecheck

# 3. 유닛 테스트 (전체)
pnpm test

# 4. BFF 테스트
cd apps/bff-fastapi
pytest

# 5. 접근성 테스트
pnpm test:a11y

# 6. E2E 테스트 (선택)
npx playwright test
```

### CI 환경

```bash
# GitHub Actions에서 자동 실행
# .github/workflows/ci.yml 참조
```

---

## ✅ 테스트 커버리지 목표

### 필수 커버리지
- [ ] Voice Intent Parser: 6가지 intent 각 3개 케이스
- [ ] Scam Checker: danger/warn/safe 각 5개 케이스
- [ ] Gamification: 포인트/스트릭 10개 케이스
- [ ] BFF Endpoints: 주요 8개 엔드포인트
- [ ] Zod Schemas: 모든 DTO 검증
- [ ] A11y Context: 3가지 모드 테스트

### 선택 커버리지
- [ ] Component Tests: 주요 5개 컴포넌트
- [ ] E2E Tests: 2-3개 핵심 플로우
- [ ] Performance Tests: API 응답 시간

---

## 📊 테스트 매트릭스

| 테스트 유형 | 도구 | 대상 | 실행 시간 | 우선순위 |
|-----------|------|------|----------|---------|
| BFF Unit | Pytest | Voice Parser, Scam Checker | ~30초 | 🔴 MUST |
| BFF API | TestClient | 8개 엔드포인트 | ~1분 | 🔴 MUST |
| DTO Schema | Vitest | Zod 스키마 | ~10초 | 🔴 MUST |
| Component | RTL | 5개 컴포넌트 | ~30초 | 🟡 SHOULD |
| E2E | Playwright | 2개 플로우 | ~2분 | 🟢 NICE |
| A11y | axe/Custom | A11y Context | ~20초 | 🔴 MUST |

---

## 🔧 테스트 환경 설정

### Python (BFF)

```bash
# 의존성 설치
cd apps/bff-fastapi
pip install -r requirements-dev.txt

# pytest, pytest-cov, httpx 포함
```

### TypeScript (Mobile/Web)

```bash
# 의존성 설치 (루트)
pnpm install

# 테스트 라이브러리
# - vitest
# - @testing-library/react
# - @testing-library/react-native
# - jest
```

### Playwright (E2E)

```bash
# 설치
npm install -D @playwright/test

# 브라우저 설치
npx playwright install
```

---

## 🧪 테스트 작성 가이드

### 좋은 테스트의 조건
- **Isolated**: 다른 테스트에 영향 없음
- **Fast**: 1초 이내 완료 (단위 테스트)
- **Repeatable**: 매번 동일한 결과
- **Self-validating**: 명확한 pass/fail
- **Timely**: 코드 작성과 동시에 작성

### 테스트 네이밍
```python
# Python (Pytest)
def test_voice_parser_call_intent_with_name():
    """엄마에게 전화해 줘 → call intent + name slot"""
    pass

def test_scam_checker_detects_urgent_pattern():
    """긴급 패턴 포함 시 danger 반환"""
    pass
```

```typescript
// TypeScript (Vitest)
describe('CardSchema', () => {
  it('should parse valid card payload', () => {
    // ...
  });
  
  it('should reject missing required fields', () => {
    // ...
  });
});
```

---

## 🚨 테스트 실패 시 대응

### 1. 로컬에서 실패
```bash
# 실패한 테스트만 재실행
pytest -k test_voice_parser

# 디버그 모드
pytest -vv --pdb
```

### 2. CI에서 실패
- GitHub Actions 로그 확인
- 로컬에서 동일 환경 재현 (Docker)
- 필요 시 테스트 스킵 (임시)

### 3. Flaky 테스트 발견 시
- 원인 분석 (타이밍 이슈, 외부 의존성)
- 고정 또는 비활성화
- 이슈 생성 및 추적

---

## 📝 체크리스트

### 테스트 작성 완료
- [ ] BFF Voice Parser 테스트 (18개)
- [ ] BFF Scam Checker 테스트 (15개)
- [ ] BFF Gamification 테스트 (10개)
- [ ] BFF API 엔드포인트 테스트 (8개)
- [ ] Zod Schema 테스트 (전체 DTO)
- [ ] A11y Context 테스트 (3가지 모드)

### 선택 테스트
- [ ] Component 테스트 (5개)
- [ ] E2E 테스트 (2개)
- [ ] Performance 테스트

### CI 설정
- [ ] `.github/workflows/ci.yml` 작성
- [ ] Lint + Test 단계 추가
- [ ] PR 머지 조건 설정 (모든 테스트 통과)

---

## 🔗 관련 문서

### 이전 단계
- [IMPLEMENT](../IMPLEMENT/index.md) - 기능 구현
- [SEED](../SEED/index.md) - 시드 데이터

### 참조 문서
- [Voice Intents Implementation](../IMPLEMENT/04-voice-intents.md)
- [Scam Check Implementation](../IMPLEMENT/05-scam-check.md)
- [Gamification Implementation](../IMPLEMENT/02-daily-card-gamification.md)

### 다음 단계
- **DOCS**: 문서화 (README, API Reference)

---

## 📌 빠른 명령어 참조

```bash
# 전체 테스트 실행
pnpm test:all

# 변경된 파일만 테스트
pnpm test --changed

# 커버리지 리포트
pnpm test:coverage

# Watch 모드
pnpm test:watch

# BFF 테스트만
cd apps/bff-fastapi && pytest

# 특정 테스트 파일
pytest tests/test_voice_parser.py

# E2E 테스트
npx playwright test

# A11y 테스트
pnpm test:a11y
```

---

**문서 작성**: AI Test Guide  
**최종 업데이트**: 2025년 11월 13일
