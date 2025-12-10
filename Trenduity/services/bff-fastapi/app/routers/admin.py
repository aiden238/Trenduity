"""
ê´€ë¦¬ì ?¼ìš°??(Admin Router)

ê´€ë¦¬ì ?„ìš© API - ?¬ìš©??ê´€ë¦? ?µê³„, ì½˜í…ì¸?ê´€ë¦?
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime, timedelta
import logging

from app.core.deps import get_current_user, get_supabase
from app.schemas.admin import (
    AdminUserInfo,
    AdminUserListResponse,
    AdminStatsResponse,
    AdminAIUsageStats,
    UpdateUserRequest,
    ContentItem,
    CreateAnnouncementRequest,
    UserRole,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def verify_admin(current_user: dict):
    """ê´€ë¦¬ì ê¶Œí•œ ?•ì¸"""
    role = current_user.get("role", "user")
    if role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail={
                "ok": False,
                "error": {
                    "code": "FORBIDDEN",
                    "message": "ê´€ë¦¬ì ê¶Œí•œ???„ìš”?´ìš”."
                }
            }
        )
    return True


@router.get("/stats")
async def get_admin_stats(
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    ê´€ë¦¬ì ?€?œë³´???µê³„
    
    - ì´??¬ìš©???? ?œì„± ?¬ìš©?? ? ê·œ ê°€??
    - AI ?”ì²­ ?µê³„
    - êµ¬ë… ?Œëœë³??µê³„
    - ë§¤ì¶œ ?•ë³´
    """
    verify_admin(current_user)
    
    try:
        # ?µê³„ ?°ì´??(?¤ì œë¡œëŠ” Supabase?ì„œ ì§‘ê³„)
        # ëª©ì—… ?°ì´??
        stats = AdminStatsResponse(
            total_users=1250,
            active_users_today=340,
            active_users_week=890,
            total_ai_requests_today=2500,
            total_ai_requests_week=15600,
            subscription_stats={
                "FREE": 800,
                "BUDGET": 280,
                "SAFE": 120,
                "STRONG": 50,
            },
            revenue_this_month=12500000,  # 1,250ë§Œì›
            new_users_today=15,
            new_users_week=85,
        )
        
        return {
            "ok": True,
            "data": stats.model_dump()
        }
        
    except Exception as e:
        logger.error(f"Failed to get admin stats: {e}")
        return {
            "ok": False,
            "error": {
                "code": "STATS_ERROR",
                "message": "?µê³„ë¥?ë¶ˆëŸ¬?¤ëŠ”???¤íŒ¨?ˆì–´??"
            }
        }


@router.get("/users")
async def get_users(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    plan: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    ?¬ìš©??ëª©ë¡ ì¡°íšŒ
    
    - ?˜ì´ì§€?¤ì´??
    - ê²€??(?´ë¦„, ?´ë©”??
    - ?Œëœë³??„í„°
    """
    verify_admin(current_user)
    
    try:
        # ëª©ì—… ?°ì´??(?¤ì œë¡œëŠ” Supabase?ì„œ ì¡°íšŒ)
        mock_users = [
            AdminUserInfo(
                id=f"user_{i}",
                email=f"user{i}@example.com",
                name=f"?¬ìš©??{i}",
                phone="010-****-1234",
                role=UserRole.USER,
                subscription_plan="FREE" if i % 4 == 0 else "BUDGET" if i % 4 == 1 else "SAFE" if i % 4 == 2 else "STRONG",
                created_at=datetime.now() - timedelta(days=i * 3),
                last_login=datetime.now() - timedelta(hours=i),
                total_ai_usage=i * 15,
                is_active=True,
            )
            for i in range(1, 21)
        ]
        
        # ê²€???„í„° (ëª©ì—…)
        if search:
            mock_users = [u for u in mock_users if search.lower() in u.name.lower() or search.lower() in u.email.lower()]
        
        # ?Œëœ ?„í„°
        if plan:
            mock_users = [u for u in mock_users if u.subscription_plan == plan]
        
        # ?˜ì´ì§€?¤ì´??
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_users = mock_users[start_idx:end_idx]
        
        response = AdminUserListResponse(
            users=paginated_users,
            total=len(mock_users),
            page=page,
            page_size=page_size,
        )
        
        return {
            "ok": True,
            "data": response.model_dump()
        }
        
    except Exception as e:
        logger.error(f"Failed to get users: {e}")
        return {
            "ok": False,
            "error": {
                "code": "USERS_ERROR",
                "message": "?¬ìš©??ëª©ë¡??ë¶ˆëŸ¬?¤ëŠ”???¤íŒ¨?ˆì–´??"
            }
        }


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    ?¬ìš©???ì„¸ ?•ë³´
    """
    verify_admin(current_user)
    
    try:
        # ëª©ì—… ?°ì´??
        user = AdminUserInfo(
            id=user_id,
            email="user@example.com",
            name="?ê¸¸??,
            phone="010-1234-5678",
            role=UserRole.USER,
            subscription_plan="BUDGET",
            created_at=datetime.now() - timedelta(days=30),
            last_login=datetime.now() - timedelta(hours=2),
            total_ai_usage=150,
            is_active=True,
        )
        
        return {
            "ok": True,
            "data": user.model_dump()
        }
        
    except Exception as e:
        logger.error(f"Failed to get user detail: {e}")
        return {
            "ok": False,
            "error": {
                "code": "USER_NOT_FOUND",
                "message": "?¬ìš©?ë? ì°¾ì„ ???†ì–´??"
            }
        }


@router.patch("/users/{user_id}")
async def update_user(
    user_id: str,
    body: UpdateUserRequest,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    ?¬ìš©???•ë³´ ?˜ì • (??• , ?Œëœ, ?œì„± ?íƒœ)
    """
    verify_admin(current_user)
    
    try:
        # ?¤ì œë¡œëŠ” Supabase ?…ë°?´íŠ¸
        logger.info(f"Updating user {user_id}: {body.model_dump()}")
        
        return {
            "ok": True,
            "data": {
                "message": "?¬ìš©???•ë³´ê°€ ?˜ì •?˜ì—ˆ?´ìš”.",
                "user_id": user_id
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to update user: {e}")
        return {
            "ok": False,
            "error": {
                "code": "UPDATE_ERROR",
                "message": "?¬ìš©???•ë³´ ?˜ì •???¤íŒ¨?ˆì–´??"
            }
        }


@router.get("/ai-usage")
async def get_ai_usage_stats(
    days: int = 7,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    AI ?¬ìš©???µê³„
    
    - ëª¨ë¸ë³??”ì²­ ??
    - ?¬ìš©?ë³„ ?‰ê· 
    """
    verify_admin(current_user)
    
    try:
        # ëª©ì—… ?°ì´??
        usage_stats = [
            AdminAIUsageStats(
                model_id="quick",
                model_name="ë¹ ë¥¸ ?¼ë°˜ ë¹„ì„œ (Gemini)",
                total_requests=5200,
                unique_users=820,
                avg_requests_per_user=6.3,
            ),
            AdminAIUsageStats(
                model_id="allround",
                model_name="ë§ŒëŠ¥ ë¹„ì„œ (GPT-4o-mini)",
                total_requests=8500,
                unique_users=950,
                avg_requests_per_user=8.9,
            ),
            AdminAIUsageStats(
                model_id="writer",
                model_name="ê¸€?°ê¸° ë¹„ì„œ (Claude)",
                total_requests=3200,
                unique_users=420,
                avg_requests_per_user=7.6,
            ),
            AdminAIUsageStats(
                model_id="expert",
                model_name="ì²™ì²™ë°•ì‚¬ ë¹„ì„œ (GPT-4o)",
                total_requests=2100,
                unique_users=280,
                avg_requests_per_user=7.5,
            ),
            AdminAIUsageStats(
                model_id="genius",
                model_name="ì²œì¬ ë¹„ì„œ (Claude Opus)",
                total_requests=450,
                unique_users=50,
                avg_requests_per_user=9.0,
            ),
        ]
        
        return {
            "ok": True,
            "data": {
                "period_days": days,
                "stats": [s.model_dump() for s in usage_stats]
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get AI usage stats: {e}")
        return {
            "ok": False,
            "error": {
                "code": "STATS_ERROR",
                "message": "AI ?¬ìš©???µê³„ë¥?ë¶ˆëŸ¬?¤ëŠ”???¤íŒ¨?ˆì–´??"
            }
        }


@router.post("/announcements")
async def create_announcement(
    body: CreateAnnouncementRequest,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    ê³µì??¬í•­ ?±ë¡
    """
    verify_admin(current_user)
    
    try:
        # ?¤ì œë¡œëŠ” Supabase???€??
        logger.info(f"Creating announcement: {body.title}")
        
        return {
            "ok": True,
            "data": {
                "message": "ê³µì??¬í•­???±ë¡?˜ì—ˆ?´ìš”.",
                "id": "announcement_123"
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to create announcement: {e}")
        return {
            "ok": False,
            "error": {
                "code": "CREATE_ERROR",
                "message": "ê³µì??¬í•­ ?±ë¡???¤íŒ¨?ˆì–´??"
            }
        }


@router.get("/announcements")
async def get_announcements(
    page: int = 1,
    page_size: int = 10,
    current_user: dict = Depends(get_current_user),
):
    """
    ê³µì??¬í•­ ëª©ë¡
    """
    verify_admin(current_user)
    
    try:
        # ëª©ì—… ?°ì´??
        announcements = [
            ContentItem(
                id=f"ann_{i}",
                title=f"ê³µì??¬í•­ {i}: ?œë¹„???…ë°?´íŠ¸ ?ˆë‚´",
                content_type="announcement",
                status="published",
                created_at=datetime.now() - timedelta(days=i),
                views=100 + i * 20,
            )
            for i in range(1, 11)
        ]
        
        return {
            "ok": True,
            "data": {
                "announcements": [a.model_dump() for a in announcements],
                "total": len(announcements),
                "page": page,
                "page_size": page_size,
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get announcements: {e}")
        return {
            "ok": False,
            "error": {
                "code": "LIST_ERROR",
                "message": "ê³µì??¬í•­ ëª©ë¡??ë¶ˆëŸ¬?¤ëŠ”???¤íŒ¨?ˆì–´??"
            }
        }
