# 01. Workspace Setup - 워크스페이스 및 도구 설정

> 모노레포 기반 설정 및 공통 도구 구성

---

## 📋 목표

- 루트 레벨에서 모노레포 워크스페이스 설정
- TypeScript, ESLint, Prettier 공통 설정
- 기본 스크립트 정의 (dev, lint, test, typecheck, format)
- Git hooks 설정 준비

---

## 🗂️ 파일 구조

```
repo/
├── package.json              # 워크스페이스 루트 설정
├── tsconfig.base.json        # TypeScript 기본 설정
├── .eslintrc.js              # ESLint 공통 설정
├── .prettierrc               # Prettier 설정
├── .gitignore                # Git 제외 파일
└── README.md                 # 프로젝트 개요
```

---

## 📄 파일별 상세 내용

### 1. package.json (루트 워크스페이스)

**목적**: 모노레포 워크스페이스 정의 및 공통 스크립트

```json
{
  "name": "senior-learning-app",
  "version": "0.1.0",
  "private": true,
  "description": "50-70대 AI 학습 앱 - MVP",
  "workspaces": [
    "apps/*",
    "services/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "echo 'Run dev servers - see scripts/dev.sh'",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "tsc --noEmit",
    "test": "echo 'No tests yet - TODO(TEST step)'",
    "clean": "rm -rf node_modules apps/*/node_modules services/*/node_modules packages/*/node_modules"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.0.0",
    "typescript": "^5.2.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

**주요 포인트**:
- `workspaces`: apps/*, services/*, packages/* 하위를 워크스페이스로 인식
- 공통 dev dependencies: TypeScript, ESLint, Prettier
- 각 워크스페이스는 독립적으로 `package.json` 보유

---

### 2. tsconfig.base.json

**목적**: 모든 서브프로젝트가 확장할 TypeScript 기본 설정

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@repo/ui": ["./packages/ui/src"],
      "@repo/types": ["./packages/types/src"]
    }
  },
  "exclude": ["node_modules", "dist", "build", ".expo", ".next"]
}
```

**주요 포인트**:
- `strict: true`: 엄격한 타입 체크
- `paths`: 패키지 별칭 (`@repo/ui`, `@repo/types`)
- 각 앱/서비스는 이 파일을 `extends`하여 커스터마이징

**서브프로젝트 예시** (apps/mobile-expo/tsconfig.json):
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-native",
    "lib": ["ES2020", "DOM"]
  },
  "include": ["src/**/*", "App.tsx"],
  "exclude": ["node_modules"]
}
```

---

### 3. .eslintrc.js

**목적**: JavaScript/TypeScript 린팅 규칙 정의

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier', // Prettier와 충돌 방지
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    // 커스텀 규칙
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/react-in-jsx-scope': 'off', // React 17+ 불필요
    'react/prop-types': 'off', // TypeScript 사용 시 불필요
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

**주요 포인트**:
- TypeScript 전용 파서 및 플러그인
- React/React Hooks 규칙
- Prettier와 통합 (충돌 방지)
- 미사용 변수 경고 (`_`로 시작하는 매개변수는 제외)

---

### 4. .prettierrc

**목적**: 코드 포맷팅 규칙 정의

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**주요 포인트**:
- `singleQuote: true`: 작은따옴표 사용
- `printWidth: 100`: 최대 줄 길이 100자
- `trailingComma: "es5"`: ES5 호환 trailing comma

---

### 5. .gitignore

**목적**: Git 버전 관리에서 제외할 파일/폴더

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
dist/
build/
.next/
.expo/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Temporary
tmp/
temp/
*.tmp

# Python (BFF)
__pycache__/
*.py[cod]
*$py.class
.pytest_cache/
.mypy_cache/
*.egg-info/
venv/
.venv/
```

---

### 6. README.md (루트)

**목적**: 프로젝트 개요 및 빠른 시작 가이드

```markdown
# 50-70대 AI 학습 앱 - MVP

> 시니어를 위한 디지털 리터러시 학습 플랫폼

## 🎯 프로젝트 개요

**타겟 사용자**: 50-70대 시니어  
**핵심 가치**: 
- 찾지 않아도 한 번에 이해되는 3분 카드
- 버튼 몇 개, 음성으로 끝나는 실행 경험
- 가족/기관이 뒤에서 quietly 서포트하는 구조

## 🛠️ 기술 스택

- **Mobile**: Expo React Native (TypeScript)
- **Web Console**: Next.js (App Router)
- **BFF**: FastAPI (Python)
- **Database**: Supabase (Postgres + Auth + RLS)
- **Cache**: Redis (Upstash)

## 📁 레포지토리 구조

```
repo/
├── apps/           # 프론트엔드 애플리케이션
├── services/       # 백엔드 서비스
├── packages/       # 공유 패키지
├── infra/          # 인프라 설정
├── scripts/        # 개발 스크립트
└── docs/           # 문서
```

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일 편집
```

### 3. 개발 서버 실행
```bash
# 상세 내용은 scripts/dev.sh 참조
npm run dev
```

## 📚 문서

- [전체 계획서](./docs/PLAN/index.md)
- [스캐폴딩 가이드](./docs/SCAFFOLD/index.md)

## 🤝 기여 가이드

(TODO: CONTRIBUTING.md 추가 예정)

## 📝 라이선스

(TODO: 라이선스 결정 후 추가)

---

**현재 상태**: SCAFFOLD 단계 (스켈레톤만 구현, 비즈니스 로직 없음)  
**마지막 업데이트**: 2025년 11월 13일
```

---

## ✅ 작업 체크리스트

### 파일 생성
- [ ] `package.json` (루트 워크스페이스)
- [ ] `tsconfig.base.json`
- [ ] `.eslintrc.js`
- [ ] `.prettierrc`
- [ ] `.gitignore`
- [ ] `README.md`

### 설정 확인
- [ ] npm/pnpm install 성공
- [ ] `npm run lint` 실행 가능
- [ ] `npm run format` 실행 가능
- [ ] `npm run typecheck` 준비 (실제 체크는 서브프로젝트 추가 후)

### Git 설정
- [ ] 초기 커밋
- [ ] 브랜치 전략 문서화 (선택)

---

## 🔗 다음 단계

이 설정이 완료되면 **[02-shared-packages.md](./02-shared-packages.md)**로 이동하여 공유 패키지를 생성합니다.

---

## 📝 참고 사항

### 모노레포 도구 선택

**선택 가능한 옵션**:
1. **npm workspaces** (권장 - 간단, 내장)
2. **pnpm workspaces** (빠른 설치 속도)
3. **yarn workspaces**
4. **Turborepo** (고급 캐싱 필요 시)

**이 가이드는 npm workspaces 기준**으로 작성되었습니다.

### TypeScript Path Aliases 주의사항

- `tsconfig.base.json`의 `paths` 설정
- 번들러(Metro, Webpack, Vite) 별도 설정 필요
- 예: Metro Bundler (RN) → `metro.config.js`에서 path resolver 추가

### ESLint vs Prettier

- **ESLint**: 코드 품질 (논리 오류, 안티패턴)
- **Prettier**: 코드 포맷 (스타일, 들여쓰기)
- 두 도구는 상호 보완적으로 사용

---

**작성일**: 2025년 11월 13일  
**작성자**: AI Scaffolding Assistant
