from pydantic import BaseModel
from typing import Optional


class ScamCheckRequest(BaseModel):
    text: str
    url: Optional[str] = None


class ScamCheckResponse(BaseModel):
    label: str  # 'safe', 'warn', 'danger'
    confidence: float
    explanation: str
    tips: str
    keywords_matched: list[str] = []
