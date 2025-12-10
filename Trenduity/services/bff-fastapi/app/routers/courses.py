"""
강좌(Courses) API 라우터
EBSI 스타일 학습 시스템 - Supabase 버전
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
from supabase import Client

from app.core.deps import get_supabase

router = APIRouter()


# ============================================================
# DTOs (Pydantic Models)
# ============================================================

class PanelData(BaseModel):
    """강의 패널 데이터"""
    type: str = Field(..., description="패널 타입 (image, step, tip, etc.)")
    content: Optional[str] = Field(None, description="패널 내용")
    number: Optional[int] = Field(None, description="step 번호")
    items: Optional[List[str]] = Field(None, description="리스트 아이템")
    title: Optional[str] = Field(None, description="패널 제목")

class LectureData(BaseModel):
    """강의 정보"""
    id: int
    lecture_number: int = Field(..., description="강의 번호 (1강, 2강...)")
    title: str
    duration: int = Field(..., description="강의 시간 (분)")
    script: str = Field(..., description="TTS 대본")
    panels: List[dict] = Field(default_factory=list, description="강의 패널")
    created_at: datetime

class CourseData(BaseModel):
    """강좌 정보"""
    id: str
    title: str
    thumbnail: str
    description: Optional[str]
    category: str
    total_lectures: int
    created_at: datetime
    updated_at: datetime

class CourseWithLectures(CourseData):
    """강좌 + 강의 목록"""
    lectures: List[LectureData]

class UserCourseProgress(BaseModel):
    """사용자 강좌 진행 상황"""
    course_id: str
    last_watched_lecture: int
    completed_lectures: int
    completed_at: Optional[datetime]
    last_accessed_at: datetime

class EnvelopeResponse(BaseModel):
    """Envelope 패턴 응답"""
    ok: bool
    data: Optional[Any] = None
    error: Optional[dict] = None


# ============================================================
# API Endpoints
# ============================================================

@router.get("/", response_model=EnvelopeResponse)
async def get_courses(
    category: Optional[str] = Query(None, description="카테고리 필터"),
    user_id: Optional[str] = None,
    supabase: Client = Depends(get_supabase)
):
    """
    강좌 목록 조회
    
    - 모든 강좌 또는 카테고리별 필터링
    - 사용자 진행 상황 포함 (completed_lectures, last_watched_lecture)
    """
    if not supabase:
        raise HTTPException(status_code=503, detail={
            "ok": False,
            "error": {"code": "SUPABASE_UNAVAILABLE", "message": "데이터베이스 연결이 불가능해요"}
        })
    
    if not user_id:
        user_id = "demo-user"
    
    try:
        # 강좌 목록 조회
        query = supabase.table("courses").select("*")
        
        if category:
            query = query.eq("category", category)
        
        courses_result = query.order("created_at", desc=True).execute()
        
        # 사용자 진행 상황 조회
        progress_result = supabase.table("user_course_progress")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()
        
        # 진행 상황을 course_id로 매핑
        progress_map = {p["course_id"]: p for p in progress_result.data}
        
        # 응답 데이터 구성
        courses = []
        for course in courses_result.data:
            progress = progress_map.get(course["id"], {})
            courses.append({
                **course,
                "user_completed_lectures": progress.get("completed_lectures", 0),
                "user_last_watched": progress.get("last_watched_lecture", 0)
            })
        
        return {"ok": True, "data": {"courses": courses}}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "COURSES_FETCH_ERROR",
                    "message": f"강좌 목록을 가져오는 중 오류가 발생했어요: {str(e)}"
                }
            }
        )


@router.get("/{course_id}", response_model=EnvelopeResponse)
async def get_course_detail(
    course_id: str,
    user_id: Optional[str] = None,
    supabase: Client = Depends(get_supabase)
):
    """
    강좌 상세 정보 조회 (강의 목록 포함)
    
    - 강좌 기본 정보
    - 전체 강의 목록 (1강, 2강, 3강...)
    - 사용자 진행 상황
    """
    if not supabase:
        raise HTTPException(status_code=503, detail={
            "ok": False,
            "error": {"code": "SUPABASE_UNAVAILABLE", "message": "데이터베이스 연결이 불가능해요"}
        })
    
    if not user_id:
        user_id = "demo-user"
    
    try:
        # 강좌 정보
        course_result = supabase.table("courses").select("*").eq("id", course_id).single().execute()
        
        if not course_result.data:
            raise HTTPException(
                status_code=404,
                detail={
                    "ok": False,
                    "error": {
                        "code": "COURSE_NOT_FOUND",
                        "message": "강좌를 찾을 수 없어요"
                    }
                }
            )
        
        # 강의 목록
        lectures_result = supabase.table("lectures")\
            .select("*")\
            .eq("course_id", course_id)\
            .order("lecture_number", desc=False)\
            .execute()
        
        # 사용자 진행 상황
        progress_result = supabase.table("user_course_progress")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("course_id", course_id)\
            .execute()
        
        progress = progress_result.data[0] if progress_result.data else None
        
        course_data = {
            **course_result.data,
            "lectures": lectures_result.data,
            "user_progress": progress
        }
        
        return {"ok": True, "data": course_data}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "COURSE_DETAIL_ERROR",
                    "message": f"강좌 상세 정보를 가져오는 중 오류가 발생했어요: {str(e)}"
                }
            }
        )


@router.get("/{course_id}/lectures/{lecture_number}", response_model=EnvelopeResponse)
async def get_lecture(
    course_id: str,
    lecture_number: int,
    user_id: Optional[str] = None,
    supabase: Client = Depends(get_supabase)
):
    """
    특정 강의 조회
    
    - 강의 스크립트 (TTS용)
    - 패널 데이터 (화면 구성)
    """
    if not supabase:
        raise HTTPException(status_code=503, detail={
            "ok": False,
            "error": {"code": "SUPABASE_UNAVAILABLE", "message": "데이터베이스 연결이 불가능해요"}
        })
    
    if not user_id:
        user_id = "demo-user"
    
    try:
        result = supabase.table("lectures")\
            .select("*")\
            .eq("course_id", course_id)\
            .eq("lecture_number", lecture_number)\
            .single()\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=404,
                detail={
                    "ok": False,
                    "error": {
                        "code": "LECTURE_NOT_FOUND",
                        "message": "강의를 찾을 수 없어요"
                    }
                }
            )
        
        return {"ok": True, "data": result.data}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "LECTURE_FETCH_ERROR",
                    "message": f"강의를 가져오는 중 오류가 발생했어요: {str(e)}"
                }
            }
        )


@router.post("/{course_id}/progress", response_model=EnvelopeResponse)
async def update_progress(
    course_id: str,
    lecture_number: int = Query(..., description="완료한 강의 번호"),
    user_id: Optional[str] = None,
    supabase: Client = Depends(get_supabase)
):
    """
    강의 진행 상황 업데이트
    
    - 마지막으로 본 강의 번호 갱신
    - 완료한 강의 수 증가
    - 전체 강좌 완료 시 completed_at 설정
    """
    if not supabase:
        raise HTTPException(status_code=503, detail={
            "ok": False,
            "error": {"code": "SUPABASE_UNAVAILABLE", "message": "데이터베이스 연결이 불가능해요"}
        })
    
    if not user_id:
        user_id = "demo-user"
    
    try:
        # 강좌 총 강의 수 확인
        course_result = supabase.table("courses").select("total_lectures").eq("id", course_id).single().execute()
        
        if not course_result.data:
            raise HTTPException(status_code=404, detail={
                "ok": False,
                "error": {"code": "COURSE_NOT_FOUND", "message": "강좌를 찾을 수 없어요"}
            })
        
        total_lectures = course_result.data["total_lectures"]
        is_completed = (lecture_number >= total_lectures)
        
        # 기존 진행 상황 확인
        existing = supabase.table("user_course_progress")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("course_id", course_id)\
            .execute()
        
        progress_data = {
            "user_id": user_id,
            "course_id": course_id,
            "last_watched_lecture": lecture_number,
            "completed_lectures": lecture_number,
            "last_accessed_at": datetime.now().isoformat()
        }
        
        if is_completed:
            progress_data["completed_at"] = datetime.now().isoformat()
        
        if existing.data:
            # Update
            result = supabase.table("user_course_progress")\
                .update(progress_data)\
                .eq("user_id", user_id)\
                .eq("course_id", course_id)\
                .execute()
        else:
            # Insert
            result = supabase.table("user_course_progress")\
                .insert(progress_data)\
                .execute()
        
        return {
            "ok": True,
            "data": {
                **result.data[0],
                "is_course_completed": is_completed
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "PROGRESS_UPDATE_ERROR",
                    "message": f"진행 상황을 업데이트하는 중 오류가 발생했어요: {str(e)}"
                }
            }
        )


@router.get("/recommendation/today", response_model=EnvelopeResponse)
async def get_today_recommendation(
    user_id: Optional[str] = None,
    supabase: Client = Depends(get_supabase)
):
    """
    오늘의 학습 추천
    
    - 진행 중인 강좌가 있으면 → "이어서 보기"
    - 없으면 → 새로운 강좌 추천
    """
    if not supabase:
        raise HTTPException(status_code=503, detail={
            "ok": False,
            "error": {"code": "SUPABASE_UNAVAILABLE", "message": "데이터베이스 연결이 불가능해요"}
        })
    
    if not user_id:
        user_id = "demo-user"
    
    try:
        # 가장 최근에 본 강좌 찾기 (Supabase는 JOIN을 지원하지 않으므로 분리 조회)
        progress_result = supabase.table("user_course_progress")\
            .select("*")\
            .eq("user_id", user_id)\
            .is_("completed_at", "null")\
            .order("last_accessed_at", desc=True)\
            .limit(1)\
            .execute()
        
        if progress_result.data:
            # 진행 중인 강좌 있음
            p = progress_result.data[0]
            course = supabase.table("courses").select("*").eq("id", p["course_id"]).single().execute().data
            
            recommendation = {
                "type": "continue",
                "course_id": p["course_id"],
                "next_lecture": p["last_watched_lecture"] + 1,
                "title": course["title"],
                "thumbnail": course["thumbnail"],
                "progress": f"{p['completed_lectures']}/{course['total_lectures']}강",
                "message": "이어서 보기"
            }
        else:
            # 완료한 강좌 ID 목록
            completed = supabase.table("user_course_progress")\
                .select("course_id")\
                .eq("user_id", user_id)\
                .not_.is_("completed_at", "null")\
                .execute()
            
            completed_ids = [c["course_id"] for c in completed.data]
            
            # 새로운 강좌 추천 (최신순)
            query = supabase.table("courses").select("*").order("created_at", desc=True).limit(1)
            
            if completed_ids:
                query = query.not_.in_("id", completed_ids)
            
            course_result = query.execute()
            
            if course_result.data:
                c = course_result.data[0]
                recommendation = {
                    "type": "new",
                    "course_id": c["id"],
                    "next_lecture": 1,
                    "title": c["title"],
                    "thumbnail": c["thumbnail"],
                    "progress": f"0/{c['total_lectures']}강",
                    "message": "새로운 강좌 시작하기"
                }
            else:
                recommendation = None
        
        return {"ok": True, "data": recommendation}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "RECOMMENDATION_ERROR",
                    "message": f"추천을 가져오는 중 오류가 발생했어요: {str(e)}"
                }
            }
        )
