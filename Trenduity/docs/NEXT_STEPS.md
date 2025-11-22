# 🎯 다음 단계: TEST & 실전 배포 준비

## 📊 현재 완료 상태 (2025-11-18)

### ✅ SCAFFOLD 단계 (100% 완료)
- 모노레포 구조 확립
- BFF FastAPI 서버 구축
- Mobile Expo 앱 초기화
- Web Next.js 대시보드 초기화
- Supabase 연동
- Redis 설정

### ✅ IMPLEMENT 단계 (80% 완료)
- **완료된 기능**:
  - 오늘의 카드 (Daily Card)
  - 인사이트 허브 (Insights)
  - 커뮤니티 Q&A
  - 가족 대시보드
  - 음성 인텐트 파싱
  - 사기 검사
  - 복약 체크 (MedCheck)
  - 접근성 (A11y) 모드
  
- **추가 완료 (최근)**:
  - UI 컴포넌트 통일 (Spinner, Toast, EmptyState, ErrorState)
  - E2E 테스트 33개 작성 (Playwright)
  - 성능 최적화 (N+1 쿼리 95% 개선, React Query 튜닝)
  - 환경 변수 정리 및 검증

### 🚧 IMPLEMENT 단계 - 남은 작업 (20%)
1. **게임화 시스템 완성** (GamificationService 로직)
2. **배지 시스템** (badge 테이블 및 부여 로직)
3. **스트릭 계산** (연속 일수 추적)
4. **실시간 알림** (Supabase Realtime)
5. **TTS 실제 구현** (Expo Speech 음성 재생)

---

## 🎯 다음 우선순위: TEST 단계

### TEST 단계 목표
6-Week Milestone의 **Week 6: Polish, Testing & Launch Prep**에 해당하며, MVP 출시 전 품질 검증 단계입니다.

### 📋 TEST 단계 작업 항목

#### 1. E2E 테스트 실행 및 검증 (1-2일)
- [x] Playwright 설치 및 설정 완료
- [x] 5개 시나리오 33개 테스트 작성 완료
- [ ] **로컬 환경에서 테스트 실행**
  ```powershell
  cd e2e
  npm run test:e2e
  ```
- [ ] **실패하는 테스트 수정**
- [ ] **커버리지 80% 이상 확보**

#### 2. BFF API 단위 테스트 (2-3일)
- [ ] pytest 설정 (`services/bff-fastapi/tests/`)
- [ ] 각 라우터별 테스트:
  - `test_cards.py` - 카드 완료, 포인트 부여
  - `test_community.py` - Q&A CRUD
  - `test_family.py` - 가족 멤버 조회
  - `test_insights.py` - 인사이트 목록
  - `test_scam.py` - 사기 검사 로직
  - `test_med.py` - 복약 체크
- [ ] 테스트 커버리지 70% 이상 목표

#### 3. 모바일 컴포넌트 테스트 (1-2일)
- [ ] Jest + React Testing Library 설정
- [ ] 주요 컴포넌트 테스트:
  - `TodayCard.test.tsx`
  - `QnaList.test.tsx`
  - `A11yContext.test.tsx`
  - `Toast.test.tsx`
- [ ] 접근성 테스트 (accessibilityLabel 검증)

#### 4. 성능 벤치마크 (1일)
- [ ] **BFF API 부하 테스트**
  ```powershell
  ab -n 1000 -c 10 http://localhost:8000/v1/cards/today
  ```
  - 목표: 평균 < 200ms, P95 < 500ms
- [ ] **데이터베이스 쿼리 성능**
  ```sql
  EXPLAIN ANALYZE SELECT * FROM qna_posts WHERE topic = 'ai_tools' LIMIT 20;
  ```
- [ ] **번들 크기 분석**
  ```powershell
  cd apps/web-next
  npm run build:analyze
  ```
  - 목표: 첫 로드 < 500KB gzip

#### 5. 접근성 검증 (1일)
- [ ] **Lighthouse 접근성 점수**
  ```powershell
  npx lighthouse http://localhost:3000 --only-categories=accessibility --view
  ```
  - 목표: 90점 이상
- [ ] **스크린리더 테스트** (NVDA/VoiceOver)
- [ ] **키보드 네비게이션 테스트**
- [ ] **색상 대비 검증** (WCAG AA 4.5:1)

#### 6. CI/CD 파이프라인 강화 (1-2일)
- [x] GitHub Actions 워크플로 생성 (E2E 테스트)
- [ ] **추가 워크플로**:
  - `test-bff.yml` - BFF 단위 테스트
  - `test-mobile.yml` - React Native 컴포넌트 테스트
  - `lint.yml` - ESLint, Black, Ruff
  - `deploy-preview.yml` - Vercel 프리뷰 배포
- [ ] **배포 전 필수 체크**:
  - 모든 테스트 통과
  - Lighthouse 점수 90+
  - 타입 체크 통과

---

## 🚀 추천 다음 단계 (우선순위)

### Option 1: E2E 테스트 실행 및 검증 (최우선) ⭐⭐⭐
**이유**: 이미 33개 테스트가 작성되어 있으므로, 실행하고 통과시키는 것이 빠른 성과

**작업 순서**:
1. 로컬 BFF 서버 시작
2. 로컬 Postgres + Redis 시작 (Docker)
3. Seed 데이터 적용
4. E2E 테스트 실행
5. 실패 테스트 수정

**예상 시간**: 2-4시간

**명령어**:
```powershell
# 1. BFF 시작
cd services\bff-fastapi
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# 2. 시드 데이터 적용
cd ..\..\scripts
python seed_data.py

# 3. E2E 테스트 실행
cd ..\e2e
npm run test:e2e
```

---

### Option 2: BFF 단위 테스트 작성 (권장) ⭐⭐
**이유**: 비즈니스 로직 검증, 리팩토링 안전성 확보

**작업 순서**:
1. pytest 설정 파일 생성
2. 주요 라우터별 테스트 작성 (cards, community, family)
3. Mock 데이터 준비
4. 테스트 실행 및 커버리지 확인

**예상 시간**: 6-8시간

**파일 구조**:
```
services/bff-fastapi/tests/
├── conftest.py           # pytest fixtures
├── test_cards.py         # 카드 테스트
├── test_community.py     # Q&A 테스트
├── test_family.py        # 가족 테스트
├── test_gamification.py  # 게임화 테스트
└── test_scam.py          # 사기 검사 테스트
```

---

### Option 3: 게임화 시스템 완성 (기능 완성도) ⭐⭐
**이유**: IMPLEMENT 단계 완전히 마무리, 사용자 경험 핵심 기능

**작업 순서**:
1. `GamificationService` 로직 구현
   - 포인트 계산 (카드 완료 +5, 퀴즈 정답 +2, 스트릭 보너스 +3)
   - 배지 조건 확인 (첫 카드 완료, 7일 연속, 100점 달성 등)
   - 레벨 업 계산
2. `badge` 테이블 생성 및 RLS 설정
3. 스트릭 계산 알고리즘 구현
4. 배지 UI 컴포넌트 (모바일 + 웹)

**예상 시간**: 4-6시간

---

### Option 4: 성능 벤치마크 및 최적화 완료 (품질) ⭐
**이유**: Option C에서 인프라는 구축했으나, 실제 측정 및 튜닝 필요

**작업 순서**:
1. DB 인덱스 적용 (`scripts/add_performance_indexes.sql`)
2. BFF 부하 테스트 (Apache Bench)
3. 번들 분석 (`npm run build:analyze`)
4. Lighthouse 점수 측정
5. 병목 지점 최적화

**예상 시간**: 3-4시간

---

### Option 5: 실시간 알림 구현 (사용자 경험 향상) ⭐
**이유**: 가족 대시보드의 핵심 기능, Supabase Realtime 활용

**작업 순서**:
1. Supabase Realtime 채널 구독 설정
2. 웹 대시보드에서 실시간 알림 수신
3. 알림 UI 컴포넌트 (토스트, 배지)
4. 알림 읽음 처리 API

**예상 시간**: 2-3시간

---

## 📊 옵션별 비교

| 옵션 | 우선순위 | 예상 시간 | 난이도 | 영향도 | 완료 후 효과 |
|------|---------|---------|--------|--------|-------------|
| **1. E2E 테스트 실행** | ⭐⭐⭐ | 2-4h | 중 | 높음 | 품질 보증, 버그 발견 |
| **2. BFF 단위 테스트** | ⭐⭐ | 6-8h | 중 | 높음 | 리팩토링 안전성 |
| **3. 게임화 완성** | ⭐⭐ | 4-6h | 중 | 높음 | 사용자 참여도 증가 |
| **4. 성능 벤치마크** | ⭐ | 3-4h | 낮음 | 중간 | 성능 가시성 |
| **5. 실시간 알림** | ⭐ | 2-3h | 낮음 | 중간 | 가족 대시보드 완성도 |

---

## 🎯 추천 작업 순서

### 단기 (오늘~내일)
1. **E2E 테스트 실행 및 수정** (2-4시간) ← 최우선
2. **DB 인덱스 적용** (10분)
3. **게임화 로직 구현** (4-6시간)

### 중기 (이번 주)
4. **BFF 단위 테스트 작성** (6-8시간)
5. **성능 벤치마크** (3-4시간)
6. **실시간 알림 구현** (2-3시간)

### 장기 (다음 주)
7. **모바일 컴포넌트 테스트** (4-6시간)
8. **접근성 검증** (2-3시간)
9. **CI/CD 강화** (4-6시간)
10. **프로덕션 배포 준비** (1-2일)

---

## 📚 관련 문서

- **현재 완료 보고서**: `docs/COMPLETION_REPORT.md`
- **성능 가이드**: `docs/PERFORMANCE.md`
- **환경 변수**: `docs/ENVIRONMENT.md`
- **6주 마일스톤**: `docs/PLAN/06-7-6-week-milestone-plan-(mvp).md`
- **TEST 가이드**: `docs/TEST/` (생성 필요)

---

**다음 작업을 시작하시겠습니까?**  
추천: **Option 1 (E2E 테스트 실행)** 또는 **Option 3 (게임화 시스템 완성)**
