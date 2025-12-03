# 작업 세션 관리

**최종 업데이트**: 2025-12-02  
**목적**: 컨텍스트 초과 시 세션 재개 가이드

---

## 🎯 현재 세션

### [다음 세션 재개 프롬프트](./NEXT_SESSION_RESUME.md)
- 현재 진행 중인 작업 상태
- 환경 설정 체크리스트
- 빠른 재개 명령어

---

## 📚 과거 세션 아카이브

### [2025-11-21 - 카드 완료 중복 방지](./ARCHIVE/session-2025-11-21-migration.md)
- **작업**: completed_date 컬럼 추가 마이그레이션
- **상태**: ✅ 완료
- **결과**: 중복 완료 방지 400 에러 구현

### [2025-11-21 - Redis + Members 통합 테스트](./ARCHIVE/session-2025-11-21-integration.md)
- **작업**: Redis 캐싱 및 Members 페이지 테스트
- **상태**: ✅ 완료
- **결과**: 캐싱 10배 성능 향상 검증

---

## 📝 세션 재개 가이드

새 세션 시작 시 다음 순서로 진행:

### 1️⃣ 환경 상태 확인 (2분)
```powershell
# BFF 서버 실행 여부
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

# Docker 컨테이너 상태
docker ps --filter "name=postgres" --filter "name=redis"

# 현재 브랜치 및 변경사항
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
git status --short
git log -1 --oneline
```

### 2️⃣ 테스트 환경 리셋 (필요 시)
```powershell
# 완료 기록 삭제
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\scripts
python reset_card_completion.py

# Redis 플러시
docker exec trenduity-redis redis-cli FLUSHALL
```

### 3️⃣ BFF 서버 재시작
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4️⃣ 작업 재개
- [NEXT_SESSION_RESUME.md](./NEXT_SESSION_RESUME.md)의 "다음 작업" 섹션 참조

---

## 🔧 일반적인 문제 해결

### BFF 서버 실행 안 됨
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
if (!(Test-Path venv)) { python -m venv venv }
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Docker 컨테이너 중지됨
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\infra\dev
docker-compose up -d
docker ps  # 상태 확인
```

### 타입 에러 발생
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
npm run typecheck
# 특정 앱만:
cd apps\mobile-expo; npm run typecheck
cd apps\web-next; npm run typecheck
```

### Supabase 연결 안 됨
```powershell
# .env 파일 확인
Get-Content c:\AIDEN_PROJECT\Trenduity\Trenduity\.env | Select-String "SUPABASE"
# 없으면: Copy-Item .env.example .env 후 키 입력
```

---

## 📊 세션 작업 템플릿

새 세션 시작 시 다음 정보 기록:

```markdown
## 세션 [날짜]

### 작업 목표
- [목표 1]
- [목표 2]

### 환경 상태
- BFF: [실행 중 / 중지]
- Docker: [실행 중 / 중지]
- 브랜치: [브랜치명]

### 작업 내용
- [작업 1 설명]
- [작업 2 설명]

### 결과
- [결과 1]
- [결과 2]

### 다음 단계
- [다음 작업 1]
- [다음 작업 2]
```

---

## 🔗 관련 문서

- [프로젝트 진행 상황](../WORK_PROGRESS_TRACKER.md)
- [이슈 트래커](../ISSUES/README.md)
- [배포 가이드](../SETUP/03-deployment-setup.md)

---

**작성자**: AI Copilot  
**문서 버전**: 1.0
