# 06. CI Integration (GitHub Actions)

> **목적**: PR 머지 전 자동 테스트 실행  
> **도구**: GitHub Actions  
> **환경**: `.github/workflows/ci.yml`

---

## 📋 목표

**CI 파이프라인 구축**:
- Lint (ESLint/Prettier)
- TypeScript 타입 체크
- 유닛/통합 테스트 (JS/TS + Python)
- PR 머지 조건: 모든 테스트 통과

---

## 🤖 GitHub Actions Workflow

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run ESLint
        run: pnpm lint
      
      - name: Run Prettier
        run: pnpm format:check

  typecheck:
    name: TypeScript Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm typecheck

  test-js:
    name: JavaScript/TypeScript Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run tests
        run: pnpm test --run
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  test-python:
    name: Python Tests (BFF)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          cd apps/bff-fastapi
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Run pytest
        run: |
          cd apps/bff-fastapi
          pytest --cov=services --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/bff-fastapi/coverage.xml

  e2e:
    name: E2E Tests (Optional)
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🔧 로컬 환경 검증

### CI와 동일한 환경 재현

```bash
# 1. Lint 검사
pnpm lint
pnpm format:check

# 2. 타입 체크
pnpm typecheck

# 3. JS/TS 테스트
pnpm test --run

# 4. Python 테스트
cd apps/bff-fastapi
pytest

# 5. (선택) E2E 테스트
npx playwright test
```

---

## 🚨 CI 실패 시 대응

### 1. Lint 실패

```bash
# 자동 수정
pnpm lint:fix
pnpm format

# 커밋
git add .
git commit -m "fix: lint errors"
git push
```

### 2. 타입 체크 실패

```bash
# 타입 에러 확인
pnpm typecheck

# 수정 후 재확인
pnpm typecheck
```

### 3. 테스트 실패

```bash
# 실패한 테스트 로컬에서 확인
pnpm test -- <test-name>

# 수정 후 재실행
pnpm test
```

---

## 📊 Coverage 설정

### Jest/Vitest Coverage

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
});
```

### Pytest Coverage

```ini
# pytest.ini
[tool:pytest]
addopts = --cov=services --cov-report=html --cov-report=xml
```

---

## 🔐 Branch Protection Rules

### GitHub Repository 설정

1. **Settings → Branches → Branch protection rules**
2. **main 브랜치에 적용**:
   - ✅ Require status checks to pass before merging
     - ✅ lint
     - ✅ typecheck
     - ✅ test-js
     - ✅ test-python
   - ✅ Require branches to be up to date before merging
   - ✅ Require pull request reviews before merging (1명)

---

## ✅ 체크리스트

### CI 설정
- [ ] `.github/workflows/ci.yml` 작성
- [ ] Lint 단계 추가
- [ ] TypeScript 타입 체크 단계
- [ ] JS/TS 테스트 단계
- [ ] Python 테스트 단계
- [ ] (선택) E2E 테스트 단계

### Branch Protection
- [ ] main 브랜치 보호 설정
- [ ] 필수 status checks 설정
- [ ] PR 리뷰 필수 설정

### Coverage
- [ ] Codecov 연동 (선택)
- [ ] Coverage threshold 설정 (80%+)

---

## 📝 CI 실행 예시

```
✅ lint (32s)
✅ typecheck (45s)
✅ test-js (1m 23s)
   - BFF Unit Tests: 18 passed
   - DTO Schema Tests: 12 passed
   - Component Tests: 8 passed
✅ test-python (54s)
   - Voice Parser: 14 passed
   - Scam Checker: 10 passed
   - Gamification: 8 passed
   - API Endpoints: 8 passed

All checks passed! ✅
```

---

**문서 작성**: AI Test Guide  
**최종 업데이트**: 2025년 11월 13일
