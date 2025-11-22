from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import logging

from app.core.deps import get_current_user, get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)


class UsageStats(BaseModel):
    """사용량 통계"""

    month: str  # YYYY-MM
    cards_completed: int
    insights_viewed: int
    med_checks_done: int
    total_points: int
    updated_at: str


class UsageStatsResponse(BaseModel):
    """사용량 통계 응답"""

    data: UsageStats


@router.get("/stats")
async def get_usage_stats(
    user_id: str,  # Query parameter
    month: Optional[str] = None,  # YYYY-MM 형식, 없으면 이번 달
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    사용량 통계 조회 (보호자만 조회 가능)

    Query Parameters:
        - user_id: 조회할 사용자 ID (필수)
        - month: 조회할 월 (YYYY-MM 형식, 선택사항)

    Returns:
        {
          "ok": true,
          "data": {
            "month": "2025-11",
            "cards_completed": 20,
            "insights_viewed": 15,
            "med_checks_done": 18,
            "total_points": 250,
            "updated_at": "2025-11-20T..."
          }
        }
    """
    try:
        guardian_id = current_user["id"]

        # 1. 권한 확인 (가족 링크 존재 여부)
        try:
            link = (
                supabase.table("family_links")
                .select("perms")
                .eq("guardian_id", guardian_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )

            if not link.data:
                raise HTTPException(
                    status_code=403,
                    detail={
                        "ok": False,
                        "error": {
                            "code": "NO_PERMISSION",
                            "message": "이 회원의 정보를 볼 권한이 없어요.",
                        },
                    },
                )

            # perms.read 권한 확인
            if not link.data.get("perms", {}).get("read", False):
                raise HTTPException(
                    status_code=403,
                    detail={
                        "ok": False,
                        "error": {
                            "code": "NO_READ_PERMISSION",
                            "message": "읽기 권한이 없어요.",
                        },
                    },
                )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Family link check failed: {e}", extra={"guardian_id": guardian_id, "user_id": user_id})
            raise HTTPException(
                status_code=404,
                detail={
                    "ok": False,
                    "error": {
                        "code": "FAMILY_LINK_NOT_FOUND",
                        "message": "가족 연동 정보를 찾을 수 없어요.",
                    },
                },
            )

        # 2. 월 기본값 설정 (없으면 이번 달)
        if not month:
            month = datetime.now().strftime("%Y-%m")

        # 3. 통계 조회
        try:
            stats_result = (
                supabase.table("usage_counters")
                .select("*")
                .eq("user_id", user_id)
                .eq("month", month)
                .single()
                .execute()
            )

            if stats_result.data:
                # 데이터가 있으면 반환
                return {
                    "ok": True,
                    "data": UsageStats(
                        month=stats_result.data.get("month", month),
                        cards_completed=stats_result.data.get("cards_completed", 0),
                        insights_viewed=stats_result.data.get("insights_viewed", 0),
                        med_checks_done=stats_result.data.get("med_checks_done", 0),
                        total_points=stats_result.data.get("total_points", 0),
                        updated_at=stats_result.data.get("updated_at", datetime.now().isoformat()),
                    ).model_dump(),
                }
            else:
                # 데이터 없으면 0으로 초기화
                return {
                    "ok": True,
                    "data": UsageStats(
                        month=month,
                        cards_completed=0,
                        insights_viewed=0,
                        med_checks_done=0,
                        total_points=0,
                        updated_at=datetime.now().isoformat(),
                    ).model_dump(),
                }

        except Exception as e:
            logger.warning(
                f"Usage stats not found for user {user_id}, month {month}: {e}",
                extra={"user_id": user_id, "month": month},
            )
            # 테이블이 없거나 데이터가 없으면 0으로 반환
            return {
                "ok": True,
                "data": UsageStats(
                    month=month,
                    cards_completed=0,
                    insights_viewed=0,
                    med_checks_done=0,
                    total_points=0,
                    updated_at=datetime.now().isoformat(),
                ).model_dump(),
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Usage stats fetch failed: {e}", extra={"user_id": user_id, "month": month})
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "USAGE_STATS_FETCH_FAILED",
                    "message": "사용량 통계를 불러오는데 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
                },
            },
        )


class MonthlyHistory(BaseModel):
    """월별 히스토리"""

    months: list[UsageStats]


@router.get("/history")
async def get_usage_history(
    user_id: str,  # Query parameter
    months: int = 6,  # 최근 N개월
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    월별 사용량 히스토리 조회 (최근 N개월)

    Query Parameters:
        - user_id: 조회할 사용자 ID (필수)
        - months: 조회할 개월 수 (기본값: 6, 최대: 12)

    Returns:
        {
          "ok": true,
          "data": {
            "months": [
              {"month": "2025-11", "cards_completed": 20, ...},
              {"month": "2025-10", "cards_completed": 18, ...},
              ...
            ]
          }
        }
    """
    try:
        guardian_id = current_user["id"]

        # 개월 수 제한
        if months > 12:
            months = 12
        if months < 1:
            months = 1

        # 1. 권한 확인
        try:
            link = (
                supabase.table("family_links")
                .select("perms")
                .eq("guardian_id", guardian_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )

            if not link.data or not link.data.get("perms", {}).get("read", False):
                raise HTTPException(
                    status_code=403,
                    detail={
                        "ok": False,
                        "error": {
                            "code": "NO_PERMISSION",
                            "message": "이 회원의 정보를 볼 권한이 없어요.",
                        },
                    },
                )

        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=404,
                detail={
                    "ok": False,
                    "error": {
                        "code": "FAMILY_LINK_NOT_FOUND",
                        "message": "가족 연동 정보를 찾을 수 없어요.",
                    },
                },
            )

        # 2. 최근 N개월 계산
        from datetime import datetime, timedelta

        current_month = datetime.now()
        month_list = []
        for i in range(months):
            # N개월 전 계산 (간단한 방법: 월만 조정)
            year = current_month.year
            month = current_month.month - i
            while month <= 0:
                month += 12
                year -= 1
            month_list.append(f"{year:04d}-{month:02d}")

        # 3. 모든 월의 통계 조회 (한 번에)
        try:
            stats_result = (
                supabase.table("usage_counters")
                .select("*")
                .eq("user_id", user_id)
                .in_("month", month_list)
                .order("month", desc=True)
                .execute()
            )

            stats_dict = {row["month"]: row for row in stats_result.data or []}

        except Exception:
            stats_dict = {}

        # 4. 결과 구성 (데이터 없는 월은 0으로)
        history = []
        for month_str in month_list:
            if month_str in stats_dict:
                data = stats_dict[month_str]
                history.append(
                    UsageStats(
                        month=data.get("month", month_str),
                        cards_completed=data.get("cards_completed", 0),
                        insights_viewed=data.get("insights_viewed", 0),
                        med_checks_done=data.get("med_checks_done", 0),
                        total_points=data.get("total_points", 0),
                        updated_at=data.get("updated_at", datetime.now().isoformat()),
                    )
                )
            else:
                history.append(
                    UsageStats(
                        month=month_str,
                        cards_completed=0,
                        insights_viewed=0,
                        med_checks_done=0,
                        total_points=0,
                        updated_at=datetime.now().isoformat(),
                    )
                )

        # Envelope 응답
        return {"ok": True, "data": MonthlyHistory(months=history).model_dump()}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Usage history fetch failed: {e}", extra={"user_id": user_id, "months": months})
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "USAGE_HISTORY_FETCH_FAILED",
                    "message": "사용량 히스토리를 불러오는데 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
                },
            },
        )
