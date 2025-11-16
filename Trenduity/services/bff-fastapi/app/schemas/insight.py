from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Reference(BaseModel):
    title: str
    url: str


class InsightPayload(BaseModel):
    body: str
    impact: str
    references: List[Reference] = []


class InsightListItem(BaseModel):
    id: str
    date: str  # ISO date
    topic: str  # 'ai_tools', 'digital_safety', 'health', 'finance'
    title: str
    summary: str
    source: Optional[str] = None


class InsightDetail(BaseModel):
    id: str
    date: str
    topic: str
    title: str
    summary: str
    source: Optional[str] = None
    body: str
    impact: str
    references: List[Reference] = []
    created_at: Optional[datetime] = None


class FollowTopicRequest(BaseModel):
    topic: str  # ai_tools, digital_safety, health, finance


class FollowTopicResponse(BaseModel):
    is_following: bool


class FollowingTopicsResponse(BaseModel):
    topics: List[str]
