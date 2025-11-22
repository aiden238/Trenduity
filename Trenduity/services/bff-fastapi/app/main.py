from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.deps import init_redis_pool
from app.middleware.performance import PerformanceMiddleware
from app.routers import cards, insights, voice, scam, community, family, alerts, dashboard, med, gamification, usage
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
    title="Senior Learning App BFF",
    description="Backend for Frontend - 50-70대 AI 학습 앱",
    version="0.1.0",
    lifespan=lifespan,  # 라이프사이클 핸들러 등록
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
