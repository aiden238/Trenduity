from pydantic import BaseModel
from typing import Dict, Optional


class VoiceParseRequest(BaseModel):
    text: str


class VoiceParseResponse(BaseModel):
    intent: str  # 'open', 'search', 'call', 'sms', 'remind', 'navigate', 'unknown'
    confidence: float
    slots: Dict[str, str] = {}
    action: Optional[Dict] = None
    message: str
