from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from redis import Redis
from app.core.config import settings

# Security
security = HTTPBearer()


def get_supabase() -> Client:
    """
    Supabase 클라이언트 의존성
    
    서비스 역할 키로 RLS 우회하여 비즈니스 로직 처리
    """
    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key
    )


def get_redis_client() -> Generator:
    """
    Redis 클라이언트 의존성
    
    TODO(IMPLEMENT): Redis 연결 풀
    """
    # Placeholder for future caching
    yield None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase)
) -> str:
    """
    JWT 토큰 검증 및 사용자 ID 추출
    
    Args:
        credentials: Bearer 토큰
        supabase: Supabase 클라이언트
    
    Returns:
        user_id: 사용자 UUID
    
    Raises:
        HTTPException: 토큰이 유효하지 않을 때
    """
    token = credentials.credentials
    
    try:
        # Supabase Auth로 토큰 검증
        user = supabase.auth.get_user(token)
        
        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "ok": False,
                    "error": {
                        "code": "INVALID_TOKEN",
                        "message": "로그인 정보가 올바르지 않아요."
                    }
                }
            )
        
        return user.user.id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "ok": False,
                "error": {
                    "code": "AUTH_FAILED",
                    "message": "인증에 실패했어요. 다시 로그인해 주세요."
                }
            }
        )


def get_gamification_service(supabase: Client = Depends(get_supabase)):
    """
    GamificationService 의존성
    """
    from app.services.gamification import GamificationService
    return GamificationService(supabase)
