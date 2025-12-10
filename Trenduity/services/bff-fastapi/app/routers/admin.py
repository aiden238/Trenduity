"""
愿由ъ옄 ?쇱슦??(Admin Router)

愿由ъ옄 ?꾩슜 API - ?ъ슜??愿由? ?듦퀎, 肄섑뀗痢?愿由?
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
    """愿由ъ옄 沅뚰븳 ?뺤씤"""
    role = current_user.get("role", "user")
    if role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail={
                "ok": False,
                "error": {
                    "code": "FORBIDDEN",
                    "message": "愿由ъ옄 沅뚰븳???꾩슂?댁슂."
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
    愿由ъ옄 ??쒕낫???듦퀎
    
    - 珥??ъ슜???? ?쒖꽦 ?ъ슜?? ?좉퇋 媛??
    - AI ?붿껌 ?듦퀎
    - 援щ룆 ?뚮옖蹂??듦퀎
    - 留ㅼ텧 ?뺣낫
    """
    verify_admin(current_user)
    
    try:
        # ?듦퀎 ?곗씠??(?ㅼ젣濡쒕뒗 Supabase?먯꽌 吏묎퀎)
        # 紐⑹뾽 ?곗씠??
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
            revenue_this_month=12500000,  # 1,250留뚯썝
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
                "message": "?듦퀎瑜?遺덈윭?ㅻ뒗???ㅽ뙣?덉뼱??"
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
    ?ъ슜??紐⑸줉 議고쉶
    
    - ?섏씠吏?ㅼ씠??
    - 寃??(?대쫫, ?대찓??
    - ?뚮옖蹂??꾪꽣
    """
    verify_admin(current_user)
    
    try:
        # 紐⑹뾽 ?곗씠??(?ㅼ젣濡쒕뒗 Supabase?먯꽌 議고쉶)
        mock_users = [
            AdminUserInfo(
                id=f"user_{i}",
                email=f"user{i}@example.com",
                name=f"?ъ슜??{i}",
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
        
        # 寃???꾪꽣 (紐⑹뾽)
        if search:
            mock_users = [u for u in mock_users if search.lower() in u.name.lower() or search.lower() in u.email.lower()]
        
        # ?뚮옖 ?꾪꽣
        if plan:
            mock_users = [u for u in mock_users if u.subscription_plan == plan]
        
        # ?섏씠吏?ㅼ씠??
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
                "message": "?ъ슜??紐⑸줉??遺덈윭?ㅻ뒗???ㅽ뙣?덉뼱??"
            }
        }


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    ?ъ슜???곸꽭 ?뺣낫
    """
    verify_admin(current_user)
    
    try:
        # 紐⑹뾽 ?곗씠??
        user = AdminUserInfo(
            id=user_id,
            email="user@example.com",
            name="?띻만??,
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
                "message": "?ъ슜?먮? 李얠쓣 ???놁뼱??"
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
    ?ъ슜???뺣낫 ?섏젙 (??븷, ?뚮옖, ?쒖꽦 ?곹깭)
    """
    verify_admin(current_user)
    
    try:
        # ?ㅼ젣濡쒕뒗 Supabase ?낅뜲?댄듃
        logger.info(f"Updating user {user_id}: {body.model_dump()}")
        
        return {
            "ok": True,
            "data": {
                "message": "?ъ슜???뺣낫媛 ?섏젙?섏뿀?댁슂.",
                "user_id": user_id
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to update user: {e}")
        return {
            "ok": False,
            "error": {
                "code": "UPDATE_ERROR",
                "message": "?ъ슜???뺣낫 ?섏젙???ㅽ뙣?덉뼱??"
            }
        }


@router.get("/ai-usage")
async def get_ai_usage_stats(
    days: int = 7,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    AI ?ъ슜???듦퀎
    
    - 紐⑤뜽蹂??붿껌 ??
    - ?ъ슜?먮퀎 ?됯퇏
    """
    verify_admin(current_user)
    
    try:
        # 紐⑹뾽 ?곗씠??
        usage_stats = [
            AdminAIUsageStats(
                model_id="quick",
                model_name="鍮좊Ⅸ ?쇰컲 鍮꾩꽌 (Gemini)",
                total_requests=5200,
                unique_users=820,
                avg_requests_per_user=6.3,
            ),
            AdminAIUsageStats(
                model_id="allround",
                model_name="留뚮뒫 鍮꾩꽌 (GPT-4o-mini)",
                total_requests=8500,
                unique_users=950,
                avg_requests_per_user=8.9,
            ),
            AdminAIUsageStats(
                model_id="writer",
                model_name="湲?곌린 鍮꾩꽌 (Claude)",
                total_requests=3200,
                unique_users=420,
                avg_requests_per_user=7.6,
            ),
            AdminAIUsageStats(
                model_id="expert",
                model_name="泥숈쿃諛뺤궗 鍮꾩꽌 (GPT-4o)",
                total_requests=2100,
                unique_users=280,
                avg_requests_per_user=7.5,
            ),
            AdminAIUsageStats(
                model_id="genius",
                model_name="泥쒖옱 鍮꾩꽌 (Claude Opus)",
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
                "message": "AI ?ъ슜???듦퀎瑜?遺덈윭?ㅻ뒗???ㅽ뙣?덉뼱??"
            }
        }


@router.post("/announcements")
async def create_announcement(
    body: CreateAnnouncementRequest,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    怨듭??ы빆 ?깅줉
    """
    verify_admin(current_user)
    
    try:
        # ?ㅼ젣濡쒕뒗 Supabase?????
        logger.info(f"Creating announcement: {body.title}")
        
        return {
            "ok": True,
            "data": {
                "message": "怨듭??ы빆???깅줉?섏뿀?댁슂.",
                "id": "announcement_123"
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to create announcement: {e}")
        return {
            "ok": False,
            "error": {
                "code": "CREATE_ERROR",
                "message": "怨듭??ы빆 ?깅줉???ㅽ뙣?덉뼱??"
            }
        }


@router.get("/announcements")
async def get_announcements(
    page: int = 1,
    page_size: int = 10,
    current_user: dict = Depends(get_current_user),
):
    """
    怨듭??ы빆 紐⑸줉
    """
    verify_admin(current_user)
    
    try:
        # 紐⑹뾽 ?곗씠??
        announcements = [
            ContentItem(
                id=f"ann_{i}",
                title=f"怨듭??ы빆 {i}: ?쒕퉬???낅뜲?댄듃 ?덈궡",
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
                "message": "怨듭??ы빆 紐⑸줉??遺덈윭?ㅻ뒗???ㅽ뙣?덉뼱??"
            }
        }
