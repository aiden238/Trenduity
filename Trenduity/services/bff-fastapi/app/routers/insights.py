from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Dict, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from supabase import Client
from app.core.deps import get_supabase, get_current_user

router = APIRouter()


@router.get("")
async def list_insights(
    topic: Optional[str] = Query(None, description="Filter by topic: ai_tools, digital_safety, health, finance"),
    range: str = Query("weekly", description="weekly | monthly"),
    limit: int = Query(20, le=50),
    offset: int = Query(0),
    db: Client = Depends(get_supabase)
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
    try:
        # 1. 날짜 범위 계산
        days = 7 if range == "weekly" else 30
        start_date = (datetime.now() - timedelta(days=days)).date()
        
        # 2. 쿼리 빌드
        query = db.table('insights') \
            .select('id, date, topic, title, summary, source', count='exact') \
            .gte('date', start_date.isoformat()) \
            .order('date', desc=True) \
            .range(offset, offset + limit - 1)
        
        if topic:
            query = query.eq('topic', topic)
        
        result = query.execute()
        
        return {
            "ok": True,
            "data": {
                "insights": result.data,
                "total": result.count
            }
        }
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


@router.get("/{insight_id}")
async def get_insight_detail(
    insight_id: str,
    db: Client = Depends(get_supabase)
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
    try:
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
        
        return {
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
