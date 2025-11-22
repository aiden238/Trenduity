from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Dict, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from supabase import Client
from redis import Redis
from app.core.deps import get_supabase, get_current_user, get_redis_client
from app.utils.error_translator import translate_db_error, is_db_error
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# 캐시 TTL (초)
CACHE_TTL_INSIGHTS_LIST = 300  # 5분
CACHE_TTL_INSIGHTS_DETAIL = 600  # 10분


@router.get("")
async def list_insights(
    topic: Optional[str] = Query(None, description="Filter by topic: ai_tools, digital_safety, health, finance"),
    range: str = Query("weekly", description="weekly | monthly"),
    limit: int = Query(20, le=50),
    offset: int = Query(0),
    db: Client = Depends(get_supabase),
    redis: Optional[Redis] = Depends(get_redis_client)
) -> Dict:
    """
    인사이트 목록 조회
    
    Query params:
        topic: ai_tools, digital_safety, health, finance
        range: weekly (7일), monthly (30일)
        limit: 최대 50
        offset: 페이지네이션
    
    Returns:
        {
          "ok": true,
          "data": {
            "insights": [...],
            "total": 42
          }
        }
    """
    # Redis 캐시 키 생성
    cache_key = f"insights:list:topic_{topic or 'all'}:range_{range}:limit_{limit}:offset_{offset}"
    
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
        
        # 2. 날짜 범위 계산
        days = 7 if range == "weekly" else 30
        start_date = (datetime.now() - timedelta(days=days)).date()
        
        # 3. 쿼리 빌드 (created_at 사용)
        query = db.table('insights') \
            .select('id, created_at, topic, title, summary, read_time_minutes', count='exact') \
            .gte('created_at', start_date.isoformat()) \
            .order('created_at', desc=True) \
            .range(offset, offset + limit - 1)
        
        if topic:
            query = query.eq('topic', topic)
        
        result = query.execute()
        
        response = {
            "ok": True,
            "data": {
                "insights": result.data,
                "total": result.count
            }
        }
        
        # 4. 캐시 저장
        if redis:
            try:
                redis.setex(cache_key, CACHE_TTL_INSIGHTS_LIST, json.dumps(response))
                logger.info(f"캐시 저장: {cache_key} (TTL: {CACHE_TTL_INSIGHTS_LIST}s)")
            except Exception as e:
                logger.warning(f"캐시 저장 실패 (계속 진행): {e}")
        
        return response
    except Exception as e:
        logger.error(f"인사이트 목록 조회 실패: {e}")
        
        # DB 에러인 경우 한국어 번역 적용
        if is_db_error(e):
            error_info = translate_db_error(e)
            raise HTTPException(
                status_code=500,
                detail={
                    "ok": False,
                    "error": error_info
                }
            )
        
        # 일반 에러
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "INSIGHTS_LIST_ERROR",
                    "message": "인사이트를 불러오는데 문제가 생겼어요. 새로고침 해보세요."
                }
            }
        )


@router.get("/{insight_id}")
async def get_insight_detail(
    insight_id: str,
    db: Optional[Client] = Depends(get_supabase),
    redis: Optional[Redis] = Depends(get_redis_client)
) -> Dict:
    """
    인사이트 상세 조회
    
    Returns:
        {
          "ok": true,
          "data": {
            "insight": {
              "id": "...",
              "title": "...",
              "summary": "...",
              "body": "...",
              "impact": "...",
              "source": "...",
              "references": [...]
            }
          }
        }
    """
    cache_key = f"insights:detail:{insight_id}"
    
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
        
        # 로컬 개발 모드: Supabase 미설정 시 더미 데이터 반환
        if not db:
            logger.warning(f"Supabase 미설정 - 더미 데이터 반환: {insight_id}")
            dummy_response = {
                "ok": True,
                "data": {
                    "insight": {
                        "id": insight_id,
                        "title": "[테스트] AI 도구 활용 가이드",
                        "summary": "최신 AI 도구를 시니어도 쉽게 사용할 수 있는 방법",
                        "body": "ChatGPT, Copilot 등 AI 도구의 기본 사용법을 알아봅니다...",
                        "impact": "디지털 격차 해소 및 생산성 향상",
                        "source": "테크 리포트 2024",
                        "references": ["https://example.com"],
                        "topic": "ai_tools",
                        "date": datetime.now().date().isoformat()
                    }
                }
            }
            
            # 더미 데이터도 캐싱
            if redis:
                try:
                    redis.setex(cache_key, CACHE_TTL_INSIGHTS_DETAIL, json.dumps(dummy_response))
                    logger.info(f"더미 데이터 캐시 저장: {cache_key}")
                except Exception as e:
                    logger.warning(f"캐시 저장 실패: {e}")
            
            return dummy_response
        
        # 2. DB 조회
        result = db.table('insights') \
            .select('*') \
            .eq('id', insight_id) \
            .single() \
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=404,
                detail={
                    "ok": False,
                    "error": {
                        "code": "INSIGHT_NOT_FOUND",
                        "message": "인사이트를 찾을 수 없어요."
                    }
                }
            )
        
        insight = result.data
        payload = insight.get('payload', {})
        body = payload.get('body', '')
        impact = payload.get('impact', '')
        references = payload.get('references', [])
        
        response = {
            "ok": True,
            "data": {
                "insight": {
                    **insight,
                    "body": body,
                    "impact": impact,
                    "references": references
                }
            }
        }
        
        # 3. 캐시 저장
        if redis:
            try:
                redis.setex(cache_key, CACHE_TTL_INSIGHTS_DETAIL, json.dumps(response))
                logger.info(f"캐시 저장: {cache_key} (TTL: {CACHE_TTL_INSIGHTS_DETAIL}s)")
            except Exception as e:
                logger.warning(f"캐시 저장 실패 (계속 진행): {e}")
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "DB_ERROR",
                    "message": "인사이트를 불러오는데 문제가 생겼어요."
                }
            }
        )


class FollowTopicRequest(BaseModel):
    topic: str  # ai_tools, digital_safety, health, finance


@router.post("/follow")
async def follow_topic(
    body: FollowTopicRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    주제 팔로우 (토글)
    
    Returns:
        {
          "ok": true,
          "data": { "is_following": true }
        }
    """
    try:
        # 기존 팔로우 확인
        existing = db.table('insight_follows') \
            .select('*') \
            .eq('user_id', user_id) \
            .eq('topic', body.topic) \
            .execute()
        
        if existing.data and len(existing.data) > 0:
            # 이미 팔로우 중 → 언팔로우
            db.table('insight_follows') \
                .delete() \
                .eq('user_id', user_id) \
                .eq('topic', body.topic) \
                .execute()
            
            return {
                "ok": True,
                "data": {"is_following": False}
            }
        else:
            # 팔로우
            db.table('insight_follows').insert({
                'user_id': user_id,
                'topic': body.topic
            }).execute()
            
            return {
                "ok": True,
                "data": {"is_following": True}
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "DB_ERROR",
                    "message": "팔로우 처리에 실패했어요."
                }
            }
        )


@router.get("/following")
async def get_following_topics(
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    사용자가 팔로우 중인 주제 목록
    
    Returns:
        {
          "ok": true,
          "data": {
            "topics": ["ai_tools", "health"]
          }
        }
    """
    try:
        result = db.table('insight_follows') \
            .select('topic') \
            .eq('user_id', user_id) \
            .execute()
        
        topics = [row['topic'] for row in result.data] if result.data else []
        
        return {
            "ok": True,
            "data": {"topics": topics}
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "DB_ERROR",
                    "message": "팔로우 목록을 불러오는데 문제가 생겼어요."
                }
            }
        )
