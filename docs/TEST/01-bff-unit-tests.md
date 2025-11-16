# 01. BFF Unit Tests (FastAPI/Python)

> **목적**: BFF 순수 로직 및 API 엔드포인트 테스트  
> **도구**: Pytest, FastAPI TestClient  
> **환경**: `apps/bff-fastapi/tests/`

---

## 📋 목표

**핵심 비즈니스 로직 검증**:
- Voice Intent Parser (한국어 → intent/slots)
- Scam Checker (사기 패턴 탐지)
- Gamification Rules (포인트/스트릭 계산)

**API 엔드포인트 검증**:
- HTTP 상태 코드
- JSON 응답 구조
- 에러 처리

---

## 🎤 Voice Intent Parser Tests

### 테스트 파일: `tests/test_voice_parser.py`

```python
# tests/test_voice_parser.py
import pytest
from services.voice_parser import VoiceParser, Intent

parser = VoiceParser()

class TestCallIntent:
    """전화 걸기 intent 테스트"""
    
    def test_call_with_name(self):
        """이름으로 전화 걸기"""
        result = parser.parse("엄마에게 전화해 줘")
        
        assert result.intent == Intent.CALL
        assert result.slots["target"] == "엄마"
        assert result.confidence > 0.8
    
    def test_call_with_phone_number(self):
        """전화번호로 전화 걸기"""
        result = parser.parse("010-1234-5678로 전화해")
        
        assert result.intent == Intent.CALL
        assert result.slots["phone_number"] == "010-1234-5678"
    
    def test_call_variations(self):
        """다양한 표현"""
        variations = [
            "아들한테 전화 좀 해줘",
            "친구에게 전화하고 싶어",
            "김민수씨한테 전화 연결해줘"
        ]
        
        for text in variations:
            result = parser.parse(text)
            assert result.intent == Intent.CALL

class TestRemindIntent:
    """알림 설정 intent 테스트"""
    
    def test_remind_with_time(self):
        """시간 포함 알림"""
        result = parser.parse("내일 아침 9시에 약 먹으라고 알림 설정해 줘")
        
        assert result.intent == Intent.REMIND
        assert result.slots["time"] == "내일 아침 9시"
        assert result.slots["message"] == "약 먹으라고"
    
    def test_remind_simple(self):
        """간단한 알림"""
        result = parser.parse("10분 후에 알림 설정")
        
        assert result.intent == Intent.REMIND
        assert result.slots["time"] == "10분 후"

class TestSearchIntent:
    """검색 intent 테스트"""
    
    def test_search_general(self):
        """일반 검색"""
        result = parser.parse("날씨 검색해 줘")
        
        assert result.intent == Intent.SEARCH
        assert result.slots["query"] == "날씨"
    
    def test_search_with_location(self):
        """장소 포함 검색"""
        result = parser.parse("서울 맛집 찾아줘")
        
        assert result.intent == Intent.SEARCH
        assert "서울" in result.slots["query"]
        assert "맛집" in result.slots["query"]

class TestNavigateIntent:
    """길찾기 intent 테스트"""
    
    def test_navigate_to_place(self):
        """장소로 길찾기"""
        result = parser.parse("근처 지하철역 길찾기 해 줘")
        
        assert result.intent == Intent.NAVIGATE
        assert result.slots["destination"] == "지하철역"
    
    def test_navigate_home(self):
        """집으로 가기"""
        result = parser.parse("집으로 가는 길 알려줘")
        
        assert result.intent == Intent.NAVIGATE
        assert result.slots["destination"] == "집"

class TestSmsIntent:
    """문자 보내기 intent 테스트"""
    
    def test_sms_with_message(self):
        """메시지 포함 문자"""
        result = parser.parse("아들한테 잘 지내냐고 문자 보내줘")
        
        assert result.intent == Intent.SMS
        assert result.slots["target"] == "아들"
        assert "잘 지내냐" in result.slots["message"]

class TestOpenAppIntent:
    """앱 열기 intent 테스트"""
    
    def test_open_specific_app(self):
        """특정 앱 열기"""
        result = parser.parse("유튜브 열어줘")
        
        assert result.intent == Intent.OPEN_APP
        assert result.slots["app_name"] == "유튜브"

class TestEdgeCases:
    """엣지 케이스"""
    
    def test_unclear_intent(self):
        """불명확한 문장"""
        result = parser.parse("그거 좀 해줘")
        
        assert result.intent == Intent.FALLBACK
        assert result.confidence < 0.5
    
    def test_empty_input(self):
        """빈 입력"""
        result = parser.parse("")
        
        assert result.intent == Intent.FALLBACK
    
    def test_very_long_input(self):
        """매우 긴 입력"""
        result = parser.parse("이건 정말 긴 문장인데 " * 50)
        
        assert result.intent is not None
        assert len(result.slots) >= 0
```

---

## 🚨 Scam Checker Tests

### 테스트 파일: `tests/test_scam_checker.py`

```python
# tests/test_scam_checker.py
import pytest
from services.scam_checker import ScamChecker, RiskLevel

checker = ScamChecker()

class TestDangerPatterns:
    """위험 패턴 탐지"""
    
    def test_urgent_approval(self):
        """긴급 승인 패턴"""
        text = "[긴급] 카드 승인 취소하려면 즉시 확인 필요 http://bit.ly/xxx"
        result = checker.check(text, None)
        
        assert result.risk_level == RiskLevel.DANGER
        assert "긴급" in result.matched_patterns
        assert "단축URL" in result.matched_patterns
    
    def test_immediate_transfer(self):
        """즉시 송금 요구"""
        text = "계좌 확인 필요. 1시간 내 송금하세요"
        result = checker.check(text, None)
        
        assert result.risk_level in [RiskLevel.DANGER, RiskLevel.WARN]
        assert "송금" in result.matched_patterns

class TestWarnPatterns:
    """경고 패턴 탐지"""
    
    def test_suspicious_link(self):
        """의심스러운 링크"""
        text = "택배 도착했습니다. http://t.co/randomlink 확인하세요"
        result = checker.check(text, None)
        
        assert result.risk_level == RiskLevel.WARN
        assert len(result.tips) > 0
    
    def test_personal_info_request(self):
        """개인정보 요구"""
        text = "본인 확인을 위해 주민번호 뒷자리를 입력하세요"
        result = checker.check(text, None)
        
        assert result.risk_level == RiskLevel.WARN

class TestSafePatterns:
    """안전 패턴"""
    
    def test_normal_message(self):
        """일반 문자"""
        text = "오늘 저녁 뭐 먹을까요?"
        result = checker.check(text, None)
        
        assert result.risk_level == RiskLevel.SAFE
    
    def test_official_notification(self):
        """공식 알림 (앱 확인 유도)"""
        text = "[은행] 이체 완료. 자세한 내용은 앱에서 확인하세요."
        result = checker.check(text, None)
        
        assert result.risk_level == RiskLevel.SAFE

class TestUrlChecks:
    """URL 패턴 검사"""
    
    def test_shortened_url_danger(self):
        """단축 URL"""
        urls = ["http://bit.ly/xxx", "http://t.co/abc", "http://short.url/123"]
        
        for url in urls:
            result = checker.check(f"확인하세요 {url}", None)
            assert result.risk_level in [RiskLevel.DANGER, RiskLevel.WARN]
    
    def test_official_domain_safe(self):
        """공식 도메인"""
        text = "https://www.naver.com 링크 확인"
        result = checker.check(text, None)
        
        assert result.risk_level == RiskLevel.SAFE
```

---

## 🎮 Gamification Tests

### 테스트 파일: `tests/test_gamification.py`

```python
# tests/test_gamification.py
import pytest
from datetime import date, timedelta
from services.gamification import GamificationService
from models import User, CardCompletion

@pytest.fixture
def gamification_service():
    return GamificationService()

@pytest.fixture
def mock_user():
    return User(
        id="test-user",
        points=100,
        current_streak=3
    )

class TestCardCompletion:
    """카드 완료 포인트"""
    
    def test_card_complete_points(self, gamification_service, mock_user):
        """기본 포인트"""
        result = gamification_service.handle_card_complete(
            user=mock_user,
            card_id="test-card",
            quiz_correct=0,
            quiz_total=0
        )
        
        assert result.points_earned == 30
        assert result.new_total == 130
    
    def test_card_with_quiz_perfect(self, gamification_service, mock_user):
        """퀴즈 완벽"""
        result = gamification_service.handle_card_complete(
            user=mock_user,
            card_id="test-card",
            quiz_correct=3,
            quiz_total=3
        )
        
        assert result.points_earned == 50  # 30 + 20 (quiz bonus)
    
    def test_card_with_quiz_partial(self, gamification_service, mock_user):
        """퀴즈 부분 정답"""
        result = gamification_service.handle_card_complete(
            user=mock_user,
            card_id="test-card",
            quiz_correct=2,
            quiz_total=3
        )
        
        assert result.points_earned == 40  # 30 + 10 (partial)

class TestStreak:
    """스트릭 계산"""
    
    def test_streak_continues(self, gamification_service, mock_user):
        """스트릭 유지"""
        # 어제 완료 + 오늘 완료
        result = gamification_service.update_streak(
            user=mock_user,
            last_completion_date=date.today() - timedelta(days=1)
        )
        
        assert result.new_streak == 4
        assert result.streak_bonus == 5
    
    def test_streak_breaks(self, gamification_service, mock_user):
        """스트릭 끊김"""
        # 3일 전 완료 + 오늘 완료
        result = gamification_service.update_streak(
            user=mock_user,
            last_completion_date=date.today() - timedelta(days=3)
        )
        
        assert result.new_streak == 1
        assert result.streak_bonus == 0
    
    def test_streak_first_day(self, gamification_service):
        """첫날"""
        user = User(id="new-user", points=0, current_streak=0)
        
        result = gamification_service.update_streak(
            user=user,
            last_completion_date=None
        )
        
        assert result.new_streak == 1

class TestBadges:
    """배지 획득"""
    
    def test_first_card_badge(self, gamification_service, mock_user):
        """첫 카드 배지"""
        badges = gamification_service.check_badges(
            user=mock_user,
            cards_completed=1
        )
        
        assert "first_card" in badges
    
    def test_week_streak_badge(self, gamification_service, mock_user):
        """7일 연속 배지"""
        mock_user.current_streak = 7
        
        badges = gamification_service.check_badges(
            user=mock_user,
            cards_completed=10
        )
        
        assert "week_streak" in badges
```

---

## 🌐 API Endpoint Tests

### 테스트 파일: `tests/test_api.py`

```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestCardsAPI:
    """Cards 엔드포인트"""
    
    def test_get_today_card(self):
        """오늘의 카드 조회"""
        response = client.get("/v1/cards/today")
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "title" in data
        assert "body" in data
        assert "quiz" in data
    
    def test_complete_card(self):
        """카드 완료"""
        payload = {
            "cardId": "test-card",
            "quizAnswers": [0, 1, 2],
            "readTimeSeconds": 180
        }
        
        response = client.post("/v1/cards/complete", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "pointsEarned" in data
        assert "newStreak" in data

class TestScamAPI:
    """Scam Check 엔드포인트"""
    
    def test_check_sms(self):
        """문자 사기 검사"""
        payload = {
            "text": "[긴급] 카드 승인 확인 필요",
            "url": None
        }
        
        response = client.post("/v1/scam/check", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "riskLevel" in data
        assert "matchedPatterns" in data
        assert "tips" in data

class TestInsightsAPI:
    """Insights 엔드포인트"""
    
    def test_list_insights(self):
        """인사이트 목록"""
        response = client.get("/v1/insights")
        
        assert response.status_code == 200
        data = response.json()
        assert "insights" in data
        assert isinstance(data["insights"], list)
    
    def test_filter_by_topic(self):
        """토픽 필터"""
        response = client.get("/v1/insights?topic=ai")
        
        assert response.status_code == 200
        data = response.json()
        for insight in data["insights"]:
            assert insight["topic"] == "ai"

class TestQnAAPI:
    """Q&A 엔드포인트"""
    
    def test_list_qna(self):
        """질문 목록"""
        response = client.get("/v1/qna")
        
        assert response.status_code == 200
        data = response.json()
        assert "posts" in data
    
    def test_create_qna(self):
        """질문 작성"""
        payload = {
            "topic": "ai",
            "question": "테스트 질문",
            "body": "테스트 본문",
            "isAnon": False
        }
        
        response = client.post("/v1/qna", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
```

---

## 🧪 실행 방법

### 전체 테스트 실행

```bash
cd apps/bff-fastapi
pytest
```

### 특정 테스트 파일만

```bash
pytest tests/test_voice_parser.py
pytest tests/test_scam_checker.py
pytest tests/test_gamification.py
```

### Verbose 모드

```bash
pytest -vv
```

### 커버리지 리포트

```bash
pytest --cov=services --cov-report=html
```

---

## ✅ 체크리스트

### Voice Parser
- [ ] Call intent 테스트 (3개)
- [ ] Remind intent 테스트 (2개)
- [ ] Search intent 테스트 (2개)
- [ ] Navigate intent 테스트 (2개)
- [ ] SMS intent 테스트 (1개)
- [ ] Open App intent 테스트 (1개)
- [ ] Edge cases 테스트 (3개)

### Scam Checker
- [ ] Danger 패턴 테스트 (2개)
- [ ] Warn 패턴 테스트 (2개)
- [ ] Safe 패턴 테스트 (2개)
- [ ] URL 패턴 테스트 (2개)

### Gamification
- [ ] 카드 완료 포인트 테스트 (3개)
- [ ] 스트릭 계산 테스트 (3개)
- [ ] 배지 획득 테스트 (2개)

### API Endpoints
- [ ] Cards API 테스트 (2개)
- [ ] Scam API 테스트 (1개)
- [ ] Insights API 테스트 (2개)
- [ ] Q&A API 테스트 (2개)

---

**문서 작성**: AI Test Guide  
**최종 업데이트**: 2025년 11월 13일
