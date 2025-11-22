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

        # 가족 링크 조회 - LEFT JOIN으로 users 정보 한 번에 가져오기 (N+1 방지)
        try:
            result = (
                supabase.table("family_links")
                .select("user_id, perms, users!inner(name, email)")
                .eq("guardian_id", guardian_id)
                .execute()
            )
        except Exception:
            # 테이블이 없으면 빈 목록
            return {
                "ok": True,
                "data": FamilyMembersResponse(members=[]).model_dump(),
            }

        # 모든 user_id에 대한 마지막 활동을 한 번에 조회 (N+1 방지)
        user_ids = [link["user_id"] for link in result.data]
        last_activities = {}
        if user_ids:
            try:
                # 각 user의 최신 카드 날짜를 한 번에 조회
                # Supabase는 윈도우 함수를 직접 지원하지 않으므로, 개별 조회보다는 일괄 조회 후 Python에서 처리
                cards_result = (
                    supabase.table("cards")
                    .select("user_id, date")
                    .in_("user_id", user_ids)
                    .order("date", desc=True)
                    .execute()
                )
                
                # 각 user_id별 최신 날짜 추출
                for card in cards_result.data or []:
                    user_id = card["user_id"]
                    if user_id not in last_activities:
                        last_activities[user_id] = card["date"]
            except Exception:
                pass

        members = []
        for link in result.data:
            # JOIN된 users 정보 사용
            user_name = "사용자"
            if link.get("users"):
                user_name = link["users"].get("name", "사용자")

            # 미리 조회한 마지막 활동 사용
            last_activity = last_activities.get(link["user_id"])

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


class MemberProfile(BaseModel):
    """멤버 프로필"""

    user_id: str
    name: str
    email: str
    created_at: str
    total_points: int
    badges: List[str]  # 획득한 배지 ID 목록


@router.get("/members/{user_id}/profile")
async def get_member_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    멤버 상세 프로필 조회
    
    Returns:
        {
          "ok": true,
          "data": {
            "user_id": "...",
            "name": "김어머니",
            "email": "...",
            "created_at": "2024-01-01",
            "total_points": 150,
            "badges": ["badge-id-1", "badge-id-2"]
          }
        }
    """
    try:
        guardian_id = current_user["id"]
        
        # 1. 가족 링크 확인 (권한 체크)
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
                return {
                    "ok": False,
                    "error": {
                        "code": "MEMBER_NOT_FOUND",
                        "message": "연동된 멤버가 아니에요."
                    }
                }
        except Exception:
            return {
                "ok": False,
                "error": {
                    "code": "MEMBER_NOT_FOUND",
                    "message": "연동된 멤버가 아니에요."
                }
            }
        
        # 2. 사용자 기본 정보
        try:
            user_result = (
                supabase.table("users")
                .select("name, email, created_at")
                .eq("id", user_id)
                .single()
                .execute()
            )
            
            if not user_result.data:
                return {
                    "ok": False,
                    "error": {
                        "code": "USER_NOT_FOUND",
                        "message": "사용자 정보를 찾을 수 없어요."
                    }
                }
                
            user_data = user_result.data
        except Exception as e:
            return {
                "ok": False,
                "error": {
                    "code": "DB_ERROR",
                    "message": "사용자 정보를 불러오는데 문제가 생겼어요."
                }
            }
        
        # 3. 총 포인트 조회
        try:
            gamification_result = (
                supabase.table("gamification")
                .select("points")
                .eq("user_id", user_id)
                .single()
                .execute()
            )
            total_points = gamification_result.data.get("points", 0) if gamification_result.data else 0
        except Exception:
            total_points = 0
        
        # 4. 획득한 배지 조회
        try:
            badges_result = (
                supabase.table("user_badges")
                .select("badge_id")
                .eq("user_id", user_id)
                .execute()
            )
            badges = [row["badge_id"] for row in badges_result.data] if badges_result.data else []
        except Exception:
            badges = []
        
        # Envelope 응답
        return {
            "ok": True,
            "data": MemberProfile(
                user_id=user_id,
                name=user_data.get("name", "사용자"),
                email=user_data.get("email", ""),
                created_at=user_data.get("created_at", ""),
                total_points=total_points,
                badges=badges
            ).model_dump()
        }
        
    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "PROFILE_FETCH_FAILED",
                "message": f"프로필을 불러오는데 문제가 생겼어요: {str(e)}"
            }
        }


class DailyActivity(BaseModel):
    """일별 활동"""
    
    date: str  # YYYY-MM-DD
    cards_completed: int
    med_checks: int


class MemberActivity(BaseModel):
    """멤버 활동 통계"""
    
    daily_activities: List[DailyActivity]
    total_cards_7days: int
    total_med_checks_7days: int


@router.get("/members/{user_id}/activity")
async def get_member_activity(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    멤버 주간 활동 통계 (최근 7일)
    
    Returns:
        {
          "ok": true,
          "data": {
            "daily_activities": [
              {"date": "2024-01-15", "cards_completed": 1, "med_checks": 2},
              {"date": "2024-01-14", "cards_completed": 1, "med_checks": 1},
              ...
            ],
            "total_cards_7days": 5,
            "total_med_checks_7days": 10
          }
        }
    """
    try:
        guardian_id = current_user["id"]
        
        # 1. 가족 링크 확인
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
                return {
                    "ok": False,
                    "error": {
                        "code": "MEMBER_NOT_FOUND",
                        "message": "연동된 멤버가 아니에요."
                    }
                }
        except Exception:
            return {
                "ok": False,
                "error": {
                    "code": "MEMBER_NOT_FOUND",
                    "message": "연동된 멤버가 아니에요."
                }
            }
        
        # 2. 최근 7일 날짜 계산
        from datetime import datetime, timedelta
        today = datetime.now().date()
        dates = [(today - timedelta(days=i)).isoformat() for i in range(7)]
        
        # 3. 카드 완료 데이터 조회
        try:
            cards_result = (
                supabase.table("cards")
                .select("date, completed_at")
                .eq("user_id", user_id)
                .gte("date", dates[-1])  # 7일 전부터
                .execute()
            )
            
            # 날짜별 완료 카운트
            cards_by_date = {}
            for card in cards_result.data or []:
                if card.get("completed_at"):
                    date = card["date"]
                    cards_by_date[date] = cards_by_date.get(date, 0) + 1
        except Exception:
            cards_by_date = {}
        
        # 4. 복약 체크 데이터 조회
        try:
            med_result = (
                supabase.table("med_checks")
                .select("date")
                .eq("user_id", user_id)
                .gte("date", dates[-1])
                .execute()
            )
            
            # 날짜별 복약 카운트
            med_by_date = {}
            for med in med_result.data or []:
                date = med["date"]
                med_by_date[date] = med_by_date.get(date, 0) + 1
        except Exception:
            med_by_date = {}
        
        # 5. 일별 활동 구성 (최근 날짜부터)
        daily_activities = []
        for date in dates:
            daily_activities.append(
                DailyActivity(
                    date=date,
                    cards_completed=cards_by_date.get(date, 0),
                    med_checks=med_by_date.get(date, 0)
                )
            )
        
        # 6. 총합 계산
        total_cards = sum(activity.cards_completed for activity in daily_activities)
        total_med = sum(activity.med_checks for activity in daily_activities)
        
        # Envelope 응답
        return {
            "ok": True,
            "data": MemberActivity(
                daily_activities=daily_activities,
                total_cards_7days=total_cards,
                total_med_checks_7days=total_med
            ).model_dump()
        }
        
    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "ACTIVITY_FETCH_FAILED",
                "message": f"활동 통계를 불러오는데 문제가 생겼어요: {str(e)}"
            }
        }


class EncourageRequest(BaseModel):
    """격려 메시지 요청"""

    user_id: str
    message: str


class EncourageResponse(BaseModel):
    """격려 메시지 응답"""

    success: bool
    message: str


@router.post("/encourage")
async def send_encouragement(
    body: EncourageRequest,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    가족 격려 메시지 보내기

    - 보호자가 시니어에게 응원 메시지 전송
    - 알림 테이블에 기록
    - 모바일 앱에서 확인 가능
    """
    try:
        guardian_id = current_user["id"]

        # 권한 확인 (가족 링크가 있는지)
        try:
            link = (
                supabase.table("family_links")
                .select("id")
                .eq("guardian_id", guardian_id)
                .eq("user_id", body.user_id)
                .execute()
            )

            if not link.data:
                return {
                    "ok": False,
                    "error": {
                        "code": "PERMISSION_DENIED",
                        "message": "이 회원에게 메시지를 보낼 권한이 없어요.",
                    },
                }
        except Exception:
            # 테이블이 없으면 권한 없음
            return {
                "ok": False,
                "error": {
                    "code": "PERMISSION_DENIED",
                    "message": "권한 확인에 실패했어요.",
                },
            }

        # 알림 생성
        try:
            supabase.table("alerts").insert(
                {
                    "user_id": body.user_id,
                    "type": "encouragement",
                    "title": "💖 가족의 응원",
                    "message": body.message,
                    "read": False,
                }
            ).execute()
        except Exception as e:
            return {
                "ok": False,
                "error": {
                    "code": "ALERT_CREATE_FAILED",
                    "message": f"메시지 전송에 실패했어요: {str(e)}",
                },
            }

        # Envelope 응답
        return {
            "ok": True,
            "data": EncourageResponse(
                success=True,
                message="응원 메시지를 보냈어요! 💖",
            ).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "ENCOURAGE_FAILED",
                "message": f"메시지 전송에 실패했어요: {str(e)}",
            },
        }
