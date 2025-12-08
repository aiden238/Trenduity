"""
생활요금 체크 (가계부) 스키마
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from datetime import date, datetime


# 카테고리 타입 정의
ExpenseCategory = Literal[
    'rent', 'mortgage', 'maintenance', 'electricity', 'gas', 'water',
    'telecom', 'tv', 'insurance', 'loan', 'transport', 'food', 'other'
]

# 한글 카테고리명 매핑
CATEGORY_LABELS: Dict[str, str] = {
    'rent': '월세',
    'mortgage': '담보대출이자',
    'maintenance': '관리비',
    'electricity': '전기세',
    'gas': '가스비',
    'water': '수도세',
    'telecom': '통신비',
    'tv': 'TV요금',
    'insurance': '보험료',
    'loan': '대출이자',
    'transport': '교통비',
    'food': '식비',
    'other': '기타',
}


class ExpenseRecord(BaseModel):
    """개별 지출 기록"""
    id: Optional[str] = None
    category: ExpenseCategory
    amount: int = Field(ge=0, description="금액 (원)")
    note: Optional[str] = Field(None, max_length=100, description="메모 (기타 항목용)")


class ExpenseCreateRequest(BaseModel):
    """지출 기록 생성/수정 요청"""
    month: str = Field(..., pattern=r"^\d{4}-\d{2}$", description="월 (YYYY-MM 형식)")
    expenses: List[ExpenseRecord] = Field(..., description="지출 항목 목록")


class ExpenseSingleRequest(BaseModel):
    """단일 지출 기록 생성 요청"""
    month: str = Field(..., pattern=r"^\d{4}-\d{2}$", description="월 (YYYY-MM 형식)")
    category: ExpenseCategory
    amount: int = Field(ge=0, description="금액 (원)")
    note: Optional[str] = Field(None, max_length=100, description="메모")


class ExpenseUpdateRequest(BaseModel):
    """지출 기록 수정 요청"""
    amount: Optional[int] = Field(None, ge=0, description="금액 (원)")
    note: Optional[str] = Field(None, max_length=100, description="메모")


class ExpenseResponse(BaseModel):
    """지출 기록 응답"""
    id: str
    category: str
    category_label: str
    amount: int
    note: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class MonthlyExpenseSummary(BaseModel):
    """월별 지출 요약"""
    month: str  # YYYY-MM
    total_amount: int
    item_count: int
    breakdown: Dict[str, int]  # category -> amount
    previous_month_total: Optional[int] = None
    change_rate: Optional[float] = None  # 전월 대비 증감률 (%)


class ExpenseListResponse(BaseModel):
    """지출 목록 응답"""
    month: str
    expenses: List[ExpenseResponse]
    summary: MonthlyExpenseSummary


class ExpenseAnalysisRequest(BaseModel):
    """AI 지출 분석 요청"""
    month: str = Field(..., pattern=r"^\d{4}-\d{2}$", description="분석할 월")


class ExpenseAnalysisResponse(BaseModel):
    """AI 지출 분석 응답"""
    month: str
    total_amount: int
    analysis: str  # AI가 생성한 분석 텍스트
    tips: List[str]  # 절약 팁
    comparison: Optional[str] = None  # 전월 대비 분석
