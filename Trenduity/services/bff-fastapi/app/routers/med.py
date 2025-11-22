from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date, datetime, timedelta
import logging

from app.core.deps import get_current_user, get_supabase, get_gamification_service
from app.services.gamification import GamificationService
from app.utils.error_translator import translate_db_error, is_db_error

router = APIRouter()
logger = logging.getLogger(__name__)


class MedCheckRequest(BaseModel):
    """복약 체크 요청"""
    time_slot: Optional[Literal["morning", "afternoon", "evening"]] = Field(
        None, 
        description="복약 시간대: morning(아침), afternoon(점심), evening(저녁)"
    )
    medication_name: Optional[str] = Field(None, max_length=100, description="약 이름 (선택적)")


class MedCheckResponse(BaseModel):
    """복약 체크 응답"""

    checked: bool
    message: str = ""
    points_added: int = 0
    total_points: int = 0


class DayStatus(BaseModel):
    """날짜별 체크 상태"""

    date: str
    checked: bool


class MedStatusResponse(BaseModel):
    """복약 상태 응답"""

    last_7_days: List[DayStatus]
    total_this_month: int


@router.post("/check")
async def check_med(
    body: MedCheckRequest,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
    gamification: GamificationService = Depends(get_gamification_service),
):
    """
    오늘 복약 체크

    - 중복 체크 방지 (같은 날 + 같은 시간대 1회만)
    - 시간대: morning(아침), afternoon(점심), evening(저녁)
    - 게임화 포인트 부여 (+2점)
    - UNIQUE 제약으로 중복 방지
    """
    try:
        user_id = current_user["id"]
        today = date.today().isoformat()
        time_slot = body.time_slot or "morning"  # 기본값: 아침
        checked_at = datetime.now().isoformat()

        # 중복 체크 방지 (같은 날 + 같은 시간대)
        try:
            existing = (
                supabase.table("med_checks")
                .select("id, time_slot")
                .eq("user_id", user_id)
                .eq("date", today)
                .eq("time_slot", time_slot)
                .execute()
            )

            if existing.data:
                time_label = {"morning": "아침", "afternoon": "점심", "evening": "저녁"}[time_slot]
                return {
                    "ok": True,
                    "data": MedCheckResponse(
                        checked=True,
                        message=f"오늘 {time_label} 약은 이미 드셨어요.",
                    ).model_dump(),
                }
        except Exception as e:
            logger.warning(f"중복 체크 확인 실패: {e}")

        # 체크 기록
        insert_data = {
            "user_id": user_id,
            "date": today,
            "time_slot": time_slot,
            "checked_at": checked_at,
        }
        
        if body.medication_name:
            insert_data["medication_name"] = body.medication_name
        
        try:
            supabase.table("med_checks").insert(insert_data).execute()
            logger.info(f"복약 체크 기록: user={user_id}, date={today}, time_slot={time_slot}")
        except Exception as e:
            logger.error(f"복약 체크 기록 실패: {e}")
            
            # DB 에러인 경우 한국어 번역 적용
            if is_db_error(e):
                error_info = translate_db_error(e)
                raise HTTPException(
                    status_code=500,
                    detail={"ok": False, "error": error_info}
                )
            raise

        # 게임화 포인트
        try:
            points_result = await gamification.award_for_med_check(user_id, today)
        except Exception as e:
            logger.error(f"게임화 포인트 부여 실패: {e}")
            points_result = {"points_added": 0, "total_points": 0}

        time_label = {"morning": "아침", "afternoon": "점심", "evening": "저녁"}[time_slot]
        
        # Envelope 응답
        return {
            "ok": True,
            "data": MedCheckResponse(
                checked=True,
                message=f"{time_label} 약 잘 드셨어요! 내일도 잊지 마세요.",
                **points_result,
            ).model_dump(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"복약 체크 실패: {e}", exc_info=True)
        
        # DB 에러인 경우 한국어 번역 적용
        if is_db_error(e):
            error_info = translate_db_error(e)
            raise HTTPException(
                status_code=500,
                detail={"ok": False, "error": error_info}
            )
        
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "MED_CHECK_ERROR",
                    "message": "복약 체크에 문제가 생겻어요. 잠시 후 다시 시도해 주세요."
                }
            }
        )


@router.get("/history")
async def get_med_history(
    days: int = 30,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    복약 체크 히스토리 조회
    
    Args:
        days: 조회 기간 (기본 30일)
    
    Returns:
        {
            "ok": true,
            "data": {
                "checks": [
                    {
                        "date": "2025-11-20",
                        "time_slot": "morning",
                        "medication_name": "혈압약",
                        "checked_at": "2025-11-20T08:30:00"
                    }
                ],
                "total": 28
            }
        }
    """
    try:
        user_id = current_user["id"]
        start_date = (date.today() - timedelta(days=days)).isoformat()
        
        try:
            result = (
                supabase.table("med_checks")
                .select("date, time_slot, medication_name, checked_at", count="exact")
                .eq("user_id", user_id)
                .gte("date", start_date)
                .order("date", desc=True)
                .order("checked_at", desc=True)
                .execute()
            )
            
            return {
                "ok": True,
                "data": {
                    "checks": result.data or [],
                    "total": result.count or 0
                }
            }
        except Exception as e:
            logger.error(f"복약 히스토리 조회 실패: {e}")
            
            # DB 에러인 경우 한국어 번역 적용
            if is_db_error(e):
                error_info = translate_db_error(e)
                raise HTTPException(
                    status_code=500,
                    detail={"ok": False, "error": error_info}
                )
            
            raise HTTPException(
                status_code=500,
                detail={
                    "ok": False,
                    "error": {
                        "code": "MED_HISTORY_ERROR",
                        "message": "복약 기록을 불러오는데 문제가 생겻어요. 새로고침 해보세요."
                    }
                }
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"복약 히스토리 조회 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "MED_HISTORY_ERROR",
                    "message": "복약 기록을 불러오는데 문제가 생겻어요."
                }
            }
        )


@router.get("/status")
async def get_med_status(
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    복약 체크 현황

    - 최근 7일 체크 상태
    - 이번 달 총 체크 수
    """
    try:
        user_id = current_user["id"]
        today = date.today()

        # 최근 7일
        last_7_days = [(today - timedelta(days=i)).isoformat() for i in range(7)]

        try:
            checks = (
                supabase.table("med_checks")
                .select("date")
                .eq("user_id", user_id)
                .in_("date", last_7_days)
                .execute()
            )
            checked_dates = {row["date"] for row in checks.data}
        except Exception:
            checked_dates = set()

        status = [
            DayStatus(date=d, checked=d in checked_dates) for d in last_7_days
        ]

        # 이번 달 총 체크 수
        this_month = today.strftime("%Y-%m")
        try:
            month_checks = (
                supabase.table("med_checks")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .gte("date", f"{this_month}-01")
                .execute()
            )
            total_this_month = month_checks.count or 0
        except Exception:
            total_this_month = 0

        # Envelope 응답
        return {
            "ok": True,
            "data": MedStatusResponse(
                last_7_days=status,
                total_this_month=total_this_month,
            ).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "MED_STATUS_FETCH_FAILED",
                "message": f"복약 상태를 불러올 수 없어요: {str(e)}",
            },
        }
