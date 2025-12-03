from typing import Generator, Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from redis import Redis, ConnectionPool
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()  # 프로덕션용
security_dev = HTTPBearer(auto_error=False)  # 개발용 (토큰 없어도 통과)

# Redis 연결 풀 (앱 시작 시 1회 생성)
_redis_pool: Optional[ConnectionPool] = None


def init_redis_pool():
    """
    Redis 연결 풀 초기화
    앱 시작 시(main.py에서) 호출
    """
    global _redis_pool
    try:
        _redis_pool = ConnectionPool.from_url(
            settings.REDIS_URL,
            decode_responses=True,  # 자동 UTF-8 디코딩
            max_connections=10,     # 최대 연결 수
            socket_timeout=5,       # 타임아웃 5초
            socket_connect_timeout=5,
        )
        logger.info(f"Redis 연결 풀 초기화 성공: {settings.REDIS_URL}")
    except Exception as e:
        logger.error(f"Redis 연결 풀 초기화 실패: {e}")
        _redis_pool = None


def get_supabase() -> Optional[Client]:
    """
    Supabase 클라이언트 의존성
    
    서비스 역할 키로 RLS 우회하여 비즈니스 로직 처리
    로컬 개발 시 Supabase 미설정 시 None 반환
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("Supabase 설정이 없습니다. 로컬 개발 모드에서는 일부 기능이 제한됩니다.")
        return None
    
    try:
        return create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
    except Exception as e:
        logger.error(f"Supabase 클라이언트 생성 실패: {e}")
        return None


def get_redis_client() -> Optional[Redis]:
    """
    Redis 클라이언트 의존성 (단순 반환 함수)
    
    연결 풀에서 클라이언트 가져오기
    Redis 연결 실패 시 None 반환 (앱이 중단되지 않도록)
    
    사용법:
        redis: Optional[Redis] = Depends(get_redis_client)
        if redis:
            redis.set("key", "value")
    
    주의: 이 함수는 Generator가 아닌 단순 반환 함수입니다.
          기존 `for client in get_redis_client()` 패턴은 사용하지 마세요.
    """
    if _redis_pool is None:
        logger.warning("Redis 연결 풀이 초기화되지 않았습니다. None 반환.")
        return None
    
    try:
        redis_client = Redis(connection_pool=_redis_pool)
        # 연결 테스트
        redis_client.ping()
        return redis_client
    except Exception as e:
        logger.error(f"Redis 클라이언트 생성 실패: {e}")
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_dev),  # \ud56d\uc0c1 Optional\ub85c \ubc1b\uc74c
    supabase: Client = Depends(get_supabase)
) -> Dict[str, Any]:
    """
    JWT 토큰 검증 및 사용자 정보 추출
    
    Args:
        credentials: Bearer 토큰 (개발 모드에서는 Optional)
        supabase: Supabase 클라이언트
    
    Returns:
        user_dict: {"id": "user_id", ...} 형태의 사용자 정보
    
    Raises:
        HTTPException: 토큰이 유효하지 않을 때
    """
    
    # 개발 환경에서 테스트 토큰 허용
    if settings.ENV == "development" and credentials:
        token = credentials.credentials
        TEST_TOKENS = {
            "test-jwt-token-for-senior-user": {"id": "demo-user-50s"},
            "test-jwt-token-for-guardian-user": {"id": "demo-guardian-50s"},
        }
        logger.info(f"[DEV MODE] Checking token: {token[:min(20, len(token))]}... against test tokens")
        if token in TEST_TOKENS:
            logger.info(f"[DEV MODE] Test token matched! Returning user: {TEST_TOKENS[token]}")
            # dict로 반환하여 med.py 등에서 current_user["id"] 접근 가능
            return TEST_TOKENS[token]
        logger.info("[DEV MODE] Token not in TEST_TOKENS, falling through to Supabase")
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "ok": False,
                "error": {
                    "code": "MISSING_TOKEN",
                    "message": "로그인이 필요한 기능이에요."
                }
            }
        )
    
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
        
        # Dict 형태로 반환 (확장성 고려)
        return {
            "id": user.user.id,
            "email": user.user.email,
        }
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


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    supabase: Optional[Client] = Depends(get_supabase)
) -> Optional[str]:
    """
    JWT 토큰 검증 (Optional) - 테스트/개발용
    
    인증이 없어도 None을 반환하고 계속 진행
    """
    if not credentials:
        logger.warning("인증 정보 없음 - 개발 모드")
        return None
    
    # 개발 환경에서 테스트 토큰 허용
    if settings.ENV == "development":
        token = credentials.credentials
        TEST_TOKENS = {
            "test-jwt-token-for-senior-user": "demo-user-50s",
            "test-jwt-token-for-guardian-user": "demo-guardian-50s",
        }
        logger.info(f"[DEV MODE Optional] Checking token: {token[:min(20, len(token))]}... against test tokens")
        if token in TEST_TOKENS:
            logger.info(f"[DEV MODE Optional] Test token matched! Returning user: {TEST_TOKENS[token]}")
            return TEST_TOKENS[token]
        logger.info("[DEV MODE Optional] Token not in TEST_TOKENS, falling through to Supabase")
    
    if not supabase:
        logger.warning("Supabase 미설정 - 개발 모드")
        return None
    
    try:
        token = credentials.credentials
        user = supabase.auth.get_user(token)
        
        if user and user.user:
            return user.user.id
        return None
    except Exception as e:
        logger.warning(f"토큰 검증 실패: {e}")
        return None


def get_gamification_service(
    supabase: Client = Depends(get_supabase),
    redis: Optional[Redis] = Depends(get_redis_client)
):
    """
    GamificationService 의존성 (Redis 캐싱 포함)
    """
    from app.services.gamification import GamificationService
    return GamificationService(supabase, redis)
