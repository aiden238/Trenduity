# 8. Risks & Mitigations

## Risk 1: Over-complicated UI for 70+

### Likelihood
**Medium** - 설계 단계에서 단순화를 목표로 하지만, 기능 추가 시 복잡도 증가 가능성

### Impact
**High** - 70대가 앱을 포기하면 핵심 타겟 세그먼트 이탈

### Detection
- **조기 발견 방법**:
  - Week 2부터 70대 테스터 1-2명 초대 (주간 피드백)
  - 화면당 버튼 개수 카운트 (ultra 모드는 최대 3개 제한)
  - 가족 인터뷰: "어르신이 혼자 사용하기 어려운 부분이 있나요?"

### Mitigation
- **예방**:
  - 초간단 모드(ultra)는 홈에 버튼 3개만 (카드, 복약, 음성)
  - 모든 기능에 "건너뛰기" 옵션
  - 필수 흐름 외 기능은 "더보기" 메뉴에 숨김
- **대응**:
  - Week 3-4에 "초간단 홈" 별도 컴포넌트 개발
  - 가족 대시보드에서 "추천 모드" 제안 기능 (70대 → ultra 자동 권장)

## Risk 2: RLS Misconfiguration

### Likelihood
**Medium** - Supabase RLS는 설정 오류 시 데이터 유출 가능

### Impact
**Critical** - 다른 사용자의 카드/복약 정보 노출 → 개인정보 침해

### Detection
- **조기 발견 방법**:
  - Week 1부터 RLS 정책 테스트 자동화 (Supabase Test Suite)
  - 매주 금요일: 수동 권한 체크 (테스트 계정 A로 B의 데이터 조회 시도)
  - Supabase Dashboard에서 RLS 정책 코드 리뷰 (peer review)

### Mitigation
- **예방**:
  - 모든 테이블에 RLS 활성화 강제 (Supabase 설정)
  - 클라이언트는 `anon_key`만 사용 (service_role 절대 포함 금지)
  - BFF에서도 최소 권한 검증 (user_id 확인)
- **대응**:
  - 정책 위반 감지 시 즉시 테이블 접근 차단 + 긴급 패치
  - 영향 받은 사용자 식별 → 개인정보 유출 여부 확인 → 통지

## Risk 3: LLM Cost Spike

### Likelihood
**Low** (초기 MVP는 LLM 미사용) → **Medium** (향후 LLM 도입 시)

### Impact
**Medium** - 예산 초과 시 서비스 일부 중단 또는 품질 저하

### Detection
- **조기 발견 방법**:
  - Redis에 월별 LLM 사용량 추적 (`llm_usage:{month}`)
  - 일일 예산 50% 도달 시 Slack 알림
  - 일일 예산 80% 도달 시 경고 + 속도 제한

### Mitigation
- **예방**:
  - 초기 MVP는 룰 기반만 사용 (비용 0)
  - LLM 도입 시:
    - 사용자당 월 10회 제한
    - 입력 길이 제한 (1000자)
    - 캐싱 (Redis, 동일 입력 재사용)
- **대응**:
  - 예산 초과 시 자동으로 룰 기반 폴백
  - 월말까지 LLM 기능 일시 비활성화 (사용자에게 공지)

## Risk 4: Redis Outage

### Likelihood
**Low** - Upstash는 고가용성이지만 완전 무장애는 아님

### Impact
**Medium** - 캐싱/레이트 리미팅 실패 → 성능 저하, 악용 가능성

### Detection
- **조기 발견 방법**:
  - BFF에서 Redis 연결 실패 시 ERROR 로그 + Slack 알림
  - Health check 엔드포인트에 Redis 상태 포함
  - 매분 자동 핑 (Upstash 대시보드 모니터링)

### Mitigation
- **예방**:
  - Redis 연결 실패 시 graceful degradation:
    - 캐싱 실패 → Supabase 직접 조회 (느리지만 작동)
    - 레이트 리미팅 실패 → 제한 없이 허용 (단기간 악용 감수)
  - Redis 타임아웃 1초 설정 (장애 시 빠른 폴백)
- **대응**:
  - Upstash 장애 확인 → 상태 페이지 확인
  - 대체 Redis 인스턴스 준비 (Failover, NICE)
  - 복구 후 캐시 워밍 (주요 데이터 미리 로드)

## Risk 5: Overscoped Community Features

### Likelihood
**High** - 커뮤니티는 요구사항이 끝없이 확장됨 (댓글, 좋아요, 신고, 검색 등)

### Impact
**Medium** - 개발 일정 지연, MVP 출시 지연

### Detection
- **조기 발견 방법**:
  - Week 5 중간 체크: Q&A 기본 기능만 구현되었는지 확인
  - 기능 요청 시 "MUST/SHOULD/NICE" 재분류
  - 팀 회의: "이 기능이 없으면 MVP 출시 불가한가?" 질문

### Mitigation
- **예방**:
  - MVP 범위 명확화: Q&A 작성, 조회, 단일 투표만
  - 댓글, 이미지 첨부, 신고 기능은 **POST-MVP**
  - Week 5는 3일만 커뮤니티에 할당 (나머지는 가족 기능)
- **대응**:
  - 범위 초과 감지 시 즉시 중단 → NICE로 이동
  - 출시 후 사용자 피드백으로 우선순위 재조정

## Risk 6: TTS/Voice Recognition Quality

### Likelihood
**Medium** - expo-speech는 OS 의존, 디바이스마다 품질 차이

### Impact
**Medium** - 음성 기능 불만 → 70대 사용자 이탈

### Detection
- **조기 발견 방법**:
  - Week 3부터 다양한 디바이스 테스트 (iOS, Android, 저가형 폰)
  - 음성 인식 실패율 로깅 (BFF에서 `confidence < 0.5` 비율 추적)
  - 사용자 피드백: "음성 기능 만족도" 설문 (5점 척도)

### Mitigation
- **예방**:
  - TTS는 모든 텍스트에 선택적 제공 (필수 아님)
  - 음성 인식 실패 시 명확한 안내: "다시 말씀해 주세요" + 예시 문장
  - 소음 환경 감지 → "조용한 곳에서 시도해 주세요" 힌트
- **대응**:
  - 인식률 < 60% → 외부 STT API 도입 고려 (Google Cloud Speech, 비용 검토)
  - 대체 입력 방법 제공 (텍스트로 인텐트 입력)

## Risk 7: Family Dashboard Complexity

### Likelihood
**Medium** - 가족이 원하는 정보와 시니어 프라이버시 균형이 어려움

### Impact
**Medium** - 가족 불만 (정보 부족) 또는 시니어 불만 (감시받는 느낌)

### Detection
- **조기 발견 방법**:
  - Week 5 가족 인터뷰: "보고 싶은 정보가 더 있나요?"
  - 시니어 인터뷰: "가족이 내 정보를 보는 것이 불편한가요?"
  - 대시보드 사용 로그 분석 (어떤 페이지를 자주 보는지)

### Mitigation
- **예방**:
  - 프라이버시 우선: 구체적 내용 제외, 요약만 제공
  - 대시보드 메인: "괜찮은지" 한눈에 (카드 완료율, 복약 연속)
  - 상세 페이지: 날짜별 집계 (카드 제목은 숨김)
- **대응**:
  - 피드백 기반 조정: "카드 제목 보기" 옵션 추가 (시니어 동의 필요)
  - 프라이버시 설정: 시니어가 가족에게 보여줄 정보 선택

## Risk 8: Data Migration Issues

### Likelihood
**Low** (초기 MVP는 신규 데이터만) → **Medium** (향후 스키마 변경 시)

### Impact
**High** - 마이그레이션 실패 → 데이터 손실 또는 서비스 중단

### Detection
- **조기 발견 방법**:
  - 모든 마이그레이션은 로컬에서 먼저 테스트
  - Supabase Migration 파일 버전 관리 (Git)
  - 프로덕션 마이그레이션 전 백업 자동화 (pg_dump)

### Mitigation
- **예방**:
  - Week 1-2에 주요 테이블 스키마 확정 (변경 최소화)
  - 컬럼 추가는 허용, 삭제/타입 변경은 신중 검토
  - `ALTER TABLE` 대신 새 테이블 + 데이터 복사 + 원자적 스왑
- **대응**:
  - 마이그레이션 실패 시 즉시 롤백 (Supabase 백업 복원)
  - 다운타임 최소화: 읽기 전용 모드 → 마이그레이션 → 정상화

## Risk 9: Third-Party API Dependencies

### Likelihood
**Low** (초기 MVP는 Supabase, Redis, Expo만) → **Medium** (향후 LLM, 푸시 등)

### Impact
**Medium** - 외부 API 장애 → 일부 기능 불가

### Detection
- **조기 발견 방법**:
  - BFF에서 외부 API 호출 타임아웃 로깅
  - 외부 API 응답 시간 모니터링 (P95)
  - 상태 페이지 구독 (Supabase Status, Upstash Status)

### Mitigation
- **예방**:
  - 중요 기능은 외부 API 의존도 최소화 (카드 조회는 Supabase만)
  - 외부 API 호출에 타임아웃 설정 (3-5초)
  - Circuit Breaker 패턴 (연속 실패 시 일시 차단)
- **대응**:
  - LLM 실패 → 룰 기반 폴백
  - 푸시 알림 실패 → 앱 내 알림으로 대체
  - Supabase 장애 → 서비스 중단 공지 (대체 불가능)

## Risk 10: Accessibility Compliance

### Likelihood
**Medium** - WCAG 2.1 AA 준수는 세부 요구사항 많음

### Impact
**Medium** - 접근성 미달 → 70대 사용 불가, 법적 리스크 (장애인차별금지법)

### Detection
- **조기 발견 방법**:
  - Week 2부터 접근성 자동 검사 도구 (axe, Lighthouse)
  - 매주 1회 수동 체크: 스크린 리더 테스트 (TalkBack, VoiceOver)
  - 터치 타겟 크기 측정 (개발자 도구)

### Mitigation
- **예방**:
  - 컴포넌트 개발 시 접근성 우선:
    - 터치 영역 최소 44x44dp (normal), 80x80dp (ultra)
    - 색상 대비 최소 4.5:1 (WCAG AA)
    - 모든 아이콘 버튼에 라벨 (accessibilityLabel)
  - TTS 지원을 모든 주요 텍스트에 기본 제공
- **대응**:
  - Week 6에 접근성 전담 테스트 2일 할당
  - 미달 항목 발견 시 우선순위 MUST로 상향 → 출시 전 필수 해결

---
