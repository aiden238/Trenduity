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
