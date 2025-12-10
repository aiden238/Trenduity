"""
관리자 라우터 (Admin Router)

관리자 전용 API - 사용자 관리, 통계, 콘텐츠 관리
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime, timedelta
import logging

from app.core.deps import get_current_user, get_supabase
from app.schemas.admin import (
    AdminUserInfo,
    AdminUserListResponse,
    AdminStatsResponse,
    AdminAIUsageStats,
    UpdateUserRequest,
    ContentItem,
    CreateAnnouncementRequest,
    UserRole,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def verify_admin(current_user: dict):
    """관리자 권한 확인"""
    role = current_user.get("role", "user")
    if role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail={
                "ok": False,
                "error": {
                    "code": "FORBIDDEN",
                    "message": "관리자 권한이 필요해요."
                }
            }
        )
    return True


@router.get("/stats")
async def get_admin_stats(
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    관리자 대시보드 통계
    
    - 총 사용자 수, 활성 사용자, 신규 가입
    - AI 요청 통계
    - 구독 플랜별 통계
    - 매출 정보
    """
    verify_admin(current_user)
    
    try:
        # 통계 데이터 (실제로는 Supabase에서 집계)
        # 목업 데이터
        stats = AdminStatsResponse(
            total_users=1250,
            active_users_today=340,
            active_users_week=890,
            total_ai_requests_today=2500,
            total_ai_requests_week=15600,
            subscription_stats={
                "FREE": 800,
                "BUDGET": 280,
                "SAFE": 120,
                "STRONG": 50,
            },
            revenue_this_month=12500000,  # 1,250만원
            new_users_today=15,
            new_users_week=85,
        )
        
        return {
            "ok": True,
            "data": stats.model_dump()
        }
        
    except Exception as e:
        logger.error(f"Failed to get admin stats: {e}")
        return {
            "ok": False,
            "error": {
                "code": "STATS_ERROR",
                "message": "통계를 불러오는데 실패했어요."
            }
        }


@router.get("/users")
async def get_users(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    plan: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    사용자 목록 조회
    
    - 페이지네이션
    - 검색 (이름, 이메일)
    - 플랜별 필터
    """
    verify_admin(current_user)
    
    try:
        # 목업 데이터 (실제로는 Supabase에서 조회)
        mock_users = [
            AdminUserInfo(
                id=f"user_{i}",
                email=f"user{i}@example.com",
                name=f"사용자 {i}",
                phone="010-****-1234",
                role=UserRole.USER,
                subscription_plan="FREE" if i % 4 == 0 else "BUDGET" if i % 4 == 1 else "SAFE" if i % 4 == 2 else "STRONG",
                created_at=datetime.now() - timedelta(days=i * 3),
                last_login=datetime.now() - timedelta(hours=i),
                total_ai_usage=i * 15,
                is_active=True,
            )
            for i in range(1, 21)
        ]
        
        # 검색 필터 (목업)
        if search:
            mock_users = [u for u in mock_users if search.lower() in u.name.lower() or search.lower() in u.email.lower()]
        
        # 플랜 필터
        if plan:
            mock_users = [u for u in mock_users if u.subscription_plan == plan]
        
        # 페이지네이션
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_users = mock_users[start_idx:end_idx]
        
        response = AdminUserListResponse(
            users=paginated_users,
            total=len(mock_users),
            page=page,
            page_size=page_size,
        )
        
        return {
            "ok": True,
            "data": response.model_dump()
        }
        
    except Exception as e:
        logger.error(f"Failed to get users: {e}")
        return {
            "ok": False,
            "error": {
                "code": "USERS_ERROR",
                "message": "사용자 목록을 불러오는데 실패했어요."
            }
        }


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    사용자 상세 정보
    """
    verify_admin(current_user)
    
    try:
        # 목업 데이터
        user = AdminUserInfo(
            id=user_id,
            email="user@example.com",
            name="홍길동",
            phone="010-1234-5678",
            role=UserRole.USER,
            subscription_plan="BUDGET",
            created_at=datetime.now() - timedelta(days=30),
            last_login=datetime.now() - timedelta(hours=2),
            total_ai_usage=150,
            is_active=True,
        )
        
        return {
            "ok": True,
            "data": user.model_dump()
        }
        
    except Exception as e:
        logger.error(f"Failed to get user detail: {e}")
        return {
            "ok": False,
            "error": {
                "code": "USER_NOT_FOUND",
                "message": "사용자를 찾을 수 없어요."
            }
        }


@router.patch("/users/{user_id}")
async def update_user(
    user_id: str,
    body: UpdateUserRequest,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    사용자 정보 수정 (역할, 플랜, 활성 상태)
    """
    verify_admin(current_user)
    
    try:
        # 실제로는 Supabase 업데이트
        logger.info(f"Updating user {user_id}: {body.model_dump()}")
        
        return {
            "ok": True,
            "data": {
                "message": "사용자 정보가 수정되었어요.",
                "user_id": user_id
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to update user: {e}")
        return {
            "ok": False,
            "error": {
                "code": "UPDATE_ERROR",
                "message": "사용자 정보 수정에 실패했어요."
            }
        }


@router.get("/ai-usage")
async def get_ai_usage_stats(
    days: int = 7,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    AI 사용량 통계
    
    - 모델별 요청 수
    - 사용자별 평균
    """
    verify_admin(current_user)
    
    try:
        # 목업 데이터
        usage_stats = [
            AdminAIUsageStats(
                model_id="quick",
                model_name="빠른 일반 비서 (Gemini)",
                total_requests=5200,
                unique_users=820,
                avg_requests_per_user=6.3,
            ),
            AdminAIUsageStats(
                model_id="allround",
                model_name="만능 비서 (GPT-4o-mini)",
                total_requests=8500,
                unique_users=950,
                avg_requests_per_user=8.9,
            ),
            AdminAIUsageStats(
                model_id="writer",
                model_name="글쓰기 비서 (Claude)",
                total_requests=3200,
                unique_users=420,
                avg_requests_per_user=7.6,
            ),
            AdminAIUsageStats(
                model_id="expert",
                model_name="척척박사 비서 (GPT-4o)",
                total_requests=2100,
                unique_users=280,
                avg_requests_per_user=7.5,
            ),
            AdminAIUsageStats(
                model_id="genius",
                model_name="천재 비서 (Claude Opus)",
                total_requests=450,
                unique_users=50,
                avg_requests_per_user=9.0,
            ),
        ]
        
        return {
            "ok": True,
            "data": {
                "period_days": days,
                "stats": [s.model_dump() for s in usage_stats]
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get AI usage stats: {e}")
        return {
            "ok": False,
            "error": {
                "code": "STATS_ERROR",
                "message": "AI 사용량 통계를 불러오는데 실패했어요."
            }
        }


@router.post("/announcements")
async def create_announcement(
    body: CreateAnnouncementRequest,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    공지사항 등록
    """
    verify_admin(current_user)
    
    try:
        # 실제로는 Supabase에 저장
        logger.info(f"Creating announcement: {body.title}")
        
        return {
            "ok": True,
            "data": {
                "message": "공지사항이 등록되었어요.",
                "id": "announcement_123"
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to create announcement: {e}")
        return {
            "ok": False,
            "error": {
                "code": "CREATE_ERROR",
                "message": "공지사항 등록에 실패했어요."
            }
        }


@router.get("/announcements")
async def get_announcements(
    page: int = 1,
    page_size: int = 10,
    current_user: dict = Depends(get_current_user),
):
    """
    공지사항 목록
    """
    verify_admin(current_user)
    
    try:
        # 목업 데이터
        announcements = [
            ContentItem(
                id=f"ann_{i}",
                title=f"공지사항 {i}: 서비스 업데이트 안내",
                content_type="announcement",
                status="published",
                created_at=datetime.now() - timedelta(days=i),
                views=100 + i * 20,
            )
            for i in range(1, 11)
        ]
        
        return {
            "ok": True,
            "data": {
                "announcements": [a.model_dump() for a in announcements],
                "total": len(announcements),
                "page": page,
                "page_size": page_size,
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get announcements: {e}")
        return {
            "ok": False,
            "error": {
                "code": "LIST_ERROR",
                "message": "공지사항 목록을 불러오는데 실패했어요."
            }
        }
