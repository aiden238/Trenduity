from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.deps import init_redis_pool
from app.middleware.performance import PerformanceMiddleware
from app.routers import cards, insights, voice, scam, community, family, alerts, dashboard, med, gamification, usage, chat, expenses, todos, subscriptions, admin, courses, ai
import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    앱 시작/종료 시 실행되는 라이프사이클 이벤트
    """
    # 시작 시
    logger.info("BFF 서버 시작 중...")
    init_redis_pool()  # Redis 연결 풀 초기화
    logger.info("Redis 연결 풀 초기화 완료")
    
    yield
    
    # 종료 시
    logger.info("BFF 서버 종료 중...")

app = FastAPI(
    lifespan=lifespan,
    title="🎓 Trenduity BFF API",
    description="""
    ## 50-70대 시니어를 위한 디지털 리터러시 학습 플랫폼
    
    ### 🎯 주요 기능
    - **카드 학습**: 3분 학습 카드 + 퀴즈
    - **게임화**: 포인트, 배지, 레벨, 스트릭 시스템
    - **가족 연동**: 멤버 관리, 알림, 격려 메시지
    - **복약 체크**: 일정 관리 및 알림
    - **사기 검사**: AI 기반 위험도 판단
    - **3단계 접근성**: Normal/Easy/Ultra 모드 (WCAG 2.1 AA)
    
    ### 🔐 인증 방법
    ```bash
    # 모든 API 요청에 Bearer 토큰 필요
    Authorization: Bearer <JWT_TOKEN>
    
    # 테스트용 토큰 (개발 환경)
    test-jwt-token-for-senior-user  # 시니어 사용자 (demo-user-50s)
    test-jwt-token-for-guardian     # 보호자 (demo-guardian-50s)
    ```
    
    ### 📊 응답 형식 (Envelope Pattern)
    ```json
    // 성공
    {
      "ok": true,
      "data": { ... }
    }
    
    // 실패
    {
      "ok": false,
      "error": {
        "code": "ERROR_CODE",
        "message": "사용자 친화적인 한국어 메시지"
      }
    }
    ```
    
    ### 🏗️ 아키텍처
    - **모바일**: Expo React Native (TypeScript)
    - **웹**: Next.js 14 App Router
    - **BFF**: FastAPI (Python 3.11) ← 현재 문서
    - **DB**: Supabase (PostgreSQL + RLS)
    - **Cache**: Redis (레이트 리미팅, 캐싱)
    
    ### 📖 추가 문서
    - [GitHub Repository](https://github.com/aiden238/Trenduity)
    - [아키텍처 가이드](docs/PLAN/01-2-architecture-overview.md)
    - [구현 규칙](docs/IMPLEMENT/01-implementation-rules.md)
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "cards",
            "description": "📚 **학습 카드** - 오늘의 카드 조회, 완료, 퀴즈 제출"
        },
        {
            "name": "gamification",
            "description": "🎮 **게임화** - 포인트, 배지, 레벨, 스트릭 조회"
        },
        {
            "name": "family",
            "description": "👨‍👩‍👧‍👦 **가족 연동** - 멤버 관리, 활동 조회, 격려 메시지"
        },
        {
            "name": "med",
            "description": "💊 **복약 체크** - 복약 기록, 히스토리, 스트릭"
        },
        {
            "name": "scam",
            "description": "🛡️ **사기 검사** - 문자/링크 위험도 판단"
        },
        {
            "name": "insights",
            "description": "📊 **인사이트** - 주간/월간 학습 통계"
        },
        {
            "name": "community",
            "description": "💬 **커뮤니티** - Q&A, 좋아요, 댓글"
        },
        {
            "name": "voice",
            "description": "🎤 **음성** - 음성 명령 파싱 (TTS 준비)"
        },
        {
            "name": "alerts",
            "description": "🔔 **알림** - 알림 조회, 읽음 처리"
        },
        {
            "name": "dashboard",
            "description": "📈 **대시보드** - 통합 통계 (웹 전용)"
        },
        {
            "name": "usage",
            "description": "📱 **사용 통계** - 활동 추적"
        },
        {
            "name": "expenses",
            "description": "💰 **생활요금 체크** - 가계부, 지출 분석, AI 절약 팁"
        },
        {
            "name": "todos",
            "description": "📝 **할일 메모장** - 할일 관리, 알림 설정"
        },
        {
            "name": "courses",
            "description": "🎓 **강의 시스템** - EBSI 스타일 강의 목록, 강의 상세, 강의 재생, 진도 관리"
        },
    ],
)

# 성능 모니터링 미들웨어 (먼저 등록 - 전체 요청 시간 측정)
app.add_middleware(PerformanceMiddleware)

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
app.include_router(alerts.router, prefix=f"/{settings.API_VERSION}/alerts", tags=["alerts"])
app.include_router(dashboard.router, prefix=f"/{settings.API_VERSION}/dashboard", tags=["dashboard"])
app.include_router(med.router, prefix=f"/{settings.API_VERSION}/med", tags=["med"])
app.include_router(gamification.router, prefix=f"/{settings.API_VERSION}/gamification", tags=["gamification"])
app.include_router(usage.router, prefix=f"/{settings.API_VERSION}/usage", tags=["usage"])

# Auth 라우터 추가
from app.routers import auth
app.include_router(auth.router, prefix=f"/{settings.API_VERSION}/auth", tags=["auth"])

# Chat 라우터 추가
app.include_router(chat.router, prefix=f"/{settings.API_VERSION}/chat", tags=["chat"])

# Expenses 라우터 추가 (생활요금 체크)
app.include_router(expenses.router, prefix=f"/{settings.API_VERSION}/expenses", tags=["expenses"])

# Todos 라우터 추가 (할일 메모장)
app.include_router(todos.router, prefix=f"/{settings.API_VERSION}/todos", tags=["todos"])

# Subscriptions 라우터 추가 (구독 관리)
app.include_router(subscriptions.router, prefix=f"/{settings.API_VERSION}/subscriptions", tags=["subscriptions"])

# Admin 라우터 추가 (관리자 전용)
app.include_router(admin.router, prefix=f"/{settings.API_VERSION}/admin", tags=["admin"])

# Courses 라우터 추가 (강의 시스템)
app.include_router(courses.router, prefix=f"/{settings.API_VERSION}/courses", tags=["courses"])

# AI 라우터 추가 (GPT-5/Gemini 연동)
app.include_router(ai.router, prefix=f"/{settings.API_VERSION}/ai", tags=["ai"])


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


@app.get("/test/redis")
async def test_redis():
    """
    Redis 연결 테스트 엔드포인트
    """
    from app.core.deps import get_redis_client
    from datetime import datetime
    import json
    
    redis_client = None
    for client in get_redis_client():
        redis_client = client
        break
    
    if not redis_client:
        return {
            "ok": False,
            "error": "Redis 연결 실패"
        }
    
    try:
        # 테스트 키로 읽기/쓰기
        test_key = "test:redis:connection"
        test_value = {"timestamp": datetime.now().isoformat(), "message": "Redis 작동 중!"}
        
        # 쓰기
        redis_client.setex(test_key, 60, json.dumps(test_value))
        
        # 읽기
        cached = redis_client.get(test_key)
        result = json.loads(cached) if cached else None
        
        return {
            "ok": True,
            "data": {
                "redis_connected": True,
                "test_result": result
            }
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e)
        }


@app.post("/test/rate-limit")
async def test_rate_limiting():
    """
    Rate Limiting 테스트 엔드포인트 (인증 불필요)
    1분당 5회 제한
    """
    from app.core.deps import get_redis_client
    from fastapi import Request
    
    redis_client = None
    for client in get_redis_client():
        redis_client = client
        break
    
    if not redis_client:
        return {
            "ok": False,
            "error": "Redis 연결 실패 - Rate limiting 불가"
        }
    
    try:
        # 테스트용 고정 user_id
        test_user = "test-user-rate-limit"
        rate_limit_key = f"rate_limit:test:{test_user}"
        window = 60  # 1분
        max_requests = 5
        
        # 현재 요청 수 확인
        current_count = redis_client.get(rate_limit_key)
        count = int(current_count) if current_count else 0
        
        if count >= max_requests:
            return {
                "ok": False,
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": "요청이 너무 많습니다. 1분 후 다시 시도해 주세요."
                },
                "count": count,
                "max": max_requests
            }
        
        # 요청 수 증가
        pipe = redis_client.pipeline()
        pipe.incr(rate_limit_key)
        if count == 0:
            pipe.expire(rate_limit_key, window)
        pipe.execute()
        
        return {
            "ok": True,
            "data": {
                "count": count + 1,
                "max": max_requests,
                "remaining": max_requests - (count + 1)
            }
        }
    except Exception as e:
        logger.error(f"Rate limiting 테스트 실패: {e}")
        return {
            "ok": False,
            "error": str(e)
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
