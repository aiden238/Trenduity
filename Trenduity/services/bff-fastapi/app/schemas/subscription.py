"""
구독 플랜 스키마

도우미 관리 (플랜 업그레이드, 구독 관리) 기능용 Pydantic 모델
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum


class PlanType(str, Enum):
    """구독 플랜 타입"""
    FREE = "free"           # 기본 도우미 (무료)
    ECONOMY = "economy"     # 알뜰 도우미 (9,900원)
    STANDARD = "standard"   # 안심 도우미 (24,500원)
    PREMIUM = "premium"     # 든든 도우미 (49,900원)
    ADDON = "addon"         # 추가 도우미 (14,900원)


class AIModelType(str, Enum):
    """AI 모델 타입"""
    QUICK = "quick"         # 빠른 일반 비서 (Gemini)
    ALLROUND = "allround"   # 만능 비서 (GPT-4o-mini)
    WRITER = "writer"       # 글쓰기 비서 (Claude)
    EXPERT = "expert"       # 척척박사 비서 (GPT-4o)
    GENIUS = "genius"       # 천재 비서 (Claude Opus급) - 든든 플랜 전용


# 플랜별 AI 사용 횟수 제한
PLAN_LIMITS: Dict[str, Dict[str, int]] = {
    "free": {
        "quick": 5,
        "allround": 0,
        "writer": 0,
        "expert": 0,
        "genius": 0,
    },
    "economy": {
        "quick": 10,
        "allround": 5,
        "writer": 3,
        "expert": 0,
        "genius": 0,
    },
    "standard": {
        "quick": 30,
        "allround": 15,
        "writer": 10,
        "expert": 3,
        "genius": 0,
    },
    "premium": {
        "quick": 50,
        "allround": 30,
        "writer": 20,
        "expert": 10,
        "genius": 3,
    },
    "addon": {
        "quick": 15,
        "allround": 10,
        "writer": 5,
        "expert": 1,
        "genius": 0,
    },
}

# 플랜 정보
PLAN_INFO = {
    "free": {
        "name": "기본 도우미",
        "price": 0,
        "description": "빠른 일반 비서만 사용 가능",
        "features": ["빠른 일반 비서 5회/일"],
    },
    "economy": {
        "name": "알뜰 도우미",
        "price": 9900,
        "description": "일상적인 질문에 충분한 플랜",
        "features": [
            "빠른 일반 비서 10회/일",
            "만능 비서 5회/일",
            "글쓰기 비서 3회/일",
        ],
    },
    "standard": {
        "name": "안심 도우미",
        "price": 24500,
        "description": "관리자 코칭 + 재테크 기능 포함",
        "features": [
            "빠른 일반 비서 30회/일",
            "만능 비서 15회/일",
            "글쓰기 비서 10회/일",
            "척척박사 비서 3회/일",
            "관리자 코칭/상담 우선 순위",
            "재테크 기능 활성화",
        ],
    },
    "premium": {
        "name": "든든 도우미",
        "price": 49900,
        "description": "모든 기능 + 천재 비서 포함",
        "features": [
            "빠른 일반 비서 50회/일",
            "만능 비서 30회/일",
            "글쓰기 비서 20회/일",
            "척척박사 비서 10회/일",
            "천재 비서 3회/일 (하이엔드)",
            "관리자 코칭/상담 최우선 순위",
            "재테크 기능 활성화",
        ],
    },
    "addon": {
        "name": "추가 도우미",
        "price": 14900,
        "description": "기존 플랜에 추가 사용량",
        "features": [
            "빠른 일반 비서 +15회",
            "만능 비서 +10회",
            "글쓰기 비서 +5회",
            "척척박사 비서 +1회",
        ],
    },
}


class SubscriptionBase(BaseModel):
    """구독 기본 정보"""
    plan_type: PlanType = Field(default=PlanType.FREE, description="플랜 타입")


class SubscriptionCreate(SubscriptionBase):
    """구독 생성 요청"""
    pass


class SubscriptionUpdate(BaseModel):
    """구독 업데이트 요청"""
    plan_type: Optional[PlanType] = None


class Subscription(SubscriptionBase):
    """구독 정보 응답"""
    id: str
    user_id: str
    starts_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UsageRecord(BaseModel):
    """AI 사용량 기록"""
    model_id: str = Field(..., description="AI 모델 ID")
    used_at: datetime = Field(default_factory=datetime.utcnow)


class UsageSummary(BaseModel):
    """AI 사용량 요약"""
    model_id: str
    used_count: int
    limit: int
    remaining: int


class UserSubscriptionInfo(BaseModel):
    """사용자 구독 정보 (프론트엔드용)"""
    plan_type: PlanType
    plan_name: str
    plan_price: int
    plan_features: List[str]
    is_active: bool
    expires_at: Optional[datetime]
    usage: Dict[str, UsageSummary]
    can_use_fintech: bool = False
    can_use_coaching: bool = False


class PlanListItem(BaseModel):
    """플랜 목록 아이템"""
    plan_type: PlanType
    name: str
    price: int
    description: str
    features: List[str]
    limits: Dict[str, int]
