# 05. Operations & Future 작성 가이드

> **목적**: `docs/OPERATIONS_FUTURE.md`를 작성하여 DevOps/미래 팀이 운영 가이드와 향후 확장 아이디어를 이해할 수 있도록 합니다.  
> **대상 독자**: DevOps, 운영팀, 미래 개발팀  
> **출력**: `docs/OPERATIONS_FUTURE.md`

---

## 📋 개요

Operations & Future 문서는 **운영 노하우와 미래 비전**을 담습니다. 다음 질문에 답해야 합니다:

- **환경은 어떻게 구분되나?** → 로컬/스테이징/프로덕션
- **로깅·모니터링은?** → 어떤 이벤트, 어떤 지표
- **LLM 연동 시 고려사항은?** → 비용, 프라이버시, 품질 관리
- **향후 확장은?** → 더 풍부한 기능 아이디어

---

## 🎯 포함해야 할 섹션

### 1. 환경 구분

````markdown
## 환경 구분

### Local (로컬 개발)

**목적**: 개발자 개인 PC에서 빠른 개발/테스트

**구성**:

- BFF: `localhost:8000`
- Mobile: Expo Dev Client
- Web: `localhost:3000`
- DB: Supabase 개발 프로젝트
- Redis: Docker 로컬 인스턴스

**환경 변수** (`.env.local`):
\```bash
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
REDIS_URL=redis://localhost:6379
NODE_ENV=development
\```

**특징**:

- 핫 리로드 (코드 변경 즉시 반영)
- 상세 로그 (DEBUG 레벨)
- 시드 데이터 사용
- LLM 호출 mock/stub

---

### Staging (스테이징)

**목적**: 프로덕션 배포 전 통합 테스트

**구성**:

- BFF: `https://staging-api.trenduity.com`
- Web: `https://staging.trenduity.com`
- DB: Supabase 스테이징 프로젝트
- Redis: Upstash 무료 티어

**환경 변수** (`.env.staging`):
\```bash
SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
REDIS_URL=redis://staging.upstash.io
NODE_ENV=staging
\```

**특징**:

- 프로덕션과 동일한 인프라
- 실제 LLM 호출 (비용 가드 적용)
- 성능 테스트
- 알림 비활성화 (실제 사용자에게 전송 안 됨)

---

### Production (프로덕션)

**목적**: 실제 사용자 서비스

**구성**:

- BFF: `https://api.trenduity.com`
- Web: `https://console.trenduity.com`
- Mobile: App Store / Google Play
- DB: Supabase 프로덕션 프로젝트
- Redis: Upstash 유료 티어

**환경 변수** (`.env.production`):
\```bash
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
REDIS_URL=redis://prod.upstash.io
NODE_ENV=production
SENTRY_DSN=https://... # 에러 트래킹
\```

**특징**:

- 최소 로그 (INFO 레벨)
- 에러 트래킹 (Sentry)
- 성능 모니터링 (P95 레이턴시)
- LLM 비용 하드캡
- 백업 자동화
  \```

---

### 2. 로깅 & 모니터링

````markdown
## 로깅 & 모니터링

### 로깅 레벨

\```python

# BFF (FastAPI)

import logging

if ENV == "production":
logging.basicConfig(level=logging.INFO)
else:
logging.basicConfig(level=logging.DEBUG)
\```

**레벨별 용도**:

- **DEBUG**: 개발 시 상세 정보 (변수값, 쿼리 등)
- **INFO**: 주요 이벤트 (API 호출, DB 쿼리 성공)
- **WARNING**: 정상 동작하지만 주의 필요 (재시도, 폴백)
- **ERROR**: 복구 가능한 에러 (DB 연결 실패 → 재시도)
- **CRITICAL**: 복구 불가능한 에러 (서비스 중단)

---

### 로깅 대상 이벤트

#### 사용자 행동 (audit_logs 테이블)

\```python
AUDIT_EVENTS = {
"card.completed": "카드 완료",
"insight.viewed": "인사이트 조회",
"voice.intent": "음성 인텐트 실행",
"scam.check": "사기 검사",
"tool.step_completed": "도구 단계 완료",
"qna.posted": "Q&A 작성",
"family.invited": "가족 초대",
"med.checked": "복약 체크",
}
\```

**로그 형식**:
\```json
{
"timestamp": "2025-11-14T10:30:00Z",
"user_id": "user-123",
"action": "card.completed",
"resource_type": "card",
"resource_id": "card-456",
"metadata": {
"points_added": 11,
"streak_days": 7
}
}
\```

**주의**: PII (이름, 전화번호) 절대 포함 금지!

---

### 에러 트래킹 (Sentry)

**설정**:
\```python

# BFF

import sentry_sdk

sentry_sdk.init(
dsn=SENTRY_DSN,
environment=ENV,
traces_sample_rate=0.1, # 10% 성능 모니터링
)
\```

**트래킹 대상**:

- 500 Internal Server Error
- DB 연결 실패
- LLM API 타임아웃
- 예상치 못한 예외

---

### 성능 지표 (P95 레이턴시)

**목표 (P95 기준)**:

- 카드 조회: < 500ms
- 카드 완료: < 1s
- 인사이트 목록: < 300ms
- 음성 인텐트: < 2s
- 사기 검사: < 3s (LLM 호출 시)

**모니터링 도구**:

- Vercel Analytics (Web)
- Supabase Dashboard (DB 쿼리)
- Redis Insights (캐시 히트율)

**알림 임계값**:

- P95 > 2초: 경고
- P95 > 5초: 긴급
- 에러율 > 5%: 긴급
  \```

---

### 3. LLM 연동 고려사항

````markdown
## LLM 연동 고려사항

### 비용 관리

#### 하드캡 (Hard Cap)

\```python

# BFF

DAILY_LLM_LIMIT = 1000 # 요청/일

async def check_llm_quota():
today_count = await redis.get(f"llm:quota:{today}")
if today_count and int(today_count) >= DAILY_LLM_LIMIT:
raise QuotaExceededError("일일 LLM 호출 한도 초과")
\```

#### 입력 길이 제한

\```python
MAX_INPUT_LENGTH = 500 # 문자

def validate_input(text: str):
if len(text) > MAX_INPUT_LENGTH:
raise ValueError(f"입력은 {MAX_INPUT_LENGTH}자 이내로 제한됩니다.")
\```

#### 비용 추정

- OpenAI GPT-4: $0.03/1K tokens
- 예상 평균 입력: 200 tokens
- 예상 평균 출력: 100 tokens
- 요청당 비용: ~$0.009
- 1000 요청/일 = $9/일 = $270/월

---

### 프라이버시

#### 데이터 처리 원칙

- LLM에 전송 전 PII 제거 (이름, 전화번호, 이메일)
- 사용자 동의 없이 LLM 전송 금지
- LLM 응답 저장 시 익명화

#### 예시 (사기 검사)

\```python
def anonymize_for_llm(text: str) -> str: # 전화번호 → [전화번호]
text = re.sub(r'\d{2,3}-\d{3,4}-\d{4}', '[전화번호]', text) # 이름 (한글 2-4자) → [이름]
text = re.sub(r'[가-힣]{2,4}(?=님|씨)', '[이름]', text)
return text
\```

---

### 품질 관리

#### 폴백 전략

\```python
async def check_scam(text: str):
try: # 1차: LLM 호출
result = await llm_api.check_scam(text)
except (TimeoutError, QuotaExceededError): # 2차: 패턴 매칭 폴백
result = pattern_matcher.check_scam(text)
return result
\```

#### 사전 생성 콘텐츠

- 인사이트: LLM으로 생성 후 수동 검토 → DB 저장
- 카드: LLM 초안 → 편집팀 검토 → 배포
- 실시간 생성은 Q&A 요약만 (사용자 기대치 낮음)

#### 모델 선택

- **프로덕션**: GPT-4 (정확도 우선)
- **폴백**: GPT-3.5 Turbo (속도/비용)
- **로컬/스테이징**: Mock (비용 절감)
  \```

---

### 4. 향후 확장 아이디어

````markdown
## 향후 확장 아이디어

### 커뮤니티 확장

**현재 (MVP)**:

- 익명 Q&A
- 리액션 (👍, ❤️, 🙏)

**향후**:

- 댓글 기능 (답변에 댓글)
- DM (다이렉트 메시지) - 1:1 대화
- 랭킹 시스템 (월간 활동 TOP 10)
- 배지 전시 (프로필에 획득 배지 표시)
- 그룹 채팅 (관심사별 소그룹)

**구현 고려사항**:

- 댓글 스팸 방지 (rate limiting)
- DM은 블록 기능 필수
- 랭킹은 게임화와 통합

---

### 병원/지자체 연동

**아이디어**:

- 복약 정보를 병원 처방전에서 자동 가져오기
- 지자체 시니어 프로그램 안내 (강좌, 행사)
- 보건소 건강검진 알림

**구현 고려사항**:

- API 표준화 (FHIR 등)
- 개인정보 보호 (의료 데이터)
- 파트너십 필요 (병원, 지자체)

---

### 더 많은 도구 트랙

**현재**: Canva, 미리캔버스, Sora

**향후 추가**:

- ChatGPT 활용법 (질문 작성, 번역)
- 구글 포토 (앨범 만들기, 공유)
- 배민/쿠팡 (온라인 주문)
- 카카오톡 (단체방, 이모티콘)
- 유튜브 (채널 구독, 재생목록)

**구현 고려사항**:

- 각 도구마다 5-7 단계
- 스크린샷 필수
- 완료 인증 (스크린샷 업로드)

---

### AI 챗봇 (가상 비서)

**아이디어**:

- 24/7 질문 답변 챗봇
- "약 언제 먹어요?", "오늘 날씨는?" 등 일상 질문
- 카드/인사이트 추천

**구현 고려사항**:

- LLM 비용 (하드캡 필수)
- 환각(hallucination) 방지 (RAG 패턴)
- 사용자 피드백 수집 (👍👎)

---

### 오프라인 이벤트 연동

**아이디어**:

- 시니어 모임 주선 (지역별)
- 앱 사용법 강의 (온라인/오프라인)
- 챌린지 이벤트 (30일 연속 카드 완료)

**구현 고려사항**:

- 이벤트 관리 기능 (RSVP, 알림)
- 출석 체크 (QR 코드)
- 오프라인 지원 (종이 자료)
  \```

---

## ✅ 체크리스트

OPERATIONS_FUTURE 문서 작성 완료 후:

### 내용

- [ ] 환경 구분 (로컬/스테이징/프로덕션)
- [ ] 로깅·모니터링 (이벤트, 지표, 알림)
- [ ] LLM 연동 고려사항 (비용, 프라이버시, 품질)
- [ ] 향후 확장 아이디어 5+개

### 형식

- [ ] 환경별 차이점 명확히
- [ ] 코드 예시 (로깅, 하드캡, 폴백)
- [ ] 확장 아이디어에 구현 고려사항 포함

### 독자 테스트

- [ ] DevOps가 읽고 배포/모니터링 가능
- [ ] 미래 팀이 읽고 확장 방향 파악 가능

---

## 💡 작성 팁

### 환경별 차이 표

| 항목        | Local  | Staging     | Production    |
| ----------- | ------ | ----------- | ------------- |
| 로그 레벨   | DEBUG  | INFO        | INFO          |
| LLM 호출    | Mock   | 실제 (제한) | 실제 (하드캡) |
| 에러 트래킹 | 콘솔   | Sentry      | Sentry        |
| 알림        | 비활성 | 비활성      | 활성          |

### 비용 추정

- 구체적인 숫자로 (예: $270/월)
- 하드캡 필요성 강조

### 확장 아이디어

- "하면 좋을 것 같은" 수준 (구현 확정X)
- 각 아이디어마다 고려사항 명시

---

## 🔗 완료

모든 DOCS 가이드 작성 완료! 🎉

- ✅ [01. Root README Guide](./01-root-readme-guide.md)
- ✅ [02. Architecture Doc](./02-architecture-doc.md)
- ✅ [03. API Reference](./03-api-reference.md)
- ✅ [04. UX & A11y Notes](./04-ux-a11y-notes.md)
- ✅ [05. Operations & Future](./05-operations-future.md)

**다음 단계**: 실제 문서 작성 시작 (README.md, docs/ARCHITECTURE.md 등)

---

**문서 작성**: AI Documentation Guide  
**최종 업데이트**: 2025년 11월 14일
````
````
````
````
