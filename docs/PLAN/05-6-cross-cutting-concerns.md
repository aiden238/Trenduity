# 6. Cross-Cutting Concerns

## 6.1 Error Handling

### Client-Side Patterns

**3단계 에러 표시**:

1. **Toast/Snackbar** (일시적 에러):
   - 네트워크 타임아웃, 일시적 서버 오류
   - 3-5초 자동 사라짐
   - 예시: "네트워크가 불안정해요. 잠시 후 다시 시도해 주세요."

2. **Inline 에러** (필드별 검증 오류):
   - 입력 폼 아래 빨간색 텍스트
   - 예시: "제목은 100자 이내로 작성해 주세요."

3. **Full-Page 에러** (치명적 오류):
   - 로그인 실패, 권한 없음, 앱 크래시
   - 전체 화면 에러 페이지 + 홈으로 돌아가기 버튼
   - 예시: "로그인이 만료되었어요. 다시 로그인해 주세요."

**에러 메시지 원칙**:
- **한국어 존댓말**: "~해요", "~주세요"
- **부정적 단어 최소화**: "실패", "오류" 대신 "불안정", "확인 필요"
- **행동 유도**: "다시 시도", "설정 확인", "가족에게 문의"
- **70대 고려**: 기술 용어 배제, 한 줄로 요약

**재시도 로직**:
- 네트워크 오류: 자동 재시도 1회 (exponential backoff)
- 서버 오류(5xx): 사용자에게 재시도 버튼 제공
- 클라이언트 오류(4xx): 재시도 불가, 입력 수정 유도

### Server-Side Patterns

**로깅 형식** (구조화된 JSON):
```json
{
  "timestamp": "2025-11-13T09:30:00Z",
  "level": "ERROR",
  "service": "bff-fastapi",
  "endpoint": "/cards/123/complete",
  "user_id": "uuid",
  "error_type": "ValidationError",
  "message": "Card already completed",
  "stack_trace": "...",
  "request_id": "req-abc123"
}
```

**에러 레벨**:
- **DEBUG**: 상세 흐름 (개발 환경만)
- **INFO**: 정상 요청 (성공한 API 호출)
- **WARN**: 비정상이지만 처리 가능 (레이트 리미팅, 중복 요청)
- **ERROR**: 예외 발생 (검증 실패, DB 오류)
- **CRITICAL**: 서비스 중단 위험 (DB 연결 끊김, Redis 장애)

**알림 트리거**:
- ERROR 5건/분 → Slack 알림
- CRITICAL 1건 → 즉시 전화/SMS

### Error Envelopes

**표준 응답 형식**:

**성공 (200 OK)**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "req-abc123",
    "timestamp": "2025-11-13T09:30:00Z"
  }
}
```

**실패 (4xx/5xx)**:
```json
{
  "success": false,
  "error": {
    "code": "CARD_ALREADY_COMPLETED",
    "message": "이미 완료한 카드예요.",
    "details": {
      "card_id": "uuid",
      "completed_at": "2025-11-13T08:00:00Z"
    }
  },
  "meta": {
    "request_id": "req-abc123",
    "timestamp": "2025-11-13T09:30:00Z"
  }
}
```

**에러 코드 네이밍**:
- `RESOURCE_NOT_FOUND`: 404
- `VALIDATION_ERROR`: 400
- `RATE_LIMIT_EXCEEDED`: 429
- `UNAUTHORIZED`: 401
- `FORBIDDEN`: 403
- `INTERNAL_SERVER_ERROR`: 500

## 6.2 Logging & Audit

### What to Log

**필수 로그**:
- 모든 API 요청/응답 (엔드포인트, 메서드, 상태 코드, 소요 시간)
- 인증/인가 이벤트 (로그인, 토큰 갱신, 권한 거부)
- 비즈니스 중요 이벤트:
  - 카드 완료, 퀴즈 제출
  - 사기검사 실행 (판정 결과 포함)
  - 음성 인텐트 파싱 (call/sms는 audit_logs에도 기록)
  - 가족 링크 생성/승인/거절
  - 복약 체크
- 에러 및 예외 (스택 트레이스 포함)
- 외부 API 호출 (LLM, 푸시 알림)

**선택적 로그**:
- 포인트 지급 (point_transactions 테이블에 기록)
- 페이지 뷰 (분석 목적)

### What NOT to Log

**절대 금지**:
- **비밀번호** (해시만 저장, 로그 제외)
- **Supabase service_role 키** (환경변수만)
- **전체 JWT 토큰** (user_id만 로그)
- **카드 번호, 계좌번호** (사용자 입력 시 마스킹: `****-1234`)
- **주민등록번호** (수집하지 않음)
- **민감한 개인정보** (건강 정보, 위치 정보 - 복약 체크는 날짜만)

**마스킹 규칙**:
- 전화번호: `010-****-5678`
- 이메일: `u***@example.com`
- 계좌번호: `****-****-1234`

### Audit Trail

**audit_logs 테이블 기록 대상**:
- 민감 작업:
  - 음성 인텐트: call, sms (실제 실행 시)
  - 사기검사 (danger 판정)
  - 가족 링크 생성/승인 (데이터 접근 권한 변경)
- 관리자 작업:
  - 스폰서 코드 생성
  - 사용자 역할 변경 (향후)
- 데이터 삭제:
  - Q&A 게시글 삭제 (soft delete)
  - 가족 링크 해제

**보관 기간**:
- audit_logs: 1년 (법적 요구사항 고려)
- 일반 로그: 30일 (압축 후 90일 보관)

## 6.3 Performance & Cost

### Caching Strategy

**Redis 캐싱**:

1. **사용자 프로필** (읽기 빈도 매우 높음):
   - Key: `profile:{user_id}`
   - TTL: 1시간
   - 갱신: 프로필 수정 시 즉시 invalidate

2. **오늘의 카드** (같은 날짜 동일 데이터):
   - Key: `card:today:{user_id}`
   - TTL: 1시간 (자정 이후 자동 만료)
   - 갱신: 완료 시 즉시 invalidate

3. **인사이트 토픽별 목록**:
   - Key: `insights:{topic}:latest`
   - TTL: 10분
   - 갱신: 신규 인사이트 발행 시 invalidate

4. **게임화 데이터** (빈번한 조회):
   - Key: `gamification:{user_id}`
   - TTL: 5분
   - 갱신: 포인트 지급 시 즉시 업데이트

5. **레이트 리미팅**:
   - Key: `ratelimit:{action}:{user_id}`
   - TTL: 60초 (window 크기)
   - 예시: `ratelimit:scam_check:uuid`, 5회/분

**클라이언트 캐싱** (모바일):
- AsyncStorage: 마지막 조회한 카드 (오프라인 대비)
- SQLite: 완료한 카드 히스토리 (7일치)
- 메모리 캐시: 현재 세션 동안 프로필, 게임화 데이터

### Pagination Requirements

**필수 페이지네이션 엔드포인트**:

1. **인사이트 목록**:
   - `GET /insights?topic=ai&page=1&limit=10`
   - 기본 limit: 10, 최대 50

2. **Q&A 목록**:
   - `GET /community/qna?subject=폰&page=1&limit=20`
   - 기본 limit: 20, 최대 100

3. **알림 목록** (가족 웹):
   - `GET /family/alerts?page=1&limit=30`
   - 기본 limit: 30, 최대 100

4. **감사 로그** (관리자):
   - `GET /admin/audit?page=1&limit=50`
   - 기본 limit: 50, 최대 200

**페이지네이션 응답 형식**:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_items": 156,
    "total_pages": 16,
    "has_next": true,
    "has_prev": false
  }
}
```

### P95 Targets

**클라이언트 측 (모바일 앱)**:
- 홈 화면 렌더링: < 1초 (초기 로딩)
- 카드 상세 조회: < 500ms
- TTS 재생 시작: < 300ms
- 음성 인텐트 파싱: < 1초 (STT 제외)

**서버 측 (BFF)**:
- 읽기 전용 API: P95 < 200ms
  - 예시: `GET /cards/today`, `GET /insights?topic=ai`
- 쓰기 API (단순): P95 < 500ms
  - 예시: `POST /cards/{id}/complete` (gamification 포함)
- 쓰기 API (복잡): P95 < 1000ms
  - 예시: `POST /voice/parse` (연락처 조회 포함)
  - 예시: `POST /scam/check` (룰 엔진 실행)

**Supabase 직접 조회**:
- 간단 SELECT: P95 < 100ms
- JOIN 쿼리: P95 < 300ms

**Redis**:
- GET/SET: P95 < 10ms (Upstash 기준)

### LLM Cost Guards

**초기 MVP는 LLM 최소 사용** (룰 기반 우선):
- 음성 파싱: 룰 기반 (정규표현식)
- 사기검사: 룰 기반 (키워드 매칭)
- Q&A 요약: 룰 기반 (첫 50자)

**향후 LLM 도입 시 가드**:

1. **입력 길이 제한**:
   - 카드 요약: 최대 1000자
   - 사기검사: 최대 2000자
   - Q&A 요약: 최대 500자

2. **월 예산 제한**:
   - 사용자당 월 10회 LLM 호출 제한
   - 전체 월 예산: $500 (토큰 수 추산)
   - Redis로 사용량 추적: `llm_usage:{user_id}:{month}`

3. **폴백 전략**:
   - LLM 실패 시 룰 기반으로 폴백
   - 타임아웃: 5초 (LLM 응답 대기)
   - 예시: Q&A 요약 실패 → 제목 복사

4. **캐싱**:
   - 동일 입력 → Redis에 24시간 캐시
   - Key: `llm:scam_check:{hash(input)}`

## 6.4 Security & Privacy

### Authentication Model

**Supabase Auth 사용**:
- **제공자**: Email/Password, 소셜 로그인 (Google, 향후 Naver/Kakao)
- **토큰**: JWT (Access Token + Refresh Token)
- **역할**: `role` 필드로 구분 (`user`, `guardian`, `org`)

**토큰 검증 흐름**:
1. 클라이언트 → API 요청 (Authorization: Bearer {token})
2. BFF middleware → Supabase Auth API 호출 (토큰 검증)
3. 유효하면 user_id 추출 → request.state.user
4. 무효하면 401 Unauthorized

**세션 관리**:
- 모바일: AsyncStorage에 토큰 저장 (보안 스토리지 고려)
- 웹: HttpOnly 쿠키 (XSS 방어)
- Refresh Token: 7일 유효, Access Token: 1시간 유효

### Row-Level Security

**Supabase RLS 정책**:

**읽기 전용 테이블 (클라이언트 직접 조회)**:
- `cards`: 본인 카드만 (`auth.uid() = user_id`)
- `insights`: 공개 인사이트만 (`is_published = true`)
- `qna_posts`: 삭제되지 않은 게시글 또는 본인 게시글
- `gamification`: 본인 데이터만

**쓰기 금지 (BFF만 가능)**:
- `cards`, `gamification`, `audit_logs` 등
- 클라이언트는 읽기 전용, BFF가 service_role로 쓰기

**다중 조건 RLS 예시** (family_links):
```sql
-- 시니어와 가족 모두 자기 링크만 조회
CREATE POLICY "Users can view own family links"
ON family_links FOR SELECT
USING (
  auth.uid() = senior_id OR auth.uid() = guardian_id
);
```

### Family Delegation

**가족 데이터 접근 규칙**:

1. **family_links 확인**:
   - guardian_id = {current_user}
   - senior_id = {target_user}
   - status = 'active'

2. **접근 가능 데이터**:
   - **프로필**: nickname, age_band, a11y_mode (민감 정보 제외)
   - **사용량**: usage_counters (집계 데이터만)
   - **카드**: 완료 여부만 (completed_at), 내용은 제외
   - **복약**: med_checks (날짜, 시간대만)

3. **접근 불가 데이터**:
   - Q&A 게시글 내용
   - 사기검사 입력 텍스트
   - 음성 인텐트 원문
   - 퀴즈 정답/오답

**권한 검증 (BFF)**:
```python
async def verify_family_access(guardian_id: UUID, senior_id: UUID):
    link = await db.get_family_link(guardian_id, senior_id)
    if not link or link.status != 'active':
        raise HTTPException(403, "접근 권한이 없습니다.")
```

### Data Access Control

**최소 권한 원칙**:
- 모바일 앱: `anon_key` 사용 (RLS 보호)
- BFF: `service_role` 사용 (RLS 우회, 코드에서 검증)
- 웹 콘솔: `anon_key` + guardian 역할 토큰

**API 키 관리**:
- 환경변수로 주입 (`.env` 파일, 절대 커밋 금지)
- CI/CD: Secret Manager 사용 (GitHub Secrets, AWS Secrets Manager)
- 로컬 개발: `.env.local` (`.gitignore`에 추가)

**HTTPS 필수**:
- 프로덕션: 모든 API는 HTTPS only
- 개발: localhost는 HTTP 허용

**CORS 설정**:
- 모바일: `*` 허용 (네이티브 앱은 CORS 무관)
- 웹: 특정 도메인만 허용 (예: `https://family.ourapp.com`)

---
