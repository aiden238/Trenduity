"""
할일 메모장 스키마
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


# 필터 타입
TodoFilter = Literal['all', 'pending', 'completed']


class TodoCreateRequest(BaseModel):
    """할일 생성 요청"""
    title: str = Field(..., min_length=1, max_length=200, description="할일 제목")
    description: Optional[str] = Field(None, description="상세 설명")
    due_date: Optional[datetime] = Field(None, description="마감일")
    reminder_time: Optional[datetime] = Field(None, description="알림 시간")


class TodoUpdateRequest(BaseModel):
    """할일 수정 요청"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="할일 제목")
    description: Optional[str] = Field(None, description="상세 설명")
    due_date: Optional[datetime] = Field(None, description="마감일")
    reminder_time: Optional[datetime] = Field(None, description="알림 시간")
    is_completed: Optional[bool] = Field(None, description="완료 여부")


class TodoToggleRequest(BaseModel):
    """할일 완료 토글 요청"""
    is_completed: bool = Field(..., description="완료 여부")


class TodoResponse(BaseModel):
    """할일 응답"""
    id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    reminder_time: Optional[datetime] = None
    is_completed: bool
    notification_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class TodoListResponse(BaseModel):
    """할일 목록 응답"""
    todos: List[TodoResponse]
    total_count: int
    pending_count: int
    completed_count: int


class TodoReminderUpdate(BaseModel):
    """알림 설정 업데이트"""
    reminder_time: Optional[datetime] = Field(None, description="알림 시간 (null이면 알림 해제)")
    notification_id: Optional[str] = Field(None, description="클라이언트 알림 ID")
