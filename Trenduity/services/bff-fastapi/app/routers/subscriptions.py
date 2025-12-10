"""
구독 관리 라우터

도우미 관리 (플랜 업그레이드, 구독 관리, AI 사용량 추적) API
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
    """사용량 Redis 키 생성"""
    return f"usage:{user_id}:{model_id}:{date}"


def get_today() -> str:
    """오늘 날짜 문자열"""
    return datetime.utcnow().strftime("%Y-%m-%d")


@router.get("/plans")
async def get_plans():
    """
    사용 가능한 플랜 목록 조회
    
    모든 구독 플랜 정보와 가격, 기능을 반환합니다.
    """
    plans = []
    for plan_type, info in PLAN_INFO.items():
        if plan_type != "addon":  # 추가 도우미는 별도 표시
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
    내 구독 정보 조회
    
    현재 플랜, 사용량, 남은 횟수 등을 반환합니다.
    """
    user_id = current_user["id"]
    today = get_today()
    
    # Supabase에서 구독 정보 조회
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
                
                # 만료 확인
                if expires_at:
                    exp_date = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
                    if exp_date < datetime.utcnow().replace(tzinfo=exp_date.tzinfo):
                        plan_type = PlanType.FREE
                        is_active = False
            
            # 추가 도우미 확인
            addon_result = supabase.table("subscriptions").select("*").eq(
                "user_id", user_id
            ).eq("plan_type", "addon").eq("is_active", True).execute()
            addon_active = len(addon_result.data) > 0 if addon_result.data else False
    except Exception as e:
        logger.warning(f"Supabase query failed: {e}")
    
    # 플랜 정보
    plan_info = PLAN_INFO.get(plan_type.value, PLAN_INFO["free"])
    limits = PLAN_LIMITS.get(plan_type.value, PLAN_LIMITS["free"]).copy()
    
    # 추가 도우미 적용
    if addon_active:
        addon_limits = PLAN_LIMITS["addon"]
        for model_id, addon_count in addon_limits.items():
            limits[model_id] = limits.get(model_id, 0) + addon_count
    
    # Redis에서 오늘 사용량 조회
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
    
    # 특수 기능 활성화 여부
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
    AI 모델 사용 가능 여부 확인
    
    사용 전 호출하여 남은 횟수를 확인합니다.
    """
    user_id = current_user["id"]
    today = get_today()
    
    # 플랜 조회
    plan_type = PlanType.FREE
    addon_active = False
    
    try:
        if supabase:
            result = supabase.table("subscriptions").select("plan_type").eq(
                "user_id", user_id
            ).eq("is_active", True).order("created_at", desc=True).limit(1).execute()
            
            if result.data and len(result.data) > 0:
                plan_type = PlanType(result.data[0].get("plan_type", "free"))
            
            # 추가 도우미 확인
            addon_result = supabase.table("subscriptions").select("id").eq(
                "user_id", user_id
            ).eq("plan_type", "addon").eq("is_active", True).execute()
            addon_active = len(addon_result.data) > 0 if addon_result.data else False
    except Exception as e:
        logger.warning(f"Supabase query failed: {e}")
    
    # 제한 계산
    limits = PLAN_LIMITS.get(plan_type.value, PLAN_LIMITS["free"]).copy()
    if addon_active:
        addon_limits = PLAN_LIMITS["addon"]
        for mid, addon_count in addon_limits.items():
            limits[mid] = limits.get(mid, 0) + addon_count
    
    limit = limits.get(model_id, 0)
    
    # 사용량 조회
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
                "message": f"오늘 {_get_model_name(model_id)} 사용 횟수를 모두 사용했어요. 내일 다시 이용해 주세요.",
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
    AI 모델 사용량 기록
    
    AI 호출 성공 후 사용량을 기록합니다.
    """
    user_id = current_user["id"]
    today = get_today()
    
    if redis:
        try:
            key = get_usage_key(user_id, model_id, today)
            pipe = redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, 86400 * 2)  # 2일 후 만료
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
    플랜 업그레이드
    
    새 플랜으로 업그레이드합니다. (결제 연동 전 테스트용)
    """
    user_id = current_user["id"]
    plan_type = body.plan_type
    
    if not supabase:
        return {
            "ok": False,
            "error": {
                "code": "SERVICE_UNAVAILABLE",
                "message": "서비스가 일시적으로 이용 불가합니다. 잠시 후 다시 시도해 주세요."
            }
        }
    
    try:
        # 기존 구독 비활성화
        supabase.table("subscriptions").update({
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", user_id).eq("is_active", True).neq("plan_type", "addon").execute()
        
        # 새 구독 생성
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
                "message": f"{plan_info['name']}으로 업그레이드되었어요! 🎉",
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
                "message": "업그레이드에 실패했어요. 잠시 후 다시 시도해 주세요."
            }
        }


@router.post("/purchase-addon")
async def purchase_addon(
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    추가 도우미 구매
    
    현재 플랜에 추가 사용량을 더합니다.
    """
    user_id = current_user["id"]
    
    if not supabase:
        return {
            "ok": False,
            "error": {
                "code": "SERVICE_UNAVAILABLE",
                "message": "서비스가 일시적으로 이용 불가합니다."
            }
        }
    
    try:
        # 기존 추가 도우미 비활성화
        supabase.table("subscriptions").update({
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", user_id).eq("plan_type", "addon").eq("is_active", True).execute()
        
        # 새 추가 도우미 생성
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
                "message": "추가 도우미가 활성화되었어요! 🎉",
                "expires_at": expires_at.isoformat(),
            }
        }
    except Exception as e:
        logger.error(f"Addon purchase failed: {e}")
        return {
            "ok": False,
            "error": {
                "code": "PURCHASE_FAILED",
                "message": "구매에 실패했어요. 잠시 후 다시 시도해 주세요."
            }
        }


def _get_model_name(model_id: str) -> str:
    """모델 ID를 한글 이름으로 변환"""
    names = {
        "quick": "빠른 일반 비서",
        "allround": "만능 비서",
        "writer": "글쓰기 비서",
        "expert": "척척박사 비서",
        "genius": "천재 비서",
    }
    return names.get(model_id, model_id)
