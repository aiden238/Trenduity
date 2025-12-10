"""
援щ룆 愿由??쇱슦??

?꾩슦誘?愿由?(?뚮옖 ?낃렇?덉씠?? 援щ룆 愿由? AI ?ъ슜??異붿쟻) API
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
    """?ъ슜??Redis ???앹꽦"""
    return f"usage:{user_id}:{model_id}:{date}"


def get_today() -> str:
    """?ㅻ뒛 ?좎쭨 臾몄옄??""
    return datetime.utcnow().strftime("%Y-%m-%d")


@router.get("/plans")
async def get_plans():
    """
    ?ъ슜 媛?ν븳 ?뚮옖 紐⑸줉 議고쉶
    
    紐⑤뱺 援щ룆 ?뚮옖 ?뺣낫? 媛寃? 湲곕뒫??諛섑솚?⑸땲??
    """
    plans = []
    for plan_type, info in PLAN_INFO.items():
        if plan_type != "addon":  # 異붽? ?꾩슦誘몃뒗 蹂꾨룄 ?쒖떆
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
    ??援щ룆 ?뺣낫 議고쉶
    
    ?꾩옱 ?뚮옖, ?ъ슜?? ?⑥? ?잛닔 ?깆쓣 諛섑솚?⑸땲??
    """
    user_id = current_user["id"]
    today = get_today()
    
    # Supabase?먯꽌 援щ룆 ?뺣낫 議고쉶
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
                
                # 留뚮즺 ?뺤씤
                if expires_at:
                    exp_date = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
                    if exp_date < datetime.utcnow().replace(tzinfo=exp_date.tzinfo):
                        plan_type = PlanType.FREE
                        is_active = False
            
            # 異붽? ?꾩슦誘??뺤씤
            addon_result = supabase.table("subscriptions").select("*").eq(
                "user_id", user_id
            ).eq("plan_type", "addon").eq("is_active", True).execute()
            addon_active = len(addon_result.data) > 0 if addon_result.data else False
    except Exception as e:
        logger.warning(f"Supabase query failed: {e}")
    
    # ?뚮옖 ?뺣낫
    plan_info = PLAN_INFO.get(plan_type.value, PLAN_INFO["free"])
    limits = PLAN_LIMITS.get(plan_type.value, PLAN_LIMITS["free"]).copy()
    
    # 異붽? ?꾩슦誘??곸슜
    if addon_active:
        addon_limits = PLAN_LIMITS["addon"]
        for model_id, addon_count in addon_limits.items():
            limits[model_id] = limits.get(model_id, 0) + addon_count
    
    # Redis?먯꽌 ?ㅻ뒛 ?ъ슜??議고쉶
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
    
    # ?뱀닔 湲곕뒫 ?쒖꽦???щ?
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
    AI 紐⑤뜽 ?ъ슜 媛???щ? ?뺤씤
    
    ?ъ슜 ???몄텧?섏뿬 ?⑥? ?잛닔瑜??뺤씤?⑸땲??
    """
    user_id = current_user["id"]
    today = get_today()
    
    # ?뚮옖 議고쉶
    plan_type = PlanType.FREE
    addon_active = False
    
    try:
        if supabase:
            result = supabase.table("subscriptions").select("plan_type").eq(
                "user_id", user_id
            ).eq("is_active", True).order("created_at", desc=True).limit(1).execute()
            
            if result.data and len(result.data) > 0:
                plan_type = PlanType(result.data[0].get("plan_type", "free"))
            
            # 異붽? ?꾩슦誘??뺤씤
            addon_result = supabase.table("subscriptions").select("id").eq(
                "user_id", user_id
            ).eq("plan_type", "addon").eq("is_active", True).execute()
            addon_active = len(addon_result.data) > 0 if addon_result.data else False
    except Exception as e:
        logger.warning(f"Supabase query failed: {e}")
    
    # ?쒗븳 怨꾩궛
    limits = PLAN_LIMITS.get(plan_type.value, PLAN_LIMITS["free"]).copy()
    if addon_active:
        addon_limits = PLAN_LIMITS["addon"]
        for mid, addon_count in addon_limits.items():
            limits[mid] = limits.get(mid, 0) + addon_count
    
    limit = limits.get(model_id, 0)
    
    # ?ъ슜??議고쉶
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
                "message": f"?ㅻ뒛 {_get_model_name(model_id)} ?ъ슜 ?잛닔瑜?紐⑤몢 ?ъ슜?덉뼱?? ?댁씪 ?ㅼ떆 ?댁슜??二쇱꽭??",
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
    AI 紐⑤뜽 ?ъ슜??湲곕줉
    
    AI ?몄텧 ?깃났 ???ъ슜?됱쓣 湲곕줉?⑸땲??
    """
    user_id = current_user["id"]
    today = get_today()
    
    if redis:
        try:
            key = get_usage_key(user_id, model_id, today)
            pipe = redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, 86400 * 2)  # 2????留뚮즺
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
    ?뚮옖 ?낃렇?덉씠??
    
    ???뚮옖?쇰줈 ?낃렇?덉씠?쒗빀?덈떎. (寃곗젣 ?곕룞 ???뚯뒪?몄슜)
    """
    user_id = current_user["id"]
    plan_type = body.plan_type
    
    if not supabase:
        return {
            "ok": False,
            "error": {
                "code": "SERVICE_UNAVAILABLE",
                "message": "?쒕퉬?ㅺ? ?쇱떆?곸쑝濡??댁슜 遺덇??⑸땲?? ?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??"
            }
        }
    
    try:
        # 湲곗〈 援щ룆 鍮꾪솢?깊솕
        supabase.table("subscriptions").update({
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", user_id).eq("is_active", True).neq("plan_type", "addon").execute()
        
        # ??援щ룆 ?앹꽦
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
                "message": f"{plan_info['name']}?쇰줈 ?낃렇?덉씠?쒕릺?덉뼱?? ?럦",
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
                "message": "?낃렇?덉씠?쒖뿉 ?ㅽ뙣?덉뼱?? ?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??"
            }
        }


@router.post("/purchase-addon")
async def purchase_addon(
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    異붽? ?꾩슦誘?援щℓ
    
    ?꾩옱 ?뚮옖??異붽? ?ъ슜?됱쓣 ?뷀빀?덈떎.
    """
    user_id = current_user["id"]
    
    if not supabase:
        return {
            "ok": False,
            "error": {
                "code": "SERVICE_UNAVAILABLE",
                "message": "?쒕퉬?ㅺ? ?쇱떆?곸쑝濡??댁슜 遺덇??⑸땲??"
            }
        }
    
    try:
        # 湲곗〈 異붽? ?꾩슦誘?鍮꾪솢?깊솕
        supabase.table("subscriptions").update({
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", user_id).eq("plan_type", "addon").eq("is_active", True).execute()
        
        # ??異붽? ?꾩슦誘??앹꽦
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
                "message": "異붽? ?꾩슦誘멸? ?쒖꽦?붾릺?덉뼱?? ?럦",
                "expires_at": expires_at.isoformat(),
            }
        }
    except Exception as e:
        logger.error(f"Addon purchase failed: {e}")
        return {
            "ok": False,
            "error": {
                "code": "PURCHASE_FAILED",
                "message": "援щℓ???ㅽ뙣?덉뼱?? ?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??"
            }
        }


def _get_model_name(model_id: str) -> str:
    """紐⑤뜽 ID瑜??쒓? ?대쫫?쇰줈 蹂??""
    names = {
        "quick": "鍮좊Ⅸ ?쇰컲 鍮꾩꽌",
        "allround": "留뚮뒫 鍮꾩꽌",
        "writer": "湲?곌린 鍮꾩꽌",
        "expert": "泥숈쿃諛뺤궗 鍮꾩꽌",
        "genius": "泥쒖옱 鍮꾩꽌",
    }
    return names.get(model_id, model_id)
