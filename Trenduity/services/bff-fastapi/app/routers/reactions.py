from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Literal

from app.core.deps import get_current_user, get_supabase

router = APIRouter()


class AddReactionRequest(BaseModel):
    """리액션 추가/제거 요청"""

    target_type: Literal["card", "insight", "course", "qna_post"]
    target_id: str
    kind: Literal["cheer", "useful", "like"]


class ToggleReactionResponse(BaseModel):
    """리액션 토글 응답"""

    action: Literal["added", "removed"]
    total_count: int


class ReactionStats(BaseModel):
    """리액션 통계 (kind별)"""

    count: int
    user_reacted: bool


class ReactionsResponse(BaseModel):
    """리액션 응답"""

    reactions: Dict[str, ReactionStats]


@router.post("")
async def toggle_reaction(
    body: AddReactionRequest,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    리액션 토글 (추가/제거)

    - 이미 있으면 제거, 없으면 추가
    - UNIQUE 제약으로 중복 방지
    - 총 개수 반환
    """
    try:
        user_id = current_user["id"]

        # 기존 리액션 확인
        try:
            existing = (
                supabase.table("reactions")
                .select("id")
                .eq("user_id", user_id)
                .eq("target_type", body.target_type)
                .eq("target_id", body.target_id)
                .eq("kind", body.kind)
                .execute()
            )
        except Exception:
            # 테이블이 없으면 추가 시도
            existing = None

        action = "removed"
        if existing and existing.data:
            # 이미 있으면 제거
            try:
                supabase.table("reactions").delete().eq("id", existing.data[0]["id"]).execute()
            except Exception:
                pass
            action = "removed"
        else:
            # 없으면 추가
            try:
                supabase.table("reactions").insert(
                    {
                        "user_id": user_id,
                        "target_type": body.target_type,
                        "target_id": body.target_id,
                        "kind": body.kind,
                    }
                ).execute()
                action = "added"
            except Exception:
                # 테이블이 없으면 무시
                pass

        # 총 개수 조회
        try:
            count_result = (
                supabase.table("reactions")
                .select("id", count="exact")
                .eq("target_type", body.target_type)
                .eq("target_id", body.target_id)
                .eq("kind", body.kind)
                .execute()
            )
            total_count = count_result.count or 0
        except Exception:
            total_count = 0

        # Envelope 응답
        return {
            "ok": True,
            "data": ToggleReactionResponse(
                action=action, total_count=total_count
            ).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "REACTION_TOGGLE_FAILED",
                "message": f"리액션을 처리할 수 없어요: {str(e)}",
            },
        }


@router.get("")
async def get_reactions(
    target_type: str,
    target_id: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    특정 대상의 리액션 통계

    - kind별 총 개수
    - 현재 사용자가 리액션했는지 여부
    """
    try:
        user_id = current_user["id"]

        # 전체 리액션 조회
        try:
            all_reactions = (
                supabase.table("reactions")
                .select("kind, user_id")
                .eq("target_type", target_type)
                .eq("target_id", target_id)
                .execute()
            )
        except Exception:
            # 테이블이 없으면 빈 통계 반환
            return {
                "ok": True,
                "data": ReactionsResponse(reactions={}).model_dump(),
            }

        # 카운트 집계
        reaction_stats: Dict[str, ReactionStats] = {}
        for r in all_reactions.data:
            kind = r["kind"]
            if kind not in reaction_stats:
                reaction_stats[kind] = ReactionStats(count=0, user_reacted=False)

            reaction_stats[kind].count += 1
            if r["user_id"] == user_id:
                reaction_stats[kind].user_reacted = True

        # Envelope 응답
        return {
            "ok": True,
            "data": ReactionsResponse(
                reactions={k: v.model_dump() for k, v in reaction_stats.items()}
            ).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "REACTIONS_FETCH_FAILED",
                "message": f"리액션을 불러올 수 없어요: {str(e)}",
            },
        }
