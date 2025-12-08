"""
생활요금 체크 (가계부) API 라우터
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Optional, List
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from supabase import Client
from app.core.deps import get_current_user, get_supabase
from app.schemas.expense import (
    ExpenseCreateRequest,
    ExpenseSingleRequest,
    ExpenseUpdateRequest,
    ExpenseResponse,
    ExpenseListResponse,
    MonthlyExpenseSummary,
    ExpenseAnalysisRequest,
    ExpenseAnalysisResponse,
    CATEGORY_LABELS,
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def _parse_month(month_str: str) -> date:
    """YYYY-MM 형식을 date 객체로 변환 (1일로 설정)"""
    return datetime.strptime(f"{month_str}-01", "%Y-%m-%d").date()


def _format_expense(record: Dict) -> ExpenseResponse:
    """DB 레코드를 응답 형식으로 변환"""
    return ExpenseResponse(
        id=record['id'],
        category=record['category'],
        category_label=CATEGORY_LABELS.get(record['category'], record['category']),
        amount=record['amount'],
        note=record.get('note'),
        created_at=record['created_at'],
        updated_at=record['updated_at'],
    )


@router.get("/{month}")
async def get_monthly_expenses(
    month: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    월별 지출 내역 조회
    
    Args:
        month: 조회할 월 (YYYY-MM 형식)
    
    Returns:
        { "ok": true, "data": { "month": "2025-12", "expenses": [...], "summary": {...} } }
    """
    try:
        # 월 파싱
        month_date = _parse_month(month)
        
        # 해당 월 지출 조회
        result = db.table('expense_records').select('*').eq('user_id', user_id).eq('month', month_date.isoformat()).order('category').execute()
        
        expenses = [_format_expense(r) for r in (result.data or [])]
        
        # 요약 계산
        total_amount = sum(e.amount for e in expenses)
        breakdown = {}
        for e in expenses:
            key = e.category if not e.note else f"{e.category}_{e.note}"
            breakdown[key] = breakdown.get(key, 0) + e.amount
        
        # 전월 데이터 조회
        prev_month = month_date - relativedelta(months=1)
        prev_result = db.table('expense_records').select('amount').eq('user_id', user_id).eq('month', prev_month.isoformat()).execute()
        
        prev_total = sum(r['amount'] for r in (prev_result.data or []))
        change_rate = None
        if prev_total > 0:
            change_rate = round((total_amount - prev_total) / prev_total * 100, 1)
        
        summary = MonthlyExpenseSummary(
            month=month,
            total_amount=total_amount,
            item_count=len(expenses),
            breakdown=breakdown,
            previous_month_total=prev_total if prev_total > 0 else None,
            change_rate=change_rate,
        )
        
        return {
            "ok": True,
            "data": ExpenseListResponse(
                month=month,
                expenses=expenses,
                summary=summary,
            ).model_dump()
        }
        
    except ValueError as e:
        logger.error(f"월 형식 오류: {month}, {e}")
        raise HTTPException(status_code=400, detail={
            "ok": False,
            "error": {
                "code": "INVALID_MONTH_FORMAT",
                "message": "월 형식이 올바르지 않아요. YYYY-MM 형식으로 입력해주세요."
            }
        })
    except Exception as e:
        logger.error(f"지출 조회 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "EXPENSE_FETCH_FAILED",
                "message": "지출 내역을 불러오지 못했어요. 잠시 후 다시 시도해주세요."
            }
        })


@router.post("")
async def create_expense(
    request: ExpenseSingleRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    지출 항목 추가
    
    Returns:
        { "ok": true, "data": { "expense": {...} } }
    """
    try:
        month_date = _parse_month(request.month)
        
        # 삽입
        result = db.table('expense_records').insert({
            'user_id': user_id,
            'month': month_date.isoformat(),
            'category': request.category,
            'amount': request.amount,
            'note': request.note,
        }).execute()
        
        if not result.data:
            raise Exception("INSERT 실패")
        
        expense = _format_expense(result.data[0])
        
        logger.info(f"지출 추가: user={user_id}, category={request.category}, amount={request.amount}")
        
        return {
            "ok": True,
            "data": {
                "expense": expense.model_dump(),
                "message": "지출이 기록되었어요."
            }
        }
        
    except Exception as e:
        error_str = str(e).lower()
        
        # 중복 에러 처리
        if 'duplicate' in error_str or '23505' in error_str or 'unique' in error_str:
            raise HTTPException(status_code=409, detail={
                "ok": False,
                "error": {
                    "code": "DUPLICATE_EXPENSE",
                    "message": "같은 항목이 이미 등록되어 있어요. 수정하시려면 기존 항목을 눌러주세요."
                }
            })
        
        logger.error(f"지출 추가 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "EXPENSE_CREATE_FAILED",
                "message": "지출을 기록하지 못했어요. 다시 시도해주세요."
            }
        })


@router.put("/{expense_id}")
async def update_expense(
    expense_id: str,
    request: ExpenseUpdateRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    지출 항목 수정
    
    Returns:
        { "ok": true, "data": { "expense": {...} } }
    """
    try:
        # 업데이트할 필드만 추출
        update_data = {}
        if request.amount is not None:
            update_data['amount'] = request.amount
        if request.note is not None:
            update_data['note'] = request.note
        
        if not update_data:
            raise HTTPException(status_code=400, detail={
                "ok": False,
                "error": {
                    "code": "NO_UPDATE_DATA",
                    "message": "수정할 내용이 없어요."
                }
            })
        
        # 본인 소유 확인 + 업데이트
        result = db.table('expense_records').update(update_data).eq('id', expense_id).eq('user_id', user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail={
                "ok": False,
                "error": {
                    "code": "EXPENSE_NOT_FOUND",
                    "message": "지출 항목을 찾을 수 없어요."
                }
            })
        
        expense = _format_expense(result.data[0])
        
        logger.info(f"지출 수정: user={user_id}, expense_id={expense_id}")
        
        return {
            "ok": True,
            "data": {
                "expense": expense.model_dump(),
                "message": "수정되었어요."
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"지출 수정 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "EXPENSE_UPDATE_FAILED",
                "message": "수정하지 못했어요. 다시 시도해주세요."
            }
        })


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    지출 항목 삭제
    
    Returns:
        { "ok": true, "data": { "message": "..." } }
    """
    try:
        # 본인 소유 확인 + 삭제
        result = db.table('expense_records').delete().eq('id', expense_id).eq('user_id', user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail={
                "ok": False,
                "error": {
                    "code": "EXPENSE_NOT_FOUND",
                    "message": "지출 항목을 찾을 수 없어요."
                }
            })
        
        logger.info(f"지출 삭제: user={user_id}, expense_id={expense_id}")
        
        return {
            "ok": True,
            "data": {
                "message": "삭제되었어요."
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"지출 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "EXPENSE_DELETE_FAILED",
                "message": "삭제하지 못했어요. 다시 시도해주세요."
            }
        })


@router.post("/bulk")
async def bulk_upsert_expenses(
    request: ExpenseCreateRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    월별 지출 일괄 저장 (upsert)
    
    기존 항목은 수정하고, 새 항목은 추가합니다.
    
    Returns:
        { "ok": true, "data": { "saved_count": N, "message": "..." } }
    """
    try:
        month_date = _parse_month(request.month)
        saved_count = 0
        
        for expense in request.expenses:
            try:
                # Upsert 시도 (user_id + month + category + note 조합이 unique)
                db.table('expense_records').upsert({
                    'user_id': user_id,
                    'month': month_date.isoformat(),
                    'category': expense.category,
                    'amount': expense.amount,
                    'note': expense.note,
                }, on_conflict='user_id,month,category,note').execute()
                saved_count += 1
            except Exception as e:
                logger.warning(f"지출 upsert 실패 (개별): {expense.category}, {e}")
        
        logger.info(f"지출 일괄 저장: user={user_id}, month={request.month}, count={saved_count}")
        
        return {
            "ok": True,
            "data": {
                "saved_count": saved_count,
                "message": f"{saved_count}개 항목이 저장되었어요."
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail={
            "ok": False,
            "error": {
                "code": "INVALID_MONTH_FORMAT",
                "message": "월 형식이 올바르지 않아요."
            }
        })
    except Exception as e:
        logger.error(f"지출 일괄 저장 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "EXPENSE_BULK_FAILED",
                "message": "저장하지 못했어요. 다시 시도해주세요."
            }
        })


@router.post("/analyze")
async def analyze_expenses(
    request: ExpenseAnalysisRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    AI 지출 분석 (OpenAI 연동)
    
    해당 월의 지출을 분석하고 절약 팁을 제공합니다.
    
    Returns:
        { "ok": true, "data": { "analysis": "...", "tips": [...] } }
    """
    try:
        from app.core.config import settings
        import openai
        
        month_date = _parse_month(request.month)
        
        # 해당 월 지출 조회
        result = db.table('expense_records').select('*').eq('user_id', user_id).eq('month', month_date.isoformat()).execute()
        
        expenses = result.data or []
        total = sum(e['amount'] for e in expenses)
        
        if not expenses:
            return {
                "ok": True,
                "data": ExpenseAnalysisResponse(
                    month=request.month,
                    total_amount=0,
                    analysis="이번 달 지출 기록이 없어요. 지출을 기록하시면 분석해드릴게요!",
                    tips=["지출을 꾸준히 기록하면 절약 습관을 기를 수 있어요."],
                ).model_dump()
            }
        
        # 카테고리별 정리
        breakdown = {}
        for e in expenses:
            cat = CATEGORY_LABELS.get(e['category'], e['category'])
            breakdown[cat] = breakdown.get(cat, 0) + e['amount']
        
        breakdown_text = "\n".join([f"- {k}: {v:,}원" for k, v in breakdown.items()])
        
        # 전월 데이터
        prev_month = month_date - relativedelta(months=1)
        prev_result = db.table('expense_records').select('amount').eq('user_id', user_id).eq('month', prev_month.isoformat()).execute()
        prev_total = sum(r['amount'] for r in (prev_result.data or []))
        
        comparison = ""
        if prev_total > 0:
            diff = total - prev_total
            if diff > 0:
                comparison = f"전월 대비 {diff:,}원 증가했어요."
            elif diff < 0:
                comparison = f"전월 대비 {abs(diff):,}원 절약했어요!"
            else:
                comparison = "전월과 동일한 지출이에요."
        
        # OpenAI API 호출
        prompt = f"""당신은 시니어(50-70대)를 위한 친절한 가계부 분석 도우미입니다.
아래 월별 지출 내역을 분석하고, 쉬운 말로 조언해주세요.

## {request.month}월 지출 내역
총 지출: {total:,}원
{breakdown_text}

{comparison}

## 요청사항
1. 전체 지출 패턴을 2-3문장으로 분석해주세요.
2. 절약할 수 있는 팁 3가지를 알려주세요.
3. 어려운 단어 없이 존댓말로 친근하게 말해주세요."""

        try:
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.7,
            )
            
            ai_response = response.choices[0].message.content
            
            # 간단히 분석과 팁 분리 (실제로는 더 정교하게)
            lines = ai_response.strip().split('\n')
            analysis_lines = []
            tips = []
            in_tips = False
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                if '팁' in line or '절약' in line:
                    in_tips = True
                    continue
                if in_tips and (line.startswith('-') or line.startswith('•') or line[0].isdigit()):
                    tip = line.lstrip('-•0123456789. ')
                    if tip:
                        tips.append(tip)
                elif not in_tips:
                    analysis_lines.append(line)
            
            analysis = ' '.join(analysis_lines) if analysis_lines else ai_response[:300]
            if not tips:
                tips = ["지출 내역을 꾸준히 기록해보세요.", "불필요한 지출은 줄여보세요.", "예산을 미리 정해두면 도움이 돼요."]
            
        except Exception as ai_error:
            logger.error(f"OpenAI 호출 실패: {ai_error}")
            # AI 실패 시 기본 분석
            analysis = f"이번 달 총 {total:,}원을 지출하셨어요. "
            if breakdown:
                top_cat = max(breakdown.items(), key=lambda x: x[1])
                analysis += f"가장 큰 지출은 {top_cat[0]}({top_cat[1]:,}원)이에요."
            tips = ["고정 지출을 점검해보세요.", "카테고리별 예산을 정해보세요.", "작은 금액도 기록하면 도움이 돼요."]
        
        return {
            "ok": True,
            "data": ExpenseAnalysisResponse(
                month=request.month,
                total_amount=total,
                analysis=analysis,
                tips=tips[:3],
                comparison=comparison if comparison else None,
            ).model_dump()
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail={
            "ok": False,
            "error": {
                "code": "INVALID_MONTH_FORMAT",
                "message": "월 형식이 올바르지 않아요."
            }
        })
    except Exception as e:
        logger.error(f"지출 분석 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "EXPENSE_ANALYSIS_FAILED",
                "message": "분석을 완료하지 못했어요. 잠시 후 다시 시도해주세요."
            }
        })
