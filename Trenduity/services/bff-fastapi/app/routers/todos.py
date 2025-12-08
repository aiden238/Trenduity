"""
할일 메모장 API 라우터
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Optional, List
from datetime import datetime
from supabase import Client
from app.core.deps import get_current_user, get_supabase
from app.schemas.todo import (
    TodoCreateRequest,
    TodoUpdateRequest,
    TodoToggleRequest,
    TodoResponse,
    TodoListResponse,
    TodoReminderUpdate,
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def _format_todo(record: Dict) -> TodoResponse:
    """DB 레코드를 응답 형식으로 변환"""
    return TodoResponse(
        id=record['id'],
        title=record['title'],
        description=record.get('description'),
        due_date=record.get('due_date'),
        reminder_time=record.get('reminder_time'),
        is_completed=record.get('is_completed', False),
        notification_id=record.get('notification_id'),
        created_at=record['created_at'],
        updated_at=record['updated_at'],
        completed_at=record.get('completed_at'),
    )


@router.get("")
async def get_todos(
    filter: str = "all",
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    할일 목록 조회
    
    Args:
        filter: 필터 (all, pending, completed)
    
    Returns:
        { "ok": true, "data": { "todos": [...], "total_count": N, ... } }
    """
    try:
        # 기본 쿼리
        query = db.table('todo_items').select('*').eq('user_id', user_id)
        
        # 필터 적용
        if filter == 'pending':
            query = query.eq('is_completed', False)
        elif filter == 'completed':
            query = query.eq('is_completed', True)
        
        # 정렬: 미완료 먼저, 그 다음 마감일 순, 생성일 순
        result = query.order('is_completed').order('due_date', nullsfirst=False).order('created_at', desc=True).execute()
        
        todos = [_format_todo(r) for r in (result.data or [])]
        
        # 카운트 계산
        total_count = len(todos) if filter == 'all' else None
        pending_count = len([t for t in todos if not t.is_completed])
        completed_count = len([t for t in todos if t.is_completed])
        
        # 필터가 all이 아니면 전체 카운트 별도 조회
        if filter != 'all':
            all_result = db.table('todo_items').select('id, is_completed').eq('user_id', user_id).execute()
            all_todos = all_result.data or []
            total_count = len(all_todos)
            pending_count = len([t for t in all_todos if not t['is_completed']])
            completed_count = len([t for t in all_todos if t['is_completed']])
        
        return {
            "ok": True,
            "data": TodoListResponse(
                todos=todos,
                total_count=total_count or len(todos),
                pending_count=pending_count,
                completed_count=completed_count,
            ).model_dump()
        }
        
    except Exception as e:
        logger.error(f"할일 조회 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "TODO_FETCH_FAILED",
                "message": "할일 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요."
            }
        })


@router.get("/{todo_id}")
async def get_todo(
    todo_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    할일 상세 조회
    
    Returns:
        { "ok": true, "data": { "todo": {...} } }
    """
    try:
        result = db.table('todo_items').select('*').eq('id', todo_id).eq('user_id', user_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail={
                "ok": False,
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "할일을 찾을 수 없어요."
                }
            })
        
        todo = _format_todo(result.data)
        
        return {
            "ok": True,
            "data": {
                "todo": todo.model_dump()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"할일 조회 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "TODO_FETCH_FAILED",
                "message": "할일을 불러오지 못했어요."
            }
        })


@router.post("")
async def create_todo(
    request: TodoCreateRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    할일 생성
    
    Returns:
        { "ok": true, "data": { "todo": {...}, "message": "..." } }
    """
    try:
        # 삽입 데이터 준비
        insert_data = {
            'user_id': user_id,
            'title': request.title,
        }
        
        if request.description:
            insert_data['description'] = request.description
        if request.due_date:
            insert_data['due_date'] = request.due_date.isoformat()
        if request.reminder_time:
            insert_data['reminder_time'] = request.reminder_time.isoformat()
        
        result = db.table('todo_items').insert(insert_data).execute()
        
        if not result.data:
            raise Exception("INSERT 실패")
        
        todo = _format_todo(result.data[0])
        
        logger.info(f"할일 생성: user={user_id}, title={request.title}")
        
        return {
            "ok": True,
            "data": {
                "todo": todo.model_dump(),
                "message": "할일이 추가되었어요."
            }
        }
        
    except Exception as e:
        logger.error(f"할일 생성 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "TODO_CREATE_FAILED",
                "message": "할일을 추가하지 못했어요. 다시 시도해주세요."
            }
        })


@router.put("/{todo_id}")
async def update_todo(
    todo_id: str,
    request: TodoUpdateRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    할일 수정
    
    Returns:
        { "ok": true, "data": { "todo": {...}, "message": "..." } }
    """
    try:
        # 업데이트할 필드만 추출
        update_data = {}
        if request.title is not None:
            update_data['title'] = request.title
        if request.description is not None:
            update_data['description'] = request.description
        if request.due_date is not None:
            update_data['due_date'] = request.due_date.isoformat()
        if request.reminder_time is not None:
            update_data['reminder_time'] = request.reminder_time.isoformat()
        if request.is_completed is not None:
            update_data['is_completed'] = request.is_completed
        
        if not update_data:
            raise HTTPException(status_code=400, detail={
                "ok": False,
                "error": {
                    "code": "NO_UPDATE_DATA",
                    "message": "수정할 내용이 없어요."
                }
            })
        
        # 본인 소유 확인 + 업데이트
        result = db.table('todo_items').update(update_data).eq('id', todo_id).eq('user_id', user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail={
                "ok": False,
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "할일을 찾을 수 없어요."
                }
            })
        
        todo = _format_todo(result.data[0])
        
        logger.info(f"할일 수정: user={user_id}, todo_id={todo_id}")
        
        return {
            "ok": True,
            "data": {
                "todo": todo.model_dump(),
                "message": "수정되었어요."
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"할일 수정 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "TODO_UPDATE_FAILED",
                "message": "수정하지 못했어요. 다시 시도해주세요."
            }
        })


@router.patch("/{todo_id}/toggle")
async def toggle_todo(
    todo_id: str,
    request: TodoToggleRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    할일 완료 토글
    
    Returns:
        { "ok": true, "data": { "todo": {...}, "message": "..." } }
    """
    try:
        # 본인 소유 확인 + 업데이트
        result = db.table('todo_items').update({
            'is_completed': request.is_completed
        }).eq('id', todo_id).eq('user_id', user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail={
                "ok": False,
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "할일을 찾을 수 없어요."
                }
            })
        
        todo = _format_todo(result.data[0])
        
        message = "완료했어요! 👏" if request.is_completed else "다시 진행 중으로 변경했어요."
        
        logger.info(f"할일 토글: user={user_id}, todo_id={todo_id}, completed={request.is_completed}")
        
        return {
            "ok": True,
            "data": {
                "todo": todo.model_dump(),
                "message": message
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"할일 토글 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "TODO_TOGGLE_FAILED",
                "message": "상태를 변경하지 못했어요."
            }
        })


@router.patch("/{todo_id}/reminder")
async def update_reminder(
    todo_id: str,
    request: TodoReminderUpdate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    알림 설정 업데이트
    
    Returns:
        { "ok": true, "data": { "todo": {...}, "message": "..." } }
    """
    try:
        update_data = {
            'reminder_time': request.reminder_time.isoformat() if request.reminder_time else None,
            'notification_id': request.notification_id,
            'notification_sent': False,  # 알림 시간 변경 시 재발송 가능하도록
        }
        
        result = db.table('todo_items').update(update_data).eq('id', todo_id).eq('user_id', user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail={
                "ok": False,
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "할일을 찾을 수 없어요."
                }
            })
        
        todo = _format_todo(result.data[0])
        
        message = "알림이 설정되었어요." if request.reminder_time else "알림이 해제되었어요."
        
        logger.info(f"알림 설정: user={user_id}, todo_id={todo_id}, reminder={request.reminder_time}")
        
        return {
            "ok": True,
            "data": {
                "todo": todo.model_dump(),
                "message": message
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"알림 설정 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "REMINDER_UPDATE_FAILED",
                "message": "알림 설정을 변경하지 못했어요."
            }
        })


@router.delete("/{todo_id}")
async def delete_todo(
    todo_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    할일 삭제
    
    Returns:
        { "ok": true, "data": { "message": "..." } }
    """
    try:
        # 본인 소유 확인 + 삭제
        result = db.table('todo_items').delete().eq('id', todo_id).eq('user_id', user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail={
                "ok": False,
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "할일을 찾을 수 없어요."
                }
            })
        
        logger.info(f"할일 삭제: user={user_id}, todo_id={todo_id}")
        
        return {
            "ok": True,
            "data": {
                "message": "삭제되었어요."
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"할일 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "TODO_DELETE_FAILED",
                "message": "삭제하지 못했어요. 다시 시도해주세요."
            }
        })


@router.get("/upcoming/reminders")
async def get_upcoming_reminders(
    hours: int = 24,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    예정된 알림 목록 조회
    
    Args:
        hours: 몇 시간 이내의 알림을 조회할지 (기본 24시간)
    
    Returns:
        { "ok": true, "data": { "reminders": [...] } }
    """
    try:
        from datetime import timedelta
        
        now = datetime.now()
        end_time = now + timedelta(hours=hours)
        
        result = db.table('todo_items').select('*').eq('user_id', user_id).eq('is_completed', False).gte('reminder_time', now.isoformat()).lte('reminder_time', end_time.isoformat()).order('reminder_time').execute()
        
        todos = [_format_todo(r) for r in (result.data or [])]
        
        return {
            "ok": True,
            "data": {
                "reminders": [t.model_dump() for t in todos],
                "count": len(todos)
            }
        }
        
    except Exception as e:
        logger.error(f"예정 알림 조회 실패: {e}")
        raise HTTPException(status_code=500, detail={
            "ok": False,
            "error": {
                "code": "REMINDERS_FETCH_FAILED",
                "message": "알림 목록을 불러오지 못했어요."
            }
        })
