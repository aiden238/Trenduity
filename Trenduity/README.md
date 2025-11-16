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

### 1단계: 초기 설정

```bash
# 저장소 클론
git clone <repository-url>
cd Trenduity

# 부트스트랩 실행 (의존성 설치, Docker 시작)
# Windows PowerShell
.\scripts\bootstrap.ps1

# Linux/Mac
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh
```

### 2단계: 환경변수 설정

`.env` 파일을 편집하여 Supabase 키를 설정하세요:

```bash
# Supabase 프로젝트에서 키 복사
# Settings > API > Project URL, anon key, service_role key
```

### 3단계: 개발 서버 실행

```bash
# 모든 서버 실행 (BFF, Web, Mobile)
# Windows PowerShell
.\scripts\dev.ps1

# Linux/Mac
chmod +x scripts/dev.sh
./scripts/dev.sh
```

### 4단계: 접속 확인

- **BFF API**: http://localhost:8000
- **BFF Swagger UI**: http://localhost:8000/docs
- **웹 콘솔**: http://localhost:3000
- **모바일 앱**: http://localhost:19006 (Expo DevTools)

## 📚 문서

- [전체 계획서](../docs/PLAN/index.md)
- [스캐폴딩 가이드](../docs/SCAFFOLD/index.md)

## 📚 개발 가이드

### 프로젝트 구조

자세한 내용은 [docs/SCAFFOLD/index.md](../docs/SCAFFOLD/index.md) 참조

### 주요 명령어

```bash
# 린트
npm run lint
npm run lint:fix

# 타입 체크
npm run typecheck

# 포맷
npm run format

# 클린
npm run clean
```

## 🐳 Docker 관리

```bash
# 시작
cd infra/dev
docker-compose up -d

# 중지
docker-compose down

# 로그 확인
docker-compose logs -f

# 데이터 초기화 (주의!)
docker-compose down -v
```

## 🔧 트러블슈팅

### Docker 연결 실패
- Docker Desktop이 실행 중인지 확인
- `docker-compose ps`로 컨테이너 상태 확인

### 포트 충돌
- 8000, 3000, 19006 포트가 다른 프로세스에서 사용 중인지 확인
- 포트 변경: 각 앱의 package.json/config 수정

### Expo 앱 실행 안 됨
- `npm start -- --clear` (캐시 클리어)
- `expo-cli` 전역 설치: `npm install -g expo-cli`

### BFF 실행 안 됨
- Python 가상환경 활성화 확인
- `pip install -r requirements.txt` 재실행

## 🤝 기여 가이드

(TODO: CONTRIBUTING.md 추가 예정)

## 📝 라이선스

(TODO: 라이선스 결정 후 추가)

---

**현재 상태**: SCAFFOLD 단계 (스켈레톤만 구현, 비즈니스 로직 없음)  
**마지막 업데이트**: 2025년 11월 14일
