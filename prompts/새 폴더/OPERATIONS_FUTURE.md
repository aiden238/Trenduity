# Operations & Future

> **대상**: DevOps, 미래 팀  
> **목적**: 배포 전략, 모니터링, 향후 확장 계획

---

## 🌍 환경 구분

### 로컬 (Local)

- **용도**: 개발자 로컬 개발
- **DB**: Docker Compose (Postgres)
- **Redis**: Docker Compose
- **BFF**: `uvicorn --reload`
- **Web**: `pnpm dev`
- **Mobile**: Expo Go (개발 빌드)

**환경 변수**:
```bash
DATABASE_URL=postgresql://localhost:54322/postgres
REDIS_URL=redis://localhost:6379
SUPABASE_URL=http://localhost:54321
```

---

### 스테이징 (Staging)

- **용도**: QA, 내부 테스트
- **DB**: Supabase (무료 티어)
- **Redis**: Upstash (무료 티어)
- **BFF**: Railway/Fly.io
- **Web**: Vercel (preview)
- **Mobile**: Expo Dev Build (TestFlight/Internal Testing)

**도메인**:
- Web: `https://staging.example.com`
- BFF: `https://bff-staging.example.com`

---

### 프로덕션 (Production)

- **용도**: 실제 사용자
- **DB**: Supabase (Pro 티어)
- **Redis**: Upstash (Standard 티어)
- **BFF**: Railway/Fly.io (Production)
- **Web**: Vercel (Production)
- **Mobile**: App Store / Google Play

**도메인**:
- Web: `https://app.example.com`
- BFF: `https://api.example.com`

**백업**:
- DB: 일 1회 자동 백업 (Supabase)
- Redis: AOF 활성화

---

## 📊 로깅 & 모니터링

### 로깅 이벤트

#### 사용자 행동

| 이벤트 | 설명 | 필드 |
|--------|------|------|
| `card_view` | 카드 조회 | `user_id`, `card_id` |
| `card_complete` | 카드 완료 | `user_id`, `card_id`, `quiz_correct`, `points_earned` |
| `voice_intent` | 음성 명령 | `user_id`, `intent`, `success` |
| `scam_check` | 사기검사 | `user_id`, `risk_level` |
| `qna_post` | 질문 작성 | `user_id`, `topic` |
| `family_link` | 가족 연동 | `senior_id`, `guardian_id` |
| `med_check` | 복약 체크 | `user_id`, `checked` |

#### 시스템 이벤트

| 이벤트 | 설명 | 필드 |
|--------|------|------|
| `api_request` | API 요청 | `method`, `path`, `status_code`, `duration_ms` |
| `db_query` | DB 쿼리 | `query`, `duration_ms` |
| `cache_hit` | Redis 캐시 적중 | `key`, `ttl` |
| `error` | 에러 발생 | `error_type`, `message`, `stack_trace` |

### audit_logs 테이블

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 예시
INSERT INTO audit_logs (user_id, action, details)
VALUES (
  '123',
  'card_complete',
  '{"card_id": "456", "points_earned": 50}'::jsonb
);
```

---

### 성능 지표 (P95)

| 메트릭 | 목표 | 현재 | 도구 |
|--------|------|------|------|
| API 응답 시간 | < 300ms | 250ms | Vercel Analytics |
| DB 쿼리 | < 50ms | 40ms | Supabase Dashboard |
| Redis 응답 | < 10ms | 5ms | Upstash Dashboard |
| 카드 로딩 | < 200ms | 180ms | Frontend Metrics |

---

### 에러 추적

- **도구**: Sentry (프로덕션)
- **알림**: Slack 채널 (#alerts)
- **임계치**:
  - 에러율 5% 초과 시 즉시 알림
  - API 응답 시간 P95 > 500ms 시 알림

---

## 🤖 LLM 연동 시 고려사항

### 비용 관리

#### 월 예산
- **개발**: $10 (테스트용)
- **스테이징**: $20
- **프로덕션**: $100 (하드캡)

#### 하드캡 구현
```python
# services/llm_guard.py
import os
from datetime import datetime

MONTHLY_CAP = float(os.getenv('LLM_MONTHLY_CAP', '100'))

def check_budget():
    current_month = datetime.now().strftime('%Y-%m')
    spent = get_monthly_spending(current_month)
    
    if spent >= MONTHLY_CAP:
        raise Exception(f"LLM budget exceeded: ${spent:.2f} / ${MONTHLY_CAP}")
    
    return MONTHLY_CAP - spent
```

---

### 사전생성 (Pre-generation)

#### Insight AI 요약
```python
# 매일 밤 12시 실행 (Cron)
# scripts/pregenerate_insights.py

async def pregenerate_summaries():
    insights = await fetch_new_insights()
    
    for insight in insights:
        summary = await llm.summarize(insight.body, max_tokens=50)
        await db.update(insight.id, ai_summary=summary)
        await cache.set(f"insight:{insight.id}:summary", summary, ttl=86400)
```

#### Q&A AI 요약
```python
# Q&A 작성 후 5분 뒤 비동기 생성
async def generate_qna_summary(post_id):
    post = await fetch_qna_post(post_id)
    summary = await llm.summarize(post.body, max_tokens=30)
    await db.update(post_id, ai_summary=summary)
```

---

### 폴백 전략

```python
# services/llm_service.py

async def get_qna_summary(post_id):
    try:
        # 1. 캐시 확인
        cached = await cache.get(f"qna:{post_id}:summary")
        if cached:
            return cached
        
        # 2. DB에 사전생성된 요약 확인
        post = await db.get_qna_post(post_id)
        if post.ai_summary:
            return post.ai_summary
        
        # 3. LLM 호출 (예산 확인)
        check_budget()
        summary = await llm.summarize(post.body)
        await cache.set(f"qna:{post_id}:summary", summary, ttl=3600)
        return summary
        
    except Exception as e:
        # 4. 폴백: 규칙 기반 요약
        return rule_based_summary(post.body)

def rule_based_summary(text):
    # 첫 50자 + "..."
    return text[:50] + "..." if len(text) > 50 else text
```

---

### 프라이버시

- ❌ **절대 LLM에 전송하지 않을 데이터**:
  - 개인 식별 정보 (이름, 전화번호, 주소)
  - 의료 정보 (복약 기록)
  - 가족 관계 정보

- ✅ **LLM에 전송 가능한 데이터**:
  - 익명화된 Q&A 질문/답변
  - Insight 본문 (공개 정보)
  - 음성 명령 텍스트 (개인정보 제거 후)

---

### 품질 관리

#### Prompt Template
```python
SUMMARIZE_PROMPT = """
다음 질문을 50자 이내로 요약해주세요.
- 존댓말 사용
- 핵심만 간결하게
- 이모지 사용 금지

질문: {question}

요약:
"""
```

#### 후처리 검증
```python
def validate_summary(summary):
    # 길이 체크
    if len(summary) > 50:
        return summary[:47] + "..."
    
    # 금지어 체크
    forbidden = ["XXX", "광고", "스팸"]
    if any(word in summary for word in forbidden):
        return "[요약 생성 실패]"
    
    return summary
```

---

## 🚀 향후 확장 아이디어

### Phase 2: 더 풍부한 커뮤니티

- **댓글 기능**: Q&A 게시글에 댓글 달기
- **DM**: 1:1 메시지 (시니어 간)
- **랭킹**: 월간 포인트 상위 10명 표시
- **뱃지 시스템 확장**: 30개 이상 배지

---

### Phase 3: 병원/지자체 연동

- **건강검진 알림**: 국민건강보험공단 API 연동
- **복지혜택 추천**: 지역별 시니어 복지 프로그램 안내
- **병원 예약**: 공공병원 예약 시스템 연동

---

### Phase 4: 더 많은 도구 트랙

- **Microsoft Copilot**: Office 365 활용법
- **Photoshop AI**: 사진 편집 기초
- **ChatGPT**: 일상 대화 활용법
- **노션(Notion)**: 개인 일정 관리

---

### Phase 5: 오프라인 연계

- **시니어 모임**: 지역별 오프라인 모임 (월 1회)
- **워크숍**: AI 도구 실습 워크숍
- **가족 데이**: 자녀/손주와 함께하는 체험 행사

---

## 🔒 보안 체크리스트

### 배포 전

- [ ] 모든 API 엔드포인트에 인증 필요
- [ ] RLS 정책 모든 테이블에 적용
- [ ] 환경 변수 `.env`에 민감 정보
- [ ] HTTPS 강제 (프로덕션)
- [ ] CORS 설정 (허용 도메인만)

### 정기 점검

- [ ] 의존성 보안 업데이트 (월 1회)
- [ ] DB 백업 확인 (주 1회)
- [ ] 로그 확인 (일 1회)
- [ ] 사용자 신고 검토 (주 1회)

---

## 📈 성장 지표 (OKR)

### Q1 2026 목표

- **Objective**: 시니어 1,000명 온보딩
  - KR1: DAU 300명
  - KR2: 카드 완료율 70%
  - KR3: 가족 연동율 50%

### Q2 2026 목표

- **Objective**: 커뮤니티 활성화
  - KR1: Q&A 일일 게시글 20개
  - KR2: 평균 리액션 수 3개/게시글
  - KR3: 월간 활성 사용자 (MAU) 2,000명

---

## 🛠️ 기술 부채 관리

### 우선순위 높음 (3개월 이내)

- [ ] BFF 테스트 커버리지 80% 달성
- [ ] Redis 캐싱 전략 문서화
- [ ] 에러 메시지 한글화 100%

### 우선순위 중간 (6개월 이내)

- [ ] DB 마이그레이션 도구 개선 (Alembic)
- [ ] CI/CD 파이프라인 E2E 테스트 추가
- [ ] 모니터링 대시보드 구축 (Grafana)

### 우선순위 낮음 (1년 이내)

- [ ] 모노레포 빌드 속도 개선
- [ ] TypeScript strict 모드 전환
- [ ] 코드 스타일 가이드 문서화

---

**작성**: AI Operations Guide  
**업데이트**: 2025년 11월 13일
