from pydantic import BaseModel
from typing import Dict


class FamilyInviteRedeemRequest(BaseModel):
    code: str


class FamilyUsageResponse(BaseModel):
    senior_id: str
    cards_completed: int
    voice_intents_used: int
    scam_checks: int
    qna_posts: int
    med_checks: int
    weekly_activity: Dict[str, int] = {}
