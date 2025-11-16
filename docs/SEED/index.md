# SEED - Seed Data & Initialization

> **목적**: MVP 앱을 즉시 데모 가능하게 만드는 **시드 데이터 및 초기화 스크립트** 제공  
> **대상 독자**: 백엔드 개발자, DevOps, QA  
> **전제**: PLAN/SCAFFOLD/IMPLEMENT 단계가 완료되어 코어 구현이 존재함

---

## 📋 개요

SEED 단계는 **빈 데이터베이스를 실제 사용 가능한 상태로 채우는** 작업입니다.

**핵심 목표**:
- 🎴 **Daily Cards**: 8개 이상의 교육용 카드 (4가지 타입)
- 💡 **Insights**: 각 토픽별 3개 이상의 인사이트 콘텐츠
- 💬 **Q&A Posts**: 5개의 시니어 질문 샘플
- 👤 **Demo Profiles**: 50/60/70대 데모 유저 (선택사항)
- 🔧 **Seed Scripts**: Python 또는 TypeScript로 작성된 자동 삽입 스크립트

**결과물**:
- 앱 실행 시 바로 콘텐츠가 보이는 상태
- 수동 DB 편집 없이 데모 가능
- 확장/수정이 쉬운 구조

---

## 📚 문서 구조

### [01. Seed Data Design](./01-seed-data-design.md)
**시드 데이터 설계 및 샘플**

- Daily Cards (8개, 4가지 타입)
  - AI 활용법
  - 최신 트렌드
  - 디지털 안전
  - 생활 팁/모바일101
- Insights (토픽별 3개)
  - ai, bigtech, economy, safety, mobile101
- Q&A Posts (5개)
  - 익명/닉네임 포함
- Gamification Baseline (선택사항)

**콘텐츠 원칙**:
- 한국어, 시니어 친화적
- 300-500자 분량
- 교육적이고 안전한 내용

### [02. DB Seed Scripts](./02-db-seed-scripts.md)
**데이터베이스 초기화 스크립트**

- `scripts/seed_data.py` 또는 `seed_data.ts`
- Supabase/Postgres 연결
- Idempotent 전략 (중복 실행 방지)
- 로그 출력 (삽입/업데이트 개수)

**실행 방법**:
```bash
# Python
python scripts/seed_data.py

# Node.js
npm run seed
```

### [03. Demo Profiles](./03-demo-profiles.md)
**데모용 사용자 프로필**

- 50/60/70대 각 1명씩
- 가상 이메일 (`demo+id@example.com`)
- A11y 설정 포함
- 포인트/스트릭 히스토리 (선택사항)

**목적**:
- E2E 테스트용
- 가족 연동 데모용
- 접근성 모드 확인용

### [04. Wiring Seed Data](./04-wiring-seed-data.md)
**시드 데이터와 BFF 연동**

- `/v1/cards/today` 최소 1개 반환 보장
- `/v1/insights` 토픽별 1개 이상 반환
- `/v1/qna` 시드 질문 노출
- BFF 쿼리 조정 (필요 시)

**검증 방법**:
- 각 엔드포인트 curl 테스트
- 모바일 앱에서 실제 확인

---

## 🎯 실행 순서

### 1단계: 시드 데이터 검토
```bash
# 01-seed-data-design.md 읽기
# 샘플 카드/인사이트/Q&A 확인
```

### 2단계: 환경 설정
```bash
# .env 파일 설정
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx...
DATABASE_URL=postgresql://...
```

### 3단계: 스크립트 실행
```bash
# Python 방식
cd scripts/
python seed_data.py

# 또는 Node.js 방식
npm run seed
```

### 4단계: 검증
```bash
# BFF 테스트
curl http://localhost:8000/v1/cards/today
curl http://localhost:8000/v1/insights?topic=ai
curl http://localhost:8000/v1/qna

# 모바일 앱 실행
cd apps/mobile-rn
npm start
# 홈 화면에서 카드 확인
```

---

## ✅ 완료 기준

### 필수 사항
- [ ] Daily Cards 8개 이상 삽입됨
- [ ] Insights 각 토픽별 3개 이상
- [ ] Q&A Posts 5개 이상
- [ ] Seed 스크립트 실행 성공
- [ ] `/v1/cards/today` 응답 확인
- [ ] `/v1/insights` 응답 확인
- [ ] 모바일 앱에서 콘텐츠 표시 확인

### 선택 사항
- [ ] Demo Profiles 3명 생성
- [ ] Gamification 히스토리 삽입
- [ ] 가족 연동 샘플 데이터

### 품질 검증
- [ ] 스크립트 재실행 시 중복 없음
- [ ] 에러 발생 시 명확한 로그
- [ ] 한국어 인코딩 정상 (UTF-8)
- [ ] 카드 본문 300-500자 준수
- [ ] Quiz 문항 1-3개 포함

---

## 📊 시드 데이터 요약

### Daily Cards
| 타입 | 개수 | 예시 |
|------|------|------|
| AI 활용법 | 2개 | "AI란 무엇인가요?" |
| 최신 트렌드 | 2개 | "2024년 AI 트렌드" |
| 디지털 안전 | 2개 | "스미싱 구별법" |
| 생활 팁 | 2개 | "사진 정리하는 법" |

### Insights
| 토픽 | 개수 | 예시 |
|------|------|------|
| ai | 3개 | "생성형 AI 기초" |
| bigtech | 3개 | "애플의 새로운 기능" |
| economy | 3개 | "AI와 경제 전망" |
| safety | 3개 | "온라인 사기 예방" |
| mobile101 | 3개 | "스마트폰 기본 설정" |

### Q&A Posts
- "문자 링크 클릭해도 되나요?" (디지털 안전)
- "미리캔버스 글씨 크기 바꾸기" (도구 사용)
- "AI 음성 비서 추천" (AI 활용)
- "가족과 사진 공유하는 법" (모바일101)
- "포인트는 어떻게 쌓나요?" (익명, 게이미피케이션)

---

## 🔗 관련 문서

### 이전 단계
- [PLAN](../PLAN/index.md) - 요구사항 및 아키텍처
- [SCAFFOLD](../SCAFFOLD/index.md) - 프로젝트 구조
- [IMPLEMENT](../IMPLEMENT/index.md) - 기능 구현

### 참조 문서
- [Data Model](../PLAN/03-4-data-model-overview.md) - 테이블 스키마
- [Daily Card Implementation](../IMPLEMENT/02-daily-card-gamification.md) - 카드 구조
- [Insight Hub Implementation](../IMPLEMENT/03-insight-hub.md) - 인사이트 구조

### 다음 단계
- **TEST**: E2E 테스트 및 QA
- **DEPLOY**: 스테이징 배포

---

## 🛠️ Troubleshooting

### 문제: 스크립트 실행 시 "connection refused"
```bash
# 해결: Supabase 로컬 실행 확인
supabase status

# 또는 .env 파일의 DATABASE_URL 확인
```

### 문제: 한글 깨짐
```bash
# 해결: Python 스크립트에서 encoding 명시
with open('seed_data.json', 'r', encoding='utf-8') as f:
```

### 문제: 중복 데이터 계속 삽입됨
```bash
# 해결: 02-db-seed-scripts.md의 idempotent 로직 확인
# ON CONFLICT DO UPDATE 또는 조건부 INSERT 사용
```

### 문제: "/v1/cards/today" 빈 배열 반환
```bash
# 해결: 04-wiring-seed-data.md 참조
# BFF에서 날짜 조건 완화 또는 seed 카드 날짜 조정
```

---

## 📝 변경 이력

- **2025-11-13**: 초안 작성 (SEED 단계 문서 구조 설계)

---

**문서 작성**: AI Seed Guide  
**최종 업데이트**: 2025년 11월 13일
