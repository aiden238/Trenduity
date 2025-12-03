# 다음 세션 재개용 프롬프트

> **작성일**: 2025-12-02 02:40  
> **목적**: 컨텍스트 초과로 인한 세션 전환 시 즉시 재개

---

## 🎯 이전 세션 요약 (복사해서 새 세션에 붙여넣기)

```
OAuth 소셜 로그인 구현 완료 후 네트워크 연결 작업 중입니다.

=== 현재 상태 (2025-12-02 02:40) ===

✅ 완료:
- OAuth 구현 (Google, Naver, Kakao)
- EAS Development Build APK 생성 및 설치
- ngrok 설치 및 인증 완료
- ngrok 터널 생성 성공

🔗 현재 활성 URL:
https://emptiable-contractively-pearle.ngrok-free.dev

📱 현재 진행 중:
- Development Build 앱에서 위 ngrok URL로 연결 시도 중
- Metro 서버 실행 중 (Port 8081)
- ngrok 터널 실행 중 (새 PowerShell 창)

🎯 다음 작업:
1. 앱 연결 확인 (Metro 번들 다운로드)
2. Google OAuth 테스트
3. Naver OAuth 테스트

⚠️ 중요 정보:
- PC: 데스크톱 (학교 네트워크, AP Isolation)
- Cloudflare Tunnel: 작동 중이나 DNS 전파 실패 (6시간+)
- ngrok 선택 이유: 즉시 작동, Cloudflare는 추후 복귀 가능
- 브랜치: 2025-12-01-2014 (또는 main)
- 마지막 커밋: ef017b7 (OAuth 구현)

📂 관련 파일:
- apps/mobile-expo/src/contexts/AuthContext.tsx (OAuth 로직)
- apps/mobile-expo/src/screens/Auth/LoginScreen.tsx (로그인 UI)
- services/bff-fastapi/app/routers/auth.py (OAuth 백엔드)
- docs/METRO_TUNNEL_GUIDE.md (터널 전환 가이드)
- .env.metro (URL 설정 템플릿)

🔧 실행 중인 프로세스:
- Metro: PID 32828 (Port 8081)
- ngrok: 새 PowerShell 창 (https://emptiable-contractively-pearle.ngrok-free.dev)
- Cloudflare Tunnel: PID 31072 (백그라운드, 사용 안 함)

💬 바로 전 상황:
사용자가 Development Build 앱에서 ngrok URL 연결 시도 중.
컨텍스트가 길어져 새 세션으로 전환.

👉 다음 질문 예상:
- "앱 연결 성공했어" → OAuth 테스트 진행
- "연결 실패/에러 발생" → 로그 확인 및 문제 해결
- "Google 로그인 테스트" → 브라우저 OAuth 플로우 확인
```

---

## 🚀 세션 재개 방법

### 1️⃣ 새 대화 시작
GitHub Copilot Chat 새 세션 열기

### 2️⃣ 위 요약 붙여넣기
위의 "이전 세션 요약" 블록 전체를 복사하여 붙여넣기

### 3️⃣ 현재 상황 알리기
예시:
- "앱 연결 성공했어, 로그인 화면 나왔어"
- "연결 안 돼, 에러 메시지: [에러 내용]"
- "Google 로그인 눌렀는데 브라우저가 안 열려"

---

## 📋 빠른 상황별 대응 (새 세션에서 참조)

### 앱 연결 성공 시
```
앱 연결 성공! 로그인 화면 확인됨.
다음: Google 로그인 테스트 진행
```

### 앱 연결 실패 시
```
앱 연결 실패. 에러 메시지: [에러 내용 붙여넣기]

확인 필요:
1. Metro 서버 실행 중인지 (Port 8081)
2. ngrok URL 정확한지
3. 앱 로그 확인
```

### Google OAuth 테스트 시
```
Google 로그인 버튼 탭 → 브라우저 열림 → Google 계정 선택 → 권한 동의 → 앱으로 복귀

예상 결과:
- 성공: 홈 화면 이동, 사용자 정보 표시
- 실패: 에러 메시지 또는 로그인 화면 유지

로그 확인 위치:
- Metro 터미널 (새 PowerShell 창)
- BFF 로그 (필요 시)
```

### Naver OAuth 테스트 시
```
네이버 로그인 버튼 탭 → Naver 로그인 페이지 → 로그인 → 동의 → 앱 복귀

Google과 동일한 플로우
```

---

## 🔧 긴급 문제 해결 (새 세션에서)

### Metro 서버 중단됨
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\apps\mobile-expo
npm start -- --dev-client
```

### ngrok 터널 끊김
```powershell
cd C:\Users\songb\ngrok
.\ngrok.exe http 8081
# 새 URL 확인 후 앱에 재입력 필요
```

### BFF 서버 필요 시
```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### Cloudflare 복귀 (DNS 전파 시)
```
docs/METRO_TUNNEL_GUIDE.md 참조
URL 변경: https://metro.trenduity.app
```

---

## 📊 프로젝트 구조 참조

```
Trenduity/
├── apps/
│   ├── mobile-expo/          # React Native 앱
│   │   ├── src/
│   │   │   ├── contexts/
│   │   │   │   └── AuthContext.tsx      # OAuth 로직 (428줄)
│   │   │   ├── screens/
│   │   │   │   └── Auth/
│   │   │   │       └── LoginScreen.tsx  # 로그인 UI (511줄)
│   │   ├── app.json          # Expo 설정 (trenduity:// scheme)
│   │   └── eas.json          # EAS Build 설정
│   └── web-next/             # Next.js 가족 대시보드
├── services/
│   └── bff-fastapi/          # FastAPI BFF
│       ├── app/
│       │   └── routers/
│       │       └── auth.py   # OAuth 백엔드 (211줄)
├── docs/
│   ├── METRO_TUNNEL_GUIDE.md # 터널 가이드 (방금 생성)
│   └── USB_TETHERING_SETUP.md
├── .env.metro                # Metro URL 템플릿
└── NEXT_SESSION_RESUME.md    # 이 파일
```

---

## 🎓 핵심 개념 (AI 에이전트용)

### OAuth 플로우
1. 앱: "Google로 시작하기" 탭
2. 브라우저: Google OAuth 페이지 열림
3. 사용자: 계정 선택 및 권한 동의
4. Redirect: `trenduity://#access_token=...`
5. 앱: AuthContext가 토큰 파싱
6. 앱 → BFF: `POST /v1/auth/social` (토큰 전송)
7. BFF → Supabase: 토큰 검증
8. BFF → 앱: 사용자 정보 반환
9. 앱: 홈 화면 이동

### ngrok vs Cloudflare
| 항목 | ngrok | Cloudflare |
|------|-------|------------|
| 상태 | ✅ 작동 중 | ⏳ DNS 대기 |
| URL | 매번 변경 | 고정 |
| 세션 | 2시간 제한 | 무제한 |
| 설정 | 즉시 | 전파 대기 |

### 네트워크 환경
- PC: 데스크톱 (Wi-Fi 없음)
- 연결: 학교 네트워크 (192.168.151.5)
- 제약: AP Isolation (기기 간 직접 통신 불가)
- 해결: ngrok 터널 (외부 경유)

---

## ✅ 체크리스트 (새 세션 시작 시)

새 세션에서 확인할 사항:

- [ ] Metro 서버 실행 중? (`Get-NetTCPConnection -LocalPort 8081`)
- [ ] ngrok 터널 실행 중? (PowerShell 창 확인)
- [ ] ngrok URL 유효? (`https://emptiable-contractively-pearle.ngrok-free.dev`)
- [ ] 앱 설치됨? (Development Build)
- [ ] 현재 브랜치? (`git branch --show-current`)
- [ ] 변경사항? (`git status`)

---

## 🔗 유용한 명령어

### 상태 확인
```powershell
# Metro
Get-NetTCPConnection -LocalPort 8081 -State Listen

# ngrok
Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels"

# Cloudflare Tunnel
Get-Process cloudflared

# Git 상태
git status --short
git log -1 --oneline
```

### 로그 확인
```powershell
# Metro 로그: 새 PowerShell 창 확인

# BFF 로그 (필요 시)
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
Get-Content logs/app.log -Tail 20 -Wait
```

---

## 📞 긴급 연락처 (문서)

- 프로젝트 개요: `README.md`
- 아키텍처: `docs/PLAN/01-2-architecture-overview.md`
- 구현 규칙: `docs/IMPLEMENT/01-implementation-rules.md`
- OAuth 구현: `docs/IMPLEMENT/02-daily-card-gamification.md`
- 터널 가이드: `docs/METRO_TUNNEL_GUIDE.md`
- Copilot 지침: `.github/copilot-instructions.md`

---

## 💡 예상 질문 및 답변

### Q: "앱이 연결 안 돼요"
```
다음 확인:
1. ngrok URL 정확한가? (https://emptiable-contractively-pearle.ngrok-free.dev)
2. Metro 실행 중? (Port 8081)
3. ngrok 터널 실행 중? (PowerShell 창)
4. 앱 에러 메시지는?

로그 확인 후 알려주세요.
```

### Q: "OAuth 브라우저가 안 열려요"
```
확인:
1. app.json에 scheme 설정됨? (trenduity://)
2. 앱 버전 맞나? (Development Build)
3. 브라우저 기본 앱 설정?

AuthContext.tsx 로그 확인 필요.
```

### Q: "Cloudflare로 바꾸고 싶어요"
```
docs/METRO_TUNNEL_GUIDE.md의
"Cloudflare Tunnel 복귀 방법" 참조

전제조건: DNS 전파 완료
(현재 6시간+ 대기 중, 아직 안 됨)
```

### Q: "ngrok URL이 바뀌었어요"
```
정상입니다. ngrok은 재시작마다 URL 변경됨.

새 URL 확인:
Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels"

앱에 새 URL 재입력 필요.
```

---

## 🎯 최종 목표 (참고)

**단기 (이번 세션):**
- [x] ngrok 터널 생성
- [ ] 앱 연결 성공
- [ ] Google OAuth 테스트
- [ ] Naver OAuth 테스트

**중기 (다음 세션):**
- [ ] 카드 완료 플로우 테스트
- [ ] 게임화 (포인트/배지) 검증
- [ ] 가족 대시보드 연동

**장기 (MVP):**
- [ ] Cloudflare DNS 복귀
- [ ] 프로덕션 배포
- [ ] App Store 출시

---

## 📝 커밋 이력 (참고)

```
ef017b7 (2025-12-01-2014) feat: OAuth 소셜 로그인 구현 및 네트워크 연결 설정
- 54 files changed, +5230 / -634
- OAuth 구현 (Google, Naver, Kakao)
- EAS Build 설정
- USB 테더링 문서
- 안티 할루시네이션 규칙
```

---

## 🚀 즉시 재개 스크립트

새 세션에서 바로 실행할 명령어:

```powershell
# 1. 프로젝트 루트로 이동
cd c:\AIDEN_PROJECT\Trenduity\Trenduity

# 2. 상태 확인
Write-Host "`n=== 현재 상태 ===" -ForegroundColor Cyan
Write-Host "Metro: $(if (Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue) { 'Running' } else { 'Stopped' })" -ForegroundColor $(if (Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue) { 'Green' } else { 'Red' })
Write-Host "ngrok: $(if (Get-Process ngrok -ErrorAction SilentlyContinue) { 'Running' } else { 'Stopped' })" -ForegroundColor $(if (Get-Process ngrok -ErrorAction SilentlyContinue) { 'Green' } else { 'Red' })
Write-Host "Branch: $(git branch --show-current)" -ForegroundColor White
Write-Host "Changes: $(git status --short | Measure-Object -Line | Select-Object -ExpandProperty Lines) files" -ForegroundColor White

# 3. ngrok URL 확인 (실행 중이면)
try {
    $url = (Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels").tunnels[0].public_url
    Write-Host "ngrok URL: $url" -ForegroundColor Yellow
} catch {
    Write-Host "ngrok URL: Not available" -ForegroundColor Red
}
```

---

**이 파일을 북마크하고, 새 세션에서 "이전 세션 요약" 블록을 붙여넣으세요!**

---

# 다음 세션 재개 가이드

## 📍 현재 상황 (2025-11-21)

### ✅ 완료된 작업
1. **Gamification 테이블 구조 수정** (100%)
   - `total_points`, `current_streak`, `longest_streak` 컬럼 추가
   - 마이그레이션 `002_verify_gamification_structure.sql` 실행 완료
   - BFF `GamificationService` 코드 수정 (INSERT 시 `longest_streak` 포함)

2. **E2E 테스트 개선** (74% 달성 - 목표 70% 초과)
   - 25/34 테스트 통과
   - A11y: 10/10 ✅
   - Med Check: 5/5 ✅
   - Scam Check: 6/6 ✅
   - Health: 1/1 ✅
   - Card: 3/4 (1개 실패)
   - Family: 0/8 (스킵)

3. **테스트 에러 핸들링 강화**
   - 500 에러 감지 및 명확한 메시지 제공
   - 첫 완료와 두 번째 완료 모두 에러 핸들링 추가

### 🔴 남은 문제 (핵심 - 다음 세션 최우선)

**카드 완료 테스트 - 두 번째 완료 시 500 에러**
- **증상**: 
  - 첫 번째 완료: ✅ 성공 (200, 8 포인트)
  - 두 번째 완료: ❌ 500 Internal Server Error
- **예상 원인**:
  1. `_is_card_completed_today()` 중복 체크가 Redis 캐시를 제대로 읽지 못함
  2. `gamification.award_for_card_completion()`에서 중복 완료 시 예외 발생
  3. Redis 키 TTL 또는 키 형식 문제

---

## 🚀 다음 세션 시작 체크리스트

### 1단계: 환경 상태 확인 (2분)

```powershell
# BFF 서버 실행 중인지 확인
Get-NetTCPConnection -LocalPort 8002 -ErrorAction SilentlyContinue

# Docker 컨테이너 상태
docker ps --filter "name=redis" --filter "name=postgres"

# 현재 브랜치 및 변경사항
cd c:\AIDEN_PROJECT\Trenduity\Trenduity
git status --short
```

### 2단계: 테스트 환경 리셋 (1분)

```powershell
# 완료 기록 삭제 + Redis 플러시
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
. .\venv\Scripts\Activate.ps1
python ..\..\scripts\reset_card_completion.py
docker exec trenduity-redis redis-cli FLUSHALL
```

### 3단계: BFF 서버 재시작 (디버그 모드) (2분)

```powershell
# 기존 프로세스 종료
$proc = Get-NetTCPConnection -LocalPort 8002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($proc) { Stop-Process -Id $proc -Force; Start-Sleep -Seconds 3 }

# 새 터미널에서 디버그 모드로 시작 (로그 확인 가능)
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
. .\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload --log-level debug
```

### 4단계: E2E 테스트 실행 (별도 터미널) (1분)

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\e2e
npx playwright test scenarios/card-completion.spec.ts:91 --reporter=list
```

---

## 🔍 디버깅 전략

### Option A: BFF 로그 분석 (추천)

BFF 서버 터미널에서 실시간 로그 확인:
- ✅ `🔥 Complete card called` (엔드포인트 진입)
- ✅ `🔥 Card found` (카드 조회 성공)
- ❓ **중복 체크 통과 여부** (로그 없으면 문제)
- ❓ `🔥 Calling gamification` (게임화 서비스 호출)
- ❌ 에러 발생 지점

**예상되는 로그 패턴:**
```
INFO: 127.0.0.1:xxxxx - "POST /v1/cards/complete HTTP/1.1" 200 OK
🔥 Complete card called: card_id=xxx, user_id=demo-user-50s
🔥 Card found: dict_keys([...])
🔥 Calling gamification: completion_date=2025-11-21, quiz_result=None
🔥 Gamification result: {...}
🔥 Card completion recorded

# 두 번째 호출
INFO: 127.0.0.1:xxxxx - "POST /v1/cards/complete HTTP/1.1" 500 Internal Server Error
🔥 Complete card called: card_id=xxx, user_id=demo-user-50s
🔥 Card found: dict_keys([...])
# ❓ 여기서 멈추거나 에러 발생
```

### Option B: Redis 키 확인

```powershell
# 첫 완료 후 Redis 키 확인
docker exec trenduity-redis redis-cli KEYS "card:complete:*"

# 예상 키 형식
# card:complete:demo-user-50s:ee4148a8-6f5b-497f-8f44-40c537e19220

# 키 값 확인
docker exec trenduity-redis redis-cli GET "card:complete:demo-user-50s:ee4148a8-6f5b-497f-8f44-40c537e19220"

# TTL 확인 (86400초 = 24시간)
docker exec trenduity-redis redis-cli TTL "card:complete:demo-user-50s:ee4148a8-6f5b-497f-8f44-40c537e19220"
```

### Option C: Python 직접 테스트

```powershell
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
. .\venv\Scripts\Activate.ps1

# 첫 완료
python ..\..\scripts\test_card_completion.py

# Redis 키 확인
docker exec trenduity-redis redis-cli KEYS "*"

# 두 번째 완료 (400 예상)
python ..\..\scripts\test_card_completion.py
```

---

## 🛠️ 예상되는 수정 사항

### 수정 1: Redis 키 생성 함수 확인

**파일**: `services/bff-fastapi/app/routers/cards.py`

```python
def _get_completion_key(user_id: str, card_id: str) -> str:
    """Redis 완료 키 생성"""
    return f"card:complete:{user_id}:{card_id}"
```

### 수정 2: 중복 체크 로직 강화

**파일**: `services/bff-fastapi/app/routers/cards.py` (line 26-50)

**현재 코드**:
```python
def _is_card_completed_today(redis: Optional[Redis], db: Optional[Client], user_id: str, card_id: str) -> bool:
    """Redis 또는 DB에서 오늘 완료 여부 확인 (동기 함수)"""
    # 1. Redis 우선 확인 (빠름)
    if redis:
        key = _get_completion_key(user_id, card_id)
        try:
            if redis.exists(key) > 0:
                logger.info(f"Redis에서 중복 감지: {key}")
                return True
        except Exception as e:
            logger.error(f"Redis 완료 확인 실패: {e}")
    # ...
```

**개선 필요 사항**:
- `redis.exists(key)` 실패 시 로그 추가
- Redis 연결 상태 확인
- 키 형식 검증

### 수정 3: Gamification 중복 완료 처리

**파일**: `services/bff-fastapi/app/services/gamification.py` (line 70-105)

**가능한 문제**:
- `_get_or_create_gamification` 호출 시 DB 에러
- `_update_streak` 호출 시 날짜 파싱 에러
- `_check_new_badges` 호출 시 배지 로직 에러

**추가할 에러 핸들링**:
```python
async def award_for_card_completion(...):
    try:
        # 기존 로직
        gamif = await self._get_or_create_gamification(user_id)
        streak_days = await self._update_streak(gamif, completion_date)
        # ...
    except Exception as e:
        logger.error(f"Gamification 에러: {e}", exc_info=True)
        # 기본값 반환 (포인트만 부여)
        return {
            "points_added": points,
            "total_points": 0,
            "streak_days": 0,
            "new_badges": [],
            "level": 1
        }
```

---

## 📊 성공 기준

### 최소 목표 (이미 달성 ✅)
- E2E 테스트 70% 이상 통과 (현재 74%)

### 이상적 목표 (다음 세션)
- 카드 완료 테스트 4/4 통과 → **26/34 (76%)**
- 두 번째 완료 시 400 에러 (ALREADY_COMPLETED) 반환
- Redis 캐시 정상 작동

### 최종 목표 (선택)
- Family link 테스트 구현 (Next.js 서버 필요) → 34/34 (100%)

---

## 📁 핵심 파일 위치

```
services/bff-fastapi/app/
├── routers/cards.py                   # 카드 완료 엔드포인트 (line 319-455)
│   ├── _get_completion_key()          # Redis 키 생성 (line 22-24)
│   ├── _is_card_completed_today()     # 중복 체크 (line 26-50)
│   └── _mark_card_completed()         # 완료 기록 (line 52-78)
├── services/gamification.py            # 게임화 로직 (line 70-145)
│   ├── award_for_card_completion()    # 포인트/스트릭 업데이트
│   ├── _get_or_create_gamification()  # 게임화 레코드 조회/생성
│   └── _update_streak()               # 스트릭 계산
└── core/deps.py                        # Redis 의존성 (line 80-95)

e2e/scenarios/card-completion.spec.ts   # 테스트 (line 91-160)
scripts/reset_card_completion.py         # 테스트 환경 리셋
scripts/test_card_completion.py          # 직접 API 테스트
scripts/migrations/002_verify_gamification_structure.sql  # DB 마이그레이션
```

---

## 🎯 다음 세션 목표 (30분 예상)

1. **BFF 로그 분석** (10분)
   - 두 번째 완료 시 어디서 멈추는지 확인
   - Redis 키 존재 여부 확인
   - Gamification 호출 여부 확인

2. **근본 원인 수정** (15분)
   - 중복 체크 로직 강화 또는
   - Gamification 에러 핸들링 추가

3. **E2E 테스트 검증** (5분)
   - 26/34 (76%) 달성 확인
   - 카드 완료 4/4 통과 확인

---

## 💡 빠른 시작 명령어 (복사 후 실행)

```powershell
# 터미널 1: BFF 서버 (디버그 모드)
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\services\bff-fastapi
. .\venv\Scripts\Activate.ps1
docker exec trenduity-redis redis-cli FLUSHALL
python ..\..\scripts\reset_card_completion.py
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload --log-level debug
```

```powershell
# 터미널 2: E2E 테스트
cd c:\AIDEN_PROJECT\Trenduity\Trenduity\e2e
npx playwright test scenarios/card-completion.spec.ts:91 --reporter=list
```

---

**현재 남은 토큰**: 927,018 / 1,000,000 (92.7% 사용)  
**최종 업데이트**: 2025-11-21  
**다음 세션 우선순위**: P1 - 카드 완료 중복 방지 500 에러 해결
