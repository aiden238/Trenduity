"""
구독 스키마 (Subscription Schemas)

플랜 정보, 사용량 추적, 결제 관련 Pydantic 모델
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime


class UserRole(str, Enum):
    """사용자 역할"""
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class AdminUserInfo(BaseModel):
    """관리자용 사용자 정보"""
    id: str
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.USER
    subscription_plan: str = "FREE"
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    total_ai_usage: int = 0
    is_active: bool = True


class AdminUserListResponse(BaseModel):
    """사용자 목록 응답"""
    users: List[AdminUserInfo]
    total: int
    page: int
    page_size: int


class AdminStatsResponse(BaseModel):
    """관리자 대시보드 통계"""
    total_users: int
    active_users_today: int
    active_users_week: int
    total_ai_requests_today: int
    total_ai_requests_week: int
    subscription_stats: dict  # 플랜별 사용자 수
    revenue_this_month: int
    new_users_today: int
    new_users_week: int


class AdminAIUsageStats(BaseModel):
    """AI 사용량 통계"""
    model_id: str
    model_name: str
    total_requests: int
    unique_users: int
    avg_requests_per_user: float


class UpdateUserRequest(BaseModel):
    """사용자 정보 수정 요청"""
    role: Optional[UserRole] = None
    subscription_plan: Optional[str] = None
    is_active: Optional[bool] = None


class ContentItem(BaseModel):
    """콘텐츠 아이템"""
    id: str
    title: str
    content_type: str  # insight, qna, announcement
    status: str  # draft, published, hidden
    created_at: datetime
    views: int = 0
    author_id: Optional[str] = None


class CreateAnnouncementRequest(BaseModel):
    """공지사항 생성 요청"""
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1, max_length=2000)
    is_important: bool = False
