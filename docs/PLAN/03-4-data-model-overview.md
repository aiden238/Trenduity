# 4. Data Model Overview

## 4.1 Core Tables

### profiles

**목적**: 사용자 기본 정보 및 설정 저장

**주요 필드**:
- `id` (UUID, PK): Supabase Auth user_id와 동일
- `role` (ENUM): `user` (시니어), `guardian` (가족), `org` (기관)
- `nickname` (TEXT): 표시 이름
- `age_band` (TEXT): `50s`, `60s`, `70s` (선택적)
- `a11y_mode` (ENUM): `normal`, `easy`, `ultra`
- `preferences_json` (JSONB): 폰트, 대비, TTS 속도, 알림 설정 등
- `created_at`, `updated_at` (TIMESTAMP)

**관계**:
- 1:N → cards (사용자별 카드)
- 1:N → gamification (사용자별 게임화 데이터)
- N:M → family_links (시니어 ↔ guardian)

**권한**:
- **본인**: 읽기/쓰기
- **guardian**: 연결된 시니어의 일부 필드 읽기 (nickname, age_band, a11y_mode)
- **org**: 소속 시니어의 통계 읽기 (개인정보 제외)

### cards

**목적**: 일일 카드 메타데이터 및 사용자별 완료 상태

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `date` (DATE): 카드 발행 날짜
- `type` (ENUM): `ai`, `trend`, `safety`, `mobile`
- `title`, `tldr`, `body`, `impact` (TEXT)
- `quiz_json` (JSONB): [{ question, options, correct_idx, explanation }]
- `status` (ENUM): `pending`, `active`, `completed`
- `completed_at` (TIMESTAMP)
- `quiz_score` (FLOAT): 0.0-1.0

**관계**:
- N:1 → profiles (사용자)
- 1:N → reactions (반응)

**권한**:
- **본인**: 자기 카드만 읽기/완료
- RLS: `auth.uid() = cards.user_id`

**인덱싱**:
- `(user_id, date)`: 특정 날짜 카드 조회
- `(user_id, status)`: 미완료 카드 조회
- `created_at DESC`: 최근 카드 목록

### courses

**목적**: 학습 코스 메타데이터 (초기 MVP에서는 미사용, 향후 확장)

**주요 필드**:
- `id` (UUID, PK)
- `title`, `description` (TEXT)
- `difficulty` (ENUM): `beginner`, `intermediate`, `advanced`
- `duration_minutes` (INT)
- `is_published` (BOOL)

**관계**:
- 1:N → course_enrollments (수강 신청)

### course_enrollments

**목적**: 사용자별 코스 수강 상태

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `course_id` (UUID, FK → courses.id)
- `status` (ENUM): `enrolled`, `in_progress`, `completed`
- `progress_percent` (FLOAT): 0.0-100.0
- `enrolled_at`, `completed_at` (TIMESTAMP)

**권한**:
- **본인**: 자기 수강 정보만 읽기/쓰기

### family_links

**목적**: 시니어-가족 연결 관계

**주요 필드**:
- `id` (UUID, PK)
- `senior_id` (UUID, FK → profiles.id, role=user)
- `guardian_id` (UUID, FK → profiles.id, role=guardian)
- `relation` (TEXT): "아들", "딸", "배우자", "친구" 등
- `status` (ENUM): `pending`, `active`, `rejected`
- `invited_at`, `accepted_at` (TIMESTAMP)

**관계**:
- N:1 → profiles (senior)
- N:1 → profiles (guardian)

**권한**:
- **senior**: 자기 링크 조회/수락/거절
- **guardian**: 자기 링크 조회, 초대 생성
- RLS: `auth.uid() IN (senior_id, guardian_id)`

**인덱싱**:
- `(senior_id, status)`: 시니어별 활성 링크
- `(guardian_id, status)`: 가족별 관리 대상

### sponsor_codes

**목적**: 기관 스폰서 코드 관리 (무료 접근 권한)

**주요 필드**:
- `id` (UUID, PK)
- `code` (TEXT, UNIQUE): "ORG2024ABC"
- `org_id` (UUID, FK → profiles.id, role=org)
- `max_uses` (INT): 최대 사용 횟수
- `used_count` (INT): 현재 사용 횟수
- `expires_at` (TIMESTAMP)
- `is_active` (BOOL)

**권한**:
- **org**: 자기 코드만 생성/조회
- **user**: 코드 사용 (읽기 불가)

### alerts

**목적**: 가족/기관 알림 저장

**주요 필드**:
- `id` (UUID, PK)
- `recipient_id` (UUID, FK → profiles.id): guardian 또는 org
- `type` (ENUM): `med_checked`, `card_completed`, `streak_broken`, `new_qna`
- `payload` (JSONB): 알림 상세 정보
- `is_read` (BOOL)
- `created_at` (TIMESTAMP)

**권한**:
- **recipient**: 자기 알림만 읽기/업데이트
- RLS: `auth.uid() = recipient_id`

**인덱싱**:
- `(recipient_id, is_read, created_at DESC)`: 미읽음 알림 목록

### usage_counters

**목적**: 사용자별 기능 사용 카운터 (분석용)

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `date` (DATE): 집계 날짜
- `cards_completed` (INT)
- `voice_intents_used` (INT)
- `scam_checks` (INT)
- `qna_posts` (INT)
- `med_checks` (INT)

**권한**:
- **본인**: 읽기 전용
- **guardian**: 연결된 시니어 읽기
- **org**: 소속 시니어 통계 읽기

**인덱싱**:
- `(user_id, date DESC)`: 일별 사용량 조회

### audit_logs

**목적**: 민감 작업 감사 로그

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `action` (TEXT): `card_completed`, `scam_checked`, `voice_call`, `family_linked`
- `resource_type` (TEXT): `card`, `scam_check`, `voice_intent`
- `resource_id` (UUID)
- `metadata_json` (JSONB)
- `ip_address` (INET)
- `created_at` (TIMESTAMP)

**권한**:
- **admin/org**: 읽기 전용 (관리 목적)
- **user/guardian**: 접근 불가

**인덱싱**:
- `(user_id, created_at DESC)`: 사용자별 로그
- `(action, created_at DESC)`: 액션별 검색

### insights

**목적**: 인사이트 허브 콘텐츠

**주요 필드**:
- `id` (UUID, PK)
- `topic` (ENUM): `ai`, `bigtech`, `economy`, `safety`, `mobile101`
- `title`, `body` (TEXT)
- `author_id` (UUID, FK → profiles.id, role=org/admin)
- `published_at` (TIMESTAMP)
- `is_published` (BOOL)
- `view_count`, `useful_count`, `cheer_count` (INT)

**권한**:
- **모든 인증 사용자**: is_published=true 읽기
- **author/org**: 작성/수정/삭제
- RLS: `is_published = true OR auth.uid() = author_id`

**인덱싱**:
- `(topic, published_at DESC)`: 토픽별 최신순
- `(is_published, published_at DESC)`: 공개 인사이트 목록

### insight_follows

**목적**: 사용자별 토픽 팔로우 관계

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `topic` (ENUM): `ai`, `bigtech`, `economy`, `safety`, `mobile101`
- `followed_at` (TIMESTAMP)

**권한**:
- **본인**: 자기 팔로우만 관리
- RLS: `auth.uid() = user_id`

**인덱싱**:
- `(user_id, topic)`: UNIQUE 제약, 중복 팔로우 방지

### reactions

**목적**: 카드/인사이트/Q&A 반응 (범용)

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `target_type` (ENUM): `card`, `insight`, `qna_post`
- `target_id` (UUID): 대상 리소스 ID
- `reaction_type` (ENUM): `cheer`, `useful`
- `created_at` (TIMESTAMP)

**권한**:
- **본인**: 자기 반응만 생성/삭제
- **모든 인증 사용자**: 카운트 읽기

**인덱싱**:
- `(target_type, target_id)`: 대상별 반응 목록
- `(user_id, target_type, target_id)`: UNIQUE 제약 (중복 반응 방지)

### qna_posts

**목적**: 커뮤니티 Q&A 게시글

**주요 필드**:
- `id` (UUID, PK)
- `author_id` (UUID, FK → profiles.id)
- `subject` (ENUM): `폰`, `사기`, `도구`, `생활`
- `title` (TEXT, 최대 100자)
- `body` (TEXT, 최대 1000자)
- `is_anon` (BOOL): 익명 여부
- `ai_summary` (TEXT): AI 생성 요약 (초기는 룰 기반)
- `is_deleted` (BOOL): soft delete
- `created_at`, `updated_at` (TIMESTAMP)

**권한**:
- **모든 인증 사용자**: is_deleted=false 읽기
- **author**: 수정/삭제
- RLS: `is_deleted = false OR auth.uid() = author_id`

**인덱싱**:
- `(subject, created_at DESC)`: 주제별 최신순
- `(is_deleted, created_at DESC)`: 활성 게시글

### qna_votes

**목적**: Q&A 게시글 투표 (도움됐어요)

**주요 필드**:
- `id` (UUID, PK)
- `post_id` (UUID, FK → qna_posts.id)
- `user_id` (UUID, FK → profiles.id)
- `vote_type` (ENUM): `useful` (초기는 1종만)
- `created_at` (TIMESTAMP)

**권한**:
- **본인**: 자기 투표만 생성/취소
- **모든 인증 사용자**: 카운트 읽기

**인덱싱**:
- `(post_id, user_id)`: UNIQUE 제약 (중복 투표 방지)

### gamification

**목적**: 사용자별 게임화 데이터

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id, UNIQUE)
- `points` (INT, >= 0)
- `level` (INT): 포인트 기반 자동 산출
- `current_streak` (INT): 연속일수
- `longest_streak` (INT): 최장 연속일수
- `badges_json` (JSONB): [{ badge_id, earned_at }]
- `last_activity_date` (DATE): 스트릭 계산용

**권한**:
- **본인**: 읽기 전용
- **BFF**: service_role로 쓰기

**인덱싱**:
- `user_id`: UNIQUE, 1:1 관계
- `points DESC`: 리더보드 (향후 확장)

### tools_progress

**목적**: 도구 실습 트랙 진행도

**주요 필드**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `track_id` (UUID, FK → tool_tracks.id)
- `step_num` (INT): 1, 2, 3, 4 등
- `completed_at` (TIMESTAMP)
- `unlocked_steps` (INT[]): 언락된 단계 배열

**권한**:
- **본인**: 자기 진행도만 읽기/쓰기
- RLS: `auth.uid() = user_id`

**인덱싱**:
- `(user_id, track_id, step_num)`: UNIQUE 제약
- `(user_id, track_id)`: 트랙별 진행도 조회

## 4.2 Authorization Model

**역할 정의**:
- **user (시니어)**: 앱의 주 사용자, 카드/인사이트/커뮤니티 이용
- **guardian (가족)**: 시니어의 사용 현황 조회 (웹 대시보드), 직접 개입 최소화
- **org (기관)**: 스폰서 코드 관리, 소속 시니어 통계 조회 (개인 식별 정보 제외)
- **admin (관리자)**: 모든 데이터 접근 (초기 MVP에서는 최소 사용)

**RLS 정책 원칙**:
1. **본인 데이터 우선**: 사용자는 자기 데이터만 읽기/쓰기
2. **family_links 기반 위임**: guardian은 active 링크가 있는 시니어의 일부 데이터만 읽기
3. **공개 데이터**: insights(is_published=true), qna_posts(is_deleted=false)는 모든 인증 사용자 읽기
4. **BFF 우회**: service_role은 RLS 무시, 비즈니스 로직에서 권한 검증

**예시 RLS 정책 (cards)**:
```
-- 읽기: 본인 카드만
CREATE POLICY "Users can view own cards"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

-- 쓰기: BFF만 (service_role)
-- 클라이언트는 읽기 전용
```

**예시 RLS 정책 (qna_posts)**:
```
-- 읽기: 삭제되지 않은 게시글 또는 본인 게시글
CREATE POLICY "Users can view active or own posts"
  ON qna_posts FOR SELECT
  USING (is_deleted = false OR auth.uid() = author_id);

-- 쓰기: BFF만
```

## 4.3 Access Patterns & Indexing

**고빈도 조회 패턴**:

1. **오늘의 카드 조회** (초당 수십 건):
   - `SELECT * FROM cards WHERE user_id = ? AND date = CURRENT_DATE`
   - 인덱스: `(user_id, date)`

2. **인사이트 토픽별 목록** (초당 수십 건):
   - `SELECT * FROM insights WHERE topic = ? AND is_published = true ORDER BY published_at DESC LIMIT 10`
   - 인덱스: `(topic, is_published, published_at DESC)`

3. **가족 대시보드 요약** (초당 수 건):
   - `SELECT * FROM family_links WHERE guardian_id = ? AND status = 'active'`
   - `SELECT * FROM usage_counters WHERE user_id IN (...) AND date >= ?`
   - 인덱스: `(guardian_id, status)`, `(user_id, date DESC)`

4. **사용자 게임화 데이터** (초당 수십 건):
   - `SELECT * FROM gamification WHERE user_id = ?`
   - 인덱스: `user_id` (UNIQUE, PK 역할)

5. **Q&A 주제별 목록** (초당 수 건):
   - `SELECT * FROM qna_posts WHERE subject = ? AND is_deleted = false ORDER BY created_at DESC LIMIT 20`
   - 인덱스: `(subject, is_deleted, created_at DESC)`

**캐싱 전략 (Redis)**:
- **카드**: 당일 카드는 Redis에 1시간 캐시
- **인사이트**: 토픽별 최신 10개는 10분 캐시
- **사용자 프로필**: 로그인 후 세션 동안 캐시
- **게임화 데이터**: 포인트 변경 시 즉시 갱신, 읽기는 캐시 우선

**페이지네이션 필수 엔드포인트**:
- 인사이트 목록: 10개/페이지
- Q&A 목록: 20개/페이지
- 감사 로그: 50개/페이지 (관리자용)

**성능 목표**:
- P95 카드 조회 < 200ms
- P95 인사이트 목록 < 300ms
- P95 BFF 쓰기 작업 < 500ms (gamification 포함)

---

---
