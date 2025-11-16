from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from datetime import date, timedelta

from app.core.deps import get_current_user, get_supabase, get_gamification_service
from app.services.gamification import GamificationService

router = APIRouter()


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
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
    gamification: GamificationService = Depends(get_gamification_service),
):
    """
    오늘 복약 체크

    - 중복 체크 방지 (같은 날 1회만)
    - 게임화 포인트 부여 (+2점)
    - UNIQUE 제약으로 중복 방지
    """
    try:
        user_id = current_user["id"]
        today = date.today().isoformat()

        # 중복 체크 방지
        try:
            existing = (
                supabase.table("med_checks")
                .select("id")
                .eq("user_id", user_id)
                .eq("date", today)
                .execute()
            )

            if existing.data:
                return {
                    "ok": True,
                    "data": MedCheckResponse(
                        checked=True,
                        message="오늘은 이미 체크했어요.",
                    ).model_dump(),
                }
        except Exception:
            # 테이블이 없으면 계속
            pass

        # 체크 기록
        try:
            supabase.table("med_checks").insert(
                {
                    "user_id": user_id,
                    "date": today,
                }
            ).execute()
        except Exception:
            # 테이블이 없으면 무시
            pass

        # 게임화 포인트
        try:
            points_result = await gamification.award_for_med_check(user_id, today)
        except Exception:
            points_result = {"points_added": 0, "total_points": 0}

        # Envelope 응답
        return {
            "ok": True,
            "data": MedCheckResponse(
                checked=True,
                message="잘하셨어요! 내일도 잊지 마세요.",
                **points_result,
            ).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "MED_CHECK_FAILED",
                "message": f"복약 체크에 실패했어요: {str(e)}",
            },
        }


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
