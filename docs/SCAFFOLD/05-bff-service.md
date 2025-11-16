# 05. BFF Service - FastAPI BFF 스켈레톤

> 백엔드 API 서비스 구조 및 플레이스홀더 엔드포인트

---

## 📋 목표

- FastAPI 앱 기본 구조 생성
- 도메인별 라우터 (6개) 플레이스홀더 구현
- Pydantic 스키마 정의 (DTO 매칭)
- CORS 미들웨어 및 환경 설정
- `/health` 엔드포인트

---

## 🗂️ 폴더 구조

```
services/bff-fastapi/
├── app/
│   ├── main.py                      # FastAPI 앱 초기화
│   ├── core/
│   │   ├── config.py                # 환경변수 설정
│   │   └── deps.py                  # 의존성 (DB, Redis 세션)
│   ├── routers/
│   │   ├── cards.py                 # 카드 관련 엔드포인트
│   │   ├── insights.py              # 인사이트 엔드포인트
│   │   ├── voice.py                 # 음성 인텐트
│   │   ├── scam.py                  # 사기 검사
│   │   ├── community.py             # Q&A, 반응
│   │   └── family.py                # 가족 관련
│   ├── schemas/
│   │   ├── card.py                  # Pydantic 스키마
│   │   ├── insight.py
│   │   ├── voice.py
│   │   ├── scam.py
│   │   ├── community.py
│   │   └── family.py
│   └── middleware/
│       └── cors.py                  # CORS 설정
├── requirements.txt
├── .env.example
├── Dockerfile                       # (선택)
└── pyproject.toml                   # (선택, Poetry 사용 시)
```

---

## 📄 파일별 상세 내용

### requirements.txt

```txt
fastapi==0.104.0
uvicorn[standard]==0.24.0
pydantic==2.4.0
pydantic-settings==2.0.3
python-dotenv==1.0.0
supabase==2.0.0
redis==5.0.0
httpx==0.25.0
```

---

### .env.example

```bash
# FastAPI
ENV=development
DEBUG=True
API_VERSION=v1

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:19006

# LLM (향후)
# OPENAI_API_KEY=sk-...
```

---

### app/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import cards, insights, voice, scam, community, family

app = FastAPI(
    title="Senior Learning App BFF",
    description="Backend for Frontend - 50-70대 AI 학습 앱",
    version="0.1.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(cards.router, prefix=f"/{settings.API_VERSION}/cards", tags=["cards"])
app.include_router(insights.router, prefix=f"/{settings.API_VERSION}/insights", tags=["insights"])
app.include_router(voice.router, prefix=f"/{settings.API_VERSION}/voice", tags=["voice"])
app.include_router(scam.router, prefix=f"/{settings.API_VERSION}/scam", tags=["scam"])
app.include_router(community.router, prefix=f"/{settings.API_VERSION}/community", tags=["community"])
app.include_router(family.router, prefix=f"/{settings.API_VERSION}/family", tags=["family"])


@app.get("/health")
async def health_check():
    """
    Health check 엔드포인트
    """
    return {
        "status": "healthy",
        "version": "0.1.0",
        "env": settings.ENV,
    }


@app.get("/")
async def root():
    """
    루트 엔드포인트
    """
    return {
        "message": "Senior Learning App BFF API",
        "docs": "/docs",
        "health": "/health",
    }
```

---

### app/core/config.py

```python
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    환경변수 설정
    """
    
    # App
    ENV: str = "development"
    DEBUG: bool = True
    API_VERSION: str = "v1"
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:19006"]
    
    # LLM (향후)
    # OPENAI_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
```

---

### app/core/deps.py

```python
from typing import Generator


def get_db_session() -> Generator:
    """
    데이터베이스 세션 의존성
    
    TODO(IMPLEMENT): Supabase 클라이언트 또는 SQLAlchemy 세션
    """
    # Placeholder
    yield None


def get_redis_client() -> Generator:
    """
    Redis 클라이언트 의존성
    
    TODO(IMPLEMENT): Redis 연결 풀
    """
    # Placeholder
    yield None
```

---

### app/routers/cards.py

```python
from fastapi import APIRouter, Depends
from typing import Dict

router = APIRouter()


@router.get("/today")
async def get_today_card() -> Dict:
    """
    오늘의 카드 조회
    
    TODO(IMPLEMENT):
    - 사용자 인증 (토큰 검증)
    - Supabase에서 오늘 날짜 카드 조회
    - RLS 정책 적용
    """
    return {"status": "TODO", "message": "Get today's card not implemented"}


@router.post("/{card_id}/complete")
async def complete_card(card_id: str) -> Dict:
    """
    카드 완료 처리
    
    TODO(IMPLEMENT):
    - 토큰 검증
    - 비즈니스 규칙 검증 (중복 완료 방지)
    - Supabase 업데이트 (service_role)
    - Gamification 서비스 호출 (포인트, 스트릭)
    - audit_logs 기록
    """
    return {
        "status": "TODO",
        "message": f"Complete card {card_id} not implemented",
        "points_awarded": 0,
    }
```

---

### app/routers/insights.py

```python
from fastapi import APIRouter
from typing import Dict, List

router = APIRouter()


@router.get("")
async def get_insights(topic: str = "ai", limit: int = 10) -> Dict:
    """
    인사이트 목록 조회
    
    TODO(IMPLEMENT):
    - Supabase에서 토픽별 인사이트 조회
    - is_published = true 필터
    - 페이지네이션
    """
    return {
        "status": "TODO",
        "message": f"Get insights for topic={topic} not implemented",
        "data": [],
    }


@router.post("/{insight_id}/react")
async def react_to_insight(insight_id: str, reaction_type: str) -> Dict:
    """
    인사이트 반응 추가
    
    TODO(IMPLEMENT):
    - 토큰 검증
    - reactions 테이블 upsert
    - 카운터 업데이트
    - Gamification (첫 반응 시 +2 포인트)
    """
    return {
        "status": "TODO",
        "message": f"React to insight {insight_id} with {reaction_type} not implemented",
    }
```

---

### app/routers/voice.py

```python
from fastapi import APIRouter
from typing import Dict

router = APIRouter()


@router.post("/parse")
async def parse_voice_intent(text: str) -> Dict:
    """
    음성 인텐트 파싱
    
    TODO(IMPLEMENT):
    - 토큰 검증
    - voice_parser 서비스 (룰 기반)
    - 키워드 매칭: "전화", "문자", "열어", "찾아", "알림"
    - 슬롯 추출 (정규표현식): 이름, 앱, 장소
    - 연락처 조회 (call/sms 인텐트)
    - voice_intents 테이블 로그
    """
    return {
        "status": "TODO",
        "message": f"Parse voice intent for text='{text}' not implemented",
        "intent": "unknown",
        "confidence": 0.0,
    }
```

---

### app/routers/scam.py

```python
from fastapi import APIRouter
from typing import Dict, Optional

router = APIRouter()


@router.post("/check")
async def check_scam(text: str, url: Optional[str] = None) -> Dict:
    """
    사기 검사
    
    TODO(IMPLEMENT):
    - 토큰 검증
    - 레이트 리미팅 (Redis: 1분 5회)
    - scam_checker 서비스 (룰 기반)
    - 키워드 점수: "환급", "국세청", "긴급", "클릭"
    - URL 분석 (단축 URL, 도메인 화이트리스트)
    - 판정: safe/warn/danger
    - scam_checks 테이블 로그
    """
    return {
        "status": "TODO",
        "message": f"Check scam for text='{text[:50]}...' not implemented",
        "label": "safe",
        "confidence": 0.0,
        "explanation": "",
    }
```

---

### app/routers/community.py

```python
from fastapi import APIRouter
from typing import Dict, List

router = APIRouter()


@router.get("/qna")
async def get_qna_list(subject: str = "폰", limit: int = 20) -> Dict:
    """
    Q&A 목록 조회
    
    TODO(IMPLEMENT):
    - Supabase에서 qna_posts 조회
    - is_deleted = false 필터
    - 페이지네이션
    """
    return {
        "status": "TODO",
        "message": f"Get Q&A list for subject={subject} not implemented",
        "data": [],
    }


@router.post("/qna")
async def create_qna_post(title: str, body: str, subject: str, is_anon: bool) -> Dict:
    """
    Q&A 작성
    
    TODO(IMPLEMENT):
    - 토큰 검증
    - 내용 검증 (금칙어 필터, 길이 제한)
    - AI 요약 생성 (룰 기반)
    - qna_posts 테이블 INSERT
    - audit_logs 기록
    """
    return {
        "status": "TODO",
        "message": "Create Q&A post not implemented",
        "post_id": "",
    }


@router.post("/reactions")
async def add_reaction(target_type: str, target_id: str, reaction_type: str) -> Dict:
    """
    반응 추가 (범용)
    
    TODO(IMPLEMENT):
    - 토큰 검증
    - reactions 테이블 upsert
    - 중복 반응 방지
    """
    return {
        "status": "TODO",
        "message": f"Add reaction not implemented",
    }
```

---

### app/routers/family.py

```python
from fastapi import APIRouter
from typing import Dict, List

router = APIRouter()


@router.post("/invite/redeem")
async def redeem_family_invite(code: str) -> Dict:
    """
    가족 초대 코드 사용
    
    TODO(IMPLEMENT):
    - 토큰 검증 (시니어)
    - family_links 테이블 생성 (status: pending)
    - 알림 전송
    """
    return {
        "status": "TODO",
        "message": f"Redeem family invite code={code} not implemented",
    }


@router.get("/usage")
async def get_family_usage(senior_id: str) -> Dict:
    """
    가족 대시보드용 사용량 조회
    
    TODO(IMPLEMENT):
    - 토큰 검증 (guardian)
    - family_links 권한 확인
    - usage_counters 조회
    - 개인정보 제외 (요약만)
    """
    return {
        "status": "TODO",
        "message": f"Get family usage for senior={senior_id} not implemented",
        "data": {},
    }
```

---

### app/schemas/card.py

```python
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Quiz(BaseModel):
    question: str
    options: List[str]
    correct_idx: int = Field(ge=0)
    explanation: str


class CardResponse(BaseModel):
    id: str
    user_id: str
    date: str  # ISO date
    type: str  # 'ai', 'trend', 'safety', 'mobile'
    title: str
    tldr: str
    body: str
    impact: str
    quizzes: List[Quiz]
    status: str  # 'pending', 'active', 'completed'
    completed_at: Optional[datetime] = None
    quiz_score: Optional[float] = Field(None, ge=0.0, le=1.0)


class CardCompleteRequest(BaseModel):
    quiz_answers: Optional[List[int]] = None


class CardCompleteResponse(BaseModel):
    status: str
    points_awarded: int
    streak: int
    badges_earned: List[str] = []
```

---

### app/schemas/insight.py

```python
from pydantic import BaseModel
from datetime import datetime


class InsightResponse(BaseModel):
    id: str
    topic: str  # 'ai', 'bigtech', 'economy', 'safety', 'mobile101'
    title: str
    body: str
    published_at: datetime
    is_published: bool
    view_count: int
    useful_count: int
    cheer_count: int


class ReactionRequest(BaseModel):
    reaction_type: str  # 'useful', 'cheer'


class ReactionResponse(BaseModel):
    status: str
    new_count: int
    points_awarded: int
```

---

### app/schemas/voice.py

```python
from pydantic import BaseModel
from typing import Dict, Optional


class VoiceParseRequest(BaseModel):
    text: str


class VoiceParseResponse(BaseModel):
    intent: str  # 'open', 'search', 'call', 'sms', 'remind', 'navigate', 'unknown'
    confidence: float
    slots: Dict[str, str] = {}
    action: Optional[Dict] = None
    message: str
```

---

### app/schemas/scam.py

```python
from pydantic import BaseModel
from typing import Optional


class ScamCheckRequest(BaseModel):
    text: str
    url: Optional[str] = None


class ScamCheckResponse(BaseModel):
    label: str  # 'safe', 'warn', 'danger'
    confidence: float
    explanation: str
    tips: str
    keywords_matched: list[str] = []
```

---

### app/schemas/community.py

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class QnaCreateRequest(BaseModel):
    subject: str  # '폰', '사기', '도구', '생활'
    title: str = Field(..., max_length=100)
    body: str = Field(..., max_length=1000)
    is_anon: bool = False


class QnaResponse(BaseModel):
    id: str
    author_id: str
    subject: str
    title: str
    body: str
    is_anon: bool
    ai_summary: Optional[str] = None
    created_at: datetime
    useful_count: int = 0


class ReactionCreateRequest(BaseModel):
    target_type: str  # 'card', 'insight', 'qna_post'
    target_id: str
    reaction_type: str  # 'cheer', 'useful'
```

---

### app/schemas/family.py

```python
from pydantic import BaseModel
from typing import Dict


class FamilyInviteRedeemRequest(BaseModel):
    code: str


class FamilyUsageResponse(BaseModel):
    senior_id: str
    cards_completed: int
    voice_intents_used: int
    scam_checks: int
    qna_posts: int
    med_checks: int
    weekly_activity: Dict[str, int] = {}
```

---

## ✅ 작업 체크리스트

### 초기 설정
- [ ] FastAPI 앱 초기화
- [ ] requirements.txt 생성
- [ ] .env.example 생성
- [ ] app/core/config.py 생성
- [ ] app/core/deps.py 스텁 생성

### 메인 앱
- [ ] app/main.py (FastAPI 앱, CORS, 라우터 등록)
- [ ] `/health` 엔드포인트
- [ ] `/` 루트 엔드포인트

### 라우터 (6개)
- [ ] app/routers/cards.py
- [ ] app/routers/insights.py
- [ ] app/routers/voice.py
- [ ] app/routers/scam.py
- [ ] app/routers/community.py
- [ ] app/routers/family.py

### Pydantic 스키마 (6개)
- [ ] app/schemas/card.py
- [ ] app/schemas/insight.py
- [ ] app/schemas/voice.py
- [ ] app/schemas/scam.py
- [ ] app/schemas/community.py
- [ ] app/schemas/family.py

### 통합 테스트
- [ ] `uvicorn app.main:app --reload` 실행 성공
- [ ] http://localhost:8000/health 접근
- [ ] http://localhost:8000/docs (Swagger UI) 확인
- [ ] 모든 엔드포인트가 TODO 응답 반환

---

## 🔗 다음 단계

BFF 서비스 스켈레톤이 완료되면 **[06-infra-scripts.md](./06-infra-scripts.md)**로 이동하여 인프라 및 개발 스크립트를 작성합니다.

---

**작성일**: 2025년 11월 13일  
**작성자**: AI Scaffolding Assistant
