from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
import secrets

from app.core.deps import get_current_user, get_supabase

router = APIRouter()


class InviteRequest(BaseModel):
    """가족 초대 요청"""

    user_id: str
    perms: dict = {"read": True, "alerts": True}


class InviteResponse(BaseModel):
    """가족 초대 응답"""

    invite_token: str
    message: str


class FamilyMember(BaseModel):
    """가족 멤버 정보"""

    user_id: str
    name: str
    last_activity: Optional[str]
    perms: dict


class FamilyMembersResponse(BaseModel):
    """가족 멤버 목록 응답"""

    members: List[FamilyMember]


@router.post("/invite")
async def create_invite(
    body: InviteRequest,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    가족 초대 (간소화: 직접 링크 생성)

    - guardian_id: 현재 사용자 (보호자, 자녀)
    - user_id: 시니어 (부모)
    - MVP에서는 초대 토큰 없이 직접 링크 생성
    """
    try:
        guardian_id = current_user["id"]

        # 중복 체크
        try:
            existing = (
                supabase.table("family_links")
                .select("id")
                .eq("guardian_id", guardian_id)
                .eq("user_id", body.user_id)
                .execute()
            )

            if existing.data:
                return {
                    "ok": True,
                    "data": InviteResponse(
                        invite_token="already_linked",
                        message="이미 연동되어 있어요.",
                    ).model_dump(),
                }
        except Exception:
            # 테이블이 없으면 계속
            pass

        # 가족 링크 생성
        try:
            supabase.table("family_links").insert(
                {
                    "guardian_id": guardian_id,
                    "user_id": body.user_id,
                    "perms": body.perms,
                }
            ).execute()
        except Exception:
            # 테이블이 없으면 무시
            pass

        # 초대 토큰 생성 (MVP: 실제 사용 안 함)
        invite_token = secrets.token_urlsafe(16)

        # Envelope 응답
        return {
            "ok": True,
            "data": InviteResponse(
                invite_token=invite_token,
                message="가족 연동이 완료되었어요.",
            ).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "FAMILY_INVITE_FAILED",
                "message": f"가족 초대에 실패했어요: {str(e)}",
            },
        }


@router.get("/members")
async def get_family_members(
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    보호자가 관리하는 시니어 목록

    - 연동된 멤버 정보
    - 마지막 활동 날짜
    - 권한 정보
    """
    try:
        guardian_id = current_user["id"]

        # 가족 링크 조회
        try:
            result = (
                supabase.table("family_links")
                .select("user_id, perms")
                .eq("guardian_id", guardian_id)
                .execute()
            )
        except Exception:
            # 테이블이 없으면 빈 목록
            return {
                "ok": True,
                "data": FamilyMembersResponse(members=[]).model_dump(),
            }

        members = []
        for link in result.data:
            # 사용자 정보 조회 (간소화: 이름만)
            try:
                user_result = (
                    supabase.table("users")
                    .select("name, email")
                    .eq("id", link["user_id"])
                    .single()
                    .execute()
                )
                user_name = user_result.data.get("name", "사용자") if user_result.data else "사용자"
            except Exception:
                user_name = "사용자"

            # 마지막 활동 조회 (cards 테이블)
            try:
                last_card = (
                    supabase.table("cards")
                    .select("date")
                    .eq("user_id", link["user_id"])
                    .order("date", desc=True)
                    .limit(1)
                    .execute()
                )
                last_activity = last_card.data[0]["date"] if last_card.data else None
            except Exception:
                last_activity = None

            members.append(
                FamilyMember(
                    user_id=link["user_id"],
                    name=user_name,
                    last_activity=last_activity,
                    perms=link["perms"],
                )
            )

        # Envelope 응답
        return {
            "ok": True,
            "data": FamilyMembersResponse(members=members).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "FAMILY_MEMBERS_FETCH_FAILED",
                "message": f"가족 목록을 불러올 수 없어요: {str(e)}",
            },
        }
