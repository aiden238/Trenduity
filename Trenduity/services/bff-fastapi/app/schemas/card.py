from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class Quiz(BaseModel):
    id: str
    question: str
    options: List[str]
    correctIndex: int = Field(ge=0)
    explanation: str


class CardPayload(BaseModel):
    title: str
    tldr: str
    body: str
    impact: str
    quiz: List[Quiz] = []


class CardResponse(BaseModel):
    id: str
    user_id: str
    date: str  # ISO date
    type: str  # 'ai_tools', 'digital_safety', 'health_info'
    payload: CardPayload
    status: str  # 'pending', 'completed'
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CardCompleteRequest(BaseModel):
    card_id: str
    quiz_answers: Optional[Dict[str, int]] = None  # { "q1": 1, "q2": 0 }


class QuizDetail(BaseModel):
    question_id: str
    is_correct: bool
    explanation: str


class QuizResult(BaseModel):
    correct: int
    total: int
    details: List[QuizDetail]


class CardCompleteResponse(BaseModel):
    points_added: int
    total_points: int
    streak_days: int
    quiz_result: Optional[QuizResult] = None
    new_badges: List[str] = []
