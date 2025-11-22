"""
Redis 캐싱 유틸리티

자주 조회되는 데이터를 Redis에 캐싱하여 성능 향상
"""
import json
from typing import Optional, Any, Callable
from datetime import timedelta
from functools import wraps
import logging

logger = logging.getLogger(__name__)


def cache_key(*args, **kwargs) -> str:
    """
    캐시 키 생성
    
    예: cache_key('card', 'today', user_id='abc') → 'card:today:abc'
    """
    parts = [str(arg) for arg in args]
    for k, v in sorted(kwargs.items()):
        parts.append(f"{k}:{v}")
    return ":".join(parts)


def get_cached(redis_client, key: str) -> Optional[Any]:
    """
    캐시에서 데이터 조회
    """
    try:
        cached = redis_client.get(key)
        if cached:
            logger.debug(f"✅ Cache HIT: {key}")
            return json.loads(cached)
        logger.debug(f"❌ Cache MISS: {key}")
        return None
    except Exception as e:
        logger.error(f"Cache get error: {e}")
        return None


def set_cached(
    redis_client, 
    key: str, 
    value: Any, 
    ttl: int = 300  # 5분 기본
) -> bool:
    """
    캐시에 데이터 저장
    
    Args:
        redis_client: Redis 클라이언트
        key: 캐시 키
        value: 저장할 값 (JSON 직렬화 가능)
        ttl: TTL (초)
    """
    try:
        redis_client.setex(
            key,
            ttl,
            json.dumps(value, ensure_ascii=False)
        )
        logger.debug(f"💾 Cache SET: {key} (TTL: {ttl}s)")
        return True
    except Exception as e:
        logger.error(f"Cache set error: {e}")
        return False


def invalidate_cache(redis_client, pattern: str) -> int:
    """
    캐시 무효화 (패턴 매칭)
    
    예: invalidate_cache(redis, 'card:*') → 모든 카드 캐시 삭제
    """
    try:
        keys = redis_client.keys(pattern)
        if keys:
            deleted = redis_client.delete(*keys)
            logger.info(f"🗑️ Cache invalidated: {deleted} keys ({pattern})")
            return deleted
        return 0
    except Exception as e:
        logger.error(f"Cache invalidation error: {e}")
        return 0


def cached(ttl: int = 300, key_prefix: str = ""):
    """
    함수 결과를 캐싱하는 데코레이터
    
    사용 예:
    @cached(ttl=3600, key_prefix="insights")
    async def get_insights_list(topic: str):
        # 비싼 DB 조회
        return data
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Redis 클라이언트 가져오기 (kwargs에서)
            redis_client = kwargs.get('redis_client')
            if not redis_client:
                # 캐시 없이 실행
                return await func(*args, **kwargs)
            
            # 캐시 키 생성
            key_parts = [key_prefix, func.__name__]
            key_parts.extend(str(arg) for arg in args)
            key = cache_key(*key_parts)
            
            # 캐시 확인
            cached_result = get_cached(redis_client, key)
            if cached_result is not None:
                return cached_result
            
            # 함수 실행
            result = await func(*args, **kwargs)
            
            # 캐시 저장
            set_cached(redis_client, key, result, ttl)
            
            return result
        return wrapper
    return decorator


# 캐시 TTL 프리셋
CACHE_TTL = {
    "very_short": 60,        # 1분 (실시간 데이터)
    "short": 300,            # 5분 (자주 변경)
    "medium": 600,           # 10분 (보통)
    "long": 3600,            # 1시간 (거의 변경 없음)
    "very_long": 86400,      # 24시간 (정적)
}
