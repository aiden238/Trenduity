"""
êµ¬ë… ê´€ë¦??¼ìš°??

?„ìš°ë¯?ê´€ë¦?(?Œëœ ?…ê·¸?ˆì´?? êµ¬ë… ê´€ë¦? AI ?¬ìš©??ì¶”ì ) API
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from redis import Redis
import logging
import json

from app.core.deps import get_current_user, get_redis_client, get_supabase
from app.schemas.subscription import (
    PlanType,
    AIModelType,
    PLAN_LIMITS,
    PLAN_INFO,
    SubscriptionCreate,
    SubscriptionUpdate,
    UserSubscriptionInfo,
    UsageSummary,
    PlanListItem,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def get_usage_key(user_id: str, model_id: str, date: str) -> str:
    """?¬ìš©??Redis ???ì„±"""
    return f"usage:{user_id}:{model_id}:{date}"


def get_today() -> str:
    """?¤ëŠ˜ ? ì§œ ë¬¸ì??""
    return datetime.utcnow().strftime("%Y-%m-%d")


@router.get("/plans")
async def get_plans():
    """
    ?¬ìš© ê°€?¥í•œ ?Œëœ ëª©ë¡ ì¡°íšŒ
    
    ëª¨ë“  êµ¬ë… ?Œëœ ?•ë³´?€ ê°€ê²? ê¸°ëŠ¥??ë°˜í™˜?©ë‹ˆ??
    """
    plans = []
    for plan_type, info in PLAN_INFO.items():
        if plan_type != "addon":  # ì¶”ê? ?„ìš°ë¯¸ëŠ” ë³„ë„ ?œì‹œ
            plans.append(PlanListItem(
                plan_type=PlanType(plan_type),
                name=info["name"],
                price=info["price"],
                description=info["description"],
                features=info["features"],
                limits=PLAN_LIMITS[plan_type],
            ))
    
    return {
        "ok": True,
        "data": {
            "plans": [p.model_dump() for p in plans],
            "addon": {
                **PLAN_INFO["addon"],
                "plan_type": "addon",
                "limits": PLAN_LIMITS["addon"],
            }
        }
    }


@router.get("/me")
async def get_my_subscription(
    current_user: dict = Depends(get_current_user),
    redis: Optional[Redis] = Depends(get_redis_client),
    supabase = Depends(get_supabase)
):
    """
    ??êµ¬ë… ?•ë³´ ì¡°íšŒ
    
    ?„ì¬ ?Œëœ, ?¬ìš©?? ?¨ì? ?Ÿìˆ˜ ?±ì„ ë°˜í™˜?©ë‹ˆ??
    """
    user_id = current_user["id"]
    today = get_today()
    
    # Supabase?ì„œ êµ¬ë… ?•ë³´ ì¡°íšŒ
    plan_type = PlanType.FREE
    is_active = True
    expires_at = None
    addon_active = False
    
    try:
        if supabase:
            result = supabase.table("subscriptions").select("*").eq(
                "user_id", user_id
            ).eq("is_active", True).order("created_at", desc=True).limit(1).execute()
            
            if result.data and len(result.data) > 0:
                sub = result.data[0]
                plan_type = PlanType(sub.get("plan_type", "free"))
                is_active = sub.get("is_active", True)
                expires_at = sub.get("expires_at")
                
                # ë§Œë£Œ ?•ì¸
                if expires_at:
                    exp_date = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
                    if exp_date < datetime.utcnow().replace(tzinfo=exp_date.tzinfo):
                        plan_type = PlanType.FREE
                        is_active = False
            
            # ì¶”ê? ?„ìš°ë¯??•ì¸
            addon_result = supabase.table("subscriptions").select("*").eq(
                "user_id", user_id
            ).eq("plan_type", "addon").eq("is_active", True).execute()
            addon_active = len(addon_result.data) > 0 if addon_result.data else False
    except Exception as e:
        logger.warning(f"Supabase query failed: {e}")
    
    # ?Œëœ ?•ë³´
    plan_info = PLAN_INFO.get(plan_type.value, PLAN_INFO["free"])
    limits = PLAN_LIMITS.get(plan_type.value, PLAN_LIMITS["free"]).copy()
    
    # ì¶”ê? ?„ìš°ë¯??ìš©
    if addon_active:
        addon_limits = PLAN_LIMITS["addon"]
        for model_id, addon_count in addon_limits.items():
            limits[model_id] = limits.get(model_id, 0) + addon_count
    
    # Redis?ì„œ ?¤ëŠ˜ ?¬ìš©??ì¡°íšŒ
    usage: Dict[str, UsageSummary] = {}
    for model_id in ["quick", "allround", "writer", "expert", "genius"]:
        used_count = 0
        if redis:
            try:
                key = get_usage_key(user_id, model_id, today)
                count = redis.get(key)
                used_count = int(count) if count else 0
            except Exception as e:
                logger.warning(f"Redis usage query failed: {e}")
        
        limit = limits.get(model_id, 0)
        usage[model_id] = UsageSummary(
            model_id=model_id,
            used_count=used_count,
            limit=limit,
            remaining=max(0, limit - used_count),
        )
    
    # ?¹ìˆ˜ ê¸°ëŠ¥ ?œì„±???¬ë?
    can_use_fintech = plan_type in [PlanType.STANDARD, PlanType.PREMIUM]
    can_use_coaching = plan_type in [PlanType.STANDARD, PlanType.PREMIUM]
    
    return {
        "ok": True,
        "data": UserSubscriptionInfo(
            plan_type=plan_type,
            plan_name=plan_info["name"],
            plan_price=plan_info["price"],
            plan_features=plan_info["features"],
            is_active=is_active,
            expires_at=expires_at,
            usage={k: v.model_dump() for k, v in usage.items()},
            can_use_fintech=can_use_fintech,
            can_use_coaching=can_use_coaching,
        ).model_dump()
    }


@router.post("/check-usage")
async def check_usage(
    model_id: str,
    current_user: dict = Depends(get_current_user),
    redis: Optional[Redis] = Depends(get_redis_client),
    supabase = Depends(get_supabase)
):
    """
    AI ëª¨ë¸ ?¬ìš© ê°€???¬ë? ?•ì¸
    
    ?¬ìš© ???¸ì¶œ?˜ì—¬ ?¨ì? ?Ÿìˆ˜ë¥??•ì¸?©ë‹ˆ??
    """
    user_id = current_user["id"]
    today = get_today()
    
    # ?Œëœ ì¡°íšŒ
    plan_type = PlanType.FREE
    addon_active = False
    
    try:
        if supabase:
            result = supabase.table("subscriptions").select("plan_type").eq(
                "user_id", user_id
            ).eq("is_active", True).order("created_at", desc=True).limit(1).execute()
            
            if result.data and len(result.data) > 0:
                plan_type = PlanType(result.data[0].get("plan_type", "free"))
            
            # ì¶”ê? ?„ìš°ë¯??•ì¸
            addon_result = supabase.table("subscriptions").select("id").eq(
                "user_id", user_id
            ).eq("plan_type", "addon").eq("is_active", True).execute()
            addon_active = len(addon_result.data) > 0 if addon_result.data else False
    except Exception as e:
        logger.warning(f"Supabase query failed: {e}")
    
    # ?œí•œ ê³„ì‚°
    limits = PLAN_LIMITS.get(plan_type.value, PLAN_LIMITS["free"]).copy()
    if addon_active:
        addon_limits = PLAN_LIMITS["addon"]
        for mid, addon_count in addon_limits.items():
            limits[mid] = limits.get(mid, 0) + addon_count
    
    limit = limits.get(model_id, 0)
    
    # ?¬ìš©??ì¡°íšŒ
    used_count = 0
    if redis:
        try:
            key = get_usage_key(user_id, model_id, today)
            count = redis.get(key)
            used_count = int(count) if count else 0
        except Exception as e:
            logger.warning(f"Redis query failed: {e}")
    
    can_use = used_count < limit
    remaining = max(0, limit - used_count)
    
    if not can_use:
        return {
            "ok": False,
            "error": {
                "code": "USAGE_LIMIT_EXCEEDED",
                "message": f"?¤ëŠ˜ {_get_model_name(model_id)} ?¬ìš© ?Ÿìˆ˜ë¥?ëª¨ë‘ ?¬ìš©?ˆì–´?? ?´ì¼ ?¤ì‹œ ?´ìš©??ì£¼ì„¸??",
                "remaining": 0,
                "limit": limit,
            }
        }
    
    return {
        "ok": True,
        "data": {
            "can_use": True,
            "remaining": remaining,
            "limit": limit,
        }
    }


@router.post("/record-usage")
async def record_usage(
    model_id: str,
    current_user: dict = Depends(get_current_user),
    redis: Optional[Redis] = Depends(get_redis_client)
):
    """
    AI ëª¨ë¸ ?¬ìš©??ê¸°ë¡
    
    AI ?¸ì¶œ ?±ê³µ ???¬ìš©?‰ì„ ê¸°ë¡?©ë‹ˆ??
    """
    user_id = current_user["id"]
    today = get_today()
    
    if redis:
        try:
            key = get_usage_key(user_id, model_id, today)
            pipe = redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, 86400 * 2)  # 2????ë§Œë£Œ
            result = pipe.execute()
            new_count = result[0]
            
            return {
                "ok": True,
                "data": {
                    "model_id": model_id,
                    "used_count": new_count,
                }
            }
        except Exception as e:
            logger.error(f"Redis usage record failed: {e}")
    
    return {
        "ok": True,
        "data": {
            "model_id": model_id,
            "used_count": 1,
        }
    }


@router.post("/upgrade")
async def upgrade_plan(
    body: SubscriptionCreate,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    ?Œëœ ?…ê·¸?ˆì´??
    
    ???Œëœ?¼ë¡œ ?…ê·¸?ˆì´?œí•©?ˆë‹¤. (ê²°ì œ ?°ë™ ???ŒìŠ¤?¸ìš©)
    """
    user_id = current_user["id"]
    plan_type = body.plan_type
    
    if not supabase:
        return {
            "ok": False,
            "error": {
                "code": "SERVICE_UNAVAILABLE",
                "message": "?œë¹„?¤ê? ?¼ì‹œ?ìœ¼ë¡??´ìš© ë¶ˆê??©ë‹ˆ?? ? ì‹œ ???¤ì‹œ ?œë„??ì£¼ì„¸??"
            }
        }
    
    try:
        # ê¸°ì¡´ êµ¬ë… ë¹„í™œ?±í™”
        supabase.table("subscriptions").update({
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", user_id).eq("is_active", True).neq("plan_type", "addon").execute()
        
        # ??êµ¬ë… ?ì„±
        expires_at = datetime.utcnow() + timedelta(days=30)
        result = supabase.table("subscriptions").insert({
            "user_id": user_id,
            "plan_type": plan_type.value,
            "is_active": True,
            "starts_at": datetime.utcnow().isoformat(),
            "expires_at": expires_at.isoformat(),
        }).execute()
        
        plan_info = PLAN_INFO.get(plan_type.value, PLAN_INFO["free"])
        
        return {
            "ok": True,
            "data": {
                "message": f"{plan_info['name']}?¼ë¡œ ?…ê·¸?ˆì´?œë˜?ˆì–´?? ?‰",
                "plan_type": plan_type.value,
                "plan_name": plan_info["name"],
                "expires_at": expires_at.isoformat(),
            }
        }
    except Exception as e:
        logger.error(f"Plan upgrade failed: {e}")
        return {
            "ok": False,
            "error": {
                "code": "UPGRADE_FAILED",
                "message": "?…ê·¸?ˆì´?œì— ?¤íŒ¨?ˆì–´?? ? ì‹œ ???¤ì‹œ ?œë„??ì£¼ì„¸??"
            }
        }


@router.post("/purchase-addon")
async def purchase_addon(
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    ì¶”ê? ?„ìš°ë¯?êµ¬ë§¤
    
    ?„ì¬ ?Œëœ??ì¶”ê? ?¬ìš©?‰ì„ ?”í•©?ˆë‹¤.
    """
    user_id = current_user["id"]
    
    if not supabase:
        return {
            "ok": False,
            "error": {
                "code": "SERVICE_UNAVAILABLE",
                "message": "?œë¹„?¤ê? ?¼ì‹œ?ìœ¼ë¡??´ìš© ë¶ˆê??©ë‹ˆ??"
            }
        }
    
    try:
        # ê¸°ì¡´ ì¶”ê? ?„ìš°ë¯?ë¹„í™œ?±í™”
        supabase.table("subscriptions").update({
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", user_id).eq("plan_type", "addon").eq("is_active", True).execute()
        
        # ??ì¶”ê? ?„ìš°ë¯??ì„±
        expires_at = datetime.utcnow() + timedelta(days=30)
        result = supabase.table("subscriptions").insert({
            "user_id": user_id,
            "plan_type": "addon",
            "is_active": True,
            "starts_at": datetime.utcnow().isoformat(),
            "expires_at": expires_at.isoformat(),
        }).execute()
        
        return {
            "ok": True,
            "data": {
                "message": "ì¶”ê? ?„ìš°ë¯¸ê? ?œì„±?”ë˜?ˆì–´?? ?‰",
                "expires_at": expires_at.isoformat(),
            }
        }
    except Exception as e:
        logger.error(f"Addon purchase failed: {e}")
        return {
            "ok": False,
            "error": {
                "code": "PURCHASE_FAILED",
                "message": "êµ¬ë§¤???¤íŒ¨?ˆì–´?? ? ì‹œ ???¤ì‹œ ?œë„??ì£¼ì„¸??"
            }
        }


def _get_model_name(model_id: str) -> str:
    """ëª¨ë¸ IDë¥??œê? ?´ë¦„?¼ë¡œ ë³€??""
    names = {
        "quick": "ë¹ ë¥¸ ?¼ë°˜ ë¹„ì„œ",
        "allround": "ë§ŒëŠ¥ ë¹„ì„œ",
        "writer": "ê¸€?°ê¸° ë¹„ì„œ",
        "expert": "ì²™ì²™ë°•ì‚¬ ë¹„ì„œ",
        "genius": "ì²œì¬ ë¹„ì„œ",
    }
    return names.get(model_id, model_id)
