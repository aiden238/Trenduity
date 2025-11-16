# 50-70대 AI 학습 앱 - MVP 계획서 구조

> 이 문서는 PLAN 폴더의 구조와 각 파일의 역할을 설명합니다.

---

## 📚 문서 구조 개요

이 폴더는 **50-70대를 위한 AI 학습 앱 MVP**의 전체 계획을 9개의 독립적인 문서로 나누어 관리합니다. 각 문서는 특정 관점에서 프로젝트를 상세히 설명하며, 필요에 따라 개별적으로 참조할 수 있습니다.

---

## 📖 문서 목록 및 설명

### 1️⃣ [01-project-overview.md](./01-project-overview.md)
**프로젝트 개요 및 타겟 사용자**

- **내용**:
  - 타겟 사용자 분석 (50대, 60대, 70대별 특성)
  - 핵심 가치 제안 3가지
  - MVP 범위 제외 사항
  
- **언제 읽을까?**:
  - 프로젝트 이해가 필요할 때
  - 기획/디자인 결정 시 사용자 페르소나 참조
  - 기능 우선순위 판단 시

- **핵심 키워드**: 타겟 사용자, 페르소나, 가치 제안, MVP 범위

---

### 2️⃣ [01-2-architecture-overview.md](./01-2-architecture-overview.md)
**시스템 아키텍처 및 데이터 플로우**

- **내용**:
  - 3계층 아키텍처 (Presentation/BFF/Data)
  - 7가지 주요 기능의 데이터 플로우 다이어그램
  - 클라이언트-서버 간 책임 분리

- **언제 읽을까?**:
  - 개발 시작 전 전체 구조 파악
  - API 설계 시 레이어 간 책임 확인
  - 새로운 기능 추가 시 아키텍처 패턴 참조

- **핵심 키워드**: 아키텍처, 데이터 플로우, 3계층, RLS, BFF

---

### 3️⃣ [02-3-domain-&-feature-decomposition.md](./02-3-domain-&-feature-decomposition.md)
**도메인별 기능 상세 분석**

- **내용**:
  - 9개 도메인별 분석:
    1. DailyCard (오늘의 카드)
    2. InsightHub (인사이트 허브)
    3. VoiceIntent (음성 인텐트)
    4. ScamCheck (사기검사)
    5. ToolTrack (도구 실습)
    6. LightCommunity (커뮤니티 Q&A)
    7. FamilyMed (가족 연동 + 복약)
    8. Gamification (게임화)
    9. Accessibility (접근성)
  - 각 도메인별 사용자 스토리, 엔티티, 불변식, 실패 모드

- **언제 읽을까?**:
  - 특정 기능 구현 시 비즈니스 로직 확인
  - 도메인 규칙 및 제약 조건 파악
  - 에러 처리 시나리오 설계

- **핵심 키워드**: 도메인 로직, 사용자 스토리, 비즈니스 규칙, 실패 모드

---

### 4️⃣ [03-4-data-model-overview.md](./03-4-data-model-overview.md)
**데이터베이스 스키마 및 권한 모델**

- **내용**:
  - 16개 테이블 상세 설명 (profiles, cards, gamification 등)
  - Row-Level Security (RLS) 정책
  - Access Patterns 및 인덱싱 전략
  - 캐싱 전략

- **언제 읽을까?**:
  - DB 마이그레이션 작성 시
  - 쿼리 최적화 필요 시
  - RLS 정책 설정 시
  - 데이터 접근 권한 확인

- **핵심 키워드**: 데이터베이스, 스키마, RLS, 인덱싱, 캐싱

---

### 5️⃣ [04-5-module-&-file-responsibility-map.md](./04-5-module-&-file-responsibility-map.md)
**코드베이스 구조 및 파일 책임**

- **내용**:
  - 모바일 앱 (Expo RN) 폴더 구조
  - 웹 콘솔 (Next.js) 폴더 구조
  - BFF (FastAPI) 폴더 구조
  - 도메인 분리 원칙
  - 플랫폼별 로직 구분

- **언제 읽을까?**:
  - 새 파일/모듈 생성 전 위치 확인
  - 기능 추가 시 어느 레이어에 구현할지 판단
  - 코드 리뷰 시 책임 분리 확인
  - 리팩토링 계획 수립

- **핵심 키워드**: 폴더 구조, 모듈 책임, 도메인 분리, 플랫폼 로직

---

### 6️⃣ [05-6-cross-cutting-concerns.md](./05-6-cross-cutting-concerns.md)
**공통 관심사 및 품질 요구사항**

- **내용**:
  - Error Handling (클라이언트/서버)
  - Logging & Audit (로깅 레벨, 감사 추적)
  - Performance & Cost (캐싱, P95 목표, LLM 가드)
  - Security & Privacy (Auth, RLS, 가족 위임)

- **언제 읽을까?**:
  - 에러 처리 로직 작성 시
  - 로깅/모니터링 설정 시
  - 성능 최적화 필요 시
  - 보안 관련 결정 시

- **핵심 키워드**: 에러 처리, 로깅, 성능, 보안, 프라이버시

---

### 7️⃣ [06-7-6-week-milestone-plan-(mvp).md](./06-7-6-week-milestone-plan-(mvp).md)
**6주 마일스톤 계획**

- **내용**:
  - Week 1: Foundation & Infrastructure
  - Week 2: Core Features - Daily Card & Auth
  - Week 3: Insight Hub & Voice Intents
  - Week 4: Scam Check & Tool Tracks
  - Week 5: Community & Family Features
  - Week 6: Polish, Testing & Launch Prep
  - 각 주차별: 목표, 산출물, 데모 시나리오, 우선순위

- **언제 읽을까?**:
  - 프로젝트 시작 시 전체 일정 파악
  - 주간 스프린트 계획 수립
  - 진행도 체크 및 조정
  - 우선순위 재평가

- **핵심 키워드**: 일정, 마일스톤, 스프린트, 우선순위, MUST/SHOULD/NICE

---

### 8️⃣ [07-8-risks-&-mitigations.md](./07-8-risks-&-mitigations.md)
**리스크 관리 및 완화 방안**

- **내용**:
  - 10가지 주요 리스크:
    1. 70대를 위한 UI 복잡도
    2. RLS 설정 오류
    3. LLM 비용 급증
    4. Redis 장애
    5. 커뮤니티 기능 과도한 확장
    6. TTS/음성 인식 품질
    7. 가족 대시보드 복잡도
    8. 데이터 마이그레이션 이슈
    9. 외부 API 의존성
    10. 접근성 준수
  - 각 리스크별: 발생 가능성, 영향도, 감지 방법, 완화 방안

- **언제 읽을까?**:
  - 프로젝트 초기 리스크 인지
  - 주요 결정 전 리스크 검토
  - 문제 발생 시 대응 방안 확인
  - 회고 시 리스크 재평가

- **핵심 키워드**: 리스크, 완화, 대응 계획, 모니터링

---

### 9️⃣ [08-9-acceptance-criteria-for-mvp.md](./08-9-acceptance-criteria-for-mvp.md)
**MVP 완성 기준 및 품질 지표**

- **내용**:
  - E2E 시나리오 10개 (필수 사용자 여정)
  - 접근성 요구사항 (WCAG 2.1 AA)
  - 성능 목표 (P95 레이턴시)
  - 분석 이벤트 목록
  - 알림 임계값

- **언제 읽을까?**:
  - QA 테스트 계획 수립
  - 배포 전 체크리스트 확인
  - 성능 측정 기준 참조
  - MVP 완성도 평가

- **핵심 키워드**: 수락 기준, E2E 테스트, 접근성, 성능 목표, KPI

---

## 🗺️ 문서 간 관계

```
01-project-overview.md (왜?)
    ↓
02-architecture-overview.md (어떻게 구조화?)
    ↓
03-domain-decomposition.md (무엇을?)
    ↓
04-data-model.md (어떤 데이터?)
    ↓
05-module-structure.md (어디에 코드?)
    ↓
06-cross-cutting.md (품질은?)
    ↓
07-milestone-plan.md (언제?)
    ↓
08-risks.md (위험은?)
    ↓
09-acceptance-criteria.md (완성 기준은?)
```

---

## 🎯 역할별 추천 읽기 순서

### 프로젝트 매니저 (PM)
1. **01-project-overview.md** - 전체 비전 이해
2. **07-milestone-plan.md** - 일정 및 우선순위
3. **08-risks.md** - 리스크 관리
4. **09-acceptance-criteria.md** - 완성 기준

### 백엔드 개발자
1. **02-architecture-overview.md** - 전체 아키텍처
2. **04-data-model.md** - DB 스키마 및 RLS
3. **05-module-structure.md** - BFF 코드 구조
4. **06-cross-cutting.md** - 에러 처리, 로깅, 보안
5. **03-domain-decomposition.md** - 비즈니스 로직

### 프론트엔드 개발자 (Mobile)
1. **01-project-overview.md** - 사용자 이해
2. **02-architecture-overview.md** - 데이터 플로우
3. **05-module-structure.md** - 모바일 코드 구조
4. **03-domain-decomposition.md** - 화면별 기능
5. **06-cross-cutting.md** - 에러 처리, 접근성

### 프론트엔드 개발자 (Web)
1. **01-project-overview.md** - 가족 페르소나 이해
2. **02-architecture-overview.md** - 데이터 플로우
3. **05-module-structure.md** - 웹 콘솔 구조
4. **03-domain-decomposition.md** - FamilyMed 도메인
5. **06-cross-cutting.md** - 권한 관리

### QA 엔지니어
1. **09-acceptance-criteria.md** - 테스트 시나리오
2. **03-domain-decomposition.md** - 실패 모드
3. **07-milestone-plan.md** - 테스트 일정
4. **06-cross-cutting.md** - 성능 목표

### UI/UX 디자이너
1. **01-project-overview.md** - 사용자 페르소나
2. **03-domain-decomposition.md** - 사용자 스토리
3. **09-acceptance-criteria.md** - 접근성 요구사항
4. **08-risks.md** - UI 복잡도 리스크

---

## 🔍 빠른 검색 가이드

### 특정 기능 구현 시
1. **도메인 로직** → `03-domain-decomposition.md`에서 해당 도메인 검색
2. **데이터베이스** → `04-data-model.md`에서 테이블 검색
3. **파일 위치** → `05-module-structure.md`에서 모듈 검색

### 문제 해결 시
1. **에러 처리** → `06-cross-cutting.md` > Error Handling
2. **성능 이슈** → `06-cross-cutting.md` > Performance
3. **보안 문제** → `06-cross-cutting.md` > Security

### 계획 수립 시
1. **주간 계획** → `07-milestone-plan.md`
2. **리스크 체크** → `08-risks.md`
3. **우선순위** → `07-milestone-plan.md`의 MUST/SHOULD/NICE

---

## 📊 문서 통계

- **총 문서 수**: 9개
- **총 도메인**: 9개
- **총 테이블**: 16개
- **총 리스크**: 10개
- **MVP 기간**: 6주
- **E2E 시나리오**: 10개

---

## 🔄 업데이트 원칙

1. **단일 진실 공급원 (Single Source of Truth)**:
   - 각 개념은 한 문서에서만 상세히 설명
   - 다른 문서는 참조만 제공

2. **문서 간 일관성**:
   - 용어 통일 (예: "시니어", "가족", "기관")
   - 버전 동기화 (변경 시 연관 문서 함께 업데이트)

3. **변경 이력**:
   - 각 문서 하단에 변경 이력 기록
   - 상위 PLAN.md에도 요약 기록

---

## 💡 사용 팁

### AI와 작업 시
- ✅ **좋은 예**: "섹션 3의 DailyCard 도메인만 읽고 카드 완료 API 구현해줘"
- ❌ **나쁜 예**: "전체 PLAN 문서를 읽고 카드 API 구현해줘" (컨텍스트 오버플로우)

### 코드 리뷰 시
- 관련 문서 섹션 링크를 PR 설명에 추가
- 예: "이 변경은 `05-module-structure.md`의 BFF 구조를 따릅니다"

### 온보딩 시
- 신규 팀원: 역할별 추천 읽기 순서 따르기
- 1일차: 01, 02 (전체 이해)
- 2일차: 역할별 문서 (상세 파악)
- 3일차: 실제 코드와 문서 비교

---

**최종 업데이트**: 2025년 11월 13일  
**문서 버전**: 1.0  
**작성자**: AI Planning Assistant
