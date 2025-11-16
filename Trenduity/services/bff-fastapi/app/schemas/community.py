from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class QnaCreateRequest(BaseModel):
    subject: str  # '폰', '사기', '도구', '생활'
    title: str = Field(..., max_length=100)
    body: str = Field(..., max_length=1000)
    is_anon: bool = False


class QnaResponse(BaseModel):
    id: str
    author_id: str
    subject: str
    title: str
    body: str
    is_anon: bool
    ai_summary: Optional[str] = None
    created_at: datetime
    useful_count: int = 0


class ReactionCreateRequest(BaseModel):
    target_type: str  # 'card', 'insight', 'qna_post'
    target_id: str
    reaction_type: str  # 'cheer', 'useful'
