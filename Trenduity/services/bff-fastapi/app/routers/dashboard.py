from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import date

from app.core.deps import get_current_user, get_supabase

router = APIRouter()


class DashboardStatsResponse(BaseModel):
    """대시보드 통계 응답"""

    today_completions: int
    unread_alerts: int


@router.get("/stats")
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    대시보드 통계 조회

    - 오늘 가족 구성원들의 학습 카드 완료 수
    - 미확인 알림 수
    """
    try:
        guardian_id = current_user["id"]
        today = date.today().isoformat()

        # 가족 구성원 조회
        try:
            family_links = (
                supabase.table("family_links")
                .select("user_id")
                .eq("guardian_id", guardian_id)
                .execute()
            )
            member_ids = [link["user_id"] for link in (family_links.data or [])]
        except Exception:
            member_ids = []

        # 오늘 완료된 카드 수
        today_completions = 0
        if member_ids:
            try:
                completions = (
                    supabase.table("cards")
                    .select("id", count="exact")
                    .in_("user_id", member_ids)
                    .gte("completed_at", today)
                    .lt("completed_at", f"{today}T23:59:59")
                    .execute()
                )
                today_completions = completions.count or 0
            except Exception:
                pass

        # 미확인 알림 수
        unread_alerts = 0
        try:
            alerts = (
                supabase.table("alerts")
                .select("id", count="exact")
                .eq("user_id", guardian_id)
                .eq("read", False)
                .execute()
            )
            unread_alerts = alerts.count or 0
        except Exception:
            pass

        # Envelope 응답
        return {
            "ok": True,
            "data": DashboardStatsResponse(
                today_completions=today_completions,
                unread_alerts=unread_alerts,
            ).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "DASHBOARD_STATS_FAILED",
                "message": f"통계를 불러올 수 없어요: {str(e)}",
            },
        }
