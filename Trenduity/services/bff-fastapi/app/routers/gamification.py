"""
Gamification 라우터

게임화 데이터 조회 엔드포인트 (Redis 캐싱 적용)
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Optional
from app.core.deps import get_current_user, get_gamification_service, get_redis_client
from app.services.gamification import GamificationService
from redis import Redis
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# 캐시 TTL (초)
CACHE_TTL_STATS = 60  # 1분 (자주 변경됨)
CACHE_TTL_BADGES = 3600  # 1시간 (거의 변경 없음)
CACHE_TTL_LEVEL = 300  # 5분


@router.get("/stats")
async def get_user_gamification_stats(
    user_id: str = Depends(get_current_user),
    gamification: GamificationService = Depends(get_gamification_service),
    redis: Optional[Redis] = Depends(get_redis_client)
) -> Dict:
    """
    사용자 게임화 통계 조회 (Redis 캐싱)

    Returns:
        {
            "ok": true,
            "data": {
                "total_points": 157,
                "level": 2,
                "current_streak": 7,
                "badges": ["첫걸음", "일주일 연속"],
                "cards_completed": 15,
                "quizzes_correct": 25
            }
        }
    """
    cache_key = f"gamification:stats:{user_id}"
    
    try:
        # 1. 캐시 조회
        if redis:
            try:
                cached = redis.get(cache_key)
                if cached:
                    logger.info(f"캐시 히트: {cache_key}")
                    return json.loads(cached)
            except Exception as e:
                logger.warning(f"캐시 조회 실패 (계속 진행): {e}")
        
        # 2. DB 조회
        stats = await gamification.get_user_stats(user_id)
        response = {"ok": True, "data": stats}
        
        # 3. 캐시 저장
        if redis:
            try:
                redis.setex(cache_key, CACHE_TTL_STATS, json.dumps(response))
                logger.info(f"캐시 저장: {cache_key} (TTL: {CACHE_TTL_STATS}s)")
            except Exception as e:
                logger.warning(f"캐시 저장 실패 (계속 진행): {e}")
        
        return response
    except Exception as e:
        logger.error(f"Failed to get gamification stats: user={user_id}, error={e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "STATS_FETCH_ERROR",
                    "message": "통계를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.",
                },
            },
        )


@router.get("/level-progress")
async def get_level_progress(
    user_id: str = Depends(get_current_user),
    gamification: GamificationService = Depends(get_gamification_service),
    redis: Optional[Redis] = Depends(get_redis_client)
) -> Dict:
    """
    현재 레벨 진행률 조회 (Redis 캐싱)

    Returns:
        {
            "ok": true,
            "data": {
                "current_level": 2,
                "current_points": 150,
                "next_level": 3,
                "next_level_threshold": 300,
                "progress_percentage": 50,
                "points_needed": 150
            }
        }
    """
    cache_key = f"gamification:level:{user_id}"
    
    try:
        # 1. 캐시 조회
        if redis:
            try:
                cached = redis.get(cache_key)
                if cached:
                    logger.info(f"캐시 히트: {cache_key}")
                    return json.loads(cached)
            except Exception as e:
                logger.warning(f"캐시 조회 실패 (계속 진행): {e}")
        
        # 2. DB 조회
        progress = await gamification.calculate_level_progress(user_id)
        response = {"ok": True, "data": progress}
        
        # 3. 캐시 저장
        if redis:
            try:
                redis.setex(cache_key, CACHE_TTL_LEVEL, json.dumps(response))
                logger.info(f"캐시 저장: {cache_key} (TTL: {CACHE_TTL_LEVEL}s)")
            except Exception as e:
                logger.warning(f"캐시 저장 실패 (계속 진행): {e}")
        
        return response
    except Exception as e:
        logger.error(f"Failed to get level progress: user={user_id}, error={e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "LEVEL_PROGRESS_ERROR",
                    "message": "레벨 정보를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.",
                },
            },
        )


@router.get("/badges")
async def get_user_badges(
    user_id: str = Depends(get_current_user),
    gamification: GamificationService = Depends(get_gamification_service),
    redis: Optional[Redis] = Depends(get_redis_client)
) -> Dict:
    """
    사용자 배지 목록 조회 (Redis 캐싱)

    Returns:
        {
            "ok": true,
            "data": {
                "badges": ["첫걸음", "일주일 연속", "포인트 100"]
            }
        }
    """
    cache_key = f"gamification:badges:{user_id}"
    
    try:
        # 1. 캐시 조회
        if redis:
            try:
                cached = redis.get(cache_key)
                if cached:
                    logger.info(f"캐시 히트: {cache_key}")
                    return json.loads(cached)
            except Exception as e:
                logger.warning(f"캐시 조회 실패 (계속 진행): {e}")
        
        # 2. DB 조회
        gamif = await gamification._get_or_create_gamification(user_id)
        badges = gamif.get("badges", [])
        response = {"ok": True, "data": {"badges": badges}}
        
        # 3. 캐시 저장
        if redis:
            try:
                redis.setex(cache_key, CACHE_TTL_BADGES, json.dumps(response))
                logger.info(f"캐시 저장: {cache_key} (TTL: {CACHE_TTL_BADGES}s)")
            except Exception as e:
                logger.warning(f"캐시 저장 실패 (계속 진행): {e}")
        
        return response
    except Exception as e:
        logger.error(f"Failed to get badges: user={user_id}, error={e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "BADGES_FETCH_ERROR",
                    "message": "배지 목록을 불러올 수 없어요. 잠시 후 다시 시도해 주세요.",
                },
            },
        )
