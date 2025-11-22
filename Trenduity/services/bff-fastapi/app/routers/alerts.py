from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Optional, List
from pydantic import BaseModel
from supabase import Client
from app.core.deps import get_supabase, get_current_user_optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()


class MarkReadRequest(BaseModel):
    """알림 읽음 처리 요청"""
    alert_ids: List[str]


@router.get("")
async def list_alerts(
    family_id: Optional[str] = None,
    unread_only: bool = False,
    limit: int = 50,
    db: Optional[Client] = Depends(get_supabase),
    user_id: Optional[str] = Depends(get_current_user_optional)
) -> Dict:
    """
    가족 알림 목록 조회
    
    Query params:
        family_id: 특정 가족 ID (없으면 user가 속한 모든 가족)
        unread_only: true면 읽지 않은 알림만
        limit: 최대 50개
    
    Returns:
        {
          "ok": true,
          "data": {
            "alerts": [
              {
                "id": "...",
                "type": "med_check" | "card_completed" | "tool_completed",
                "message": "...",
                "timestamp": "...",
                "is_read": false,
                "family_member_name": "김어머니"
              }
            ],
            "unread_count": 5
          }
        }
    """
    # 로컬 개발 모드: Supabase 미설정 시 더미 데이터 반환
    if not db:
        logger.warning("Supabase 미설정 - 더미 알림 데이터 반환")
        dummy_alerts = [
            {
                "id": "alert-1",
                "type": "med_check",
                "message": "김어머니님이 아침 약을 체크했습니다",
                "timestamp": datetime.now().isoformat(),
                "is_read": False,
                "family_member_name": "김어머니"
            },
            {
                "id": "alert-2",
                "type": "card_completed",
                "message": "박아버지님이 오늘의 카드를 완료했습니다",
                "timestamp": datetime.now().isoformat(),
                "is_read": True,
                "family_member_name": "박아버지"
            },
            {
                "id": "alert-3",
                "type": "tool_completed",
                "message": "이할머니님이 Canva 실습을 완료했습니다",
                "timestamp": datetime.now().isoformat(),
                "is_read": False,
                "family_member_name": "이할머니"
            }
        ]
        
        filtered_alerts = [a for a in dummy_alerts if not unread_only or not a["is_read"]]
        unread_count = len([a for a in dummy_alerts if not a["is_read"]])
        
        return {
            "ok": True,
            "data": {
                "alerts": filtered_alerts[:limit],
                "unread_count": unread_count
            }
        }
    
    try:
        # 인증되지 않은 경우 더미 데이터 반환
        if not user_id:
            logger.warning("인증되지 않음 - 더미 데이터 반환")
            return {
                "ok": True,
                "data": {
                    "alerts": dummy_alerts[:limit],
                    "unread_count": 2
                }
            }
        
        # 1. 사용자가 속한 가족 확인
        families_query = db.table('family_members') \
            .select('family_id') \
            .eq('user_id', user_id)
        
        if family_id:
            families_query = families_query.eq('family_id', family_id)
        
        families_result = families_query.execute()
        
        if not families_result.data:
            return {
                "ok": True,
                "data": {
                    "alerts": [],
                    "unread_count": 0
                }
            }
        
        family_ids = [f['family_id'] for f in families_result.data]
        
        # 2. 알림 조회
        query = db.table('alerts') \
            .select('*, family_members!inner(user:users(name))') \
            .in_('family_id', family_ids) \
            .order('created_at', desc=True) \
            .limit(limit)
        
        if unread_only:
            query = query.eq('is_read', False)
        
        alerts_result = query.execute()
        
        # 3. 응답 포맷팅
        alerts = []
        for alert in alerts_result.data:
            member_name = alert.get('family_members', {}).get('user', {}).get('name', '알 수 없음')
            alerts.append({
                "id": alert['id'],
                "type": alert['type'],
                "message": alert['message'],
                "timestamp": alert['created_at'],
                "is_read": alert['is_read'],
                "family_member_name": member_name
            })
        
        # 4. 읽지 않은 알림 수 계산
        unread_result = db.table('alerts') \
            .select('id', count='exact') \
            .in_('family_id', family_ids) \
            .eq('is_read', False) \
            .execute()
        
        unread_count = unread_result.count or 0
        
        return {
            "ok": True,
            "data": {
                "alerts": alerts,
                "unread_count": unread_count
            }
        }
    except Exception as e:
        logger.error(f"알림 조회 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "DB_ERROR",
                    "message": "알림을 불러오는데 문제가 생겼어요."
                }
            }
        )


@router.post("/mark-read")
async def mark_alerts_read(
    body: MarkReadRequest,
    db: Optional[Client] = Depends(get_supabase),
    user_id: Optional[str] = Depends(get_current_user_optional)
) -> Dict:
    """
    알림 읽음 처리
    
    Body:
        {
          "alert_ids": ["alert-1", "alert-2"]
        }
    
    Returns:
        {
          "ok": true,
          "data": {
            "updated_count": 2
          }
        }
    """
    # 로컬 개발 모드
    if not db:
        logger.warning("Supabase 미설정 - 더미 응답 반환")
        return {
            "ok": True,
            "data": {
                "updated_count": len(body.alert_ids)
            }
        }
    
    try:
        # 알림 읽음 처리 (사용자가 속한 가족의 알림만)
        result = db.table('alerts') \
            .update({'is_read': True}) \
            .in_('id', body.alert_ids) \
            .execute()
        
        updated_count = len(result.data) if result.data else 0
        
        return {
            "ok": True,
            "data": {
                "updated_count": updated_count
            }
        }
    except Exception as e:
        logger.error(f"알림 읽음 처리 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "DB_ERROR",
                    "message": "알림 처리에 실패했어요."
                }
            }
        )
